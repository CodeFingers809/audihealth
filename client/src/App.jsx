import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HealthCheck from "./components/HealthCheck";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/Dashboard";
import AudiBuddy from "./pages/AudiBuddy";
import ExercisesPage from "./pages/Exercises";
import AuthPages from "./pages/AuthPages";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Map } from "./components/Map.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPages />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/map" element={<Map />} />
            <Route path="/health" element={<HealthCheck />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/audibuddy" element={<AudiBuddy />} />
            <Route path="/exercise" element={<ExercisesPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
