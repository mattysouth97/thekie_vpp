/** Supabase database schema types — generated manually, replace with `supabase gen types` later */

export type StakeholderRole =
  | "investor_individual"
  | "investor_corporate"
  | "project_developer"
  | "landowner"
  | "government_authority"
  | "equipment_supplier"
  | "om_provider"
  | "energy_buyer";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          display_name: string;
          primary_role: StakeholderRole;
          secondary_roles: StakeholderRole[];
          organization_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };

      organizations: {
        Row: {
          id: string;
          name: string;
          type: "company" | "municipality" | "developer_firm" | "supplier" | "service_provider";
          business_number: string | null;
          address: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["organizations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };

      projects: {
        Row: {
          id: string;
          developer_id: string;
          organization_id: string | null;
          name: string;
          type: "태양광" | "풍력" | "ESS" | "소수력" | "연료전지";
          type_icon: string;
          location: string;
          address: string;
          lng: number;
          lat: number;
          capacity: string;
          capacity_mw: number;
          expected_yield: string;
          expected_yield_pct: number;
          min_invest: string;
          min_invest_amount: number;
          total_funding_required: number;
          current_funding: number;
          investor_count: number;
          progress: number;
          status: "draft" | "open" | "funding" | "closing_soon" | "funded" | "construction" | "operating" | "completed";
          status_color: string;
          description: string;
          // 4-module classification
          power_structure: string;
          market_structure: string;
          land_rights: string;
          capital_structure: string;
          business_type: number;
          // metadata
          funding_deadline: string | null;
          commercial_operation_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "updated_at" | "current_funding" | "investor_count">;
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };

      investments: {
        Row: {
          id: string;
          investor_id: string;
          project_id: string;
          amount: number;
          status: "pending" | "confirmed" | "active" | "completed" | "withdrawn";
          invested_at: string;
          confirmed_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["investments"]["Row"], "id" | "invested_at">;
        Update: Partial<Database["public"]["Tables"]["investments"]["Insert"]>;
      };

      settlements: {
        Row: {
          id: string;
          project_id: string;
          period: string; // YYYY-MM
          smp_income: number;
          rec_income: number;
          dr_income: number;
          incentive_income: number;
          total_payout: number;
          status: "pending" | "in_progress" | "completed" | "forecasted";
          blockchain_tx_hash: string | null;
          settled_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["settlements"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["settlements"]["Insert"]>;
      };

      land_parcels: {
        Row: {
          id: string;
          owner_id: string;
          organization_id: string | null;
          name: string;
          address: string;
          lng: number;
          lat: number;
          area_sqm: number;
          land_type: "public" | "private" | "agricultural" | "industrial" | "water";
          permitted_use: string[];
          lease_terms: string | null;
          annual_rent: number | null;
          status: "available" | "under_review" | "leased" | "unavailable";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["land_parcels"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["land_parcels"]["Insert"]>;
      };

      equipment: {
        Row: {
          id: string;
          owner_id: string;
          project_id: string | null;
          name: string;
          type: "태양광" | "풍력" | "ESS" | "소수력" | "연료전지";
          site_name: string;
          site_address: string;
          capacity: number;
          capacity_unit: "kW" | "MW";
          rtu_id: string | null;
          rtu_model: string | null;
          rtu_serial: string | null;
          rtu_protocol: string | null;
          rtu_ip: string | null;
          rtu_port: number | null;
          inverter_model: string | null;
          inverter_serial: string | null;
          inverter_capacity: number | null;
          inverter_manufacturer: string | null;
          status: "registered" | "pending" | "active" | "inactive";
          registered_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["equipment"]["Row"], "id" | "registered_at">;
        Update: Partial<Database["public"]["Tables"]["equipment"]["Insert"]>;
      };

      blockchain_records: {
        Row: {
          id: string;
          record_type: "settlement" | "generation" | "milestone" | "lease" | "rec_issuance" | "community_benefit" | "equipment_registration" | "maintenance";
          project_id: string | null;
          reference_id: string | null;
          tx_hash: string;
          data: Record<string, unknown>;
          verified: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["blockchain_records"]["Row"], "id" | "created_at" | "verified">;
        Update: Partial<Database["public"]["Tables"]["blockchain_records"]["Insert"]>;
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "settlement" | "alert" | "market" | "system" | "project" | "investment";
          title: string;
          message: string;
          read: boolean;
          action_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at" | "read">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      stakeholder_role: StakeholderRole;
    };
  };
}
