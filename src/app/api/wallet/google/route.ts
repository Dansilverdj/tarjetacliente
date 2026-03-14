import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug  = searchParams.get("slug");
  const token = searchParams.get("token");

  if (!slug) return NextResponse.json({ error: "slug requerido" }, { status: 400 });

  const supabase = await createServiceClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*, loyalty_programs(*)")
    .eq("slug", slug)
    .single();

  if (!business) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

  const program   = business.loyalty_programs?.[0];
  const threshold = program?.reward_threshold ?? 10;
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "https://tarjetacliente.vip";

  let customer = null;
  let balance  = null;

  if (token) {
    const { data: c } = await supabase
      .from("customers").select("*")
      .eq("qr_token", token).eq("business_id", business.id).single();
    customer = c;

    if (c) {
      const { data: b } = await supabase
        .from("loyalty_balances").select("*")
        .eq("customer_id", c.id).eq("business_id", business.id).single();
      balance = b;
    }
  }

  const stamps   = balance?.current_points ?? 0;
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID ?? "YOUR_ISSUER_ID";
  const classId  = `${issuerId}.${slug}`;
  const objectId = `${issuerId}.${customer?.qr_token ?? `anon-${Date.now()}`}`;

  // ── Google Wallet Loyalty Object ─────────────────────────────────────────
  const loyaltyObject = {
    id: objectId,
    classId,
    state: "ACTIVE",
    accountId: customer?.qr_token ?? "guest",
    accountName: customer?.name ?? "Invitado",
    loyaltyPoints: {
      label: "Sellos",
      balance: { int: stamps },
    },
    textModulesData: [
      {
        header: "Recompensa",
        body: program?.reward_description ?? "Tu Recompensa",
        id: "reward",
      },
      {
        header: "Próximo canje",
        body: `Faltan ${Math.max(0, threshold - stamps)} sellos`,
        id: "next",
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: `${appUrl}/c/${slug}`,
          description: "Ver tarjeta online",
          id: "website",
        },
      ],
    },
    barcode: {
      type: "QR_CODE",
      value: customer?.qr_token ?? `${appUrl}/c/${slug}`,
      alternateText: customer?.name ?? business.name,
    },
    heroImage: business.logo_url
      ? { sourceUri: { uri: business.logo_url } }
      : undefined,
  };

  // ── NOTE ────────────────────────────────────────────────────────────────
  // To create a real Google Wallet pass you need:
  //   1. Google Cloud project with Wallet API enabled
  //   2. Service account with Wallet Object Issuer role
  //   3. Create a LoyaltyClass first, then sign a JWT containing the LoyaltyObject
  //   4. Redirect to: https://pay.google.com/gp/v/save/{JWT}
  //
  // Install: npm install google-auth-library
  // Then sign the JWT with your service account credentials.
  //
  // Example:
  //   import { GoogleAuth } from "google-auth-library";
  //   const auth = new GoogleAuth({ scopes: "https://www.googleapis.com/auth/wallet_object.issuer" });
  //   const client = await auth.getClient();
  //   const jwt = await client.sign({ iss, aud, typ, payload: { loyaltyObjects: [loyaltyObject] } });
  //   return NextResponse.redirect(`https://pay.google.com/gp/v/save/${jwt}`);
  // ────────────────────────────────────────────────────────────────────────

  // Fallback: redirect to public card page
  const cardUrl = `${appUrl}/c/${slug}${token ? `?token=${token}` : ""}`;
  return NextResponse.redirect(cardUrl);
}
