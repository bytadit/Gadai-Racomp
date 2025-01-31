import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Card } from '@/components/ui/card'; // Assuming you have a Card component for styling
import { SpokeSpinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

type CustomerCardProps = {
    customer: {
        id: number;
        name: string;
        nik: string;
        status: 'AMAN' | 'FAVORIT' | 'RISIKO' | 'MASALAH';
        gender: string;
        address: string;
        items: any[];
    };
    onClick: () => void;
    isSelected?: boolean;
    isSelecting?: boolean; // New prop for tracking the selecting state
};

const CustomerCard: React.FC<CustomerCardProps> = ({
    customer,
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
                <h3 className="text-lg font-semibold">{customer.name}</h3>
                <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-1">
                        <p>
                            <strong>NIK</strong>
                        </p>
                    </div>
                    <div className="col-span-5">
                        {': '}
                        {customer.nik}
                    </div>
                    <div className="col-span-1">
                        <p>
                            <strong>Gender</strong>
                        </p>
                    </div>
                    <div className="col-span-5">
                        {': '}
                        {customer.gender}
                    </div>
                    <div className="col-span-1">
                        <p>
                            <strong>Status</strong>
                        </p>
                    </div>
                    <div className="col-span-5">
                        {': '}
                        <Badge variant={customer.status}>
                            {customer.status}
                        </Badge>
                    </div>
                    <div className="col-span-1">
                        <p>
                            <strong>Alamat</strong>
                        </p>
                    </div>
                    <div className="col-span-5">
                        {': '}
                        {customer.address}
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

export default CustomerCard;
