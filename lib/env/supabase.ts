/**
 * 校验 Supabase 公开环境变量（本地 .env.local / Vercel Environment Variables）
 */
export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  const isConfigured =
    url.length > 0 &&
    anonKey.length > 0 &&
    (url.startsWith("https://") || url.startsWith("http://"));

  return { url, anonKey, isConfigured };
}

export const SUPABASE_ENV_HINT =
  "请在 Vercel 项目 Settings → Environment Variables 中配置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY，然后重新部署。";
