<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth-store";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  IcoSolar, IcoWind, IcoBattery, IcoArrowRight, IcoArrowLeft, IcoClose,
  IcoSmp, IcoRec, IcoKau, IcoMapPin, IcoCheck, IcoLightning,
  IcoBell, IcoDocument, IcoChartUp, IcoChartBar, IcoGrid, IcoMeter,
} from "@/components/icons";
import { useMarketStore } from "@/stores/market-store";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

const router = useRouter();
const authStore = useAuthStore();
const marketStore = useMarketStore();

const mapContainer = ref<HTMLElement | null>(null);
const showBanner = ref(true);
const selectedProject = ref<CIProject | null>(null);

let map: mapboxgl.Map | null = null;
const markers: mapboxgl.Marker[] = [];

// ── C&I projects with coordinates ──
interface CIProject {
  id: string;
  name: string;
  type: string;
  typeIcon: string;
  location: string;
  capacity: string;
  expectedYield: string;
  minInvest: string;
  progress: number;
  status: string;
  statusColor: string;
  lng: number;
  lat: number;
  desc: string;
}

const projects: CIProject[] = [
  {
    id: "yongin-rooftop",
    name: "용인시 지붕형 태양광",
    type: "태양광",
    typeIcon: "solar",
    location: "경기 용인시 처인구",
    capacity: "1.8 MW",
    expectedYield: "연 6.2%",
    minInvest: "₩10,000",
    progress: 72,
    status: "참여 가능",
    statusColor: "green",
    lng: 127.1775,
    lat: 37.2342,
    desc: "산업단지 지붕 활용 태양광. 건물 옥상 유휴공간 활용으로 별도 부지 불필요. PPA 20년 계약 체결.",
  },
  {
    id: "yongin-ground",
    name: "용인시 지상형 태양광",
    type: "태양광",
    typeIcon: "solar",
    location: "경기 용인시 양지면",
    capacity: "3.2 MW",
    expectedYield: "연 7.1%",
    minInvest: "₩50,000",
    progress: 45,
    status: "참여 가능",
    statusColor: "green",
    lng: 127.2856,
    lat: 37.2180,
    desc: "양지면 일조량 최적 부지. 고정형 거치대 기반 대규모 발전. REC 가중치 적용 수익 극대화.",
  },
  {
    id: "yongin-floating",
    name: "용인시 수상형 태양광",
    type: "태양광",
    typeIcon: "solar",
    location: "경기 용인시 기흥구",
    capacity: "2.5 MW",
    expectedYield: "연 7.5%",
    minInvest: "₩30,000",
    progress: 91,
    status: "마감 임박",
    statusColor: "amber",
    lng: 127.1148,
    lat: 37.2755,
    desc: "기흥저수지 수면 활용 수상태양광. 수면 냉각 효과로 발전 효율 15% 향상. SMP+REC 이중 수익.",
  },
  {
    id: "yongin-fems",
    name: "용인시 FEMS 연계형 태양광",
    type: "태양광",
    typeIcon: "solar",
    location: "경기 용인시 수지구",
    capacity: "1.5 MW",
    expectedYield: "연 6.8%",
    minInvest: "₩20,000",
    progress: 28,
    status: "신규 오픈",
    statusColor: "blue",
    lng: 127.0980,
    lat: 37.3220,
    desc: "공장에너지관리시스템(FEMS) 연동. 실시간 수요 예측 기반 자가소비 최적화. DR 참여 추가 수익.",
  },
  {
    id: "yongin-bipv",
    name: "용인시 BIPV형 태양광",
    type: "태양광",
    typeIcon: "solar",
    location: "경기 용인시 처인구 남동",
    capacity: "0.8 MW",
    expectedYield: "연 5.9%",
    minInvest: "₩15,000",
    progress: 60,
    status: "참여 가능",
    statusColor: "green",
    lng: 127.2050,
    lat: 37.2510,
    desc: "건물일체형 태양광(BIPV). 외벽·창호 일체 설치로 건축미 유지. RE100 이행 최적 솔루션.",
  },
  {
    id: "yongin-ess",
    name: "용인시 ESS통합형 태양광",
    type: "태양광",
    typeIcon: "solar",
    location: "경기 용인시 처인구 이동",
    capacity: "4.0 MW",
    expectedYield: "연 8.1%",
    minInvest: "₩100,000",
    progress: 15,
    status: "신규 오픈",
    statusColor: "blue",
    lng: 127.1620,
    lat: 37.1950,
    desc: "ESS 2MWh 연계 태양광 발전. 피크 시간대 방전으로 수익 극대화. 한전 계통 안정화 기여.",
  },
  {
    id: "yongin-agri",
    name: "용인시 영농형 태양광",
    type: "태양광",
    typeIcon: "solar",
    location: "경기 용인시 원삼면",
    capacity: "2.0 MW",
    expectedYield: "연 6.5%",
    minInvest: "₩20,000",
    progress: 38,
    status: "참여 가능",
    statusColor: "green",
    lng: 127.3100,
    lat: 37.1780,
    desc: "농지 위 고설치형 태양광. 영농활동과 발전 병행. 농가 추가소득 + 신재생에너지 생산 이중 효과.",
  },
];

// ── Market snapshot (실시간) ──
const marketData = computed(() => [
  {
    label: "SMP",
    value: marketStore.smpDisplay.landAvg,
    unit: "원/kWh",
    change: marketStore.smp
      ? (marketStore.smp.landAvg >= 117 ? "+" : "") + (marketStore.smp.landAvg - 117).toFixed(2)
      : "—",
    up: (marketStore.smp?.landAvg ?? 117) >= 117,
    icon: "smp",
  },
  {
    label: "REC",
    value: marketStore.recDisplay.avgPrice,
    unit: "원/REC",
    change: marketStore.recDisplay.change,
    up: marketStore.recDisplay.changeUp,
    icon: "rec",
  },
  { label: "KAU", value: "8,500", unit: "원/tCO₂", change: "+200", up: true, icon: "kau" },
]);

// ── EPSIS Power Market Data (전력통계정보시스템) ──

// SMP 시간대별 현황
const smpHourlyData = [
  { hour: "00", land: 98.52, jeju: 85.31 },
  { hour: "03", land: 89.47, jeju: 72.18 },
  { hour: "06", land: 105.28, jeju: 94.63 },
  { hour: "09", land: 132.41, jeju: 118.92 },
  { hour: "12", land: 145.73, jeju: 125.47 },
  { hour: "15", land: 138.62, jeju: 121.35 },
  { hour: "18", land: 152.89, jeju: 138.71 },
  { hour: "21", land: 128.34, jeju: 112.46 },
];

// 전력거래량 (Power Trading Volume by source)
const tradingVolume = [
  { source: "원자력", volume: "6,842", share: 28.1, color: "#6366f1" },
  { source: "유연탄", volume: "5,218", share: 21.4, color: "#475569" },
  { source: "LNG", volume: "7,934", share: 32.6, color: "#0891b2" },
  { source: "신재생", volume: "2,847", share: 11.7, color: "#16a34a" },
  { source: "유류", volume: "312", share: 1.3, color: "#d97706" },
  { source: "기타", volume: "1,193", share: 4.9, color: "#94a3b8" },
];
const totalTradingVolume = "24,346";

// 전력거래금액 (Trading Amount)
const tradingAmount = [
  { source: "원자력", amount: "4,218", share: 12.8 },
  { source: "유연탄", amount: "5,892", share: 17.9 },
  { source: "LNG", amount: "16,483", share: 50.1 },
  { source: "신재생", amount: "4,126", share: 12.5 },
  { source: "유류", amount: "891", share: 2.7 },
  { source: "기타", amount: "1,312", share: 4.0 },
];
const totalTradingAmount = "32,922";

// 연료비단가 (Fuel Cost Unit Prices)
const fuelCosts = [
  { fuel: "원자력", price: "6.12", unit: "원/kWh", change: -0.08, trend: "down" },
  { fuel: "유연탄", price: "98,420", unit: "원/ton", change: 1230, trend: "up" },
  { fuel: "무연탄", price: "186,500", unit: "원/ton", change: -2100, trend: "down" },
  { fuel: "유류", price: "842,300", unit: "원/㎘", change: 15400, trend: "up" },
  { fuel: "LNG", price: "892,100", unit: "원/ton", change: -8300, trend: "down" },
];

// 전력수급 현황 (Supply & Demand)
const supplyDemand = {
  peakDemand: "89,241",
  peakDate: "2026.01.22",
  installedCapacity: "143,862",
  reserveMargin: "54,621",
  reserveRate: "61.2",
  todayDemand: "72,485",
  todaySupply: "78,920",
  operatingReserve: "6,435",
};

// SMP 월별 추이 (최근 6개월)
const smpMonthly = [
  { month: "9월", land: 112.3, jeju: 98.7 },
  { month: "10월", land: 108.9, jeju: 95.2 },
  { month: "11월", land: 118.5, jeju: 104.1 },
  { month: "12월", land: 125.7, jeju: 110.8 },
  { month: "1월", land: 131.2, jeju: 115.4 },
  { month: "2월", land: 128.6, jeju: 112.9 },
];

// REC 거래 현황
const recTrade = {
  spotPrice: marketStore.recDisplay.avgPrice,
  spotVolume: "1,248,000",
  contractPrice: "68,200",
  contractVolume: "3,421,000",
  weightedAvg: "70,850",
  totalIssued: "48,926,000",
};

function goTo(path: string) {
  router.push(path);
}

function dismissBanner() {
  showBanner.value = false;
}

// ── Calendar ──
interface CalendarEvent {
  id: string;
  date: string;  // YYYY-MM-DD
  title: string;
  type: "deadline" | "settlement" | "market" | "project";
  urgency: "high" | "medium" | "low";
  detail: string;
}

const today = new Date();
const todayStr = today.toISOString().slice(0, 10);

function fmtDate(offset: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Events spread across multiple months for browsing
const calendarEvents: CalendarEvent[] = [
  // Past events (previous month)
  { id: "p1", date: fmtDate(-18), title: "1월 SMP 정산 완료", type: "settlement", urgency: "low", detail: "당진 태양광 1호 정산 ₩12.8만 입금" },
  { id: "p2", date: fmtDate(-12), title: "REC 현물 6차 입찰 완료", type: "market", urgency: "low", detail: "낙찰가 72,100원/REC" },
  { id: "p3", date: fmtDate(-7), title: "안산 ESS 2호 DR 정산", type: "settlement", urgency: "low", detail: "수요반응 참여 보상금 ₩8.4만" },
  // Current period
  { id: "e1", date: fmtDate(0), title: "안산 ESS 2호 참여 마감 D-3", type: "deadline", urgency: "high", detail: "진행률 91% — 잔여 참여금 ₩2,700만" },
  { id: "e2", date: fmtDate(1), title: "2월 SMP 정산금 입금 예정", type: "settlement", urgency: "medium", detail: "당진 태양광 1호 정산 · 예상 ₩14.2만" },
  { id: "e3", date: fmtDate(2), title: "REC 현물 입찰 마감", type: "market", urgency: "high", detail: "한국에너지공단 제8차 현물시장 입찰" },
  { id: "e4", date: fmtDate(3), title: "제주 한림 풍력 3호 계통연계 심의", type: "project", urgency: "medium", detail: "한전 계통연계 기술 심의 · 승인 시 수익률 +0.3%p" },
  { id: "e5", date: fmtDate(5), title: "시뮬레이션 특별 금리 이벤트 종료", type: "deadline", urgency: "high", detail: "연 4.2% → 3.8% 하향 예정 · 마감 5일" },
  { id: "e6", date: fmtDate(6), title: "보령 수상태양광 준공 검사", type: "project", urgency: "low", detail: "충남도청 합동 준공 검사 · 발전 개시 D-14" },
  { id: "e7", date: fmtDate(7), title: "3월 DR 참여 신청 마감", type: "market", urgency: "medium", detail: "한전 수요반응 3월 프로그램 참여 신청" },
  { id: "e8", date: fmtDate(9), title: "군산 해상풍력 사업 설명회", type: "project", urgency: "low", detail: "온라인 라이브 · 예상 수익률 8.1% 상세 안내" },
  { id: "e9", date: fmtDate(10), title: "KAU 배출권 2차 장외거래 마감", type: "market", urgency: "medium", detail: "2026 할당년도 배출권 거래 마감" },
  { id: "e10", date: fmtDate(12), title: "3월 SMP 전망 리포트 발간", type: "market", urgency: "low", detail: "THEKIE 리서치 월간 시장 전망 리포트" },
  // Future events (next month)
  { id: "f1", date: fmtDate(16), title: "보령 수상태양광 발전 개시", type: "project", urgency: "medium", detail: "3.8MW 상업 운전 개시 · 첫 정산 예정" },
  { id: "f2", date: fmtDate(20), title: "당진 태양광 1호 연간 성과 보고", type: "project", urgency: "low", detail: "2025 연간 발전량 및 수익 보고서 발간" },
  { id: "f3", date: fmtDate(24), title: "4월 REC 현물 입찰 개시", type: "market", urgency: "medium", detail: "한국에너지공단 제9차 현물시장" },
  { id: "f4", date: fmtDate(28), title: "군산 해상풍력 참여 마감 예정", type: "deadline", urgency: "high", detail: "8MW 해상풍력 사업 참여 마감일" },
  { id: "f5", date: fmtDate(35), title: "2분기 DR 참여 등록 마감", type: "market", urgency: "medium", detail: "한전 수요반응 2분기 프로그램" },
];

// Upcoming deadlines (replaces full calendar)
const upcomingDeadlines = computed(() =>
  calendarEvents
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3),
);

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function selectProject(project: CIProject) {
  selectedProject.value = project;
  if (map) {
    map.flyTo({ center: [project.lng, project.lat], zoom: 10, duration: 800 });
  }
}

function goToProject(project: CIProject) {
  router.push(`/projects/${project.id}`);
}

function createMarkerEl(project: CIProject): HTMLElement {
  const el = document.createElement("div");
  el.className = "map-marker";
  el.dataset.type = project.typeIcon;
  el.innerHTML = `<span class="map-marker__dot"></span>`;
  el.addEventListener("click", () => selectProject(project));
  return el;
}

onMounted(() => {
  // 시장 데이터 로드
  marketStore.startPolling();

  if (!mapContainer.value) return;

  mapboxgl.accessToken = MAPBOX_TOKEN;
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: "mapbox://styles/mapbox/navigation-night-v1",
    center: [127.0, 35.9],
    zoom: 6.3,
    attributionControl: false,
    pitchWithRotate: false,
  });

  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

  map.on("load", () => {
    projects.forEach((p) => {
      const el = createMarkerEl(p);
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .addTo(map!);
      markers.push(marker);
    });
  });
});

onUnmounted(() => {
  markers.forEach((m) => m.remove());
  map?.remove();
  map = null;
});

// Highlight active marker
watch(selectedProject, (proj) => {
  document.querySelectorAll(".map-marker").forEach((el) => {
    el.classList.remove("map-marker--active");
  });
  if (proj) {
    const idx = projects.findIndex((p) => p.id === proj.id);
    const markerEls = document.querySelectorAll(".map-marker");
    if (markerEls[idx]) markerEls[idx].classList.add("map-marker--active");
  }
});
</script>

<template>
  <div class="auth-home">

    <!-- ── Notification banner (thin, dismissible) ── -->
    <Transition name="banner-fade">
      <div v-if="showBanner" class="ah-banner">
        <IcoLightning :size="14" :strokeWidth="2.5" />
        <span class="ah-banner__text">
          {{ authStore.user?.displayName ?? '참여자' }}님, 새로운 C&I 프로젝트 2건이 오픈되었습니다
        </span>
        <button class="ah-banner__close" @click="dismissBanner">
          <IcoClose :size="14" :strokeWidth="2.5" />
        </button>
      </div>
    </Transition>

    <!-- ── Upcoming Deadlines (compact strip) ── -->
    <section v-if="upcomingDeadlines.length" class="ah-deadlines">
      <div class="ah-deadlines__strip">
        <span class="ah-deadlines__label">
          <IcoBell :size="12" :strokeWidth="2.5" />
          다가오는 일정
        </span>
        <div class="ah-deadlines__items">
          <div
            v-for="ev in upcomingDeadlines"
            :key="ev.id"
            class="ah-deadlines__item"
          >
            <span
              class="ah-deadlines__dot"
              :class="`ah-deadlines__dot--${ev.urgency}`"
            ></span>
            <span class="ah-deadlines__title">{{ ev.title }}</span>
            <span
              class="ah-deadlines__badge"
              :class="{ 'ah-deadlines__badge--urgent': ev.urgency === 'high' }"
            >
              {{ daysUntil(ev.date) === 0 ? '오늘' : `D-${daysUntil(ev.date)}` }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Map + Project cards (main hero) ── -->
    <section class="ah-map-section">
      <div class="ah-section-head">
        <h2 class="ah-section-title ah-section-title--hero">C&I 재생에너지 사이트 현황</h2>
        <div class="ah-section-head__badge">
          <span class="ah-section-head__dot"></span>
          {{ projects.length }}개 프로젝트 운영 중
        </div>
      </div>

      <div class="ah-map-layout">
        <!-- Map -->
        <div class="ah-map-wrap">
          <div ref="mapContainer" class="ah-map"></div>
          <!-- Map legend -->
          <div class="ah-map-legend">
            <span class="ah-map-legend__item ah-map-legend__item--solar">태양광</span>
            <span class="ah-map-legend__item ah-map-legend__item--wind">풍력</span>
            <span class="ah-map-legend__item ah-map-legend__item--battery">ESS</span>
          </div>
        </div>

        <!-- Project list (sidebar) -->
        <div class="ah-project-list">
          <div
            v-for="p in projects"
            :key="p.id"
            class="ah-pcard"
            :class="{ 'ah-pcard--active': selectedProject?.id === p.id }"
            @click="selectProject(p)"
          >
            <div class="ah-pcard__top">
              <div class="ah-pcard__type-icon">
                <IcoSolar v-if="p.typeIcon === 'solar'" :size="14" :strokeWidth="2" />
                <IcoWind v-else-if="p.typeIcon === 'wind'" :size="14" :strokeWidth="2" />
                <IcoBattery v-else :size="14" :strokeWidth="2" />
              </div>
              <span class="ah-pcard__type">{{ p.type }}</span>
              <span class="ah-pcard__status" :class="`ah-pcard__status--${p.statusColor}`">{{ p.status }}</span>
            </div>
            <h3 class="ah-pcard__name">{{ p.name }}</h3>
            <div class="ah-pcard__location">
              <IcoMapPin :size="11" :strokeWidth="2" />
              {{ p.location }}
            </div>
            <div class="ah-pcard__stats">
              <span class="ah-pcard__yield">{{ p.expectedYield }}</span>
              <span class="ah-pcard__sep">|</span>
              <span>{{ p.capacity }}</span>
              <span class="ah-pcard__sep">|</span>
              <span>{{ p.minInvest }}~</span>
            </div>
            <div class="ah-pcard__progress">
              <div class="ah-pcard__progress-bar">
                <div class="ah-pcard__progress-fill" :style="{ width: p.progress + '%' }"></div>
              </div>
              <span class="ah-pcard__progress-label">{{ p.progress }}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Selected project detail ── -->
    <Transition name="detail-slide">
      <section v-if="selectedProject" class="ah-detail">
        <div class="ah-detail__header">
          <div class="ah-detail__type-icon">
            <IcoSolar v-if="selectedProject.typeIcon === 'solar'" :size="18" :strokeWidth="2" />
            <IcoWind v-else-if="selectedProject.typeIcon === 'wind'" :size="18" :strokeWidth="2" />
            <IcoBattery v-else :size="18" :strokeWidth="2" />
          </div>
          <div>
            <h3 class="ah-detail__name">{{ selectedProject.name }}</h3>
            <span class="ah-detail__location">{{ selectedProject.location }}</span>
          </div>
          <span class="ah-detail__status" :class="`ah-detail__status--${selectedProject.statusColor}`">
            {{ selectedProject.status }}
          </span>
        </div>

        <p class="ah-detail__desc">{{ selectedProject.desc }}</p>

        <div class="ah-detail__grid">
          <div class="ah-detail__stat">
            <span class="ah-detail__stat-label">기대 수익률</span>
            <span class="ah-detail__stat-value ah-detail__stat-value--accent">{{ selectedProject.expectedYield }}</span>
          </div>
          <div class="ah-detail__stat">
            <span class="ah-detail__stat-label">발전 용량</span>
            <span class="ah-detail__stat-value">{{ selectedProject.capacity }}</span>
          </div>
          <div class="ah-detail__stat">
            <span class="ah-detail__stat-label">최소 참여금</span>
            <span class="ah-detail__stat-value">{{ selectedProject.minInvest }}</span>
          </div>
          <div class="ah-detail__stat">
            <span class="ah-detail__stat-label">참여 진행률</span>
            <span class="ah-detail__stat-value">{{ selectedProject.progress }}%</span>
          </div>
        </div>

        <div class="ah-detail__actions">
          <button class="ah-detail__cta" @click="goToProject(selectedProject!)">
            상세보기
            <IcoArrowRight :size="14" :strokeWidth="2.5" />
          </button>
          <button class="ah-detail__ghost" @click="selectedProject = null">
            닫기
          </button>
        </div>
      </section>
    </Transition>

    <!-- ── Market snapshot ── -->
    <section class="ah-market">
      <div class="ah-section-head">
        <h2 class="ah-section-title">에너지 시장 현황</h2>
      </div>
      <div class="ah-market__strip">
        <div v-for="m in marketData" :key="m.label" class="ah-market__item">
          <div class="ah-market__icon">
            <IcoSmp v-if="m.icon === 'smp'" :size="16" :strokeWidth="2" />
            <IcoRec v-else-if="m.icon === 'rec'" :size="16" :strokeWidth="2" />
            <IcoKau v-else :size="16" :strokeWidth="2" />
          </div>
          <div class="ah-market__body">
            <span class="ah-market__label">{{ m.label }}</span>
            <span class="ah-market__unit">{{ m.unit }}</span>
          </div>
          <span class="ah-market__value">{{ m.value }}</span>
          <span class="ah-market__change" :class="m.up ? 'ah-market__change--up' : 'ah-market__change--down'">
            {{ m.up ? '▲' : '▼' }}{{ m.change.replace('-', '') }}
          </span>
        </div>
      </div>
    </section>

    <!-- ═══════════ EPSIS 전력시장 데이터 ═══════════ -->

    <!-- ── SMP 시간대별 현황 ── -->
    <section class="ep-section">
      <div class="ep-head">
        <IcoChartBar :size="14" :strokeWidth="2" />
        <h2 class="ep-title">SMP 시간대별 현황</h2>
        <span class="ep-src">출처: KPX EPSIS</span>
      </div>
      <div class="ep-smp-table">
        <div class="ep-smp-row ep-smp-row--head">
          <span class="ep-smp-cell ep-smp-cell--hour">시간</span>
          <span v-for="h in smpHourlyData" :key="h.hour" class="ep-smp-cell">{{ h.hour }}시</span>
        </div>
        <div class="ep-smp-row">
          <span class="ep-smp-cell ep-smp-cell--label">육지</span>
          <span v-for="h in smpHourlyData" :key="h.hour" class="ep-smp-cell ep-smp-cell--val">{{ h.land.toFixed(1) }}</span>
        </div>
        <div class="ep-smp-row">
          <span class="ep-smp-cell ep-smp-cell--label ep-smp-cell--jeju">제주</span>
          <span v-for="h in smpHourlyData" :key="h.hour" class="ep-smp-cell ep-smp-cell--val ep-smp-cell--sub">{{ h.jeju.toFixed(1) }}</span>
        </div>
      </div>
      <!-- SMP monthly mini chart (bar visualization) -->
      <div class="ep-smp-monthly">
        <span class="ep-smp-monthly__label">월별 SMP 추이 (원/kWh)</span>
        <div class="ep-smp-bars">
          <div v-for="m in smpMonthly" :key="m.month" class="ep-smp-bar-group">
            <div class="ep-smp-bar-wrap">
              <div class="ep-smp-bar ep-smp-bar--land" :style="{ height: (m.land / 160 * 100) + '%' }">
                <span class="ep-smp-bar__tip">{{ m.land.toFixed(1) }}</span>
              </div>
              <div class="ep-smp-bar ep-smp-bar--jeju" :style="{ height: (m.jeju / 160 * 100) + '%' }">
                <span class="ep-smp-bar__tip">{{ m.jeju.toFixed(1) }}</span>
              </div>
            </div>
            <span class="ep-smp-bar__month">{{ m.month }}</span>
          </div>
        </div>
        <div class="ep-smp-legend">
          <span class="ep-smp-legend__item"><i class="ep-smp-legend__dot ep-smp-legend__dot--land"></i>육지</span>
          <span class="ep-smp-legend__item"><i class="ep-smp-legend__dot ep-smp-legend__dot--jeju"></i>제주</span>
        </div>
      </div>
    </section>

    <!-- ── 전력거래량 & 거래금액 ── -->
    <section class="ep-section">
      <div class="ep-head">
        <IcoGrid :size="14" :strokeWidth="2" />
        <h2 class="ep-title">전력거래 현황</h2>
        <span class="ep-src">2026년 2월 기준</span>
      </div>
      <div class="ep-trade-grid">
        <!-- 거래량 -->
        <div class="ep-trade-card">
          <div class="ep-trade-card__head">
            <span class="ep-trade-card__title">전력거래량</span>
            <span class="ep-trade-card__total">{{ totalTradingVolume }} <small>GWh</small></span>
          </div>
          <!-- Mix bar -->
          <div class="ep-mix-bar">
            <div
              v-for="t in tradingVolume"
              :key="t.source"
              class="ep-mix-bar__seg"
              :style="{ width: t.share + '%', background: t.color }"
            ></div>
          </div>
          <div class="ep-trade-rows">
            <div v-for="t in tradingVolume" :key="t.source" class="ep-trade-row">
              <span class="ep-trade-row__dot" :style="{ background: t.color }"></span>
              <span class="ep-trade-row__source">{{ t.source }}</span>
              <span class="ep-trade-row__val">{{ t.volume }} GWh</span>
              <span class="ep-trade-row__share">{{ t.share }}%</span>
            </div>
          </div>
        </div>
        <!-- 거래금액 -->
        <div class="ep-trade-card">
          <div class="ep-trade-card__head">
            <span class="ep-trade-card__title">전력거래금액</span>
            <span class="ep-trade-card__total">{{ totalTradingAmount }} <small>억원</small></span>
          </div>
          <div class="ep-trade-rows">
            <div v-for="t in tradingAmount" :key="t.source" class="ep-trade-row">
              <span class="ep-trade-row__source">{{ t.source }}</span>
              <span class="ep-trade-row__val">{{ t.amount }} 억원</span>
              <span class="ep-trade-row__share">{{ t.share }}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 전력수급 현황 ── -->
    <section class="ep-section">
      <div class="ep-head">
        <IcoMeter :size="14" :strokeWidth="2" />
        <h2 class="ep-title">전력수급 현황</h2>
      </div>
      <div class="ep-supply-grid">
        <div class="ep-supply-card ep-supply-card--accent">
          <span class="ep-supply-card__label">금일 전력수요</span>
          <span class="ep-supply-card__value">{{ supplyDemand.todayDemand }} <small>MW</small></span>
        </div>
        <div class="ep-supply-card">
          <span class="ep-supply-card__label">금일 공급력</span>
          <span class="ep-supply-card__value">{{ supplyDemand.todaySupply }} <small>MW</small></span>
        </div>
        <div class="ep-supply-card">
          <span class="ep-supply-card__label">운영예비력</span>
          <span class="ep-supply-card__value">{{ supplyDemand.operatingReserve }} <small>MW</small></span>
        </div>
        <div class="ep-supply-card">
          <span class="ep-supply-card__label">설비용량</span>
          <span class="ep-supply-card__value">{{ supplyDemand.installedCapacity }} <small>MW</small></span>
        </div>
        <div class="ep-supply-card">
          <span class="ep-supply-card__label">최대전력 (금년)</span>
          <span class="ep-supply-card__value">{{ supplyDemand.peakDemand }} <small>MW</small></span>
          <span class="ep-supply-card__sub">{{ supplyDemand.peakDate }}</span>
        </div>
        <div class="ep-supply-card">
          <span class="ep-supply-card__label">공급예비율</span>
          <span class="ep-supply-card__value">{{ supplyDemand.reserveRate }}<small>%</small></span>
          <span class="ep-supply-card__sub">{{ supplyDemand.reserveMargin }} MW</span>
        </div>
      </div>
    </section>

    <!-- ── 연료비단가 ── -->
    <section class="ep-section">
      <div class="ep-head">
        <IcoDocument :size="14" :strokeWidth="2" />
        <h2 class="ep-title">연료비단가</h2>
        <span class="ep-src">월간 고시 기준</span>
      </div>
      <div class="ep-fuel-table">
        <div class="ep-fuel-row ep-fuel-row--head">
          <span class="ep-fuel-cell ep-fuel-cell--name">연료원</span>
          <span class="ep-fuel-cell ep-fuel-cell--price">단가</span>
          <span class="ep-fuel-cell ep-fuel-cell--unit">단위</span>
          <span class="ep-fuel-cell ep-fuel-cell--chg">증감</span>
        </div>
        <div v-for="f in fuelCosts" :key="f.fuel" class="ep-fuel-row">
          <span class="ep-fuel-cell ep-fuel-cell--name">{{ f.fuel }}</span>
          <span class="ep-fuel-cell ep-fuel-cell--price ep-fuel-cell--bold">{{ f.price }}</span>
          <span class="ep-fuel-cell ep-fuel-cell--unit">{{ f.unit }}</span>
          <span
            class="ep-fuel-cell ep-fuel-cell--chg"
            :class="f.trend === 'up' ? 'ep-fuel-cell--up' : 'ep-fuel-cell--down'"
          >
            {{ f.trend === 'up' ? '▲' : '▼' }} {{ Math.abs(f.change).toLocaleString('ko-KR') }}
          </span>
        </div>
      </div>
    </section>

    <!-- ── REC 거래 현황 ── -->
    <section class="ep-section">
      <div class="ep-head">
        <IcoRec :size="14" :strokeWidth="2" />
        <h2 class="ep-title">REC 거래 현황</h2>
      </div>
      <div class="ep-rec-grid">
        <div class="ep-rec-card">
          <span class="ep-rec-card__label">현물 평균가</span>
          <span class="ep-rec-card__value ep-rec-card__value--accent">{{ recTrade.spotPrice }} <small>원/REC</small></span>
        </div>
        <div class="ep-rec-card">
          <span class="ep-rec-card__label">현물 거래량</span>
          <span class="ep-rec-card__value">{{ recTrade.spotVolume }} <small>REC</small></span>
        </div>
        <div class="ep-rec-card">
          <span class="ep-rec-card__label">계약 평균가</span>
          <span class="ep-rec-card__value">{{ recTrade.contractPrice }} <small>원/REC</small></span>
        </div>
        <div class="ep-rec-card">
          <span class="ep-rec-card__label">계약 거래량</span>
          <span class="ep-rec-card__value">{{ recTrade.contractVolume }} <small>REC</small></span>
        </div>
        <div class="ep-rec-card">
          <span class="ep-rec-card__label">가중평균가</span>
          <span class="ep-rec-card__value">{{ recTrade.weightedAvg }} <small>원/REC</small></span>
        </div>
        <div class="ep-rec-card">
          <span class="ep-rec-card__label">총 발급량</span>
          <span class="ep-rec-card__value">{{ recTrade.totalIssued }} <small>REC</small></span>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped lang="scss">
$accent: #4F6AF5;
$accent-light: #EEF2FF;
$text-primary: #0f172a;
$text-secondary: #475569;
$text-muted: #94a3b8;
$border: #e2e8f0;
$surface: #ffffff;
$bg: #f8fafc;

.auth-home {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 0 24px;
}

// ── Notification banner ──
.ah-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(90deg, rgba(79,106,245,0.08), rgba(99,102,241,0.06));
  border: 1px solid rgba(79,106,245,0.15);
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 500;
  color: $text-secondary;

  svg:first-child { color: $accent; flex-shrink: 0; }

  &__text { flex: 1; }

  &__close {
    background: none;
    border: none;
    cursor: pointer;
    color: $text-muted;
    padding: 2px;
    display: flex;
    align-items: center;
    transition: color 0.15s;
    flex-shrink: 0;
    &:hover { color: $text-primary; }
  }
}

.banner-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.banner-fade-leave-to { opacity: 0; transform: translateY(-8px); }

// ── Upcoming Deadlines mini-widget ──
.ah-deadlines {
  margin-bottom: 2px;
}

.ah-deadlines__strip {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 10px 14px;
  min-height: 48px;
  max-height: 60px;
  overflow: hidden;
}

.ah-deadlines__label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: $text-muted;
  white-space: nowrap;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  svg { color: $accent; }
}

.ah-deadlines__items {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.ah-deadlines__item {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.ah-deadlines__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;

  &--high { background: #dc2626; }
  &--medium { background: #f59e0b; }
  &--low { background: #94a3b8; }
}

.ah-deadlines__title {
  font-size: 12px;
  font-weight: 600;
  color: $text-primary;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ah-deadlines__badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 4px;
  background: #f1f5f9;
  color: $text-muted;
  white-space: nowrap;
  flex-shrink: 0;

  &--urgent {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
}

// ── Section head ──
.ah-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #16a34a;
    background: #dcfce7;
    padding: 4px 10px;
    border-radius: 20px;
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #16a34a;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,106,0.3); }
  50% { box-shadow: 0 0 0 4px rgba(22,163,106,0); }
}

.ah-section-title {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: $text-primary;
  margin: 0;

  &--hero {
    font-size: 17px;
    font-weight: 900;
  }
}

.ah-section-more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 12.5px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  color: $accent;
  cursor: pointer;
  padding: 0;
  &:hover { text-decoration: underline; }
}

// ── Map layout ──
.ah-map-section { /* wrapper */ }

.ah-map-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 10px;
  min-height: 480px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
}

.ah-map-wrap {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid $border;
  min-height: 480px;

  @media (max-width: 900px) { min-height: 320px; }
}

.ah-map {
  width: 100%;
  height: 100%;
  min-height: inherit;
}

.ah-map-legend {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
  z-index: 2;

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    font-weight: 600;
    color: rgba(255,255,255,0.75);
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(8px);
    padding: 4px 10px;
    border-radius: 20px;

    &::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    &--solar::before { background: #f59e0b; }
    &--wind::before { background: #06b6d4; }
    &--battery::before { background: #22c55e; }
  }
}

// ── Project list (sidebar) ──
.ah-project-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 480px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }

  @media (max-width: 900px) {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    max-height: none;
    padding-right: 0;
    padding-bottom: 4px;

    &::-webkit-scrollbar { height: 4px; }
  }
}

.ah-pcard {
  background: $surface;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  flex-shrink: 0;

  @media (max-width: 900px) {
    min-width: 260px;
  }

  &:hover {
    border-color: #a3b3fa;
    box-shadow: 0 2px 12px rgba(79,106,245,0.08);
  }

  &--active {
    border-color: $accent;
    box-shadow: 0 0 0 2px rgba(79,106,245,0.15), 0 4px 16px rgba(79,106,245,0.1);
  }

  &__top {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }

  &__type-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: $accent-light;
    color: $accent;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__type {
    font-size: 11px;
    font-weight: 600;
    color: $text-secondary;
  }

  &__status {
    margin-left: auto;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 5px;

    &--green { background: #dcfce7; color: #16a34a; }
    &--amber { background: #fef3c7; color: #d97706; }
    &--blue { background: #dbeafe; color: #2563eb; }
  }

  &__name {
    font-size: 13px;
    font-weight: 700;
    color: $text-primary;
    margin: 0 0 2px;
  }

  &__location {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10.5px;
    color: $text-muted;
    margin-bottom: 6px;
  }

  &__stats {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 600;
    color: $text-secondary;
    margin-bottom: 6px;
    font-variant-numeric: tabular-nums;
  }

  &__yield { color: $accent; font-weight: 700; }
  &__sep { color: $border; }

  &__progress {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__progress-bar {
    flex: 1;
    height: 5px;
    background: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background: $accent;
    border-radius: 3px;
    transition: width 0.4s ease;
  }

  &__progress-label {
    font-size: 10.5px;
    font-weight: 600;
    color: $text-muted;
  }
}

// ── Project detail panel ──
.ah-detail {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 16px;

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  &__type-icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: $accent-light;
    color: $accent;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 800;
    color: $text-primary;
    margin: 0;
    letter-spacing: -0.02em;
  }

  &__location {
    font-size: 11px;
    color: $text-muted;
  }

  &__status {
    margin-left: auto;
    font-size: 10.5px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    white-space: nowrap;

    &--green { background: #dcfce7; color: #16a34a; }
    &--amber { background: #fef3c7; color: #d97706; }
    &--blue { background: #dbeafe; color: #2563eb; }
  }

  &__desc {
    font-size: 12.5px;
    line-height: 1.6;
    color: $text-secondary;
    margin: 0 0 12px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 12px;

    @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
  }

  &__stat {
    background: $bg;
    border-radius: 8px;
    padding: 8px 10px;
    text-align: center;
  }

  &__stat-label {
    display: block;
    font-size: 10px;
    color: $text-muted;
    font-weight: 500;
    margin-bottom: 2px;
  }

  &__stat-value {
    font-size: 13px;
    font-weight: 800;
    color: $text-primary;
    font-variant-numeric: tabular-nums;

    &--accent { color: $accent; }
  }

  &__actions {
    display: flex;
    gap: 10px;
  }

  &__cta {
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
    transition: background 0.15s, box-shadow 0.15s;
    box-shadow: 0 2px 12px rgba(79,106,245,0.3);

    &:hover { background: #3b56d9; }
  }

  &__ghost {
    padding: 10px 16px;
    background: none;
    border: 1px solid $border;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    color: $text-secondary;
    cursor: pointer;
    transition: background 0.15s;

    &:hover { background: $bg; }
  }
}

.detail-slide-enter-active { transition: opacity 0.25s, transform 0.25s; }
.detail-slide-enter-from { opacity: 0; transform: translateY(12px); }
.detail-slide-leave-active { transition: opacity 0.15s; }
.detail-slide-leave-to { opacity: 0; }

// ── Market snapshot ──
.ah-market__strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  @media (max-width: 640px) { grid-template-columns: 1fr; }
}

.ah-market__item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: $surface;
  border: 1px solid rgba($border, 0.6);
  border-radius: 6px;
  padding: 7px 10px;
}

.ah-market__icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: $accent-light;
  color: $accent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ah-market__body {
  display: flex;
  flex-direction: column;
}

.ah-market__label {
  font-size: 11px;
  font-weight: 600;
  color: $text-primary;
}

.ah-market__unit {
  font-size: 10px;
  color: $text-muted;
  font-weight: 500;
}

.ah-market__value {
  font-size: 12px;
  font-weight: 700;
  color: $text-primary;
  font-variant-numeric: tabular-nums;
  margin-left: auto;
}

.ah-market__change {
  font-size: 10.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;

  &--up { color: #16a34a; }
  &--down { color: #dc2626; }
}

// ═══════════ EPSIS 전력시장 데이터 ═══════════

.ep-section {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 14px 16px;
}

.ep-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;

  svg { color: $accent; }
}

.ep-title {
  font-size: 13px;
  font-weight: 800;
  color: $text-primary;
  margin: 0;
  flex: 1;
}

.ep-src {
  font-size: 10px;
  font-weight: 600;
  color: $text-muted;
  white-space: nowrap;
}

// ── SMP 시간대별 테이블 ──
.ep-smp-table {
  border: 1px solid $border;
  border-radius: 8px;
  overflow: hidden;
  overflow-x: auto;
  margin-bottom: 12px;
}

.ep-smp-row {
  display: flex;
  border-bottom: 1px solid $border;

  &:last-child { border-bottom: none; }

  &--head {
    background: $bg;
    .ep-smp-cell {
      font-weight: 700;
      color: $text-muted;
      font-size: 9.5px;
      text-transform: uppercase;
    }
  }
}

.ep-smp-cell {
  flex: 1;
  padding: 6px 4px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  min-width: 48px;

  &--hour { min-width: 40px; flex: 0 0 40px; text-align: left; padding-left: 8px; }
  &--label { min-width: 40px; flex: 0 0 40px; text-align: left; padding-left: 8px; color: $accent; font-weight: 700; }
  &--jeju { color: #7c3aed !important; }
  &--val { color: $text-primary; }
  &--sub { color: $text-secondary; }
}

// ── SMP 월별 바 차트 ──
.ep-smp-monthly {
  &__label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    color: $text-muted;
    margin-bottom: 8px;
  }
}

.ep-smp-bars {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  height: 80px;
  padding-bottom: 20px;
  position: relative;
}

.ep-smp-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.ep-smp-bar-wrap {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  flex: 1;
  width: 100%;
}

.ep-smp-bar {
  flex: 1;
  border-radius: 3px 3px 0 0;
  min-height: 4px;
  position: relative;
  transition: height 0.3s;

  &--land { background: $accent; }
  &--jeju { background: #7c3aed; }

  &__tip {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 8px;
    font-weight: 700;
    color: $text-muted;
    white-space: nowrap;
    display: none;
  }

  &:hover &__tip { display: block; }

  &__month {
    font-size: 9px;
    font-weight: 600;
    color: $text-muted;
    margin-top: 4px;
  }
}

.ep-smp-legend {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 6px;

  &__item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 600;
    color: $text-secondary;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 2px;

    &--land { background: $accent; }
    &--jeju { background: #7c3aed; }
  }
}

// ── 전력거래 현황 ──
.ep-trade-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (max-width: 640px) { grid-template-columns: 1fr; }
}

.ep-trade-card {
  background: $bg;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 12px;

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
  }

  &__title {
    font-size: 12px;
    font-weight: 800;
    color: $text-primary;
  }

  &__total {
    font-size: 14px;
    font-weight: 900;
    color: $accent;
    font-variant-numeric: tabular-nums;

    small {
      font-size: 10px;
      font-weight: 600;
      color: $text-muted;
    }
  }
}

.ep-mix-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;

  &__seg {
    height: 100%;
    transition: width 0.3s;
  }
}

.ep-trade-rows {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ep-trade-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__source {
    font-weight: 600;
    color: $text-secondary;
    min-width: 36px;
  }

  &__val {
    font-weight: 700;
    color: $text-primary;
    font-variant-numeric: tabular-nums;
    margin-left: auto;
  }

  &__share {
    font-weight: 600;
    color: $text-muted;
    font-variant-numeric: tabular-nums;
    min-width: 32px;
    text-align: right;
  }
}

// ── 전력수급 현황 ──
.ep-supply-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;

  @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
}

.ep-supply-card {
  background: $bg;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 10px;
  text-align: center;

  &--accent {
    background: $accent-light;
    border-color: rgba(79, 106, 245, 0.2);
  }

  &__label {
    display: block;
    font-size: 9.5px;
    font-weight: 700;
    color: $text-muted;
    margin-bottom: 3px;
  }

  &__value {
    font-size: 14px;
    font-weight: 900;
    color: $text-primary;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;

    small {
      font-size: 10px;
      font-weight: 600;
      color: $text-muted;
    }
  }

  &--accent &__value { color: $accent; }

  &__sub {
    display: block;
    font-size: 10px;
    font-weight: 500;
    color: $text-muted;
    margin-top: 2px;
  }
}

// ── 연료비단가 ──
.ep-fuel-table {
  border: 1px solid $border;
  border-radius: 8px;
  overflow: hidden;
}

.ep-fuel-row {
  display: flex;
  border-bottom: 1px solid $border;

  &:last-child { border-bottom: none; }
  &:nth-child(even) { background: $bg; }

  &--head {
    background: $bg;
    .ep-fuel-cell {
      font-size: 9.5px;
      font-weight: 700;
      color: $text-muted;
      text-transform: uppercase;
    }
  }
}

.ep-fuel-cell {
  padding: 7px 10px;
  font-size: 11.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;

  &--name { flex: 0 0 72px; color: $text-secondary; }
  &--price { flex: 1; text-align: right; }
  &--bold { font-weight: 800; color: $text-primary; }
  &--unit { flex: 0 0 68px; color: $text-muted; text-align: right; font-size: 10px; }
  &--chg { flex: 0 0 80px; text-align: right; font-weight: 700; }
  &--up { color: #dc2626; }
  &--down { color: #2563eb; }
}

// ── REC 거래 현황 ──
.ep-rec-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;

  @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
}

.ep-rec-card {
  background: $bg;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 10px;
  text-align: center;

  &__label {
    display: block;
    font-size: 9.5px;
    font-weight: 700;
    color: $text-muted;
    margin-bottom: 3px;
  }

  &__value {
    font-size: 13px;
    font-weight: 900;
    color: $text-primary;
    font-variant-numeric: tabular-nums;

    &--accent { color: $accent; }

    small {
      font-size: 9px;
      font-weight: 600;
      color: $text-muted;
    }
  }
}

</style>

<!-- Global (unscoped) styles for map markers -->
<style lang="scss">
.map-marker {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  transition: transform 0.2s;

  &:hover { transform: scale(1.3); }
  &--active { transform: scale(1.4); }

  &__dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2.5px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  &[data-type="solar"] .map-marker__dot { background: #f59e0b; }
  &[data-type="wind"] .map-marker__dot { background: #06b6d4; }
  &[data-type="battery"] .map-marker__dot { background: #22c55e; }
}
</style>
