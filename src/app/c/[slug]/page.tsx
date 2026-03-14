import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CustomerCardClient from "./CustomerCardClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServiceClient();
  const { data: biz } = await supabase.from("businesses").select("name").eq("slug", slug).single();
  return {
    title: biz ? `${biz.name} · tarjetacliente.vip` : "Tarjeta de Lealtad",
    description: "Tu tarjeta de sellos digital",
  };
}

export default async function CustomerCardPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { token } = await searchParams;

  const supabase = await createServiceClient();

  // Load business
  const { data: business } = await supabase
    .from("businesses")
    .select("*, loyalty_programs(*)")
    .eq("slug", slug)
    .single();

  if (!business) notFound();

  const program = business.loyalty_programs?.[0] ?? null;

  // Load customer by QR token if present
  let customer = null;
  let balance = null;

  if (token) {
    const { data: c } = await supabase
      .from("customers")
      .select("*")
      .eq("qr_token", token)
      .eq("business_id", business.id)
      .single();

    if (c) {
      customer = c;
      const { data: b } = await supabase
        .from("loyalty_balances")
        .select("*")
        .eq("customer_id", c.id)
        .eq("business_id", business.id)
        .single();
      balance = b;
    }
  }

  // Load active survey
  const { data: survey } = await supabase
    .from("surveys")
    .select("*")
    .eq("business_id", business.id)
    .eq("is_active", true)
    .single();

  return (
    <CustomerCardClient
      business={business}
      program={program}
      customer={customer}
      balance={balance}
      survey={survey ?? null}
    />
  );
}
