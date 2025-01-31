'use client';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { NavItem } from '@/types';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { userMenuItems } from '@/constants/sidebar';
import { ChevronRight, GalleryVerticalEnd } from 'lucide-react';
// import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';

export const company = {
    name: 'RAComputex',
    logo: GalleryVerticalEnd,
    plan: 'Enterprise',
};

export default function AppSidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden md:block">
                <DesktopSidebar pathname={pathname} />
            </div>

            {/* Mobile Bottom Navigation - Hidden on desktop */}
            <div className="fixed bottom-0 left-0 right-0 border-t bg-background md:hidden z-50">
                <MobileNavigation pathname={pathname} />
            </div>
        </>
    );
}

function DesktopSidebar({ pathname }: { pathname: string }) {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex gap-2 py-2 text-sidebar-accent-foreground">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <company.logo className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                            {company.name}
                        </span>
                        <span className="truncate text-xs">{company.plan}</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="overflow-x-hidden">
                <SidebarGroup>
                    <SidebarGroupLabel>Menu User</SidebarGroupLabel>
                    <SidebarMenu>
                        {userMenuItems.map((item) => (
                            <DesktopMenuItem
                                key={item.title}
                                item={item}
                                pathname={pathname}
                            />
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}

function DesktopMenuItem({
    item,
    pathname,
}: {
    item: NavItem;
    pathname: string;
}) {
    const Icon = item.icon ? Icons[item.icon] : Icons.logo;
    const isActiveParent =
        pathname === item.url ||
        pathname.startsWith(`${item.url}/`) ||
        pathname.startsWith(`${item.url}?`);
    if (item?.items?.length) {
        return (
            <Collapsible
                asChild
                // defaultOpen={item.isActive}
                className="group/collapsible"
            >
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            tooltip={item.title}
                            isActive={isActiveParent}
                        >
                            {item.icon && <Icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={pathname === subItem.url}
                                    >
                                        <Link href={subItem.url}>
                                            <span>{subItem.title}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        );
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActiveParent}
            >
                <Link href={item.url}>
                    <Icon />
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function MobileNavigation({ pathname }: { pathname: string }) {
    return (
        <nav className="flex items-center justify-around p-2">
            {userMenuItems.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                const isActiveParent =
                    pathname === item.url ||
                    pathname.startsWith(`${item.url}/`) ||
                    pathname.startsWith(`${item.url}?`);
                return (
                    <Link
                        key={item.title}
                        href={item.url}
                        className={`flex flex-col items-center p-2 rounded-lg ${
                            isActiveParent
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-muted'
                        }`}
                    >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs mt-1 hidden md:inline">
                            {item.title}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
