export type BusinessPlan = "free" | "starter" | "pro" | "enterprise";
export type LoyaltyProgramType = "points" | "stamps";
export type TransactionType = "earn" | "redeem";
export type WalletPlatform = "apple" | "google" | "web";
export type CampaignStatus = "draft" | "scheduled" | "sent" | "cancelled";

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: BusinessPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  primary_color: string;
  secondary_color: string | null;
  address: string | null;
  city: string | null;
  country: string;
  phone: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyProgram {
  id: string;
  business_id: string;
  name: string;
  type: LoyaltyProgramType;
  points_per_visit: number;
  reward_threshold: number;
  reward_description: string;
  terms: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  qr_token: string;
  joined_at: string;
  last_visit: string | null;
  is_active: boolean;
}

export interface LoyaltyBalance {
  id: string;
  business_id: string;
  customer_id: string;
  program_id: string;
  current_points: number;
  total_visits: number;
  total_redeemed: number;
  last_updated: string;
}

export interface Transaction {
  id: string;
  business_id: string;
  customer_id: string;
  program_id: string;
  type: TransactionType;
  points_delta: number;
  note: string | null;
  scanned_by: string | null;
  created_at: string;
}

export interface WalletPass {
  id: string;
  business_id: string;
  customer_id: string;
  platform: WalletPlatform;
  pass_type_id: string | null;
  serial_number: string;
  authentication_token: string;
  push_token: string | null;
  last_updated: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  business_id: string;
  title: string;
  message: string;
  target_segment: string | null;
  ai_generated: boolean;
  ai_reasoning: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  status: CampaignStatus;
  reach_count: number | null;
  created_at: string;
  updated_at: string;
}

// Joined types
export interface CustomerWithBalance extends Customer {
  loyalty_balances: LoyaltyBalance[];
}

export interface DashboardStats {
  total_customers: number;
  active_customers: number;
  total_stamps_given: number;
  total_redeemed: number;
  retention_rate: number;
  avg_stamps_per_customer: number;
}
