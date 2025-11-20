"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setToken = (newToken: string) => {
    setTokenState(newToken);
    setIsAuthenticated(true);
    localStorage.setItem("tablecrm-token", newToken);
  };

  const clearToken = () => {
    setTokenState(null);
    setIsAuthenticated(false);
    localStorage.removeItem("tablecrm-token");
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("tablecrm-token");
    if (savedToken) {
      setTokenState(savedToken);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const value = {
    token,
    isAuthenticated,
    setToken,
    clearToken,
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
