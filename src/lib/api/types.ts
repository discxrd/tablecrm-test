// TableCRM API Types

export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}

export interface Contragent {
    id: number;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    inn?: string;
    kpp?: string;
    loyality_card_id?: number;
}

export interface Warehouse {
    id: number;
    name: string;
    address?: string;
    is_active?: boolean;
}

export interface Paybox {
    id: number;
    name: string;
    type: string;
    is_active?: boolean;
}

export interface Organization {
    id: number;
    name: string;
    inn?: string;
    kpp?: string;
    is_active?: boolean;
}

export interface PriceType {
    id: number;
    name: string;
    is_default: boolean;
}

export interface Unit {
    id: number;
    name: string;
    short_name: string;
}

export interface Nomenclature {
    id: number;
    name: string;
    article?: string;
    barcode?: string;
    price: number;
    unit: number;
    unit_name?: string;
    stock_quantity?: number;
    image_url?: string;
}

export interface OrderGood {
    nomenclature: number;
    quantity: number;
    unit: number;
    price: number;
    discount: number;
    sum_discounted: number;
}

export interface CreateOrderPayload {
    priority: number;
    dated: number; // Unix timestamp
    operation: string;
    tax_included: boolean;
    tax_active: boolean;
    goods: OrderGood[];
    settings: Record<string, unknown>;
    loyality_card_id?: number;
    warehouse: number;
    contragent: number;
    paybox: number;
    organization: number;
    price_type?: number;
    comment?: string;
    status: boolean;
    paid_rubles: number | string;
    paid_lt: number;
    sum?: number | string;
}

export interface ContragentSearchParams {
    phone?: string;
    name?: string;
    limit?: number;
    offset?: number;
}

export interface NomenclatureSearchParams {
    search?: string;
    warehouse_id?: number;
    limit?: number;
    offset?: number;
}
