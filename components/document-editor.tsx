import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Input } from './ui/input';
import ZoomableImage from './zoomable-image';

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
        console.log(newDocument);
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

    const onFileNameChange = (index: number, newName: string) => {
        setDocuments((prevDocuments) =>
            prevDocuments.map((doc, i) =>
                i === index
                    ? {
                          ...doc,
                          name: newName,
                          state:
                              doc.state === 'original' ? 'edited' : doc.state,
                      }
                    : doc,
            ),
        );
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
                          name: initialDocuments[i]?.name || doc.name, // Restore the initial name
                      }
                    : doc,
            ),
        );
    };

    return (
        <>
            <div className="my-10 flex justify-center gap-4 items-center flex-col">
                <div className="text-left text-2xl font-bold">
                    Dokumen {dataName}
                </div>
                <Button
                    type="button"
                    variant="default"
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
                                    className={`relative border-2 ${
                                        doc.state === 'deleted'
                                            ? 'border-red-600'
                                            : doc.state === 'new'
                                              ? 'border-green-600'
                                              : doc.state === 'edited'
                                                ? 'border-yellow-500'
                                                : 'border-gray-600' // Default border color
                                    }`}
                                >
                                    {/* Badge */}
                                    <div
                                        className={`z-10 absolute top-6 left-6 px-2 py-1 text-xs font-semibold text-white rounded ${
                                            doc.state === 'deleted'
                                                ? 'bg-red-600'
                                                : doc.state === 'new'
                                                  ? 'bg-green-600'
                                                  : doc.state === 'edited'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-transparent' // Default badge color
                                        }`}
                                    >
                                        {doc.state === 'deleted'
                                            ? 'Dihapus'
                                            : doc.state === 'new'
                                              ? 'Baru'
                                              : doc.state === 'edited'
                                                ? 'Diubah'
                                                : ''}
                                    </div>
                                    <div className="z-10 absolute top-6 right-6">
                                        <ZoomableImage
                                            src={doc.doc_url}
                                            alt={doc.name}
                                        />
                                    </div>
                                    <CardContent className="flex flex-col aspect-square items-center justify-center p-4">
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
                                        <Input
                                            type="text"
                                            className={`mt-2 ${doc.state === 'deleted' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            readOnly={doc.state === 'deleted'} // Make input readonly if state is 'deleted'
                                            placeholder="Nama file"
                                            value={doc.name || ''}
                                            onChange={(e) =>
                                                onFileNameChange(
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </CardContent>
                                    <CardFooter className="flex items-center mx-auto text-center justify-center gap-1">
                                        {doc.state !== 'deleted' && (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
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
                                                        className="size-1"
                                                        aria-hidden="true"
                                                    />
                                                    Ganti
                                                </Button>

                                                {doc.state === 'edited' && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="order-1"
                                                        onClick={() =>
                                                            handleUndo(index)
                                                        }
                                                    >
                                                        <span className="sr-only">
                                                            Undo Action
                                                        </span>
                                                        <Undo2
                                                            className="size-1"
                                                            aria-hidden="true"
                                                        />
                                                        Undo
                                                    </Button>
                                                )}
                                            </>
                                        )}

                                        {doc.state === 'deleted' ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="order-1"
                                                onClick={() =>
                                                    handleUndo(index)
                                                }
                                            >
                                                <span className="sr-only">
                                                    Undo Action
                                                </span>
                                                <Undo2
                                                    className="size-1"
                                                    aria-hidden="true"
                                                />
                                                Undo
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="order-3"
                                                onClick={() =>
                                                    handleDeleteFile(index)
                                                }
                                            >
                                                <Trash
                                                    className="size-1"
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
