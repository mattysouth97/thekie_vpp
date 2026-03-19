<script setup lang="ts">
// 1. Libraries
import { ref, computed, onMounted, onUnmounted } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketStore } from "@/stores/market-store";
import { IcoClose, IcoBell, IcoChevronDown, IcoLink, IcoUsers, IcoLogout, IcoBlockchain, IcoArrowRight, IcoCheck, IcoLock, IcoWeatherClear, IcoWeatherPartly, IcoWeatherWind, IcoWeatherRain, IcoWeatherCloud, IcoLightning, IcoHome, IcoWallet, IcoGlobe, IcoDocument, IcoMeter, IcoChartUp, IcoInfo, IcoStar, IcoSettings, IcoPlug, IcoSolar } from "@/components/icons";
import TkIcon from "@/components/TkIcon.vue";
import LuciaWallet from "@/components/wallet/LuciaWallet.vue";
import FloatingChatbot from "@/components/platform/FloatingChatbot.vue";
import type { StakeholderRole } from "@/types/auth";
import { ROLE_LABELS } from "@/types/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const marketStore = useMarketStore();

// ── Role-based navigation tabs ──
interface NavTab {
  label: string;
  to: string;
  activeNames: string[];  // route names that mark this tab active
  icon: string;
}

const ROLE_NAV: Record<string, NavTab[]> = {
  investor_individual: [
    { label: "대시보드", to: "/dashboard", activeNames: ["home"], icon: "home" },
    { label: "마켓플레이스", to: "/marketplace", activeNames: ["marketplaceProjects", "marketplaceProjectDetail", "marketplace"], icon: "document" },
    { label: "포트폴리오", to: "/dashboard/portfolio", activeNames: ["portfolio"], icon: "chart" },
    { label: "전력현황", to: "/dashboard/power-status", activeNames: ["powerStatus"], icon: "lightning" },
    { label: "설비관리", to: "/facilities", activeNames: ["facilityList", "equipmentRegister"], icon: "meter" },
  ],
  investor_corporate: [
    { label: "대시보드", to: "/dashboard", activeNames: ["home"], icon: "home" },
    { label: "마켓플레이스", to: "/marketplace", activeNames: ["marketplaceProjects", "marketplaceProjectDetail", "marketplace"], icon: "document" },
    { label: "포트폴리오", to: "/dashboard/portfolio", activeNames: ["portfolio"], icon: "chart" },
    { label: "전력현황", to: "/dashboard/power-status", activeNames: ["powerStatus"], icon: "lightning" },
    { label: "설비관리", to: "/facilities", activeNames: ["facilityList", "equipmentRegister"], icon: "meter" },
  ],
  project_developer: [
    { label: "대시보드", to: "/developer", activeNames: ["developerDashboard"], icon: "home" },
    { label: "내 프로젝트", to: "/developer/projects", activeNames: ["developerProjects", "projectWizard", "projectManagement"], icon: "solar" },
    { label: "마켓플레이스", to: "/marketplace", activeNames: ["marketplaceProjects", "marketplaceProjectDetail", "marketplace"], icon: "document" },
    { label: "부지검색", to: "/developer/land-search", activeNames: ["landSearch"], icon: "globe" },
    { label: "설비등록", to: "/facilities/register", activeNames: ["equipmentRegister"], icon: "plug" },
  ],
  government_authority: [
    { label: "대시보드", to: "/authority", activeNames: ["authorityDashboard"], icon: "home" },
    { label: "프로젝트 감독", to: "/authority/projects", activeNames: ["projectOversight"], icon: "document" },
    { label: "블록체인 검증", to: "/authority/blockchain", activeNames: ["blockchainExplorer"], icon: "blockchain" },
    { label: "공유지 현황", to: "/authority/land-use", activeNames: ["landUseReport"], icon: "globe" },
    { label: "보고서", to: "/authority/reports", activeNames: ["reportGenerator"], icon: "settings" },
  ],
};

// Fallback for unauthenticated or unknown roles
const DEFAULT_NAV: NavTab[] = [
  { label: "홈", to: "/dashboard", activeNames: ["home"], icon: "home" },
  { label: "마켓플레이스", to: "/marketplace", activeNames: ["marketplaceProjects", "marketplaceProjectDetail", "marketplace"], icon: "document" },
  { label: "전력현황", to: "/dashboard/power-status", activeNames: ["powerStatus"], icon: "lightning" },
  { label: "설비관리", to: "/facilities", activeNames: ["facilityList"], icon: "meter" },
  { label: "설비등록", to: "/facilities/register", activeNames: ["equipmentRegister"], icon: "plug" },
];

const navTabs = computed<NavTab[]>(() => {
  if (!authStore.isAuthenticated) return DEFAULT_NAV;
  return ROLE_NAV[authStore.primaryRole] ?? DEFAULT_NAV;
});

function isTabActive(tab: NavTab): boolean {
  return tab.activeNames.includes(route.name as string);
}

const plantTab = ref<'status' | 'weather'>('status');
const rightPanelOpen = ref(false);
const rightPanelCollapsed = ref<boolean>(
  localStorage.getItem('vpp-right-collapsed') === 'true'
);
const rightPanelSecondaryTab = ref(false);

function toggleRightCollapse(): void {
  rightPanelCollapsed.value = !rightPanelCollapsed.value;
  localStorage.setItem('vpp-right-collapsed', String(rightPanelCollapsed.value));
}
const showNotifications = ref(false);

interface NotifItem {
  id: number;
  type: 'settlement' | 'alert' | 'market' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const notifications = ref<NotifItem[]>([
  { id: 1, type: 'settlement', title: '1월 정산 완료', message: '용인 푸르지오 발전소 정산금 ₩20,932이 입금되었습니다.', time: '10분 전', read: false },
  { id: 2, type: 'alert', title: '설비 경고', message: '영덕 바람언덕 블레이드 #2 결빙 감지 — 자동 제빙 가동 중', time: '1시간 전', read: false },
  { id: 3, type: 'market', title: 'SMP 가격 변동', message: '육지 SMP가 전일 대비 ▲3.2원 상승하여 120.5원/kWh입니다.', time: '2시간 전', read: false },
  { id: 4, type: 'market', title: 'REC 거래 체결', message: 'REC 현물 10건 체결 — 평균 단가 ₩42,500/REC', time: '3시간 전', read: true },
  { id: 5, type: 'system', title: '플랫폼 업데이트', message: 'v2.4.0 업데이트: 실시간 모니터링 대시보드 개선', time: '어제', read: true },
  { id: 6, type: 'alert', title: '사업 참여 마감 임박', message: '전북 군산 해상풍력 참여 마감까지 D-3', time: '어제', read: true },
]);

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

function markAllRead() {
  notifications.value.forEach(n => { n.read = true; });
}

const showUserMenu = ref(false);
const showLinkModal = ref(false);
const showMemberList = ref(false);
const showWalletModal = ref(false);
const showChatbot = ref(false);
const linkBusinessNumber = ref("");
const linkError = ref("");
const linkSuccess = ref("");
const linkLoading = ref(false);

function handleLogout() {
  authStore.logout();
  router.push("/login");
}

async function handleLinkCompany() {
  linkError.value = "";
  linkSuccess.value = "";

  if (!linkBusinessNumber.value.trim()) {
    linkError.value = "사업자등록번호를 입력해 주세요.";
    return;
  }

  linkLoading.value = true;
  const result = await authStore.linkToCompany(linkBusinessNumber.value.trim());
  linkLoading.value = false;

  if (result.success) {
    linkSuccess.value = `${authStore.linkedCompany?.name}에 연결되었습니다.`;
    setTimeout(() => {
      showLinkModal.value = false;
      linkBusinessNumber.value = "";
      linkSuccess.value = "";
    }, 1500);
  } else {
    linkError.value = result.message ?? "연결에 실패했습니다.";
  }
}

function openMemberList() {
  authStore.loadLinkedMembers();
  showMemberList.value = true;
  showUserMenu.value = false;
}

function closeLinkModal() {
  showLinkModal.value = false;
  linkBusinessNumber.value = "";
  linkError.value = "";
  linkSuccess.value = "";
}

// 마운트 시 시장 데이터 폴링 시작
onMounted(() => {
  marketStore.startPolling();
});
onUnmounted(() => {
  marketStore.stopPolling();
});

const weatherData = [
  { name: "용인 푸르지오",  icon: "weather-partly", condition: "구름 조금", temp: 8,  irradiance: 4.2, cloud: 25, rain: 0,   wind: 2.1 },
  { name: "음성 솔라파크",  icon: "weather-clear",  condition: "맑음",     temp: 7,  irradiance: 5.8, cloud: 8,  rain: 0,   wind: 1.8 },
  { name: "영덕 바람언덕",  icon: "weather-wind",   condition: "강풍",     temp: 5,  irradiance: 2.1, cloud: 60, rain: 0,   wind: 9.4 },
  { name: "화성 수소연료",  icon: "weather-partly",  condition: "흐림",     temp: 9,  irradiance: 1.4, cloud: 78, rain: 0.2, wind: 3.2 },
  { name: "합천댐 수상",    icon: "weather-rain",   condition: "비",       temp: 10, irradiance: 0.6, cloud: 92, rain: 8.4, wind: 4.1 },
];

const currentTime = computed(() => {
  const now = new Date();
  return now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
});

// Hide right panel if meta says so, or if on public pages without login
const showRightPanel = computed(() => {
  if (route.meta.hideRightPanel) return false;
  const publicPages = ['projectList', 'projectDetail', 'marketplaceProjects', 'marketplaceProjectDetail', 'marketplace'];
  if (publicPages.includes(route.name as string) && !authStore.isAuthenticated) return false;
  return true;
});

// ── AI Chatbot (mock) ──
interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}
const chatInput = ref("");
const chatMessages = ref<ChatMessage[]>([]);
const chatLoading = ref(false);

const faqQuestions = [
  { q: "이 수익률 안전한가요?", a: "재생에너지 투자 수익률은 PPA 장기 계약과 REC 판매 수익에 기반합니다. 정부 보조금과 20년 장기 계약이 수익을 뒷받침하므로, 일반 주식 대비 변동성이 낮은 편입니다. 다만 기상 조건과 정책 변화 리스크는 존재합니다." },
  { q: "REC 가중치란?", a: "REC(신재생에너지 인증서) 가중치는 발전 방식에 따라 차등 적용되는 배수입니다. 예: 일반 태양광 1.0, 수상태양광 1.5, 해상풍력 2.0. 가중치가 높을수록 동일 발전량 대비 더 많은 REC를 받을 수 있어 수익이 증가합니다." },
  { q: "초보자 추천 상품은?", a: "처음 투자하시는 분께는 태양광 기반 SMP+REC 현물형 상품을 추천드립니다. 발전 구조가 단순하고, 일사량 예측이 비교적 정확하여 수익 안정성이 높습니다. 최소 투자금 ₩10,000부터 시작할 수 있는 '충남 당진 태양광 1호'를 확인해 보세요." },
];

function sendFaq(q: string, a: string) {
  chatMessages.value.push({ role: "user", text: q });
  chatLoading.value = true;
  setTimeout(() => {
    chatMessages.value.push({ role: "assistant", text: a });
    chatLoading.value = false;
  }, 800);
}

function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatMessages.value.push({ role: "user", text });
  chatInput.value = "";
  chatLoading.value = true;
  setTimeout(() => {
    chatMessages.value.push({ role: "assistant", text: "좋은 질문이에요! 현재 AI 어시스턴트는 시범 운영 중입니다. 보다 정확한 답변을 위해 고객센터(1588-0000)로 문의해 주시거나, 위의 자주 묻는 질문 버튼을 이용해 주세요." });
    chatLoading.value = false;
  }, 1000);
}

// ── Investment guide accordion ──
const guideOpen = ref<number | null>(null);
const investGuides = [
  { title: "SMP+REC 현물형이란?", body: "SMP(계통한계가격)로 전력을 판매하고, REC(신재생에너지 인증서)를 추가로 판매하여 이중 수익을 얻는 구조입니다. 가장 보편적인 재생에너지 수익 모델입니다." },
  { title: "태양광 vs 풍력 투자 비교", body: "태양광은 일사량 예측이 쉽고 유지보수 비용이 낮습니다. 풍력은 24시간 발전이 가능하고 REC 가중치(1.2)가 높아 수익 잠재력이 큽니다. 리스크 선호도에 따라 선택하세요." },
  { title: "모듈 구조별 리스크 분석", body: "전력 구조(자가소비/잉여전력/전량판매)에 따라 수익 안정성이 달라집니다. 자가소비형은 변동성이 낮고, 전량판매형은 SMP 시세에 따라 수익이 변동됩니다." },
];

function toggleGuide(index: number) {
  guideOpen.value = guideOpen.value === index ? null : index;
}

// ── Blockchain Live Feed ──
interface TxRecord {
  id: number;
  type: string;
  typeColor: string;
  from: string;
  to: string;
  amount: string;
  hash: string;
  block: number;
  ts: number;
}

const TX_TYPES = [
  { type: "REC 거래", color: "#16a34a" },
  { type: "SMP 정산", color: "#2563eb" },
  { type: "PPA 정산", color: "#7c3aed" },
  { type: "DR 보상", color: "#d97706" },
  { type: "탄소크레딧", color: "#0891b2" },
];

const WALLETS = [
  "THEKIE Fund", "KEA Grid", "한전 KPS", "KEPCO", "K-water",
  "RE100 Corp", "에너지밸리", "솔라파크 SPC", "그린윈드 LP", "수소에너지",
];

function randWallet(): string {
  return WALLETS[Math.floor(Math.random() * WALLETS.length)];
}

function randHash(): string {
  const chars = "0123456789abcdef";
  let h = "0x";
  for (let i = 0; i < 8; i++) h += chars[Math.floor(Math.random() * 16)];
  return h + "...";
}

function nowTs(): number {
  return Date.now();
}

const blockNum = ref(18_429_301);
const txFeed = ref<TxRecord[]>([]);
let txIdCounter = 0;
let feedInterval: ReturnType<typeof setInterval> | null = null;
const showBlockchain = ref(true);

function addTx() {
  const txType = TX_TYPES[Math.floor(Math.random() * TX_TYPES.length)];
  const amounts = ["₩12,500", "₩48,200", "₩153,000", "₩7,800", "₩320,000", "₩23,900", "₩85,400"];
  txFeed.value.unshift({
    id: txIdCounter++,
    type: txType.type,
    typeColor: txType.color,
    from: randWallet(),
    to: randWallet(),
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    hash: randHash(),
    block: blockNum.value,
    ts: nowTs(),
  });
  if (txFeed.value.length > 8) txFeed.value.pop();
  if (Math.random() > 0.5) blockNum.value++;
}

function startFeed() {
  if (feedInterval) return;
  addTx();
  feedInterval = setInterval(addTx, 3000 + Math.random() * 2000);
}

function stopFeed() {
  if (feedInterval) { clearInterval(feedInterval); feedInterval = null; }
}

function toggleBlockchain() {
  showBlockchain.value = !showBlockchain.value;
  if (showBlockchain.value) startFeed();
  else stopFeed();
}

onMounted(() => {
  if (showBlockchain.value) startFeed();
});
onUnmounted(() => {
  stopFeed();
});

// ── Authority: 지역에너지 자립률 & newsboard ──
const newsBoardTab = ref<'notice' | 'inquiry'>('notice');

const authorityRegions = [
  { name: "제주특별자치도", rate: 89.4 },
  { name: "전라남도",      rate: 67.8 },
  { name: "강원도",        rate: 42.1 },
  { name: "경기도",        rate: 28.5 },
  { name: "서울특별시",    rate: 12.3 },
];

interface NoticeItem {
  id: number;
  type: '공지' | '청문' | '입법예고';
  title: string;
  date: string;
  isNew: boolean;
}

interface InquiryItem {
  id: number;
  title: string;
  author: string;
  date: string;
  status: '답변대기' | '답변완료';
}

const noticeItems = ref<NoticeItem[]>([
  { id: 1, type: '공지',    title: '2026년도 지역에너지 계획 수립 공청회 개최 안내', date: '03.18', isNew: true },
  { id: 2, type: '청문',    title: '영덕 해상풍력단지 환경영향평가 주민설명회',       date: '03.15', isNew: true },
  { id: 3, type: '공지',    title: '소규모 태양광 설치 보조금 신청 접수 안내',       date: '03.10', isNew: false },
  { id: 4, type: '입법예고', title: '재생에너지 주민이익공유제 시행령 개정안 예고',   date: '03.05', isNew: false },
  { id: 5, type: '공지',    title: '2월 지역에너지 통계 월간 보고서 발간',           date: '02.28', isNew: false },
]);

const inquiryItems = ref<InquiryItem[]>([
  { id: 1, title: '우리 마을 태양광 발전소 소음 관련 문의',          author: '홍길동',   date: '03.18', status: '답변대기' },
  { id: 2, title: '농업용 창고 옥상 태양광 설치 허가 절차',         author: '김영희',   date: '03.17', status: '답변완료' },
  { id: 3, title: '풍력발전 인근 부동산 가치 하락 보상 방법',        author: '이철수',   date: '03.14', status: '답변완료' },
  { id: 4, title: 'RE100 이행수단으로 지역 PPA 계약 가능 여부',      author: 'GS에너지', date: '03.12', status: '답변대기' },
  { id: 5, title: '공유지 태양광 임대 수익 배분 기준 문의',          author: '용인시 의회', date: '03.08', status: '답변완료' },
]);

const pendingInquiries = computed(() => inquiryItems.value.filter(i => i.status === '답변대기').length);
</script>

<template>
  <div class="vpp-layout">

    <!-- ── Top Header ── -->
    <header class="vpp-header">
      <!-- Logo / brand -->
      <div class="vpp-header__brand">
        <svg class="vpp-header__brand-svg" width="363" height="49" viewBox="0 0 363 49" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="THEKIE">
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
      </div>

      <!-- Nav tabs (role-dynamic) -->
      <nav class="vpp-header__tabs">
        <router-link
          v-for="tab in navTabs"
          :key="tab.to"
          :to="tab.to"
          class="vpp-header__tab"
          :class="{ 'vpp-header__tab--active': isTabActive(tab) }"
        >{{ tab.label }}</router-link>
      </nav>

      <!-- Search (right side) -->
      <!-- Actions -->
      <div class="vpp-header__actions">
        <span class="vpp-header__time">{{ currentTime }}</span>

        <!-- View mode toggle (personal / company) -->
        <div v-if="authStore.canToggleView" class="vpp-header__view-toggle">
          <button type="button" :class="['vpp-header__vt-btn', { 'vpp-header__vt-btn--active': authStore.viewMode === 'personal' }]" @click="authStore.viewMode = 'personal'">내 투자</button>
          <button type="button" :class="['vpp-header__vt-btn', { 'vpp-header__vt-btn--active': authStore.viewMode === 'company' }]" @click="authStore.viewMode = 'company'">{{ authStore.linkedCompany?.name || '법인' }}</button>
        </div>

        <button type="button" class="vpp-header__ai-btn" aria-label="AI 어시스턴트" @click="showChatbot = !showChatbot">
          <IcoLightning :size="14" :strokeWidth="2" />
          <span class="vpp-header__ai-label">AI</span>
        </button>

        <button type="button" class="vpp-header__wallet-btn" aria-label="Lucia Wallet" @click="showWalletModal = !showWalletModal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="8" r="5" fill="#FF6B6B" opacity="0.85"/>
            <circle cx="16" cy="8" r="5" fill="#4ECDC4" opacity="0.85"/>
            <circle cx="12" cy="15" r="5" fill="#FFE66D" opacity="0.85"/>
          </svg>
          <span class="vpp-header__wallet-label">Lucia Wallet</span>
          <span class="vpp-header__wallet-dot"></span>
        </button>

        <div class="vpp-header__notif-wrap">
          <button type="button" class="vpp-header__icon-btn vpp-header__icon-btn--badge" aria-label="알림" @click="showNotifications = !showNotifications">
            <IcoBell :size="18" :strokeWidth="2" />
            <span v-if="unreadCount > 0" class="vpp-header__badge">{{ unreadCount }}</span>
          </button>
          <div v-if="showNotifications" class="vpp-notif" @click.stop>
            <div class="vpp-notif__head">
              <span class="vpp-notif__head-title">알림</span>
              <button v-if="unreadCount > 0" type="button" class="vpp-notif__mark-read" @click="markAllRead">모두 읽음</button>
            </div>
            <div class="vpp-notif__list">
              <div
                v-for="n in notifications"
                :key="n.id"
                class="vpp-notif__item"
                :class="{ 'vpp-notif__item--unread': !n.read }"
                @click="n.read = true"
              >
                <div class="vpp-notif__icon" :class="`vpp-notif__icon--${n.type}`">
                  <IcoWallet v-if="n.type === 'settlement'" :size="14" :strokeWidth="2" />
                  <IcoLightning v-else-if="n.type === 'alert'" :size="14" :strokeWidth="2" />
                  <IcoChartUp v-else-if="n.type === 'market'" :size="14" :strokeWidth="2" />
                  <IcoSettings v-else :size="14" :strokeWidth="2" />
                </div>
                <div class="vpp-notif__body">
                  <div class="vpp-notif__title">{{ n.title }}</div>
                  <div class="vpp-notif__msg">{{ n.message }}</div>
                  <div class="vpp-notif__time">{{ n.time }}</div>
                </div>
                <span v-if="!n.read" class="vpp-notif__dot"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="vpp-header__user" @click="showUserMenu = !showUserMenu">
          <div class="vpp-header__avatar">{{ authStore.avatarInitial }}</div>
          <div class="vpp-header__user-info">
            <span class="vpp-header__user-name">{{ authStore.displayName }}</span>
            <span class="vpp-header__user-role">{{ ROLE_LABELS[authStore.primaryRole] || authStore.userRole }}</span>
          </div>
          <IcoChevronDown :size="14" :strokeWidth="2" />
          <div v-if="showUserMenu" class="vpp-header__user-menu">
            <button v-if="authStore.userType === 'individual' && !authStore.isLinkedToCompany" type="button" class="vpp-header__user-menu-item" @click.stop="showLinkModal = true; showUserMenu = false">
              <IcoLink :size="14" :strokeWidth="2" />
              법인 연결
            </button>
            <button v-if="authStore.isCompanyAdmin || authStore.isLinkedToCompany" type="button" class="vpp-header__user-menu-item" @click.stop="openMemberList">
              <IcoUsers :size="14" :strokeWidth="2" />
              멤버 목록
            </button>
            <button type="button" class="vpp-header__user-menu-item" @click.stop="handleLogout">
              <IcoLogout :size="14" :strokeWidth="2" />
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- ── 에너지 시장 인덱스 티커 (실시간) ── -->
    <div class="vpp-market-bar">
      <!-- SMP 육지 -->
      <div class="vpp-mkt__item">
        <span class="vpp-mkt__badge vpp-mkt__badge--blue">SMP</span>
        <span class="vpp-mkt__name">육지</span>
        <span class="vpp-mkt__val">{{ marketStore.smpDisplay.landAvg }}</span>
        <span class="vpp-mkt__unit">원/kWh</span>
        <span v-if="marketStore.smp" :class="['vpp-mkt__chg', marketStore.smp.landAvg >= 117 ? 'vpp-mkt__chg--up' : 'vpp-mkt__chg--down']">
          {{ marketStore.smp.landAvg >= 117 ? '▲' : '▼' }} {{ Math.abs(marketStore.smp.landAvg - 117).toFixed(2) }}
        </span>
      </div>
      <div class="vpp-mkt__sep"></div>
      <!-- SMP 제주 -->
      <div class="vpp-mkt__item">
        <span class="vpp-mkt__badge vpp-mkt__badge--violet">SMP</span>
        <span class="vpp-mkt__name">제주</span>
        <span class="vpp-mkt__val">{{ marketStore.smpDisplay.jejuAvg }}</span>
        <span class="vpp-mkt__unit">원/kWh</span>
        <span v-if="marketStore.smp" :class="['vpp-mkt__chg', marketStore.smp.jejuAvg >= 117 ? 'vpp-mkt__chg--up' : 'vpp-mkt__chg--down']">
          {{ marketStore.smp.jejuAvg >= 117 ? '▲' : '▼' }} {{ Math.abs(marketStore.smp.jejuAvg - 117).toFixed(2) }}
        </span>
      </div>
      <div class="vpp-mkt__sep"></div>
      <!-- REC -->
      <div class="vpp-mkt__item">
        <span class="vpp-mkt__badge vpp-mkt__badge--amber">REC</span>
        <span class="vpp-mkt__name">현물</span>
        <span class="vpp-mkt__val">{{ marketStore.recDisplay.avgPrice }}</span>
        <span class="vpp-mkt__unit">원/REC</span>
        <span v-if="marketStore.rec" :class="['vpp-mkt__chg', marketStore.recDisplay.changeUp ? 'vpp-mkt__chg--up' : 'vpp-mkt__chg--down']">
          {{ marketStore.recDisplay.changeUp ? '▲' : '▼' }} {{ Math.abs(marketStore.rec.change).toLocaleString('ko-KR') }}
        </span>
      </div>
      <div class="vpp-mkt__sep"></div>
      <!-- 배출권 KAU -->
      <div class="vpp-mkt__item">
        <span class="vpp-mkt__badge vpp-mkt__badge--green">KAU</span>
        <span class="vpp-mkt__name">KAU25</span>
        <span class="vpp-mkt__val">8,500</span>
        <span class="vpp-mkt__unit">원/톤CO₂</span>
        <span class="vpp-mkt__chg vpp-mkt__chg--up">▲ 200</span>
      </div>
      <div class="vpp-mkt__sep"></div>
      <!-- PPA -->
      <div class="vpp-mkt__item">
        <span class="vpp-mkt__badge vpp-mkt__badge--slate">PPA</span>
        <span class="vpp-mkt__name">계약용량</span>
        <span class="vpp-mkt__val">16,549</span>
        <span class="vpp-mkt__unit">MW</span>
        <span class="vpp-mkt__chg vpp-mkt__chg--up">▲ 1,203</span>
      </div>
      <div class="vpp-mkt__spacer"></div>
      <span class="vpp-mkt__src">출처: KPX EPSIS · 2026.02.26</span>
    </div>

    <!-- ── Body ── -->
    <div class="vpp-body">

      <!-- ── Mobile overlay backdrop ── -->
      <div v-if="showRightPanel" class="vpp-overlay" :class="{ 'vpp-overlay--open': rightPanelOpen }" @click="rightPanelOpen = false"></div>

      <!-- ── Right panel / Mobile bottom sheet (PRIMARY — user's portfolio) ── -->
      <aside v-if="showRightPanel" class="vpp-right" :class="{ 'vpp-right--open': rightPanelOpen, 'vpp-right--collapsed': rightPanelCollapsed }">

        <!-- Collapsed icon strip (desktop only) -->
        <div v-if="rightPanelCollapsed" class="vpp-right__mini">
          <IcoWallet :size="18" :strokeWidth="2" class="vpp-right__mini-icon" />
          <span class="vpp-right__mini-amount">₩890K</span>
          <span class="vpp-right__mini-dot"></span>
        </div>

        <!-- Mobile drag handle -->
        <div class="vpp-right__handle" @click="rightPanelOpen = false">
          <span class="vpp-right__handle-bar"></span>
        </div>

        <!-- Expanded content -->
        <template v-if="!rightPanelCollapsed">

          <!-- ═══ GOVERNMENT AUTHORITY PANEL ═══ -->
          <template v-if="authStore.primaryRole === 'government_authority'">

            <div class="vpp-right__title">지역 에너지 현황</div>

            <!-- 지역에너지 자립률 main card -->
            <section class="vpp-panel vpp-panel--accent">
              <div class="vpp-panel__label">지역에너지 자립률</div>
              <div class="vpp-auth-rate">
                <span class="vpp-auth-rate__val">34.7</span>
                <span class="vpp-auth-rate__unit">%</span>
                <span class="vpp-auth-rate__trend">▲ 2.3%p</span>
              </div>
              <div class="vpp-auth-rate__sub">2026년 2월 기준 · 국가목표 40%</div>
              <div class="vpp-auth-rate__progress-wrap">
                <div class="vpp-auth-rate__progress-track">
                  <div class="vpp-auth-rate__progress-fill" style="width: 86.75%"></div>
                  <div class="vpp-auth-rate__progress-target" title="목표 40%"></div>
                </div>
                <span class="vpp-auth-rate__progress-label">목표 달성률 86.8%</span>
              </div>
              <!-- Breakdown by type -->
              <div class="vpp-auth-breakdown">
                <div class="vpp-auth-breakdown__row">
                  <span class="vpp-auth-bd__dot vpp-auth-bd__dot--solar"></span>
                  <span class="vpp-auth-bd__label">태양광</span>
                  <div class="vpp-auth-bd__bar"><div class="vpp-auth-bd__fill" style="width:52.4%"></div></div>
                  <span class="vpp-auth-bd__val">18.2%</span>
                </div>
                <div class="vpp-auth-breakdown__row">
                  <span class="vpp-auth-bd__dot vpp-auth-bd__dot--wind"></span>
                  <span class="vpp-auth-bd__label">풍력</span>
                  <div class="vpp-auth-bd__bar"><div class="vpp-auth-bd__fill vpp-auth-bd__fill--wind" style="width:28.2%"></div></div>
                  <span class="vpp-auth-bd__val">9.8%</span>
                </div>
                <div class="vpp-auth-breakdown__row">
                  <span class="vpp-auth-bd__dot vpp-auth-bd__dot--ess"></span>
                  <span class="vpp-auth-bd__label">ESS</span>
                  <div class="vpp-auth-bd__bar"><div class="vpp-auth-bd__fill vpp-auth-bd__fill--ess" style="width:11.8%"></div></div>
                  <span class="vpp-auth-bd__val">4.1%</span>
                </div>
                <div class="vpp-auth-breakdown__row">
                  <span class="vpp-auth-bd__dot vpp-auth-bd__dot--other"></span>
                  <span class="vpp-auth-bd__label">기타</span>
                  <div class="vpp-auth-bd__bar"><div class="vpp-auth-bd__fill vpp-auth-bd__fill--other" style="width:7.5%"></div></div>
                  <span class="vpp-auth-bd__val">2.6%</span>
                </div>
              </div>
            </section>

            <!-- Regional comparison -->
            <section class="vpp-panel">
              <div class="vpp-panel__head">
                <IcoGlobe :size="14" :strokeWidth="2" />
                <span class="vpp-panel__label">시·도별 자립률</span>
              </div>
              <div class="vpp-auth-regions">
                <div v-for="r in authorityRegions" :key="r.name" class="vpp-auth-region">
                  <span class="vpp-auth-region__name">{{ r.name }}</span>
                  <div class="vpp-auth-region__bar">
                    <div class="vpp-auth-region__fill" :style="{ width: Math.min(r.rate, 100) + '%', background: r.rate >= 40 ? '#16a34a' : '#4F6AF5' }"></div>
                  </div>
                  <span class="vpp-auth-region__val" :class="{ 'vpp-auth-region__val--green': r.rate >= 40 }">{{ r.rate }}%</span>
                </div>
              </div>
            </section>

            <!-- Newsboard: 공지사항 / 문의사항 -->
            <section class="vpp-panel vpp-newsboard">
              <div class="vpp-newsboard__head">
                <span class="vpp-newsboard__title">소통 게시판</span>
                <span v-if="pendingInquiries > 0" class="vpp-newsboard__pending">미답변 {{ pendingInquiries }}건</span>
              </div>

              <!-- Tabs -->
              <div class="vpp-tabs">
                <button class="vpp-tab" :class="{ 'vpp-tab--active': newsBoardTab === 'notice' }" @click="newsBoardTab = 'notice'">공지사항</button>
                <button class="vpp-tab" :class="{ 'vpp-tab--active': newsBoardTab === 'inquiry' }" @click="newsBoardTab = 'inquiry'">
                  문의사항
                  <span v-if="pendingInquiries > 0" class="vpp-tab__badge">{{ pendingInquiries }}</span>
                </button>
              </div>

              <!-- 공지사항 -->
              <div v-if="newsBoardTab === 'notice'" class="vpp-newsboard__list">
                <div v-for="item in noticeItems" :key="item.id" class="vpp-newsboard__item">
                  <div class="vpp-newsboard__item-meta">
                    <span class="vpp-newsboard__type" :class="`vpp-newsboard__type--${item.type === '공지' ? 'notice' : item.type === '청문' ? 'hearing' : 'law'}`">{{ item.type }}</span>
                    <span v-if="item.isNew" class="vpp-newsboard__new">N</span>
                    <span class="vpp-newsboard__date">{{ item.date }}</span>
                  </div>
                  <div class="vpp-newsboard__item-title">{{ item.title }}</div>
                </div>
                <button class="vpp-newsboard__more-btn">전체 공지사항 보기 →</button>
              </div>

              <!-- 문의사항 -->
              <div v-else class="vpp-newsboard__list">
                <div v-for="item in inquiryItems" :key="item.id" class="vpp-newsboard__item">
                  <div class="vpp-newsboard__item-meta">
                    <span class="vpp-newsboard__status" :class="item.status === '답변완료' ? 'vpp-newsboard__status--done' : 'vpp-newsboard__status--pending'">{{ item.status }}</span>
                    <span class="vpp-newsboard__author">{{ item.author }}</span>
                    <span class="vpp-newsboard__date">{{ item.date }}</span>
                  </div>
                  <div class="vpp-newsboard__item-title">{{ item.title }}</div>
                </div>
                <button class="vpp-newsboard__more-btn">전체 문의사항 보기 →</button>
              </div>
            </section>

          </template><!-- /authority panel -->

          <!-- ═══ DEFAULT PANEL (investor / developer) ═══ -->
          <template v-else>
          <!-- Portfolio identity title -->
          <div class="vpp-right__title">나의 정산 현황</div>

          <!-- Balance card (accent) -->
          <section class="vpp-panel vpp-panel--accent">
            <div class="vpp-panel__label">에너지 통장 잔액</div>
            <div class="vpp-panel__amount">₩890,932</div>
            <div class="vpp-panel__badge vpp-panel__badge--up">+3.3%</div>
            <div class="vpp-panel__row vpp-panel__row--mt">
              <span class="vpp-panel__row-label">월 평균</span>
              <span class="vpp-panel__row-val">₩74,244</span>
            </div>
            <div class="vpp-panel__row">
              <span class="vpp-panel__row-label">총 투자금</span>
              <span class="vpp-panel__row-val">₩124,000,000</span>
            </div>
            <div class="vpp-panel__seg-wrap">
              <div class="vpp-panel__seg-label">유형별 투자비율 · 12개</div>
              <div class="vpp-panel__seg-bar">
                <span class="vpp-panel__seg vpp-panel__seg--1"></span>
                <span class="vpp-panel__seg vpp-panel__seg--2"></span>
                <span class="vpp-panel__seg vpp-panel__seg--3"></span>
                <span class="vpp-panel__seg vpp-panel__seg--4"></span>
              </div>
              <div class="vpp-panel__seg-legend">
                <span><i class="vpp-panel__dot vpp-panel__dot--1"></i>태양광</span>
                <span><i class="vpp-panel__dot vpp-panel__dot--2"></i>풍력</span>
                <span><i class="vpp-panel__dot vpp-panel__dot--3"></i>연료전지</span>
                <span><i class="vpp-panel__dot vpp-panel__dot--4"></i>기타</span>
              </div>
            </div>
          </section>

        <!-- Settlement card -->
        <section class="vpp-panel">
          <div class="vpp-panel__head">
            <span class="vpp-panel__label">2028년 1월 정산금</span>
            <span class="vpp-panel__badge vpp-panel__badge--up">+5.3%</span>
          </div>
          <div class="vpp-panel__amount vpp-panel__amount--sm">₩20,932</div>
          <div class="vpp-panel__sub">태양광 발전소</div>
          <div class="vpp-panel__bar-wrap">
            <div class="vpp-panel__bar-track">
              <div class="vpp-panel__bar-fill" style="width: 72%"></div>
            </div>
            <span class="vpp-panel__bar-pct">72%</span>
          </div>
        </section>

          <!-- Secondary tab toggle: 더보기 -->
          <div class="vpp-right__more-tab">
            <button
              type="button"
              class="vpp-right__more-btn"
              @click="rightPanelSecondaryTab = !rightPanelSecondaryTab"
            >
              {{ rightPanelSecondaryTab ? '접기' : '더보기' }}
              <IcoChevronDown
                :size="12"
                :strokeWidth="2.5"
                :style="{ transform: rightPanelSecondaryTab ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }"
              />
            </button>
          </div>

          <!-- Secondary content (plant gallery, weather, AI gauge) -->
          <template v-if="rightPanelSecondaryTab">

        <!-- Plant status + weather (tabbed) -->
        <section class="vpp-panel vpp-panel--tabs">
          <!-- Tab bar -->
          <div class="vpp-tabs">
            <button
              class="vpp-tab"
              :class="{ 'vpp-tab--active': plantTab === 'status' }"
              @click="plantTab = 'status'"
            >발전소 현황</button>
            <button
              class="vpp-tab"
              :class="{ 'vpp-tab--active': plantTab === 'weather' }"
              @click="plantTab = 'weather'"
            >날씨</button>
          </div>

          <!-- Status tab: image cards -->
          <div v-if="plantTab === 'status'" class="vpp-plant-gallery">
          <div class="vpp-plant-list">

            <!-- 용인 푸르지오 · 아파트 옥상 태양광 -->
            <div class="vpp-plant-card" @click="router.push('/projects/yongin-agri')" style="cursor:pointer">
              <div class="vpp-plant-card__photo">
                <img
                  src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=80&fit=crop&crop=center"
                  alt="용인 푸르지오 태양광"
                  loading="lazy"
                />
                <span class="vpp-plant-card__type-tag">태양광</span>
              </div>
              <div class="vpp-plant-card__body">
                <div class="vpp-plant-card__name">용인 푸르지오</div>
                <div class="vpp-plant-card__sub">경기도 용인시 · 250 kW</div>
                <div class="vpp-plant-card__foot">
                  <span class="vpp-plant-card__status vpp-plant-card__status--live">
                    <i class="vpp-plant-card__dot"></i>Active
                  </span>
                  <span class="vpp-plant-card__output">
                    <IcoLightning :size="12" :strokeWidth="2" />
                    193.8 kW
                  </span>
                </div>
              </div>
            </div>

            <!-- 음성 솔라파크 · 대규모 태양광 -->
            <div class="vpp-plant-card" @click="router.push('/projects/yongin-ground')" style="cursor:pointer">
              <div class="vpp-plant-card__photo">
                <img
                  src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80&fit=crop&crop=center"
                  alt="음성 솔라파크"
                  loading="lazy"
                />
                <span class="vpp-plant-card__type-tag">태양광</span>
              </div>
              <div class="vpp-plant-card__body">
                <div class="vpp-plant-card__name">음성 솔라파크</div>
                <div class="vpp-plant-card__sub">충청북도 음성군 · 1.5 MW</div>
                <div class="vpp-plant-card__foot">
                  <span class="vpp-plant-card__status vpp-plant-card__status--live">
                    <i class="vpp-plant-card__dot"></i>Active
                  </span>
                  <span class="vpp-plant-card__output">
                    <IcoLightning :size="12" :strokeWidth="2" />
                    1,248 kW
                  </span>
                </div>
              </div>
            </div>

            <!-- 영덕 바람언덕 · 풍력 -->
            <div class="vpp-plant-card" @click="router.push('/projects/yongin-tracker')" style="cursor:pointer">
              <div class="vpp-plant-card__photo">
                <img
                  src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80&fit=crop&crop=center"
                  alt="영덕 바람언덕 풍력"
                  loading="lazy"
                />
                <span class="vpp-plant-card__type-tag vpp-plant-card__type-tag--wind">풍력</span>
              </div>
              <div class="vpp-plant-card__body">
                <div class="vpp-plant-card__name">영덕 바람언덕</div>
                <div class="vpp-plant-card__sub">경상북도 영덕군 · 4 MW</div>
                <div class="vpp-plant-card__foot">
                  <span class="vpp-plant-card__status vpp-plant-card__status--warn">
                    <i class="vpp-plant-card__dot vpp-plant-card__dot--warn"></i>점검중
                  </span>
                  <span class="vpp-plant-card__output vpp-plant-card__output--muted">
                    <IcoLightning :size="12" :strokeWidth="2" />
                    3,600 kW
                  </span>
                </div>
              </div>
            </div>

            <!-- 화성 수소연료전지 -->
            <div class="vpp-plant-card" @click="router.push('/projects/yongin-industrial')" style="cursor:pointer">
              <div class="vpp-plant-card__photo">
                <img
                  src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&q=80&fit=crop&crop=center"
                  alt="화성 수소연료전지"
                  loading="lazy"
                />
                <span class="vpp-plant-card__type-tag vpp-plant-card__type-tag--fuel">연료전지</span>
              </div>
              <div class="vpp-plant-card__body">
                <div class="vpp-plant-card__name">화성 수소연료전지</div>
                <div class="vpp-plant-card__sub">경기도 화성시 · 600 kW</div>
                <div class="vpp-plant-card__foot">
                  <span class="vpp-plant-card__status vpp-plant-card__status--live">
                    <i class="vpp-plant-card__dot"></i>Active
                  </span>
                  <span class="vpp-plant-card__output">
                    <IcoLightning :size="12" :strokeWidth="2" />
                    504 kW
                  </span>
                </div>
              </div>
            </div>

            <!-- 합천댐 수상태양광 -->
            <div class="vpp-plant-card" @click="router.push('/projects/yongin-floating')" style="cursor:pointer">
              <div class="vpp-plant-card__photo">
                <img
                  src="https://images.unsplash.com/photo-1548337138-e87d889cc369?w=600&q=80&fit=crop&crop=center"
                  alt="합천댐 수상태양광"
                  loading="lazy"
                />
                <span class="vpp-plant-card__type-tag vpp-plant-card__type-tag--water">수상태양광</span>
              </div>
              <div class="vpp-plant-card__body">
                <div class="vpp-plant-card__name">합천댐 수상태양광</div>
                <div class="vpp-plant-card__sub">경상남도 합천군 · 2 MW</div>
                <div class="vpp-plant-card__foot">
                  <span class="vpp-plant-card__status vpp-plant-card__status--live">
                    <i class="vpp-plant-card__dot"></i>Active
                  </span>
                  <span class="vpp-plant-card__output">
                    <IcoLightning :size="12" :strokeWidth="2" />
                    1,860 kW
                  </span>
                </div>
              </div>
            </div>

          </div>
          </div><!-- /.vpp-plant-gallery -->

          <!-- Weather tab -->
          <div v-else class="vpp-weather">
            <div v-for="plant in weatherData" :key="plant.name" class="vpp-weather__row">
              <div class="vpp-weather__top">
                <span class="vpp-weather__name">{{ plant.name }}</span>
                <span class="vpp-weather__icon"><TkIcon :name="plant.icon" :size="16" /></span>
                <span class="vpp-weather__condition">{{ plant.condition }}</span>
                <span class="vpp-weather__temp">{{ plant.temp }}°</span>
              </div>
              <div class="vpp-weather__stats">
                <span class="vpp-weather__stat">
                  <IcoWeatherClear :size="11" :strokeWidth="2" />
                  {{ plant.irradiance }} kWh/m²
                </span>
                <span class="vpp-weather__stat">
                  <IcoWeatherCloud :size="11" :strokeWidth="2" />
                  구름 {{ plant.cloud }}%
                </span>
                <span class="vpp-weather__stat">
                  <IcoWeatherRain :size="11" :strokeWidth="2" />
                  {{ plant.rain }}mm
                </span>
                <span class="vpp-weather__stat">
                  <IcoWeatherWind :size="11" :strokeWidth="2" />
                  풍속 {{ plant.wind }}m/s
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- AI recommendation card -->
        <section class="vpp-panel">
          <div class="vpp-panel__head">
            <span class="vpp-panel__label">AI 투자 신호</span>
            <span class="vpp-panel__badge vpp-panel__badge--neutral">HOLD</span>
          </div>
          <div class="vpp-panel__sub" style="margin-bottom: 10px;">용인 푸르지오 발전소 · 임대 투자</div>
          <!-- Speedometer gauge: SELL←→BUY, needle at HOLD (center, 50%) -->
          <div class="vpp-gauge-wrap">
            <svg viewBox="0 0 100 58" width="100%" height="68" class="vpp-gauge__svg">
              <!-- Zone arcs on r=38 -->
              <!-- SELL zone: -90° to -30° (60°), red -->
              <path d="M16.0,50 A38,38 0 0,1 36.0,17.1" fill="none" stroke="#fca5a5" stroke-width="8" stroke-linecap="butt"/>
              <!-- HOLD zone: -30° to +30° (60°), yellow -->
              <path d="M36.0,17.1 A38,38 0 0,1 64.0,17.1" fill="none" stroke="#fde68a" stroke-width="8" stroke-linecap="butt"/>
              <!-- BUY zone: +30° to +90° (60°), green -->
              <path d="M64.0,17.1 A38,38 0 0,1 84.0,50" fill="none" stroke="#86efac" stroke-width="8" stroke-linecap="butt"/>
              <!-- Track outline -->
              <path d="M16.0,50 A38,38 0 0,1 84.0,50" fill="none" stroke="transparent" stroke-width="8"/>
              <!-- Needle at HOLD center (90°, pointing straight up) -->
              <!-- pivot at 50,50; needle tip at 50,16 -->
              <line x1="50" y1="50" x2="50" y2="16" stroke="#374151" stroke-width="2" stroke-linecap="round"/>
              <circle cx="50" cy="50" r="4" fill="#374151"/>
              <circle cx="50" cy="50" r="2" fill="#fff"/>
              <!-- Labels -->
              <text x="11" y="56" font-size="7.5" font-weight="700" fill="#ef4444" font-family="Inter,sans-serif" text-anchor="middle">SELL</text>
              <text x="50" y="10" font-size="7.5" font-weight="700" fill="#d97706" font-family="Inter,sans-serif" text-anchor="middle">HOLD</text>
              <text x="89" y="56" font-size="7.5" font-weight="700" fill="#16a34a" font-family="Inter,sans-serif" text-anchor="middle">BUY</text>
            </svg>
          </div>
          <div class="vpp-panel__row vpp-panel__row--mt">
            <span class="vpp-panel__row-label">신뢰도</span>
            <span class="vpp-panel__row-val">53.7%</span>
          </div>
          <div class="vpp-panel__row">
            <span class="vpp-panel__row-label">P/E</span>
            <span class="vpp-panel__row-val">29.1×</span>
          </div>
        </section>

        <!-- Blockchain live feed -->
        <section class="vpp-panel vpp-chain">
          <div class="vpp-chain__head">
            <IcoBlockchain :size="14" :strokeWidth="2" />
            <span>Blockchain 실시간</span>
            <button class="vpp-chain__toggle" @click="toggleBlockchain">
              {{ showBlockchain ? 'OFF' : 'ON' }}
            </button>
          </div>
          <template v-if="showBlockchain">
            <div class="vpp-chain__block">
              Block #{{ blockNum.toLocaleString('ko-KR') }}
            </div>
            <div class="vpp-chain__feed">
              <TransitionGroup name="tx-slide">
                <div v-for="tx in txFeed" :key="tx.id" class="vpp-chain__tx">
                  <div class="vpp-chain__tx-top">
                    <span class="vpp-chain__tx-type" :style="{ color: tx.typeColor }">{{ tx.type }}</span>
                    <span class="vpp-chain__tx-amount">{{ tx.amount }}</span>
                  </div>
                  <div class="vpp-chain__tx-mid">
                    <span class="vpp-chain__tx-addr">{{ tx.from }}</span>
                    <IcoArrowRight :size="10" :strokeWidth="2" />
                    <span class="vpp-chain__tx-addr">{{ tx.to }}</span>
                  </div>
                  <div class="vpp-chain__tx-hash">{{ tx.hash }}</div>
                </div>
              </TransitionGroup>
            </div>
          </template>
        </section>

          </template><!-- /secondary tab content -->

          <!-- ═══ INVESTMENT GUIDE (shown on projectList page, between portfolio panels) ═══ -->
          <template v-if="route.name === 'projectList'">
          <!-- Market data mini cards -->
          <section class="vpp-panel vpp-invest-market">
            <div class="vpp-invest-market__head">
              <IcoChartUp :size="14" :strokeWidth="2" />
              <span>에너지 시장 시세</span>
            </div>
            <div class="vpp-invest-market__items">
              <div class="vpp-invest-market__row">
                <span class="vpp-invest-market__label">SMP 육지</span>
                <span class="vpp-invest-market__val">{{ marketStore.smpDisplay.landAvg }} 원/kWh</span>
                <span v-if="marketStore.smp" :class="['vpp-invest-market__chg', marketStore.smp.landAvg >= 117 ? 'vpp-invest-market__chg--up' : 'vpp-invest-market__chg--down']">
                  {{ marketStore.smp.landAvg >= 117 ? '▲' : '▼' }} {{ Math.abs(marketStore.smp.landAvg - 117).toFixed(2) }}
                </span>
              </div>
              <div class="vpp-invest-market__row">
                <span class="vpp-invest-market__label">REC 현물</span>
                <span class="vpp-invest-market__val">{{ marketStore.recDisplay.avgPrice }} 원/REC</span>
                <span v-if="marketStore.rec" :class="['vpp-invest-market__chg', marketStore.recDisplay.changeUp ? 'vpp-invest-market__chg--up' : 'vpp-invest-market__chg--down']">
                  {{ marketStore.recDisplay.changeUp ? '▲' : '▼' }} {{ Math.abs(marketStore.rec.change).toLocaleString('ko-KR') }}
                </span>
              </div>
              <div class="vpp-invest-market__row">
                <span class="vpp-invest-market__label">KAU25</span>
                <span class="vpp-invest-market__val">8,500 원/톤</span>
                <span class="vpp-invest-market__chg vpp-invest-market__chg--up">▲ 200</span>
              </div>
            </div>
          </section>

          <!-- Popular projects -->
          <section class="vpp-panel vpp-popular">
            <div class="vpp-popular__head">
              <IcoStar :size="14" :strokeWidth="2" />
              <span>인기 프로젝트 TOP 3</span>
            </div>
            <div class="vpp-popular__list">
              <div class="vpp-popular__item">
                <span class="vpp-popular__rank">1</span>
                <div class="vpp-popular__info">
                  <span class="vpp-popular__name">전북 군산 해상풍력</span>
                  <span class="vpp-popular__yield">연 8.1%</span>
                </div>
              </div>
              <div class="vpp-popular__item">
                <span class="vpp-popular__rank">2</span>
                <div class="vpp-popular__info">
                  <span class="vpp-popular__name">충남 보령 수상태양광</span>
                  <span class="vpp-popular__yield">연 7.5%</span>
                </div>
              </div>
              <div class="vpp-popular__item">
                <span class="vpp-popular__rank">3</span>
                <div class="vpp-popular__info">
                  <span class="vpp-popular__name">김포 물류센터 PPA</span>
                  <span class="vpp-popular__yield">연 7.8%</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Investment guide accordion -->
          <section class="vpp-panel vpp-guide">
            <div class="vpp-guide__head">
              <IcoInfo :size="14" :strokeWidth="2" />
              <span>투자 가이드</span>
            </div>
            <div v-for="(g, i) in investGuides" :key="i" class="vpp-guide__item" :class="{ 'vpp-guide__item--open': guideOpen === i }">
              <button class="vpp-guide__q" @click="toggleGuide(i)">
                {{ g.title }}
                <IcoChevronDown :size="12" :strokeWidth="2.5" />
              </button>
              <div v-if="guideOpen === i" class="vpp-guide__a">{{ g.body }}</div>
            </div>
          </section>

          <!-- AI Chatbot -->
          <section class="vpp-panel vpp-chat">
            <div class="vpp-chat__head">
              <IcoLightning :size="14" :strokeWidth="2" />
              <span>AI 투자 어시스턴트</span>
            </div>
            <div class="vpp-chat__desc">투자에 대해 궁금한 점을 물어보세요</div>
            <div class="vpp-chat__faq">
              <button v-for="faq in faqQuestions" :key="faq.q" class="vpp-chat__faq-btn" @click="sendFaq(faq.q, faq.a)">
                {{ faq.q }}
              </button>
            </div>
            <div v-if="chatMessages.length" class="vpp-chat__messages">
              <div v-for="(msg, i) in chatMessages" :key="i" class="vpp-chat__msg" :class="`vpp-chat__msg--${msg.role}`">
                {{ msg.text }}
              </div>
              <div v-if="chatLoading" class="vpp-chat__msg vpp-chat__msg--assistant vpp-chat__msg--loading">
                <span class="vpp-chat__typing"><i></i><i></i><i></i></span>
              </div>
            </div>
            <form class="vpp-chat__input-wrap" @submit.prevent="sendChat">
              <input v-model="chatInput" type="text" class="vpp-chat__input" placeholder="질문을 입력하세요..." />
              <button type="submit" class="vpp-chat__send" :disabled="!chatInput.trim()">
                <IcoArrowRight :size="14" :strokeWidth="2.5" />
              </button>
            </form>
          </section>
          </template><!-- /projectList conditional -->

          </template><!-- /investor panel (v-else) -->

        </template><!-- /expanded content -->

      </aside>

      <!-- Desktop collapse toggle (outside panel to avoid overflow clipping) -->
      <button
        v-if="showRightPanel"
        type="button"
        class="vpp-right__collapse-btn"
        :aria-label="rightPanelCollapsed ? '패널 확장' : '패널 축소'"
        @click="toggleRightCollapse"
      >
        <IcoArrowRight
          :size="14"
          :strokeWidth="2.5"
          :style="{ transform: rightPanelCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }"
        />
      </button>

      <!-- ── Left pane (SECONDARY — changes with menu selection) ── -->
      <main class="vpp-main">
        <div v-if="route.meta.title && showRightPanel" class="vpp-view-label">
          {{ route.meta.title }}
        </div>
        <div class="vpp-main__content">
          <RouterView />
        </div>
      </main>
    </div>

    <!-- ── Mobile bottom navigation (role-dynamic) ── -->
    <nav class="vpp-bottom-nav">
      <router-link
        v-for="tab in navTabs.slice(0, 4)"
        :key="tab.to"
        :to="tab.to"
        class="vpp-bottom-nav__item"
        :class="{ 'vpp-bottom-nav__item--active': isTabActive(tab) }"
      >
        <IcoHome v-if="tab.icon === 'home'" :size="22" :strokeWidth="2" />
        <IcoDocument v-else-if="tab.icon === 'document'" :size="22" :strokeWidth="2" />
        <IcoChartUp v-else-if="tab.icon === 'chart'" :size="22" :strokeWidth="2" />
        <IcoLightning v-else-if="tab.icon === 'lightning'" :size="22" :strokeWidth="2" />
        <IcoMeter v-else-if="tab.icon === 'meter'" :size="22" :strokeWidth="2" />
        <IcoPlug v-else-if="tab.icon === 'plug'" :size="22" :strokeWidth="2" />
        <IcoSolar v-else-if="tab.icon === 'solar'" :size="22" :strokeWidth="2" />
        <IcoGlobe v-else-if="tab.icon === 'globe'" :size="22" :strokeWidth="2" />
        <IcoBlockchain v-else-if="tab.icon === 'blockchain'" :size="22" :strokeWidth="2" />
        <IcoSettings v-else-if="tab.icon === 'settings'" :size="22" :strokeWidth="2" />
        <IcoHome v-else :size="22" :strokeWidth="2" />
        <span>{{ tab.label }}</span>
      </router-link>
      <button v-if="showRightPanel" type="button" class="vpp-bottom-nav__item vpp-bottom-nav__item--panel" @click="rightPanelOpen = !rightPanelOpen">
        <IcoBell :size="22" :strokeWidth="2" />
        <span>패널</span>
        <span class="vpp-bottom-nav__badge">{{ unreadCount }}</span>
      </button>
    </nav>

    <!-- ── Link Company Modal ── -->
    <Teleport to="body">
      <div v-if="showLinkModal" class="vpp-modal-overlay" @click.self="closeLinkModal">
        <div class="vpp-modal">
          <div class="vpp-modal__head">
            <h3 class="vpp-modal__title">법인 계정 연결</h3>
            <button type="button" class="vpp-modal__close" @click="closeLinkModal">
              <IcoClose :size="18" :strokeWidth="2" />
            </button>
          </div>
          <p class="vpp-modal__desc">연결할 법인의 사업자등록번호를 입력하세요.</p>
          <form @submit.prevent="handleLinkCompany" class="vpp-modal__form">
            <div class="vpp-modal__input-wrap">
              <IcoDocument class="vpp-modal__input-icon" :size="15" :strokeWidth="2" />
              <input v-model="linkBusinessNumber" type="text" class="vpp-modal__input" placeholder="000-00-00000" />
            </div>
            <div v-if="linkError" class="vpp-modal__error">{{ linkError }}</div>
            <div v-if="linkSuccess" class="vpp-modal__success">{{ linkSuccess }}</div>
            <button type="submit" class="vpp-modal__submit" :disabled="linkLoading">
              <span v-if="!linkLoading">연결하기</span>
              <span v-else class="vpp-modal__spinner"></span>
            </button>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ── Member List Modal ── -->
    <Teleport to="body">
      <div v-if="showMemberList" class="vpp-modal-overlay" @click.self="showMemberList = false">
        <div class="vpp-modal">
          <div class="vpp-modal__head">
            <h3 class="vpp-modal__title">법인 멤버 목록</h3>
            <button type="button" class="vpp-modal__close" @click="showMemberList = false">
              <IcoClose :size="18" :strokeWidth="2" />
            </button>
          </div>
          <div v-if="authStore.linkedMembers.length === 0" class="vpp-modal__empty">연결된 멤버가 없습니다.</div>
          <div v-else class="vpp-modal__member-list">
            <div v-for="member in authStore.linkedMembers" :key="member.id" class="vpp-modal__member">
              <div class="vpp-modal__member-avatar">{{ member.name.charAt(0) }}</div>
              <div class="vpp-modal__member-info">
                <span class="vpp-modal__member-name">{{ member.name }}</span>
                <span class="vpp-modal__member-email">{{ member.email }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Lucia Wallet Drawer ── -->
    <LuciaWallet :open="showWalletModal" @close="showWalletModal = false" />

    <!-- ── Floating AI Chatbot ── -->
    <FloatingChatbot :open="showChatbot" @close="showChatbot = false" />

  </div>
</template>

<!-- Grid utilities: unscoped so child views (RouterView) can use vpp-grid and vpp-col-* -->
<style lang="scss">
@use "@/assets/scss/variables/layout" as layout-vars;

.vpp-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: layout-vars.$grid-gutter;
  width: 100%;
}
.vpp-col-12 { grid-column: 1 / -1; }
.vpp-col-8  { grid-column: span 8; }
.vpp-col-6  { grid-column: span 6; }
.vpp-col-4  { grid-column: span 4; }
.vpp-col-3  { grid-column: span 3; }
</style>

<style scoped lang="scss">
@use "@/assets/scss/variables/colors";
@use "@/assets/scss/variables/typography";
@use "@/assets/scss/variables/layout" as layout-vars;
@use "@/assets/scss/variables/spacing" as sp;

// ── tokens ───────────────────────────────────────────────────────────────────
$header-h:           44px;
$right-w:            320px;
$accent:             #4F6AF5;
$accent-light:       #EEF2FF;
$accent-dark:        #3b56d9;
$surface:            #ffffff;
$bg:                 #F4F5F7;
$border:             #E8EAED;
$text-primary:       #111827;
$text-secondary:     #6B7280;
$text-muted:         #9CA3AF;
$green:              #16a34a;
$green-bg:           #dcfce7;
$red:                #dc2626;
$yellow:             #d97706;
$yellow-bg:          #fef3c7;
$breakpoint-tablet:  992px;
$breakpoint-mobile:  768px;

// ── Header type scale (tight — fits 44px bar) ───────────────────────────────
$hdr-text-xs:    9px;
$hdr-text-sm:    10px;
$hdr-text-base:  11px;
$hdr-text-md:    12px;

// ── Header control sizes ────────────────────────────────────────────────────
$hdr-control-h:  28px;
$hdr-avatar-sz:  24px;

// ── layout ───────────────────────────────────────────────────────────────────
.vpp-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $bg;
  font-family: "Inter", sans-serif;
}

// ── header ───────────────────────────────────────────────────────────────────
.vpp-header {
  height: $header-h;
  background: $surface;
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  gap: sp.$space-3;                       // 12px — consistent inner gap
  padding: 0 sp.$space-5;                 // 0 24px — matches page-padding-x
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;

  // ── Brand / logo ──
  &__brand {
    display: flex;
    align-items: center;
    margin-right: sp.$space-2;            // 8px after logo, before tabs
    flex-shrink: 0;
  }
  &__brand-svg {
    height: 22px;
    width: auto;
    color: #000F6C;
    display: block;
  }

  // ── CTA button ──
  &__cta {
    display: flex;
    align-items: center;
    gap: sp.$space-2;                     // 8px icon–text gap
    padding: 0 sp.$space-4;              // 0 16px
    height: $hdr-control-h;
    background: #F97316;
    color: #fff;
    font-size: $hdr-text-md;             // 13px — primary interactive
    font-weight: 600;
    font-family: "Inter", sans-serif;
    border-radius: sp.$space-2;           // 8px
    text-decoration: none;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.15s, transform 0.1s;
    &:hover  { background: #ea6c0a; }
    &:active { transform: scale(0.97); }
  }

  // ── Navigation tabs ──
  &__tabs {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 0;                               // tabs sit flush, padding handles space
  }
  &__tab {
    height: $header-h;
    display: flex;
    align-items: center;
    padding: 0 sp.$space-3;              // 0 12px — even horizontal rhythm
    font-size: $hdr-text-md;             // 13px — primary interactive
    font-weight: 500;
    color: $text-secondary;
    text-decoration: none;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
    white-space: nowrap;

    &:hover { color: $text-primary; }
    &--active {
      color: $accent;
      border-bottom-color: $accent;
      font-weight: 600;
    }
  }

  // ── Actions (right side) ──
  &__actions {
    display: flex;
    align-items: center;
    gap: sp.$space-2;                     // 8px
    margin-left: auto;                    // push everything right of the nav tabs
  }
  &__time {
    font-size: $hdr-text-sm;             // 11px — secondary info
    color: $text-muted;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  &__icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: $hdr-control-h;
    height: $hdr-control-h;
    border: 1px solid $border;
    background: $surface;
    color: $text-secondary;
    cursor: pointer;
    border-radius: sp.$space-2;
    position: relative;
    transition: background 0.15s, color 0.15s;
    &:hover { background: $bg; color: $text-primary; }
    &--badge { border-color: $border; }
  }
  &__ai-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    height: $hdr-control-h;
    padding: 0 10px;
    border: 1px solid $border;
    background: $surface;
    cursor: pointer;
    border-radius: sp.$space-2;
    transition: background 0.15s, border-color 0.15s;
    color: $accent;
    &:hover { background: $accent-light; border-color: $accent; }
  }
  &__ai-label {
    font-size: 11px;
    font-weight: 700;
    color: $accent;
    white-space: nowrap;
  }
  &__wallet-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    height: $hdr-control-h;
    padding: 0 14px;
    border: 1px solid $border;
    background: $surface;
    cursor: pointer;
    border-radius: sp.$space-2;
    position: relative;
    transition: background 0.15s, border-color 0.15s;
    &:hover { background: $bg; border-color: $accent; }
  }
  &__wallet-label {
    font-size: 11.5px;
    font-weight: 700;
    color: $text-secondary;
    white-space: nowrap;
  }
  &__wallet-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 4px rgba(74,222,128,0.5);
    flex-shrink: 0;
  }
  &__badge {
    position: absolute;
    top: sp.$space-1;                     // 4px
    right: sp.$space-1;
    min-width: 14px;
    height: 14px;
    padding: 0 3px;
    font-size: 9px;                       // below scale — intentionally tiny
    font-weight: 700;
    color: #fff;
    background: $red;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // ── User profile pill ──
  &__user {
    display: flex;
    align-items: center;
    gap: sp.$space-2;                     // 8px
    padding: sp.$space-1 sp.$space-3;    // 4px 12px
    border: 1px solid $border;
    border-radius: sp.$space-3;           // 12px pill shape
    cursor: pointer;
    transition: background 0.15s;
    position: relative;
    &:hover { background: $bg; }
  }
  &__user-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: $surface;
    border: 1px solid $border;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    min-width: 160px;
    z-index: 200;
    overflow: hidden;
  }
  &__user-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 500;
    font-family: "Inter", sans-serif;
    color: $text-secondary;
    background: none;
    border: none;
    cursor: pointer;
    transition: background 0.15s;
    &:hover { background: $bg; color: $text-primary; }
  }
  &__avatar {
    width: $hdr-avatar-sz;
    height: $hdr-avatar-sz;
    border-radius: 50%;
    background: $accent;
    color: #fff;
    font-size: $hdr-text-sm;             // 11px
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  &__user-info {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
  }
  &__user-name {
    font-size: $hdr-text-base;           // 12px
    font-weight: 600;
    color: $text-primary;
    white-space: nowrap;
  }
  &__user-role {
    font-size: $hdr-text-xs;             // 10px — smallest label
    color: $text-muted;
    white-space: nowrap;
  }

  // ── Notification bell wrapper ──
  &__notif-wrap {
    position: relative;
  }
}

// ── Notification dropdown ──
.vpp-notif {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 340px;
  max-height: 420px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  z-index: 250;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: "Inter", sans-serif;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 10px;
    border-bottom: 1px solid $border;
  }

  &__head-title {
    font-size: 14px;
    font-weight: 700;
    color: $text-primary;
  }

  &__mark-read {
    font-size: 11px;
    font-weight: 600;
    color: $accent;
    background: none;
    border: none;
    cursor: pointer;
    font-family: "Inter", sans-serif;
    &:hover { text-decoration: underline; }
  }

  &__list {
    overflow-y: auto;
    flex: 1;

    &::-webkit-scrollbar { width: 0; }
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.12s;
    border-bottom: 1px solid rgba($border, 0.5);
    position: relative;

    &:hover { background: $bg; }
    &:last-child { border-bottom: none; }

    &--unread {
      background: rgba(79,106,245,0.03);
      border-left: 3px solid $accent;
    }
  }

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--settlement { background: rgba(79,106,245,0.1); color: $accent; }
    &--alert { background: rgba(245,158,11,0.1); color: #d97706; }
    &--market { background: rgba(16,185,129,0.1); color: #059669; }
    &--system { background: rgba(107,114,128,0.1); color: #6b7280; }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 12px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 2px;
  }

  &__msg {
    font-size: 11px;
    color: $text-secondary;
    line-height: 1.4;
    margin-bottom: 3px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__time {
    font-size: 10px;
    color: $text-muted;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $accent;
    flex-shrink: 0;
    margin-top: 4px;
  }
}

.vpp-header {
  // ── View mode toggle (personal / company) ──
  &__view-toggle {
    display: flex;
    background: $bg;
    border: 1px solid $border;
    border-radius: 8px;
    overflow: hidden;
  }
  &__vt-btn {
    padding: 5px 12px;
    font-size: 11px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    background: none;
    border: none;
    color: $text-muted;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;

    &:hover { color: $text-secondary; }

    &--active {
      background: $accent;
      color: #fff;
      &:hover { color: #fff; }
    }
  }
}

// ── Modal overlay & card ──────────────────────────────────────────────────────
.vpp-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
}

.vpp-modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  padding: 24px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  &__close {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    display: flex;
    &:hover { color: #475569; }
  }

  &__desc {
    font-size: 13px;
    color: #94a3b8;
    margin: 0 0 16px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__input-icon {
    position: absolute;
    left: 12px;
    color: #94a3b8;
    pointer-events: none;
  }

  &__input {
    width: 100%;
    height: 44px;
    padding: 0 14px 0 38px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    font-family: "Inter", sans-serif;
    color: #0f172a;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    &::placeholder { color: #94a3b8; }
    &:focus {
      border-color: #4F6AF5;
      box-shadow: 0 0 0 3px rgba(79, 106, 245, 0.12);
      background: #fff;
    }
  }

  &__error {
    font-size: 12.5px;
    color: #dc2626;
    background: #fef2f2;
    border: 1px solid #fecaca;
    padding: 8px 12px;
    border-radius: 8px;
  }

  &__success {
    font-size: 12.5px;
    color: #16a34a;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    padding: 8px 12px;
    border-radius: 8px;
  }

  &__submit {
    height: 44px;
    background: #4F6AF5;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    &:hover:not(:disabled) { background: #3b56d9; }
    &:disabled { opacity: 0.7; cursor: not-allowed; }
  }

  &__spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: vpp-spin 0.7s linear infinite;
  }

  &__empty {
    text-align: center;
    padding: 24px 0;
    font-size: 13px;
    color: #94a3b8;
  }

  &__member-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;
    margin-top: 8px;
  }

  &__member {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: #f8fafc;
    border-radius: 10px;
  }

  &__member-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #4F6AF5;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__member-info {
    display: flex;
    flex-direction: column;
  }

  &__member-name {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
  }

  &__member-email {
    font-size: 11px;
    color: #94a3b8;
  }
}

@keyframes vpp-spin {
  to { transform: rotate(360deg); }
}

// ── 에너지 시장 인덱스 티커 바 ───────────────────────────────────────────────────
.vpp-market-bar {
  height: $hdr-control-h;                 // 28px — same as header controls
  background: #f0f2f5;
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0;
  padding: 0 sp.$space-5;                // 16px — matches header padding
  flex-shrink: 0;
  overflow: hidden;
  font-family: "Inter", sans-serif;
}

.vpp-mkt__item {
  display: flex;
  align-items: center;
  gap: sp.$space-1;                       // 4px — tight data cluster
  padding: 0 sp.$space-3;                // 0 12px — matches tab padding
  height: 100%;
  white-space: nowrap;
  flex: 1;
  justify-content: center;
}

.vpp-mkt__sep {
  width: 1px;
  height: sp.$space-4;                    // 12px
  background: #d1d5db;
  flex-shrink: 0;
}

.vpp-mkt__spacer {
  display: none;
}

.vpp-mkt__badge {
  font-size: 9px;                         // below scale — intentionally tiny label
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 2px 5px;
  border-radius: sp.$space-1;            // 4px
  flex-shrink: 0;

  &--blue   { background: rgba(79,106,245,0.1); color: #4f6af5; }
  &--violet { background: rgba(124,58,237,0.1); color: #7c3aed; }
  &--amber  { background: rgba(245,158,11,0.1);  color: #d97706; }
  &--green  { background: rgba(34,197,94,0.1);   color: #16a34a; }
  &--slate  { background: rgba(0,0,0,0.04); color: #64748b; }
}

.vpp-mkt__name {
  font-size: $hdr-text-sm;               // 10px — secondary label
  color: #6b7280;
  font-weight: 500;
}

.vpp-mkt__val {
  font-size: $hdr-text-base;             // 11px — data value
  font-weight: 700;
  color: $text-primary;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.vpp-mkt__unit {
  font-size: $hdr-text-xs;               // 9px — smallest label
  color: #9ca3af;
  font-weight: 400;
}

.vpp-mkt__chg {
  font-size: $hdr-text-xs;               // 10px — normalized (was 10.5px)
  font-weight: 700;
  font-variant-numeric: tabular-nums;

  &--up   { color: #dc2626; }
  &--down { color: #2563eb; }
}

.vpp-mkt__src {
  font-size: $hdr-text-xs;               // 9px — normalized
  color: #6b7280;
  padding-left: sp.$space-2;             // 4px
  flex-shrink: 0;
  flex: none;
}

// ── body ─────────────────────────────────────────────────────────────────────
.vpp-body {
  display: flex;
  flex: 1;
  min-height: 0;
  position: relative;
}

.vpp-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: $bg;
  order: 1; // visually left even though aside comes first in DOM
}

// ── page content wrapper (shared padding/grid container) ─────────────────────
.vpp-main__content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: layout-vars.$page-padding-y layout-vars.$page-padding-x;
  overflow: auto;
}

// ── view label (current screen indicator in left pane) ──────────────────────
.vpp-view-label {
  padding: 12px 24px 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: $text-muted;
  font-family: "Inter", sans-serif;
}

// ── right panel ──────────────────────────────────────────────────────────────
.vpp-right {
  width: $right-w;
  flex-shrink: 0;
  background: $surface;
  border-left: 1px solid $border;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
  position: sticky;
  top: $header-h;
  height: calc(100vh - #{$header-h});
  align-self: flex-start;
  order: 2;
  transition: width 0.25s ease;

  &::-webkit-scrollbar { width: 0; }

  &--collapsed {
    width: 48px;
    overflow: hidden;
  }
}

// ── Collapse toggle button (desktop only) ─────────────────────────────────
.vpp-right__collapse-btn {
  display: none;
  position: absolute;
  top: 16px;
  right: calc(#{$right-w} - 16px);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: $surface;
  border: 1px solid $border;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  z-index: 10;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
  transition: background 0.15s, color 0.15s, right 0.25s ease;
  padding: 0;

  &:hover {
    background: $bg;
    color: $accent;
  }
}

// When panel is collapsed, shift button to match collapsed width
.vpp-right--collapsed ~ .vpp-right__collapse-btn {
  right: calc(48px - 16px);
}

@media (min-width: #{$breakpoint-tablet + 1px}) {
  .vpp-right {
    position: sticky;
  }
  .vpp-right__collapse-btn {
    display: flex;
  }
}

// ── Collapsed mini strip ─────────────────────────────────────────────────
.vpp-right__mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: sp.$space-4;
  padding: sp.$space-6 sp.$space-2 sp.$space-3;
}

.vpp-right__mini-icon {
  color: $accent;
}

.vpp-right__mini-amount {
  font-size: 9px;
  font-weight: 700;
  color: $text-primary;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 0.02em;
  font-family: "Inter", sans-serif;
}

.vpp-right__mini-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $accent;
  box-shadow: 0 0 4px rgba($accent, 0.4);
}

// ── Secondary tab toggle (더보기) ────────────────────────────────────────
.vpp-right__more-tab {
  padding: sp.$space-2 sp.$space-3;
  border-bottom: 1px solid $border;
}

.vpp-right__more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: sp.$space-1;
  width: 100%;
  padding: sp.$space-1 0;
  font-size: 11px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  color: $text-muted;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;

  &:hover { color: $text-secondary; }
}

.vpp-right__title {
  padding: 8px 12px 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $text-muted;
  border-bottom: 1px solid $border;
  font-family: "Inter", sans-serif;
}

// ── panel cards ───────────────────────────────────────────────────────────────
.vpp-panel {
  padding: 10px 12px;
  border-bottom: 1px solid $border;
  font-family: "Inter", sans-serif;

  &--accent {
    background: $accent;
    color: #fff;

    .vpp-panel__label    { color: rgba(255,255,255,0.7); }
    .vpp-panel__amount   { color: #fff; }
    .vpp-panel__sub      { color: rgba(255,255,255,0.6); }
    .vpp-panel__row-label{ color: rgba(255,255,255,0.6); }
    .vpp-panel__row-val  { color: #fff; }
    .vpp-panel__seg-label{ color: rgba(255,255,255,0.6); }
    .vpp-panel__btn      {
      background: rgba(255,255,255,0.15);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.25);
      &:hover { background: rgba(255,255,255,0.25); }
    }
    .vpp-panel__badge--up {
      background: rgba(255,255,255,0.2);
      color: #fff;
    }
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  &__label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: $text-muted;
    margin-bottom: 6px;
    display: block;
  }

  &__amount {
    font-size: 20px;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: 2px;
    &--sm { font-size: 16px; }
  }

  &__sub {
    font-size: 10.5px;
    color: $text-muted;
    margin-bottom: 2px;
  }

  &__badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 5px;
    flex-shrink: 0;
    &--up     { background: $green-bg; color: $green; }
    &--neutral{ background: $yellow-bg; color: $yellow; }
    &--down   { background: #fee2e2; color: $red; }
  }

  &__count {
    font-size: 11px;
    color: $text-muted;
    font-weight: 500;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11.5px;
    padding: 2px 0;
    &--mt { margin-top: 6px; }
  }
  &__row-label { color: $text-muted; }
  &__row-val   { font-weight: 600; color: $text-primary; }

  &__seg-wrap  { margin-top: 8px; }
  &__seg-label { font-size: 10px; color: $text-muted; margin-bottom: 4px; display: block; }
  &__seg-bar   {
    height: 4px;
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    margin-bottom: 5px;
  }
  &__seg {
    flex: 1;
    height: 100%;
    &--1 { background: #60a5fa; }
    &--2 { background: #a78bfa; }
    &--3 { background: #34d399; }
    &--4 { background: #fbbf24; }
  }
  &__seg-legend {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    font-size: 9.5px;
    color: $text-muted;
    span { display: flex; align-items: center; gap: 3px; }
  }
  &__dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    &--1 { background: #60a5fa; }
    &--2 { background: #a78bfa; }
    &--3 { background: #34d399; }
    &--4 { background: #fbbf24; }
  }

  &__btn {
    display: block;
    width: 100%;
    margin-top: 8px;
    padding: 6px 10px;
    font-size: 11.5px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    color: $accent;
    background: rgba(79, 106, 245, 0.08);
    border: 1px solid rgba(79, 106, 245, 0.2);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
    &:hover { background: rgba(79, 106, 245, 0.14); }
  }

  &__bar-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
  }
  &__bar-track {
    flex: 1;
    height: 5px;
    background: $border;
    border-radius: 3px;
    overflow: hidden;
  }
  &__bar-fill {
    height: 100%;
    background: $accent;
    border-radius: 3px;
  }
  &__bar-pct {
    font-size: 11px;
    font-weight: 600;
    color: $accent;
    white-space: nowrap;
  }

  // table
  &__table { margin-top: 2px; }
  &__tr {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 6px;
    align-items: center;
    padding: 5px 0;
    border-bottom: 1px solid $border;
    font-size: 11.5px;
    color: $text-primary;

    &--head {
      font-size: 9.5px;
      font-weight: 600;
      color: $text-muted;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding-bottom: 4px;
    }
    &:last-child { border-bottom: none; }
  }
  &__mono {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    font-size: 12px;
    text-align: right;
  }
  &__status {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 5px;
    text-align: center;
    &--live { background: $green-bg; color: $green; }
    &--warn { background: $yellow-bg; color: $yellow; }
    &--off  { background: #fee2e2; color: $red; }
  }

  // signal bar
  &__signal-bar {
    display: flex;
    border-radius: 6px;
    overflow: hidden;
    background: $bg;
    border: 1px solid $border;
  }
  &__signal-seg {
    flex: 1;
    padding: 3px 4px;
    text-align: center;
    font-size: 9.5px;
    font-weight: 700;
    color: $text-muted;
    &--active {
      background: $yellow-bg;
      color: $yellow;
    }
  }
}

// ── tabs ─────────────────────────────────────────────────────────────────────
.vpp-panel--tabs {
  padding-top: 0;
}

.vpp-tabs {
  display: flex;
  border-bottom: 1px solid $border;
  margin: 0 -12px 8px;
  padding: 0 12px;
}

.vpp-tab {
  padding: 8px 10px 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  color: $text-muted;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  margin-bottom: -1px;

  &:hover { color: $text-primary; }

  &--active {
    color: $accent;
    border-bottom-color: $accent;
  }
}

// ── weather rows ──────────────────────────────────────────────────────────────
.vpp-weather {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.vpp-weather__row {
  padding: 6px 0;
  border-bottom: 1px solid $border;

  &:last-child { border-bottom: none; }
}

.vpp-weather__top {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 4px;
}

.vpp-weather__name {
  font-size: 12px;
  font-weight: 600;
  color: $text-primary;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vpp-weather__icon {
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
}

.vpp-weather__condition {
  font-size: 11px;
  color: $text-muted;
  flex-shrink: 0;

}

.vpp-weather__temp {
  font-size: 13px;
  font-weight: 700;
  color: $text-primary;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.vpp-weather__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px 8px;
}

.vpp-weather__stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  color: $text-muted;

  svg {
    flex-shrink: 0;
    opacity: 0.6;
  }
}

// ── plant image cards ─────────────────────────────────────────────────────────

// Gallery wrapper: clips height + provides gradient fade at bottom
.vpp-plant-gallery {
  position: relative;
  max-height: 300px;
  overflow: hidden;

  // Gradient fade: subtle hint at bottom suggesting more cards below
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0)   0%,
      rgba(255, 255, 255, 0.5) 60%,
      rgba(255, 255, 255, 0.8) 100%
    );
    pointer-events: none;
    z-index: 2;
  }
}

.vpp-plant-list {
  display: flex;
  flex-direction: column;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { width: 0; }
}

.vpp-plant-card {
  border-bottom: 1px solid $border;
  &:last-child { border-bottom: none; }

  &__photo {
    position: relative;
    width: 100%;
    height: 96px;
    overflow: hidden;
    border-radius: 6px 6px 0 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }
    &:hover img { transform: scale(1.04); }
  }

  &__type-tag {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 2px 7px;
    border-radius: 4px;
    background: rgba(79, 106, 245, 0.85);
    color: #fff;
    backdrop-filter: blur(4px);

    &--wind  { background: rgba(124, 58, 237, 0.85); }
    &--fuel  { background: rgba(34, 197, 94, 0.8); }
    &--water { background: rgba(6, 182, 212, 0.85); }
  }

  &__body {
    padding: 6px 0 8px;
  }

  &__name {
    font-size: 12px;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 1px;
  }

  &__sub {
    font-size: 10px;
    color: $text-muted;
    margin-bottom: 6px;
  }

  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 600;

    &--live { color: $green; }
    &--warn { color: $yellow; }
    &--off  { color: $red; }
  }

  &__dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $green;
    flex-shrink: 0;

    &--warn { background: $yellow; }
  }

  &__output {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: $text-secondary;
    font-variant-numeric: tabular-nums;

    svg { color: $text-muted; flex-shrink: 0; }
    &--muted { color: $text-muted; }
  }
}

// ── bottom nav (mobile only, hidden on desktop) ───────────────────────────────
// ── blockchain feed ───────────────────────────────────────────────────────────
// ── responsive bottom nav ────────────────────────────────────────────────────
$bottom-nav-h: 60px;

.vpp-bottom-nav {
  display: none; // shown only on mobile via media query
}

// ── overlay (mobile only) ─────────────────────────────────────────────────────
.vpp-overlay {
  display: none;
}

// ── right panel handle (mobile only) ─────────────────────────────────────────
.vpp-right__handle {
  display: none;
}

// ── Tablet: collapse right panel below main ───────────────────────────────────
@media (max-width: $breakpoint-tablet) {
  .vpp-body { flex-direction: column; }

  .vpp-main  { order: 1; }
  .vpp-right {
    order: 2;
    width: 100%;
    border-left: none;
    border-top: 1px solid $border;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0;
    position: static;
    height: auto;
    align-self: auto;
    overflow: visible;
  }

  .vpp-right__title { display: none; }
  .vpp-view-label   { display: none; }

  .vpp-panel { flex: 1 1 240px; }

  .vpp-right__handle { display: none; }
  .vpp-right__collapse-btn { display: none; }
  .vpp-right__mini { display: none; }
  .vpp-right--collapsed { width: 100%; overflow: visible; }
}

// ── Mobile: full bottom-sheet UX ─────────────────────────────────────────────
@media (max-width: $breakpoint-mobile) {

  // Layout shifts up to make room for bottom nav
  .vpp-layout {
    padding-bottom: $bottom-nav-h;
  }

  // Header: slim down — logo + right actions only, hide desktop nav & search
  .vpp-header {
    padding: 0 sp.$space-4;              // 16px — tighter mobile padding
    gap: sp.$space-2;                     // 8px
    justify-content: space-between;

    &__tabs    { display: none; }    // nav goes to bottom bar

    &__time      { display: none; }
    &__user-info { display: none; }
    &__user      { padding: sp.$space-1; border: none; gap: 0; }
    &__cta       { display: none; } // CTA is in bottom nav on mobile
    &__wallet-label { display: none; } // hide text, keep icon on mobile
    &__actions   { gap: sp.$space-3; }  // 12px — more spacing between icons on mobile

    &__brand-svg { height: 18px; }
  }

  // Market bar: horizontal scroll on mobile
  .vpp-market-bar {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  .vpp-mkt__src { display: none; }

  // Main content full width; reduce horizontal padding on mobile
  .vpp-body { flex-direction: column; }
  .vpp-main { order: 1; }
  .vpp-main__content {
    padding-left: layout-vars.$page-padding-x-mobile;
    padding-right: layout-vars.$page-padding-x-mobile;
    padding-bottom: 8px; // tight bottom — footer sits flush
  }
  .vpp-right__title { display: none; }
  .vpp-view-label   { display: none; }

  // Overlay backdrop
  .vpp-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0);
    z-index: 299;
    pointer-events: none;
    transition: background 0.3s;

    &--open {
      background: rgba(0,0,0,0.45);
      pointer-events: auto;
    }
  }

  // Right panel → bottom sheet
  .vpp-right {
    position: fixed;
    bottom: $bottom-nav-h;
    left: 0;
    right: 0;
    width: 100%;
    max-height: 80vh;
    height: auto;
    border-left: none;
    border-top: 1px solid $border;
    border-radius: 20px 20px 0 0;
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 0;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 300;
    align-self: auto;
    transform: translateY(100%);
    transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
    box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
    padding-bottom: 0;

    &--open {
      transform: translateY(0);
    }

    &::-webkit-scrollbar { width: 0; }

    // Remove bottom border on last visible panel to eliminate empty gap
    > :last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 6px;
    }
  }

  // Show drag handle on mobile
  .vpp-right__handle {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 0 6px;
    cursor: pointer;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    background: $surface;
    z-index: 1;
    border-radius: 20px 20px 0 0;

    &-bar {
      display: block;
      width: 36px;
      height: 4px;
      border-radius: 2px;
      background: $border;
    }
  }

  .vpp-panel { flex: none; width: 100%; }
  .vpp-panel:last-child { border-bottom: none; }
  .vpp-right__more-tab:last-child { padding-bottom: 0; }

  // Bottom navigation bar
  .vpp-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: $bottom-nav-h;
    background: $surface;
    border-top: 1px solid $border;
    z-index: 400;
    align-items: stretch;

    // safe area for notched phones
    padding-bottom: env(safe-area-inset-bottom, 0);

    &__item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      border: none;
      background: none;
      color: $text-muted;
      font-size: 10px;
      font-family: "Inter", sans-serif;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: color 0.15s;
      position: relative;
      padding: 6px 2px 4px;

      svg { flex-shrink: 0; }

      &--active {
        color: $accent;
      }

      &--cta {
        color: #F97316;
        svg { stroke: #F97316; }
        &:hover:not(&--active) { color: #ea6c0a; }
      }

      &--panel {
        // slight accent fill on open
      }

      &:hover:not(&--active) { color: $text-secondary; }
    }

    &__badge {
      position: absolute;
      top: 6px;
      right: calc(50% - 18px);
      min-width: 14px;
      height: 14px;
      padding: 0 3px;
      font-size: 9px;
      font-weight: 700;
      color: #fff;
      background: $red;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// ── Investment market data ──
.vpp-invest-market {
  &__head {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 8px;

    svg { color: $accent; }
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid $border;
    border-radius: 6px;
    overflow: hidden;
  }

  &__row {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border-bottom: 1px solid $border;

    &:last-child { border-bottom: none; }
  }

  &__label {
    font-size: 10.5px;
    font-weight: 700;
    color: $text-secondary;
    min-width: 52px;
  }

  &__val {
    flex: 1;
    font-size: 11px;
    font-weight: 700;
    color: $text-primary;
    font-variant-numeric: tabular-nums;
    text-align: right;
    margin-right: 6px;
  }

  &__chg {
    font-size: 10px;
    font-weight: 700;
    min-width: 44px;
    text-align: right;

    &--up { color: #dc2626; }
    &--down { color: #2563eb; }
  }
}

// ── Popular projects ──
.vpp-popular {
  &__head {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 8px;

    svg { color: #f59e0b; }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    background: #f8fafc;
    border: 1px solid $border;
    border-radius: 6px;
  }

  &__rank {
    width: 20px; height: 20px;
    border-radius: 5px;
    background: $accent;
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
  }

  &__name {
    font-size: 11px;
    font-weight: 700;
    color: $text-primary;
  }

  &__yield {
    font-size: 10.5px;
    font-weight: 700;
    color: $green;
  }
}

// ── Investment guide accordion ──
.vpp-guide {
  &__head {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 8px;

    svg { color: $accent; }
  }

  &__item {
    border: 1px solid $border;
    border-radius: 6px;
    margin-bottom: 4px;
    overflow: hidden;

    &--open {
      border-color: rgba(79,106,245,0.3);
    }
  }

  &__q {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 7px 10px;
    font-size: 11px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    color: $text-primary;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;

    svg {
      color: $text-muted;
      transition: transform 0.15s;
    }

    .vpp-guide__item--open & svg {
      transform: rotate(180deg);
    }
  }

  &__a {
    padding: 0 10px 8px;
    font-size: 11px;
    line-height: 1.6;
    color: $text-secondary;
  }
}

// ── AI Chatbot ──
.vpp-chat {
  &__head {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: 2px;

    svg { color: $accent; }
  }

  &__desc {
    font-size: 10.5px;
    color: $text-muted;
    margin-bottom: 6px;
  }

  &__faq {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: 6px;
  }

  &__faq-btn {
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    color: $accent;
    background: rgba(79,106,245,0.06);
    border: 1px solid rgba(79,106,245,0.15);
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.12s;

    &:hover {
      background: rgba(79,106,245,0.1);
      border-color: rgba(79,106,245,0.25);
    }
  }

  &__messages {
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 6px;
    padding: 4px 0;
  }

  &__msg {
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 11px;
    line-height: 1.6;
    max-width: 90%;

    &--user {
      align-self: flex-end;
      background: $accent;
      color: #fff;
      border-bottom-right-radius: 3px;
    }

    &--assistant {
      align-self: flex-start;
      background: #f1f5f9;
      color: $text-primary;
      border-bottom-left-radius: 3px;
    }

    &--loading {
      padding: 10px 16px;
    }
  }

  &__typing {
    display: flex;
    gap: 4px;

    i {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: $text-muted;
      animation: chatDot 1.2s infinite;

      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
  }

  &__input-wrap {
    display: flex;
    gap: 6px;
  }

  &__input {
    flex: 1;
    padding: 6px 10px;
    font-size: 11px;
    font-family: "Inter", sans-serif;
    border: 1px solid $border;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.12s;

    &::placeholder { color: $text-muted; }
    &:focus { border-color: $accent; }
  }

  &__send {
    width: 30px; height: 30px;
    border-radius: 6px;
    background: $accent;
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.12s;

    &:hover { background: $accent-dark; }
    &:disabled { opacity: 0.4; cursor: default; }
  }
}

@keyframes chatDot {
  0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
  30% { opacity: 1; transform: scale(1); }
}

// ── Blockchain Live Feed ──
.vpp-chain {
  &__head {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 800;
    color: $text-primary;

    svg { color: $accent; }
  }

  &__toggle {
    margin-left: auto;
    font-size: 9px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid $border;
    background: $bg;
    color: $text-muted;
    cursor: pointer;
    transition: all 0.12s;

    &:hover { border-color: $accent; color: $accent; }
  }

  &__block {
    font-size: 10px;
    font-weight: 700;
    color: $accent;
    background: $accent-light;
    padding: 4px 8px;
    border-radius: 5px;
    text-align: center;
    margin-bottom: 6px;
    font-variant-numeric: tabular-nums;
  }

  &__feed {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 260px;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-thumb { background: $border; border-radius: 2px; }
  }

  &__tx {
    background: $bg;
    border: 1px solid $border;
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 10.5px;
  }

  &__tx-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3px;
  }

  &__tx-type {
    font-weight: 800;
    font-size: 10px;
  }

  &__tx-amount {
    font-weight: 800;
    color: $text-primary;
    font-variant-numeric: tabular-nums;
    font-size: 11px;
  }

  &__tx-mid {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    color: $text-muted;
    font-weight: 500;
    margin-bottom: 2px;

    svg { color: $text-muted; flex-shrink: 0; }
  }

  &__tx-addr {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90px;
  }

  &__tx-hash {
    font-size: 9px;
    font-weight: 600;
    color: $accent;
    font-family: "SF Mono", "Fira Code", monospace;
    opacity: 0.7;
  }
}

// Transition for feed items
.tx-slide-enter-active {
  transition: all 0.3s ease;
}
.tx-slide-leave-active {
  transition: all 0.2s ease;
}
.tx-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.tx-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

// ══════════════════════════════════════════
// AUTHORITY PANEL — 지역에너지 자립률
// ══════════════════════════════════════════

// Main rate display
.vpp-auth-rate {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 4px 0 2px;

  &__val {
    font-size: 40px;
    font-weight: 900;
    color: #fff;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  &__unit {
    font-size: 20px;
    font-weight: 700;
    color: rgba(255,255,255,0.75);
  }

  &__trend {
    font-size: 12px;
    font-weight: 700;
    color: #bbf7d0;
    background: rgba(255,255,255,0.12);
    padding: 2px 8px;
    border-radius: 10px;
    margin-left: auto;
  }

  &__sub {
    font-size: 11px;
    color: rgba(255,255,255,0.6);
    margin-bottom: 10px;
  }
}

// Progress bar toward national target
.vpp-auth-rate__progress-wrap {
  margin-bottom: 14px;
}

.vpp-auth-rate__progress-track {
  position: relative;
  height: 7px;
  background: rgba(255,255,255,0.18);
  border-radius: 4px;
  overflow: visible;
  margin-bottom: 4px;
}

.vpp-auth-rate__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #86efac, #4ade80);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.vpp-auth-rate__progress-target {
  position: absolute;
  right: 0;
  top: -3px;
  width: 2px;
  height: 13px;
  background: rgba(255,255,255,0.7);
  border-radius: 1px;

  &::after {
    content: '목표';
    position: absolute;
    top: 14px;
    right: 0;
    font-size: 9px;
    color: rgba(255,255,255,0.6);
    white-space: nowrap;
  }
}

.vpp-auth-rate__progress-label {
  font-size: 10.5px;
  color: rgba(255,255,255,0.6);
  font-weight: 600;
}

// Breakdown by energy type
.vpp-auth-breakdown {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 4px;
  border-top: 1px solid rgba(255,255,255,0.12);
}

.vpp-auth-breakdown__row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.vpp-auth-bd {
  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;

    &--solar { background: #fbbf24; }
    &--wind  { background: #22d3ee; }
    &--ess   { background: #4ade80; }
    &--other { background: rgba(255,255,255,0.4); }
  }

  &__label {
    font-size: 10.5px;
    color: rgba(255,255,255,0.7);
    width: 36px;
    flex-shrink: 0;
  }

  &__bar {
    flex: 1;
    height: 4px;
    background: rgba(255,255,255,0.15);
    border-radius: 2px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: #fbbf24;
    border-radius: 2px;
    transition: width 0.5s ease;

    &--wind  { background: #22d3ee; }
    &--ess   { background: #4ade80; }
    &--other { background: rgba(255,255,255,0.35); }
  }

  &__val {
    font-size: 10.5px;
    font-weight: 700;
    color: rgba(255,255,255,0.85);
    width: 32px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
}

// Regional comparison
.vpp-auth-regions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vpp-auth-region {
  display: flex;
  align-items: center;
  gap: 8px;

  &__name {
    font-size: 11px;
    color: #475569;
    width: 84px;
    flex-shrink: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__bar {
    flex: 1;
    height: 5px;
    background: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  &__val {
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    width: 36px;
    text-align: right;
    font-variant-numeric: tabular-nums;

    &--green { color: #16a34a; }
  }
}

// ══════════════════════════════════════════
// NEWSBOARD — 소통 게시판
// ══════════════════════════════════════════

.vpp-newsboard {
  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  &__title {
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
    flex: 1;
  }

  &__pending {
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    background: #dc2626;
    padding: 2px 7px;
    border-radius: 10px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin-top: 10px;
  }

  &__item {
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;

    &:last-of-type { border-bottom: none; }
    &:hover .vpp-newsboard__item-title { color: #4F6AF5; }
  }

  &__item-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 3px;
  }

  &__item-title {
    font-size: 12px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.4;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    transition: color 0.15s;
  }

  &__type {
    font-size: 9.5px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    flex-shrink: 0;

    &--notice  { background: #EEF2FF; color: #4F6AF5; }
    &--hearing { background: #FEF3C7; color: #d97706; }
    &--law     { background: #F0FDF4; color: #16a34a; }
  }

  &__status {
    font-size: 9.5px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    flex-shrink: 0;

    &--done    { background: #F0FDF4; color: #16a34a; }
    &--pending { background: #FEF2F2; color: #dc2626; }
  }

  &__new {
    font-size: 8.5px;
    font-weight: 800;
    color: #fff;
    background: #ef4444;
    padding: 1px 4px;
    border-radius: 3px;
  }

  &__author {
    font-size: 10px;
    color: #94a3b8;
    font-weight: 500;
  }

  &__date {
    font-size: 10px;
    color: #94a3b8;
    margin-left: auto;
  }

  &__more-btn {
    display: block;
    width: 100%;
    margin-top: 10px;
    padding: 7px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    text-align: center;
    font-family: "Inter", sans-serif;
    transition: background 0.15s, color 0.15s;

    &:hover { background: #EEF2FF; color: #4F6AF5; border-color: #c7d2fe; }
  }
}

// Tab badge dot for inquiry count
.vpp-tab__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  font-size: 9px;
  font-weight: 800;
  color: #fff;
  background: #ef4444;
  border-radius: 50%;
  margin-left: 4px;
}
</style>
