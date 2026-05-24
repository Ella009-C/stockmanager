"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<"signIn" | "signUp" | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleSignIn(values: LoginValues) {
    setLoading("signIn");
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: error.message,
      });
      setLoading(null);
      return;
    }

    toast({ title: "登录成功", description: "正在进入后台…" });
    router.push("/products/new");
    router.refresh();
    setLoading(null);
  }

  async function handleSignUp(values: LoginValues) {
    setLoading("signUp");
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: error.message,
      });
      setLoading(null);
      return;
    }

    toast({
      title: "注册成功",
      description:
        "若已开启邮箱确认，请查收邮件；否则可直接点击「登录」。",
    });
    setLoading(null);
  }

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            className="w-full"
            disabled={loading !== null}
            onClick={form.handleSubmit(handleSignIn)}
          >
            {loading === "signIn" ? "登录中…" : "登录"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading !== null}
            onClick={form.handleSubmit(handleSignUp)}
          >
            {loading === "signUp" ? "注册中…" : "注册"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
