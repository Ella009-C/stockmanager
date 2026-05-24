import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/env/supabase";

export function createClient() {
  const env = getSupabasePublicEnv();

  if (!env.isConfigured) {
    throw new Error(
      "Supabase 未配置：请设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createBrowserClient(env.url, env.anonKey);
}
