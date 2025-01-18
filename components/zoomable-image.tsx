import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { DetailedHTMLProps, ImgHTMLAttributes, useState } from 'react';
import { ScanEye, X } from 'lucide-react'; // For the close button
import { Button } from './ui/button';

export default function ZoomableImage({
    src,
    alt,
    className,
}: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
    const [isOpen, setIsOpen] = useState(false);

    if (!src) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="default"
                    className="bg-gray-300 flex items-center justify-center rounded-md px-3 py-1 text-white hover:bg-primary-dark"
                    aria-label="View Document"
                >
                    <ScanEye className="h-6 w-6" color="black" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl border-0 bg-transparent p-0">
                <div className="relative h-[calc(100vh-20px)] w-full overflow-clip rounded-md bg-transparent shadow-md">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-2 right-2 z-50 rounded-full bg-white p-1 hover:bg-gray-200"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5 text-black" />
                    </button>
                    <Image
                        src={src}
                        alt={alt || ''}
                        fill
                        className="h-full w-full object-contain"
                        sizes="100vw"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
