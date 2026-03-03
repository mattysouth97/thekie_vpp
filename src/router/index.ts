import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import VppDashboardLayout from "@/layouts/VppDashboardLayout.vue";
import AuthHomeView from "@/views/AuthHomeView.vue";
import DashboardView from "@/views/DashboardView.vue";
import HomeView from "@/views/HomeView.vue";
import SavingsJoinView from "@/views/SavingsJoinView.vue";
import ProjectDetailView from "@/views/ProjectDetailView.vue";
import ProjectListView from "@/views/ProjectListView.vue";
import FacilityListView from "@/views/FacilityListView.vue";
import LandingView from "@/views/LandingView.vue";
import LoginView from "@/views/LoginView.vue";

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
    hideRightPanel?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: "/landing",
    name: "landing",
    component: LandingView,
    meta: { title: "THEKIE VPP 에너지 애그리게이터" },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { title: "로그인 · THEKIE VPP" },
  },
  {
    path: "/signup",
    name: "signup",
    component: () => import("@/views/SignupView.vue"),
    meta: { title: "회원가입 · THEKIE VPP" },
  },
  {
    path: "/onboarding",
    name: "onboarding",
    component: () => import("@/views/OnboardingView.vue"),
    meta: { title: "발전소 전환 신청 · THEKIE VPP" },
  },
  {
    path: "/simulation",
    name: "simulation",
    component: SavingsJoinView,
    meta: { title: "투자 수익 시뮬레이터 · THEKIE VPP", hideRightPanel: true },
  },
  // ── Public investment pages (no auth required) ──
  {
    path: "/projects",
    component: VppDashboardLayout,
    children: [
      {
        path: "",
        name: "projectList",
        component: ProjectListView,
        meta: { title: "투자 상품 · THEKIE VPP" },
      },
      {
        path: ":id",
        name: "projectDetail",
        component: ProjectDetailView,
        meta: { title: "프로젝트 상세 · THEKIE VPP" },
      },
    ],
  },
  // ── Auth-required dashboard ──
  {
    path: "/",
    component: VppDashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "home",
        component: AuthHomeView,
        meta: { title: "홈 · THEKIE VPP" },
      },
      {
        path: "portfolio",
        name: "portfolio",
        component: DashboardView,
        meta: { title: "포트폴리오 · THEKIE VPP" },
      },
      {
        path: "power-status",
        name: "powerStatus",
        component: HomeView,
        meta: { title: "우리동네 전기 현황" },
      },
      {
        path: "facilities",
        name: "facilityList",
        component: FacilityListView,
        meta: { title: "설비 관리 · THEKIE VPP" },
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

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: "login", query: { redirect: to.fullPath } });
  } else if (isAuthPage && authStore.isAuthenticated) {
    next({ name: "home" });
  } else {
    next();
  }
});

router.afterEach((to) => {
  const title = to.meta.title;
  if (title) document.title = title;
});

export default router;
