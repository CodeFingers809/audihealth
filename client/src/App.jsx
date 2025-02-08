import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HealthCheck from "./components/HealthCheck";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/Dashboard";
import AudiBuddy from "./pages/AudiBuddy";
import ExercisesPage from "./pages/Exercises";
import AuthPages from "./pages/AuthPages";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppLayout />}>
        <Route path="/health" element={<HealthCheck />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/audibuddy" element={<AudiBuddy />} />
        <Route path="/exercise" element={<ExercisesPage />} />
      </Route>
      <Route path="/auth" element={<AuthPages />} />
    </Routes>
  );
};

export default App;
