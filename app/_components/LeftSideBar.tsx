"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipboardCheck, CheckCircle2, Clock, Pencil } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

const ELEVATED_ROLES = ["senior_engineer", "admin", "superadmin"];

const menu = [
  { href: "/", label: "Ажил шалгуулах хүсэлт", icon: ClipboardCheck },
  { href: "/api/archive", label: "Архив", icon: Clock },
  { href: "/api/approve", label: "Баталгаажуулах хүсэлт", icon: CheckCircle2 },
  {
    href: "/api/lab-spec",
    label: "Шинжилгээний бүртгэл",
    icon: Pencil,
    roles: ELEVATED_ROLES,
  },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const { getUser } = useAuth();
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const user = getUser();
    setUserRole(user?.roleName ?? "");
  }, [getUser]);

  const visibleMenu = menu.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside className="w-50 bg-[#2f3533] text-white flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="text-xl font-semibold">Лаборатори</div>
        <div className="text-sm text-white/70">ERP</div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleMenu.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
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

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 text-xs text-white/60">
        Авиагын <br />
        Лабораторын төсөл
      </div>
    </aside>
  );
}
