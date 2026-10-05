-- =========================================================
-- 留言板升级 v2:楼中楼(网友互相回复) + 点赞
-- 用法:打开 Supabase → 左侧 SQL Editor → New query → 全选粘贴本文件 → Run
-- 说明:脚本可重复执行(幂等),不会删除任何已有留言。
-- =========================================================

-- ---------- 1) 留言表:加「父留言」与「点赞数」两列 ----------
alter table public.comments
  add column if not exists parent_id uuid references public.comments(id) on delete cascade,
  add column if not exists like_count integer not null default 0;

create index if not exists comments_parent_idx  on public.comments (parent_id);
create index if not exists comments_created_idx on public.comments (created_at desc);

-- ---------- 2) 点赞记录表:一个访客对一条留言只能点一次 ----------
create table if not exists public.comment_likes (
  comment_id uuid        not null references public.comments(id) on delete cascade,
  visitor_id text        not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, visitor_id)
);

alter table public.comment_likes enable row level security;

-- 点赞记录:所有人可读(前端不需要读,但便于站长统计);写入统一走下面的函数
drop policy if exists "likes readable" on public.comment_likes;
create policy "likes readable" on public.comment_likes for select using (true);

-- ---------- 3) 点赞函数:插入记录 + 同步 like_count,重复点赞不报错 ----------
create or replace function public.like_comment(p_comment uuid, p_visitor text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_visitor is null or length(p_visitor) < 6 then
    raise exception 'visitor id 无效';
  end if;

  insert into public.comment_likes (comment_id, visitor_id)
  values (p_comment, p_visitor)
  on conflict (comment_id, visitor_id) do nothing;

  select count(*) into v_count
  from public.comment_likes
  where comment_id = p_comment;

  update public.comments
     set like_count = v_count
   where id = p_comment;

  return coalesce(v_count, 0);
end;
$$;

grant execute on function public.like_comment(uuid, text) to anon, authenticated;

-- ---------- 4) 顺手检查(可选,返回两行结果即成功) ----------
select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'comments' and column_name = 'parent_id')   as has_parent_id,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'comments' and column_name = 'like_count')  as has_like_count,
  (select count(*) from information_schema.tables
    where table_schema = 'public' and table_name = 'comment_likes')                            as has_likes_table;
