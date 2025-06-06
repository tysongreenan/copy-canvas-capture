-- Enable RLS on team-related tables
alter table teams enable row level security;
alter table team_memberships enable row level security;
alter table scraped_projects enable row level security;

-- Teams policies: only members can select/update/delete
create policy "select team" on teams for select using (
  exists(select 1 from team_memberships m where m.team_id = id and m.user_id = auth.uid())
);
create policy "insert team" on teams for insert with check (auth.uid() = auth.uid());
create policy "update team" on teams for update using (
  exists(select 1 from team_memberships m where m.team_id = id and m.user_id = auth.uid())
);
create policy "delete team" on teams for delete using (
  exists(select 1 from team_memberships m where m.team_id = id and m.user_id = auth.uid())
);

-- Team memberships policies
create policy "select membership" on team_memberships for select using (
  user_id = auth.uid()
);
create policy "insert membership" on team_memberships for insert with check (
  user_id = auth.uid()
);
create policy "delete membership" on team_memberships for delete using (
  user_id = auth.uid()
);

-- Project policies
create policy "select project by team" on scraped_projects for select using (
  exists(select 1 from team_memberships m where m.team_id = team_id and m.user_id = auth.uid())
);
create policy "insert project by team" on scraped_projects for insert with check (
  exists(select 1 from team_memberships m where m.team_id = team_id and m.user_id = auth.uid())
);
create policy "update project by team" on scraped_projects for update using (
  exists(select 1 from team_memberships m where m.team_id = team_id and m.user_id = auth.uid())
);
create policy "delete project by team" on scraped_projects for delete using (
  exists(select 1 from team_memberships m where m.team_id = team_id and m.user_id = auth.uid())
);
