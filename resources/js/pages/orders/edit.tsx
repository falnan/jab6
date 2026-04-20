import { Head, useForm } from '@inertiajs/react';
import imageCompression from 'browser-image-compression';
import { ArrowLeft, Save, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { index as ordersIndex, update as ordersUpdate } from '@/routes/orders';

type SenderOption = {
    id: number;
    code: string;
    name: string;
};

type ShipmentOption = {
    id: number;
    code: string;
};

type EditableOrder = {
    id: number;
    resi: string;
    recipient_name: string;
    image_path: string | null;
    note: string | null;
    created_by_name: string | null;
    sender_id: number | null;
    shipment_id: number | null;
    sender_relation: SenderOption | null;
    shipment_relation: ShipmentOption | null;
};

type EditOrderForm = {
    resi: string;
    recipient_name: string;
    image: File | null;
    note: string;
    sender_id: number | null;
    shipment_id: number | null;
};

type EditOrderPageProps = {
    order: EditableOrder;
    senders: SenderOption[];
    shipments: ShipmentOption[];
};

const MAX_COMPRESSED_IMAGE_SIZE_BYTES = 300 * 1024;

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    return `${(bytes / 1024).toFixed(1)} KB`;
};

export default function EditOrder({
    order,
    senders,
    shipments,
}: EditOrderPageProps) {
    const form = useForm<EditOrderForm>({
        resi: order.resi,
        recipient_name: order.recipient_name,
        image: null,
        note: order.note ?? '',
        sender_id: order.sender_id ?? null,
        shipment_id: order.shipment_id ?? null,
    });

    const [isShipmentDialogOpen, setIsShipmentDialogOpen] = useState(false);
    const [isShipmentEditing, setIsShipmentEditing] = useState(false);
    const [isCompressingImage, setIsCompressingImage] = useState(false);
    const [compressedImagePreview, setCompressedImagePreview] = useState<
        string | null
    >(null);
    const [compressedImageSize, setCompressedImageSize] = useState<
        number | null
    >(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const selectedSender = useMemo(
        () => senders.find((s) => s.id === form.data.sender_id) ?? null,
        [form.data.sender_id, senders],
    );

    const selectedShipment = useMemo(
        () => shipments.find((s) => s.id === form.data.shipment_id) ?? null,
        [form.data.shipment_id, shipments],
    );

    useEffect(() => {
        return () => {
            if (compressedImagePreview !== null) {
                URL.revokeObjectURL(compressedImagePreview);
            }
        };
    }, [compressedImagePreview]);

    const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] ?? null;

        if (selectedFile === null) {
            form.setData('image', null);
            form.clearErrors('image');
            setCompressedImageSize(null);

            if (compressedImagePreview !== null) {
                URL.revokeObjectURL(compressedImagePreview);
                setCompressedImagePreview(null);
            }

            return;
        }

        const isImageType = selectedFile.type.startsWith('image/');

        if (!isImageType) {
            form.setData('image', null);
            form.setError(
                'image',
                'File harus berupa gambar (jpg, png, webp, dll).',
            );
            toast.error('File upload harus berupa image.');
            event.target.value = '';

            return;
        }

        try {
            setIsCompressingImage(true);

            const compressedFile = await imageCompression(selectedFile, {
                maxSizeMB: 0.3,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                initialQuality: 0.8,
                fileType: selectedFile.type,
            });

            if (compressedFile.size > MAX_COMPRESSED_IMAGE_SIZE_BYTES) {
                form.setData('image', null);
                form.setError('image', 'Ukuran hasil kompres melebihi 300 KB.');
                toast.error('Ukuran hasil kompres melebihi 300 KB.');
                event.target.value = '';

                return;
            }

            form.clearErrors('image');
            form.setData('image', compressedFile);
            setCompressedImageSize(compressedFile.size);

            if (compressedImagePreview !== null) {
                URL.revokeObjectURL(compressedImagePreview);
            }

            const previewUrl = URL.createObjectURL(compressedFile);
            setCompressedImagePreview(previewUrl);
            toast.success('Gambar berhasil dikompres.');
        } catch {
            form.setData('image', null);
            form.setError(
                'image',
                'Gagal memproses gambar. Silakan coba lagi.',
            );
            toast.error('Gagal memproses gambar.');
            event.target.value = '';
        } finally {
            setIsCompressingImage(false);
        }
    };

    const handleConfirmShipmentChange = () => {
        setIsShipmentDialogOpen(false);
        setIsShipmentEditing(true);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.put(ordersUpdate({ order: order.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Paket berhasil diubah', {
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
                toast.error('Gagal mengubah paket', {
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

    const handleBack = () => {
        window.history.back();
    };

    return (
        <>
            <Head title={`Ubah Paket ${order.resi}`} />

            <Dialog
                open={isShipmentDialogOpen}
                onOpenChange={setIsShipmentDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <TriangleAlert className="size-5 text-amber-500" />
                            Ubah Kode Pengiriman
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Apakah anda yakin untuk mengubah Kode Pengiriman? Paket
                        ini akan dipindahkan ke pengiriman yang dipilih.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setIsShipmentDialogOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            className="bg-amber-500 text-white hover:bg-amber-600"
                            onClick={handleConfirmShipmentChange}
                        >
                            Ya, Ubah Pengiriman
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="space-y-6 p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <section className="overflow-hidden rounded-2xl border border-slate-300/90 bg-slate-50 dark:border-slate-400/45 dark:bg-slate-950/45">
                        <div className="border-b border-slate-300/80 bg-slate-300 px-6 py-4 dark:border-slate-400/35 dark:bg-slate-900">
                            <h2 className="text-center text-base font-semibold text-slate-900 dark:text-slate-50">
                                Form Ubah Paket
                            </h2>
                        </div>

                        <div className="grid gap-6 p-6 md:grid-cols-2 md:items-start">
                            {/* Nomor Resi */}
                            <div className="grid gap-2">
                                <Label htmlFor="resi">
                                    Nomor Resi{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="resi"
                                    type="text"
                                    value={form.data.resi}
                                    onChange={(event) =>
                                        form.setData('resi', event.target.value)
                                    }
                                    placeholder="Masukkan nomor resi"
                                    disabled={form.processing}
                                    autoFocus
                                />
                                <InputError message={form.errors.resi} />
                            </div>

                            {/* Kode Pengiriman */}
                            <div className="grid gap-2">
                                <Label htmlFor="shipment_id">
                                    Kode Pengiriman{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                {isShipmentEditing ? (
                                    <Combobox
                                        items={shipments}
                                        value={selectedShipment}
                                        onValueChange={(shipment) => {
                                            form.setData(
                                                'shipment_id',
                                                shipment?.id ?? null,
                                            );
                                        }}
                                        itemToStringLabel={(shipment) =>
                                            shipment.code
                                        }
                                        itemToStringValue={(shipment) =>
                                            String(shipment.id)
                                        }
                                    >
                                        <ComboboxInput
                                            id="shipment_id"
                                            placeholder="Cari kode pengiriman..."
                                            disabled={form.processing}
                                            className="w-full"
                                            showClear
                                        />
                                        <ComboboxContent>
                                            <ComboboxEmpty>
                                                Pengiriman tidak ditemukan.
                                            </ComboboxEmpty>
                                            <ComboboxList>
                                                {(shipment: ShipmentOption) => (
                                                    <ComboboxItem
                                                        key={shipment.id}
                                                        value={shipment}
                                                    >
                                                        {shipment.code}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="shipment_id"
                                            type="text"
                                            value={
                                                order.shipment_relation?.code ??
                                                '-'
                                            }
                                            disabled
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setIsShipmentDialogOpen(true)
                                            }
                                            disabled={form.processing}
                                        >
                                            Ubah
                                        </Button>
                                    </div>
                                )}
                                <InputError message={form.errors.shipment_id} />
                            </div>

                            {/* Pengirim */}
                            <div className="grid gap-2">
                                <Label htmlFor="sender_id">
                                    Pengirim{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Combobox
                                    items={senders}
                                    value={selectedSender}
                                    onValueChange={(sender) => {
                                        form.setData(
                                            'sender_id',
                                            sender?.id ?? null,
                                        );
                                    }}
                                    itemToStringLabel={(sender) =>
                                        `${sender.name} (${sender.code})`
                                    }
                                    itemToStringValue={(sender) =>
                                        String(sender.id)
                                    }
                                >
                                    <ComboboxInput
                                        id="sender_id"
                                        placeholder="Cari pengirim..."
                                        disabled={form.processing}
                                        className="w-full"
                                        showClear
                                    />
                                    <ComboboxContent>
                                        <ComboboxEmpty>
                                            Pengirim tidak ditemukan.
                                        </ComboboxEmpty>
                                        <ComboboxList>
                                            {(sender: SenderOption) => (
                                                <ComboboxItem
                                                    key={sender.id}
                                                    value={sender}
                                                >
                                                    <div className="flex flex-col">
                                                        <span>
                                                            {sender.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {sender.code}
                                                        </span>
                                                    </div>
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <InputError message={form.errors.sender_id} />
                            </div>

                            {/* Nama Penerima */}
                            <div className="grid gap-2">
                                <Label htmlFor="recipient_name">
                                    Nama Penerima{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="recipient_name"
                                    type="text"
                                    value={form.data.recipient_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'recipient_name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Masukkan nama penerima"
                                    disabled={form.processing}
                                />
                                <InputError
                                    message={form.errors.recipient_name}
                                />
                            </div>

                            {/* Gambar */}
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="image">Gambar</Label>
                                <Input
                                    ref={imageInputRef}
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={
                                        form.processing || isCompressingImage
                                    }
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {order.image_path !== null
                                        ? 'Upload gambar baru untuk mengganti gambar saat ini. '
                                        : ''}
                                    Gambar akan dikompres otomatis hingga
                                    maksimal 300 KB.
                                </p>
                                <InputError message={form.errors.image} />
                                {isCompressingImage && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Mengompres gambar...
                                    </p>
                                )}
                                {form.progress && (
                                    <p className="text-xs text-slate-500">
                                        Upload gambar:{' '}
                                        {form.progress.percentage}%
                                    </p>
                                )}
                                {compressedImagePreview !== null && (
                                    <div className="space-y-2 rounded-md border border-slate-300/80 bg-slate-100/80 p-3 dark:border-slate-500/35 dark:bg-slate-900/55">
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                            Preview hasil kompres
                                        </p>
                                        <img
                                            src={compressedImagePreview}
                                            alt="Preview gambar hasil kompres"
                                            className="max-h-56 w-auto rounded-md border border-slate-200 object-contain dark:border-slate-700"
                                        />
                                        {compressedImageSize !== null && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Ukuran hasil kompres:{' '}
                                                {formatFileSize(
                                                    compressedImageSize,
                                                )}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Catatan */}
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="note">Catatan</Label>
                                <textarea
                                    id="note"
                                    value={form.data.note}
                                    onChange={(event) =>
                                        form.setData('note', event.target.value)
                                    }
                                    placeholder="Tambahkan catatan order (opsional)"
                                    disabled={form.processing}
                                    rows={4}
                                    className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <InputError message={form.errors.note} />
                            </div>

                            {/* Dibuat oleh */}
                            <div className="grid gap-2 rounded-xl border border-slate-300/80 bg-slate-100/80 p-4 md:col-span-2 dark:border-slate-500/35 dark:bg-slate-900/55">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Dibuat oleh
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {order.created_by_name &&
                                    order.created_by_name.trim() !== ''
                                        ? order.created_by_name
                                        : '-'}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="-mt-4 rounded-2xl px-6 py-4">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleBack}
                                disabled={form.processing}
                            >
                                <ArrowLeft className="size-4" />
                                Kembali
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing || isCompressingImage}
                                className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                            >
                                {form.processing ? (
                                    <Spinner className="size-4" />
                                ) : (
                                    <Save className="size-4" />
                                )}
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </section>
                </form>
            </div>
        </>
    );
}

EditOrder.layout = {
    breadcrumbs: [
        {
            title: 'Paket',
            href: ordersIndex(),
        },
        {
            title: 'Ubah Paket',
            href: '#',
        },
    ],
};
