"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchContragents, useContragents } from "@/hooks/use-api";
import { useOrderStore } from "@/lib/stores/order-store";
import type { Contragent } from "@/lib/api/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ClientSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { contragent, setContragent } = useOrderStore();
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { data: searchResults = [], isLoading: isSearching } =
    useSearchContragents(debouncedQuery);

  const { data: initialClients = [] } = useContragents({ limit: 20 });

  const handleSelectClient = (client: Contragent) => {
    setContragent(client);
    setSearchQuery(client.name);
    setIsFocused(false);
  };

  const handleClearClient = () => {
    setContragent(null);
    setSearchQuery("");
  };

  const showResults = (debouncedQuery.length >= 2 || (isFocused && debouncedQuery.length === 0)) && !contragent;
  const clientsToDisplay = debouncedQuery.length >= 2 ? searchResults : initialClients;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="client-search">Клиент</Label>
        {contragent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearClient}
            className="h-auto p-1 text-xs"
          >
            Сменить
          </Button>
        )}
      </div>

      {contragent ? (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="font-semibold text-sm">{contragent.name}</p>
              <p className="text-sm text-gray-600">{contragent.phone}</p>
              {contragent.email && (
                <p className="text-xs text-gray-500">{contragent.email}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="client-search"
              type="text"
              placeholder="Поиск по имени или телефону..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="pl-10"
              autoComplete="off"
            />
          </div>

          {isSearching && <p className="text-sm text-gray-500">Поиск...</p>}

          {showResults && clientsToDisplay.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {clientsToDisplay.map((client) => (
                <Card
                  key={client.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors py-0"
                  onClick={() => handleSelectClient(client)}
                >
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">{client.name}</p>
                    <p className="text-xs text-gray-600">{client.phone}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {showResults &&
            clientsToDisplay.length === 0 &&
            !isSearching &&
            debouncedQuery.length >= 2 && (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-500">Клиент не найден</p>
                </CardContent>
              </Card>
            )}
        </div>
      )}
    </div>
  );
}
