import { Head, router, useForm } from '@inertiajs/react';
import imageCompression from 'browser-image-compression';
import { ArrowLeft, PackagePlus, ScanLine, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    index as shipmentsIndex,
    show as shipmentShow,
} from '@/routes/shipments';
import shipmentOrders from '@/routes/shipments/orders';

type ShipmentSummary = {
    id: number;
    code: string;
    status: string;
};

type ShipmentOrderPageProps = {
    shipment: ShipmentSummary;
    senders: SenderOption[];
};

type SenderOption = {
    id: number;
    code: string;
    name: string;
};

type ShipmentOrderForm = {
    resi: string;
    sender_id: number | null;
    recipient_name: string;
    image: File | null;
    note: string;
};

type CompressionMode = 'default' | '2x' | '4x' | '8x';

const SCANNER_ELEMENT_ID = 'shipment-resi-scanner';
const COMPRESSION_LIMITS: Record<CompressionMode, number | null> = {
    default: null,
    '2x': 1024 * 1024,
    '4x': 500 * 1024,
    '8x': 300 * 1024,
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    return `${(bytes / 1024).toFixed(1)} KB`;
};

export default function ShipmentOrder({
    shipment,
    senders,
}: ShipmentOrderPageProps) {
    const form = useForm<ShipmentOrderForm>({
        resi: '',
        sender_id: null,
        recipient_name: '',
        image: null,
        note: '',
    });
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [isCompressingImage, setIsCompressingImage] = useState(false);
    const [compressionMode, setCompressionMode] =
        useState<CompressionMode>('8x');
    const [originalImageFile, setOriginalImageFile] = useState<File | null>(
        null,
    );
    const [compressedImagePreview, setCompressedImagePreview] = useState<
        string | null
    >(null);
    const [compressedImageSize, setCompressedImageSize] = useState<
        number | null
    >(null);
    const scannerRef = useRef<{
        stop: () => Promise<void>;
        clear: () => void;
    } | null>(null);
    const scannedOnceRef = useRef(false);
    const selectedSender = useMemo(() => {
        if (form.data.sender_id === null) {
            return null;
        }

        return (
            senders.find((sender) => sender.id === form.data.sender_id) ?? null
        );
    }, [form.data.sender_id, senders]);

    useEffect(() => {
        return () => {
            if (compressedImagePreview !== null) {
                URL.revokeObjectURL(compressedImagePreview);
            }
        };
    }, [compressedImagePreview]);

    const setPreviewFromFile = useCallback((file: File) => {
        const previewUrl = URL.createObjectURL(file);

        setCompressedImagePreview((previousPreview) => {
            if (previousPreview !== null) {
                URL.revokeObjectURL(previousPreview);
            }

            return previewUrl;
        });
    }, []);

    const compressionLimit = COMPRESSION_LIMITS[compressionMode];

    const processImageFile = useCallback(
        async (
            selectedFile: File,
            selectedCompressionMode: CompressionMode,
        ) => {
            const selectedCompressionLimit =
                COMPRESSION_LIMITS[selectedCompressionMode];

            if (selectedCompressionLimit === null) {
                form.clearErrors('image');
                form.setData('image', selectedFile);
                setCompressedImageSize(selectedFile.size);
                setPreviewFromFile(selectedFile);

                return;
            }

            try {
                setIsCompressingImage(true);

                const compressedFile = await imageCompression(selectedFile, {
                    maxSizeMB: selectedCompressionLimit / (1024 * 1024),
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                    initialQuality: 0.8,
                    fileType: selectedFile.type,
                });

                if (compressedFile.size > selectedCompressionLimit) {
                    form.setData('image', null);
                    form.setError(
                        'image',
                        `Ukuran hasil kompres melebihi ${formatFileSize(selectedCompressionLimit)}.`,
                    );
                    toast.error(
                        `Ukuran hasil kompres melebihi ${formatFileSize(selectedCompressionLimit)}.`,
                    );

                    return;
                }

                form.clearErrors('image');
                form.setData('image', compressedFile);
                setCompressedImageSize(compressedFile.size);
                setPreviewFromFile(compressedFile);

                toast.success('Gambar berhasil diproses.', {
                    position: 'top-right',
                });
            } catch {
                form.setData('image', null);
                form.setError(
                    'image',
                    'Gagal memproses gambar. Silakan coba lagi.',
                );
                toast.error('Gagal memproses gambar.');
            } finally {
                setIsCompressingImage(false);
            }
        },
        [form, setPreviewFromFile],
    );

    const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] ?? null;

        if (selectedFile === null) {
            form.setData('image', null);
            form.clearErrors('image');
            setCompressedImageSize(null);
            setOriginalImageFile(null);

            if (compressedImagePreview !== null) {
                URL.revokeObjectURL(compressedImagePreview);
                setCompressedImagePreview(null);
            }

            return;
        }

        const isImageType = selectedFile.type.startsWith('image/');

        if (!isImageType) {
            form.setData('image', null);
            setOriginalImageFile(null);
            form.setError(
                'image',
                'File harus berupa gambar (jpg, png, webp, dll).',
            );
            toast.error('File upload harus berupa image.');
            event.target.value = '';

            return;
        }

        setOriginalImageFile(selectedFile);
    };

    useEffect(() => {
        if (originalImageFile === null) {
            return;
        }

        void processImageFile(originalImageFile, compressionMode);
    }, [compressionMode, originalImageFile, processImageFile]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(shipmentOrders.store({ shipment: shipment.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Order berhasil ditambahkan', {
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
                toast.error('Gagal menambahkan order', {
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
        router.visit(shipmentShow({ shipment: shipment.id }).url);
    };

    const openScanner = () => {
        setScannerError(null);
        scannedOnceRef.current = false;
        setIsScannerOpen(true);
    };

    const closeScanner = () => {
        setIsScannerOpen(false);
    };

    useEffect(() => {
        if (!isScannerOpen) {
            const activeScanner = scannerRef.current;
            scannerRef.current = null;

            if (activeScanner) {
                void activeScanner
                    .stop()
                    .catch(() => {
                        return;
                    })
                    .finally(() => {
                        activeScanner.clear();
                    });
            }

            return;
        }

        let isCancelled = false;

        const startScanner = async () => {
            try {
                // Tunggu DOM terupdate sebelum inisialisasi scanner
                await new Promise((resolve) => setTimeout(resolve, 100));

                if (isCancelled) {
                    return;
                }

                const { Html5Qrcode } = await import('html5-qrcode');

                if (isCancelled) {
                    return;
                }

                const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID, {
                    verbose: false,
                });

                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    // { fps: 30, qrbox: { width: 300, height: 150 } },
                    { fps: 30 },
                    (decodedText) => {
                        if (scannedOnceRef.current) {
                            return;
                        }

                        scannedOnceRef.current = true;
                        form.setData('resi', decodedText);
                        toast.success('Resi berhasil dipindai', {
                            position: 'top-right',
                            style: {
                                borderRadius: '8px',
                                background: '#ffffff',
                                color: '#1f2937',
                                border: '1px solid #4ade80',
                            },
                        });
                        closeScanner();
                    },
                    (error) => {
                        // Silently ignore decoding errors
                        console.debug('Decoding error (ignored):', error);
                    },
                );
            } catch (error) {
                console.error('Scanner initialization error:', error);

                let message = 'Gagal membuka kamera';

                if (error instanceof Error) {
                    const errorMessage = error.message.toLowerCase();

                    if (
                        errorMessage.includes('permission') ||
                        errorMessage.includes('denied')
                    ) {
                        message =
                            'Izin kamera ditolak. Periksa pengaturan privasi browser Anda.';
                    } else if (
                        errorMessage.includes('not found') ||
                        errorMessage.includes('no device')
                    ) {
                        message = 'Kamera tidak tersedia pada perangkat ini.';
                    } else if (errorMessage.includes('not secure')) {
                        message =
                            'Aplikasi harus diakses melalui HTTPS untuk menggunakan kamera.';
                    }
                }

                setScannerError(message);
                toast.error(message, {
                    position: 'top-right',
                    style: {
                        borderRadius: '8px',
                        background: '#ffffff',
                        color: '#1f2937',
                        border: '1px solid #f87171',
                    },
                });
            }
        };

        void startScanner();

        return () => {
            isCancelled = true;
        };
    }, [form, isScannerOpen]);

    return (
        <>
            <Head title={`Tambah Order ${shipment.code}`} />

            <div className="space-y-6 p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <section className="overflow-hidden rounded-2xl border border-slate-300/90 bg-slate-50 dark:border-slate-400/45 dark:bg-slate-950/45">
                        <div className="border-b border-slate-300/80 bg-slate-300 px-6 py-4 dark:border-slate-400/35 dark:bg-slate-900">
                            <h2 className="text-center text-base font-semibold text-slate-900 dark:text-slate-50">
                                Form Tambah Order
                            </h2>
                        </div>

                        <div className="grid gap-6 p-6 md:grid-cols-2 md:items-start">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="shipment">
                                    Kode Pengiriman{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="shipment"
                                    type="text"
                                    value={shipment.code}
                                    disabled
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="resi">
                                    Nomor Resi{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="resi"
                                        type="text"
                                        value={form.data.resi}
                                        onChange={(event) =>
                                            form.setData(
                                                'resi',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Masukkan nomor resi"
                                        disabled={form.processing}
                                        autoFocus
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={
                                            isScannerOpen
                                                ? closeScanner
                                                : openScanner
                                        }
                                        disabled={form.processing}
                                    >
                                        {isScannerOpen ? (
                                            <>
                                                <X className="size-4" />
                                                Tutup Scan
                                            </>
                                        ) : (
                                            <>
                                                <ScanLine className="size-4" />
                                                Scan
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <InputError message={form.errors.resi} />

                                {isScannerOpen && (
                                    <div className="mt-3 overflow-hidden rounded-md border border-slate-300/80 bg-slate-100/80 dark:border-slate-500/35 dark:bg-slate-900/55">
                                        <div
                                            id={SCANNER_ELEMENT_ID}
                                            className="min-h-60 bg-black"
                                        />
                                        <div className="border-t border-slate-300/80 px-3 py-2 dark:border-slate-500/35">
                                            <p className="text-xs text-slate-600 dark:text-slate-300">
                                                Arahkan kamera ke barcode / QR
                                                resi.
                                            </p>
                                        </div>
                                        {scannerError !== null && (
                                            <div className="border-t border-rose-200 bg-rose-50 px-3 py-3 dark:border-rose-900/50 dark:bg-rose-950/30">
                                                <p className="text-xs text-rose-600 dark:text-rose-400">
                                                    <span className="font-medium">
                                                        Peringatan:
                                                    </span>{' '}
                                                    {scannerError}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sender_id">
                                    Ekspedisi{' '}
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

                            <div className="grid gap-2">
                                <Label htmlFor="image">Gambar</Label>
                                <Tabs
                                    value={compressionMode}
                                    onValueChange={(value) => {
                                        setCompressionMode(
                                            value as CompressionMode,
                                        );
                                    }}
                                    className="w-full"
                                >
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="default">
                                            Default
                                        </TabsTrigger>
                                        <TabsTrigger value="2x">2x</TabsTrigger>
                                        <TabsTrigger value="4x">4x</TabsTrigger>
                                        <TabsTrigger value="8x">8x</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleImageChange}
                                    disabled={
                                        form.processing || isCompressingImage
                                    }
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {compressionLimit === null
                                        ? 'Mode default: gambar tidak dikompres.'
                                        : `Mode ${compressionMode}: gambar dikompres hingga maksimal ${formatFileSize(compressionLimit)}.`}
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
                                            Preview gambar
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
                                    <PackagePlus className="size-4" />
                                )}
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Order'}
                            </Button>
                        </div>
                    </section>
                </form>
            </div>
        </>
    );
}

ShipmentOrder.layout = {
    breadcrumbs: [
        {
            title: 'Pengiriman',
            href: shipmentsIndex(),
        },
        {
            title: 'Tambah Order',
            href: '#',
        },
    ],
};
