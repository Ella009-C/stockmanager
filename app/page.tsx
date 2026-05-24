import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * 后台系统无对外首页，访问根路径直接进入登录页。
 * （已登录用户由 middleware 在到达此页前重定向到 /products/new）
 */
export default function HomePage() {
  redirect("/login");
}
