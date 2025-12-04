// App.jsx - Updated with AdminDashboard
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./Login";
import SignUpForm from "./SignUp";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard"; // Add this import
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />{" "}
      {/* Add admin route */}
    </Routes>
  );
}

export default App;
