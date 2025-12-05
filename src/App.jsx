// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./Login";
import SignUpForm from "./SignUp";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
import AccountPage from "./AccountPage";
import CartPage from "./CartPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./ErrorBoundary";
import SafeLoader from "./components/SafeLoader";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <SafeLoader>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </SafeLoader>
    </ErrorBoundary>
  );
}

export default App;
