'use client';
import { Button } from '../button';

type DataTableResetFilterProps = {
    isFilterActive: boolean;
    onReset: () => void;
    classname: string;
};

export function DataTableResetFilter({
    isFilterActive,
    onReset,
    classname,
}: DataTableResetFilterProps) {
    return (
        <>
            {isFilterActive ? (
                <Button
                    variant="outline"
                    size={'sm'}
                    onClick={onReset}
                    className={classname}
                >
                    Reset Filters
                </Button>
            ) : null}
        </>
    );
}
