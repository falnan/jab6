import { Head, router } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
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
import { create, destroy, edit, index as usersIndex } from '@/routes/users';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean | number;
};

type PaginatedLinks = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedUsers = {
    data: UserRow[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginatedLinks[];
    per_page: number;
};

type UsersPageProps = {
    users: PaginatedUsers;
};

function getRolePresentation(role: string): {
    label: string;
    className: string;
} {
    if (role === 'main_admin') {
        return {
            label: 'Admin Utama',
            className:
                'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-200',
        };
    }

    if (role === 'input_admin') {
        return {
            label: 'Admin Input',
            className:
                'border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-200',
        };
    }

    return {
        label: role,
        className:
            'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/15 dark:text-slate-200',
    };
}

function getStatusPresentation(isActive: boolean): {
    label: string;
    className: string;
} {
    if (isActive) {
        return {
            label: 'Aktif',
            className:
                'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200',
        };
    }

    return {
        label: 'Nonaktif',
        className:
            'border-red-200 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-200',
    };
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

export default function UsersIndex({ users }: UsersPageProps) {
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const visiblePages = useMemo(
        () => getVisiblePages(users.current_page, users.last_page),
        [users.current_page, users.last_page],
    );

    const handleCreateClick = () => {
        router.visit(create().url);
    };

    const handleEditClick = (user: UserRow) => {
        router.visit(edit({ user: user.id }).url);
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > users.last_page || page === users.current_page) {
            return;
        }

        router.visit(
            usersIndex.url({
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
        if (!selectedUser) {
            return;
        }

        setIsDeleting(true);

        router.delete(destroy({ user: selectedUser.id }).url, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
            },
            onSuccess: () => {
                setSelectedUser(null);
                toast.success('Admin berhasil dihapus', {
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
                toast.error('Gagal menghapus admin', {
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
            <Head title="Manajemen Admin" />

            <div className="space-y-6 p-4">
                <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
                    {/* <div className="space-y-1">
						<h1 className="text-2xl font-semibold tracking-tight">Daftar Admin</h1>
						<p className="text-sm text-muted-foreground">
							Kelola akun admin, peran, dan status keaktifan.
						</p>
					</div>
 */}
                    <Button
                        onClick={handleCreateClick}
                        className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                    >
                        <Plus className="size-4" />
                        Tambah Admin
                    </Button>
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-300/90 bg-slate-50 dark:border-slate-400/45 dark:bg-slate-950/45">
                    {/* <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40">
						<h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Data Admin</h2>
						<p className="text-sm text-muted-foreground">
							Kelola akun admin, peran, dan status keaktifan dari tabel berikut.
						</p>
					</div> */}

                    <div className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-300 dark:bg-slate-900">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                        #
                                    </TableHead>
                                    <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                        Nama
                                    </TableHead>
                                    <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                        Alamat Email
                                    </TableHead>
                                    <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                        Peran
                                    </TableHead>
                                    <TableHead className="h-12 px-6 text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                        Status
                                    </TableHead>
                                    <TableHead className="h-12 px-6 text-right text-xs font-semibold tracking-[0.14em] text-slate-900 uppercase dark:text-slate-50">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-14 text-center text-slate-700/80 dark:text-slate-200/80"
                                        >
                                            Belum ada data admin.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((user, index) => {
                                        const isActive = Boolean(
                                            user.is_active,
                                        );
                                        const role = getRolePresentation(
                                            user.role,
                                        );
                                        const status =
                                            getStatusPresentation(isActive);

                                        return (
                                            <TableRow
                                                key={user.id}
                                                className="border-slate-200/80 bg-white hover:bg-slate-100/50 dark:border-slate-500/35 dark:bg-slate-950/30 dark:hover:bg-slate-900/55"
                                            >
                                                <TableCell className="px-6 py-2.5 text-slate-900/80 dark:text-slate-100/90">
                                                    {(users.current_page - 1) *
                                                        users.per_page +
                                                        index +
                                                        1}
                                                </TableCell>
                                                <TableCell className="px-6 py-2.5 font-medium text-slate-900 dark:text-slate-50">
                                                    <div className="flex flex-col gap-1">
                                                        <span>{user.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-2.5 text-slate-800 dark:text-slate-100/90">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell className="px-6 py-2.5">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            role.className
                                                        }
                                                    >
                                                        {role.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-2.5">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            status.className
                                                        }
                                                    >
                                                        {status.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-2.5 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label="Aksi admin"
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
                                                                        user,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="size-4" />
                                                                Ubah
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    setSelectedUser(
                                                                        user,
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
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                <section className="-mt-4 rounded-2xl px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-slate-900/90 dark:text-slate-100/90">
                            {users.from && users.to
                                ? `Menampilkan ${users.from}-${users.to} dari ${users.total} data`
                                : 'Tidak ada data untuk ditampilkan'}
                        </p>

                        {users.last_page > 1 ? (
                            <Pagination className="mx-0 w-auto justify-end">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                handlePageChange(
                                                    users.current_page - 1,
                                                );
                                            }}
                                            className={`border border-slate-500 bg-transparent text-slate-700 transition hover:text-slate-900 dark:border-slate-300 dark:text-slate-100 dark:hover:text-slate-50 ${
                                                users.current_page <= 1
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
                                                        users.current_page
                                                    }
                                                    className={
                                                        page ===
                                                        users.current_page
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
                                                    users.current_page + 1,
                                                );
                                            }}
                                            className={`border border-slate-500 bg-transparent text-slate-700 transition hover:text-slate-900 dark:border-slate-300 dark:text-slate-100 dark:hover:text-slate-50 ${
                                                users.current_page >=
                                                users.last_page
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
                open={selectedUser !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setSelectedUser(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Konfirmasi Hapus Admin</DialogTitle>
                    <DialogDescription>
                        {selectedUser
                            ? `Anda yakin ingin menghapus admin ${selectedUser.name}? Tindakan ini tidak dapat dibatalkan.`
                            : 'Pilih admin yang ingin dihapus.'}
                    </DialogDescription>

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setSelectedUser(null)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting || selectedUser === null}
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: usersIndex(),
        },
    ],
};
