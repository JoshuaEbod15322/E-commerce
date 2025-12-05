// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase, getCurrentUser } from "@/lib/supabase";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [authState, setAuthState] = useState({
    loading: true,
    user: null,
    isAdmin: false,
  });

  useEffect(() => {
    let mounted = true;
    let authSubscription = null;

    const checkAuth = async () => {
      try {
        // First, check if we have a session quickly
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (mounted) {
            setAuthState({ loading: false, user: null, isAdmin: false });
          }
          return;
        }

        // Try to get user profile, but don't wait too long
        const currentUser = await Promise.race([
          getCurrentUser(),
          new Promise((resolve) => setTimeout(() => resolve(null), 2000)), // 2-second timeout
        ]);

        if (currentUser && mounted) {
          setAuthState({
            loading: false,
            user: currentUser,
            isAdmin: currentUser.is_admin || false,
          });
        } else if (session?.user && mounted) {
          // Fallback to session user if profile fetch fails/timeouts
          setAuthState({
            loading: false,
            user: session.user,
            isAdmin: session.user.email === "admin@gmail.com",
          });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          setAuthState({ loading: false, user: null, isAdmin: false });
        }
      }
    };

    checkAuth();

    // Set up auth listener
    authSubscription = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (!session) {
          setAuthState({ loading: false, user: null, isAdmin: false });
          return;
        }

        try {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setAuthState({
              loading: false,
              user: currentUser,
              isAdmin: currentUser.is_admin || false,
            });
          } else {
            setAuthState({
              loading: false,
              user: session.user,
              isAdmin: session.user.email === "admin@gmail.com",
            });
          }
        } catch (error) {
          console.error("Auth state change error:", error);
          setAuthState({
            loading: false,
            user: session.user,
            isAdmin: session.user.email === "admin@gmail.com",
          });
        }
      }
    );

    return () => {
      mounted = false;
      if (authSubscription?.unsubscribe) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!authState.user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !authState.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
