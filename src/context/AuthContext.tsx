"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "@/types";
import { getCurrentUser, setCurrentUser as persistUser } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, requireAdmin?: boolean) => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileRole = async (
    userId: string,
    email: string,
    userMetaRole?: string
  ): Promise<UserProfile> => {
    let role: "admin" | "customer" = "customer";
    let fullName = email.split("@")[0];

    // Check user metadata first if provided by Supabase Auth
    if (userMetaRole === "admin") {
      role = "admin";
    }

    if (supabase) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name, email")
          .eq("id", userId)
          .maybeSingle();

        if (profile) {
          if (profile.role === "admin") {
            role = "admin";
          }
          if (profile.full_name) {
            fullName = profile.full_name;
          }
        } else {
          // If profile row doesn't exist yet, automatically create it
          const initialRole =
            role === "admin" || email.toLowerCase().startsWith("admin")
              ? "admin"
              : "customer";

          await supabase.from("profiles").upsert({
            id: userId,
            email,
            full_name: fullName,
            role: initialRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          role = initialRole;
        }
      } catch (err) {
        console.warn("Could not query profiles table:", err);
      }
    }

    return {
      id: userId,
      email,
      full_name: fullName,
      role,
    };
  };

  useEffect(() => {
    // Check initial cached user
    const initial = getCurrentUser();
    setUser(initial);
    setIsLoading(false);

    // If Supabase is configured, sync with active Supabase session
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const profile = await fetchProfileRole(
            session.user.id,
            session.user.email || "",
            session.user.user_metadata?.role
          );
          setUser(profile);
          persistUser(profile);
        } else {
          setUser(null);
          persistUser(null);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfileRole(
            session.user.id,
            session.user.email || "",
            session.user.user_metadata?.role
          );
          setUser(profile);
          persistUser(profile);
        } else {
          setUser(null);
          persistUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (
    email: string,
    pass: string,
    requireAdmin = false
  ): Promise<boolean> => {
    setIsLoading(true);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });

        if (error) {
          toast.error("Authentication Failed", { description: error.message });
          setIsLoading(false);
          return false;
        }

        if (!data.user) {
          toast.error("User not found");
          setIsLoading(false);
          return false;
        }

        const profile = await fetchProfileRole(
          data.user.id,
          data.user.email || email,
          data.user.user_metadata?.role
        );

        if (requireAdmin && profile.role !== "admin") {
          await supabase.auth.signOut();
          setUser(null);
          persistUser(null);
          toast.error("Access Denied", {
            description:
              "Your account does not have administrator privileges. Only users with role 'admin' can access this area.",
          });
          setIsLoading(false);
          return false;
        }

        setUser(profile);
        persistUser(profile);
        toast.success(
          profile.role === "admin" ? "Admin Access Granted" : "Welcome Back!",
          {
            description: `Signed in as ${profile.full_name}`,
          }
        );
        setIsLoading(false);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Login error";
        toast.error("Login Failed", { description: msg });
        setIsLoading(false);
        return false;
      }
    }

    // Fallback if Supabase is offline
    const isMockAdmin = email.toLowerCase().includes("admin") && pass === "admin123";
    if (requireAdmin && !isMockAdmin) {
      toast.error("Access Denied", {
        description: "Invalid admin credentials.",
      });
      setIsLoading(false);
      return false;
    }

    const fallbackUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      full_name: isMockAdmin ? "Store Administrator" : email.split("@")[0],
      role: isMockAdmin ? "admin" : "customer",
    };

    setUser(fallbackUser);
    persistUser(fallbackUser);
    toast.success("Signed In", { description: `Logged in as ${fallbackUser.full_name}` });
    setIsLoading(false);
    return true;
  };

  const signup = async (
    email: string,
    pass: string,
    name: string
  ): Promise<boolean> => {
    setIsLoading(true);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: pass,
          options: {
            data: {
              full_name: name,
              role: "customer",
            },
          },
        });

        if (error) {
          toast.error("Registration Failed", { description: error.message });
          setIsLoading(false);
          return false;
        }

        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email: data.user.email || email,
            full_name: name,
            role: "customer",
            created_at: new Date().toISOString(),
          });

          const newUser: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: name,
            role: "customer",
          };
          setUser(newUser);
          persistUser(newUser);
          toast.success("Account Created", {
            description: `Welcome to LUMERO, ${name}!`,
          });
          setIsLoading(false);
          return true;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Signup error";
        toast.error("Signup Failed", { description: msg });
        setIsLoading(false);
        return false;
      }
    }

    const fallbackUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      full_name: name || "Customer",
      role: "customer",
    };
    setUser(fallbackUser);
    persistUser(fallbackUser);
    toast.success("Account Created", {
      description: `Welcome to LUMERO, ${name}!`,
    });
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
    persistUser(null);
    toast.info("Signed Out", {
      description: "You have been logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
