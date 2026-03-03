export type UserType = "business" | "individual";

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
}

export interface LoginPayload {
  email: string;
  password: string;
  userType: UserType;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  agreeTerms: boolean;
  userType: UserType;
  companyName?: string;
  businessNumber?: string;
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
}
