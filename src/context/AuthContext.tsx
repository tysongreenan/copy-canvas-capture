
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { AuthService } from "@/services/AuthService";
import { supabase } from "@/integrations/supabase/client";
import { TeamService, Team } from "@/services/TeamService";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  teams: Team[];
  currentTeamId: string | null;
  joinTeam: (teamId: string) => Promise<void>;
  switchTeam: (teamId: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        if (currentSession?.user) {
          TeamService.getUserTeams().then((t) => {
            setTeams(t);
            setCurrentTeamId(t[0]?.id || null);
          });
        } else {
          setTeams([]);
          setCurrentTeamId(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      if (currentSession?.user) {
        TeamService.getUserTeams().then((t) => {
          setTeams(t);
          setCurrentTeamId(t[0]?.id || null);
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { user: authUser } = await AuthService.signIn({ email, password });
      setUser(authUser);
      const userTeams = await TeamService.getUserTeams();
      setTeams(userTeams);
      setCurrentTeamId(userTeams[0]?.id || null);
      toast({
        title: "Signed in successfully",
        description: `Welcome back${authUser?.email ? ', ' + authUser.email : ''}!`,
      });
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await AuthService.signUp({ email, password });
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const joinTeam = async (teamId: string) => {
    const success = await TeamService.joinTeam(teamId);
    if (success) {
      const userTeams = await TeamService.getUserTeams();
      setTeams(userTeams);
      setCurrentTeamId(teamId);
    }
  };

  const switchTeam = (teamId: string) => {
    setCurrentTeamId(teamId);
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      setSession(null);
      setTeams([]);
      setCurrentTeamId(null);
      toast({
        title: "Signed out",
        description: "You've been signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        teams,
        currentTeamId,
        joinTeam,
        switchTeam,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
