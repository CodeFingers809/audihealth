import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Don't protect the landing page
  if (location.pathname === "/") {
    return <Outlet />;
  }

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Loading...</p>;
  }

  return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;