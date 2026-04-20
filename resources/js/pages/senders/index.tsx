import { Head, router } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { create, destroy, edit, index as sendersIndex } from '@/routes/senders';

type SenderRow = {
    id: number;
    code: string;
    name: string;
};

type PaginatedLinks = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedSenders = {
    data: SenderRow[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginatedLinks[];
    per_page: number;
};

type SendersPageProps = {
    senders: PaginatedSenders;
};

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

export default function SendersIndex({ senders }: SendersPageProps) {
    const [selectedSender, setSelectedSender] = useState<SenderRow | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const visiblePages = useMemo(
        () => getVisiblePages(senders.current_page, senders.last_page),
        [senders.current_page, senders.last_page],
    );

    const handleCreateClick = () => {
        router.visit(create().url);
    };

    const handleEditClick = (sender: SenderRow) => {
        router.visit(edit({ sender: sender.id }).url);
    };

    const handlePageChange = (page: number) => {
        if (
            page < 1 ||
            page > senders.last_page ||
            page === senders.current_page
        ) {
            return;
        }

        router.visit(
            sendersIndex.url({
                query: {
                    page,
                },
            }),
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleDelete = () => {
        if (!selectedSender) {
            return;
        }

        setIsDeleting(true);

        router.delete(destroy({ sender: selectedSender.id }).url, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
            },
            onSuccess: () => {
                setSelectedSender(null);
                toast.success('Ekspedisi berhasil dihapus', {
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
                toast.error('Gagal menghapus ekspedisi', {
                    position: 'top-right',
                    style: {
                        borderRadius: '8px',
                        background: '#ffffff',
                        color: '#1f2937',
                        border: '1px solid #f87171',
                    },
                });
            },
        });
    };

    return (
        <>
            <Head title="Manajemen Ekspedisi" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
                    <Button
                        onClick={handleCreateClick}
                        className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                    >
                        <Plus className="size-4" />
                        Tambah Ekspedisi
                    </Button>
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-300/90 bg-slate-50 dark:border-slate-400/45 dark:bg-slate-950/45">
                    <div className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-300 dark:bg-slate-900">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                        #
                                    </TableHead>
                                    <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                        Kode
                                    </TableHead>
                                    <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                        Nama
                                    </TableHead>
                                    <TableHead className="h-12 px-6 text-right text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {senders.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="py-14 text-center text-slate-700/80 dark:text-slate-200/80"
                                        >
                                            Belum ada data ekspedisi.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    senders.data.map((sender, index) => (
                                        <TableRow
                                            key={sender.id}
                                            className="border-slate-200/80 bg-white hover:bg-slate-100/50 dark:border-slate-500/35 dark:bg-slate-950/30 dark:hover:bg-slate-900/55"
                                        >
                                            <TableCell className="px-6 py-2.5 text-slate-900/80 dark:text-slate-100/90">
                                                {(senders.current_page - 1) *
                                                    senders.per_page +
                                                    index +
                                                    1}
                                            </TableCell>
                                            <TableCell className="px-6 py-2.5 font-mono text-slate-800 dark:text-slate-100/90">
                                                {sender.code}
                                            </TableCell>
                                            <TableCell className="px-6 py-2.5 font-medium text-slate-900 dark:text-slate-50">
                                                <div className="flex flex-col gap-1">
                                                    <span>{sender.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-2.5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label="Aksi ekspedisi"
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
                                                                handleEditClick(
                                                                    sender,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="size-4" />
                                                            Ubah
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() =>
                                                                setSelectedSender(
                                                                    sender,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-4" />
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                <section className="-mt-4 rounded-2xl px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-slate-900/90 dark:text-slate-100/90">
                            {senders.from && senders.to
                                ? `Menampilkan ${senders.from}-${senders.to} dari ${senders.total} data`
                                : 'Tidak ada data untuk ditampilkan'}
                        </p>

                        {senders.last_page > 1 ? (
                            <Pagination className="mx-0 w-auto justify-end">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                handlePageChange(
                                                    senders.current_page - 1,
                                                );
                                            }}
                                            className={`border border-slate-500 bg-transparent text-slate-700 transition hover:text-slate-900 dark:border-slate-300 dark:text-slate-100 dark:hover:text-slate-50 ${
                                                senders.current_page <= 1
                                                    ? 'pointer-events-none opacity-45'
                                                    : ''
                                            }`}
                                        />
                                    </PaginationItem>

                                    {visiblePages.map((page, index) => (
                                        <PaginationItem
                                            key={`${page}-${index}`}
                                        >
                                            {typeof page === 'number' ? (
                                                <PaginationLink
                                                    href="#"
                                                    isActive={
                                                        page ===
                                                        senders.current_page
                                                    }
                                                    className={
                                                        page ===
                                                        senders.current_page
                                                            ? 'border-slate-700 bg-transparent text-slate-800 ring-1 ring-slate-600/60 dark:border-slate-200 dark:text-slate-50 dark:ring-slate-300/60'
                                                            : 'border-slate-500 bg-transparent text-slate-700 transition hover:text-slate-900 dark:border-slate-400/70 dark:text-slate-100 dark:hover:text-slate-50'
                                                    }
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        handlePageChange(page);
                                                    }}
                                                >
                                                    {page}
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
                                                    senders.current_page + 1,
                                                );
                                            }}
                                            className={`border border-slate-500 bg-transparent text-slate-700 transition hover:text-slate-900 dark:border-slate-300 dark:text-slate-100 dark:hover:text-slate-50 ${
                                                senders.current_page >=
                                                senders.last_page
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

            <Dialog
                open={selectedSender !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setSelectedSender(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Konfirmasi Hapus Ekspedisi</DialogTitle>
                    <DialogDescription>
                        {selectedSender
                            ? `Anda yakin ingin menghapus ekspedisi ${selectedSender.name}? Tindakan ini tidak dapat dibatalkan.`
                            : 'Pilih ekspedisi yang ingin dihapus.'}
                    </DialogDescription>

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setSelectedSender(null)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting || selectedSender === null}
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

SendersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Ekspedisi',
            href: sendersIndex(),
        },
    ],
};
