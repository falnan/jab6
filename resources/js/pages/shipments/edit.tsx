import { Head, router, useForm } from '@inertiajs/react';
import { format as formatDateFns } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircleIcon,
    ClockIcon,
    Save,
    ShipIcon,
    Trash2,
    XIcon,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
    destroy as shipmentDestroy,
    index as shipmentsIndex,
    show as shipmentShow,
    update as shipmentUpdate,
} from '@/routes/shipments';

type ShipmentStatus = 'pending' | 'shipped' | 'arrived';

type EditableShipment = {
    id: number;
    code: string;
    status: ShipmentStatus;
    shipped_at: string | null;
    arrived_at: string | null;
};

type EditShipmentPageProps = {
    shipment: EditableShipment;
};

type EditShipmentForm = {
    code: string;
    status: ShipmentStatus;
    shipped_at: string | null;
    arrived_at: string | null;
};

function parseDateInput(value: string | null): Date | undefined {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value.slice(0, 10).split('-').map(Number);

    if (!year || !month || !day) {
        return undefined;
    }

    return new Date(year, month - 1, day);
}

function formatDateInput(date: Date | undefined): string | null {
    if (!date) {
        return null;
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDateLabel(dateValue?: string | null): string {
    if (!dateValue) {
        return 'Pilih tanggal';
    }

    const date = parseDateInput(dateValue);

    if (!date) {
        return 'Pilih tanggal';
    }

    return formatDateFns(date, 'dd MMM yyyy', { locale: localeId });
}

export default function EditShipment({ shipment }: EditShipmentPageProps) {
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<EditShipmentForm>({
        code: shipment.code,
        status: shipment.status,
        shipped_at: formatDateInput(parseDateInput(shipment.shipped_at)),
        arrived_at: formatDateInput(parseDateInput(shipment.arrived_at)),
    });

    const handleDateChange = (
        field: 'shipped_at' | 'arrived_at',
        date: Date | undefined,
    ) => {
        form.setData(field, formatDateInput(date));
    };

    const handleDateClear = (field: 'shipped_at' | 'arrived_at') => {
        form.setData(field, null);
        form.clearErrors(field);
    };

    const handleDelete = () => {
        setIsDeleting(true);

        router.delete(shipmentDestroy({ shipment: shipment.id }).url, {
            onSuccess: () => {
                toast.success('Shipment berhasil dihapus', {
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
                setIsDeleting(false);
                setConfirmDeleteOpen(false);
                toast.error('Gagal menghapus shipment', {
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

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.put(shipmentUpdate({ shipment: shipment.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Shipment berhasil diperbarui', {
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
                toast.error('Gagal memperbarui shipment', {
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

    return (
        <>
            <Head title={`Ubah Pengiriman ${shipment.code}`} />

            <div className="space-y-6 p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <section className="overflow-hidden rounded-xl border border-slate-300/90 bg-slate-50 shadow-sm dark:border-slate-400/45 dark:bg-slate-950/45">
                        <div className="border-b border-slate-300/80 bg-slate-300 px-6 py-4 dark:border-slate-400/35 dark:bg-slate-900">
                            <h2 className="text-center text-base font-semibold text-slate-900 dark:text-slate-50">
                                Form Ubah Data Pengiriman
                            </h2>
                        </div>

                        <div className="grid gap-6 p-6 md:grid-cols-2">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="code">Kode Pengiriman</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    value={form.data.code}
                                    onChange={(event) =>
                                        form.setData('code', event.target.value)
                                    }
                                    placeholder="Contoh: SHP-2026-001"
                                    disabled={form.processing}
                                    autoFocus
                                />
                                <InputError message={form.errors.code} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={form.data.status}
                                    onValueChange={(value) =>
                                        form.setData(
                                            'status',
                                            value as ShipmentStatus,
                                        )
                                    }
                                    disabled={form.processing}
                                >
                                    <SelectTrigger
                                        id="status"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Pilih status shipment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">
                                            <ClockIcon className="text-slate-500" />
                                            Menunggu
                                        </SelectItem>
                                        <SelectItem value="shipped">
                                            <ShipIcon className="text-blue-500" />
                                            Dikirim
                                        </SelectItem>
                                        <SelectItem value="arrived">
                                            <CheckCircleIcon className="text-green-500" />
                                            Tiba
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.status} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="shipped_at">
                                    Tanggal Dikirim
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="shipped_at"
                                                type="button"
                                                variant="outline"
                                                disabled={form.processing}
                                                className="flex-1 justify-between border-slate-300 bg-slate-50 font-normal text-slate-700 shadow-xs hover:bg-slate-100 dark:border-slate-400/35 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <span>
                                                    {formatDateLabel(
                                                        form.data.shipped_at,
                                                    )}
                                                </span>
                                                <CalendarDays className="size-4 text-slate-500 dark:text-slate-400" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            align="start"
                                            className="w-auto border-slate-300 p-0 dark:border-slate-400/35"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={parseDateInput(
                                                    form.data.shipped_at,
                                                )}
                                                onSelect={(date) =>
                                                    handleDateChange(
                                                        'shipped_at',
                                                        date,
                                                    )
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    {form.data.shipped_at ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Hapus tanggal dikirim"
                                            title="Hapus tanggal dikirim"
                                            onClick={() =>
                                                handleDateClear('shipped_at')
                                            }
                                            disabled={form.processing}
                                            className="shrink-0 text-slate-500 hover:bg-slate-200/70 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                        >
                                            <XIcon className="size-4" />
                                        </Button>
                                    ) : null}
                                </div>
                                <InputError message={form.errors.shipped_at} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="arrived_at">Tanggal Tiba</Label>
                                <div className="flex items-center gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="arrived_at"
                                                type="button"
                                                variant="outline"
                                                disabled={form.processing}
                                                className="flex-1 justify-between border-slate-300 bg-slate-50 font-normal text-slate-700 shadow-xs hover:bg-slate-100 dark:border-slate-400/35 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <span>
                                                    {formatDateLabel(
                                                        form.data.arrived_at,
                                                    )}
                                                </span>
                                                <CalendarDays className="size-4 text-slate-500 dark:text-slate-400" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            align="start"
                                            className="w-auto border-slate-300 p-0 dark:border-slate-400/35"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={parseDateInput(
                                                    form.data.arrived_at,
                                                )}
                                                onSelect={(date) =>
                                                    handleDateChange(
                                                        'arrived_at',
                                                        date,
                                                    )
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    {form.data.arrived_at ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Hapus tanggal tiba"
                                            title="Hapus tanggal tiba"
                                            onClick={() =>
                                                handleDateClear('arrived_at')
                                            }
                                            disabled={form.processing}
                                            className="shrink-0 text-slate-500 hover:bg-slate-200/70 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                        >
                                            <XIcon className="size-4" />
                                        </Button>
                                    ) : null}
                                </div>
                                <InputError message={form.errors.arrived_at} />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl px-6 py-4">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setConfirmDeleteOpen(true)}
                                disabled={form.processing || isDeleting}
                                className="bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                            >
                                <Trash2 className="size-4" />
                                Hapus Shipment
                            </Button>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleBack}
                                    disabled={form.processing || isDeleting}
                                >
                                    <ArrowLeft className="size-4" />
                                    Kembali
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.processing || isDeleting}
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
                        </div>
                    </section>
                </form>

                <Dialog
                    open={confirmDeleteOpen}
                    onOpenChange={setConfirmDeleteOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Shipment</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus shipment{' '}
                                <strong>{shipment.code}</strong>? Seluruh order
                                dan gambar yang terkait akan ikut terhapus.
                                Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setConfirmDeleteOpen(false)}
                                disabled={isDeleting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                            >
                                {isDeleting ? (
                                    <Spinner className="size-4" />
                                ) : (
                                    <Trash2 className="size-4" />
                                )}
                                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

EditShipment.layout = {
    breadcrumbs: [
        {
            title: 'Pengiriman',
            href: shipmentsIndex(),
        },
        {
            title: 'Ubah Pengiriman',
            href: '#',
        },
    ],
};
