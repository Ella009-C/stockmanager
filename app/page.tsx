import { redirect } from "next/navigation";

import {
  DEFAULT_AUTHENTICATED_PATH,
  LOGIN_PATH,
} from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/session";

// 依赖 cookie 判断登录态，必须动态渲染（避免生产环境静态化后白屏）
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  redirect(user ? DEFAULT_AUTHENTICATED_PATH : LOGIN_PATH);
}
