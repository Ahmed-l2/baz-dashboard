import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  allowedRoutes: string[];
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [allowedRoutes, setAllowedRoutes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  console.log("current user:", user);
  console.log("loading state:", loading);

  // --- Fetch allowed routes for a user ---
  const fetchAllowedRoutes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_routes")
        .select("routes(path)")
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to fetch user_routes:", error);
        setAllowedRoutes([]);
        return;
      }

      const paths = data
        .map((r) => r.routes?.path)
        .filter((p): p is string => !!p);

      setAllowedRoutes(paths);
    } catch (err) {
      console.error("Error fetching allowed routes:", err);
      setAllowedRoutes([]);
    }
  };

  // --- Initialize session & set listener ---
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Get session error:", error);
          throw error;
        }

        const currentUser = data.session?.user ?? null;

        if (mounted) {
          setSession(data.session);
          setUser(currentUser);

          if (currentUser) {
            // Fetch routes but don't let it block loading state
            fetchAllowedRoutes(currentUser.id).catch(err => {
              console.error("Failed to fetch routes during init:", err);
            });
          } else {
            setAllowedRoutes([]);
          }
        }
      } catch (err) {
        console.error("AuthProvider init error:", err);
        if (mounted) {
          setSession(null);
          setUser(null);
          setAllowedRoutes([]);
        }
      } finally {
        // CRITICAL: Always set loading to false, even if there's an error
        if (mounted) {
          console.log("Setting loading to false");
          setLoading(false);
        }
      }
    };

    init();

    // Set up auth state listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (!mounted) return;

        try {
          const currentUser = session?.user ?? null;
          setSession(session);
          setUser(currentUser);

          if (currentUser) {
            // Fetch routes but don't block UI
            fetchAllowedRoutes(currentUser.id).catch(err => {
              console.error("Failed to fetch routes on auth change:", err);
            });
          } else {
            setAllowedRoutes([]);
          }
        } catch (err) {
          console.error("Auth state change error:", err);
          if (mounted) {
            setAllowedRoutes([]);
          }
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  // --- Auth actions ---
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) return { error };
      
      // The onAuthStateChange listener will handle setting session/user
      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err : new Error('Sign in failed') 
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setAllowedRoutes([]);
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, allowedRoutes, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Hook for consuming the context ---
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}