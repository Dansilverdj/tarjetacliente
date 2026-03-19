import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // Usamos la sintaxis más simple posible para Vercel
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach((cookie: any) => {
              const { name, value, options } = cookie;
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Silenciamos errores en Server Components
          }
        },
      },
    }
  );
}

export async function createServiceClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any) {
          try {
            cookiesToSet.forEach((cookie: any) => {
              const { name, value, options } = cookie;
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Silenciamos errores en Server Components
          }
        },
      },
    }
  );
}
