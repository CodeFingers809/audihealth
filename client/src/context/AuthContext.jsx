import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

const API_URL = "http://localhost:8000/api/users";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      refreshToken();
    } else {
      setLoading(false);
    }
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.post(`${API_URL}/refresh-token`, {}, { withCredentials: true });
  
      if (response.data.success) {
        localStorage.setItem("accessToken", response.data.accessToken);
        setUser(response.data.user || null);
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
  
      if (response.data.success) {
        localStorage.setItem("accessToken", response.data.accessToken);
        setUser(response.data.user);
        navigate("/dashboard");
        return { success: true };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed"
      };
    }
  };
  

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Automatically login after successful registration
        return await login({
          email: userData.email,
          password: userData.password
        });
      }
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed"
      };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await axios.post(
          `${API_URL}/logout`,
          {},
          { 
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      navigate("/"); // Redirect to landing page
    }
  };
  

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        refreshToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};