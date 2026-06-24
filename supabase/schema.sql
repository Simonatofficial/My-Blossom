-- My Blossom v1.0.0 — Supabase schema (hardened).
-- Two tables mirror the local store. Row Level Security is ON, always: a user
-- can only ever see/write their own rows (auth.uid() = user_id). Ids are TEXT
-- (friendly ids from the client — never Postgres uuid; that caused a live 400 in
-- v0.0.1). Run this once in the Supabase SQL editor, then enable the Anonymous,
-- Email, and Google auth providers. (docs/02 §C — cloud sync.)

create table if not exists public.objects (
  id          text not null,
  user_id     uuid not null references auth.users (id) on delete cascade,
  kind        text not null,
  module_id   text,
  data        jsonb not null,
  updated_at  bigint not null,
  deleted_at  bigint,
  primary key (user_id, id)
);

create table if not exists public.links (
  id          text not null,
  user_id     uuid not null references auth.users (id) on delete cascade,
  from_id     text not null,
  to_id       text not null,
  rel         text,
  updated_at  bigint not null,
  deleted_at  bigint,
  primary key (user_id, id)
);

create index if not exists objects_user_updated on public.objects (user_id, updated_at);
create index if not exists links_user_updated   on public.links   (user_id, updated_at);

-- RLS ON.
alter table public.objects enable row level security;
alter table public.links   enable row level security;

-- One policy family per table: owner-only for every verb.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'objects_owner') then
    create policy objects_owner on public.objects
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'links' and policyname = 'links_owner') then
    create policy links_owner on public.links
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
