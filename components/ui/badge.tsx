import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
                secondary:
                    'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
                destructive:
                    'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
                outline: 'text-foreground',
                AMAN: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                FAVORIT:
                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                RISIKO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                MASALAH:
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                BERJALAN:
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                SELESAI:
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                TERLAMBAT:
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                BERMASALAH:
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                DIJUAL: 'bg-gray-100 text-gray-800 dark:bg-gray-500 dark:text-gray-300',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export type BadgeProps = {} & React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
