"use client";

import { useEffect, useState } from "react";
import { LogOut, User, ChevronsUpDown } from "lucide-react";
import { ProfileDialog } from "./ProfileDialog";
import { useAuth, type TokenPayload } from "@/lib/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function getInitials(email: string): string {
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Админ",
  superadmin: "Супер Админ",
  senior_engineer: "Ахлах инженер",
  engineer: "Инженер",
  user: "Хэрэглэгч",
};

interface UserMenuProps {
  variant?: "default" | "sidebar";
}

export default function UserMenu({ variant = "default" }: UserMenuProps) {
  const { getUser, logout } = useAuth();
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, [getUser]);

  if (!user) return null;

  const initials = getInitials(user.email);
  const displayName = user.email.split("@")[0].replace(/[._-]/g, " ");
  const roleLabel = ROLE_LABELS[user.roleName] ?? user.roleName;

  const trigger =
    variant === "sidebar" ? (
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-4  transition cursor-pointer text-left"
      >
        <img
          src={"/logo-without-text.jpg"}
          alt="User avatar"
          className="h-9 w-9 rounded-xl object-cover shrink-0 shadow-md"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold capitalize truncate text-white truncate">
            {displayName}
          </div>
          <div className="text-xs text-white/50">{roleLabel}</div>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-white/40 shrink-0" />
      </button>
    ) : (
      <button
        type="button"
        className="h-9 w-9 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-semibold text-neutral-600 hover:bg-neutral-300 transition cursor-pointer"
      >
        {initials}
      </button>
    );

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>

        <PopoverContent
          side={variant === "sidebar" ? "top" : "bottom"}
          align={variant === "sidebar" ? "start" : "end"}
          className="w-[100%] p-0"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <img
              src={"/logo-without-text.jpg"}
              alt="User avatar"
              className="h-9 w-9 rounded-xl object-cover shrink-0 shadow-md"
            />
            <div className="min-w-0">
              <div className="text-[14px] font-medium capitalize truncate">
                {displayName}
              </div>
              <div className="text-[12px] text-muted-foreground truncate">
                {user.email}
              </div>
            </div>
          </div>

          <Separator />

          <div className="py-1">
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>Профайл</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {roleLabel}
              </Badge>
            </button>
          </div>

          <Separator />

          <div className="py-1">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Гарах
            </button>
          </div>
        </PopoverContent>
      </Popover>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
