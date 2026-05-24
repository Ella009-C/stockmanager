import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/env/supabase";

/**
 * 浏览器端 Supabase 客户端（登录、OAuth、Storage 上传等）
 */
export function createClient() {
  const { url, anonKey, isConfigured } = getSupabasePublicEnv();

  if (!isConfigured) {
    throw new Error(
      "Supabase 未配置：请设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createBrowserClient(url, anonKey);
}

/** 读取环境变量（部署前请在 Vercel 配置） */
export function getSupabaseEnv() {
  return getSupabasePublicEnv();
}
