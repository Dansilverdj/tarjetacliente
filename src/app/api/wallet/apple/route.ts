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

  const program = business.loyalty_programs?.[0];
  const threshold = program?.reward_threshold ?? 10;

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

  const stamps  = balance?.current_points ?? 0;
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? "https://tarjetacliente.vip";
  const color   = business.primary_color ?? "#C9A84C";

  // ── Pass JSON structure (Apple Wallet spec) ──────────────────────────────
  // In production you must sign this with your Apple Pass certificate.
  // This endpoint returns the manifest JSON so you can sign it server-side.
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER ?? "pass.vip.tarjetacliente",
    serialNumber: customer?.qr_token ?? `anon-${slug}-${Date.now()}`,
    teamIdentifier: process.env.APPLE_TEAM_IDENTIFIER ?? "XXXXXXXXXX",
    organizationName: business.name,
    description: `${business.name} · Programa de Lealtad`,
    logoText: business.name,
    foregroundColor: "rgb(245, 228, 160)",
    backgroundColor: `rgb(14, 9, 0)`,
    labelColor: `rgb(${hexToRgb(color)})`,
    webServiceURL: `${appUrl}/api/wallet/apple/update`,
    authenticationToken: customer?.qr_token ?? "no-auth",
    storeCard: {
      primaryFields: [
        {
          key: "stamps",
          label: "SELLOS",
          value: `${stamps}/${threshold}`,
          changeMessage: "Ahora tienes %@ sellos",
        },
      ],
      secondaryFields: [
        {
          key: "reward",
          label: "RECOMPENSA",
          value: program?.reward_description ?? "Tu Recompensa",
        },
        {
          key: "redeemed",
          label: "CANJEADAS",
          value: balance?.total_redeemed ?? 0,
        },
      ],
      auxiliaryFields: [
        {
          key: "member",
          label: "CLIENTE",
          value: customer?.name ?? "Invitado",
        },
      ],
      headerFields: [
        {
          key: "brand",
          label: "",
          value: "tarjetacliente.vip",
        },
      ],
      backFields: [
        {
          key: "terms",
          label: "Términos",
          value: program?.terms ?? "Presenta esta tarjeta en caja para acumular sellos. Una recompensa por canje.",
        },
        {
          key: "website",
          label: "Más info",
          value: `${appUrl}/c/${slug}`,
        },
      ],
    },
    barcodes: [
      {
        message: customer?.qr_token ?? `${appUrl}/c/${slug}`,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1",
        altText: customer?.name ?? business.name,
      },
    ],
    locations: business.address
      ? [{ longitude: 0, latitude: 0, relevantText: `Bienvenido a ${business.name}` }]
      : [],
  };

  // ── NOTE ────────────────────────────────────────────────────────────────
  // To actually generate a signed .pkpass file you need:
  //   1. Apple Developer account + Pass Type ID certificate
  //   2. Sign the manifest with your .pem cert + WWDR cert
  //   3. Bundle icon.png, logo.png, pass.json, manifest.json, signature into a .zip renamed .pkpass
  //
  // For now, we return the pass JSON so the frontend can show a preview
  // or redirect to a signing service (e.g. PassKit, PassSlot, etc.)
  // ────────────────────────────────────────────────────────────────────────

  // If APPLE_CERT_PATH is configured, you can sign here using node-passkit-generator
  // For production, install: npm install passkit-generator
  // Then uncomment the signing block below.

  /*
  import { PKPass } from "passkit-generator";
  const pass = await PKPass.from({ model: "./pass-model.pass" }, { serialNumber: passJson.serialNumber, ... });
  const buffer = pass.getAsBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": `attachment; filename="${slug}.pkpass"`,
    },
  });
  */

  // Redirect to the public card page for now (works on iOS Safari — user can save from there)
  const cardUrl = `${appUrl}/c/${slug}${token ? `?token=${token}` : ""}`;
  return NextResponse.redirect(cardUrl);
}

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
