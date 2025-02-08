import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) fetchUser();
    else setLoading(false);
  }, []);

  // Fetch user data from the backend
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        withCredentials: true,
      });
      setUser(data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (formData) => {
    try {
      const { data } = await axios.post("http://localhost:8000/api/users/login", formData, { withCredentials: true });
      localStorage.setItem("accessToken", data.accessToken);
      setUser(data.user);
      navigate("/dashboard");
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post("http://localhost:8000/api/users/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};