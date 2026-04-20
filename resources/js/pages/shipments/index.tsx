import { Head, Link, usePage } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { create as shipmentCreate, index, show } from '@/routes/shipments';

type ShipmentStatus = 'pending' | 'shipped' | 'delivered' | 'arrived';

type ShipmentRow = {
    id: number;
    code?: string;
    status: ShipmentStatus;
    shipped_at: string | null;
    delivered_at?: string | null;
    arrived_at?: string | null;
};

type PaginatedLinks = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedShipments = {
    data: ShipmentRow[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginatedLinks[];
};

type ShipmentsPageProps = {
    shipments: PaginatedShipments;
};

type AuthUser = {
    role: string;
};

type ShipmentIndexSharedProps = {
    auth: {
        user: AuthUser | null;
    };
};

function getStatusPresentation(status: ShipmentStatus): {
    label: string;
    className: string;
    cardClassName: string;
    detailClassName: string;
} {
    if (status === 'shipped') {
        return {
            label: 'Dikirim',
            className:
                'border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200',
            cardClassName:
                'border-sky-400 bg-sky-300 dark:bg-sky-800 dark:border-sky-700',
            detailClassName:
                'border-sky-200/80 bg-white/80 dark:border-sky-500/20 dark:bg-slate-950/30',
        };
    }

    if (status === 'delivered' || status === 'arrived') {
        return {
            label: 'Tiba',
            className:
                'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200',
            cardClassName:
                'border-green-400 bg-green-300 dark:bg-green-800 dark:border-green-700',
            detailClassName:
                'border-emerald-200/80 bg-white/80 dark:border-emerald-500/20 dark:bg-slate-950/30',
        };
    }

    return {
        label: 'Menunggu',
        className:
            'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/15 dark:text-slate-200',
        cardClassName:
            'border-slate-400 bg-slate-300 dark:bg-slate-800 dark:border-slate-700',
        detailClassName:
            'border-slate-200/80 bg-white/80 dark:border-slate-700 dark:bg-slate-950/30',
    };
}

function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return '-';
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        // hour: '2-digit',
        // minute: '2-digit',
    }).format(parsedDate);
}

function getVisiblePages(
    currentPage: number,
    lastPage: number,
): Array<number | 'ellipsis-left' | 'ellipsis-right'> {
    if (lastPage <= 7) {
        return Array.from(
            { length: lastPage },
            (_, pageIndex) => pageIndex + 1,
        );
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

export default function ShipmentsIndex({ shipments }: ShipmentsPageProps) {
    const page = usePage<ShipmentsPageProps & ShipmentIndexSharedProps>();
    const isMainAdmin = page.props.auth.user?.role === 'main_admin';

    const visiblePages = useMemo(
        () => getVisiblePages(shipments.current_page, shipments.last_page),
        [shipments.current_page, shipments.last_page],
    );

    return (
        <>
            <Head title="Daftar Pengiriman" />

            <div className="space-y-6 p-4">
                {isMainAdmin ? (
                    <div className="flex justify-end">
                        <Button
                            asChild
                            className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                        >
                            <Link href={shipmentCreate().url}>
                                <Plus className="size-4" />
                                Tambah Pengiriman
                            </Link>
                        </Button>
                    </div>
                ) : null}

                <section className="rounded-xl border border-slate-200/80 bg-background p-4 shadow-sm sm:p-6 dark:border-slate-800">
                    {shipments.data.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-muted-foreground dark:border-slate-700">
                            Belum ada data pengiriman.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {shipments.data.map((shipment) => {
                                const status = getStatusPresentation(
                                    shipment.status,
                                );
                                const arrivedAt =
                                    shipment.arrived_at ??
                                    shipment.delivered_at;

                                return (
                                    <Card
                                        key={shipment.id}
                                        className={`gap-4 py-5 ${status.cardClassName}`}
                                    >
                                        <CardHeader className="flex-row items-start justify-between gap-3 pb-0">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base text-slate-900 dark:text-slate-100">
                                                    {shipment.code ??
                                                        `SHP-${shipment.id}`}
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground">
                                                    Ringkasan status pengiriman
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={status.className}
                                            >
                                                {status.label}
                                            </Badge>
                                        </CardHeader>

                                        <CardContent className="space-y-3 pb-0">
                                            <div
                                                className={`rounded-lg border p-3 ${status.detailClassName}`}
                                            >
                                                <p className="text-xs font-medium tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                                                    Tanggal dikirim
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                                                    {formatDateTime(
                                                        shipment.shipped_at,
                                                    )}
                                                </p>
                                            </div>

                                            <div
                                                className={`rounded-lg border p-3 ${status.detailClassName}`}
                                            >
                                                <p className="text-xs font-medium tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                                                    Tanggal tiba
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                                                    {formatDateTime(arrivedAt)}
                                                </p>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="justify-end pt-0">
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                                            >
                                                <Link
                                                    href={
                                                        show({
                                                            shipment:
                                                                shipment.id,
                                                        }).url
                                                    }
                                                >
                                                    <Eye className="size-4" />
                                                    Lihat
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="-mt-6 rounded-xl px-1 py-4 sm:px-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            {shipments.from && shipments.to
                                ? `Menampilkan ${shipments.from}-${shipments.to} dari ${shipments.total} pengiriman`
                                : 'Tidak ada data untuk ditampilkan'}
                        </p>

                        {shipments.last_page > 1 ? (
                            <Pagination className="mx-0 w-auto justify-end">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={index.url({
                                                query: {
                                                    page: Math.max(
                                                        1,
                                                        shipments.current_page -
                                                            1,
                                                    ),
                                                },
                                            })}
                                            className={
                                                shipments.current_page <= 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {visiblePages.map((page, pageIndex) => (
                                        <PaginationItem
                                            key={`${page}-${pageIndex}`}
                                        >
                                            {typeof page === 'number' ? (
                                                <PaginationLink
                                                    href={index.url({
                                                        query: {
                                                            page,
                                                        },
                                                    })}
                                                    isActive={
                                                        page ===
                                                        shipments.current_page
                                                    }
                                                >
                                                    {page}
                                                </PaginationLink>
                                            ) : (
                                                <PaginationEllipsis />
                                            )}
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            href={index.url({
                                                query: {
                                                    page: Math.min(
                                                        shipments.last_page,
                                                        shipments.current_page +
                                                            1,
                                                    ),
                                                },
                                            })}
                                            className={
                                                shipments.current_page >=
                                                shipments.last_page
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
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

ShipmentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Pengiriman',
            href: index(),
        },
    ],
};
