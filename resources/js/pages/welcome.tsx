import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';

type PageProps = {
    auth: {
        user?: unknown;
    };
};

const highlights = [
    {
        title: 'Cepat Diluncurkan',
        description:
            'Mulai dari ide sampai online lebih cepat dengan struktur yang rapi dan mudah dikembangkan.',
    },
    {
        title: 'Fokus Pada Pengalaman',
        description:
            'Tampilan modern, navigasi jelas, dan interaksi yang terasa halus di desktop maupun mobile.',
    },
    {
        title: 'Siap Bertumbuh',
        description:
            'Arsitektur fleksibel untuk fitur baru, kolaborasi tim, dan pengembangan jangka panjang.',
    },
];

export default function Welcome() {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Selamat Datang">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=sora:400,500,600,700,800"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
                <div className="pointer-events-none absolute top-24 -left-32 h-80 w-80 rounded-full bg-cyan-400/30 blur-3xl" />
                <div className="pointer-events-none absolute top-0 -right-20 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-300/20 blur-3xl" />

                <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 lg:px-10">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-300 to-emerald-300" />
                        <span className="font-[Sora] text-sm font-semibold tracking-[0.2em] text-slate-200 uppercase">
                            NOVASTACK
                        </span>
                    </div>

                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-full border border-white/25 bg-white/5 px-5 py-2 text-sm font-medium text-white transition hover:border-white/50 hover:bg-white/10"
                            >
                                Masuk ke Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                                >
                                    Login
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="relative mx-auto grid w-full max-w-6xl gap-8 px-6 pt-10 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-10 lg:pt-16">
                    <section className="space-y-8">
                        <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold tracking-[0.14em] text-cyan-200 uppercase">
                            Solusi Digital Modern
                        </p>

                        <div className="space-y-5">
                            <h1 className="font-[Sora] text-4xl leading-tight font-extrabold text-white sm:text-5xl lg:text-6xl">
                                Website Profesional
                                <span className="block bg-gradient-to-r from-cyan-200 via-emerald-200 to-lime-100 bg-clip-text text-transparent">
                                    untuk Bisnis yang Bertumbuh
                                </span>
                            </h1>
                            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                                Halaman ini siap menjadi titik awal produk Anda:
                                cepat, elegan, dan fokus pada pengalaman
                                pengguna yang meyakinkan.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <a
                                href="#fitur"
                                className="rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:scale-[1.02]"
                            >
                                Lihat Fitur
                            </a>
                            {!auth.user && (
                                <Link
                                    href={login()}
                                    className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
                                >
                                    Coba Sekarang
                                </Link>
                            )}
                        </div>
                    </section>

                    <section className="relative">
                        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="font-[Sora] text-lg font-semibold text-white">
                                    Ringkasan Performa
                                </h2>
                                <span className="rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                                    +28% minggu ini
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-2xl bg-slate-900/60 p-4">
                                    <p className="text-xs tracking-[0.12em] text-slate-400 uppercase">
                                        Pengunjung Aktif
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-white">
                                        18.240
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-2xl bg-slate-900/60 p-4">
                                        <p className="text-xs tracking-[0.12em] text-slate-400 uppercase">
                                            Konversi
                                        </p>
                                        <p className="mt-2 text-xl font-bold text-cyan-200">
                                            6.9%
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-900/60 p-4">
                                        <p className="text-xs tracking-[0.12em] text-slate-400 uppercase">
                                            Kepuasan
                                        </p>
                                        <p className="mt-2 text-xl font-bold text-emerald-200">
                                            4.8 / 5
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <section
                    id="fitur"
                    className="relative mx-auto w-full max-w-6xl px-6 pb-20 lg:px-10"
                >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {highlights.map((item) => (
                            <article
                                key={item.title}
                                className="rounded-2xl border border-white/15 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
                            >
                                <h3 className="font-[Sora] text-lg font-semibold text-white">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                    {item.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
