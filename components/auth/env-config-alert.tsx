import { getSupabasePublicEnv, SUPABASE_ENV_HINT } from "@/lib/env/supabase";

export function EnvConfigAlert() {
  const { isConfigured } = getSupabasePublicEnv();

  if (isConfigured) {
    return null;
  }

  return (
    <div className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
      <p className="font-medium">Supabase 环境变量未配置</p>
      <p className="mt-1 text-xs opacity-90">{SUPABASE_ENV_HINT}</p>
    </div>
  );
}
