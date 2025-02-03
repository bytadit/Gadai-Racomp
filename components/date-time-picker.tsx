'use client';

import * as React from 'react';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type DateTimePickerProps = {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    isDisabled: boolean;
};

export function DateTimePicker({
    selectedDate,
    setSelectedDate,
    isDisabled = false,
}: DateTimePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    // Convert the stored date into a local Date.
    // (When stored, the Date is in UTC, but new Date(utcDate) shows local time.)
    const localDate = new Date(selectedDate);

    // Compute the "display hour" in 12-hour format.
    const displayHour =
        localDate.getHours() % 12 === 0 ? 12 : localDate.getHours() % 12;
    const isPM = localDate.getHours() >= 12;

    // Prepare the hours array. (Avoid mutating the original by using a copy.)
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const reversedHours = [...hours].reverse();

    const handleTimeChange = (
        type: 'hour' | 'minute' | 'ampm',
        value: string,
    ) => {
        // Work on a copy so we don’t modify the existing date.
        const newDate = new Date(localDate);

        if (type === 'hour') {
            // The sample uses: newHour = (parsedHour % 12) + (currentHour >= 12 ? 12 : 0)
            // Note: 12 % 12 gives 0 so that correctly maps 12 AM/PM.
            const newHour =
                (parseInt(value, 10) % 12) +
                (newDate.getHours() >= 12 ? 12 : 0);
            newDate.setHours(newHour);
        } else if (type === 'minute') {
            newDate.setMinutes(parseInt(value, 10));
        } else if (type === 'ampm') {
            // If switching to PM and current hour is less than 12, add 12.
            // If switching to AM and current hour is 12 or more, subtract 12.
            const currentHour = newDate.getHours();
            if (value === 'PM' && currentHour < 12) {
                newDate.setHours(currentHour + 12);
            } else if (value === 'AM' && currentHour >= 12) {
                newDate.setHours(currentHour - 12);
            }
        }

        // No UTC conversion is done here.
        setSelectedDate(newDate);
    };

    const handleDateSelect = (selected: Date | undefined) => {
        if (selected) {
            // Change only the date part, but keep the time part from localDate.
            const newDate = new Date(selected);
            newDate.setHours(localDate.getHours());
            newDate.setMinutes(localDate.getMinutes());
            newDate.setSeconds(localDate.getSeconds());
            newDate.setMilliseconds(localDate.getMilliseconds());
            setSelectedDate(newDate);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    disabled={isDisabled}
                    variant="outline"
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground',
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                        format(localDate, 'dd/MM/yyyy hh:mm aa')
                    ) : (
                        <span>Pick date and time</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="sm:flex">
                    <Calendar
                        mode="single"
                        selected={localDate}
                        onSelect={handleDateSelect}
                        initialFocus
                    />
                    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                        {/* Hours */}
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {reversedHours.map((hour) => (
                                    <Button
                                        key={hour}
                                        size="icon"
                                        variant={
                                            // Active if the hour equals the display hour.
                                            displayHour === hour
                                                ? 'default'
                                                : 'ghost'
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() =>
                                            handleTimeChange(
                                                'hour',
                                                hour.toString(),
                                            )
                                        }
                                    >
                                        {hour}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar
                                orientation="horizontal"
                                className="sm:hidden"
                            />
                        </ScrollArea>

                        {/* Minutes */}
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {Array.from(
                                    { length: 12 },
                                    (_, i) => i * 5,
                                ).map((minute) => (
                                    <Button
                                        key={minute}
                                        size="icon"
                                        variant={
                                            localDate.getMinutes() === minute
                                                ? 'default'
                                                : 'ghost'
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() =>
                                            handleTimeChange(
                                                'minute',
                                                minute.toString(),
                                            )
                                        }
                                    >
                                        {minute.toString().padStart(2, '0')}
                                    </Button>
                                ))}
                            </div>
                            <ScrollBar
                                orientation="horizontal"
                                className="sm:hidden"
                            />
                        </ScrollArea>

                        {/* AM / PM */}
                        <ScrollArea>
                            <div className="flex sm:flex-col p-2">
                                {['AM', 'PM'].map((ampm) => (
                                    <Button
                                        key={ampm}
                                        size="icon"
                                        variant={
                                            (ampm === 'AM' && !isPM) ||
                                            (ampm === 'PM' && isPM)
                                                ? 'default'
                                                : 'ghost'
                                        }
                                        className="sm:w-full shrink-0 aspect-square"
                                        onClick={() =>
                                            handleTimeChange('ampm', ampm)
                                        }
                                    >
                                        {ampm}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
