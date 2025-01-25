import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Card } from '@/components/ui/card'; // Assuming you have a Card component for styling
import { SpokeSpinner } from '@/components/ui/spinner';

type CustomerCardProps = {
    customer: {
        id: number;
        name: string;
        nik: string;
        status: string;
        address: string;
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
                <p>
                    <strong>NIK:</strong> {customer.nik}
                </p>
                <p>
                    <strong>Status:</strong> {customer.status}
                </p>
                <p>
                    <strong>Alamat:</strong> {customer.address}
                </p>
                {!isSelected && (
                    <Button type="button" onClick={onClick} className="mt-2">
                        <span className="flex items-center flex-row gap-2">
                            {isSelecting ? (
                                <SpokeSpinner size="sm" color="white" />
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
