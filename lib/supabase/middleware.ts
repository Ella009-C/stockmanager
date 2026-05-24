import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_CALLBACK_PATH,
  DEFAULT_AUTHENTICATED_PATH,
  LOGIN_PATH,
} from "@/lib/auth/constants";
import { getSupabasePublicEnv } from "@/lib/env/supabase";

const PUBLIC_PATHS = [LOGIN_PATH, AUTH_CALLBACK_PATH];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function redirectTo(request: NextRequest, pathname: string, query?: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = query ?? "";
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const env = getSupabasePublicEnv();

  // 根路径统一在 Middleware 处理，避免 RSC 重定向异常导致白屏
  if (pathname === "/") {
    if (!env.isConfigured) {
      return redirectTo(
        request,
        LOGIN_PATH,
        "?error=" + encodeURIComponent("服务未配置 Supabase 环境变量"),
      );
    }
  }

  if (!env.isConfigured) {
    if (isPublicPath(pathname)) {
      return NextResponse.next({ request });
    }
    return redirectTo(
      request,
      LOGIN_PATH,
      "?error=" + encodeURIComponent("服务未配置 Supabase 环境变量"),
    );
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(env.url, env.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (pathname === "/") {
      return user
        ? redirectTo(request, DEFAULT_AUTHENTICATED_PATH)
        : redirectTo(request, LOGIN_PATH);
    }

    if (!user && !isPublicPath(pathname)) {
      return redirectTo(request, LOGIN_PATH);
    }

    if (user && pathname === LOGIN_PATH) {
      return redirectTo(request, DEFAULT_AUTHENTICATED_PATH);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[middleware] auth session error:", error);

    if (isPublicPath(pathname) || pathname === "/") {
      if (pathname === "/") {
        return redirectTo(request, LOGIN_PATH);
      }
      return NextResponse.next({ request });
    }

    return redirectTo(
      request,
      LOGIN_PATH,
      "?error=" + encodeURIComponent("认证服务暂时不可用，请稍后重试"),
    );
  }
}
