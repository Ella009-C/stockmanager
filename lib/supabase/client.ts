import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/env/supabase";

/**
 * 浏览器端 Supabase 客户端（OAuth、邮箱登录、Storage 上传）
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

export function getSupabaseEnv() {
  return getSupabasePublicEnv();
}
