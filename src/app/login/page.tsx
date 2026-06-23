import Link from "next/link";
import { Sparkles, Shield, Zap, TrendingUp } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { icon: Zap, text: "Generate proposals in under 3 minutes" },
  { icon: TrendingUp, text: "Automated follow-up sequences" },
  { icon: Shield, text: "Enterprise-grade tracking & analytics" },
];

export default function LoginPage() {
  return (
    <div className="app-shell-bg flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-brand-primary via-brand-primary to-brand-primary-light p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">{APP_NAME}</span>
        </div>

        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Turn 90-minute proposals into a 3-minute revenue engine
          </h1>
          <p className="text-lg text-blue-100/90">
            AI-powered proposal generation and intelligent follow-ups built specifically for
            commercial cleaning companies.
          </p>
          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-blue-50">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-blue-200/70">
          Trusted by commercial cleaning companies nationwide
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md border-brand-border/60 shadow-elevated">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-light text-white shadow-glow lg:hidden">
              <Sparkles className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your {APP_NAME} account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" defaultValue="sarah@sparkleclean.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="demo1234" />
            </div>
            <Button className="w-full" size="lg" asChild>
              <Link href="/dashboard">Sign In to Dashboard</Link>
            </Button>
            <div className="rounded-xl bg-brand-accent/[0.06] px-4 py-3 text-center">
              <p className="text-xs font-medium text-brand-accent">Demo Mode</p>
              <p className="mt-1 text-xs text-brand-muted">
                Click sign in to explore the full proposal workflow with sample data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
