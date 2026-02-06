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
import { useAuth } from "@/lib/hooks/useAuth";
import UserMenu from "./UserMenu";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";

const ELEVATED_ROLES = ["senior_engineer", "admin", "superadmin"];

type MenuItem = {
  href?: string;
  label: string;
  icon: any;
  roles?: string[];
  submenu?: { href: string; label: string }[];
};

const menu: MenuItem[] = [
  { href: "/", label: "Сорьц", icon: ClipboardCheck },
  { href: "/api/archive", label: "Архив", icon: Clock },
  {
    href: "/api/approve",
    label: "Баталгаажуулах хүсэлт",
    icon: CheckCircle2,
    roles: ELEVATED_ROLES,
  },
  { href: "/api/employees", label: "Хүмүүс", icon: Users },
  {
    label: "Шинжилгээний бүртгэл",
    icon: Pencil,
    roles: ELEVATED_ROLES,
    submenu: [
      { href: "/api/lab-spec", label: "Лаб төрөл" },
      { href: "/api/locations", label: "Байршил" },
    ],
  },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const { getUser } = useAuth();
  const [userRole, setUserRole] = useState("");
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  useEffect(() => {
    const user = getUser();
    setUserRole(user?.roleName ?? "");
  }, [getUser]);

  // Auto-open dropdown if current path matches a submenu item
  useEffect(() => {
    const dropdownsToOpen: string[] = [];
    menu.forEach((item) => {
      if (item.submenu) {
        const hasActiveSubmenu = item.submenu.some((sub) =>
          pathname.startsWith(sub.href)
        );
        if (hasActiveSubmenu) {
          dropdownsToOpen.push(item.label);
        }
      }
    });
    setOpenDropdowns(dropdownsToOpen);
  }, [pathname]);

  const visibleMenu = menu.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <aside className="w-50 bg-[#2f3533] text-white flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="text-xl font-semibold">Лаборатори</div>
        <div className="text-sm text-white/70">бүртгэлийн систем</div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleMenu.map((item) => {
          const Icon = item.icon;

          // If item has submenu (dropdown)
          if (item.submenu) {
            const isOpen = openDropdowns.includes(item.label);
            const hasActiveSubmenu = item.submenu.some((sub) =>
              pathname.startsWith(sub.href)
            );
        
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className={`w-full flex items-start justify-between gap-3 rounded-lg px-3 py-2 text-sm transition ${hasActiveSubmenu ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="text-left leading-snug">{item.label}</span>
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
                      <div className="ml-7 mt-1 space-y-1 pb-1">
                        {item.submenu.map((subItem) => {
                          const subActive = pathname.startsWith(subItem.href);
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`block rounded-lg px-3 py-2 text-sm transition ${subActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"}`}
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

          // Regular menu item
          const active = item.href
            ? item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
            : false;
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition
                ${active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"}
              `}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <UserMenu variant="sidebar" />
    </aside>
  );
}
