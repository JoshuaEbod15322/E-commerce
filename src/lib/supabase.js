// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions with improved error handling
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile with timeout
    try {
      const { data: userProfile, error: profileError } = await Promise.race([
        supabase.from("users").select("*").eq("id", data.user.id).maybeSingle(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Profile fetch timeout")), 3000)
        ),
      ]);

      if (!profileError && userProfile) {
        return {
          ...data,
          user: {
            ...data.user,
            is_admin: userProfile?.is_admin || email === "admin@gmail.com",
            profile: userProfile,
          },
        };
      }
    } catch (profileError) {
      console.warn("Profile fetch warning:", profileError);
    }

    // Fallback if profile fetch fails
    return {
      ...data,
      user: {
        ...data.user,
        is_admin: email === "admin@gmail.com",
        profile: null,
      },
    };
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
};

export const signUp = async (email, password, userData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.username,
        },
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    console.log("Starting sign out process...");

    // Clear any local storage
    localStorage.removeItem("supabase.auth.token");
    sessionStorage.clear();

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Supabase sign out error:", error);
      // Force clear session
      await supabase.auth.setSession(null);
    }

    // Force page refresh to clear all states
    console.log("Sign out successful, redirecting...");
    window.location.href = "/login";
    return true;
  } catch (error) {
    console.error("Unexpected sign out error:", error);
    // Force redirect anyway
    window.location.href = "/login";
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    console.log("Getting current user...");

    // Get session with timeout
    const {
      data: { session },
      error: sessionError,
    } = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Session fetch timeout")), 2000)
      ),
    ]);

    if (sessionError) {
      console.warn("Session error:", sessionError);
      return null;
    }

    if (!session?.user) {
      console.log("No session found");
      return null;
    }

    // Try to get user profile (non-blocking)
    let userProfile = null;
    try {
      const { data, error: profileError } = await Promise.race([
        supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle(),
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: null, error: null }), 1500)
        ),
      ]);

      if (!profileError && data) {
        userProfile = data;
      }
    } catch (profileError) {
      console.warn("Profile fetch warning:", profileError);
    }

    // Combine data
    const userData = {
      ...session.user,
      ...userProfile,
      is_admin:
        userProfile?.is_admin || session.user.email === "admin@gmail.com",
      hasProfile: !!userProfile,
    };

    console.log("User data retrieved successfully");
    return userData;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);

    // Last resort: check session directly without timeout
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        return {
          ...session.user,
          is_admin: session.user.email === "admin@gmail.com",
          hasProfile: false,
        };
      }
    } catch (fallbackError) {
      console.error("Fallback session check failed:", fallbackError);
    }

    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        full_name: userData.name,
        phone: userData.phone,
        address: userData.address,
        country: userData.country,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Dashboard statistics with improved error handling
export const getDashboardStats = async () => {
  try {
    console.log("Fetching dashboard stats...");

    // Get orders data
    let totalSales = 0;
    let totalOrders = 0;
    try {
      const { data: ordersData, error: ordersError } = await Promise.race([
        supabase.from("orders").select("total_amount, status"),
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: [], error: null }), 3000)
        ),
      ]);

      if (!ordersError && ordersData) {
        totalOrders = ordersData.length;
        totalSales = ordersData
          .filter((order) => order.status === "delivered")
          .reduce(
            (sum, order) => sum + (parseFloat(order.total_amount) || 0),
            0
          );
      }
    } catch (ordersError) {
      console.warn("Orders fetch warning:", ordersError);
    }

    // Get customers count
    let totalCustomers = 0;
    try {
      const { count, error: customersError } = await Promise.race([
        supabase.from("users").select("*", { count: "exact", head: true }),
        new Promise((resolve) =>
          setTimeout(() => resolve({ count: 0, error: null }), 2000)
        ),
      ]);

      if (!customersError) {
        totalCustomers = count || 0;
      }
    } catch (error) {
      console.warn("Could not count customers:", error);
    }

    console.log("Dashboard stats fetched:", {
      totalSales,
      totalOrders,
      totalCustomers,
    });

    return {
      totalSales: `P${totalSales.toFixed(2)}`,
      totalOrders,
      totalCustomers,
    };
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return {
      totalSales: "P0.00",
      totalOrders: 0,
      totalCustomers: 0,
    };
  }
};
