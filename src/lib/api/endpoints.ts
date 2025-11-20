import { apiClient } from "./client";
import type {
  Contragent,
  Warehouse,
  Paybox,
  Organization,
  PriceType,
  Nomenclature,
  CreateOrderPayload,
  ContragentSearchParams,
  NomenclatureSearchParams,
} from "./types";

// Helper to extract data from API responses
function extractData<T>(response: any): T {
  // Check if response has 'result' property (seen in logs)
  if (
    response &&
    typeof response === "object" &&
    "result" in response &&
    Array.isArray(response.result)
  ) {
    return response.result as T;
  }
  // Check if response has 'data' property (standard convention)
  if (response && typeof response === "object" && "data" in response) {
    return response.data as T;
  }
  // Return response as is if it's likely the data itself
  return response as T;
}

export const tableCRMApi = {
  // Contragents (Clients)
  async getContragents(params?: ContragentSearchParams): Promise<Contragent[]> {
    const response = await apiClient.get<any>("/contragents/", { params });
    const data = extractData<Contragent[]>(response);
    return Array.isArray(data) ? data : [];
  },

  async searchContragents(query: string): Promise<Contragent[]> {
    // Если есть буквы - ищем по имени, иначе по телефону
    const hasLetters = /[a-zA-Zа-яА-Я]/.test(query);
    const params: any = {};
    if (hasLetters) {
      params.name = query;
    } else {
      // Clean phone number - remove all non-digit characters
      const cleanPhone = query.replace(/\D/g, "");
      params.phone = cleanPhone;
    }

    console.log("Search params:", params);
    const response = await apiClient.get<any>("/contragents/", { params });
    const data = extractData<Contragent[]>(response);
    console.log("API response:", response, "Extracted data:", data);
    return Array.isArray(data) ? data : [];
  },

  async createContragent(data: Partial<Contragent>): Promise<Contragent> {
    const response = await apiClient.post<any>("/contragents/", data);
    // For creation, it might return the object directly or in data/result
    if (response && typeof response === "object" && "result" in response)
      return response.result;
    if (response && typeof response === "object" && "data" in response)
      return response.data;
    return response;
  },

  // Warehouses
  async getWarehouses(): Promise<Warehouse[]> {
    const response = await apiClient.get<any>("/warehouses/");
    const data = extractData<Warehouse[]>(response);
    return Array.isArray(data) ? data : [];
  },

  // Payboxes
  async getPayboxes(): Promise<Paybox[]> {
    const response = await apiClient.get<any>("/payboxes/");
    const data = extractData<Paybox[]>(response);
    return Array.isArray(data) ? data : [];
  },

  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get<any>("/organizations/");
    const data = extractData<Organization[]>(response);
    return Array.isArray(data) ? data : [];
  },

  // Price Types
  async getPriceTypes(): Promise<PriceType[]> {
    const response = await apiClient.get<any>("/price_types/");
    const data = extractData<PriceType[]>(response);
    return Array.isArray(data) ? data : [];
  },

  // Nomenclature (Products)
  async getNomenclature(
    params?: NomenclatureSearchParams
  ): Promise<Nomenclature[]> {
    const response = await apiClient.get<any>("/nomenclature/", { params });
    const data = extractData<Nomenclature[]>(response);
    return Array.isArray(data) ? data : [];
  },

  async searchNomenclature(name: string): Promise<Nomenclature[]> {
    const response = await apiClient.get<any>("/nomenclature/", {
      params: { name, limit: 50 },
    });
    const data = extractData<Nomenclature[]>(response);
    return Array.isArray(data) ? data : [];
  },

  async getFirstNomenclature(limit: number = 20): Promise<Nomenclature[]> {
    const response = await apiClient.get<any>("/nomenclature/", {
      params: { limit },
    });
    const data = extractData<Nomenclature[]>(response);
    return Array.isArray(data) ? data : [];
  },

  // Orders (Sales)
  async createOrder(data: CreateOrderPayload): Promise<unknown> {
    return apiClient.post("/docs_sales/", [data]);
  },

  async createAndPostOrder(data: CreateOrderPayload): Promise<unknown> {
    return apiClient.post("/docs_sales/", [{ ...data, post: true }]);
  },
};
