import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { index as usersIndex, update } from '@/routes/users';

type RoleValue = 'main_admin' | 'input_admin';

type EditableUser = {
    id: number;
    name: string;
    email: string;
    role: RoleValue;
    is_active: boolean | number;
};

type EditUserForm = {
    name: string;
    email: string;
    role: RoleValue;
    is_active: boolean;
    password: string;
    password_confirmation: string;
};

type EditUserPageProps = {
    user: EditableUser;
};

export default function EditUser({ user }: EditUserPageProps) {
    const form = useForm<EditUserForm>({
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: Boolean(user.is_active),
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.put(update({ user: user.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('password', 'password_confirmation');
                toast.success('Admin berhasil diubah', {
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
                toast.error('Gagal mengubah admin', {
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
        router.visit(usersIndex().url);
    };

    return (
        <>
            <Head title="Ubah Admin" />

            <div className="space-y-6 p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <section className="overflow-hidden rounded-2xl border border-slate-300/90 bg-slate-50 dark:border-slate-400/45 dark:bg-slate-950/45">
                        <div className="border-b border-slate-300/80 bg-slate-300 px-6 py-4 dark:border-slate-400/35 dark:bg-slate-900">
                            <h2 className="text-center text-base font-semibold text-slate-900 dark:text-slate-50">
                                Form Ubah Admin
                            </h2>
                        </div>

                        <div className="grid gap-6 p-6 md:grid-cols-2">
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="name">
                                    Nama <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    placeholder="Masukkan nama admin"
                                    autoComplete="name"
                                    disabled={form.processing}
                                    autoFocus
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    Alamat Email{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="admin@email.com"
                                    autoComplete="email"
                                    disabled={form.processing}
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role">
                                    Peran{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={form.data.role}
                                    onValueChange={(value) =>
                                        form.setData('role', value as RoleValue)
                                    }
                                    disabled={form.processing}
                                >
                                    <SelectTrigger id="role" className="w-full">
                                        <SelectValue placeholder="Pilih peran admin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="main_admin">
                                            Admin Utama
                                        </SelectItem>
                                        <SelectItem value="input_admin">
                                            Admin Input
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.role} />
                            </div>

                            <div className="grid gap-3 md:col-span-2">
                                <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-300/80 bg-slate-100/80 p-4 dark:border-slate-500/35 dark:bg-slate-900/55">
                                    <div className="space-y-1">
                                        <Label htmlFor="is_active">
                                            Status{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Atur status akun admin apakah aktif
                                            atau nonaktif.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {form.data.is_active
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </span>
                                        <Switch
                                            id="is_active"
                                            checked={form.data.is_active}
                                            onCheckedChange={(checked) =>
                                                form.setData(
                                                    'is_active',
                                                    checked,
                                                )
                                            }
                                            disabled={form.processing}
                                            className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500"
                                        />
                                    </div>
                                </div>
                                <InputError message={form.errors.is_active} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    Kata Sandi Baru (Opsional)
                                </Label>
                                <PasswordInput
                                    id="password"
                                    value={form.data.password}
                                    onChange={(event) =>
                                        form.setData(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Kosongkan jika tidak ingin mengganti"
                                    autoComplete="new-password"
                                    disabled={form.processing}
                                />
                                <InputError message={form.errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Konfirmasi Kata Sandi Baru
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    value={form.data.password_confirmation}
                                    onChange={(event) =>
                                        form.setData(
                                            'password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Ulangi kata sandi baru"
                                    autoComplete="new-password"
                                    disabled={form.processing}
                                />
                                <InputError
                                    message={form.errors.password_confirmation}
                                />
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
                                    : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </section>
                </form>
            </div>
        </>
    );
}

EditUser.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: usersIndex(),
        },
        {
            title: 'Ubah Admin',
            href: '#',
        },
    ],
};
