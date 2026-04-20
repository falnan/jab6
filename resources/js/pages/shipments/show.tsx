import { Head, router, usePage } from '@inertiajs/react';
import { format as formatDateFns, isValid, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    CheckCircle2,
    Download,
    Eye,
    MoreHorizontal,
    PackagePlus,
    Pencil,
    RotateCcw,
    Search,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import DateRangePicker from '@/components/date-range-picker';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { edit, show as orderShow } from '@/routes/orders';
import {
    index as shipmentsIndex,
    show as shipmentShow,
} from '@/routes/shipments';
import shipmentOrders from '@/routes/shipments/orders';

type Shipment = {
    id: number;
    code: string;
    status: string;
    shipped_at: string | null;
    arrived_at: string | null;
};

type OrderRow = {
    id: number;
    resi: string;
    recipient_name: string;
    note: string | null;
    created_at: string;
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

type User = {
    id: number;
    name: string;
    email: string;
    role: 'main_admin' | 'input_admin';
};

type ShipmentShowPageProps = {
    shipment: Shipment;
    orders: OrdersPaginator;
    user: User | null;
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

function formatDateTime(value: string | null): string {
    if (!value) {
        return '-';
    }

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

function buildShipmentShowUrl(
    shipmentId: number,
    query: Record<string, string | number>,
): string {
    const baseUrl = shipmentShow({ shipment: shipmentId }).url;
    const queryString = new URLSearchParams(
        Object.entries(query).map(([key, value]) => [key, String(value)]),
    ).toString();

    return queryString === '' ? baseUrl : `${baseUrl}?${queryString}`;
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

export default function ShipmentShow() {
    const page = usePage<ShipmentShowPageProps>();
    const { shipment, orders, user } = page.props;
    const currentFilters = getFiltersFromUrl(page.url);
    const isMainAdmin = user?.role === 'main_admin';
    const canAddPacket = isMainAdmin || shipment.status === 'pending';
    const visiblePages = useMemo(
        () => getVisiblePages(orders.current_page, orders.last_page),
        [orders.current_page, orders.last_page],
    );

    const submitFilters = (filters: OrderFilters) => {
        router.visit(
            buildShipmentShowUrl(shipment.id, buildOrdersQuery(filters)),
            {
                method: 'get',
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        router.visit(shipmentShow({ shipment: shipment.id }).url, {
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
            buildShipmentShowUrl(
                shipment.id,
                buildOrdersQuery(currentFilters, pageNumber),
            ),
            {
                method: 'get',
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleShowOrder = (orderId: number) => {
        router.visit(orderShow({ order: orderId }).url);
    };

    const handleEditOrder = (orderId: number) => {
        router.visit(edit({ order: orderId }).url);
    };

    const getShipmentStatusInIndonesian = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Menunggu';
            case 'shipped':
                return 'Dikirim';
            case 'delivered':
                return 'Terkirim';
            default:
                return status;
        }
    };

    return (
        <>
            <Head title={`Detail Pengiriman ${shipment.code}`} />

            <div className="space-y-6 p-4">
                <div className="darK:bg-slate-800 space-y-4 rounded-xl border border-slate-300/80 bg-slate-300 p-4 shadow-sm dark:bg-slate-900">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                                Detail Pengiriman
                            </p>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {shipment.code}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Status:{' '}
                                {getShipmentStatusInIndonesian(shipment.status)}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            {canAddPacket && (
                                <Button
                                    type="button"
                                    onClick={() =>
                                        router.visit(
                                            shipmentOrders.create({
                                                shipment: shipment.id,
                                            }).url,
                                        )
                                    }
                                    className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                                    disabled={!canAddPacket}
                                >
                                    <PackagePlus className="size-4" />
                                    Tambah Paket
                                </Button>
                            )}

                            {isMainAdmin && (
                                <>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="border-0 bg-orange-400/90 text-white hover:bg-orange-500 hover:text-white"
                                    >
                                        <a
                                            href={`/shipments/${shipment.id}/export`}
                                        >
                                            <Download className="size-4" />
                                            Export Excel
                                        </a>
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={() =>
                                            router.visit(
                                                shipmentShow({
                                                    shipment: shipment.id,
                                                }).url + '/edit',
                                            )
                                        }
                                        className="bg-blue-600 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                                    >
                                        <Pencil className="size-4" />
                                        Edit
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <OrdersFilters
                        key={page.url}
                        initialFilters={currentFilters}
                        onApply={submitFilters}
                        onReset={resetFilters}
                    />
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
                                <TableHead className="h-12 px-6 text-right text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {orders.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-14 text-center text-slate-700/80 dark:text-slate-200/80"
                                    >
                                        Belum ada order pada shipment ini.
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
                                            <TableCell className="px-6 py-2.5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label="Aksi order"
                                                            className="text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>
                                                            Aksi
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleShowOrder(
                                                                    order.id,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="size-4" />
                                                            Lihat
                                                        </DropdownMenuItem>
                                                        {isMainAdmin && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleEditOrder(
                                                                        order.id,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="size-4" />
                                                                Ubah
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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

ShipmentShow.layout = {
    breadcrumbs: [
        {
            title: 'Pengiriman',
            href: shipmentsIndex(),
        },
        {
            title: 'Detail Pengiriman',
            href: '#',
        },
    ],
};
