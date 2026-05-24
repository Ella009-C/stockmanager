"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">页面加载出错</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "未知错误，请刷新或返回登录页重试。"}
      </p>
      <div className="flex gap-3">
        <Button type="button" onClick={() => reset()}>
          重试
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href="/login">返回登录</a>
        </Button>
      </div>
    </div>
  );
}
