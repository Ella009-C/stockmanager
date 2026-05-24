import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { EnvConfigAlert } from "@/components/auth/env-config-alert";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: { error?: string };
};

function LoginError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {error}
    </p>
  );
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">库存管理系统</CardTitle>
        <CardDescription>登录后管理您租户下的产品与库存</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <EnvConfigAlert />

        <LoginError error={searchParams.error} />

        <GoogleSignInButton />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              或使用邮箱
            </span>
          </div>
        </div>

        <LoginForm />
      </CardContent>
    </Card>
  );
}
