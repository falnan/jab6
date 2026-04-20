import { CalendarRange, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DateRangePickerProps = {
    className?: string;
    value?: DateRange;
    onChange: (value: DateRange | undefined) => void;
};

function formatDateLabel(date: Date): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function getDateRangeLabel(value?: DateRange): string {
    if (value?.from && value?.to) {
        return `${formatDateLabel(value.from)} - ${formatDateLabel(value.to)}`;
    }

    if (value?.from) {
        return formatDateLabel(value.from);
    }

    return 'Pilih rentang tanggal';
}

export default function DateRangePicker({
    className,
    value,
    onChange,
}: DateRangePickerProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className={cn(
                            'w-full justify-start border-slate-200 bg-white text-left font-normal text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900',
                            !value?.from && 'text-muted-foreground',
                        )}
                    >
                        <CalendarRange className="size-4 text-slate-500 dark:text-slate-400" />
                        <span className="truncate">
                            {getDateRangeLabel(value)}
                        </span>
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    className="w-auto border-slate-200 p-0 dark:border-slate-800"
                >
                    <Calendar
                        mode="range"
                        selected={value}
                        onSelect={onChange}
                        numberOfMonths={2}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            {value?.from ? (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onChange(undefined)}
                    className="shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    aria-label="Reset rentang tanggal"
                >
                    <X className="size-4" />
                </Button>
            ) : null}
        </div>
    );
}
