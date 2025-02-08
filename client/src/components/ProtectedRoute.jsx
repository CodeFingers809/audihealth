import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>; // ✅ Show loading state instead of redirecting

  return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;