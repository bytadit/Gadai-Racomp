import { useEffect, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';

// import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { CircleCheck, Info, List, Plus } from 'lucide-react';
import { useStepper } from '../itemStepper';

const CompleteStep = () => {
    const [itemId, setItemId] = useState<string | null>(null);

    useEffect(() => {
        const storedItemId = localStorage.getItem('itemId');
        if (storedItemId) {
            setItemId(storedItemId);
        }
    }, []);

    // const handleReset = () => {
    //     const stepper = useStepper();
    //     localStorage.removeItem('itemId');
    //     setItemId(null);
    //     stepper.reset();
    // };

    return (
        <div className="flex flex-col items-center justify-center space-y-6 p-8">
            <h1 className="text-2xl font-bold text-center">Selamat!</h1>
            <p className="text-center text-lg">
                Data Barang berhasil disimpan!
            </p>
            <CircleCheck size={200} color="green" />
            <div className="justify-center flex gap-4 space-x-4 mt-6">
                {/* <Button
                    className={buttonVariants({ variant: 'outline' })}
                    onClick={() => {
                        handleReset();
                    }}
                >
                    <span className="flex flex-row items-center gap-2">
                        {'Barang Baru '}
                        <Plus size={20} />
                    </span>
                </Button> */}
                <Link
                    className={buttonVariants({ variant: 'outline' })}
                    href={'/dashboard/barang'}
                >
                    <span className="flex flex-row items-center gap-2">
                        {'Daftar Barang '}
                        <List size={20} />
                    </span>
                </Link>
                <Link
                    className={buttonVariants({ variant: 'outline' })}
                    href={`/dashboard/barang/${itemId}`}
                >
                    <span className="flex flex-row items-center gap-2">
                        {'Detail Barang '}
                        <Info size={20} />
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default CompleteStep;
