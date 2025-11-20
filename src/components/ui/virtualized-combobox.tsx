'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface VirtualizedComboboxProps<T> {
    items: T[];
    value?: T;
    onValueChange: (value: T | null) => void;
    getItemId: (item: T) => string | number;
    getItemLabel: (item: T) => string;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    disabled?: boolean;
}

export function VirtualizedCombobox<T>({
    items,
    value,
    onValueChange,
    getItemId,
    getItemLabel,
    placeholder = 'Выберите...',
    searchPlaceholder = 'Поиск...',
    emptyText = 'Ничего не найдено',
    className,
    disabled = false,
}: VirtualizedComboboxProps<T>) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const parentRef = React.useRef<HTMLDivElement>(null);

    // Filter items based on search
    const filteredItems = React.useMemo(() => {
        if (!search) return items;
        const lowerSearch = search.toLowerCase();
        return items.filter((item) =>
            getItemLabel(item).toLowerCase().includes(lowerSearch)
        );
    }, [items, search, getItemLabel]);

    React.useEffect(() => {
        console.log('[VirtualizedCombobox] Items:', items.length, 'Filtered:', filteredItems.length, 'Search:', search);
    }, [items.length, filteredItems.length, search]);

    // Virtualizer
    const virtualizer = useVirtualizer({
        count: filteredItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 36,
        overscan: 5,
    });

    // Измеряем виртуализатор когда попап открывается
    React.useEffect(() => {
        if (open) {
            // Даем время попапу отрендериться и проиграть анимацию
            const timer = setTimeout(() => {
                virtualizer.measure();
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [open, virtualizer]);

    const handleSelect = (item: T) => {
        const currentId = value ? getItemId(value) : null;
        const newId = getItemId(item);

        if (currentId === newId) {
            onValueChange(null);
        } else {
            onValueChange(item);
        }
        setOpen(false);
        setSearch('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between', className)}
                    disabled={disabled}
                >
                    {value ? getItemLabel(value) : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList
                        ref={parentRef}
                        className="max-h-[300px] overflow-y-auto overflow-x-hidden"
                    >
                        {filteredItems.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {emptyText}
                            </div>
                        ) : (
                            <div
                                className="p-1"
                                style={{
                                    height: `${virtualizer.getTotalSize()}px`,
                                    width: '100%',
                                    position: 'relative',
                                }}
                            >
                                {virtualizer.getVirtualItems().map((virtualItem) => {
                                    const item = filteredItems[virtualItem.index];
                                    const itemId = getItemId(item);
                                    const isSelected = value && getItemId(value) === itemId;

                                    return (
                                        <div
                                            key={itemId}
                                            className={cn(
                                                'absolute top-0 left-0 w-full cursor-pointer px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground flex items-center rounded-sm',
                                                isSelected && 'bg-accent'
                                            )}
                                            style={{
                                                height: `${virtualItem.size}px`,
                                                transform: `translateY(${virtualItem.start}px)`,
                                            }}
                                            onClick={() => handleSelect(item)}
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4',
                                                    isSelected ? 'opacity-100' : 'opacity-0'
                                                )}
                                            />
                                            {getItemLabel(item)}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
