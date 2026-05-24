"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LOGIN_PATH } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type SidebarUserProfileProps = {
  user: User;
};

function getDisplayEmail(user: User) {
  return user.email ?? "未绑定邮箱";
}

function getAvatarUrl(user: User) {
  return (
    user.user_metadata?.avatar_url ??
    user.user_metadata?.picture ??
    null
  );
}

function getInitials(user: User) {
  const email = user.email ?? "U";
  return email.charAt(0).toUpperCase();
}

export function SidebarUserProfile({ user }: SidebarUserProfileProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const avatarUrl = getAvatarUrl(user);
  const email = getDisplayEmail(user);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "退出失败",
        description: error.message,
      });
      setSigningOut(false);
      return;
    }

    router.push(LOGIN_PATH);
    router.refresh();
  }

  return (
    <div className="border-t p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary",
          )}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(user)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{email}</p>
          <p className="truncate text-xs text-muted-foreground">
            租户 ID: {user.id.slice(0, 8)}…
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-1 w-full justify-start gap-2 text-muted-foreground"
        disabled={signingOut}
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        {signingOut ? "退出中…" : "退出登录"}
      </Button>
    </div>
  );
}
