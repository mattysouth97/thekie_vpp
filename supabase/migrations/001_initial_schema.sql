-- THEKIE Platform: Initial Database Schema
-- Run this in the Supabase SQL Editor to set up all tables

-- ═══════════ ENUMS ═══════════

CREATE TYPE stakeholder_role AS ENUM (
  'investor_individual',
  'investor_corporate',
  'project_developer',
  'landowner',
  'government_authority',
  'equipment_supplier',
  'om_provider',
  'energy_buyer'
);

CREATE TYPE org_type AS ENUM (
  'company', 'municipality', 'developer_firm', 'supplier', 'service_provider'
);

CREATE TYPE project_status AS ENUM (
  'draft', 'open', 'funding', 'closing_soon', 'funded', 'construction', 'operating', 'completed'
);

CREATE TYPE equipment_type AS ENUM (
  '태양광', '풍력', 'ESS', '소수력', '연료전지'
);

CREATE TYPE parcel_status AS ENUM (
  'available', 'under_review', 'leased', 'unavailable'
);

CREATE TYPE blockchain_record_type AS ENUM (
  'settlement', 'generation', 'milestone', 'lease',
  'rec_issuance', 'community_benefit', 'equipment_registration', 'maintenance'
);

-- ═══════════ TABLES ═══════════

-- Organizations (companies, municipalities, developer firms)
CREATE TABLE organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  type        org_type NOT NULL,
  business_number text UNIQUE,
  address     text,
  contact_email text,
  contact_phone text,
  created_at  timestamptz DEFAULT now()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text NOT NULL,
  name            text NOT NULL,
  display_name    text NOT NULL,
  primary_role    stakeholder_role NOT NULL DEFAULT 'investor_individual',
  secondary_roles stakeholder_role[] DEFAULT '{}',
  organization_id uuid REFERENCES organizations(id),
  avatar_url      text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Projects (renewable energy investment opportunities)
CREATE TABLE projects (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id      uuid NOT NULL REFERENCES profiles(id),
  organization_id   uuid REFERENCES organizations(id),
  name              text NOT NULL,
  type              equipment_type NOT NULL,
  type_icon         text NOT NULL DEFAULT 'solar',
  location          text NOT NULL,
  address           text NOT NULL DEFAULT '',
  lng               double precision NOT NULL,
  lat               double precision NOT NULL,
  capacity          text NOT NULL,
  capacity_mw       double precision NOT NULL DEFAULT 0,
  expected_yield    text NOT NULL,
  expected_yield_pct double precision NOT NULL DEFAULT 0,
  min_invest        text NOT NULL,
  min_invest_amount bigint NOT NULL DEFAULT 0,
  total_funding_required bigint NOT NULL DEFAULT 0,
  current_funding   bigint NOT NULL DEFAULT 0,
  investor_count    int NOT NULL DEFAULT 0,
  progress          int NOT NULL DEFAULT 0,
  status            project_status NOT NULL DEFAULT 'draft',
  status_color      text NOT NULL DEFAULT 'blue',
  description       text NOT NULL DEFAULT '',
  -- 4-module classification
  power_structure   text NOT NULL DEFAULT '',
  market_structure  text NOT NULL DEFAULT '',
  land_rights       text NOT NULL DEFAULT '',
  capital_structure text NOT NULL DEFAULT '',
  business_type     int NOT NULL DEFAULT 0,
  -- dates
  funding_deadline          date,
  commercial_operation_date date,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Investments (investor ↔ project)
CREATE TABLE investments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id   uuid NOT NULL REFERENCES profiles(id),
  project_id    uuid NOT NULL REFERENCES projects(id),
  amount        bigint NOT NULL,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','active','completed','withdrawn')),
  invested_at   timestamptz DEFAULT now(),
  confirmed_at  timestamptz
);

-- Settlements (monthly payouts per project)
CREATE TABLE settlements (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid NOT NULL REFERENCES projects(id),
  period            text NOT NULL,  -- YYYY-MM
  smp_income        bigint NOT NULL DEFAULT 0,
  rec_income        bigint NOT NULL DEFAULT 0,
  dr_income         bigint NOT NULL DEFAULT 0,
  incentive_income  bigint NOT NULL DEFAULT 0,
  total_payout      bigint NOT NULL DEFAULT 0,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','forecasted')),
  blockchain_tx_hash text,
  settled_at        timestamptz,
  created_at        timestamptz DEFAULT now()
);

-- Land parcels (from landowners/municipalities)
CREATE TABLE land_parcels (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid NOT NULL REFERENCES profiles(id),
  organization_id uuid REFERENCES organizations(id),
  name            text NOT NULL,
  address         text NOT NULL,
  lng             double precision NOT NULL,
  lat             double precision NOT NULL,
  area_sqm        double precision NOT NULL,
  land_type       text NOT NULL DEFAULT 'private' CHECK (land_type IN ('public','private','agricultural','industrial','water')),
  permitted_use   text[] DEFAULT '{}',
  lease_terms     text,
  annual_rent     bigint,
  status          parcel_status NOT NULL DEFAULT 'available',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Equipment (generation assets)
CREATE TABLE equipment (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              uuid NOT NULL REFERENCES profiles(id),
  project_id            uuid REFERENCES projects(id),
  name                  text NOT NULL,
  type                  equipment_type NOT NULL,
  site_name             text NOT NULL,
  site_address          text NOT NULL,
  capacity              double precision NOT NULL,
  capacity_unit         text NOT NULL DEFAULT 'kW' CHECK (capacity_unit IN ('kW','MW')),
  rtu_id                text,
  rtu_model             text,
  rtu_serial            text,
  rtu_protocol          text,
  rtu_ip                text,
  rtu_port              int,
  inverter_model        text,
  inverter_serial       text,
  inverter_capacity     double precision,
  inverter_manufacturer text,
  status                text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered','pending','active','inactive')),
  registered_at         timestamptz DEFAULT now()
);

-- Blockchain audit records (mock on-chain layer)
CREATE TABLE blockchain_records (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_type   blockchain_record_type NOT NULL,
  project_id    uuid REFERENCES projects(id),
  reference_id  uuid,
  tx_hash       text NOT NULL UNIQUE,
  data          jsonb NOT NULL DEFAULT '{}',
  verified      boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('settlement','alert','market','system','project','investment')),
  title       text NOT NULL,
  message     text NOT NULL,
  read        boolean NOT NULL DEFAULT false,
  action_url  text,
  created_at  timestamptz DEFAULT now()
);

-- ═══════════ INDEXES ═══════════

CREATE INDEX idx_profiles_role ON profiles(primary_role);
CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_projects_developer ON projects(developer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_investments_investor ON investments(investor_id);
CREATE INDEX idx_investments_project ON investments(project_id);
CREATE INDEX idx_settlements_project ON settlements(project_id);
CREATE INDEX idx_settlements_period ON settlements(period);
CREATE INDEX idx_land_parcels_owner ON land_parcels(owner_id);
CREATE INDEX idx_land_parcels_status ON land_parcels(status);
CREATE INDEX idx_equipment_owner ON equipment(owner_id);
CREATE INDEX idx_blockchain_records_type ON blockchain_records(record_type);
CREATE INDEX idx_blockchain_records_project ON blockchain_records(project_id);
CREATE INDEX idx_blockchain_records_hash ON blockchain_records(tx_hash);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = false;

-- ═══════════ ROW LEVEL SECURITY ═══════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations: readable by all, writable by members
CREATE POLICY "Organizations are viewable by everyone" ON organizations FOR SELECT USING (true);
CREATE POLICY "Org members can update" ON organizations FOR UPDATE
  USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Projects: readable by all, writable by developer
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Developers can insert projects" ON projects FOR INSERT
  WITH CHECK (developer_id = auth.uid());
CREATE POLICY "Developers can update own projects" ON projects FOR UPDATE
  USING (developer_id = auth.uid());

-- Investments: investors see own, project devs see their project's investments
CREATE POLICY "Investors see own investments" ON investments FOR SELECT
  USING (investor_id = auth.uid() OR project_id IN (SELECT id FROM projects WHERE developer_id = auth.uid()));
CREATE POLICY "Investors can insert" ON investments FOR INSERT
  WITH CHECK (investor_id = auth.uid());

-- Settlements: viewable by project stakeholders
CREATE POLICY "Settlements viewable by stakeholders" ON settlements FOR SELECT USING (true);

-- Land parcels: readable by all, writable by owner
CREATE POLICY "Land parcels are viewable by everyone" ON land_parcels FOR SELECT USING (true);
CREATE POLICY "Owners can manage parcels" ON land_parcels FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update parcels" ON land_parcels FOR UPDATE USING (owner_id = auth.uid());

-- Equipment: owner can CRUD, others can read
CREATE POLICY "Equipment viewable by everyone" ON equipment FOR SELECT USING (true);
CREATE POLICY "Owners manage equipment" ON equipment FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update equipment" ON equipment FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners delete equipment" ON equipment FOR DELETE USING (owner_id = auth.uid());

-- Blockchain records: readable by all (transparency!)
CREATE POLICY "Blockchain records are public" ON blockchain_records FOR SELECT USING (true);
CREATE POLICY "System can insert records" ON blockchain_records FOR INSERT WITH CHECK (true);

-- Notifications: users see own
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- ═══════════ FUNCTIONS ═══════════

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name, display_name, primary_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'primary_role')::stakeholder_role, 'investor_individual')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER land_parcels_updated_at BEFORE UPDATE ON land_parcels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
