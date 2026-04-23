import { Head } from '@inertiajs/react';
import { CheckCircle2, Package, Truck } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { dashboard } from '@/routes';

type DashboardChartItem = {
    date: string;
    label: string;
    total: number;
};

type DashboardData = {
    latest_shipment_code: string | null;
    latest_shipment_package_total: number;
    completed_shipment_total: number;
    packages_last_7_days: DashboardChartItem[];
};

type DashboardProps = {
    dashboard: DashboardData;
};

const chartConfig = {
    total: {
        label: 'Paket',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

export default function Dashboard({ dashboard }: DashboardProps) {
    const latestShipmentCode = dashboard.latest_shipment_code ?? '-';
    const todayLabel = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <>
            <Head title="Dashboard">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=sora:400,500,600,700,800"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm md:p-6 dark:border-slate-800 dark:bg-slate-900">
                <Card className="relative overflow-hidden border-cyan-200/80 bg-white/85 py-0 dark:border-cyan-500/20 dark:bg-slate-900/80">
                    <CardContent className="relative bg-linear-to-br from-cyan-100/80 to-white p-6 md:p-8 dark:from-cyan-400/10 dark:to-slate-900">
                        <p className="mb-3 inline-flex rounded-full border border-cyan-300/70 bg-cyan-100/80 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-cyan-700 uppercase dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200">
                            Monitoring Pengiriman
                        </p>
                        <div className="relative z-10 space-y-2">
                            <h1 className="font-[Sora] text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
                                Dashboard Operasional Paket
                            </h1>
                            <p className="max-w-2xl text-sm leading-relaxed text-slate-800 md:text-base dark:text-slate-300">
                                Ringkasan pengiriman paket terbaru.
                            </p>
                            <p className="text-xs font-medium tracking-wide text-slate-800 uppercase dark:text-slate-400">
                                {todayLabel}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <div className="relative z-10 grid gap-4 md:grid-cols-3">
                    <Card className="border-pink-300/70 bg-linear-to-br from-pink-100/80 to-white py-0 dark:border-pink-500/25 dark:from-pink-500/10 dark:to-slate-900">
                        <CardHeader className="gap-3 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 text-pink-700 dark:text-pink-300">
                                <Truck className="h-5 w-5" />
                            </div>
                            <CardDescription className="text-slate-600 dark:text-slate-300">
                                Kode Pengiriman Terbaru
                            </CardDescription>
                            <CardTitle className="font-[Sora] text-2xl tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
                                {latestShipmentCode}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="border-amber-300/70 bg-linear-to-br from-amber-200/80 to-white py-0 dark:border-amber-500/25 dark:from-amber-500/10 dark:to-slate-900">
                        <CardHeader className="gap-3 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                <Package className="h-5 w-5" />
                            </div>
                            <CardDescription className="text-slate-600 dark:text-slate-300">
                                Jumlah Paket Pengiriman Terbaru
                            </CardDescription>
                            <CardTitle className="font-[Sora] text-2xl text-slate-900 tabular-nums md:text-3xl dark:text-slate-100">
                                {dashboard.latest_shipment_package_total.toLocaleString(
                                    'id-ID',
                                )}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="border-green-400/70 bg-linear-to-br from-green-300/80 to-white py-0 dark:border-green-500/25 dark:from-green-500/10 dark:to-slate-900">
                        <CardHeader className="gap-3 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-300 text-green-700 dark:text-slate-300">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <CardDescription className="text-slate-600 dark:text-slate-300">
                                Total Pengiriman Sudah Dilaksanakan
                            </CardDescription>
                            <CardTitle className="font-[Sora] text-2xl text-slate-900 tabular-nums md:text-3xl dark:text-slate-100">
                                {dashboard.completed_shipment_total.toLocaleString(
                                    'id-ID',
                                )}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
                <Card className="relative z-10 min-h-95 border-slate-200/80 bg-white/85 py-0 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/80">
                    <CardHeader className="gap-2 py-6">
                        <CardTitle className="font-[Sora] text-xl text-slate-900 dark:text-slate-100">
                            Jumlah Paket per Hari
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-300">
                            Tren 7 hari terakhir
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 pb-6">
                        <ChartContainer
                            className="h-full w-full"
                            config={chartConfig}
                        >
                            <BarChart data={dashboard.packages_last_7_days}>
                                <defs>
                                    <linearGradient
                                        id="packagesGradient"
                                        x1="0"
                                        x2="0"
                                        y1="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="hsl(var(--chart-1))"
                                            stopOpacity={0.95}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="hsl(var(--chart-2))"
                                            stopOpacity={0.65}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    stroke="hsl(var(--border))"
                                    strokeDasharray="4 4"
                                    vertical={false}
                                />
                                <XAxis
                                    axisLine={false}
                                    dataKey="label"
                                    fontSize={12}
                                    tickLine={false}
                                    tickMargin={10}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    fontSize={12}
                                    tickLine={false}
                                    width={30}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value) => [
                                                <span
                                                    className="font-medium text-foreground"
                                                    key="value"
                                                >
                                                    {Number(
                                                        value,
                                                    ).toLocaleString(
                                                        'id-ID',
                                                    )}{' '}
                                                    paket
                                                </span>,
                                            ]}
                                        />
                                    }
                                />
                                <Bar
                                    dataKey="total"
                                    fill="url(#packagesGradient)"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
