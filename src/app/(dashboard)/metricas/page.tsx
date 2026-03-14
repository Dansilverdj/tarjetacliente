import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MetricasClient from "./MetricasClient";

export default async function MetricasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses").select("*").eq("owner_id", user.id).single();
  if (!business) redirect("/register");

  // Stats via RPC
  const { data: stats } = await supabase.rpc("get_dashboard_stats", {
    p_business_id: business.id,
  });

  // Stamps by day
  const { data: byDay } = await supabase.rpc("get_stamps_by_day", {
    p_business_id: business.id,
  });

  // Top customers
  const { data: topCustomers } = await supabase
    .from("loyalty_balances")
    .select("*, customers(name, phone)")
    .eq("business_id", business.id)
    .order("total_visits", { ascending: false })
    .limit(10);

  return (
    <MetricasClient
      stats={stats ?? {}}
      byDay={byDay ?? []}
      topCustomers={(topCustomers as any) ?? []}
    />
  );
}
