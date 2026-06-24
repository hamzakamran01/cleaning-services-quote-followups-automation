import { LoginForm, LoginHero } from "@/components/auth/login-page";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <LoginHero />
      <LoginForm />
    </div>
  );
}
