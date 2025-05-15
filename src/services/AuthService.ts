
import { supabase } from "@/integrations/supabase/client";

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export const AuthService = {
  signUp: async ({ email, password }: SignUpCredentials) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  signIn: async ({ email, password }: SignInCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  getCurrentSession: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  
  getCurrentUser: async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }
};
