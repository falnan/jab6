import { Head, router, usePage } from '@inertiajs/react';
import { format as formatDateFns, isValid, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    CheckCircle2,
    Download,
    Eraser,
    RotateCcw,
    Search,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import DateRangePicker from '@/components/date-range-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { rahasia } from '@/routes';
import { destroyAllSoftDeleted, exportMethod } from '@/routes/rahasia';

type OrderRow = {
    id: number;
    resi: string;
    recipient_name: string;
    note: string | null;
    created_at: string;
    deleted_at: string | null;
    has_image: boolean | number;
};

type OrdersPaginator = {
    data: OrderRow[];
    total: number;
    current_page: number;
    last_page: number;
    from: number | null;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
};

type OrdersPageProps = {
    orders: OrdersPaginator;
};

type OrderFilters = {
    search: string;
    dateFrom: string;
    dateTo: string;
};

function parseDateInput(value: string | null): Date | undefined {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return undefined;
    }

    return new Date(year, month - 1, day);
}

function formatDateInput(date: Date | undefined): string {
    if (!date) {
        return '';
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDateTime(value: string): string {
    const parsedDate = parseISO(value);
    const date = isValid(parsedDate) ? parsedDate : new Date(value);

    if (!isValid(date)) {
        return value;
    }

    return formatDateFns(date, 'dd MMM yyyy, HH:mm', { locale: id });
}

function getFiltersFromUrl(pageUrl: string): OrderFilters {
    const url = new URL(
        pageUrl,
        typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost',
    );

    return {
        search: url.searchParams.get('search') ?? '',
        dateFrom: url.searchParams.get('date_from') ?? '',
        dateTo: url.searchParams.get('date_to') ?? '',
    };
}

function buildOrdersQuery(
    filters: OrderFilters,
    page?: number,
): Record<string, string | number> {
    const query: Record<string, string | number> = {};

    if (filters.search.trim() !== '') {
        query.search = filters.search.trim();
    }

    if (filters.dateFrom !== '') {
        query.date_from = filters.dateFrom;
    }

    if (filters.dateTo !== '') {
        query.date_to = filters.dateTo;
    }

    if (page && page > 1) {
        query.page = page;
    }

    return query;
}

function getVisiblePages(
    currentPage: number,
    lastPage: number,
): Array<number | 'ellipsis-left' | 'ellipsis-right'> {
    if (lastPage <= 7) {
        return Array.from({ length: lastPage }, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, 'ellipsis-right', lastPage];
    }

    if (currentPage >= lastPage - 3) {
        return [
            1,
            'ellipsis-left',
            lastPage - 4,
            lastPage - 3,
            lastPage - 2,
            lastPage - 1,
            lastPage,
        ];
    }

    return [
        1,
        'ellipsis-left',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        'ellipsis-right',
        lastPage,
    ];
}

type OrdersFiltersProps = {
    initialFilters: OrderFilters;
    onApply: (filters: OrderFilters) => void;
    onReset: () => void;
};

function OrdersFilters({
    initialFilters,
    onApply,
    onReset,
}: OrdersFiltersProps) {
    const [search, setSearch] = useState(initialFilters.search);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        const from = parseDateInput(initialFilters.dateFrom);
        const to = parseDateInput(initialFilters.dateTo);

        if (!from && !to) {
            return undefined;
        }

        return {
            from,
            to,
        };
    });

    const currentFilters: OrderFilters = {
        search,
        dateFrom: formatDateInput(dateRange?.from),
        dateTo: formatDateInput(dateRange?.to),
    };

    return (
        <div className="space-y-5">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    onApply(currentFilters);
                }}
                className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_auto_auto]"
            >
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Cari berdasarkan nomor resi"
                        className="border-slate-200 bg-white pl-9 shadow-xs dark:border-slate-700 dark:bg-slate-950"
                    />
                </div>

                <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className="w-full"
                />

                <Button
                    type="submit"
                    className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                    <Search className="size-4" />
                    Terapkan
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onReset}
                    className="border-slate-200 bg-white shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900"
                >
                    <RotateCcw className="size-4" />
                    Reset
                </Button>
            </form>
        </div>
    );
}

export default function OrdersIndex() {
    const page = usePage<OrdersPageProps>();
    const { orders } = page.props;
    const currentFilters = getFiltersFromUrl(page.url);
    const [isClearing, setIsClearing] = useState(false);
    const visiblePages = useMemo(
        () => getVisiblePages(orders.current_page, orders.last_page),
        [orders.current_page, orders.last_page],
    );

    const submitFilters = (filters: OrderFilters) => {
        router.visit(
            rahasia.url({
                query: buildOrdersQuery(filters),
            }),
            {
                method: 'get',
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        router.visit(rahasia().url, {
            method: 'get',
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (pageNumber: number) => {
        if (
            pageNumber < 1 ||
            pageNumber > orders.last_page ||
            pageNumber === orders.current_page
        ) {
            return;
        }

        router.visit(
            rahasia.url({
                query: buildOrdersQuery(currentFilters, pageNumber),
            }),
            {
                method: 'get',
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleExport = () => {
        window.location.href = exportMethod.url({
            query: buildOrdersQuery(currentFilters),
        });
    };

    const handleClearData = () => {
        if (isClearing) {
            return;
        }

        const isConfirmed = window.confirm(
            'Yakin ingin membersihkan semua data order yang sudah dihapus? Tindakan ini permanen.',
        );

        if (!isConfirmed) {
            return;
        }

        setIsClearing(true);

        router.delete(
            destroyAllSoftDeleted.url({
                query: buildOrdersQuery(currentFilters),
            }),
            {
                preserveScroll: true,
                preserveState: false,
                onFinish: () => {
                    setIsClearing(false);
                },
                onSuccess: () => {
                    toast.success('Data order terhapus berhasil dibersihkan', {
                        position: 'top-right',
                        style: {
                            borderRadius: '8px',
                            background: '#ffffff',
                            color: '#1f2937',
                            border: '1px solid #4ade80',
                        },
                    });
                },
                onError: () => {
                    toast.error('Gagal membersihkan data', {
                        position: 'top-right',
                        style: {
                            borderRadius: '8px',
                            background: '#ffffff',
                            color: '#1f2937',
                            border: '1px solid #f87171',
                        },
                    });
                },
            },
        );
    };

    return (
        <>
            <Head title="Daftar Order" />

            <div className="space-y-6 p-4">
                <div className="relative space-y-5">
                    <OrdersFilters
                        key={page.url}
                        initialFilters={currentFilters}
                        onApply={submitFilters}
                        onReset={resetFilters}
                    />

                    <div className="flex flex-wrap justify-end gap-2">
                        <Button
                            type="button"
                            onClick={handleExport}
                            className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                        >
                            <Download className="size-4" />
                            Export Excel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleClearData}
                            disabled={isClearing}
                        >
                            <Eraser className="size-4" />
                            {isClearing ? 'Membersihkan...' : 'Bersihkan Data'}
                        </Button>
                    </div>
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-300/90 bg-slate-50 dark:border-slate-400/45 dark:bg-slate-950/45">
                    <Table>
                        <TableHeader className="bg-slate-300 dark:bg-slate-900">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                    #
                                </TableHead>
                                <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                    Resi
                                </TableHead>
                                <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                    Nama Penerima
                                </TableHead>
                                <TableHead className="h-12 px-6 text-center text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                    Gambar
                                </TableHead>
                                <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                    Catatan
                                </TableHead>
                                <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                    Dibuat pada
                                </TableHead>
                                <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                    Dihapus pada
                                </TableHead>
                                {/* <TableHead className="h-12 px-6 text-right text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                    Aksi
                                </TableHead> */}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {orders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-14 text-center text-slate-700/80 dark:text-slate-200/80"
                                    >
                                        Tidak ada paket yang cocok dengan filter
                                        saat ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.data.map((order, index) => {
                                    const hasImage = Boolean(order.has_image);

                                    return (
                                        <TableRow
                                            key={order.id}
                                            className="border-slate-200/80 bg-white hover:bg-slate-100/50 dark:border-slate-500/35 dark:bg-slate-950/30 dark:hover:bg-slate-900/55"
                                        >
                                            <TableCell className="px-6 py-2.5 text-slate-900/80 dark:text-slate-100/90">
                                                {(orders.current_page - 1) *
                                                    orders.per_page +
                                                    index +
                                                    1}
                                            </TableCell>
                                            <TableCell className="px-6 py-2.5 font-mono text-sm font-medium text-slate-800 dark:text-slate-100/90">
                                                {order.resi}
                                            </TableCell>
                                            <TableCell className="px-6 py-2.5 font-medium text-slate-900 dark:text-slate-50">
                                                {order.recipient_name}
                                            </TableCell>
                                            <TableCell className="px-6 py-2.5 text-center">
                                                <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 shadow-xs dark:border-slate-700 dark:bg-slate-950">
                                                    {hasImage ? (
                                                        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                                                    ) : (
                                                        <XCircle className="size-4 text-red-500 dark:text-red-400" />
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-72 px-6 py-2.5 text-slate-800 dark:text-slate-100/90">
                                                <p className="line-clamp-2 min-w-48 wrap-break-word whitespace-normal">
                                                    {order.note &&
                                                    order.note.trim() !== ''
                                                        ? order.note
                                                        : '-'}
                                                </p>
                                            </TableCell>
                                            <TableCell className="px-6 py-2.5 text-slate-800 dark:text-slate-100/90">
                                                {formatDateTime(
                                                    order.created_at,
                                                )}
                                            </TableCell>
                                            <TableCell className="px-6 py-2.5 text-slate-800 dark:text-slate-100/90">
                                                {order.deleted_at
                                                    ? formatDateTime(
                                                          order.deleted_at,
                                                      )
                                                    : '-'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </section>

                <section className="-mt-4 rounded-2xl px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-slate-900/90 dark:text-slate-100/90">
                            {orders.from && orders.to
                                ? `Menampilkan ${orders.from}-${orders.to} dari ${orders.total} data`
                                : 'Tidak ada data untuk ditampilkan'}
                        </p>

                        {orders.last_page > 1 ? (
                            <Pagination className="mx-0 w-auto justify-end">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                handlePageChange(
                                                    orders.current_page - 1,
                                                );
                                            }}
                                            className={`border border-slate-500 bg-transparent text-slate-700 transition hover:text-slate-900 dark:border-slate-300 dark:text-slate-100 dark:hover:text-slate-50 ${
                                                orders.current_page <= 1
                                                    ? 'pointer-events-none opacity-45'
                                                    : ''
                                            }`}
                                        />
                                    </PaginationItem>

                                    {visiblePages.map((pageNumber, index) => (
                                        <PaginationItem
                                            key={`${pageNumber}-${index}`}
                                        >
                                            {typeof pageNumber === 'number' ? (
                                                <PaginationLink
                                                    href="#"
                                                    isActive={
                                                        pageNumber ===
                                                        orders.current_page
                                                    }
                                                    className={
                                                        pageNumber ===
                                                        orders.current_page
                                                            ? 'border-slate-700 bg-transparent text-slate-800 ring-1 ring-slate-600/60 dark:border-slate-200 dark:text-slate-50 dark:ring-slate-300/60'
                                                            : 'border-slate-500 bg-transparent text-slate-700 transition hover:text-slate-900 dark:border-slate-400/70 dark:text-slate-100 dark:hover:text-slate-50'
                                                    }
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        handlePageChange(
                                                            pageNumber,
                                                        );
                                                    }}
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            ) : (
                                                <PaginationEllipsis className="text-slate-700 dark:text-slate-200" />
                                            )}
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                handlePageChange(
                                                    orders.current_page + 1,
                                                );
                                            }}
                                            className={`border border-slate-500 bg-transparent text-slate-700 transition hover:text-slate-900 dark:border-slate-300 dark:text-slate-100 dark:hover:text-slate-50 ${
                                                orders.current_page >=
                                                orders.last_page
                                                    ? 'pointer-events-none opacity-45'
                                                    : ''
                                            }`}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        ) : null}
                    </div>
                </section>
            </div>
        </>
    );
}

OrdersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Paket',
            href: rahasia(),
        },
    ],
};
