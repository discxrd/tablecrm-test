import { useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { useOrderStore } from '@/lib/stores/order-store';

export function useTableCRM() {
    const { token, isAuthenticated } = useOrderStore();

    useEffect(() => {
        if (token) {
            apiClient.setToken(token);
        } else {
            apiClient.clearToken();
        }
    }, [token]);

    return {
        isAuthenticated,
        token,
    };
}
