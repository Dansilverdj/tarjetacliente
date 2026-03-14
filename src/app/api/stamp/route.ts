import { NextRequest, NextResponse } from "next/server";

// Proxies to Supabase Edge Function: add-stamp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("Authorization") ?? "";
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/add-stamp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader || `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
