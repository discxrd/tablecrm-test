"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TokenFormProps {
  onSuccess: (token: string) => void;
}

export function TokenForm({ onSuccess }: TokenFormProps) {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token.trim()) {
      setError("Пожалуйста, введите токен");
      return;
    }

    setIsLoading(true);

    try {
      // Validate token by making a test API call
      const response = await fetch(
        `https://app.tablecrm.com/api/v1/warehouses/?token=${token}`
      );

      if (!response.ok) {
        throw new Error("Неверный токен");
      }

      onSuccess(token);
    } catch (err) {
      setError("Не удалось авторизоваться. Проверьте токен.");
      console.error("Token validation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-linear-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-xl py-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Формочка
          </CardTitle>
          <CardDescription className="text-center">
            Введите токен кассы для авторизации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Токен кассы</Label>
              <Input
                id="token"
                type="text"
                placeholder="Введите токен..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Проверка..." : "Продолжить"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
