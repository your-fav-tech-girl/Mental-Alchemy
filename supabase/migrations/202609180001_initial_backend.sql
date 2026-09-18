-- Mental Alchemy backend foundation
-- Run through Supabase migrations or paste into the Supabase SQL Editor once.

create extension if not exists pgcrypto;

create type public.app_role as enum ('client', 'therapist', 'admin');
create type public.appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
create type public.mood_value as enum ('Low', 'Uneasy', 'Okay', 'Good', 'Great');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  role public.app_role not null default 'client',
  phone text check (phone is null or char_length(phone) <= 40),
  timezone text not null default 'UTC' check (char_length(timezone) <= 80),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.therapists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  credentials text not null check (char_length(credentials) between 2 and 160),
  bio text not null default '' check (char_length(bio) <= 3000),
  specialties text[] not null default '{}',
  session_types text[] not null default array['Video session'],
  photo_url text check (photo_url is null or char_length(photo_url) <= 1000),
  hourly_rate_cents integer check (hourly_rate_cents is null or hourly_rate_cents between 0 and 1000000),
  accepting_clients boolean not null default true,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles(id) on delete restrict,
  therapist_id uuid not null references public.therapists(id) on delete restrict,
  guest_name text check (guest_name is null or char_length(guest_name) between 2 and 120),
  guest_email text check (guest_email is null or char_length(guest_email) <= 254),
  guest_phone text check (guest_phone is null or char_length(guest_phone) <= 40),
  appointment_at timestamptz not null,
  session_type text not null check (session_type in ('Video session', 'Phone session', 'In-person session')),
  status public.appointment_status not null default 'pending',
  notes text not null default '' check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointment_has_client check (
    client_id is not null or (guest_name is not null and guest_email is not null)
  )
);

create unique index appointments_active_slot_key
  on public.appointments (therapist_id, appointment_at)
  where status not in ('cancelled', 'no_show');
create index appointments_client_date_idx on public.appointments (client_id, appointment_at);
create index appointments_therapist_date_idx on public.appointments (therapist_id, appointment_at);

create table public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  mood public.mood_value not null,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, entry_date)
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  reason text not null check (reason in ('matching', 'billing', 'account', 'clinician', 'press', 'other')),
  message text not null check (char_length(message) between 10 and 4000),
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'spam')),
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  therapist_id uuid not null references public.therapists(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, therapist_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index messages_conversation_created_idx on public.messages (conversation_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger therapists_set_updated_at before update on public.therapists
for each row execute function public.set_updated_at();
create trigger appointments_set_updated_at before update on public.appointments
for each row execute function public.set_updated_at();
create trigger mood_entries_set_updated_at before update on public.mood_entries
for each row execute function public.set_updated_at();
create trigger conversations_set_updated_at before update on public.conversations
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'New member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_conversation_participant(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversations c
    join public.therapists t on t.id = c.therapist_id
    where c.id = target_conversation_id
      and (c.client_id = auth.uid() or t.user_id = auth.uid())
  );
$$;

create or replace function public.cancel_appointment(target_appointment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.appointments a
  set status = 'cancelled'
  where a.id = target_appointment_id
    and a.client_id = auth.uid()
    and a.appointment_at > now()
    and a.status in ('pending', 'confirmed');
  return found;
end;
$$;

revoke all on function public.set_updated_at() from public;
revoke all on function public.handle_new_user() from public;
revoke all on function public.is_conversation_participant(uuid) from public;
revoke all on function public.cancel_appointment(uuid) from public;

alter table public.profiles enable row level security;
alter table public.therapists enable row level security;
alter table public.appointments enable row level security;
alter table public.mood_entries enable row level security;
alter table public.contact_messages enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.therapists from anon, authenticated;
revoke all on table public.appointments from anon, authenticated;
revoke all on table public.mood_entries from anon, authenticated;
revoke all on table public.contact_messages from anon, authenticated;
revoke all on table public.conversations from anon, authenticated;
revoke all on table public.messages from anon, authenticated;

grant select (
  id, name, credentials, bio, specialties, session_types, photo_url,
  hourly_rate_cents, accepting_clients, is_published, created_at, updated_at
) on public.therapists to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, timezone, avatar_url) on public.profiles to authenticated;
grant update (bio, specialties, session_types, photo_url, hourly_rate_cents, accepting_clients) on public.therapists to authenticated;
grant select, insert on public.appointments to authenticated;
grant select, insert, update on public.mood_entries to authenticated;
grant select, insert on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;
grant execute on function public.is_conversation_participant(uuid) to authenticated;
grant execute on function public.cancel_appointment(uuid) to authenticated;

create policy "Published therapists are public"
on public.therapists for select
to anon, authenticated
using (is_published = true or user_id = (select auth.uid()));

create policy "Therapists manage their public record"
on public.therapists for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users read their own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "Users update their own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "Appointment participants can read"
on public.appointments for select
to authenticated
using (
  client_id = (select auth.uid())
  or exists (
    select 1 from public.therapists t
    where t.id = therapist_id and t.user_id = (select auth.uid())
  )
);

create policy "Clients book their own appointments"
on public.appointments for insert
to authenticated
with check (client_id = (select auth.uid()));

create policy "Clients manage their mood entries"
on public.mood_entries for all
to authenticated
using (client_id = (select auth.uid()))
with check (client_id = (select auth.uid()));

create policy "Conversation participants can read"
on public.conversations for select
to authenticated
using (
  client_id = (select auth.uid())
  or exists (
    select 1 from public.therapists t
    where t.id = therapist_id and t.user_id = (select auth.uid())
  )
);

create policy "Clients can start conversations"
on public.conversations for insert
to authenticated
with check (
  client_id = (select auth.uid())
  and exists (
    select 1 from public.therapists t
    where t.id = therapist_id and t.is_published = true
  )
);

create policy "Conversation participants read messages"
on public.messages for select
to authenticated
using (public.is_conversation_participant(conversation_id));

create policy "Conversation participants send messages"
on public.messages for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and public.is_conversation_participant(conversation_id)
);

insert into public.therapists (
  id, name, credentials, bio, specialties, session_types, photo_url,
  hourly_rate_cents, accepting_clients, is_published
) values
  ('10000000-0000-4000-8000-000000000001', 'Dr. Naomi Reyes', 'Clinical Psychologist, PsyD', 'Supports adults navigating anxiety, trauma, and major life changes.', array['anxiety','trauma','EMDR'], array['Video session','Phone session'], 'https://images.unsplash.com/photo-1749222013825-fe2025dcf0cf?fm=jpg&q=80&w=800&auto=format&fit=crop', 15000, true, true),
  ('10000000-0000-4000-8000-000000000002', 'Marcus Webb', 'Marriage & Family Therapist, LMFT', 'Works with couples and individuals experiencing grief and relationship transitions.', array['couples','grief'], array['Video session','In-person session'], 'https://images.unsplash.com/photo-1750044010283-bcfab7777e26?fm=jpg&q=80&w=800&auto=format&fit=crop', 14000, true, true),
  ('10000000-0000-4000-8000-000000000003', 'Priya Anand', 'Clinical Social Worker, LCSW', 'Offers collaborative, practical support for depression and life transitions.', array['depression','life transitions'], array['Video session','Phone session'], 'https://images.unsplash.com/photo-1559433804-f883aa33026a?fm=jpg&q=80&w=800&auto=format&fit=crop', 13500, true, true),
  ('10000000-0000-4000-8000-000000000004', 'James Okafor', 'Licensed Professional Counselor, LPC', 'Helps clients work through anxiety, depression, and work-related stress.', array['anxiety','depression','stress'], array['Video session','In-person session'], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fm=jpg&q=80&w=800&auto=format&fit=crop', 13000, true, true),
  ('10000000-0000-4000-8000-000000000005', 'Dr. Sofia Lang', 'Clinical Psychologist, PhD', 'Provides trauma-informed care for grief, recovery, and emotional resilience.', array['trauma','grief'], array['Video session','Phone session'], 'https://images.unsplash.com/photo-1708448903646-fc3ba372cbc7?fm=jpg&q=80&w=800&auto=format&fit=crop', 15500, true, true)
on conflict (id) do update set
  name = excluded.name,
  credentials = excluded.credentials,
  bio = excluded.bio,
  specialties = excluded.specialties,
  session_types = excluded.session_types,
  photo_url = excluded.photo_url,
  hourly_rate_cents = excluded.hourly_rate_cents,
  accepting_clients = excluded.accepting_clients,
  is_published = excluded.is_published;
