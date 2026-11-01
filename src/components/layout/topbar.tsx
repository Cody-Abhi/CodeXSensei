"use client";

import { Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

/**
 * Top navigation bar — search, notifications, user avatar.
 * Matches the compact header from the reference dashboard.
 */
export function Topbar({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "flex h-16 items-center gap-4 border-b border-border bg-surface px-6",
        className,
      )}
    >
      {/* Search */}
      <div className="relative flex-1">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          placeholder="Search anything..."
          className="h-10 w-full max-w-md rounded-lg border border-border bg-sunken pl-10 pr-4 text-sm text-ink placeholder:text-muted outline-none transition-colors focus:border-primary"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-sunken"
          aria-label="Notifications"
        >
          <Icon icon={Bell} size={20} className="text-muted" />
          {/* Dot indicator */}
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
          aria-label="User menu"
        >
          <Icon icon={User} size={20} className="text-primary" />
        </button>
      </div>
    </header>
  );
}
