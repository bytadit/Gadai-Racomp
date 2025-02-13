'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from './label';

type ComboboxProps<T> = {
    items: T[];
    value: T | null;
    label?: string;
    onSelect: (item: T) => void;
    onSearch: (query: string) => void;
    placeholder: string;
    displayValue: (item: T | null) => string;
    disabled?: boolean;
};

export function Combobox<T>({
    items,
    value,
    label,
    onSelect,
    onSearch,
    placeholder,
    displayValue,
    disabled = false,
}: ComboboxProps<T>) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="flex flex-col space-y-2">
            <Label>{label}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={disabled}
                    >
                        {value ? displayValue(value) : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput
                            placeholder="Cari..."
                            onValueChange={onSearch}
                        />
                        <CommandList>
                            <CommandEmpty>Data tidak ditemukan.</CommandEmpty>
                            <CommandGroup>
                                {items.map((item, index) => (
                                    <CommandItem
                                        key={index}
                                        onSelect={() => {
                                            onSelect(item);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                value === item
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                        />
                                        {displayValue(item)}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
