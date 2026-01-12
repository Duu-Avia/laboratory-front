"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  FileText,
  CheckCircle2,
  RefreshCcw,
  CreditCard,
  Clock,
} from "lucide-react";

const menu = [
  { href: "/", label: "Ажил шалгуулах хүсэлт", icon: ClipboardCheck },
  { href: "/pending", label: "Хүлээгдэж буй АШХ", icon: Clock },
  { href: "/approve", label: "Баталгаажуулах хүсэлт", icon: CheckCircle2 },
];

export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-[#2f3533] text-white flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="text-xl font-semibold">Лаборатори</div>
        <div className="text-sm text-white/70">ERP</div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menu.map((item) => {
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
