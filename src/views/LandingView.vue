<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketStore } from "@/stores/market-store";
import { IcoCoin, IcoArrowRight, IcoCheck, IcoLightning, IcoGlobe, IcoUser, IcoChevronDown, IcoSettings, IcoLogout, IcoChartBar, IcoStar, IcoSolar } from "@/components/icons";

const router = useRouter();
const authStore = useAuthStore();
const marketStore = useMarketStore();
onMounted(() => { marketStore.startPolling(); });
const scrolled = ref(false);
const scrollY = ref(0);
const statsVisible = ref(false);
const statsRef = ref<HTMLElement | null>(null);
const showUserMenu = ref(false);

// Hero scroll-shrink effect
const heroScale = computed(() => {
  const progress = Math.min(scrollY.value / 600, 1);
  return 1 - progress * 0.08; // 1.0 → 0.92
});
const heroOpacity = computed(() => {
  const progress = Math.min(scrollY.value / 600, 1);
  return 1 - progress * 0.7; // 1.0 → 0.3
});

function goToDashboard() {
  if (authStore.isAuthenticated) {
    router.push("/");
  } else {
    router.push("/login");
  }
}

function goToSignup() {
  router.push("/signup");
}

function goToOnboarding() {
  router.push("/onboarding");
}

function handleScroll() {
  scrolled.value = window.scrollY > 20;
  scrollY.value = window.scrollY;
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

function closeUserMenu() {
  showUserMenu.value = false;
}

function handleMenuAction(action: string) {
  showUserMenu.value = false;
  switch (action) {
    case "portfolio": router.push("/portfolio"); break;
    case "settings": router.push("/"); break;
    case "subscription": router.push("/"); break;
    case "logout": authStore.logout(); break;
  }
}

let observer: IntersectionObserver | null = null;

function handleClickOutside(e: MouseEvent) {
  const userEl = document.querySelector(".lnav__user");
  if (userEl && !userEl.contains(e.target as Node)) {
    showUserMenu.value = false;
  }
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  document.addEventListener("click", handleClickOutside);
  authStore.initialize();
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) statsVisible.value = true;
    },
    { threshold: 0.3 }
  );
  if (statsRef.value) observer.observe(statsRef.value);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  document.removeEventListener("click", handleClickOutside);
  observer?.disconnect();
});

const valueChain = [
  {
    num: "01",
    title: "VALIDATE",
    subtitle: "사업 타당성 검증",
    desc: "일사량, 계통 연계, 수익성 분석으로 태양광 프로젝트의 실현 가능성을 검증합니다.",
    color: "#4F6AF5",
    bg: "#EEF2FF",
  },
  {
    num: "02",
    title: "ASSEMBLE",
    subtitle: "핵심 참여자 조율",
    desc: "EPC, 금융기관, 토지 소유자, 전력 수요처 등 사업 실행에 필요한 참여자를 조율합니다.",
    color: "#8b5cf6",
    bg: "#F5F3FF",
  },
  {
    num: "03",
    title: "ENGINEER & CONSTRUCT",
    subtitle: "설비 설계·시공",
    desc: "최적 설비 설계부터 시공 관리까지 프로젝트 실행을 총괄합니다.",
    color: "#06b6d4",
    bg: "#ECFEFF",
  },
  {
    num: "04",
    title: "MONITOR",
    subtitle: "실시간 모니터링",
    desc: "RTU, 스마트미터를 통해 개별 발전소의 발전량·상태를 실시간으로 모니터링합니다.",
    color: "#22c55e",
    bg: "#F0FDF4",
  },
  {
    num: "05",
    title: "COORDINATE",
    subtitle: "행정 통합 관리",
    desc: "개별 발전소의 인허가, 보험, 계약 등 행정 절차를 단일 주체로 통합 관리합니다.",
    color: "#f59e0b",
    bg: "#FFFBEB",
  },
  {
    num: "06",
    title: "PARTICIPATE",
    subtitle: "전력시장 참여",
    desc: "VPP로서 전력시장(SMP, REC)에 참여하여 포트폴리오 수익을 극대화합니다.",
    color: "#ec4899",
    bg: "#FDF2F8",
  },
  {
    num: "07",
    title: "SETTLE",
    subtitle: "수익 정산·배분",
    desc: "블록체인 기반 투명한 정산으로 참여자별 수익을 정확하게 배분합니다.",
    color: "#4F6AF5",
    bg: "#EEF2FF",
  },
];

const steps = [
  { num: "01", title: "프로젝트 타당성 검토", desc: "현장 조사, 일사량 분석, 수익성 시뮬레이션으로 프로젝트를 검증합니다" },
  { num: "02", title: "인프라 구축 및 연동", desc: "RTU·스마트미터 설치, 모니터링 소프트웨어 연동, 블록체인 원장 연결" },
  { num: "03", title: "운영·정산·RE100", desc: "발전소 운영, 시장 참여, 자동 정산, RE100 실적 리포트 제공" },
];

const plans = [
  {
    name: "스타터",
    price: "₩0",
    period: "/ 월",
    desc: "소규모 발전소 운영 입문",
    features: ["발전소 1개 운영 관리", "월간 정산 리포트", "기본 모니터링"],
    cta: "무료로 시작",
    accent: false,
  },
  {
    name: "비즈니스",
    price: "₩29,000",
    period: "/ 월",
    desc: "중소 발전 사업자 최적 플랜",
    features: ["발전소 5개 운영 관리", "실시간 정산 + 블록체인", "AI 이상 탐지", "RE100 실적 대시보드"],
    cta: "시작하기",
    accent: true,
  },
  {
    name: "엔터프라이즈",
    price: "₩89,000",
    period: "/ 월",
    desc: "대규모 에너지 사업자 및 기관",
    features: ["무제한 발전소 운영", "API 연동", "전담 기술 매니저", "VPP 시장 참여"],
    cta: "도입 문의",
    accent: false,
  },
];
</script>

<template>
  <div class="landing">

    <!-- ── Navbar ─────────────────────────────────────────────────────────── -->
    <header class="lnav" :class="{ 'lnav--scrolled': scrolled }">
      <div class="lnav__inner">
        <svg class="lnav__logo" width="363" height="49" viewBox="0 0 363 49" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="THEKIE">
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

        <nav class="lnav__links">
          <a href="#valuechain" class="lnav__link">밸류체인</a>
          <router-link to="/projects" class="lnav__link">투자 상품</router-link>
          <router-link to="/simulation" class="lnav__link">투자 수익 시뮬레이터</router-link>
          <a href="#how" class="lnav__link">도입 방법</a>
          <a href="#pricing" class="lnav__link">요금제</a>
        </nav>

        <div class="lnav__actions">
          <!-- Authenticated: user avatar + dropdown -->
          <template v-if="authStore.isAuthenticated">
            <div class="lnav__user">
              <button type="button" class="lnav__user-btn" @click="toggleUserMenu">
                <span class="lnav__avatar">{{ authStore.user?.avatarInitial ?? 'U' }}</span>
                <IcoChevronDown :size="14" />
              </button>
              <Transition name="lnav-menu">
                <div v-if="showUserMenu" class="lnav__dropdown">
                  <div class="lnav__dropdown-header">
                    <span class="lnav__dropdown-name">{{ authStore.user?.displayName }}</span>
                    <span class="lnav__dropdown-email">{{ authStore.user?.email }}</span>
                  </div>
                  <div class="lnav__dropdown-divider"></div>
                  <button class="lnav__dropdown-item" @click="handleMenuAction('portfolio')">
                    <IcoChartBar :size="16" /> 포트폴리오
                  </button>
                  <button class="lnav__dropdown-item" @click="handleMenuAction('settings')">
                    <IcoSettings :size="16" /> 사용자 설정
                  </button>
                  <button class="lnav__dropdown-item" @click="handleMenuAction('subscription')">
                    <IcoStar :size="16" /> 구독 관리
                  </button>
                  <div class="lnav__dropdown-divider"></div>
                  <button class="lnav__dropdown-item lnav__dropdown-item--danger" @click="handleMenuAction('logout')">
                    <IcoLogout :size="16" /> 로그아웃
                  </button>
                </div>
              </Transition>
            </div>
          </template>

          <!-- Not authenticated: login + signup buttons -->
          <template v-else>
            <button type="button" class="lnav__btn lnav__btn--ghost" @click="goToDashboard">로그인</button>
            <button type="button" class="lnav__btn lnav__btn--primary" @click="goToSignup">무료로 시작하기</button>
          </template>
        </div>
      </div>
    </header>

    <!-- ── Hero (full-width banner) ──────────────────────────────────────── -->
    <section class="hero">
      <!-- Background: replace placeholder with real image via background-image in SCSS -->
      <div class="hero__bg"></div>
      <div class="hero__overlay"></div>

      <div class="hero__content" :style="{ transform: `scale(${heroScale})`, opacity: heroOpacity }">
        <div class="hero__badge">
          <span class="hero__badge-dot"></span>
          VPP Energy Aggregator · Solar PV Portfolio Platform
        </div>

        <h1 class="hero__title">
          분산된 에너지 자원을<br>
          <span class="hero__title-accent">하나의 시스템</span>으로 통합합니다
        </h1>

        <p class="hero__desc">
          THEKIE는 태양광 PV 포트폴리오의 금융·인허가·시공·운영·정산을 수행하는<br class="hero__br">
          에너지 애그리게이터입니다. 본질적으로 불안정한 재생에너지에 안정성을 더합니다.
        </p>

        <div class="hero__cta-row">
          <button type="button" class="hero__cta-primary" @click="goToSignup">
            <IcoLightning :size="16" :strokeWidth="2.5" />
            데모 요청하기
          </button>
          <button type="button" class="hero__cta-ghost" @click="goToDashboard">
            플랫폼 둘러보기
            <IcoArrowRight :size="14" :strokeWidth="2.5" />
          </button>
        </div>

        <div class="hero__trust">
          <span class="hero__trust-item"><IcoCheck :size="14" :strokeWidth="2.5" /> 풀 밸류체인 운영</span>
          <span class="hero__trust-sep">·</span>
          <span class="hero__trust-item"><IcoCheck :size="14" :strokeWidth="2.5" /> 블록체인 단일 진실 원장</span>
          <span class="hero__trust-sep">·</span>
          <span class="hero__trust-item"><IcoCheck :size="14" :strokeWidth="2.5" /> 2,400+ 태양광 포트폴리오</span>
        </div>
      </div>

      <!-- Data console preview mockup (floating below hero text) -->
      <div class="hero__mockup-wrap" :style="{ transform: `scale(${heroScale})`, opacity: heroOpacity }">
        <div class="hero__preview">
          <div class="hero__preview-bar">
            <span class="hero__preview-dot"></span>
            <span class="hero__preview-dot"></span>
            <span class="hero__preview-dot"></span>
            <span class="hero__preview-url">thekie.com/aggregator</span>
          </div>
          <div class="hero__preview-content">
            <div class="mock-market-bar">
              <span class="mock-badge mock-badge--blue">SMP</span><span class="mock-val">{{ marketStore.smpDisplay.landAvg }}</span><span :class="(marketStore.smp?.landAvg ?? 117) >= 117 ? 'mock-up' : 'mock-dn'">{{ (marketStore.smp?.landAvg ?? 117) >= 117 ? '▲' : '▼' }}{{ Math.abs((marketStore.smp?.landAvg ?? 117) - 117).toFixed(2) }}</span>
              <span class="mock-sep"></span>
              <span class="mock-badge mock-badge--amber">REC</span><span class="mock-val">{{ marketStore.recDisplay.avgPrice }}</span><span :class="marketStore.recDisplay.changeUp ? 'mock-up' : 'mock-dn'">{{ marketStore.recDisplay.changeUp ? '▲' : '▼' }}{{ Math.abs(marketStore.rec?.change ?? 0).toLocaleString('ko-KR') }}</span>
              <span class="mock-sep"></span>
              <span class="mock-badge mock-badge--green">KAU</span><span class="mock-val">8,500</span><span class="mock-up">▲200</span>
            </div>
            <div class="mock-cards">
              <div class="mock-card">
                <div class="mock-card__label">운용 포트폴리오</div>
                <div class="mock-card__val">2,431개</div>
                <div class="mock-card__badge">↑운용중</div>
              </div>
              <div class="mock-card">
                <div class="mock-card__label">금일 정산액</div>
                <div class="mock-card__val">₩4.8억</div>
                <div class="mock-card__badge">+₩2.1억</div>
              </div>
              <div class="mock-card">
                <div class="mock-card__label">평균 가동률</div>
                <div class="mock-card__val">96.4%</div>
                <div class="mock-card__badge">▲1.2%</div>
              </div>
            </div>
            <div class="mock-chart">
              <svg viewBox="0 0 280 80" width="100%" height="80">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#4F6AF5" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#4F6AF5" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,60 C20,55 40,45 60,40 C80,35 100,30 120,25 C140,20 160,28 180,22 C200,16 220,18 240,12 C260,6 270,8 280,5" fill="none" stroke="#4F6AF5" stroke-width="2"/>
                <path d="M0,60 C20,55 40,45 60,40 C80,35 100,30 120,25 C140,20 160,28 180,22 C200,16 220,18 240,12 C260,6 270,8 280,5 L280,80 L0,80 Z" fill="url(#chartGrad)"/>
                <path d="M0,70 C30,68 60,65 90,62 C120,59 150,56 180,55 C210,54 240,52 280,50" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4 3"/>
              </svg>
            </div>
            <div class="mock-feed">
              <div class="mock-feed__head">
                <span class="mock-live-dot"></span>
                <span>실시간 운영 로그</span>
              </div>
              <div class="mock-tx">
                <span class="mock-tx__badge mock-tx__badge--amber">정산 배분 완료</span>
                <span class="mock-tx__hash">0x4f2e…a9c1</span>
                <span class="mock-tx__val">₩12.4M 배분</span>
              </div>
              <div class="mock-tx">
                <span class="mock-tx__badge mock-tx__badge--blue">발전소 #1847 알림</span>
                <span class="mock-tx__hash">RTU-1847</span>
                <span class="mock-tx__val">가동률 98.1%</span>
              </div>
              <div class="mock-tx">
                <span class="mock-tx__badge mock-tx__badge--violet">REC 시장 체결</span>
                <span class="mock-tx__hash">0x1c7a…e852</span>
                <span class="mock-tx__val">{{ marketStore.recDisplay.avgPrice }} 원/REC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Stats ─────────────────────────────────────────────────────────── -->
    <section class="stats" ref="statsRef">
      <div class="stats__inner">
        <div class="stats__item" :class="{ 'stats__item--visible': statsVisible }">
          <div class="stats__num">2,400+</div>
          <div class="stats__label">운용 발전소</div>
        </div>
        <div class="stats__divider"></div>
        <div class="stats__item" :class="{ 'stats__item--visible': statsVisible }" style="transition-delay: 0.1s">
          <div class="stats__num">₩480억+</div>
          <div class="stats__label">누적 정산 금액</div>
        </div>
        <div class="stats__divider"></div>
        <div class="stats__item" :class="{ 'stats__item--visible': statsVisible }" style="transition-delay: 0.2s">
          <div class="stats__num">340+</div>
          <div class="stats__label">RE100 이행 고객사</div>
        </div>
        <div class="stats__divider"></div>
        <div class="stats__item" :class="{ 'stats__item--visible': statsVisible }" style="transition-delay: 0.3s">
          <div class="stats__num">99.97%</div>
          <div class="stats__label">정산 정확도</div>
        </div>
      </div>
    </section>

    <!-- ── Value Chain ──────────────────────────────────────────────────── -->
    <section class="vchain" id="valuechain">
      <div class="section-inner">
        <div class="section-head">
          <span class="section-tag">풀 밸류체인</span>
          <h2 class="section-title vchain__title">분산된 에너지 자원을 통합하여 안정적인 공공, 산업, 민간 가치 창출</h2>
          <p class="section-desc">태양광 PV 사업의 시작부터 수익 정산까지, 하나의 플랫폼에서</p>
        </div>
        <div class="vchain__grid">
          <div
            v-for="v in valueChain"
            :key="v.num"
            class="vchain-card"
          >
            <div class="vchain-card__num" :style="{ background: v.bg, color: v.color }">{{ v.num }}</div>
            <h3 class="vchain-card__title">{{ v.title }}</h3>
            <div class="vchain-card__subtitle">{{ v.subtitle }}</div>
            <p class="vchain-card__desc">{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Blockchain (hero-level callout) ─────────────────────────────── -->
    <section class="blockchain" id="blockchain">
      <div class="blockchain__inner">
        <div class="blockchain__glow"></div>
        <div class="section-head">
          <span class="section-tag blockchain__tag">핵심 경쟁력</span>
          <h2 class="section-title blockchain__title">블록체인: 분산 에너지의<br>단일 진실 원장</h2>
          <p class="section-desc blockchain__desc">재생에너지 발전소는 지리적으로 분산되어 있습니다. THEKIE의 독자적 블록체인 기술은 분산된 데이터를 하나의 검증 가능한 진실 원장으로 통합하여, 성장하는 에너지 시장의 정당성을 확립합니다.</p>
        </div>
        <div class="blockchain__grid">
          <div class="blockchain__card">
            <div class="blockchain__card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <h3 class="blockchain__card-title">Single Source of Truth</h3>
            <p class="blockchain__card-desc">모든 발전소의 발전량·정산 데이터가 단일 원장에 기록됩니다. 분산된 현장의 데이터를 하나로 통합.</p>
          </div>
          <div class="blockchain__card">
            <div class="blockchain__card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 class="blockchain__card-title">Structural Transparency</h3>
            <p class="blockchain__card-desc">누구도 수정할 수 없는 구조적 투명성으로 참여자 간 신뢰를 확보합니다. 데이터 조작이 불가능한 설계.</p>
          </div>
          <div class="blockchain__card">
            <div class="blockchain__card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 class="blockchain__card-title">Market Legitimacy</h3>
            <p class="blockchain__card-desc">재생에너지 시장의 성장을 뒷받침하는 데이터 정당성을 확립합니다. 검증 가능한 에너지 거래 인프라.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Technology Infrastructure ──────────────────────────────────── -->
    <section class="tech-infra" id="technology">
      <div class="section-inner">
        <div class="section-head">
          <span class="section-tag">C&I 인프라</span>
          <h2 class="section-title">산업·상업 부문을 위한 에너지 인프라 기술</h2>
          <p class="section-desc">C&I 고객에게 신뢰할 수 있는 에너지 공급을 위해 하드웨어부터 정산까지 완전한 기술 스택을 구축합니다.</p>
        </div>
        <div class="tech-infra__grid">
          <div class="tech-infra__item">
            <div class="tech-infra__icon-wrap" style="background: #EEF2FF; color: #4F6AF5;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/></svg>
            </div>
            <h3 class="tech-infra__title">RTU & 스마트미터 <span class="tech-infra__en">Hardware</span></h3>
            <p class="tech-infra__desc">현장 계측 장비로 발전량, 전압, 전류를 실시간 수집합니다. 모든 데이터의 출발점.</p>
          </div>
          <div class="tech-infra__item">
            <div class="tech-infra__icon-wrap" style="background: #F0FDF4; color: #22c55e;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
            </div>
            <h3 class="tech-infra__title">모니터링 소프트웨어 <span class="tech-infra__en">Software</span></h3>
            <p class="tech-infra__desc">AI 기반 이상 탐지, 발전량 예측, 설비 상태 관리를 통합하는 운영 소프트웨어.</p>
          </div>
          <div class="tech-infra__item">
            <div class="tech-infra__icon-wrap" style="background: #FEF3C7; color: #f59e0b;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 class="tech-infra__title">정산 시스템 <span class="tech-infra__en">Settlement</span></h3>
            <p class="tech-infra__desc">SMP·REC·PPA 자동 정산, 블록체인 기록, 참여자별 수익 배분을 자동화합니다.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── How it works ──────────────────────────────────────────────────── -->
    <section class="how" id="how">
      <div class="section-inner">
        <div class="section-head">
          <span class="section-tag">도입 방법</span>
          <h2 class="section-title">3단계로 시작하는 에너지 포트폴리오</h2>
        </div>
        <div class="how__steps">
          <div v-for="(s, i) in steps" :key="s.num" class="how-step">
            <div class="how-step__num">{{ s.num }}</div>
            <div class="how-step__body">
              <h3 class="how-step__title">{{ s.title }}</h3>
              <p class="how-step__desc">{{ s.desc }}</p>
            </div>
            <div v-if="i < steps.length - 1" class="how-step__arrow">
              <IcoArrowRight :size="24" :strokeWidth="2" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Pricing ───────────────────────────────────────────────────────── -->
    <section class="pricing" id="pricing">
      <div class="section-inner">
        <div class="section-head">
          <span class="section-tag">요금제</span>
          <h2 class="section-title">투명한 요금, 숨겨진 비용 없음</h2>
          <p class="section-desc">모든 플랜에 14일 무료 체험이 포함됩니다.</p>
        </div>
        <div class="pricing__grid">
          <div
            v-for="p in plans"
            :key="p.name"
            class="plan-card"
            :class="{ 'plan-card--accent': p.accent }"
          >
            <div v-if="p.accent" class="plan-card__badge">가장 인기</div>
            <div class="plan-card__name">{{ p.name }}</div>
            <div class="plan-card__price">
              {{ p.price }}<span class="plan-card__period">{{ p.period }}</span>
            </div>
            <div class="plan-card__desc">{{ p.desc }}</div>
            <ul class="plan-card__list">
              <li v-for="feat in p.features" :key="feat">
                <IcoCheck :size="14" :strokeWidth="2.5" />
                {{ feat }}
              </li>
            </ul>
            <button
              type="button"
              class="plan-card__cta"
              :class="{ 'plan-card__cta--accent': p.accent }"
              @click="goToDashboard"
            >{{ p.cta }}</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Carbon Impact ─────────────────────────────────────────────────── -->
    <section class="carbon" id="carbon">
      <div class="section-inner">
        <div class="section-head">
          <span class="section-tag">탄소 감축 성과</span>
          <h2 class="section-title">데이터 기반 탄소 감축, 측정 가능한 성과</h2>
          <p class="section-desc">THEKIE의 정확한 에너지 데이터가 RE100·K-RE100 달성과 탄소 크레딧 정산을 가능하게 합니다.</p>
        </div>
        <div class="carbon__grid">
          <div class="carbon__item">
            <div class="carbon__num">12,400 tCO₂</div>
            <div class="carbon__label">누적 탄소 감축량</div>
          </div>
          <div class="carbon__divider"></div>
          <div class="carbon__item">
            <div class="carbon__num">340+</div>
            <div class="carbon__label">RE100 인증 지원 건수</div>
          </div>
          <div class="carbon__divider"></div>
          <div class="carbon__item">
            <div class="carbon__num">₩32억+</div>
            <div class="carbon__label">탄소 크레딧 정산 규모</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA Banner ─────────────────────────────────────────────────────── -->
    <section class="cta-banner">
      <div class="cta-banner__inner">
        <div class="cta-banner__glow"></div>
        <h2 class="cta-banner__title">태양광 포트폴리오를 시작하세요</h2>
        <p class="cta-banner__desc">14일 무료 체험 · 카드 등록 불필요 · 언제든지 해지 가능</p>
        <button type="button" class="cta-banner__btn" @click="goToSignup">무료로 시작하기</button>
      </div>
    </section>

    <!-- ── 발전소 전환 CTA ────────────────────────────────────────────────── -->
    <section class="switch-cta">
      <div class="switch-cta__inner">
        <div class="switch-cta__icon">
          <IcoSolar :size="24" :strokeWidth="2" />
        </div>
        <div class="switch-cta__body">
          <h3 class="switch-cta__title">이미 발전소를 운영 중이신가요?</h3>
          <p class="switch-cta__desc">기존 중개사업자에서 THEKIE로 전환하세요. 전환 수수료 0%, 기존 계약 유지 보장.</p>
        </div>
        <button type="button" class="switch-cta__btn" @click="goToOnboarding">
          전환 신청하기
          <IcoArrowRight :size="14" :strokeWidth="2.5" />
        </button>
      </div>
    </section>

    <!-- ── Footer ─────────────────────────────────────────────────────────── -->
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <svg class="footer__logo" width="120" height="16" viewBox="0 0 363 49" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <p class="footer__tagline">VPP 에너지 애그리게이터 플랫폼</p>
        </div>
        <div class="footer__links">
          <div class="footer__col">
            <div class="footer__col-title">서비스</div>
            <a href="#valuechain" class="footer__link">밸류체인</a>
            <a href="#how" class="footer__link">도입 방법</a>
            <a href="#pricing" class="footer__link">요금제</a>
          </div>
          <div class="footer__col">
            <div class="footer__col-title">회사</div>
            <a href="#" class="footer__link">소개</a>
            <a href="#" class="footer__link">블로그</a>
            <a href="#" class="footer__link">채용</a>
          </div>
          <div class="footer__col">
            <div class="footer__col-title">지원</div>
            <a href="#" class="footer__link">이용약관</a>
            <a href="#" class="footer__link">개인정보처리방침</a>
            <a href="#" class="footer__link">문의하기</a>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© 2026 THEKIE Inc. All rights reserved.</span>
        <span>출처: 한국전력거래소 (KPX) · EPSIS</span>
      </div>
    </footer>

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

.landing {
  font-family: "Inter", sans-serif;
  color: $text-primary;
  background: $surface;
  overflow-x: hidden;
}

// ── Navbar ──────────────────────────────────────────────────────────────────
.lnav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: background 0.2s, box-shadow 0.2s;

  &--scrolled {
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    box-shadow: 0 1px 0 $border;
  }

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    height: 64px;
    display: flex;
    align-items: center;
    gap: 32px;
  }

  &__logo {
    height: 20px;
    width: auto;
    color: #fff;
    flex-shrink: 0;
    transition: color 0.2s;
  }

  &--scrolled &__logo {
    color: #000F6C;
  }

  &__links {
    display: flex;
    gap: 4px;
    flex: 1;
  }

  &__link {
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
    text-decoration: none;
    border-radius: 6px;
    transition: color 0.2s, background 0.2s;

    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &--scrolled &__link {
    color: $text-secondary;
    &:hover {
      color: $text-primary;
      background: $bg;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__btn {
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;

    &--ghost {
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.35);
      color: #fff;
      transition: all 0.2s;
      &:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
    }

    .lnav--scrolled &--ghost {
      border-color: $border;
      color: $text-secondary;
      &:hover { background: $bg; color: $text-primary; }
    }

    &--primary {
      background: $accent;
      border: 1px solid $accent;
      color: #fff;
      &:hover { background: $accent-dark; }
      &:active { transform: scale(0.97); }
    }
  }

  // ── Authenticated user menu ──
  &__user {
    position: relative;
  }

  &__user-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 50px;
    padding: 4px 10px 4px 4px;
    cursor: pointer;
    transition: all 0.2s;
    color: rgba(255, 255, 255, 0.8);

    &:hover { background: rgba(255, 255, 255, 0.14); }
  }

  &--scrolled &__user-btn {
    background: $bg;
    border-color: $border;
    color: $text-secondary;
    &:hover { background: #eef0f4; }
  }

  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: $accent;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 220px;
    background: $surface;
    border: 1px solid $border;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 200;
  }

  &__dropdown-header {
    padding: 14px 16px 10px;
  }

  &__dropdown-name {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: $text-primary;
  }

  &__dropdown-email {
    display: block;
    font-size: 11px;
    color: $text-muted;
    margin-top: 2px;
  }

  &__dropdown-divider {
    height: 1px;
    background: $border;
    margin: 0;
  }

  &__dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    font-family: "Inter", sans-serif;
    color: $text-secondary;
    background: none;
    border: none;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
    text-align: left;

    &:hover { background: $bg; color: $text-primary; }

    &--danger {
      color: #dc2626;
      &:hover { background: #fef2f2; color: #dc2626; }
    }
  }
}

// ── Dropdown transition ──
.lnav-menu-enter-active,
.lnav-menu-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.lnav-menu-enter-from,
.lnav-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

// ── Hero (full-width banner) ─────────────────────────────────────────────────
.hero {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: 0;
  // ━━━ PLACEHOLDER: replace with real solar panel image ━━━
  // To use a real image, change the line below to:
  // background: url('/images/hero-solar.jpg') center center / cover no-repeat;
  background:
    linear-gradient(135deg, #020617 0%, #0c1229 30%, #0a1628 50%, #060d1f 70%, #020617 100%);
  // Solar cell grid pattern overlay (simulates panel texture)
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(79,106,245,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(79,106,245,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 70% at 60% 40%, black 0%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 80% 70% at 60% 40%, black 0%, transparent 100%);
  }
  // Subtle light reflection (top-right glow like the solar panel photo)
  &::after {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    top: -120px;
    right: 10%;
    background: radial-gradient(circle, rgba(180,210,255,0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
}

.hero__overlay {
  position: absolute;
  inset: 0;
  // Bottom fade for smooth transition into stats section
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 60%,
    rgba(2, 6, 23, 0.6) 85%,
    rgba(2, 6, 23, 0.95) 100%
  );
  pointer-events: none;
  z-index: 1;
}

.hero__content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  padding: 140px 24px 0;
  will-change: transform, opacity;
  transform-origin: center top;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(79,106,245,0.15);
  border: 1px solid rgba(79,106,245,0.3);
  color: #93b4ff;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  margin-bottom: 24px;
  letter-spacing: 0.02em;
}

.hero__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
    50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
  }
}

.hero__title {
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 800;
  color: #fff;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin: 0 0 20px;
}

.hero__title-accent {
  background: linear-gradient(135deg, #818cf8, #4F6AF5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__desc {
  font-size: 16px;
  line-height: 1.7;
  color: rgba(255,255,255,0.6);
  margin: 0 0 32px;

  @media (max-width: 600px) {
    font-size: 14px;
  }
}

.hero__br {
  @media (max-width: 600px) { display: none; }
}

.hero__cta-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.hero__cta-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: $accent;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  box-shadow: 0 4px 24px rgba(79,106,245,0.4);

  &:hover { background: $accent-dark; box-shadow: 0 6px 32px rgba(79,106,245,0.5); }
  &:active { transform: scale(0.97); }
}

.hero__cta-ghost {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 24px;
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.85);
  font-size: 15px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: rgba(255,255,255,0.12); }
}

.hero__trust {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  flex-wrap: wrap;
  justify-content: center;
}

.hero__trust-sep { opacity: 0.3; }

// ── Hero mockup wrap ──────────────────────────────────────────────────────
.hero__mockup-wrap {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 760px;
  padding: 48px 24px 80px;
  will-change: transform, opacity;
  transform-origin: center top;
}

.hero__preview {
  background: rgba(13, 15, 43, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,106,245,0.2);
}

.hero__preview-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.hero__preview-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);

  &:nth-child(1) { background: #ef4444; }
  &:nth-child(2) { background: #f59e0b; }
  &:nth-child(3) { background: #22c55e; }
}

.hero__preview-url {
  flex: 1;
  text-align: center;
  font-size: 11px;
  color: rgba(255,255,255,0.25);
  font-family: "Space Mono", monospace;
  margin-left: -34px;
}

.hero__preview-content {
  padding: 16px;
}

// Mock market bar
.mock-market-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #06082a;
  border-radius: 8px;
  padding: 7px 12px;
  margin-bottom: 12px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  flex-wrap: wrap;
}

.mock-badge {
  font-size: 8px;
  font-weight: 800;
  padding: 2px 5px;
  border-radius: 3px;
  letter-spacing: 0.04em;

  &--blue   { background: rgba(79,106,245,0.25); color: #93b4ff; }
  &--amber  { background: rgba(245,158,11,0.2);  color: #fcd34d; }
  &--green  { background: rgba(34,197,94,0.2);   color: #86efac; }
}

.mock-val   { color: #fff; font-weight: 700; font-size: 11px; }
.mock-up    { color: #4ade80; font-size: 10px; font-weight: 600; }
.mock-dn    { color: #f87171; font-size: 10px; font-weight: 600; }
.mock-sep   { width: 1px; height: 12px; background: rgba(255,255,255,0.1); }

// Mock stat cards
.mock-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.mock-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  padding: 10px;

  &__label {
    font-size: 9px;
    color: rgba(255,255,255,0.4);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__val {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
    margin-bottom: 3px;
  }

  &__badge {
    font-size: 9px;
    font-weight: 600;
    color: #4ade80;
  }
}

// Mock chart
.mock-chart {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}

// Mock tx feed
.mock-feed {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  overflow: hidden;

  &__head {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    font-size: 10px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
  }
}

.mock-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 1.8s infinite;
}

.mock-tx {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 10px;

  &:last-child { border-bottom: none; }

  &__badge {
    font-size: 8px;
    font-weight: 800;
    padding: 2px 5px;
    border-radius: 3px;
    flex-shrink: 0;

    &--amber  { background: #fef3c7; color: #92400e; }
    &--blue   { background: #dbeafe; color: #1d4ed8; }
    &--violet { background: #ede9fe; color: #5b21b6; }
  }

  &__hash {
    flex: 1;
    font-family: "Space Mono", monospace;
    color: rgba(255,255,255,0.3);
    font-size: 9px;
  }

  &__val {
    font-weight: 700;
    color: rgba(255,255,255,0.7);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
}

// ── Stats ─────────────────────────────────────────────────────────────────
.stats {
  background: $bg;
  border-top: 1px solid $border;
  border-bottom: 1px solid $border;
  padding: 40px 24px;

  &__inner {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 20px;
    flex-wrap: wrap;
  }

  &__item {
    text-align: center;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.5s ease, transform 0.5s ease;

    &--visible {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &__num {
    font-size: clamp(24px, 3vw, 32px);
    font-weight: 800;
    color: $accent;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
    margin-bottom: 4px;
  }

  &__label {
    font-size: 12px;
    color: $text-muted;
    font-weight: 500;
  }

  &__divider {
    width: 1px;
    height: 48px;
    background: $border;
    flex-shrink: 0;

    @media (max-width: 600px) { display: none; }
  }
}

// ── Section commons ──────────────────────────────────────────────────────────
.section-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px;
}

.section-head {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 56px;
}

.section-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: $accent;
  background: rgba(79,106,245,0.08);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.section-title {
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: $text-primary;
  margin: 0 0 12px;
  line-height: 1.2;
}

.section-desc {
  font-size: 15px;
  color: $text-secondary;
  line-height: 1.6;
  margin: 0;
}

// ── Value Chain ──────────────────────────────────────────────────────────────
.vchain { background: $surface; }

.vchain__title {
  text-align: center;
}

.vchain__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 1000px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
}

.vchain-card {
  background: $bg;
  border: 1px solid $border;
  border-radius: 16px;
  padding: 24px;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;

  &:hover {
    border-color: rgba(79,106,245,0.3);
    box-shadow: 0 8px 32px rgba(79,106,245,0.07);
    transform: translateY(-2px);
  }

  &__num {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    font-family: "Space Mono", monospace;
    margin-bottom: 14px;
  }

  &__title {
    font-size: 13px;
    font-weight: 800;
    color: $accent;
    letter-spacing: 0.06em;
    margin: 0 0 4px;
    font-family: "Space Mono", monospace;
  }

  &__subtitle {
    font-size: 15px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 8px;
  }

  &__desc {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.6;
    margin: 0;
  }
}

// ── Blockchain (hero-level) ─────────────────────────────────────────────────
.blockchain {
  background: #06082a;
  position: relative;
  overflow: hidden;

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 96px 24px;
    position: relative;
  }

  &__glow {
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: rgba(79,106,245,0.1);
    filter: blur(120px);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  &__tag {
    background: rgba(79,106,245,0.2);
    color: #93b4ff;
  }

  &__title {
    color: #fff;
  }

  &__desc {
    color: rgba(255,255,255,0.55);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    position: relative;

    @media (max-width: 700px) {
      grid-template-columns: 1fr;
    }
  }

  &__card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 32px 24px;
    text-align: center;
    backdrop-filter: blur(8px);
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;

    &:hover {
      border-color: rgba(79,106,245,0.4);
      box-shadow: 0 8px 32px rgba(79,106,245,0.15);
      transform: translateY(-2px);
    }
  }

  &__card-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: rgba(79,106,245,0.15);
    color: #93b4ff;
    margin-bottom: 20px;
  }

  &__card-title {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 10px;
    font-family: "Space Mono", monospace;
    letter-spacing: 0.02em;
  }

  &__card-desc {
    font-size: 13px;
    line-height: 1.7;
    color: rgba(255,255,255,0.5);
    margin: 0;
  }
}

// ── Technology Infrastructure ────────────────────────────────────────────────
.tech-infra {
  padding: 80px 0;
  background: $bg;
}

.tech-infra__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 48px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
}

.tech-infra__item {
  background: $surface;
  border: 1px solid $border;
  border-radius: 16px;
  padding: 36px 28px;
  text-align: center;
  transition: box-shadow 0.2s, transform 0.2s;

  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.tech-infra__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  margin-bottom: 20px;
}

.tech-infra__title {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 8px;
}

.tech-infra__en {
  font-size: 13px;
  font-weight: 500;
  color: $text-muted;
  margin-left: 4px;
}

.tech-infra__desc {
  font-size: 14px;
  line-height: 1.7;
  color: $text-secondary;
  margin: 0;
}

// ── How it works ─────────────────────────────────────────────────────────────
.how { background: $bg; }

.how__steps {
  display: flex;
  align-items: flex-start;
  gap: 0;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;
}

.how-step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
  min-width: 200px;
  max-width: 280px;
  position: relative;

  &__num {
    font-size: 11px;
    font-weight: 800;
    font-family: "Space Mono", monospace;
    color: $accent;
    background: rgba(79,106,245,0.1);
    border: 1px solid rgba(79,106,245,0.2);
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__body {}

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: $text-primary;
    margin: 0 0 6px;
    padding-top: 8px;
  }

  &__desc {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.6;
    margin: 0;
  }

  &__arrow {
    position: absolute;
    right: -28px;
    top: 8px;
    color: $text-muted;

    @media (max-width: 700px) { display: none; }
  }
}

// ── Pricing ──────────────────────────────────────────────────────────────────
.pricing { background: $surface; }

.pricing__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: start;

  @media (max-width: 800px) { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
}

.plan-card {
  background: $bg;
  border: 1px solid $border;
  border-radius: 16px;
  padding: 28px;
  position: relative;

  &--accent {
    background: $accent;
    border-color: $accent;
    color: #fff;
    box-shadow: 0 16px 48px rgba(79,106,245,0.35);
    transform: scale(1.02);
  }

  &__badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: #f59e0b;
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    padding: 3px 12px;
    border-radius: 20px;
    white-space: nowrap;
    letter-spacing: 0.04em;
  }

  &__name {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: $text-muted;
    margin-bottom: 8px;

    .plan-card--accent & { color: rgba(255,255,255,0.7); }
  }

  &__price {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: $text-primary;
    margin-bottom: 4px;
    font-variant-numeric: tabular-nums;

    .plan-card--accent & { color: #fff; }
  }

  &__period {
    font-size: 14px;
    font-weight: 400;
    color: $text-muted;
    letter-spacing: 0;

    .plan-card--accent & { color: rgba(255,255,255,0.6); }
  }

  &__desc {
    font-size: 12px;
    color: $text-muted;
    margin-bottom: 20px;

    .plan-card--accent & { color: rgba(255,255,255,0.6); }
  }

  &__list {
    list-style: none;
    margin: 0 0 24px;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;

    li {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: $text-secondary;

      svg { flex-shrink: 0; color: $accent; }

      .plan-card--accent & {
        color: rgba(255,255,255,0.85);
        svg { color: rgba(255,255,255,0.7); }
      }
    }
  }

  &__cta {
    display: block;
    width: 100%;
    padding: 11px 16px;
    font-size: 13px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid $border;
    background: $surface;
    color: $text-primary;

    &:hover { background: $bg; }

    &--accent {
      background: #fff;
      border-color: #fff;
      color: $accent;
      &:hover { background: rgba(255,255,255,0.9); }
    }
  }
}

// ── CTA Banner ───────────────────────────────────────────────────────────────
// ── Carbon Impact ────────────────────────────────────────────────────────────
.carbon {
  padding: 80px 0;
  background: $surface;
}

.carbon__grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-top: 48px;
  background: $bg;
  border: 1px solid $border;
  border-radius: 16px;
  padding: 40px 24px;

  @media (max-width: 700px) {
    flex-direction: column;
    gap: 32px;
  }
}

.carbon__item {
  flex: 1;
  text-align: center;
}

.carbon__divider {
  width: 1px;
  height: 48px;
  background: $border;
  flex-shrink: 0;

  @media (max-width: 700px) {
    width: 60px;
    height: 1px;
  }
}

.carbon__num {
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 800;
  color: #22c55e;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}

.carbon__label {
  font-size: 13px;
  font-weight: 500;
  color: $text-muted;
}

// ── CTA Banner ──────────────────────────────────────────────────────────────
.cta-banner {
  background: #06082a;
  padding: 0;

  &__inner {
    max-width: 720px;
    margin: 0 auto;
    padding: 80px 24px;
    text-align: center;
    position: relative;
  }

  &__glow {
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: rgba(79,106,245,0.12);
    filter: blur(100px);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  &__title {
    font-size: clamp(22px, 3vw, 32px);
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.03em;
    margin: 0 0 12px;
    position: relative;
  }

  &__desc {
    font-size: 14px;
    color: rgba(255,255,255,0.45);
    margin: 0 0 32px;
    position: relative;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    padding: 14px 36px;
    background: $accent;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
    box-shadow: 0 4px 24px rgba(79,106,245,0.4);
    position: relative;

    &:hover { background: $accent-dark; box-shadow: 0 6px 32px rgba(79,106,245,0.5); }
    &:active { transform: scale(0.97); }
  }
}

// ── Switch CTA ──────────────────────────────────────────────────────────────
.switch-cta {
  background: linear-gradient(135deg, #f0f4ff 0%, #fdf4ff 100%);
  border-top: 1px solid #e0e7ff;
  border-bottom: 1px solid #e0e7ff;

  &__inner {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    @media (max-width: 600px) { flex-direction: column; text-align: center; }
  }

  &__icon {
    width: 48px; height: 48px;
    border-radius: 12px;
    background: $accent;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__body { flex: 1; }

  &__title {
    font-size: 16px;
    font-weight: 800;
    color: $text-primary;
    margin: 0 0 4px;
  }

  &__desc {
    font-size: 13px;
    color: $text-secondary;
    margin: 0;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    background: $accent;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, box-shadow 0.15s;
    box-shadow: 0 2px 12px rgba(79,106,245,0.25);

    &:hover { background: $accent-dark; box-shadow: 0 4px 20px rgba(79,106,245,0.35); }
    &:active { transform: scale(0.98); }
  }
}

// ── Footer ───────────────────────────────────────────────────────────────────
.footer {
  background: $bg;
  border-top: 1px solid $border;

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 48px 24px 32px;
    display: flex;
    gap: 64px;

    @media (max-width: 700px) { flex-direction: column; gap: 32px; }
  }

  &__brand {
    flex-shrink: 0;
  }

  &__logo {
    height: 16px;
    width: auto;
    color: #000F6C;
    display: block;
    margin-bottom: 8px;
  }

  &__tagline {
    font-size: 12px;
    color: $text-muted;
    margin: 0;
  }

  &__links {
    flex: 1;
    display: flex;
    gap: 48px;
    flex-wrap: wrap;
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__col-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: $text-primary;
    margin-bottom: 4px;
  }

  &__link {
    font-size: 13px;
    color: $text-muted;
    text-decoration: none;
    transition: color 0.15s;
    &:hover { color: $text-primary; }
  }

  &__bottom {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 24px;
    border-top: 1px solid $border;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11.5px;
    color: $text-muted;
    gap: 12px;
    flex-wrap: wrap;
  }
}
</style>
