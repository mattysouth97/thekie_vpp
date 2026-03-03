import { ref, computed } from "vue";
import { defineStore } from "pinia";
import RestClient from "@/api/rest-client";
import AuthService from "@/api/auth-service";
import type { AuthUser, LoginPayload, SignupPayload, LinkedMember } from "@/types/auth";

const TOKEN_KEY = "thekie_auth_token";

export const useAuthStore = defineStore("authStore", () => {
  const user = ref<AuthUser | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref("");
  const initialized = ref(false);

  const authService = new AuthService(new RestClient());

  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const displayName = computed(() => user.value?.displayName ?? "");
  const avatarInitial = computed(() => user.value?.avatarInitial ?? "");
  const userRole = computed(() => user.value?.role ?? "");
  const userName = computed(() => user.value?.name ?? "");
  const userType = computed(() => user.value?.userType ?? "individual");

  // ── Company linking & view toggle ──
  const viewMode = ref<"personal" | "company">("personal");
  const linkedCompany = ref<{ id: string; name: string } | null>(null);
  const linkedMembers = ref<LinkedMember[]>([]);

  const isLinkedToCompany = computed(() => !!user.value?.linkedCompanyId);
  const isCompanyAdmin = computed(() => user.value?.userType === "business");
  const canToggleView = computed(() => isLinkedToCompany.value || isCompanyAdmin.value);

  function loadLinkedCompany() {
    if (user.value?.linkedCompanyId) {
      const company = authService.getCompanyById(user.value.linkedCompanyId);
      if (company) {
        linkedCompany.value = { id: company.id, name: company.companyName ?? company.name };
      }
    } else if (user.value?.userType === "business") {
      linkedCompany.value = { id: user.value.id, name: user.value.companyName ?? user.value.name };
    }
  }

  function loadLinkedMembers() {
    const companyId = user.value?.userType === "business"
      ? user.value.id
      : user.value?.linkedCompanyId;
    if (companyId) {
      linkedMembers.value = authService.getLinkedMembers(companyId);
    }
  }

  async function linkToCompany(businessNumber: string): Promise<{ success: boolean; message?: string }> {
    if (!user.value) return { success: false, message: "로그인이 필요합니다." };

    const result = await authService.linkToCompany(user.value.id, businessNumber);
    if (result.success && result.companyId && result.companyName) {
      user.value.linkedCompanyId = result.companyId;
      linkedCompany.value = { id: result.companyId, name: result.companyName };
      return { success: true };
    }
    return { success: false, message: result.message };
  }

  async function initialize(): Promise<void> {
    if (initialized.value) return;

    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      const result = await authService.validateSession(storedToken);
      if (result.success && result.user) {
        user.value = result.user;
        token.value = storedToken;
        loadLinkedCompany();
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    initialized.value = true;
  }

  async function quickLogin(): Promise<boolean> {
    loading.value = true;
    error.value = "";

    try {
      const result = await authService.quickLogin();
      if (result.success && result.user && result.token) {
        user.value = result.user;
        token.value = result.token;
        localStorage.setItem(TOKEN_KEY, result.token);
        loadLinkedCompany();
        return true;
      } else {
        error.value = result.message ?? "로그인에 실패했습니다.";
        return false;
      }
    } catch {
      error.value = "서버 연결에 실패했습니다.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function login(payload: LoginPayload): Promise<boolean> {
    loading.value = true;
    error.value = "";

    try {
      const result = await authService.login(payload);
      if (result.success && result.user && result.token) {
        user.value = result.user;
        token.value = result.token;
        localStorage.setItem(TOKEN_KEY, result.token);
        return true;
      } else {
        error.value = result.message ?? "로그인에 실패했습니다.";
        return false;
      }
    } catch {
      error.value = "서버 연결에 실패했습니다.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function signup(payload: SignupPayload): Promise<boolean> {
    loading.value = true;
    error.value = "";

    try {
      const result = await authService.signup(payload);
      if (result.success && result.user && result.token) {
        user.value = result.user;
        token.value = result.token;
        localStorage.setItem(TOKEN_KEY, result.token);
        return true;
      } else {
        error.value = result.message ?? "회원가입에 실패했습니다.";
        return false;
      }
    } catch {
      error.value = "서버 연결에 실패했습니다.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout(): void {
    user.value = null;
    token.value = null;
    error.value = "";
    viewMode.value = "personal";
    linkedCompany.value = null;
    linkedMembers.value = [];
    localStorage.removeItem(TOKEN_KEY);
  }

  function clearError(): void {
    error.value = "";
  }

  return {
    user,
    token,
    loading,
    error,
    initialized,
    isAuthenticated,
    displayName,
    avatarInitial,
    userRole,
    userName,
    userType,
    viewMode,
    linkedCompany,
    linkedMembers,
    isLinkedToCompany,
    isCompanyAdmin,
    canToggleView,
    initialize,
    quickLogin,
    login,
    signup,
    logout,
    clearError,
    linkToCompany,
    loadLinkedMembers,
  };
});
