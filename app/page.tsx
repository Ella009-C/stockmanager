import { redirect } from "next/navigation";

import {
  DEFAULT_AUTHENTICATED_PATH,
  LOGIN_PATH,
} from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(DEFAULT_AUTHENTICATED_PATH);
  }

  redirect(LOGIN_PATH);
}
