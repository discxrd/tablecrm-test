import { useQuery, useMutation } from "@tanstack/react-query";
import { tableCRMApi } from "@/lib/api/endpoints";
import type {
  ContragentSearchParams,
  NomenclatureSearchParams,
  CreateOrderPayload,
} from "@/lib/api/types";

// Keys for caching
export const queryKeys = {
  contragents: (params?: ContragentSearchParams) => ["contragents", params],
  searchContragents: (query: string) => ["contragents", "search", query],
  warehouses: ["warehouses"],
  payboxes: ["payboxes"],
  organizations: ["organizations"],
  priceTypes: ["priceTypes"],
  nomenclature: (params?: NomenclatureSearchParams) => ["nomenclature", params],
  searchNomenclature: (query: string) => ["nomenclature", "search", query],
};

// Hooks

export function useContragents(params?: ContragentSearchParams) {
  return useQuery({
    queryKey: queryKeys.contragents(params),
    queryFn: () => tableCRMApi.getContragents(params),
  });
}

export function useSearchContragents(query: string) {
  return useQuery({
    queryKey: queryKeys.searchContragents(query),
    queryFn: () => tableCRMApi.searchContragents(query),
    enabled: query.length > 0, // Only search if query is not empty
    staleTime: 1000 * 60 * 5, // Cache search results for 5 minutes
  });
}

export function useWarehouses() {
  return useQuery({
    queryKey: queryKeys.warehouses,
    queryFn: () => tableCRMApi.getWarehouses(),
  });
}

export function usePayboxes() {
  return useQuery({
    queryKey: queryKeys.payboxes,
    queryFn: () => tableCRMApi.getPayboxes(),
  });
}

export function useOrganizations() {
  return useQuery({
    queryKey: queryKeys.organizations,
    queryFn: () => tableCRMApi.getOrganizations(),
  });
}

export function usePriceTypes() {
  return useQuery({
    queryKey: queryKeys.priceTypes,
    queryFn: () => tableCRMApi.getPriceTypes(),
  });
}

export function useNomenclature(params?: NomenclatureSearchParams) {
  return useQuery({
    queryKey: queryKeys.nomenclature(params),
    queryFn: () => tableCRMApi.getNomenclature(params),
  });
}

export function useSearchNomenclature(query: string) {
  return useQuery({
    queryKey: queryKeys.searchNomenclature(query),
    queryFn: () => tableCRMApi.searchNomenclature(query),
    enabled: query.length > 0,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: ({
      data,
      post,
    }: {
      data: CreateOrderPayload;
      post?: boolean;
    }) => {
      if (post) {
        return tableCRMApi.createAndPostOrder(data);
      }
      return tableCRMApi.createOrder(data);
    },
    onSuccess: () => {
      // Invalidate relevant queries if needed, e.g., orders list
      // queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
