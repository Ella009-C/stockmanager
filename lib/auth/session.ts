import type { User } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "@/lib/env/supabase";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  if (!getSupabasePublicEnv().isConfigured) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("[getCurrentUser]", error);
    return null;
  }
}
