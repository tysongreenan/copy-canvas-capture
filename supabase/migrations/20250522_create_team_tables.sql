-- Create teams table
create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create team_memberships table
create table if not exists team_memberships (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(team_id, user_id)
);

-- Add team_id column to scraped_projects
alter table if exists scraped_projects
  add column if not exists team_id uuid references teams(id) on delete set null;

