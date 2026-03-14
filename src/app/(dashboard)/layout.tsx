import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import ToastContainer from "@/components/ui/Toast";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/register");

  const { count: customerCount } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("is_active", true);

  const planLimits: Record<string, number> = {
    free: 100, starter: 500, pro: 2000, enterprise: 999999,
  };

  return (
    <div className="app-layout">
      <Sidebar
        business={business}
        customerCount={customerCount ?? 0}
        planLimit={planLimits[business.plan] ?? 100}
      />
      <main className="main-content">
        <div className="page-container">
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
