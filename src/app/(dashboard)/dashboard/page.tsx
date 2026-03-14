import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/register");

  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("*")
    .eq("business_id", business.id)
    .eq("is_active", true)
    .single();

  const { data: customers, count } = await supabase
    .from("customers")
    .select("*, loyalty_balances(*)", { count: "exact" })
    .eq("business_id", business.id)
    .eq("is_active", true)
    .order("joined_at", { ascending: false })
    .range(0, 19);

  return (
    <DashboardClient
      business={business}
      program={program ?? null}
      initialCustomers={(customers as any) ?? []}
      initialCount={count ?? 0}
    />
  );
}
