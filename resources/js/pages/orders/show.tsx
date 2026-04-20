import { Head, router, usePage } from '@inertiajs/react';
import { format as formatDateFns, isValid, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    ArrowLeft,
    CalendarClock,
    ImageOff,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { destroy, edit, index as ordersIndex } from '@/routes/orders';

type OrderDetails = {
    id: number;
    resi: string;
    recipient_name: string;
    shipment_code?: string | null;
    image_path: string | null;
    note: string | null;
    created_by_name: string | null;
    shipment_relation?: {
        code?: string | null;
        name?: string | null;
    } | null;
    sender_relation?: {
        name?: string | null;
    } | null;
    created_at: string;
    updated_at: string;
};

type ShowOrderPageProps = {
    order: OrderDetails;
};

function formatDateTime(value: string): string {
    const parsedDate = parseISO(value);
    const date = isValid(parsedDate) ? parsedDate : new Date(value);

    if (!isValid(date)) {
        return value;
    }

    return formatDateFns(date, 'dd MMM yyyy, HH:mm', { locale: id });
}

function buildImageSource(path: string): string {
    const normalizedPath = path.trim();

    if (
        normalizedPath.startsWith('http://') ||
        normalizedPath.startsWith('https://')
    ) {
        return normalizedPath;
    }

    if (normalizedPath.startsWith('/storage/')) {
        return normalizedPath;
    }

    if (normalizedPath.startsWith('storage/')) {
        return `/${normalizedPath}`;
    }

    if (normalizedPath.startsWith('/')) {
        return normalizedPath;
    }

    return `/storage/${normalizedPath}`;
}

export default function ShowOrder({ order }: ShowOrderPageProps) {
    const { auth } = usePage().props;
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [failedImageSource, setFailedImageSource] = useState<string | null>(
        null,
    );

    const imagePath = order.image_path?.trim() ?? '';
    const imageSource = imagePath !== '' ? buildImageSource(imagePath) : null;
    const hasImage = Boolean(imageSource) && imageSource !== failedImageSource;
    const senderName = order.sender_relation?.name?.trim() || '-';
    const shipmentCode =
        order.shipment_code ?? order.shipment_relation?.code ?? '-';

    const handleBack = () => {
        window.history.back();
    };

    const handleEdit = () => {
        router.visit(edit({ order: order.id }).url);
    };

    const handleDelete = () => {
        setIsDeleting(true);

        router.delete(destroy({ order: order.id }).url, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
            },
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                window.history.back();
                toast.success('Order berhasil dihapus', {
                    position: 'top-right',
                    style: {
                        borderRadius: '8px',
                        background: '#ffffff',
                        color: '#1f2937',
                        border: '1px solid #4ade80',
                    },
                });

                router.visit(ordersIndex().url, {
                    preserveScroll: true,
                    replace: true,
                });
            },
            onError: () => {
                toast.error('Gagal menghapus order', {
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
            <Head title={`Detail Paket ${order.resi}`} />

            <div className="space-y-6 p-4">
                <section className="overflow-hidden rounded-2xl border border-slate-300/90 bg-slate-50 dark:border-slate-400/45 dark:bg-slate-950/45">
                    <div className="border-b border-slate-300/80 bg-slate-300 px-6 py-4 dark:border-slate-400/35 dark:bg-slate-900">
                        <h2 className="text-center text-base font-semibold text-slate-900 dark:text-slate-50">
                            Detail Paket
                        </h2>
                    </div>

                    <div className="grid gap-6 p-6 md:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                                Nomor Resi
                            </p>
                            <p className="font-mono text-base font-medium text-slate-900 dark:text-slate-100">
                                {order.resi}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                                Nama Penerima
                            </p>
                            <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                                {order.recipient_name}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                                Kode Pengiriman
                            </p>
                            <p className="font-mono text-base font-medium text-slate-900 dark:text-slate-100">
                                {shipmentCode && shipmentCode.trim() !== ''
                                    ? shipmentCode
                                    : '-'}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                                Ekpedisi
                            </p>
                            <p className="text-base text-slate-700 dark:text-slate-300">
                                {senderName}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                                Penginput
                            </p>
                            <p className="text-base text-slate-700 dark:text-slate-300">
                                {order.created_by_name &&
                                order.created_by_name.trim() !== ''
                                    ? order.created_by_name
                                    : '-'}
                            </p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                                Catatan
                            </p>
                            <div className="rounded-lg border border-slate-300/80 bg-slate-100/80 p-4 text-sm whitespace-pre-wrap text-slate-700 dark:border-slate-500/35 dark:bg-slate-900/55 dark:text-slate-300">
                                {order.note && order.note.trim() !== ''
                                    ? order.note
                                    : '-'}
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                                Gambar
                            </p>
                            {hasImage && imageSource ? (
                                <div className="rounded-lg border border-slate-300/80 bg-slate-100/80 p-3 dark:border-slate-500/35 dark:bg-slate-900/55">
                                    <div className="flex w-full items-center justify-center rounded-md bg-slate-50 p-2 dark:bg-slate-900/40">
                                        <img
                                            src={imageSource}
                                            alt={`Bukti order ${order.resi}`}
                                            className="block max-h-80 w-full rounded-md object-contain"
                                            onError={() =>
                                                setFailedImageSource(
                                                    imageSource,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs break-all text-slate-500 dark:text-slate-400">
                                            {imagePath}
                                        </p>
                                        <Button
                                            asChild
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <a
                                                href={imageSource}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Buka Gambar
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-400 bg-slate-100/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-500/35 dark:bg-slate-900/55 dark:text-slate-300">
                                    <ImageOff className="size-4" />
                                    Tidak ada gambar untuk order ini.
                                </div>
                            )}
                        </div>

                        <div className="grid gap-3 rounded-xl border border-slate-300/80 bg-slate-100/80 p-4 md:col-span-2 md:grid-cols-2 dark:border-slate-500/35 dark:bg-slate-900/55">
                            <div className="space-y-1">
                                <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                                    <CalendarClock className="size-3.5" />
                                    Dibuat pada
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    {formatDateTime(order.created_at)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                                    <CalendarClock className="size-3.5" />
                                    Diperbarui pada
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    {formatDateTime(order.updated_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="/80 -mt-4 rounded-2xl px-6 py-4">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleBack}
                        >
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Button>
                        {auth.user.role === 'main_admin' && (
                            <>
                                <Button
                                    type="button"
                                    onClick={handleEdit}
                                    className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                                >
                                    <Pencil className="size-4" />
                                    Ubah
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="size-4" />
                                    Hapus
                                </Button>
                            </>
                        )}
                    </div>
                </section>
            </div>

            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    if (!isDeleting) {
                        setIsDeleteDialogOpen(open);
                    }
                }}
            >
                <DialogContent>
                    <DialogTitle>Konfirmasi Hapus Order</DialogTitle>
                    <DialogDescription>
                        {`Anda yakin ingin menghapus order ${order.resi}? Tindakan ini tidak dapat dibatalkan.`}
                    </DialogDescription>

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ShowOrder.layout = {
    breadcrumbs: [
        {
            title: 'Paket',
            href: ordersIndex(),
        },
        {
            title: 'Detail Paket',
            href: '#',
        },
    ],
};
