import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EncuestaClient from "./EncuestaClient";

export default async function EncuestaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses").select("id").eq("owner_id", user.id).single();
  if (!business) redirect("/register");

  return <EncuestaClient businessId={business.id} />;
}
