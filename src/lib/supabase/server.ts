import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Component — cookie writes may be read-only
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Server Component — cookie writes may be read-only
          }
        },
      },
    }
  );
}

export async function getSessionUser() {
  if (process.env.DEMO_MODE === "true") {
    return {
      id: "demo-user-id",
      email: "demo@cleanproposal.ai",
      fullName: "Demo User",
      companyId: "demo-company-id",
      role: "owner" as const,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: user.user_metadata?.full_name ?? user.email ?? "User",
    companyId: user.user_metadata?.company_id ?? "",
    role: (user.user_metadata?.role ?? "rep") as "owner" | "rep",
  };
}
