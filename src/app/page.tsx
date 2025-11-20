"use client";

import { useState } from "react";
import { useTableCRMWithAuth } from "@/hooks/useTableCRMWithAuth";
import { useAuth } from "@/contexts/AuthContext";
import { OrderForm } from "@/components/forms/OrderForm";
import { TokenForm } from "@/components/forms/TokenForm";
import { Header } from "@/components/layout/Header";
import { OrderSummary } from "@/components/layout/OrderSummary";
import { OrderBottomSheet } from "@/components/layout/OrderBottomSheet";

export default function Home() {
  const { isAuthenticated } = useTableCRMWithAuth();
  const { clearToken, setToken } = useAuth();
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const handleLogout = () => {
    clearToken();
  };

  const handleTokenSuccess = () => {
    // Token successfully set, nothing to do here
  };

  const handleOrderCreated = () => {
    setShowBottomSheet(false);
  };

  if (!isAuthenticated) {
    return (
      <TokenForm
        onSuccess={(token) => {
          setToken(token);
          handleTokenSuccess();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={handleLogout} />

      <main className="container max-w-2xl mx-auto px-4 py-6 pb-24">
        <OrderForm />
      </main>

      <OrderSummary onContinue={() => setShowBottomSheet(true)} />
      <OrderBottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
}
