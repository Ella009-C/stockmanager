import type { User } from "@supabase/supabase-js";

import { AppSidebar } from "@/components/layout/app-sidebar";

type DashboardShellProps = {
  user: User;
  children: React.ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
