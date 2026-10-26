create extension if not exists pgcrypto;

create table if not exists public.users (
  id text primary key,
  username text not null unique,
  created_at timestamptz not null default now(),
  password_salt text,
  password_hash text
);

create table if not exists public.posts (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  caption text not null default '',
  mood text not null default 'Random',
  created_at timestamptz not null default now(),
  feed_cursor bigserial unique not null
);

create table if not exists public.photos (
  id text primary key,
  post_id text not null references public.posts(id) on delete cascade,
  file_name text not null,
  position integer not null default 0
);

create table if not exists public.reactions (
  id text primary key,
  post_id text not null references public.posts(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create table if not exists public.sessions (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_idx on public.posts(created_at desc);
create index if not exists sessions_expiry_idx on public.sessions(expires_at);

alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.photos enable row level security;
alter table public.reactions enable row level security;
alter table public.sessions enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sela-photos', 'sela-photos', true, 8388608, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true, file_size_limit=8388608,
  allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];
