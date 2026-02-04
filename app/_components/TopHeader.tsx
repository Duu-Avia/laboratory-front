"use client";

import UserMenu from "./UserMenu";

export default function TopHeader() {
  return (
    <header className="h-12 w-full border-b bg-white flex items-center justify-end px-5 shrink-0">
      <UserMenu />
    </header>
  );
}
