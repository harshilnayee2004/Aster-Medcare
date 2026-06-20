import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyCurrentUser() {
      if (token) {
        try {
          const response = await api.get("/auth/me");
          setCurrentUser(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        } catch (error) {
          console.error("Token verification failed on init:", error.message);
          logout();
        }
      }
      setLoading(false);
    }
    verifyCurrentUser();
  }, [token]);

  async function login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    const { token: receivedToken, user } = response.data;
    
    setToken(receivedToken);
    setCurrentUser(user);
    
    localStorage.setItem("token", receivedToken);
    localStorage.setItem("user", JSON.stringify(user));
    
    return user;
  }

  function logout() {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  const isAdmin = () => currentUser?.role === "admin";
  const isDoctor = () => currentUser?.role === "doctor";
  const isEmployee = () => currentUser?.role === "employee";

  const value = {
    currentUser,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isDoctor,
    isEmployee
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
