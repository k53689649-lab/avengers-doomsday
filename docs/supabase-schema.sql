-- ============================================================================
--  《复仇者联盟5:毁灭之日》观影指南 —— 留言板数据库结构(Supabase)
--
--  ✅ 使用方法(照做即可):
--    1. 先建好站长账号:Authentication → Users → Add user → Create new user
--       (填你自己的邮箱 + 强密码,勾选 Auto Confirm),建好后复制它的 "User UID"
--
--    2. 用记事本打开本文件 → 按 Ctrl+H 打开替换:
--         查找:OWNER_UID
--         替换为:(粘贴刚复制的 User UID,形如 a1b2c3d4-5e6f-...)
--       点「全部替换」。文件里一共有 7 处(含开头注释里的 1 处,一起换掉也没关系)
--
--    3. 按 Ctrl+A 全选 → Ctrl+C 复制【整个文件】
--
--    4. 回到 Supabase → 左侧「SQL Editor」→「New query」→ Ctrl+V 粘贴 → 点「Run」
--       看到 "Success. No rows returned" 就成功了(建表不返回数据,属正常现象)
--
--    5. 若报错,把红色报错信息截图发给站长(最常见原因:忘记替换 OWNER_UID)
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

-- ---------------------------------------------------------------- 权限授予
-- 光有 RLS 策略还不够:角色本身也要有表级权限,否则请求会返回 401/42501。
-- anon = 未登录访客(只能读 + 发言);authenticated = 登录用户(站长,可改/删)
grant usage on schema public to anon, authenticated;

grant select, insert on public.comments to anon, authenticated;
grant update, delete on public.comments to authenticated;

grant select on public.announcements to anon, authenticated;
grant insert, update, delete on public.announcements to authenticated;

-- 序列/自增无需授权(本表用 uuid 主键)

-- ============================================================================
--  自检(可选):执行下面两句,应当分别返回 1 行和 0 行;
--  这能确认策略已生效、且匿名用户读得到数据。
--  在 SQL Editor 里替换成真实查询即可:
--    select count(*) from public.comments;      -- 应能正常返回(权限 OK)
--    select relname, relrowsecurity from pg_class where relname in ('comments','announcements');
--      -- relrowsecurity 必须为 true(RLS 已开启)
-- ============================================================================

