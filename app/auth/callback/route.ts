import { NextResponse } from "next/server";

import { DEFAULT_AUTHENTICATED_PATH } from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Supabase OAuth / 邮箱确认回调：用 code 换取 session，再跳转后台。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? DEFAULT_AUTHENTICATED_PATH;

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("缺少授权码，请重新登录")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}

