"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Pencil,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";
import { ROUTES } from "@/lib/routes";
import UserMenu from "./UserMenu";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import dynamic from "next/dynamic";

const NotificationBell = dynamic(() => import("./NotificationBell"), {
  ssr: false,
});

const ELEVATED_ROLES = ["senior_engineer", "admin", "superadmin"] as const;

type MenuItem = {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: readonly string[];
  submenu?: { href: string; label: string }[];
};

const HOME_PATH = ROUTES.home();

const menu: MenuItem[] = [
  { href: HOME_PATH, label: "Сорьц", icon: ClipboardCheck },
  { href: ROUTES.app.archive(), label: "Архив", icon: Clock },
  {
    href: ROUTES.app.approve(),
    label: "Баталгаажуулах хүсэлт",
    icon: CheckCircle2,
    roles: ELEVATED_ROLES,
  },
  { href: ROUTES.app.employees(), label: "Хүмүүс", icon: Users },
  {
    label: "Шинжилгээний бүртгэл",
    icon: Pencil,
    roles: ELEVATED_ROLES,
    submenu: [
      { href: ROUTES.app.labSpec(), label: "Лаб төрөл" },
      { href: ROUTES.app.locations(), label: "Байршил" },
    ],
  },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const userRole = user?.role ?? "";
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  // Auto-open dropdown if current path matches a submenu item
  useEffect(() => {
    // While loading, don't try to compute open dropdowns yet
    if (loading) return;

    const dropdownsToOpen: string[] = [];
    menu.forEach((item) => {
      if (!item.submenu) return;
      const hasActiveSubmenu = item.submenu.some((sub) =>
        pathname.startsWith(sub.href)
      );
      if (hasActiveSubmenu) dropdownsToOpen.push(item.label);
    });
    setOpenDropdowns(dropdownsToOpen);
  }, [pathname, loading]);

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const visibleMenu = menu.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside className="w-[240px] bg-cyan-950 text-white flex flex-col">
      {/* Header */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <img
            src={"/logo-without-text.jpg"}
            alt="Лаборатори лого"
            className="h-9 w-9 rounded-xl object-cover shadow-lg"
          />

          <Link href={HOME_PATH} className="block">
            <div>
              <div className="text-[15px] font-semibold">Лаборатори</div>
              <div className="text-[11px] text-white/70">
                бүртгэлийн систем
              </div>
            </div>
          </Link>

          <NotificationBell />
        </div>
      </div>

      <div className="mx-4 h-px bg-white" />

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {loading ? (
          <div className="space-y-2 opacity-60">
            <div className="h-9 rounded-lg bg-white/10" />
            <div className="h-9 rounded-lg bg-white/10" />
            <div className="h-9 rounded-lg bg-white/10" />
            <div className="h-9 rounded-lg bg-white/10" />
          </div>
        ) : (
          visibleMenu.map((item) => {
            const Icon = item.icon;

            // Dropdown
            if (item.submenu) {
              const isOpen = openDropdowns.includes(item.label);
              const hasActiveSubmenu = item.submenu.some((sub) =>
                pathname.startsWith(sub.href)
              );

              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => toggleDropdown(item.label)}
                    className={`w-full flex items-start justify-between gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      hasActiveSubmenu
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="text-left leading-snug">
                        {item.label}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 mt-0.5 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mt-0.5 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="ml-7 mt-1 space-y-1 pl-2 pb-1 border-l border-white/20">
                          {item.submenu.map((subItem) => {
                            const subActive = pathname.startsWith(subItem.href);
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={`block rounded-lg px-3 py-2 text-sm transition ${
                                  subActive
                                    ? "bg-white/10 text-white"
                                    : "text-white/70 hover:bg-white/5"
                                }`}
                              >
                                {subItem.label}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Regular item
            const active = item.href
              ? item.href === HOME_PATH
                ? pathname === HOME_PATH
                : pathname.startsWith(item.href)
              : false;

            return (
              <Link
                key={item.href ?? item.label}
                href={item.href!}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })
        )}
      </nav>

      <div className="mx-4 h-px bg-white" />

      {/* User Menu */}
      <UserMenu variant="sidebar" />
    </aside>
  );
}

