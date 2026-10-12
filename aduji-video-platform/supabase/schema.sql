-- Run this entire file in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  caption text not null default '',
  video_url text not null,
  thumbnail_url text,
  visibility text not null default 'public' check (visibility in ('public','private','unlisted')),
  created_at timestamptz not null default now()
);
create table if not exists public.video_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create table if not exists public.live_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Live on ADUJI',
  category text not null default 'Community',
  status text not null default 'scheduled' check (status in ('scheduled','live','ended')),
  provider text,
  provider_room_id text,
  playback_url text,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);
create table if not exists public.live_chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create table if not exists public.gift_catalog (
  id text primary key,
  name text not null,
  emoji text not null,
  coin_cost integer not null check (coin_cost > 0),
  active boolean not null default true
);
create table if not exists public.live_gifts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  gift_id text not null references public.gift_catalog(id),
  quantity integer not null default 1 check (quantity between 1 and 100),
  created_at timestamptz not null default now()
);
insert into public.gift_catalog(id,name,emoji,coin_cost) values
 ('heart','Heart','💖',5),('fire','Fire','🔥',25),('star','Star','⭐',50),('crown','Crown','👑',250),('rocket','Rocket','🚀',500),('diamond','Diamond','💎',1000)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.video_likes enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;
alter table public.live_rooms enable row level security;
alter table public.live_chat_messages enable row level security;
alter table public.gift_catalog enable row level security;
alter table public.live_gifts enable row level security;

drop policy if exists "Profiles are viewable" on public.profiles;
create policy "Profiles are viewable" on public.profiles for select using (true);
drop policy if exists "Users create their profile" on public.profiles;
create policy "Users create their profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Public videos are viewable" on public.videos;
create policy "Public videos are viewable" on public.videos for select using (visibility = 'public' or auth.uid() = user_id);
drop policy if exists "Users create own videos" on public.videos;
create policy "Users create own videos" on public.videos for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users update own videos" on public.videos;
create policy "Users update own videos" on public.videos for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users delete own videos" on public.videos;
create policy "Users delete own videos" on public.videos for delete to authenticated using (auth.uid() = user_id);
drop policy if exists "Likes viewable" on public.video_likes;
create policy "Likes viewable" on public.video_likes for select using (true);
drop policy if exists "Users like as themselves" on public.video_likes;
create policy "Users like as themselves" on public.video_likes for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users unlike themselves" on public.video_likes;
create policy "Users unlike themselves" on public.video_likes for delete to authenticated using (auth.uid() = user_id);
drop policy if exists "Follows viewable" on public.follows;
create policy "Follows viewable" on public.follows for select using (true);
drop policy if exists "Users follow as themselves" on public.follows;
create policy "Users follow as themselves" on public.follows for insert to authenticated with check (auth.uid() = follower_id);
drop policy if exists "Users unfollow themselves" on public.follows;
create policy "Users unfollow themselves" on public.follows for delete to authenticated using (auth.uid() = follower_id);
drop policy if exists "Comments are viewable" on public.comments;
create policy "Comments are viewable" on public.comments for select using (true);
drop policy if exists "Users write own comments" on public.comments;
create policy "Users write own comments" on public.comments for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users delete own comments" on public.comments;
create policy "Users delete own comments" on public.comments for delete to authenticated using (auth.uid() = user_id);
drop policy if exists "Live rooms are viewable" on public.live_rooms;
create policy "Live rooms are viewable" on public.live_rooms for select using (true);
drop policy if exists "Hosts manage own rooms" on public.live_rooms;
create policy "Hosts manage own rooms" on public.live_rooms for all to authenticated using (auth.uid() = host_id) with check (auth.uid() = host_id);
drop policy if exists "Chat is viewable" on public.live_chat_messages;
create policy "Chat is viewable" on public.live_chat_messages for select using (true);
drop policy if exists "Signed-in users send chat" on public.live_chat_messages;
create policy "Signed-in users send chat" on public.live_chat_messages for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Gift catalog is public" on public.gift_catalog;
create policy "Gift catalog is public" on public.gift_catalog for select using (active = true);
drop policy if exists "Live gifts viewable" on public.live_gifts;
create policy "Live gifts viewable" on public.live_gifts for select using (true);
drop policy if exists "Signed-in users send gifts as themselves" on public.live_gifts;
create policy "Signed-in users send gifts as themselves" on public.live_gifts for insert to authenticated with check (auth.uid() = sender_id);

-- Storage bucket for uploaded videos. Keep the bucket public only for public playback URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('aduji-videos','aduji-videos',true,524288000,array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Signed-in users upload own video files" on storage.objects;
create policy "Signed-in users upload own video files" on storage.objects for insert to authenticated with check (bucket_id = 'aduji-videos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Public video files are viewable" on storage.objects;
create policy "Public video files are viewable" on storage.objects for select using (bucket_id = 'aduji-videos');
drop policy if exists "Users delete own video files" on storage.objects;
create policy "Users delete own video files" on storage.objects for delete to authenticated using (bucket_id = 'aduji-videos' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, display_name)
  values (new.id, lower(regexp_replace(split_part(coalesce(new.email, 'creator'), '@', 1), '[^a-zA-Z0-9_]', '', 'g')) || '_' || substr(new.id::text, 1, 5), split_part(coalesce(new.email, 'ADUJI Creator'), '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
