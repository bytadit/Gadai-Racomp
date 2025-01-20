'use client';

import { Trash, Undo2, UploadIcon } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import Dropzone, {
    type DropzoneProps,
    type FileRejection,
} from 'react-dropzone';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useControllableState } from '@/hooks/use-controllable-state';
import { cn, formatBytes } from '@/lib/utils';
import { Input } from './ui/input';

type FileUploaderProps = {
    value?: { file: File; fileName: string }[];
    onValueChange?: React.Dispatch<
        React.SetStateAction<{ file: File; fileName: string }[]>
    >;
    onUpload?: (files: { file: File; fileName: string }[]) => Promise<void>;
    progresses?: Record<string, number>;
    accept?: DropzoneProps['accept'];
    maxSize?: DropzoneProps['maxSize'];
    maxFiles?: DropzoneProps['maxFiles'];
    multiple?: boolean;
    disabled?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

type FileWithFileName = {
    file: File;
    fileName: string;
    preview?: string; // Add preview to the type
};

export function FileUploader(props: FileUploaderProps) {
    const {
        value: valueProp,
        onValueChange,
        onUpload,
        progresses,
        accept = { 'image/*': [] },
        maxSize = 1024 * 1024 * 2,
        maxFiles = 1,
        multiple = false,
        disabled = false,
        className,
        ...dropzoneProps
    } = props;

    const [files, setFiles] = useControllableState<FileWithFileName[]>({
        prop: valueProp ?? [],
        onChange: props.onValueChange,
    });
    const [editingFileIndex, setEditingFileIndex] = React.useState<
        number | null
    >(null);
    const initialFilesRef = React.useRef<FileWithFileName[]>(valueProp || []);

    const handleEditFile = (index: number) => {
        if (!files || files.length <= index) return;
        // setPreviousFile(files[index]);
        setEditingFileIndex(index);

        // Simulate a file selection dialog
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = props.accept ? Object.keys(props.accept).join(',') : '*';
        input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files[0]) {
                const newFile = target.files[0];
                const updatedFiles = [...files];
                updatedFiles[index] = {
                    ...updatedFiles[index],
                    file: newFile,
                    fileName: newFile.name,
                    preview: URL.createObjectURL(newFile),
                };
                setFiles(updatedFiles);
                setEditingFileIndex(index);
            }
        };
        input.click();
    };

    const handleUndoEdit = () => {
        if (editingFileIndex !== null) {
            if (!files || files.length <= editingFileIndex) return; // Ensure files is defined and index is valid
            const updatedFiles = [...files];
            const initialFile =
                initialFilesRef.current[editingFileIndex] || null;
            if (initialFile) {
                updatedFiles[editingFileIndex] = initialFile;
            } else {
                // Remove the file if the initial state was no file
                updatedFiles.splice(editingFileIndex, 1);
            }
            // updatedFiles[editingFileIndex] = previousFile;
            setFiles(updatedFiles);
            setEditingFileIndex(null);
            // setPreviousFile(null);
        }
    };

    const onDrop = React.useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            if (!multiple && maxFiles === 1 && acceptedFiles.length > 1) {
                toast.error('Cannot upload more than 1 file at a time');
                return;
            }

            if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
                toast.error(`Cannot upload more than ${maxFiles} files`);
                return;
            }
            const newFiles = acceptedFiles.map(
                (file) =>
                    Object.assign({
                        file,
                        preview: URL.createObjectURL(file),
                        fileName: file.name || '',
                    }) as FileWithFileName,
            );

            const updatedFiles = files ? [...files, ...newFiles] : newFiles;

            setFiles(updatedFiles);

            if (rejectedFiles.length > 0) {
                rejectedFiles.forEach(({ file }) => {
                    toast.error(`File ${file.name} was rejected`);
                });
            }

            if (
                onUpload &&
                updatedFiles.length > 0 &&
                updatedFiles.length <= maxFiles
            ) {
                const target =
                    updatedFiles.length > 0
                        ? `${updatedFiles.length} files`
                        : `file`;

                toast.promise(onUpload(updatedFiles), {
                    loading: `Uploading ${target}...`,
                    success: () => {
                        setFiles([]);
                        return `${target} uploaded`;
                    },
                    error: `Failed to upload ${target}`,
                });
            }
        },

        [files, maxFiles, multiple, onUpload, setFiles],
    );

    function onUpdateFileName(index: number, newName: string) {
        if (!files) return;
        const updatedFiles = files.map((file, i) =>
            i === index ? { ...file, fileName: newName } : file,
        );
        setFiles(updatedFiles);
        onValueChange?.(updatedFiles);
    }

    function onRemove(index: number) {
        if (!files) return;
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onValueChange?.(newFiles);
    }

    // // Revoke preview url when component unmounts
    React.useEffect(() => {
        return () => {
            if (!files) return;
            files.forEach((file) => {
                if (isFileWithPreview(file)) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, []);

    const isDisabled = disabled || (files?.length ?? 0) >= maxFiles;

    return (
        <div className="relative flex flex-col gap-6 overflow-hidden">
            <Dropzone
                onDrop={onDrop}
                accept={accept}
                maxSize={maxSize}
                maxFiles={maxFiles}
                multiple={maxFiles > 1 || multiple}
                disabled={isDisabled}
            >
                {({ getRootProps, getInputProps, isDragActive }) => (
                    <div
                        {...getRootProps()}
                        className={cn(
                            'group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25',
                            'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            isDragActive && 'border-muted-foreground/50',
                            isDisabled && 'pointer-events-none opacity-60',
                            className,
                        )}
                        {...dropzoneProps}
                    >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                                <div className="rounded-full border border-dashed p-3">
                                    <UploadIcon
                                        className="size-7 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                </div>
                                <p className="font-medium text-muted-foreground">
                                    Drop the files here
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                                <div className="rounded-full border border-dashed p-3">
                                    <UploadIcon
                                        className="size-7 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="space-y-px">
                                    <p className="font-medium text-muted-foreground">
                                        Tarik file atau klik area ini untuk
                                        memilih file...
                                    </p>
                                    <p className="text-sm text-muted-foreground/70">
                                        Anda dapat mengunggah maksimal
                                        {maxFiles > 1
                                            ? ` ${maxFiles === Infinity ? 'beberapa' : maxFiles}
                      file (${formatBytes(maxSize)} total)`
                                            : ` satu file maksimal ${formatBytes(maxSize)}`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Dropzone>
            {files?.length ? (
                <ScrollArea className="h-fit w-full">
                    <div className="max-h-48 space-y-4">
                        {files?.map((file, index) => {
                            const hasUndo =
                                initialFilesRef.current[index] !== undefined; // Show Undo only if there's an initial file
                            return (
                                <FileCard
                                    key={index}
                                    file={file}
                                    onRemove={() => onRemove(index)}
                                    progress={progresses?.[file.file.name]}
                                    onFileNameChange={(newName) =>
                                        onUpdateFileName(index, newName)
                                    }
                                    onEditFile={() => handleEditFile(index)}
                                    hasUndo={hasUndo}
                                    onUndoEdit={
                                        editingFileIndex === index
                                            ? handleUndoEdit
                                            : () => {}
                                    }
                                />
                            );
                        })}
                    </div>
                </ScrollArea>
            ) : null}
        </div>
    );
}

type FileCardProps = {
    file: FileWithFileName;
    onRemove: () => void;
    onFileNameChange: (newName: string) => void;
    onEditFile: () => void;
    onUndoEdit: () => void;
    progress?: number;
    hasUndo: boolean;
};

function FileCard({
    file,
    progress,
    onRemove,
    onFileNameChange,
    onEditFile,
    onUndoEdit,
    hasUndo,
}: FileCardProps) {
    return (
        <div className="relative flex items-center space-x-4">
            <div className="flex flex-1 space-x-4">
                {isFileWithPreview(file) ? (
                    <Image
                        src={file.preview}
                        alt={file.file.name}
                        width={48}
                        height={48}
                        loading="lazy"
                        className="aspect-square shrink-0 rounded-md object-cover"
                    />
                ) : null}
                <div className="flex w-full flex-col gap-2">
                    <div className="grid grid-cols-12">
                        <div className="italic col-span-10 line-clamp-1 text-xs text-muted-foreground">
                            {file.file.name}
                        </div>
                        <div className="fw-bold col-span-2 text-xs text-muted-foreground text-end">
                            {formatBytes(file.file.size)}
                        </div>
                    </div>
                    <Input
                        type="text"
                        className="my-1"
                        placeholder="Nama file"
                        value={file.fileName || ''}
                        onChange={(e) => onFileNameChange(e.target.value)}
                    />{' '}
                    {progress ? <Progress value={progress} /> : null}
                </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
                {onUndoEdit && hasUndo && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 mt-6 order-1"
                        onClick={onUndoEdit}
                    >
                        <span className="sr-only">Undo edit</span>
                        <Undo2 />
                    </Button>
                )}
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8 mt-6 order-3"
                    onClick={onRemove}
                >
                    <Trash className="size-4 " aria-hidden="true" />
                    <span className="sr-only">Remove file</span>
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8 mt-6 order-2"
                    onClick={onEditFile}
                >
                    <UploadIcon className="size-4 " aria-hidden="true" />
                    <span className="sr-only">Edit file</span>
                </Button>
            </div>
        </div>
    );
}

function isFileWithPreview(
    file: unknown,
): file is FileWithFileName & { preview: string } {
    return typeof file === 'object' && file != null && 'preview' in file;
}
