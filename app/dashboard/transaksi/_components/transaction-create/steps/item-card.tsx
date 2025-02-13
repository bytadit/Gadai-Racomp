import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Card } from '@/components/ui/card'; // Assuming you have a Card component for styling
import { SpokeSpinner } from '@/components/ui/spinner';
import { formatToIndonesianCurrency } from '@/lib/utils';
// import { Badge } from '@/components/ui/badge';

type ItemCardProps = {
    item: {
        id: number;
        name: string;
        item_status: 'MASUK' | 'KELUAR' |'DIJUAL';
        type: 'KENDARAAN' | 'OTHER';
        brand: string;
        serial: string | null;
        year: number | undefined;
        value: number | 0;
        desc: string;
        // items: any[];
    };
    onClick: () => void;
    isSelected?: boolean;
    isSelecting?: boolean; // New prop for tracking the selecting state
};

const ItemCard: React.FC<ItemCardProps> = ({
    item,
    onClick,
    isSelected = false,
    isSelecting = false, // New prop for tracking the selecting state
}) => {
    return (
        <Card
            className={`p-4 my-2 border rounded-md shadow-md hover:shadow-lg ${isSelected ? 'bg-secondary border-2 border-green-500' : ''}`}
            onClick={onClick}
        >
            <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <div className="grid grid-cols-7 gap-2">
                    <div className="col-span-3">
                        <p>
                            <strong>Tipe</strong>
                        </p>
                    </div>
                    <div className="col-span-4">
                        {': '}
                        {item.type}
                    </div>
                    <div className="col-span-3">
                        <p>
                            <strong>Status</strong>
                        </p>
                    </div>
                    <div className="col-span-4">
                        {': '}
                        {item.item_status}
                    </div>
                    <div className="col-span-3">
                        <p>
                            <strong>Merek</strong>
                        </p>
                    </div>
                    <div className="col-span-4">
                        {': '}
                        {item.brand}
                    </div>
                    <div className="col-span-3">
                        <p>
                            <strong>Serial/NoPol</strong>
                        </p>
                    </div>
                    <div className="col-span-4">
                        {': '}
                        {item.serial}
                    </div>
                    <div className="col-span-3">
                        <p>
                            <strong>Tahun</strong>
                        </p>
                    </div>
                    <div className="col-span-4">
                        {': '}
                        {item.year ?? 0}
                    </div>
                    <div className="col-span-3">
                        <p>
                            <strong>Nilai</strong>
                        </p>
                    </div>
                    <div className="col-span-4">
                        {': '}
                        {formatToIndonesianCurrency(item.value)}
                    </div>
                    <div className="col-span-3">
                        <p>
                            <strong>Deskripsi</strong>
                        </p>
                    </div>
                    <div className="col-span-4">
                        {': '}
                        {item.desc}
                    </div>
                </div>
                {!isSelected && (
                    <Button type="button" onClick={onClick} className="mt-2">
                        <span className="flex items-center flex-row gap-2">
                            {isSelecting ? (
                                <span className="text-muted-foreground items-center flex flex-row gap-1">
                                    <SpokeSpinner size="sm" />
                                    {' Memilih...'}
                                </span>
                            ) : (
                                'Pilih'
                            )}
                        </span>
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default ItemCard;
