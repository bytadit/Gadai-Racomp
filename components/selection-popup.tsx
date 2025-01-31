// components/selection-popup.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export function SelectionPopup({ selectedRows, onDeleteSuccess }: {
    selectedRows: any[];
    onDeleteSuccess: () => void;
}) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const deletePromises = selectedRows.map(row => 
                fetch(`/api/items/${row.original.id}`, {
                    method: 'DELETE'
                })
            );

            const results = await Promise.all(deletePromises);
            const allSuccess = results.every(res => res.ok);

            if (allSuccess) {
                toast.success(`${selectedRows.length} items deleted successfully`);
                onDeleteSuccess();
            } else {
                throw new Error('Some items failed to delete');
            }
        } catch (error) {
            toast.error('Failed to delete items');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="default" className="shadow-lg">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {selectedRows.length} selected
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4">
                    <div className="space-y-4">
                        <p className="text-sm">
                            Are you sure you want to delete {selectedRows.length} item(s)?
                        </p>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}