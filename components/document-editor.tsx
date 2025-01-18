import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { AspectRatio } from './ui/aspect-ratio';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Plus, Trash, Undo2, UploadIcon } from 'lucide-react';

type DocumentType = 'FOTO' | 'DOKUMEN';

type DocumentState = 'original' | 'new' | 'edited' | 'deleted';

type CustomerDocument = {
    id?: number; // ID from the database
    name: string;
    doc_type: DocumentType;
    doc_url?: string; // URL for existing documents
    file?: File; // File object for new or edited documents
    state: DocumentState; // Tracks the state of the document
};

type DocumentEditorProps = {
    dataName: string;
    initialDocuments: CustomerDocument[];
    onDocumentsChange: (documents: {
        newDocuments: CustomerDocument[];
        editedDocuments: CustomerDocument[];
        deletedDocuments: CustomerDocument[];
    }) => void;
};

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
    dataName,
    initialDocuments,
    onDocumentsChange,
}) => {
    const [documents, setDocuments] =
        React.useState<CustomerDocument[]>(initialDocuments);

    React.useEffect(() => {
        // Update external state whenever documents change
        const newDocuments = documents.filter((doc) => doc.state === 'new');
        const editedDocuments = documents.filter(
            (doc) => doc.state === 'edited',
        );
        const deletedDocuments = documents.filter(
            (doc) => doc.state === 'deleted',
        );

        onDocumentsChange({ newDocuments, editedDocuments, deletedDocuments });
    }, [documents, onDocumentsChange]);

    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const handleButtonClick = () => {
        // Trigger the hidden input click
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleAddFile(file);
        }
    };

    const handleAddFile = (file: File) => {
        const previewUrl = URL.createObjectURL(file);

        const newDocument: CustomerDocument = {
            name: file.name,
            doc_type: 'FOTO', // Default document type, can be customized
            file,
            state: 'new',
            doc_url: previewUrl, // Temporary URL for preview
        };
        setDocuments((prev) => [newDocument, ...prev]);
    };

    const handleEditFile = (index: number, file: File) => {
        setDocuments((prev) =>
            prev.map((doc, i) =>
                i === index
                    ? {
                          ...doc,
                          file,
                          state: doc.state === 'new' ? 'new' : 'edited', // Keep 'new' state for new documents
                          doc_url: URL.createObjectURL(file), // Update the preview URL
                      }
                    : doc,
            ),
        );
    };

    const handleDeleteFile = (index: number) => {
        setDocuments((prev) => {
            const updatedDocuments = [...prev];
            const doc = updatedDocuments[index];

            if (doc.state === 'new') {
                // Remove new document
                updatedDocuments.splice(index, 1);
            } else {
                // Mark existing document as deleted
                updatedDocuments[index] = { ...doc, state: 'deleted' };
            }

            return updatedDocuments;
        });
    };

    const handleUndo = (index: number) => {
        setDocuments((prev) =>
            prev.map((doc, i) =>
                i === index
                    ? {
                          ...doc,
                          file: initialDocuments[i]?.file || doc.file, // Restore the initial file for edited documents
                          state: 'original', // Revert to the initial state
                          doc_url: initialDocuments[i]?.doc_url || doc.doc_url, // Restore the initial URL
                      }
                    : doc,
            ),
        );
    };

    return (
        <>
            <div className="mb-8 flex justify-between gap-4 items-center">
                <div className="font-semibold text-xl leading-none tracking-tight">
                    Dokumen {dataName}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleButtonClick}
                >
                    Tambah
                    <Plus className="size-4" aria-hidden="true" />
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
            <div className="flex flex-col gap-4 text-center items-center">
                <Carousel
                    opts={{
                        align: 'start',
                    }}
                    className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl mb-6"
                >
                    <CarouselContent>
                        {documents.map((doc, index) => (
                            <CarouselItem
                                key={index + 1}
                                className={cn('', {
                                    'md:basis-1/2': documents.length === 2,
                                    'md:basis-1/3': documents.length > 2,
                                })}
                            >
                                <Card
                                    key={index}
                                    className={`relative border ${
                                        doc.state === 'deleted'
                                            ? 'border-red-600'
                                            : doc.state === 'new'
                                              ? 'border-green-600'
                                              : doc.state === 'edited'
                                                ? 'border-yellow-500'
                                                : 'border-gray-600' // Default border color
                                    }`}
                                >
                                    <CardContent className="flex aspect-square items-center justify-center p-4">
                                        {doc.doc_type === 'FOTO' ? (
                                            doc.doc_url ? (
                                                <AspectRatio className="bg-muted">
                                                    <Image
                                                        src={doc.doc_url}
                                                        alt={doc.name}
                                                        fill
                                                        className={`h-full w-full rounded-md object-cover ${
                                                            doc.state ===
                                                            'deleted'
                                                                ? 'opacity-10'
                                                                : ''
                                                        }`}
                                                    />
                                                </AspectRatio>
                                            ) : (
                                                <span>
                                                    No Preview Available
                                                </span>
                                            )
                                        ) : doc.doc_type === 'DOKUMEN' ? (
                                            doc.doc_url ? (
                                                <a
                                                    href={doc.doc_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`block ${
                                                        doc.state === 'deleted'
                                                            ? 'opacity-50'
                                                            : ''
                                                    }`}
                                                >
                                                    View Document
                                                </a>
                                            ) : (
                                                <span>
                                                    No Document Available
                                                </span>
                                            )
                                        ) : (
                                            <span>Unsupported Type</span>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex items-center mx-auto text-center justify-center gap-2">
                                        {doc.state !== 'deleted' && (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="order-2"
                                                    onClick={() => {
                                                        // Trigger file input dialog
                                                        const fileInput =
                                                            document.createElement(
                                                                'input',
                                                            );
                                                        fileInput.type = 'file';
                                                        fileInput.onchange = (
                                                            e,
                                                        ) => {
                                                            const file = (
                                                                e.target as HTMLInputElement
                                                            )?.files?.[0];
                                                            if (file)
                                                                handleEditFile(
                                                                    index,
                                                                    file,
                                                                );
                                                        };
                                                        fileInput.click();
                                                    }}
                                                >
                                                    <UploadIcon
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                    Ganti
                                                </Button>

                                                {doc.state === 'edited' && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="order-1"
                                                        onClick={() =>
                                                            handleUndo(index)
                                                        }
                                                    >
                                                        <span className="sr-only">
                                                            Undo Action
                                                        </span>
                                                        <Undo2 />
                                                        Batal Ganti
                                                    </Button>
                                                )}
                                            </>
                                        )}

                                        {doc.state === 'deleted' ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="order-1"
                                                onClick={() =>
                                                    handleUndo(index)
                                                }
                                            >
                                                <span className="sr-only">
                                                    Undo Action
                                                </span>
                                                <Undo2 />
                                                Batal Hapus
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="order-3"
                                                onClick={() =>
                                                    handleDeleteFile(index)
                                                }
                                            >
                                                <Trash
                                                    className="size-4 "
                                                    aria-hidden="true"
                                                />
                                                <span className="sr-only">
                                                    Remove file
                                                </span>
                                                Hapus
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <>
                        {/* Always render buttons on mobile, conditionally render on larger screens */}
                        <div
                            className={cn('flex', {
                                'md:hidden flex': documents.length <= 3,
                            })}
                        >
                            <CarouselPrevious />
                            <CarouselNext />
                        </div>
                    </>
                </Carousel>
            </div>
        </>
    );
};
