"use client";

import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/constants";
import type { Notification } from "@/types/notification";
import { useAuth } from "@/lib/hooks";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Дөнгөж сая";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин өмнө`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} цагийн өмнө`;
  return `${Math.floor(diff / 86400)} өдрийн өмнө`;
}

function NotificationItem({
  notification,
  onRead,
  onNavigate,
}: {
  notification: Notification;
  onRead: (id: number) => void;
  onNavigate: (reportId: number) => void;
}) {
  const typeLabel =
    NOTIFICATION_TYPE_LABELS[notification.type] ?? notification.type;

  return (
    <button
      type="button"
      onClick={() => {
        if (!notification.is_read) onRead(notification.id);
        if (notification.report_id) onNavigate(notification.report_id);
      }}
      className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition cursor-pointer ${
        !notification.is_read ? "bg-blue-50/60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {!notification.is_read && (
          <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
        )}
        <div className={`flex-1 min-w-0 ${notification.is_read ? "ml-5" : ""}`}>
          <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-foreground truncate">
          {typeLabel}
          </p>
            <span className="text-[11px] text-muted-foreground/70">
              {timeAgo(notification.created_at)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
                  </div>
      </div>
    </button>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const userRole = useAuth().getUser()
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNavigate = () => {
    setOpen(false);
   if(userRole?.roleId === 2){ 
    router.push(`/api/approve`);
   }else return;
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative h-9 w-9 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition cursor-pointer"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        className="w-[360px] p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold">Мэдэгдэл</h3>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Бүгдийг уншсан
            </button>
          )}
        </div>

        <Separator />

        {/* Notification list */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Уншиж байна...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Мэдэгдэл байхгүй
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
