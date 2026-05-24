import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EnvConfigAlert } from "@/components/auth/env-config-alert";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: { error?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">产品库存管理系统</CardTitle>
        <CardDescription>登录后管理产品与 SKU 库存</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <EnvConfigAlert />

        {searchParams.error ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {searchParams.error}
          </p>
        ) : null}

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
