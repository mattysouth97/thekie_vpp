import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import type { StakeholderRole } from "@/types/auth";
import VppDashboardLayout from "@/layouts/VppDashboardLayout.vue";
import AuthHomeView from "@/views/AuthHomeView.vue";
import DashboardView from "@/views/DashboardView.vue";
import HomeView from "@/views/HomeView.vue";
import SavingsJoinView from "@/views/SavingsJoinView.vue";
import ProjectDetailView from "@/views/ProjectDetailView.vue";
import ProjectListView from "@/views/ProjectListView.vue";
import FacilityListView from "@/views/FacilityListView.vue";
import EquipmentRegisterView from "@/views/EquipmentRegisterView.vue";
import LandingView from "@/views/LandingView.vue";
import LoginView from "@/views/LoginView.vue";

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
    hideRightPanel?: boolean;
    requiredRoles?: StakeholderRole[];
  }
}

const routes: RouteRecordRaw[] = [
  // ═══════════ PUBLIC ROUTES ═══════════
  {
    path: "/landing",
    name: "landing",
    component: LandingView,
    meta: { title: "THEKIE — 재생에너지 플랫폼" },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { title: "로그인 · THEKIE" },
  },
  {
    path: "/signup",
    name: "signup",
    component: () => import("@/views/SignupView.vue"),
    meta: { title: "회원가입 · THEKIE" },
  },
  {
    path: "/onboarding",
    name: "onboarding",
    component: () => import("@/views/OnboardingView.vue"),
    meta: { title: "발전소 전환 신청 · THEKIE" },
  },
  {
    path: "/simulation",
    name: "simulation",
    component: SavingsJoinView,
    meta: { title: "투자 수익 시뮬레이터 · THEKIE", hideRightPanel: true },
  },

  // ── Public transparency portal ──
  {
    path: "/transparency",
    name: "transparency",
    component: () => import("@/views/transparency/TransparencyPortal.vue"),
    meta: { title: "블록체인 투명성 포털 · THEKIE" },
  },

  // ── Public marketplace / project browsing ──
  {
    path: "/marketplace",
    component: VppDashboardLayout,
    children: [
      {
        path: "",
        name: "marketplace",
        component: () => import("@/views/marketplace/MarketplaceHome.vue"),
        meta: { title: "마켓플레이스 · THEKIE" },
      },
      {
        path: "projects",
        name: "marketplaceProjects",
        component: ProjectListView,
        meta: { title: "투자 프로젝트 · THEKIE" },
      },
      {
        path: "projects/:id",
        name: "marketplaceProjectDetail",
        component: ProjectDetailView,
        meta: { title: "프로젝트 상세 · THEKIE" },
      },
    ],
  },

  // Legacy /projects routes — redirect to marketplace
  {
    path: "/projects",
    redirect: "/marketplace/projects",
  },
  {
    path: "/projects/:id",
    redirect: (to) => `/marketplace/projects/${to.params.id}`,
  },

  // ═══════════ AUTHENTICATED — DASHBOARD (all roles) ═══════════
  {
    path: "/dashboard",
    component: VppDashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "home",
        component: AuthHomeView,
        meta: { title: "대시보드 · THEKIE" },
      },
      {
        path: "portfolio",
        name: "portfolio",
        component: DashboardView,
        meta: {
          title: "포트폴리오 · THEKIE",
          requiredRoles: ["investor_individual", "investor_corporate"],
        },
      },
      {
        path: "power-status",
        name: "powerStatus",
        component: HomeView,
        meta: { title: "전력현황 · THEKIE" },
      },
      {
        path: "transactions",
        name: "transactions",
        component: () => import("@/views/TransactionsView.vue"),
        meta: { title: "거래 내역 · THEKIE" },
      },
    ],
  },

  // Legacy `/` routes — redirect to /dashboard
  { path: "/", redirect: "/dashboard" },
  { path: "/portfolio", redirect: "/dashboard/portfolio" },
  { path: "/power-status", redirect: "/dashboard/power-status" },

  // ═══════════ FACILITIES (shared: investors + developers) ═══════════
  {
    path: "/facilities",
    component: VppDashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "facilityList",
        component: FacilityListView,
        meta: { title: "설비 관리 · THEKIE" },
      },
      {
        path: "register",
        name: "equipmentRegister",
        component: EquipmentRegisterView,
        meta: { title: "설비 등록 · THEKIE" },
      },
    ],
  },

  // Legacy route
  { path: "/equipment-register", redirect: "/facilities/register" },

  // ═══════════ DEVELOPER CONSOLE ═══════════
  {
    path: "/developer",
    component: VppDashboardLayout,
    meta: {
      requiresAuth: true,
      requiredRoles: ["project_developer"],
    },
    children: [
      {
        path: "",
        name: "developerDashboard",
        component: () => import("@/views/developer/DeveloperDashboard.vue"),
        meta: { title: "개발사 대시보드 · THEKIE" },
      },
      {
        path: "projects",
        name: "developerProjects",
        component: () => import("@/views/developer/DeveloperProjects.vue"),
        meta: { title: "내 프로젝트 · THEKIE" },
      },
      {
        path: "projects/new",
        name: "projectWizard",
        component: () => import("@/views/developer/ProjectWizard.vue"),
        meta: { title: "프로젝트 생성 · THEKIE" },
      },
      {
        path: "projects/:id",
        name: "projectManagement",
        component: () => import("@/views/developer/ProjectManagement.vue"),
        meta: { title: "프로젝트 관리 · THEKIE" },
      },
      {
        path: "land-search",
        name: "landSearch",
        component: () => import("@/views/developer/LandSearch.vue"),
        meta: { title: "부지 검색 · THEKIE" },
      },
    ],
  },

  // ═══════════ AUTHORITY PORTAL ═══════════
  {
    path: "/authority",
    component: VppDashboardLayout,
    meta: {
      requiresAuth: true,
      requiredRoles: ["government_authority"],
    },
    children: [
      {
        path: "",
        name: "authorityDashboard",
        component: () => import("@/views/authority/AuthorityDashboard.vue"),
        meta: { title: "관리기관 대시보드 · THEKIE" },
      },
      {
        path: "projects",
        name: "projectOversight",
        component: () => import("@/views/authority/ProjectOversight.vue"),
        meta: { title: "프로젝트 감독 · THEKIE" },
      },
      {
        path: "blockchain",
        name: "blockchainExplorer",
        component: () => import("@/views/authority/BlockchainExplorer.vue"),
        meta: { title: "블록체인 검증 · THEKIE" },
      },
      {
        path: "land-use",
        name: "landUseReport",
        component: () => import("@/views/authority/LandUseReport.vue"),
        meta: { title: "공유지 현황 · THEKIE" },
      },
      {
        path: "reports",
        name: "reportGenerator",
        component: () => import("@/views/authority/ReportGenerator.vue"),
        meta: { title: "보고서 생성 · THEKIE" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const { useAuthStore } = await import("@/stores/auth-store");
  const authStore = useAuthStore();

  if (!authStore.initialized) {
    await authStore.initialize();
  }

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);
  const isAuthPage = to.name === "login" || to.name === "signup";

  // Auth redirect
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: "login", query: { redirect: to.fullPath } });
    return;
  }

  if (isAuthPage && authStore.isAuthenticated) {
    next({ name: "home" });
    return;
  }

  // Role-based access control
  const requiredRoles = to.matched
    .flatMap((r) => r.meta.requiredRoles ?? []);

  if (requiredRoles.length > 0 && authStore.isAuthenticated) {
    if (!authStore.canAccess(requiredRoles)) {
      // Redirect to their own dashboard instead of showing 403
      next({ name: "home" });
      return;
    }
  }

  next();
});

router.afterEach((to) => {
  const title = to.meta.title;
  if (title) document.title = title;
});

export default router;
