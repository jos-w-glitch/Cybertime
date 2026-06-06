-- Run this in Supabase: SQL Editor → New query → Run
-- Project name: Cybertime

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name_lower text unique not null,
  display_name text not null,
  pin text not null,
  save_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists leaderboard (
  level_id int not null,
  name_lower text not null,
  player_name text not null,
  score int not null,
  updated_at timestamptz not null default now(),
  primary key (level_id, name_lower)
);

create index if not exists leaderboard_level_score_idx
  on leaderboard (level_id, score desc);

alter table players enable row level security;
alter table leaderboard enable row level security;

create or replace function login_player(p_name text, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row players%rowtype;
  clean_name text := trim(p_name);
  clean_pin text := trim(p_pin);
begin
  if length(clean_name) = 0 then
    return jsonb_build_object('ok', false, 'reason', 'Enter a name');
  end if;
  if clean_pin !~ '^\d{4}$' then
    return jsonb_build_object('ok', false, 'reason', 'PIN must be 4 digits');
  end if;

  select * into row
  from players
  where name_lower = lower(clean_name);

  if not found then
    insert into players (name_lower, display_name, pin, save_data)
    values (lower(clean_name), clean_name, clean_pin, '{}'::jsonb)
    returning * into row;

    return jsonb_build_object(
      'ok', true,
      'is_new', true,
      'name', row.display_name,
      'save_data', row.save_data
    );
  end if;

  if row.pin <> clean_pin then
    return jsonb_build_object('ok', false, 'reason', 'Wrong PIN for this name');
  end if;

  return jsonb_build_object(
    'ok', true,
    'is_new', false,
    'name', row.display_name,
    'save_data', row.save_data
  );
end;
$$;

create or replace function save_player(p_name text, p_pin text, p_save jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row players%rowtype;
  clean_name text := trim(p_name);
  clean_pin text := trim(p_pin);
begin
  select * into row
  from players
  where name_lower = lower(clean_name);

  if not found or row.pin <> clean_pin then
    return jsonb_build_object('ok', false, 'reason', 'Wrong PIN for this name');
  end if;

  update players
  set save_data = coalesce(p_save, '{}'::jsonb),
      updated_at = now()
  where id = row.id;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function upsert_leaderboard_entry(
  p_name text,
  p_pin text,
  p_level_id int,
  p_score int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row players%rowtype;
  clean_name text := trim(p_name);
  clean_pin text := trim(p_pin);
  prev_score int;
begin
  select * into row
  from players
  where name_lower = lower(clean_name);

  if not found or row.pin <> clean_pin then
    return jsonb_build_object('ok', false, 'reason', 'Wrong PIN for this name');
  end if;

  select score into prev_score
  from leaderboard
  where level_id = p_level_id and name_lower = lower(clean_name);

  if found and p_score <= prev_score then
    return jsonb_build_object('ok', true, 'updated', false);
  end if;

  insert into leaderboard (level_id, name_lower, player_name, score, updated_at)
  values (p_level_id, lower(clean_name), row.display_name, p_score, now())
  on conflict (level_id, name_lower)
  do update set
    player_name = excluded.player_name,
    score = excluded.score,
    updated_at = excluded.updated_at
  where leaderboard.score < excluded.score;

  return jsonb_build_object('ok', true, 'updated', true);
end;
$$;

create or replace function get_level_leaderboard(p_level_id int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'name', player_name,
          'score', score,
          'at', extract(epoch from updated_at) * 1000
        )
        order by score desc, updated_at desc
      )
      from (
        select player_name, score, updated_at
        from leaderboard
        where level_id = p_level_id
        order by score desc, updated_at desc
        limit 10
      ) top_rows
    ),
    '[]'::jsonb
  );
end;
$$;

grant execute on function login_player(text, text) to anon, authenticated;
grant execute on function save_player(text, text, jsonb) to anon, authenticated;
grant execute on function upsert_leaderboard_entry(text, text, int, int) to anon, authenticated;
grant execute on function get_level_leaderboard(int) to anon, authenticated;
