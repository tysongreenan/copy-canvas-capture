
import { supabase } from "@/integrations/supabase/client";

export type AppRole = 'user' | 'admin' | 'master_admin';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export class RoleService {
  /**
   * Get the current user's highest role
   */
  public static async getCurrentUserRole(): Promise<AppRole | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .rpc('get_user_role', { _user_id: user.id });

      if (error) {
        console.error("Error fetching user role:", error);
        return 'user'; // Default to user role
      }

      return data || 'user';
    } catch (error) {
      console.error("Exception in getCurrentUserRole:", error);
      return 'user';
    }
  }

  /**
   * Check if current user has a specific role
   */
  public static async hasRole(role: AppRole): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .rpc('has_role', { 
          _user_id: user.id, 
          _role: role 
        });

      if (error) {
        console.error("Error checking user role:", error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error("Exception in hasRole:", error);
      return false;
    }
  }

  /**
   * Check if current user is master admin
   */
  public static async isMasterAdmin(): Promise<boolean> {
    return this.hasRole('master_admin');
  }

  /**
   * Add role to a user (master admin only)
   */
  public static async addUserRole(userId: string, role: AppRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (error) {
        console.error("Error adding user role:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Exception in addUserRole:", error);
      return false;
    }
  }

  /**
   * Get current user ID for manual role assignment
   */
  public static async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error("Exception in getCurrentUserId:", error);
      return null;
    }
  }

  /**
   * TEMPORARY: Print current user ID to console for setup
   * Use this to get your user ID, then manually assign master_admin role in Supabase
   * After setup, you can remove this function
   */
  public static async printCurrentUserId(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("=== TEMPORARY USER ID HELPER ===");
        console.log("Your User ID:", user.id);
        console.log("Your Email:", user.email);
        console.log("Run this SQL in Supabase to make yourself master admin:");
        console.log(`INSERT INTO public.user_roles (user_id, role) VALUES ('${user.id}', 'master_admin');`);
        console.log("=== END HELPER ===");
      } else {
        console.log("No user logged in");
      }
    } catch (error) {
      console.error("Exception in printCurrentUserId:", error);
    }
  }
}
