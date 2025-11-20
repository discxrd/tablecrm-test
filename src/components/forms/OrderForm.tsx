import { useEffect } from 'react';
import { useOrderStore } from '@/lib/stores/order-store';
import { Label } from '@/components/ui/label';
import { VirtualizedCombobox } from '@/components/ui/virtualized-combobox';
import { ClientSearch } from './ClientSearch';
import { ProductSelector } from './ProductSelector';
import { Loader2 } from 'lucide-react';
import { useOrganizations, usePayboxes, usePriceTypes, useWarehouses } from '@/hooks/use-api';

export function OrderForm() {
    const {
        warehouse,
        paybox,
        organization,
        priceType,
        setWarehouse,
        setPaybox,
        setOrganization,
        setPriceType,
    } = useOrderStore();

    const { data: warehouses = [], isLoading: isLoadingWarehouses } =
        useWarehouses();
    const { data: payboxes = [], isLoading: isLoadingPayboxes } = usePayboxes();
    const { data: organizations = [], isLoading: isLoadingOrganizations } =
        useOrganizations();
    const { data: priceTypes = [], isLoading: isLoadingPriceTypes } =
        usePriceTypes();

    const isLoading =
        isLoadingWarehouses ||
        isLoadingPayboxes ||
        isLoadingOrganizations ||
        isLoadingPriceTypes;

    // Auto-select first options if available
    useEffect(() => {
        if (!warehouse && warehouses.length > 0) {
            setWarehouse(warehouses[0]);
        }
    }, [warehouse, warehouses, setWarehouse]);

    useEffect(() => {
        if (!paybox && payboxes.length > 0) {
            setPaybox(payboxes[0]);
        }
    }, [paybox, payboxes, setPaybox]);

    useEffect(() => {
        if (!organization && organizations.length > 0) {
            setOrganization(organizations[0]);
        }
    }, [organization, organizations, setOrganization]);

    useEffect(() => {
        if (!priceType && priceTypes.length > 0) {
            const defaultPrice = priceTypes.find((pt) => pt.is_default);
            setPriceType(defaultPrice || priceTypes[0]);
        }
    }, [priceType, priceTypes, setPriceType]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ClientSearch />

            <div className="space-y-3">
                <Label>Счет поступления</Label>
                <VirtualizedCombobox
                    items={payboxes}
                    value={paybox || undefined}
                    onValueChange={setPaybox}
                    getItemId={(item) => item.id}
                    getItemLabel={(item) => item.name}
                    placeholder="Выберите счет"
                    searchPlaceholder="Поиск счета..."
                />
            </div>

            <div className="space-y-3">
                <Label>Организация</Label>
                <VirtualizedCombobox
                    items={organizations}
                    value={organization || undefined}
                    onValueChange={setOrganization}
                    getItemId={(item) => item.id}
                    getItemLabel={(item) => item.name || `Организация #${item.id}`}
                    placeholder="Выберите организацию"
                    searchPlaceholder="Поиск организации..."
                />
            </div>

            <div className="space-y-3">
                <Label>Склад отгрузки</Label>
                <VirtualizedCombobox
                    items={warehouses}
                    value={warehouse || undefined}
                    onValueChange={setWarehouse}
                    getItemId={(item) => item.id}
                    getItemLabel={(item) => item.name}
                    placeholder="Выберите склад"
                    searchPlaceholder="Поиск склада..."
                />
            </div>

            <div className="space-y-3">
                <Label>Тип цен</Label>
                <VirtualizedCombobox
                    items={priceTypes}
                    value={priceType || undefined}
                    onValueChange={setPriceType}
                    getItemId={(item) => item.id}
                    getItemLabel={(item) => item.name}
                    placeholder="Выберите тип цен"
                    searchPlaceholder="Поиск типа цен..."
                />
            </div>

            <ProductSelector />
        </div>
    );
}
