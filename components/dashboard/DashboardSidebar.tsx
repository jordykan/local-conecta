"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  IconLayoutDashboard,
  IconPackage,
  IconClock,
  IconCalendarEvent,
  IconMessage,
  IconSpeakerphone,
  IconStar,
  IconChartBar,
  IconArrowLeft,
  IconMenu2,
  IconLogout,
  IconLoader2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/(auth)/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { DashboardUser, DashboardBusiness } from "./types";

interface SidebarProps {
  business: DashboardBusiness;
  user: DashboardUser;
}

const navItems: Array<{
  href: string;
  label: string;
  icon: typeof IconLayoutDashboard;
  soon?: boolean;
}> = [
  { href: "/dashboard", label: "Vista general", icon: IconLayoutDashboard },
  {
    href: "/dashboard/products",
    label: "Productos y servicios",
    icon: IconPackage,
  },
  { href: "/dashboard/hours", label: "Horarios", icon: IconClock },
  { href: "/dashboard/bookings", label: "Apartados", icon: IconCalendarEvent },
  { href: "/dashboard/messages", label: "Mensajes", icon: IconMessage },
  {
    href: "/dashboard/promotions",
    label: "Promociones",
    icon: IconSpeakerphone,
  },
  { href: "/dashboard/reviews", label: "Reseñas", icon: IconStar },
  { href: "/dashboard/analytics", label: "Analíticas", icon: IconChartBar },
];

const STATUS_MAP: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  active: { label: "Activo", variant: "default" },
  pending: { label: "En revision", variant: "secondary" },
  suspended: { label: "Suspendido", variant: "destructive" },
};

interface NavContentProps extends SidebarProps {
  pathname: string;
  onNavigate?: () => void;
}

function NavContent({ business, user, pathname, onNavigate }: NavContentProps) {
  const [isPending, startTransition] = useTransition();
  const [loadingHref, setLoadingHref] = useState<string | null>(null);
  const router = useRouter();
  const status = STATUS_MAP[business.status] ?? STATUS_MAP.pending;

  function handleLogout() {
    startTransition(() => {
      logout();
    });
  }

  function handleLinkClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    soon?: boolean,
  ) {
    if (soon) return;

    // Ignore modified clicks to let them open in new tab normally
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    if (pathname === href) {
      if (onNavigate) onNavigate();
      return;
    }

    e.preventDefault();
    setLoadingHref(href);

    startTransition(() => {
      router.push(href);
    });

    if (onNavigate) {
      onNavigate();
    }
  }

  return (
    <>
      {/* Business info */}
      <div className="flex items-center gap-3 px-5 pb-4">
        <Avatar size="lg">
          {business.logo_url ? (
            <AvatarImage src={business.logo_url} alt={business.name} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {business.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">
            {business.name}
          </p>
          <Badge
            variant={status.variant}
            className="mt-0.5 h-5 px-1.5 text-[12px]"
          >
            {status.label}
          </Badge>
        </div>
      </div>

      <Separator className="bg-sidebar-border/60" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <div key={item.href} className="relative">
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
              )}
              <Link
                href={item.soon ? "#" : item.href}
                onClick={(e) => handleLinkClick(e, item.href, item.soon)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  item.soon && "pointer-events-none text-sidebar-foreground/35",
                )}
              >
                {isPending && loadingHref === item.href ? (
                  <IconLoader2 className="size-[18px] shrink-0 animate-spin" />
                ) : (
                  <item.icon className="size-[18px] shrink-0" />
                )}
                <span className="flex-1">{item.label}</span>
                {item.soon && (
                  <Badge
                    variant="outline"
                    className="ml-auto h-4 border-sidebar-border/60 px-1.5 text-[9px] font-normal text-sidebar-foreground/40"
                  >
                    Pronto
                  </Badge>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border/60" />

      <div className="px-3 py-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground"
        >
          <IconArrowLeft className="size-[18px]" />
          Volver al sitio
        </Link>
      </div>

      <Separator className="bg-sidebar-border/60" />

      {/* User section */}
      <div className="flex items-center gap-3 px-4 py-4">
        <Avatar size="sm">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
          ) : null}
          <AvatarFallback className="text-xs">
            {user.fullName?.charAt(0)?.toUpperCase() ||
              user.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-sidebar-foreground">
            {user.fullName || "Mi cuenta"}
          </p>
          <p className="truncate text-[11px] text-sidebar-foreground/50">
            {user.email}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleLogout}
          className="shrink-0 text-sidebar-foreground/50 hover:text-sidebar-foreground"
          aria-label="Cerrar sesion"
        >
          <IconLogout className="size-4" />
        </Button>
      </div>
    </>
  );
}

export function DashboardSidebar({ business, user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="px-5 py-5">
        <Link
          href="/"
          className="text-base font-bold tracking-tight text-sidebar-foreground"
        >
          Local<span className="text-sidebar-primary"> Conecta</span>
        </Link>
      </div>
      <NavContent business={business} user={user} pathname={pathname} />
    </aside>
  );
}

export function DashboardMobileNav({ business, user }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Menu"
        >
          <IconMenu2 className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar p-0">
        <SheetHeader className="px-5 py-5">
          <SheetTitle className="text-left text-base font-bold tracking-tight text-sidebar-foreground">
            Local<span className="text-sidebar-primary"> Conecta</span>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col">
          <NavContent
            business={business}
            user={user}
            pathname={pathname}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
