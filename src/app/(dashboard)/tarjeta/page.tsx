import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TarjetaEditor from "./TarjetaEditor";

export default async function TarjetaPage() {
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

  return <TarjetaEditor business={business} program={program ?? null} />;
}
