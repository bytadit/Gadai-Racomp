import { useEffect, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CircleCheck, Info, List, OctagonX, Plus } from 'lucide-react';

type CompleteStepProps = {
    handleReset: () => void;
    status: 'success' | 'error' | null;
};

const CompleteStep = ({ handleReset, status }: CompleteStepProps) => {
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(5);
    const router = useRouter();

    useEffect(() => {
        const storedTransactionId = localStorage.getItem('transactionId');
        if (storedTransactionId) {
            setTransactionId(storedTransactionId);
        }
    }, []);

    // Countdown effect with redirect
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && transactionId) {
            router.push(`/dashboard/transaksi/${transactionId}`);
            router.refresh();
            handleReset();
        }
    }, [countdown, handleReset, router, transactionId]);

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center space-y-6 p-8">
                <h1 className="text-2xl font-bold text-center">Maaf!</h1>
                <p className="text-center text-lg">
                    Data Transaksi gagal disimpan!
                </p>
                <OctagonX size={200} color="red" />
                <div className="justify-center flex gap-4 space-x-4 mt-6">
                    <Button
                        className={buttonVariants({ variant: 'outline' })}
                        onClick={handleReset}
                    >
                        <span className="flex flex-row items-center gap-2">
                            {'Transaksi Baru '}
                            <Plus size={20} />
                        </span>
                    </Button>
                    <Link
                        className={buttonVariants({ variant: 'outline' })}
                        href={'/dashboard/transaksi'}
                    >
                        <span className="flex flex-row items-center gap-2">
                            {'Daftar Transaksi '}
                            <List size={20} />
                        </span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-6 p-8">
            <h1 className="text-2xl font-bold text-center">Selamat!</h1>
            <p className="text-center text-lg">
                Data Transaksi berhasil disimpan!
            </p>
            <p className="text-center text-sm text-muted-foreground">
                Dialihkan ke halaman detail dalam {countdown} detik...
            </p>
            <CircleCheck size={200} color="green" />
            <div className="justify-center text-center items-center flex flex-col sm:flex-row gap-4 mt-6">
                <Button
                    className={buttonVariants({ variant: 'outline' })}
                    onClick={handleReset}
                >
                    <span className="flex flex-row items-center gap-2">
                        {'Transaksi Baru '}
                        <Plus size={20} />
                    </span>
                </Button>
                <Link
                    className={buttonVariants({ variant: 'outline' })}
                    href={'/dashboard/transaksi'}
                    onClick={() => {
                        handleReset();
                    }}
                >
                    <span className="flex flex-row items-center gap-2">
                        {'Daftar Transaksi'}
                        <List size={20} />
                    </span>
                </Link>
                <Link
                    className={buttonVariants({ variant: 'outline' })}
                    href={`/dashboard/transaksi/${transactionId}`}
                    onClick={() => {
                        handleReset();
                    }}
                >
                    <span className="flex flex-row items-center gap-2">
                        {'Detail Transaksi '}
                        <Info size={20} />
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default CompleteStep;
