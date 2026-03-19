// ── Legacy types (kept for backward compatibility) ──
export type UserType = "business" | "individual";

// ── Platform role system ──
export type StakeholderRole =
  | "investor_individual"
  | "investor_corporate"
  | "project_developer"
  | "landowner"
  | "government_authority"
  | "equipment_supplier"
  | "om_provider"
  | "energy_buyer";

/** Map legacy UserType to StakeholderRole */
export function userTypeToRole(ut: UserType): StakeholderRole {
  return ut === "business" ? "investor_corporate" : "investor_individual";
}

/** Human-readable role labels (Korean) */
export const ROLE_LABELS: Record<StakeholderRole, string> = {
  investor_individual: "개인 투자자",
  investor_corporate: "법인 투자자",
  project_developer: "프로젝트 개발사",
  landowner: "토지 소유자",
  government_authority: "정부/지자체",
  equipment_supplier: "설비 공급사",
  om_provider: "O&M 서비스",
  energy_buyer: "전력 수요기업",
};

/** Roles available for selection during signup */
export const SIGNUP_ROLES: StakeholderRole[] = [
  "investor_individual",
  "investor_corporate",
  "project_developer",
  "landowner",
  "government_authority",
];

/** Role category helpers */
export function isInvestorRole(role: StakeholderRole): boolean {
  return role === "investor_individual" || role === "investor_corporate";
}

export function isDeveloperRole(role: StakeholderRole): boolean {
  return role === "project_developer";
}

export function isAuthorityRole(role: StakeholderRole): boolean {
  return role === "government_authority";
}

// ── User interfaces ──

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  displayName: string;
  role: string;
  avatarInitial: string;
  createdAt: string;
  userType: UserType;
  companyName?: string;
  businessNumber?: string;
  linkedCompanyId?: string;
  // Platform role fields
  primaryRole: StakeholderRole;
  secondaryRoles: StakeholderRole[];
  organizationId: string | null;
}

export interface Organization {
  id: string;
  name: string;
  type: "company" | "municipality" | "developer_firm" | "supplier" | "service_provider";
  businessNumber?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  userType: UserType;
  primaryRole?: StakeholderRole;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  agreeTerms: boolean;
  userType: UserType;
  primaryRole: StakeholderRole;
  companyName?: string;
  businessNumber?: string;
  organizationName?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
}

export interface LinkCompanyResponse {
  success: boolean;
  message?: string;
  companyName?: string;
  companyId?: string;
}

export interface LinkedMember {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  primaryRole: StakeholderRole;
}
