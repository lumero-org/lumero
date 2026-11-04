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
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);

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
          const initialRole = role === "admin" ? "admin" : "customer";

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
          // If no Supabase session, preserve stored customer profile if one exists
          const cached = getCurrentUser();
          if (cached && cached.role === "customer") {
            setUser(cached);
          } else {
            setUser(null);
            persistUser(null);
          }
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
          const cached = getCurrentUser();
          if (cached && cached.role === "customer") {
            setUser(cached);
          } else {
            setUser(null);
            persistUser(null);
          }
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
    const emailClean = email.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailClean,
          password: pass,
        });

        if (!error && data?.user) {
          const profile = await fetchProfileRole(
            data.user.id,
            data.user.email || emailClean,
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
        }

        // If requireAdmin, check for updated admin credentials in cms_content
        if (requireAdmin) {
          const { data: adminCreds } = await supabase
            .from("cms_content")
            .select("content")
            .eq("key", "admin_account_credentials")
            .maybeSingle();

          if (adminCreds?.content) {
            const expectedToken = btoa(encodeURIComponent(`${emailClean}:${pass}`));
            if (adminCreds.content.auth_token === expectedToken) {
              const adminUser: UserProfile = {
                id: "admin_root",
                email: emailClean,
                full_name: "Store Administrator",
                role: "admin",
              };
              setUser(adminUser);
              persistUser(adminUser);
              toast.success("Admin Access Granted", {
                description: `Signed in as Administrator`,
              });
              setIsLoading(false);
              return true;
            }
          }
        }

        // If Supabase Auth returned error (e.g. unconfirmed email or invalid credentials)
        // Check if customer is registered in cms_content or profiles
        if (!requireAdmin) {
          const { data: recordRow } = await supabase
            .from("cms_content")
            .select("content")
            .eq("key", `customer_account_${emailClean}`)
            .maybeSingle();

          if (recordRow?.content) {
            const expectedToken = btoa(encodeURIComponent(`${emailClean}:${pass}`));
            if (
              recordRow.content.auth_token === expectedToken ||
              recordRow.content.password === pass
            ) {
              const custUser: UserProfile = {
                id: recordRow.content.id || `cust_${Date.now()}`,
                email: recordRow.content.email || emailClean,
                full_name: recordRow.content.full_name || recordRow.content.name || emailClean.split("@")[0],
                role: "customer",
              };
              setUser(custUser);
              persistUser(custUser);
              toast.success("Welcome Back!", {
                description: `Signed in as ${custUser.full_name}`,
              });
              setIsLoading(false);
              return true;
            } else {
              toast.error("Invalid Credentials", {
                description: "Incorrect password. Please verify and try again.",
              });
              setIsLoading(false);
              return false;
            }
          }

          // Check profiles table
          const { data: prof } = await supabase
            .from("profiles")
            .select("id, email, full_name, role")
            .ilike("email", emailClean)
            .maybeSingle();

          if (prof) {
            toast.error("Invalid Credentials", {
              description: "Incorrect password for this account. Please verify.",
            });
          } else {
            toast.error("Account Not Found", {
              description: "No account found with this email. Please check your spelling or sign up.",
            });
          }
          setIsLoading(false);
          return false;
        }

        if (error) {
          toast.error("Authentication Failed", { description: error.message });
          setIsLoading(false);
          return false;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Login error";
        toast.error("Login Failed", { description: msg });
        setIsLoading(false);
        return false;
      }
    }

    // Fallback if Supabase is offline
    const isMockAdmin = emailClean.includes("admin") && pass === "admin123";
    if (requireAdmin && !isMockAdmin) {
      toast.error("Access Denied", {
        description: "Invalid admin credentials.",
      });
      setIsLoading(false);
      return false;
    }

    const fallbackUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: emailClean,
      full_name: isMockAdmin ? "Store Administrator" : emailClean.split("@")[0],
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
    const emailClean = email.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        // 1. Strict UNIQUE email verification in database
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, email")
          .ilike("email", emailClean)
          .maybeSingle();

        const { data: existingCms } = await supabase
          .from("cms_content")
          .select("key")
          .eq("key", `customer_account_${emailClean}`)
          .maybeSingle();

        if (existingProfile || existingCms) {
          toast.error("Account Already Exists", {
            description: "An account with this email address already exists. Please sign in.",
          });
          setIsLoading(false);
          return false;
        }

        // 2. Attempt Supabase Auth creation
        let customerId = `cust_${Date.now()}`;
        const { data } = await supabase.auth.signUp({
          email: emailClean,
          password: pass,
          options: {
            data: {
              full_name: name,
              role: "customer",
            },
          },
        });

        if (data?.user?.id) {
          customerId = data.user.id;
        }

        // If email was already taken in auth.users
        if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          toast.error("Account Already Exists", {
            description: "This email is already registered. Please sign in with your password.",
          });
          setIsLoading(false);
          return false;
        }

        // 3. Persist customer account record to database for reliable login
        const authToken = btoa(encodeURIComponent(`${emailClean}:${pass}`));
        await supabase.from("cms_content").upsert({
          key: `customer_account_${emailClean}`,
          content: {
            id: customerId,
            email: emailClean,
            full_name: name,
            role: "customer",
            auth_token: authToken,
            created_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        });

        // 4. Save to profiles table
        await supabase.from("profiles").upsert({
          id: customerId,
          email: emailClean,
          full_name: name,
          role: "customer",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        const newUser: UserProfile = {
          id: customerId,
          email: emailClean,
          full_name: name,
          role: "customer",
        };
        setUser(newUser);
        persistUser(newUser);

        // Dispatch Welcome Email via Brevo (non-blocking)
        if (typeof window !== "undefined") {
          fetch("/api/email/welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailClean, name }),
          }).catch((e) => console.warn("Welcome email notice:", e));
        }

        toast.success("Account Created", {
          description: `Welcome to LUMERO, ${name}!`,
        });
        setIsLoading(false);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Signup error";
        toast.error("Signup Failed", { description: msg });
        setIsLoading(false);
        return false;
      }
    }

    const fallbackUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: emailClean,
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
