import BaseService from "@/api/base-service";
import type RestClient from "@/api/rest-client";
import type {
  LoginPayload,
  SignupPayload,
  AuthResponse,
  AuthUser,
  LinkCompanyResponse,
  LinkedMember,
  StakeholderRole,
} from "@/types/auth";
import { userTypeToRole } from "@/types/auth";

const STORAGE_KEY = "thekie_users_db";
const DELAY_MS = 800;

class AuthService extends BaseService {
  constructor(restClient: RestClient) {
    super(restClient);
  }

  private readonly DEMO_ACCOUNTS: Record<StakeholderRole, { id: string; email: string; name: string; role: string; userType: "individual" | "business" }> = {
    investor_individual: { id: "demo-investor", email: "demo@thekie.com", name: "홍길동", role: "개인 투자자", userType: "individual" },
    investor_corporate: { id: "demo-corp", email: "demo-corp@thekie.com", name: "김법인", role: "법인 투자자", userType: "business" },
    project_developer: { id: "demo-dev", email: "demo-dev@thekie.com", name: "박개발", role: "프로젝트 개발사", userType: "business" },
    landowner: { id: "demo-land", email: "demo-land@thekie.com", name: "이토지", role: "토지 소유자", userType: "individual" },
    government_authority: { id: "demo-gov", email: "demo-gov@thekie.com", name: "정관리", role: "정부 담당자", userType: "individual" },
    equipment_supplier: { id: "demo-supplier", email: "demo-supplier@thekie.com", name: "최설비", role: "설비 공급사", userType: "business" },
    om_provider: { id: "demo-om", email: "demo-om@thekie.com", name: "한유지", role: "O&M 서비스", userType: "business" },
    energy_buyer: { id: "demo-buyer", email: "demo-buyer@thekie.com", name: "강전력", role: "전력 수요기업", userType: "business" },
  };

  async quickLogin(role: StakeholderRole = "investor_individual"): Promise<AuthResponse> {
    await this.simulateDelay(300);

    const acct = this.DEMO_ACCOUNTS[role];
    const demoUser: AuthUser = {
      id: acct.id,
      email: acct.email,
      name: acct.name,
      displayName: `${acct.name}님`,
      role: acct.role,
      avatarInitial: acct.name.charAt(0),
      createdAt: new Date().toISOString(),
      userType: acct.userType,
      primaryRole: role,
      secondaryRoles: [],
      organizationId: null,
    };

    const users = this.getUsersDb();
    const existingIdx = users.findIndex((u) => u.id === demoUser.id);
    if (existingIdx >= 0) {
      users[existingIdx] = demoUser;
    } else {
      users.push(demoUser);
    }
    this.setUsersDb(users);

    const passwords = this.getPasswordsDb();
    passwords[demoUser.email] = "demo1234";
    this.setPasswordsDb(passwords);

    const token = this.generateToken(demoUser.id);
    return { success: true, user: demoUser, token };
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    await this.simulateDelay();

    const users = this.getUsersDb();
    const user = users.find((u) => u.email === payload.email);

    if (!user) {
      return { success: false, message: "등록되지 않은 이메일입니다." };
    }

    if (user.userType !== payload.userType) {
      return { success: false, message: "해당 유형으로 등록된 계정이 아닙니다." };
    }

    const passwords = this.getPasswordsDb();
    if (passwords[payload.email] !== payload.password) {
      return { success: false, message: "비밀번호가 일치하지 않습니다." };
    }

    // Backfill role fields for legacy users
    if (!user.primaryRole) {
      user.primaryRole = payload.primaryRole ?? userTypeToRole(user.userType);
      user.secondaryRoles = [];
      user.organizationId = null;
    }

    const token = this.generateToken(user.id);
    return { success: true, user, token };
  }

  async signup(payload: SignupPayload): Promise<AuthResponse> {
    await this.simulateDelay();

    const users = this.getUsersDb();
    if (users.some((u) => u.email === payload.email)) {
      return { success: false, message: "이미 등록된 이메일입니다." };
    }

    const isBusiness = payload.userType === "business";
    const resolvedRole: StakeholderRole =
      payload.primaryRole ?? userTypeToRole(payload.userType);

    const ROLE_DISPLAY: Record<StakeholderRole, string> = {
      investor_individual: "베짱이 투자자",
      investor_corporate: "법인 관리자",
      project_developer: "프로젝트 개발사",
      landowner: "토지 소유자",
      government_authority: "정부 담당자",
      equipment_supplier: "설비 공급사",
      om_provider: "O&M 서비스",
      energy_buyer: "전력 수요기업",
    };

    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      email: payload.email,
      name: payload.name,
      displayName: `${payload.name}님`,
      role: ROLE_DISPLAY[resolvedRole],
      avatarInitial: payload.name.charAt(0),
      createdAt: new Date().toISOString(),
      userType: payload.userType,
      primaryRole: resolvedRole,
      secondaryRoles: [],
      organizationId: null,
      ...(isBusiness && {
        companyName: payload.companyName,
        businessNumber: payload.businessNumber,
      }),
    };

    users.push(newUser);
    this.setUsersDb(users);

    const passwords = this.getPasswordsDb();
    passwords[payload.email] = payload.password;
    this.setPasswordsDb(passwords);

    const token = this.generateToken(newUser.id);
    return { success: true, user: newUser, token };
  }

  async linkToCompany(userId: string, businessNumber: string): Promise<LinkCompanyResponse> {
    await this.simulateDelay(400);

    const users = this.getUsersDb();
    const company = users.find(
      (u) => u.userType === "business" && u.businessNumber === businessNumber,
    );

    if (!company) {
      return { success: false, message: "해당 사업자등록번호를 가진 법인 계정이 없습니다." };
    }

    const userIdx = users.findIndex((u) => u.id === userId);
    if (userIdx === -1) {
      return { success: false, message: "사용자를 찾을 수 없습니다." };
    }

    users[userIdx].linkedCompanyId = company.id;
    this.setUsersDb(users);

    return { success: true, companyName: company.companyName, companyId: company.id };
  }

  getLinkedMembers(companyId: string): LinkedMember[] {
    const users = this.getUsersDb();
    return users
      .filter((u) => u.linkedCompanyId === companyId)
      .map((u) => ({ id: u.id, name: u.name, email: u.email, joinedAt: u.createdAt }));
  }

  getCompanyById(companyId: string): AuthUser | null {
    const users = this.getUsersDb();
    return users.find((u) => u.id === companyId && u.userType === "business") ?? null;
  }

  async validateSession(token: string): Promise<AuthResponse> {
    await this.simulateDelay(200);

    const userId = this.parseToken(token);
    if (!userId) {
      return { success: false, message: "유효하지 않은 세션입니다." };
    }

    const users = this.getUsersDb();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, message: "사용자를 찾을 수 없습니다." };
    }

    // Backfill role fields for users created before platform roles existed
    if (!user.primaryRole) {
      user.primaryRole = userTypeToRole(user.userType);
      user.secondaryRoles = [];
      user.organizationId = null;
    }

    return { success: true, user, token };
  }

  private simulateDelay(ms: number = DELAY_MS): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private generateToken(userId: string): string {
    return btoa(JSON.stringify({ uid: userId, exp: Date.now() + 86400000 }));
  }

  private parseToken(token: string): string | null {
    try {
      const parsed = JSON.parse(atob(token));
      if (parsed.exp > Date.now()) return parsed.uid;
      return null;
    } catch {
      return null;
    }
  }

  private getUsersDb(): AuthUser[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private setUsersDb(users: AuthUser[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  private getPasswordsDb(): Record<string, string> {
    const raw = localStorage.getItem(STORAGE_KEY + "_pw");
    return raw ? JSON.parse(raw) : {};
  }

  private setPasswordsDb(passwords: Record<string, string>): void {
    localStorage.setItem(STORAGE_KEY + "_pw", JSON.stringify(passwords));
  }
}

export default AuthService;
