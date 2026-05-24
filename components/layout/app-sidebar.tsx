"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { SidebarUserProfile } from "@/components/layout/sidebar-user-profile";
import { mainNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  user: User;
};

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-card">
      <div className="border-b px-5 py-5">
        <Link href="/products/new" className="block space-y-1">
          <p className="text-lg font-semibold tracking-tight">库存管理系统</p>
          <p className="text-xs text-muted-foreground">多租户后台</p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {mainNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex cursor-not-allowed items-start gap-3 rounded-lg px-3 py-2.5 opacity-50"
                title="即将上线"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.description ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent",
                isActive && "bg-accent text-accent-foreground",
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.title}</p>
                {item.description ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </nav>

      <SidebarUserProfile user={user} />
    </aside>
  );
}
