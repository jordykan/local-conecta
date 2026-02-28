"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconBuilding,
  IconCategory,
  IconHome,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: IconLayoutDashboard,
  },
  {
    title: "Negocios",
    href: "/admin/businesses",
    icon: IconBuilding,
  },
  {
    title: "Categorías",
    href: "/admin/categories",
    icon: IconCategory,
  },
];

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/admin"
          className="flex items-center gap-3 font-semibold"
          onClick={onClose}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 shadow-sm">
            <span className="text-lg font-bold text-white">LC</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm leading-tight">Admin Panel</span>
            <span className="text-xs text-muted-foreground">Mercadito</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Menú Principal
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110",
                )}
              />
              {item.title}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <IconHome className="h-5 w-5" />
          Volver al sitio
        </Link>
      </div>
    </>
  );
}

type AdminSidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-card lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <SidebarContent pathname={pathname} onClose={onMobileClose} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
