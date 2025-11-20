"use client";

import { useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";

export function useTableCRMWithAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (auth?.token) {
      apiClient.setToken(auth.token);
    } else {
      apiClient.clearToken();
    }
  }, [auth?.token]);

  const isAuthenticated = Boolean(auth?.token);

  return {
    isAuthenticated,
    clearToken: auth?.clearToken || (() => {}),
  };
}
