<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth-store";
import { IcoArrowLeft, IcoLightning, IcoBlockchain, IcoGlobe, IcoBuilding, IcoDocument, IcoUser, IcoMail, IcoLock, IcoEye, IcoEyeOff, IcoInfo, IcoArrowRight, IcoGithub } from "@/components/icons";
import type { UserType } from "@/types/auth";

const router = useRouter();
const authStore = useAuthStore();

const userType = ref<UserType>("individual");
const form = reactive({
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  agreeTerms: false,
  companyName: "",
  businessNumber: "",
});

const showPw = ref(false);
const showPwConfirm = ref(false);
const localError = ref("");

const loading = computed(() => authStore.loading);
const displayError = computed(() => localError.value || authStore.error);
const isBusiness = computed(() => userType.value === "business");

function switchTab(type: UserType) {
  userType.value = type;
  localError.value = "";
  authStore.clearError();
}

async function handleSignup() {
  localError.value = "";
  authStore.clearError();

  if (isBusiness.value) {
    if (!form.companyName.trim()) {
      localError.value = "회사명을 입력해 주세요.";
      return;
    }
    if (!form.businessNumber.trim()) {
      localError.value = "사업자등록번호를 입력해 주세요.";
      return;
    }
  }

  if (!form.name.trim()) {
    localError.value = "이름을 입력해 주세요.";
    return;
  }
  if (!form.email) {
    localError.value = "이메일을 입력해 주세요.";
    return;
  }
  if (!form.password || form.password.length < 8) {
    localError.value = "비밀번호는 8자 이상이어야 합니다.";
    return;
  }
  if (form.password !== form.passwordConfirm) {
    localError.value = "비밀번호가 일치하지 않습니다.";
    return;
  }
  if (!form.agreeTerms) {
    localError.value = "이용약관에 동의해 주세요.";
    return;
  }

  const success = await authStore.signup({
    name: form.name.trim(),
    email: form.email,
    password: form.password,
    passwordConfirm: form.passwordConfirm,
    agreeTerms: form.agreeTerms,
    userType: userType.value,
    ...(isBusiness.value && {
      companyName: form.companyName.trim(),
      businessNumber: form.businessNumber.trim(),
    }),
  });

  if (success) {
    router.push("/");
  }
}

function goLanding() {
  router.push("/landing");
}

function goLogin() {
  router.push("/login");
}
</script>

<template>
  <div class="signup-page">

    <!-- Left panel -->
    <div class="signup-left">
      <div class="signup-left__bg-grid"></div>
      <div class="signup-left__glow"></div>

      <button type="button" class="signup-left__back" @click="goLanding">
        <IcoArrowLeft :size="16" :strokeWidth="2.5" />
        홈으로
      </button>

      <div class="signup-left__content">
        <svg class="signup-left__logo" width="363" height="49" viewBox="0 0 363 49" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="THEKIE">
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

        <div class="signup-left__tagline">VPP 전력 정산 플랫폼</div>

        <div class="signup-left__benefits">
          <div class="sbenefit">
            <div class="sbenefit__icon">
              <IcoLightning :size="18" :strokeWidth="2" />
            </div>
            <div>
              <div class="sbenefit__title">실시간 전력 정산</div>
              <div class="sbenefit__desc">SMP, REC, PPA 수익을 매일 자동으로 정산합니다</div>
            </div>
          </div>
          <div class="sbenefit">
            <div class="sbenefit__icon">
              <IcoBlockchain :size="18" :strokeWidth="2" />
            </div>
            <div>
              <div class="sbenefit__title">블록체인 투명성</div>
              <div class="sbenefit__desc">모든 거래가 블록체인에 투명하게 기록됩니다</div>
            </div>
          </div>
          <div class="sbenefit">
            <div class="sbenefit__icon">
              <IcoGlobe :size="18" :strokeWidth="2" />
            </div>
            <div>
              <div class="sbenefit__title">AI 투자 신호</div>
              <div class="sbenefit__desc">AI가 시장을 분석하여 최적 투자 타이밍을 제안합니다</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel (form) -->
    <div class="signup-right">
      <div class="signup-form-wrap">

        <div class="lf-tabs">
          <button type="button" :class="['lf-tabs__btn', { 'lf-tabs__btn--active': !isBusiness }]" @click="switchTab('individual')">일반사용자</button>
          <button type="button" :class="['lf-tabs__btn', { 'lf-tabs__btn--active': isBusiness }]" @click="switchTab('business')">법인사업자</button>
        </div>

        <div class="signup-form__head">
          <h1 class="signup-form__title">{{ isBusiness ? '법인 계정 등록' : '에너지 통장 만들기' }}</h1>
          <p class="signup-form__sub">{{ isBusiness ? '사업자 정보를 입력하세요' : '무료로 시작하세요' }}</p>
        </div>

        <form class="signup-form" @submit.prevent="handleSignup" novalidate>

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
            <label class="lf-label">이름</label>
            <div class="lf-input-wrap">
              <IcoUser class="lf-input-icon" :size="15" :strokeWidth="2" />
              <input
                v-model="form.name"
                type="text"
                class="lf-input"
                placeholder="홍길동"
                autocomplete="name"
              />
            </div>
          </div>

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
            <label class="lf-label">비밀번호</label>
            <div class="lf-input-wrap">
              <IcoLock class="lf-input-icon" :size="15" :strokeWidth="2" />
              <input
                v-model="form.password"
                :type="showPw ? 'text' : 'password'"
                class="lf-input"
                placeholder="비밀번호 입력 (8자 이상)"
                autocomplete="new-password"
              />
              <button type="button" class="lf-pw-toggle" @click="showPw = !showPw" tabindex="-1">
                <IcoEye v-if="!showPw" :size="15" :strokeWidth="2" />
                <IcoEyeOff v-else :size="15" :strokeWidth="2" />
              </button>
            </div>
          </div>

          <div class="lf-group">
            <label class="lf-label">비밀번호 확인</label>
            <div class="lf-input-wrap">
              <IcoLock class="lf-input-icon" :size="15" :strokeWidth="2" />
              <input
                v-model="form.passwordConfirm"
                :type="showPwConfirm ? 'text' : 'password'"
                class="lf-input"
                placeholder="비밀번호 다시 입력"
                autocomplete="new-password"
              />
              <button type="button" class="lf-pw-toggle" @click="showPwConfirm = !showPwConfirm" tabindex="-1">
                <IcoEye v-if="!showPwConfirm" :size="15" :strokeWidth="2" />
                <IcoEyeOff v-else :size="15" :strokeWidth="2" />
              </button>
            </div>
          </div>

          <label class="lf-checkbox">
            <input v-model="form.agreeTerms" type="checkbox" class="lf-checkbox__input" />
            <span class="lf-checkbox__label">
              <a href="#">이용약관</a> 및 <a href="#">개인정보처리방침</a>에 동의합니다
            </span>
          </label>

          <div v-if="displayError" class="lf-error">
            <IcoInfo :size="14" :strokeWidth="2" />
            {{ displayError }}
          </div>

          <button type="submit" class="lf-submit" :class="{ 'lf-submit--loading': loading }" :disabled="loading">
            <span v-if="!loading">
              회원가입
              <IcoArrowRight :size="15" :strokeWidth="2.5" />
            </span>
            <span v-else class="lf-spinner"></span>
          </button>

          <div class="lf-divider"><span>또는</span></div>

          <button type="button" class="lf-social">
            <IcoGithub :size="16" :strokeWidth="2" />
            GitHub으로 회원가입
          </button>

        </form>

        <p class="signup-form__login">
          이미 계정이 있으신가요?
          <button type="button" class="signup-form__login-link" @click="goLogin">로그인하기</button>
        </p>

        <p class="signup-form__legal">
          가입 시 <a href="#">이용약관</a> 및 <a href="#">개인정보처리방침</a>에 동의하게 됩니다.
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

.signup-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: "Inter", sans-serif;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// Left panel
.signup-left {
  background: #06082a;
  position: relative;
  overflow: hidden;
  padding: 40px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) { display: none; }
}

.signup-left__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(79,106,245,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79,106,245,0.07) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}

.signup-left__glow {
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

.signup-left__back {
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

.signup-left__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
  gap: 40px;
}

.signup-left__logo {
  height: 24px;
  width: auto;
  color: #fff;
}

.signup-left__tagline {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-top: -28px;
}

// Benefits
.signup-left__benefits {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sbenefit {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 16px;

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(79,106,245,0.2);
    color: #93b4ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__title {
    font-size: 13px;
    font-weight: 700;
    color: rgba(255,255,255,0.85);
    margin-bottom: 3px;
  }

  &__desc {
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    line-height: 1.5;
  }
}

// Right panel
.signup-right {
  background: $surface;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  min-height: 100vh;
}

.signup-form-wrap {
  width: 100%;
  max-width: 400px;
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
.lf-tabs {
  display: flex;
  border-bottom: 2px solid $border;
  margin-bottom: 24px;
}

.lf-tabs__btn {
  flex: 1;
  padding: 12px 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 14px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  color: $text-muted;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;

  &:hover { color: $text-secondary; }

  &--active {
    color: $accent;
    border-bottom-color: $accent;
  }
}

.signup-form__head {
  margin-bottom: 28px;
}

.signup-form__title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: $text-primary;
  margin: 0 0 6px;
}

.signup-form__sub {
  font-size: 14px;
  color: $text-muted;
  margin: 0;
}

// Form (reuses lf-* class names from LoginView pattern)
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
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

.lf-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &__input {
    width: 16px;
    height: 16px;
    accent-color: $accent;
    cursor: pointer;
    flex-shrink: 0;
  }

  &__label {
    font-size: 12.5px;
    color: $text-secondary;
    line-height: 1.4;

    a {
      color: $accent;
      text-decoration: none;
      font-weight: 500;
      &:hover { text-decoration: underline; }
    }
  }
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

  &--loading { pointer-events: none; }
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

.signup-form__login {
  text-align: center;
  margin: 16px 0 0;
  font-size: 13px;
  color: $text-muted;
}

.signup-form__login-link {
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

.signup-form__legal {
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
