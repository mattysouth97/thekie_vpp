<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth-store";
import type { UserType, StakeholderRole } from "@/types/auth";
import { ROLE_LABELS } from "@/types/auth";
import {
  IcoArrowLeft, IcoBuilding, IcoDocument, IcoMail, IcoLock, IcoEye, IcoEyeOff,
  IcoInfo, IcoArrowRight, IcoGithub, IcoCoin, IcoSolar, IcoUsers, IcoGlobe,
  IcoLightning,
} from "@/components/icons";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// ── Role selection ──
interface RoleOption {
  role: StakeholderRole;
  label: string;
  desc: string;
  icon: string;
  userType: UserType;
}

const roleOptions: RoleOption[] = [
  { role: "investor_individual", label: "개인 투자자", desc: "재생에너지 프로젝트에 투자하고 수익을 받으세요", icon: "user", userType: "individual" },
  { role: "investor_corporate", label: "법인 투자자", desc: "법인 명의로 투자 · RE100 이행", icon: "building", userType: "business" },
  { role: "project_developer", label: "프로젝트 개발사", desc: "프로젝트를 등록하고 자금을 모집하세요", icon: "solar", userType: "business" },
  { role: "government_authority", label: "정부 / 지자체", desc: "공유지 현황과 블록체인 투명성 보고서", icon: "globe", userType: "individual" },
];

const selectedRole = ref<StakeholderRole>("investor_individual");

const userType = computed<UserType>(() => {
  const opt = roleOptions.find((r) => r.role === selectedRole.value);
  return opt?.userType ?? "individual";
});

const isBusiness = computed(() => userType.value === "business");

function selectRole(role: StakeholderRole) {
  selectedRole.value = role;
  authStore.clearError();
}

const DEMO_EMAIL = "demo@thekie.com";
const DEMO_PW = "demo1234";
const form = reactive({ email: DEMO_EMAIL, password: DEMO_PW, companyName: "", businessNumber: "" });
const showPw = ref(false);

const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

// Role-specific home routes after login
const ROLE_HOME: Record<string, string> = {
  investor_individual: "/dashboard",
  investor_corporate: "/dashboard",
  project_developer: "/developer",
  government_authority: "/authority",
  landowner: "/dashboard",
  equipment_supplier: "/dashboard",
  om_provider: "/dashboard",
  energy_buyer: "/dashboard",
};

async function handleDemoLogin() {
  authStore.clearError();
  const success = await authStore.quickLogin(selectedRole.value);
  if (success) {
    const redirect = (route.query.redirect as string) || ROLE_HOME[selectedRole.value] || "/dashboard";
    router.push(redirect);
  }
}

async function handleLogin() {
  authStore.clearError();

  const isDemo = (!form.email && !form.password) ||
    (form.email === DEMO_EMAIL && form.password === DEMO_PW);

  if (isDemo) {
    return handleDemoLogin();
  }

  if (isBusiness.value) {
    if (!form.companyName.trim()) {
      authStore.error = "회사명을 입력해 주세요.";
      return;
    }
    if (!form.businessNumber.trim()) {
      authStore.error = "사업자등록번호를 입력해 주세요.";
      return;
    }
  }

  if (!form.email || !form.password) {
    authStore.error = "이메일과 비밀번호를 입력해 주세요.";
    return;
  }

  const success = await authStore.login({
    email: form.email,
    password: form.password,
    userType: userType.value,
    primaryRole: selectedRole.value,
  });

  if (success) {
    const redirect = (route.query.redirect as string) || ROLE_HOME[selectedRole.value] || "/dashboard";
    router.push(redirect);
  }
}

function goLanding() {
  router.push("/landing");
}

function goSignup() {
  router.push("/signup");
}

function goSavingsJoin() {
  router.push("/simulation");
}
</script>

<template>
  <div class="login-page">

    <!-- ── Left panel ────────────────────────────────────────────────────── -->
    <div class="login-left">
      <div class="login-left__bg-grid"></div>
      <div class="login-left__glow"></div>

      <button type="button" class="login-left__back" @click="goLanding">
        <IcoArrowLeft :size="16" :strokeWidth="2.5" />
        홈으로
      </button>

      <div class="login-left__content">
        <svg class="login-left__logo" width="363" height="49" viewBox="0 0 363 49" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="THEKIE">
          <path d="M18.6548 9.15527e-05H9.93497C9.57 9.15527e-05 9.22252 0.311126 9.02801 0.811868L0.146424 23.6232C0.0699338 23.8196 0.0196689 24.038 0 24.263H11.526L19.8131 2.97808L18.6548 9.15527e-05Z" fill="currentColor"/>
          <path d="M11.526 24.735H0C0.0196689 24.96 0.0699338 25.1784 0.146424 25.3747L9.02583 48.186C9.22033 48.6868 9.56782 48.9978 9.93278 48.9978H18.6526L19.8109 46.0198L11.5238 24.7328L11.526 24.735Z" fill="currentColor"/>
          <path d="M28.5986 0.811777C28.4041 0.311034 28.0566 0 27.6916 0H19.1531L20.0623 2.33386L20.1868 2.65592L20.3114 2.97799L27.5212 21.4989L32.0843 9.77441L28.5964 0.811777H28.5986Z" fill="currentColor"/>
          <path d="M27.5255 28.7806L31.5904 39.2256L28.168 48.0162C28.0303 48.3692 27.8249 48.5324 27.6938 48.5324H19.8371L27.5255 28.7806ZM27.5255 27.5012L19.1575 49H27.6959C28.0609 49 28.4084 48.689 28.6029 48.1883L32.0908 39.2256L27.5277 27.5012H27.5255Z" fill="currentColor"/>
          <path d="M42.8869 0.467654L43.8638 2.97799L36.7283 21.3091H28.5964L36.5098 0.983838C36.6475 0.630892 36.8529 0.467654 36.984 0.467654H42.8869ZM43.2038 0H36.984C36.6213 0 36.2738 0.311034 36.0793 0.811777L27.9167 21.7768H37.043L44.3621 2.97799L43.2038 0Z" fill="currentColor"/>
          <path d="M37.1523 27.5012L37.043 27.221H27.9167L32.3378 38.5793L32.4624 38.9013L32.587 39.2234L36.0749 48.186C36.2694 48.6868 36.6169 48.9978 36.9797 48.9978H43.1994L44.3577 46.0198L37.1479 27.499L37.1523 27.5012Z" fill="currentColor"/>
          <path d="M44.7379 46.3441L44.6134 46.6662L43.7042 49H54.7428C55.1056 49 55.4531 48.689 55.6498 48.1882L64.5292 25.3769C64.6057 25.1805 64.6559 24.9622 64.6756 24.7372H53.1497L44.8625 46.0242L44.7379 46.3463V46.3441Z" fill="currentColor"/>
          <path d="M45.5225 0H43.7064L44.6156 2.33386L44.7401 2.65592L44.8647 2.97799L53.1519 24.2651H64.6778C64.6581 24.0401 64.6079 23.8217 64.5314 23.6254L55.6498 0.811777C55.4553 0.311034 55.1078 0 54.7428 0H45.5203H45.5225Z" fill="currentColor"/>
          <path d="M94.7165 47.8132V9.38837H75.24V4.45374H118.922V9.38837H100.069V47.8132H94.7187H94.7165Z" fill="currentColor"/>
          <path d="M161.2 47.8131V27.3356H129.205V47.8131H123.855V4.39188H129.205V22.401H161.2V4.39188H166.549V47.8131H161.2Z" fill="currentColor"/>
          <path d="M174.231 47.8131V4.51984H217.306V9.44565H180.517V22.4407H215.538V27.3665H180.517V42.8851H217.306V47.8109H174.231V47.8131Z" fill="currentColor"/>
          <path d="M279.958 47.8131L261.749 27.5827H246.962V47.8131H240.668V4.39188H246.962V22.648H261.629L279.777 4.39188H287.292L266.821 24.6841L287.231 47.8131H279.96H279.958Z" fill="currentColor"/>
          <path d="M298.84 47.8131V4.39188H305.134V47.8131H298.84Z" fill="currentColor"/>
          <path d="M319.86 47.8131V4.45364H363V9.38828H326.154V22.4032H361.228V27.3378H326.154V42.8807H363V47.8153H319.86V47.8131Z" fill="currentColor"/>
        </svg>

        <div class="login-left__tagline">재생에너지 플랫폼 생태계</div>

        <div class="login-left__quotes">
          <div class="lquote">
            <div class="lquote__text">"태양광 수익이 매일 자동으로 들어오는 느낌, 정말 신기해요."</div>
            <div class="lquote__author">
              <div class="lquote__avatar">김</div>
              <div>
                <div class="lquote__name">김태양 · 용인 푸르지오 발전소</div>
                <div class="lquote__role">개인 투자자 · 월 ₩74,244 정산</div>
              </div>
            </div>
          </div>
          <div class="login-left__stats">
            <div class="lstat">
              <div class="lstat__val">₩480억+</div>
              <div class="lstat__label">누적 정산</div>
            </div>
            <div class="lstat">
              <div class="lstat__val">38,000+</div>
              <div class="lstat__label">투자자</div>
            </div>
            <div class="lstat">
              <div class="lstat__val">99.97%</div>
              <div class="lstat__label">정확도</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Right panel (form) ─────────────────────────────────────────────── -->
    <div class="login-right">
      <div class="login-form-wrap">

        <!-- Role selector -->
        <div class="lf-roles">
          <button
            v-for="opt in roleOptions"
            :key="opt.role"
            type="button"
            :class="['lf-role', { 'lf-role--active': selectedRole === opt.role }]"
            @click="selectRole(opt.role)"
          >
            <div class="lf-role__icon">
              <IcoUsers v-if="opt.icon === 'user'" :size="14" :strokeWidth="2" />
              <IcoBuilding v-else-if="opt.icon === 'building'" :size="14" :strokeWidth="2" />
              <IcoSolar v-else-if="opt.icon === 'solar'" :size="14" :strokeWidth="2" />
              <IcoGlobe v-else :size="14" :strokeWidth="2" />
            </div>
            <span class="lf-role__label">{{ opt.label }}</span>
          </button>
        </div>

        <div class="login-form__head">
          <h1 class="login-form__title">{{ ROLE_LABELS[selectedRole] }} 로그인</h1>
          <p class="login-form__sub">{{ roleOptions.find(r => r.role === selectedRole)?.desc }}</p>
        </div>

        <!-- Quick demo login for selected role -->
        <button
          type="button"
          class="lf-demo-btn"
          :class="{ 'lf-demo-btn--loading': loading }"
          :disabled="loading"
          @click="handleDemoLogin"
        >
          <IcoLightning :size="15" :strokeWidth="2.5" />
          <span v-if="!loading">{{ ROLE_LABELS[selectedRole] }}(으)로 데모 로그인</span>
          <span v-else class="lf-spinner"></span>
        </button>

        <div class="lf-divider"><span>또는 직접 로그인</span></div>

        <form class="login-form" @submit.prevent="handleLogin" novalidate>

          <template v-if="isBusiness">
            <div class="lf-group">
              <label class="lf-label">회사명</label>
              <div class="lf-input-wrap">
                <IcoBuilding class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input
                  v-model="form.companyName"
                  type="text"
                  class="lf-input"
                  placeholder="주식회사 더키"
                  autocomplete="organization"
                />
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">사업자등록번호</label>
              <div class="lf-input-wrap">
                <IcoDocument class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input
                  v-model="form.businessNumber"
                  type="text"
                  class="lf-input"
                  placeholder="000-00-00000"
                />
              </div>
            </div>
          </template>

          <div class="lf-group">
            <label class="lf-label">이메일</label>
            <div class="lf-input-wrap">
              <IcoMail class="lf-input-icon" :size="15" :strokeWidth="2" />
              <input
                v-model="form.email"
                type="email"
                class="lf-input"
                placeholder="hong@example.com"
                autocomplete="email"
              />
            </div>
          </div>

          <div class="lf-group">
            <div class="lf-label-row">
              <label class="lf-label">비밀번호</label>
              <a href="#" class="lf-forgot">비밀번호 찾기</a>
            </div>
            <div class="lf-input-wrap">
              <IcoLock class="lf-input-icon" :size="15" :strokeWidth="2" />
              <input
                v-model="form.password"
                :type="showPw ? 'text' : 'password'"
                class="lf-input"
                placeholder="비밀번호 입력"
                autocomplete="current-password"
              />
              <button type="button" class="lf-pw-toggle" @click="showPw = !showPw" tabindex="-1">
                <IcoEye v-if="!showPw" :size="15" :strokeWidth="2" />
                <IcoEyeOff v-else :size="15" :strokeWidth="2" />
              </button>
            </div>
          </div>

          <div v-if="error" class="lf-error">
            <IcoInfo :size="14" :strokeWidth="2" />
            {{ error }}
          </div>

          <button type="submit" class="lf-submit" :class="{ 'lf-submit--loading': loading }" :disabled="loading">
            <span v-if="!loading">
              로그인
              <IcoArrowRight :size="15" :strokeWidth="2.5" />
            </span>
            <span v-else class="lf-spinner"></span>
          </button>

          <div class="lf-divider"><span>또는</span></div>

          <button type="button" class="lf-social" @click="handleLogin">
            <IcoGithub :size="16" :strokeWidth="2" />
            GitHub으로 로그인
          </button>

        </form>

        <!-- 수익 시뮬레이션 CTA -->
        <div class="lf-savings-cta" @click="goSavingsJoin">
          <div class="lf-savings-cta__icon">
            <IcoCoin :size="20" :strokeWidth="2.5" />
          </div>
          <div class="lf-savings-cta__body">
            <div class="lf-savings-cta__title">투자 수익 시뮬레이터</div>
            <div class="lf-savings-cta__desc">로그인 없이 투자 수익을 먼저 계산해 보세요</div>
          </div>
          <IcoArrowRight class="lf-savings-cta__arrow" :size="16" :strokeWidth="2.5" />
        </div>

        <p class="login-form__signup">
          아직 계정이 없으신가요?
          <button type="button" class="login-form__signup-link" @click="goSignup">무료로 시작하기</button>
        </p>

        <p class="login-form__legal">
          로그인 시 <a href="#">이용약관</a> 및 <a href="#">개인정보처리방침</a>에 동의하게 됩니다.
        </p>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
$accent: #4F6AF5;
$accent-dark: #3b56d9;
$text-primary: #0f172a;
$text-secondary: #475569;
$text-muted: #94a3b8;
$border: #e2e8f0;
$surface: #ffffff;
$bg: #f8fafc;

* { box-sizing: border-box; }

.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: "Inter", sans-serif;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// ── Left panel ───────────────────────────────────────────────────────────────
.login-left {
  background: #06082a;
  position: relative;
  overflow: hidden;
  padding: 40px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) { display: none; }
}

.login-left__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(79,106,245,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79,106,245,0.07) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}

.login-left__glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: rgba(79,106,245,0.12);
  filter: blur(120px);
  bottom: -200px;
  left: -100px;
  pointer-events: none;
}

.login-left__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.55);
  font-size: 12px;
  font-weight: 500;
  font-family: "Inter", sans-serif;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  position: relative;
  z-index: 1;
  align-self: flex-start;

  &:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.85); }
}

.login-left__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
  gap: 40px;
}

.login-left__logo {
  height: 24px;
  width: auto;
  color: #fff;
}

.login-left__tagline {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-top: -28px;
}

// Quote
.lquote {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 20px;

  &__text {
    font-size: 14px;
    line-height: 1.65;
    color: rgba(255,255,255,0.75);
    margin-bottom: 16px;
    font-style: italic;
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: $accent;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__name {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
  }

  &__role {
    font-size: 11px;
    color: rgba(255,255,255,0.35);
    margin-top: 1px;
  }
}

.login-left__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.lstat {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 14px;
  text-align: center;

  &__val {
    font-size: 18px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
    margin-bottom: 3px;
  }

  &__label {
    font-size: 10px;
    color: rgba(255,255,255,0.35);
    font-weight: 500;
  }
}

// ── Right panel ──────────────────────────────────────────────────────────────
.login-right {
  background: $surface;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  min-height: 100vh;
}

.login-form-wrap {
  width: 100%;
  max-width: 400px;
}

// ── Role selector ────────────────────────────────────────────────────────────
.lf-roles {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.lf-role {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: $bg;
  border: 1.5px solid $border;
  border-radius: 10px;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;

  &:hover {
    border-color: #a3b3fa;
    background: #f8f9ff;
  }

  &--active {
    border-color: $accent;
    background: #f0f4ff;
    box-shadow: 0 0 0 2px rgba(79, 106, 245, 0.12);
  }
}

.lf-role__icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: $accent;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .lf-role:not(.lf-role--active) & {
    background: #e2e8f0;
    color: $text-muted;
  }
}

.lf-role__label {
  font-size: 12.5px;
  font-weight: 600;
  color: $text-secondary;

  .lf-role--active & {
    color: $accent;
    font-weight: 700;
  }
}

.login-form__head {
  margin-bottom: 16px;
}

// ── Demo login button ──
.lf-demo-btn {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #4F6AF5 0%, #6366f1 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.15s;
  box-shadow: 0 4px 16px rgba(79,106,245,0.35);
  margin-bottom: 16px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(79,106,245,0.45);
  }
  &:active:not(:disabled) { transform: scale(0.98); }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
  &--loading { pointer-events: none; }
}

.login-form__title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: $text-primary;
  margin: 0 0 6px;
}

.login-form__sub {
  font-size: 14px;
  color: $text-muted;
  margin: 0;
}

// Form
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lf-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lf-label {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
}

.lf-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lf-forgot {
  font-size: 12px;
  color: $accent;
  text-decoration: none;
  font-weight: 500;
  &:hover { text-decoration: underline; }
}

.lf-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.lf-input-icon {
  position: absolute;
  left: 12px;
  color: $text-muted;
  flex-shrink: 0;
  pointer-events: none;
}

.lf-input {
  width: 100%;
  height: 44px;
  padding: 0 40px 0 38px;
  background: $bg;
  border: 1px solid $border;
  border-radius: 10px;
  font-size: 14px;
  font-family: "Inter", sans-serif;
  color: $text-primary;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder { color: $text-muted; }

  &:focus {
    border-color: $accent;
    box-shadow: 0 0 0 3px rgba(79,106,245,0.12);
    background: $surface;
  }
}

.lf-pw-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: $text-muted;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
  &:hover { color: $text-secondary; }
}

.lf-error {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 12.5px;
  font-weight: 500;
  padding: 9px 12px;
  border-radius: 8px;
}

.lf-submit {
  height: 46px;
  background: $accent;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  box-shadow: 0 2px 12px rgba(79,106,245,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  span { display: flex; align-items: center; gap: 6px; }

  &:hover:not(:disabled) {
    background: $accent-dark;
    box-shadow: 0 4px 20px rgba(79,106,245,0.4);
  }
  &:active:not(:disabled) { transform: scale(0.98); }
  &:disabled { opacity: 0.7; cursor: not-allowed; }

  &--loading {
    pointer-events: none;
  }
}

.lf-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
}

.lf-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: $text-muted;
  font-size: 12px;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: $border;
  }
}

.lf-social {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  color: $text-primary;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover { background: $bg; border-color: #cbd5e1; }
}

// ── Savings join CTA ─────────────────────────────────────────────────────────
.lf-savings-cta {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #f0f4ff 0%, #fdf4ff 100%);
  border: 1px solid #e0e7ff;
  border-radius: 12px;
  padding: 14px 16px;
  margin: 20px 0 0;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;

  &:hover {
    background: linear-gradient(135deg, #e8efff 0%, #f8eeff 100%);
    border-color: #c7d2fe;
    box-shadow: 0 4px 16px rgba(79, 106, 245, 0.10);
  }
}

.lf-savings-cta__icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: $accent;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lf-savings-cta__body {
  flex: 1;
  min-width: 0;
}

.lf-savings-cta__title {
  font-size: 13px;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 2px;
}

.lf-savings-cta__desc {
  font-size: 11.5px;
  color: $text-muted;
  line-height: 1.4;
}

.lf-savings-cta__arrow {
  color: $accent;
  flex-shrink: 0;
}

.login-form__signup {
  text-align: center;
  margin: 16px 0 0;
  font-size: 13px;
  color: $text-muted;
}

.login-form__signup-link {
  background: none;
  border: none;
  color: $accent;
  font-size: 13px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  cursor: pointer;
  padding: 0;
  &:hover { text-decoration: underline; }
}

.login-form__legal {
  text-align: center;
  margin: 8px 0 0;
  font-size: 11px;
  color: $text-muted;
  line-height: 1.6;

  a {
    color: $text-muted;
    text-decoration: underline;
    &:hover { color: $text-secondary; }
  }
}
</style>
