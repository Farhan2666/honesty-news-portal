"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@/types";

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("honesty_token");
    const storedUser = localStorage.getItem("honesty_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message };
    localStorage.setItem("honesty_token", data.token);
    localStorage.setItem("honesty_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return { ok: true };
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message };
    localStorage.setItem("honesty_token", data.token);
    localStorage.setItem("honesty_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("honesty_token");
    localStorage.removeItem("honesty_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
