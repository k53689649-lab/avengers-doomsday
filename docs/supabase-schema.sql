-- ============================================================================
--  《复仇者联盟5:毁灭之日》观影指南 —— 留言板数据库结构(Supabase)
--
--  使用方法:
--    1. 打开你的 Supabase 项目 → 左侧「SQL Editor」→「New query」
--    2. 把本文件全部内容粘贴进去
--    3. ⚠️ 运行前,把下面两处 'OWNER_UID' 全部替换成你自己的用户 UID
--       (UID 获取方式:Authentication → Users → 添加/查看用户 → 复制 "User UID")
--       例如:把 auth.uid() = 'OWNER_UID'::uuid 改成 auth.uid() = 'a1b2c3d4-....'::uuid
--    4. 点「Run」执行
--
--  这套策略实现的效果(公开留言板):
--    · 任何人都能读全部留言(select)
--    · 任何人都能发言(insert),但不能自带「置顶」「站长回复」字段(防伪造)
--    · 只有站长账号能回复 / 置顶 / 删除 / 发公告
-- ============================================================================

-- ---------------------------------------------------------------- 留言表
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null check (char_length(name) between 2 and 16),
  content    text        not null check (char_length(content) between 4 and 500),
  type       text        not null default '提问' check (char_length(type) <= 10),
  reply      text        not null default '' check (char_length(reply) <= 500),
  pinned     boolean     not null default false,
  created_at timestamptz not null default now()
);

create index if not exists comments_created_at_idx on public.comments (created_at desc);
create index if not exists comments_pinned_idx     on public.comments (pinned desc, created_at desc);

alter table public.comments enable row level security;

-- 所有人可读(公开留言板的核心)
drop policy if exists "comments_public_read" on public.comments;
create policy "comments_public_read" on public.comments
  for select using (true);

-- 所有人可发言,但禁止自带置顶/回复(防止伪造站长身份)
drop policy if exists "comments_public_insert" on public.comments;
create policy "comments_public_insert" on public.comments
  for insert with check (pinned = false and reply = '');

-- 只有站长能修改(置顶、回复)
drop policy if exists "comments_owner_update" on public.comments;
create policy "comments_owner_update" on public.comments
  for update using (auth.uid() = 'OWNER_UID'::uuid)
  with check (auth.uid() = 'OWNER_UID'::uuid);

-- 只有站长能删除
drop policy if exists "comments_owner_delete" on public.comments;
create policy "comments_owner_delete" on public.comments
  for delete using (auth.uid() = 'OWNER_UID'::uuid);

-- ---------------------------------------------------------------- 公告表
create table if not exists public.announcements (
  id         uuid primary key default gen_random_uuid(),
  text       text        not null check (char_length(text) between 4 and 300),
  created_at timestamptz not null default now()
);

create index if not exists announcements_created_at_idx on public.announcements (created_at desc);

alter table public.announcements enable row level security;

drop policy if exists "ann_public_read" on public.announcements;
create policy "ann_public_read" on public.announcements
  for select using (true);

drop policy if exists "ann_owner_insert" on public.announcements;
create policy "ann_owner_insert" on public.announcements
  for insert with check (auth.uid() = 'OWNER_UID'::uuid);

drop policy if exists "ann_owner_update" on public.announcements;
create policy "ann_owner_update" on public.announcements
  for update using (auth.uid() = 'OWNER_UID'::uuid)
  with check (auth.uid() = 'OWNER_UID'::uuid);

drop policy if exists "ann_owner_delete" on public.announcements;
create policy "ann_owner_delete" on public.announcements
  for delete using (auth.uid() = 'OWNER_UID'::uuid);

-- ============================================================================
--  执行完成后,到 Project Settings → API 复制:
--    · Project URL        → 填到 site-config.js 的 cloud.supabaseUrl
--    · anon public key    → 填到 site-config.js 的 cloud.supabaseAnonKey
--  然后把 cloud.provider 改成 "supabase" 即可启用云端留言板。
--  ⚠️ 绝对不要把 service_role key 填进前端(那是绕过所有策略的最高权限密钥)。
-- ============================================================================
