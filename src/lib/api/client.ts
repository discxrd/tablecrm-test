import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const BASE_URL = 'https://app.tablecrm.com/api/v1';

class TableCRMClient {
    private client: AxiosInstance;
    private token: string | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to attach token
        this.client.interceptors.request.use((config) => {
            console.log('[API Client] Request:', config.url, 'Token:', this.token ? 'SET' : 'NOT SET');
            if (this.token) {
                config.params = {
                    ...config.params,
                    token: this.token,
                };
            } else {
                console.warn('[API Client] No token set for request to:', config.url);
            }
            return config;
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => {
                console.log('[API Client] Response:', response.config.url, 'Status:', response.status, 'Data:', response.data);
                return response;
            },
            (error) => {
                console.error('[API Client] Error:', error.config?.url, 'Status:', error.response?.status, 'Message:', error.message);
                if (error.response?.status === 401) {
                    console.error('Authentication failed. Please check your token.');
                }
                return Promise.reject(error);
            }
        );
    }

    setToken(token: string) {
        console.log('[API Client] Setting token:', token.substring(0, 10) + '...');
        this.token = token;
    }

    getToken(): string | null {
        console.log('[API Client] Getting token:', this.token ? 'SET' : 'NOT SET');
        return this.token;
    }

    clearToken() {
        console.log('[API Client] Clearing token');
        this.token = null;
    }

    async get<T>(url: string, config?: AxiosRequestConfig) {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig) {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }
}

// Singleton instance
export const apiClient = new TableCRMClient();
