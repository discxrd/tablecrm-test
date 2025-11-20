'use client';

import { LogOut } from 'lucide-react';
import { useOrderStore } from '@/lib/stores/order-store';
import { Button } from '@/components/ui/button';

interface HeaderProps {
    onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
    const { resetOrder } = useOrderStore();

    const handleLogout = () => {
        resetOrder();
        onLogout();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-14 items-center justify-between px-4">
                <h1 className="font-semibold text-sm">Создание заказа</h1>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                </Button>
            </div>
        </header>
    );
}
