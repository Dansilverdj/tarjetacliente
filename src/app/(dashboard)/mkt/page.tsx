import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MktClient from "./MktClient";

export default async function MktPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses").select("*").eq("owner_id", user.id).single();
  if (!business) redirect("/register");

  const { data: stats } = await supabase.rpc("get_dashboard_stats", {
    p_business_id: business.id,
  });

  return (
    <MktClient
      businessId={business.id}
      businessName={business.name}
      stats={stats ?? {}}
    />
  );
}
