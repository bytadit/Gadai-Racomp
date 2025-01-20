import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Active, DataRef, Over } from '@dnd-kit/core';
import { ColumnDragData } from '@/app/dashboard/kanban/_components/board-column';
import { TaskDragData } from '@/app/dashboard/kanban/_components/task-card';

type DraggableData = ColumnDragData | TaskDragData;

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function hasDraggableData<T extends Active | Over>(
    entry: T | null | undefined,
): entry is T & {
    data: DataRef<DraggableData>;
} {
    if (!entry) {
        return false;
    }

    const data = entry.data.current;

    if (data?.type === 'Column' || data?.type === 'Task') {
        return true;
    }

    return false;
}

export function formatBytes(
    bytes: number,
    opts: {
        decimals?: number;
        sizeType?: 'accurate' | 'normal';
    } = {},
) {
    const { decimals = 0, sizeType = 'normal' } = opts;

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
        sizeType === 'accurate'
            ? (accurateSizes[i] ?? 'Bytest')
            : (sizes[i] ?? 'Bytes')
    }`;
}

export const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const formatter = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
    return formatter.format(date);
};
export const getAge = (dateStr: string) => {
    const today = new Date();
    const birthDate = new Date(dateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};
export const convertToIndonesianPhone = (phoneNumber: string): string => {
    if (phoneNumber.startsWith('0')) {
        return `62${phoneNumber.slice(1)}`;
    }
    return phoneNumber; // Return unchanged if it doesn't start with 0
};
