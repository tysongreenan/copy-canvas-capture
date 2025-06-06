import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export interface Team {
  id: string;
  name: string;
  created_at: string | null;
  updated_at: string | null;
}

export const TeamService = {
  async getUserTeams(): Promise<Team[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('team_memberships')
      .select('teams(*)')
      .eq('user_id', user.id);
    if (error) {
      console.error('Error fetching teams', error);
      return [];
    }
    return (data || []).map((tm) => tm.teams) as Team[];
  },

  async joinTeam(teamId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase
      .from('team_memberships')
      .insert({ team_id: teamId, user_id: user.id } as Database['public']['Tables']['team_memberships']['Insert']);
    if (error) {
      console.error('Error joining team', error);
      return false;
    }
    return true;
  }
};

