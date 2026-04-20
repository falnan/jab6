import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { index as shipmentsIndex, store } from '@/routes/shipments';

type CreateShipmentForm = {
    code: string;
};

export default function CreateShipment() {
    const form = useForm<CreateShipmentForm>({
        code: '',
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Shipment berhasil dibuat', {
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
                toast.error('Gagal membuat shipment', {
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
        router.visit(shipmentsIndex().url);
    };

    return (
        <>
            <Head title="Tambah Pengiriman" />

            <div className="space-y-6 p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <section className="overflow-hidden rounded-xl border border-slate-300/90 bg-slate-50 shadow-sm dark:border-slate-400/45 dark:bg-slate-950/45">
                        <div className="border-b border-slate-300/80 bg-slate-300 px-6 py-4 dark:border-slate-400/35 dark:bg-slate-900">
                            <h2 className="text-center text-base font-semibold text-slate-900 dark:text-slate-50">
                                Form Tambah Data Pengiriman
                            </h2>
                        </div>

                        <div className="grid gap-6 p-6">
                            <div className="grid gap-2">
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
                        </div>
                    </section>

                    <section className="rounded-xl px-6 py-4">
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
                                disabled={form.processing}
                                className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                            >
                                {form.processing ? (
                                    <Spinner className="size-4" />
                                ) : (
                                    <Save className="size-4" />
                                )}
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Pengiriman'}
                            </Button>
                        </div>
                    </section>
                </form>
            </div>
        </>
    );
}

CreateShipment.layout = {
    breadcrumbs: [
        {
            title: 'Pengiriman',
            href: shipmentsIndex(),
        },
        {
            title: 'Tambah Pengiriman',
            href: '#',
        },
    ],
};
