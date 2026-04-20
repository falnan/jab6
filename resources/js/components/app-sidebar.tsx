import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    PackageIcon,
    ShipIcon,
    TruckIcon,
    UserIcon,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import orders from '@/routes/orders';
import senders from '@/routes/senders';
import shipments from '@/routes/shipments';
import users from '@/routes/users';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Admin',
        href: users.index(),
        icon: UserIcon,
    },
    {
        title: 'Ekspedisi',
        href: senders.index(),
        icon: TruckIcon,
    },
    {
        title: 'Pengiriman',
        href: shipments.index(),
        icon: ShipIcon,
    },
    {
        title: 'Paket',
        href: orders.index(),
        icon: PackageIcon,
    },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: FolderGit2,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export interface User {
    id: number;
    name: string;
    role: string;
}

export interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: unknown;
}

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const isMainAdmin = auth?.user?.role === 'main_admin';

    const visibleMainNavItems = mainNavItems.filter((item) => {
        if (isMainAdmin) {
            return true;
        }

        return !['Dashboard', 'Admin', 'Ekspedisi'].includes(item.title);
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleMainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
