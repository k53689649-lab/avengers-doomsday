-- =========================================================
-- 留言板升级 v3:影迷投稿板块(文章 + 链接 + 评论 + 点赞 + 收藏 + 站长审核)
-- 用法:Supabase → 左侧 SQL Editor → New query → 全选粘贴 → Run
-- 说明:可重复执行;不会删除任何已有留言。
--
-- ⚠️⚠️ 直接复制本文件时,请先把下面出现的每一处 OWNER_UID 替换成你自己的 UID ⚠️⚠️
--      从哪里找:Supabase → Authentication → Users → 点开你的账号 → User UID
--      不替换会报错:invalid input syntax for type uuid: "OWNER_UID"
--      最省事的方式:在网站投稿板块页面点「📋 复制升级脚本」,会自动帮你填好
-- =========================================================

-- ---------- 1) 文章表 ----------
create table if not exists public.articles (
  id              uuid primary key default gen_random_uuid(),
  title           text        not null,
  author          text        not null,                     -- 投稿人昵称
  author_visitor  text,                                     -- 投稿人浏览器标识(用于让他自己查到投稿状态)
  category        text        not null default '资讯',       -- 资讯 / 考据 / 分析 / 观后感
  summary         text,                                     -- 一句话摘要
  content         text        not null,                     -- 正文(纯文本,换行保留)
  links           jsonb       not null default '[]'::jsonb, -- [{label,url}] 附加网址
  spoiler         boolean     not null default false,       -- 是否含剧透
  status          text        not null default 'pending',   -- pending 待审核 / approved 已通过 / rejected 未通过
  review_note     text,                                     -- 站长的审核备注
  pinned          boolean     not null default false,
  like_count      integer     not null default 0,
  favorite_count  integer     not null default 0,
  view_count      integer     not null default 0,
  created_at      timestamptz not null default now(),
  reviewed_at     timestamptz
);

create index if not exists articles_status_idx  on public.articles (status, created_at desc);
create index if not exists articles_author_idx  on public.articles (author_visitor);

-- ---------- 2) 留言表:挂到文章下(文章评论复用同一张留言表) ----------
alter table public.comments
  add column if not exists article_id uuid references public.articles(id) on delete cascade;
create index if not exists comments_article_idx on public.comments (article_id);

-- ---------- 3) 文章点赞 / 收藏 ----------
create table if not exists public.article_likes (
  article_id uuid        not null references public.articles(id) on delete cascade,
  visitor_id text        not null,
  created_at timestamptz not null default now(),
  primary key (article_id, visitor_id)
);
create table if not exists public.article_favorites (
  article_id uuid        not null references public.articles(id) on delete cascade,
  visitor_id text        not null,
  created_at timestamptz not null default now(),
  primary key (article_id, visitor_id)
);

-- ---------- 3.5) 表级授权(少了这段会报 permission denied for table articles) ----------
grant usage on schema public to anon, authenticated;
-- 文章:访客可读 + 可投稿;站长(登录后是 authenticated)可改可删
grant select, insert on public.articles to anon, authenticated;
grant update, delete on public.articles to authenticated;
-- 点赞 / 收藏记录:前端要读「我点过没」;写入走函数
grant select on public.article_likes     to anon, authenticated;
grant select on public.article_favorites to anon, authenticated;

-- ---------- 4) 权限(RLS) ----------
alter table public.articles          enable row level security;
alter table public.article_likes     enable row level security;
alter table public.article_favorites enable row level security;

-- 文章:所有人只能读「已通过」的;站长能读全部(含待审核)
drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read" on public.articles
for select using (status = 'approved' or auth.uid() = 'OWNER_UID'::uuid);

-- 投稿:任何人都能投,但只能投成「待审核」,不能自己给自己过审、不能自己置顶
drop policy if exists "articles_public_insert" on public.articles;
create policy "articles_public_insert" on public.articles
for insert with check (
  status = 'pending'
  and pinned = false
  and char_length(title) between 4 and 120
  and char_length(content) between 20 and 20000
  and char_length(author) between 2 and 16
);

-- 只有站长能改(过审 / 驳回 / 置顶 / 改内容)与删
drop policy if exists "articles_owner_update" on public.articles;
create policy "articles_owner_update" on public.articles
for update using (auth.uid() = 'OWNER_UID'::uuid)
with check (auth.uid() = 'OWNER_UID'::uuid);

drop policy if exists "articles_owner_delete" on public.articles;
create policy "articles_owner_delete" on public.articles
for delete using (auth.uid() = 'OWNER_UID'::uuid);

-- 点赞 / 收藏记录:所有人可读(前端要判断"我点过没"),写入统一走下面的函数
drop policy if exists "alikes_readable" on public.article_likes;
create policy "alikes_readable" on public.article_likes for select using (true);
drop policy if exists "afavs_readable" on public.article_favorites;
create policy "afavs_readable" on public.article_favorites for select using (true);

-- ---------- 5) 计数函数(避免前端直接改计数,防止刷数) ----------
create or replace function public.like_article(p_article uuid, p_visitor text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  if p_visitor is null or length(p_visitor) < 6 then raise exception 'visitor id 无效'; end if;
  insert into public.article_likes (article_id, visitor_id)
  values (p_article, p_visitor) on conflict (article_id, visitor_id) do nothing;
  select count(*) into v_count from public.article_likes where article_id = p_article;
  update public.articles set like_count = v_count where id = p_article;
  return coalesce(v_count, 0);
end $$;

create or replace function public.favorite_article(p_article uuid, p_visitor text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  if p_visitor is null or length(p_visitor) < 6 then raise exception 'visitor id 无效'; end if;
  insert into public.article_favorites (article_id, visitor_id)
  values (p_article, p_visitor) on conflict (article_id, visitor_id) do nothing;
  select count(*) into v_count from public.article_favorites where article_id = p_article;
  update public.articles set favorite_count = v_count where id = p_article;
  return coalesce(v_count, 0);
end $$;

create or replace function public.unfavorite_article(p_article uuid, p_visitor text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  delete from public.article_favorites where article_id = p_article and visitor_id = p_visitor;
  select count(*) into v_count from public.article_favorites where article_id = p_article;
  update public.articles set favorite_count = v_count where id = p_article;
  return coalesce(v_count, 0);
end $$;

create or replace function public.view_article(p_article uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  update public.articles set view_count = view_count + 1 where id = p_article
  returning view_count into v_count;
  return coalesce(v_count, 0);
end $$;

-- 投稿人查自己的投稿(含待审核 / 未通过,连带站长的审核备注)
create or replace function public.my_articles(p_visitor text)
returns setof public.articles language sql security definer set search_path = public as $$
  select * from public.articles
   where author_visitor = p_visitor
   order by created_at desc
   limit 50;
$$;

grant execute on function public.like_article(uuid, text)       to anon, authenticated;
grant execute on function public.favorite_article(uuid, text)   to anon, authenticated;
grant execute on function public.unfavorite_article(uuid, text) to anon, authenticated;
grant execute on function public.view_article(uuid)             to anon, authenticated;
grant execute on function public.my_articles(text)              to anon, authenticated;

-- ---------- 6) 自检:三列都应为 1 ----------
select
  (select count(*) from information_schema.tables
    where table_schema = 'public' and table_name = 'articles')            as has_articles_table,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'comments' and column_name = 'article_id') as has_article_id,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'like_article')            as has_like_article_fn;
