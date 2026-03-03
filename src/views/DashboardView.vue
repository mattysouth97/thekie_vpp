<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import VueApexCharts from "vue3-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketStore } from "@/stores/market-store";
import { IcoBuilding, IcoWallet, IcoCoin, IcoLightning, IcoChevronDown } from "@/components/icons";

const authStore = useAuthStore();
const marketStore = useMarketStore();
const isCompanyView = computed(() => authStore.viewMode === "company");

// ── Interfaces ──────────────────────────────────────────────────────────────

interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnRate: number;
  plantCount: number;
}

interface MonthlySettlement {
  month: string;
  label: string;
  smpIncome: number;
  recIncome: number;
  drIncome: number;
  forecastIncentive: number;
  total: number;
  status: "completed" | "in_progress" | "pending";
}

interface GenerationSummary {
  plantName: string;
  type: "solar" | "wind" | "fuelcell" | "floating";
  typeLabel: string;
  monthlyMwh: number;
  capacityKw: number;
  currentKw: number;
  effPct: number;
  status: "active" | "maintenance" | "offline";
}

interface RevenueBreakdown {
  category: string;
  amount: number;
  color: string;
  pct: number;
}

interface RecentTransaction {
  id: string;
  date: string;
  type: string;
  typeColor: string;
  description: string;
  amount: number;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const portfolio = ref<PortfolioSummary>({
  totalInvested: 124_000_000,
  currentValue: 131_890_932,
  totalReturn: 7_890_932,
  returnRate: 6.37,
  plantCount: 5,
});

const settlements = ref<MonthlySettlement[]>([
  { month: "2026-02", label: "2월", smpIncome: 312_400, recIncome: 185_600, drIncome: 42_000, forecastIncentive: 8_200, total: 548_200, status: "in_progress" },
  { month: "2026-01", label: "1월", smpIncome: 298_100, recIncome: 201_300, drIncome: 38_500, forecastIncentive: 9_400, total: 547_300, status: "completed" },
  { month: "2025-12", label: "12월", smpIncome: 341_200, recIncome: 178_900, drIncome: 51_200, forecastIncentive: 7_800, total: 579_100, status: "completed" },
  { month: "2025-11", label: "11월", smpIncome: 275_800, recIncome: 195_400, drIncome: 35_100, forecastIncentive: 10_200, total: 516_500, status: "completed" },
  { month: "2025-10", label: "10월", smpIncome: 310_600, recIncome: 210_800, drIncome: 44_300, forecastIncentive: 8_900, total: 574_600, status: "completed" },
  { month: "2025-09", label: "9월", smpIncome: 289_400, recIncome: 168_200, drIncome: 39_800, forecastIncentive: 7_100, total: 504_500, status: "completed" },
]);

const generation = ref<GenerationSummary[]>([
  { plantName: "용인 푸르지오", type: "solar", typeLabel: "태양광", monthlyMwh: 32.4, capacityKw: 250, currentKw: 193.8, effPct: 77.5, status: "active" },
  { plantName: "음성 솔라파크", type: "solar", typeLabel: "태양광", monthlyMwh: 198.6, capacityKw: 1500, currentKw: 1248, effPct: 83.2, status: "active" },
  { plantName: "영덕 바람언덕", type: "wind", typeLabel: "풍력", monthlyMwh: 312.0, capacityKw: 4000, currentKw: 3600, effPct: 90.0, status: "maintenance" },
  { plantName: "화성 수소연료전지", type: "fuelcell", typeLabel: "연료전지", monthlyMwh: 86.4, capacityKw: 600, currentKw: 504, effPct: 84.0, status: "active" },
  { plantName: "합천댐 수상태양광", type: "floating", typeLabel: "수상태양광", monthlyMwh: 246.0, capacityKw: 2000, currentKw: 1860, effPct: 93.0, status: "active" },
]);

const revenueBreakdown = ref<RevenueBreakdown[]>([
  { category: "SMP 정산", amount: 1_827_500, color: "#4F6AF5", pct: 52 },
  { category: "REC 수익", amount: 1_140_200, color: "#f59e0b", pct: 32 },
  { category: "DR 수익", amount: 250_900, color: "#22c55e", pct: 7 },
  { category: "예측 인센티브", amount: 51_600, color: "#8b5cf6", pct: 2 },
  { category: "기타", amount: 249_800, color: "#94a3b8", pct: 7 },
]);

const recentTransactions = ref<RecentTransaction[]>([
  { id: "TX-001", date: "2026-02-26", type: "SMP 정산", typeColor: "blue", description: "용인 푸르지오 2월 SMP 정산", amount: 82_400 },
  { id: "TX-002", date: "2026-02-24", type: "REC 거래", typeColor: "amber", description: "음성 솔라파크 REC 현물 매도", amount: 142_580 },
  { id: "TX-003", date: "2026-02-22", type: "DR 정산", typeColor: "green", description: "수요반응 이행 정산금 입금", amount: 42_000 },
  { id: "TX-004", date: "2026-02-20", type: "SMP 정산", typeColor: "blue", description: "합천댐 SMP 정산금", amount: 96_200 },
  { id: "TX-005", date: "2026-02-18", type: "배당금", typeColor: "violet", description: "화성 연료전지 배당 입금", amount: 35_000 },
]);

// ── Company-level mock data ──────────────────────────────────────────────────

const companyPortfolio: PortfolioSummary = {
  totalInvested: 2_480_000_000,
  currentValue: 2_631_440_000,
  totalReturn: 151_440_000,
  returnRate: 6.1,
  plantCount: 12,
};

const companySettlements: MonthlySettlement[] = [
  { month: "2026-02", label: "2월", smpIncome: 6_248_000, recIncome: 3_712_000, drIncome: 840_000, forecastIncentive: 164_000, total: 10_964_000, status: "in_progress" },
  { month: "2026-01", label: "1월", smpIncome: 5_962_000, recIncome: 4_026_000, drIncome: 770_000, forecastIncentive: 188_000, total: 10_946_000, status: "completed" },
  { month: "2025-12", label: "12월", smpIncome: 6_824_000, recIncome: 3_578_000, drIncome: 1_024_000, forecastIncentive: 156_000, total: 11_582_000, status: "completed" },
  { month: "2025-11", label: "11월", smpIncome: 5_516_000, recIncome: 3_908_000, drIncome: 702_000, forecastIncentive: 204_000, total: 10_330_000, status: "completed" },
  { month: "2025-10", label: "10월", smpIncome: 6_212_000, recIncome: 4_216_000, drIncome: 886_000, forecastIncentive: 178_000, total: 11_492_000, status: "completed" },
  { month: "2025-09", label: "9월", smpIncome: 5_788_000, recIncome: 3_364_000, drIncome: 796_000, forecastIncentive: 142_000, total: 10_090_000, status: "completed" },
];

const companyGeneration: GenerationSummary[] = [
  { plantName: "용인 푸르지오", type: "solar", typeLabel: "태양광", monthlyMwh: 32.4, capacityKw: 250, currentKw: 193.8, effPct: 77.5, status: "active" },
  { plantName: "음성 솔라파크", type: "solar", typeLabel: "태양광", monthlyMwh: 198.6, capacityKw: 1500, currentKw: 1248, effPct: 83.2, status: "active" },
  { plantName: "영덕 바람언덕", type: "wind", typeLabel: "풍력", monthlyMwh: 312.0, capacityKw: 4000, currentKw: 3600, effPct: 90.0, status: "maintenance" },
  { plantName: "화성 수소연료전지", type: "fuelcell", typeLabel: "연료전지", monthlyMwh: 86.4, capacityKw: 600, currentKw: 504, effPct: 84.0, status: "active" },
  { plantName: "합천댐 수상태양광", type: "floating", typeLabel: "수상태양광", monthlyMwh: 246.0, capacityKw: 2000, currentKw: 1860, effPct: 93.0, status: "active" },
  { plantName: "세종 그린에너지", type: "solar", typeLabel: "태양광", monthlyMwh: 156.2, capacityKw: 1200, currentKw: 984, effPct: 82.0, status: "active" },
  { plantName: "제주 한림풍력", type: "wind", typeLabel: "풍력", monthlyMwh: 428.0, capacityKw: 5000, currentKw: 4200, effPct: 84.0, status: "active" },
  { plantName: "포항 수소단지", type: "fuelcell", typeLabel: "연료전지", monthlyMwh: 124.8, capacityKw: 900, currentKw: 756, effPct: 84.0, status: "active" },
  { plantName: "당진 태양광", type: "solar", typeLabel: "태양광", monthlyMwh: 284.4, capacityKw: 2200, currentKw: 1914, effPct: 87.0, status: "active" },
  { plantName: "김천 솔라힐", type: "solar", typeLabel: "태양광", monthlyMwh: 98.4, capacityKw: 800, currentKw: 0, effPct: 0, status: "offline" },
  { plantName: "완도 해상풍력", type: "wind", typeLabel: "풍력", monthlyMwh: 380.0, capacityKw: 4500, currentKw: 3870, effPct: 86.0, status: "active" },
  { plantName: "충주 수상태양광", type: "floating", typeLabel: "수상태양광", monthlyMwh: 178.0, capacityKw: 1400, currentKw: 1260, effPct: 90.0, status: "active" },
];

const companyRevenue: RevenueBreakdown[] = [
  { category: "SMP 정산", amount: 36_550_000, color: "#4F6AF5", pct: 52 },
  { category: "REC 수익", amount: 22_804_000, color: "#f59e0b", pct: 32 },
  { category: "DR 수익", amount: 5_018_000, color: "#22c55e", pct: 7 },
  { category: "예측 인센티브", amount: 1_032_000, color: "#8b5cf6", pct: 2 },
  { category: "기타", amount: 4_996_000, color: "#94a3b8", pct: 7 },
];

const companyTransactions: RecentTransaction[] = [
  { id: "CTX-001", date: "2026-02-26", type: "SMP 정산", typeColor: "blue", description: "법인 전체 2월 SMP 일괄 정산", amount: 1_648_000 },
  { id: "CTX-002", date: "2026-02-24", type: "REC 거래", typeColor: "amber", description: "REC 대량 매도 (12개소)", amount: 2_851_600 },
  { id: "CTX-003", date: "2026-02-22", type: "DR 정산", typeColor: "green", description: "수요반응 법인 일괄 이행 정산", amount: 840_000 },
  { id: "CTX-004", date: "2026-02-20", type: "SMP 정산", typeColor: "blue", description: "제주 한림풍력 SMP 정산", amount: 1_924_000 },
  { id: "CTX-005", date: "2026-02-18", type: "배당금", typeColor: "violet", description: "법인 투자자 월간 배당 지급", amount: 700_000 },
];

// ── Computed (switches personal ↔ company) ──────────────────────────────────

const activePortfolio = computed(() => isCompanyView.value ? companyPortfolio : portfolio.value);
const activeSettlements = computed(() => isCompanyView.value ? companySettlements : settlements.value);
const activeGeneration = computed(() => isCompanyView.value ? companyGeneration : generation.value);
const activeRevenue = computed(() => isCompanyView.value ? companyRevenue : revenueBreakdown.value);
const activeTransactions = computed(() => isCompanyView.value ? companyTransactions : recentTransactions.value);

const currentSettlement = computed(() => activeSettlements.value[0]);
const settlementProgressPct = computed(() => isCompanyView.value ? 72 : 68);

// ── 실시간 시장가 기반 당월 정산액 재계산 ─────────────────────────────────────
onMounted(() => { marketStore.startPolling(); });

/** 시장 데이터가 갱신되면 당월(in_progress) 정산을 실시간 SMP/REC로 재계산 */
watch(() => marketStore.snapshot, (snap) => {
  if (!snap) return;
  const smpRate = snap.smp.landAvg;     // 원/kWh
  const recRate = snap.rec.avgPrice;    // 원/REC

  // 개인 — 당월 총 발전량으로 SMP/REC 수입 재산출
  const totalMwh = generation.value
    .filter(g => g.status === "active")
    .reduce((s, g) => s + g.monthlyMwh, 0);
  const totalKwh = totalMwh * 1000;

  const personalSmp = Math.round(totalKwh * smpRate / totalMwh * (generation.value[0]?.monthlyMwh ?? 1) / 1000 * 1000);
  const personalRec = Math.round(totalMwh * recRate / 1000);

  // 당월(in_progress)만 업데이트
  const cur = settlements.value.find(s => s.status === "in_progress");
  if (cur) {
    cur.smpIncome = Math.round(totalKwh * smpRate / 1000);
    cur.recIncome = Math.round(totalMwh * recRate / 1000);
    cur.total = cur.smpIncome + cur.recIncome + cur.drIncome + cur.forecastIncentive;
  }

  // 회사 — 동일 로직 (스케일 x20)
  const compCur = companySettlements.find(s => s.status === "in_progress");
  if (compCur) {
    const compMwh = companyGeneration
      .filter(g => g.status === "active")
      .reduce((s, g) => s + g.monthlyMwh, 0);
    compCur.smpIncome = Math.round(compMwh * 1000 * smpRate / 1000);
    compCur.recIncome = Math.round(compMwh * recRate / 1000);
    compCur.total = compCur.smpIncome + compCur.recIncome + compCur.drIncome + compCur.forecastIncentive;
  }

  // 수익 구성 비율 업데이트
  if (cur) {
    const total = cur.total + (revenueBreakdown.value.find(r => r.category === "기타")?.amount ?? 0);
    revenueBreakdown.value[0].amount = cur.smpIncome;
    revenueBreakdown.value[0].pct = Math.round(cur.smpIncome / total * 100);
    revenueBreakdown.value[1].amount = cur.recIncome;
    revenueBreakdown.value[1].pct = Math.round(cur.recIncome / total * 100);
  }
}, { immediate: true });

const totalGenerationMwh = computed(() =>
  activeGeneration.value.reduce((sum, g) => sum + g.monthlyMwh, 0),
);

const showAllPlants = ref(false);

const sortedGeneration = computed(() =>
  [...activeGeneration.value].sort((a, b) => b.monthlyMwh - a.monthlyMwh),
);

const topPlants = computed(() => sortedGeneration.value.slice(0, 3));

// ── ApexCharts ──────────────────────────────────────────────────────────────

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: "area",
    height: 280,
    fontFamily: "Inter, sans-serif",
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: ["#4F6AF5", "#f59e0b", "#22c55e"],
  stroke: { curve: "smooth", width: 2 },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.3,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  xaxis: {
    categories: activeSettlements.value.map((s) => s.label).reverse(),
    labels: { style: { fontSize: "11px", colors: "#6B7280" } },
    axisBorder: { color: "#E8EAED" },
    axisTicks: { color: "#E8EAED" },
  },
  yaxis: {
    labels: {
      style: { fontSize: "11px", colors: "#6B7280" },
      formatter: (val: number) => `${(val / 10000).toFixed(0)}만`,
    },
  },
  tooltip: {
    y: { formatter: (val: number) => `₩${val.toLocaleString()}` },
  },
  legend: {
    position: "top",
    horizontalAlign: "right",
    fontSize: "11px",
    fontWeight: 600,
    labels: { colors: "#6B7280" },
    markers: { size: 6, shape: "circle" as const },
  },
  grid: {
    borderColor: "#E8EAED",
    strokeDashArray: 3,
  },
  dataLabels: { enabled: false },
}));

const chartSeries = computed(() => [
  { name: "SMP 수익", data: activeSettlements.value.map((s) => s.smpIncome).reverse() },
  { name: "REC 수익", data: activeSettlements.value.map((s) => s.recIncome).reverse() },
  { name: "DR 수익", data: activeSettlements.value.map((s) => s.drIncome).reverse() },
]);

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatWon(amount: number): string {
  return `₩${amount.toLocaleString()}`;
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    active: "가동중",
    maintenance: "점검중",
    offline: "오프라인",
    completed: "완료",
    in_progress: "진행중",
    pending: "예정",
  };
  return map[s] ?? s;
}

function statusClass(s: string): string {
  const map: Record<string, string> = {
    active: "live",
    maintenance: "warn",
    offline: "off",
    completed: "completed",
    in_progress: "progress",
    pending: "pending",
  };
  return map[s] ?? "";
}
</script>

<template>
  <div class="fin-dash">

    <!-- Company mode banner -->
    <div v-if="isCompanyView" class="fin-dash__company-banner">
      <IcoBuilding :size="16" :strokeWidth="2" />
      <span>{{ authStore.linkedCompany?.name }} · 법인 전체 현황</span>
    </div>

    <!-- ── Section 1: Portfolio KPI Cards ── -->
    <div class="fin-dash__kpis">
      <div class="fin-dash__kpi">
        <div class="fin-dash__kpi-label">총 투자금</div>
        <div class="fin-dash__kpi-value">{{ formatWon(activePortfolio.totalInvested) }}</div>
        <div class="fin-dash__kpi-sub">{{ activePortfolio.plantCount }}개 발전소</div>
      </div>
      <div class="fin-dash__kpi fin-dash__kpi--primary">
        <div class="fin-dash__kpi-label">현재 평가액</div>
        <div class="fin-dash__kpi-value fin-dash__kpi-value--accent">{{ formatWon(activePortfolio.currentValue) }}</div>
        <div class="fin-dash__kpi-badge fin-dash__kpi-badge--up">+{{ activePortfolio.returnRate }}%</div>
      </div>
      <div class="fin-dash__kpi">
        <div class="fin-dash__kpi-label">누적 수익</div>
        <div class="fin-dash__kpi-value fin-dash__kpi-value--green">{{ formatWon(activePortfolio.totalReturn) }}</div>
        <div class="fin-dash__kpi-sub">세후 기준</div>
      </div>
    </div>

    <!-- ── Section 2: Revenue Trend Chart ── -->
    <div class="fin-dash__chart-card">
      <div class="fin-dash__card-head">
        <span class="fin-dash__card-title">월별 수익 추이</span>
        <span class="fin-dash__card-sub">최근 6개월</span>
      </div>
      <VueApexCharts
        type="area"
        height="280"
        :options="chartOptions"
        :series="chartSeries"
      />
    </div>

    <!-- ── Section 3: Revenue Breakdown (full width) ── -->
    <div class="fin-dash__row fin-dash__row--single">
      <div class="fin-dash__card">
        <div class="fin-dash__card-head">
          <span class="fin-dash__card-title">수익 구성</span>
          <span class="fin-dash__card-sub">누적 기준</span>
        </div>
        <div class="fin-dash__seg-bar">
          <span
            v-for="rev in activeRevenue"
            :key="rev.category"
            class="fin-dash__seg"
            :style="{ width: rev.pct + '%', background: rev.color }"
          ></span>
        </div>
        <div class="fin-dash__rev-list">
          <div v-for="rev in activeRevenue" :key="rev.category" class="fin-dash__rev-row">
            <span class="fin-dash__rev-dot" :style="{ background: rev.color }"></span>
            <span class="fin-dash__rev-name">{{ rev.category }}</span>
            <span class="fin-dash__rev-pct">{{ rev.pct }}%</span>
            <span class="fin-dash__rev-amount">{{ formatWon(rev.amount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Section 5: Generation Summary ── -->
    <div class="fin-dash__card">
      <div class="fin-dash__card-head">
        <span class="fin-dash__card-title">발전 현황</span>
        <span class="fin-dash__card-sub">월간 총 {{ totalGenerationMwh.toFixed(1) }} MWh</span>
      </div>
      <div class="fin-dash__gen-list">
        <div class="fin-dash__gen-row fin-dash__gen-row--head">
          <span>발전소</span>
          <span>유형</span>
          <span>월간 발전량</span>
          <span>현재 출력</span>
          <span>효율</span>
          <span>상태</span>
        </div>
        <div v-for="g in (showAllPlants ? sortedGeneration : topPlants)" :key="g.plantName" class="fin-dash__gen-row">
          <span class="fin-dash__gen-name">{{ g.plantName }}</span>
          <span class="fin-dash__gen-type">{{ g.typeLabel }}</span>
          <span class="fin-dash__gen-val">{{ g.monthlyMwh.toFixed(1) }} MWh</span>
          <span class="fin-dash__gen-val">{{ g.currentKw.toLocaleString() }} / {{ g.capacityKw.toLocaleString() }} kW</span>
          <span class="fin-dash__gen-eff">{{ g.effPct }}%</span>
          <span class="fin-dash__gen-status" :class="`fin-dash__gen-status--${statusClass(g.status)}`">{{ statusLabel(g.status) }}</span>
        </div>
      </div>
      <button v-if="sortedGeneration.length > 3" class="fin-dash__gen-toggle" @click="showAllPlants = !showAllPlants">
        <span>{{ showAllPlants ? '접기' : `모든 발전소 보기 (${sortedGeneration.length}개)` }}</span>
        <IcoChevronDown :size="14" :strokeWidth="2.5" :class="{ 'fin-dash__gen-toggle-icon--open': showAllPlants }" />
      </button>
    </div>

    <!-- ── Section 6: Recent Transactions ── -->
    <div class="fin-dash__card">
      <div class="fin-dash__card-head">
        <span class="fin-dash__card-title">최근 거래 내역</span>
      </div>
      <div class="fin-dash__tx-list">
        <div v-for="tx in activeTransactions" :key="tx.id" class="fin-dash__tx-row">
          <span class="fin-dash__tx-badge" :class="`fin-dash__tx-badge--${tx.typeColor}`">{{ tx.type }}</span>
          <div class="fin-dash__tx-info">
            <span class="fin-dash__tx-desc">{{ tx.description }}</span>
            <span class="fin-dash__tx-date">{{ tx.date }}</span>
          </div>
          <span class="fin-dash__tx-amount">+{{ formatWon(tx.amount) }}</span>
        </div>
      </div>
    </div>

    <!-- ── Section 7: Quick Actions ── -->
    <div class="fin-dash__actions">
      <router-link to="/power-status" class="fin-dash__action">
        <IcoLightning :size="20" :strokeWidth="2" />
        <span class="fin-dash__action-label">전력 현황</span>
        <span class="fin-dash__action-sub">시설 모니터링</span>
      </router-link>
    </div>

  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables/spacing" as sp;

// ── tokens ──────────────────────────────────────────────────────────────────
$accent:         #4F6AF5;
$surface:        #ffffff;
$border:         #E8EAED;
$text-primary:   #111827;
$text-secondary: #6B7280;
$text-muted:     #9CA3AF;
$green:          #16a34a;
$green-bg:       #dcfce7;
$red:            #dc2626;
$yellow:         #d97706;
$yellow-bg:      #fef3c7;
$shadow:         0 2px 12px rgba(0, 0, 0, 0.06);

.fin-dash {
  display: flex;
  flex-direction: column;
  gap: sp.$space-4;
  font-family: "Inter", sans-serif;
}

// ── Company mode banner ─────────────────────────────────────────────────────
.fin-dash__company-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #4338ca;

  svg { flex-shrink: 0; }
}

// ── KPI cards ───────────────────────────────────────────────────────────────
.fin-dash__kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: sp.$space-3;
}

.fin-dash__kpi {
  background: $surface;
  border: 1px solid $border;
  border-radius: 8px;
  padding: sp.$space-3 sp.$space-3 sp.$space-2;
  box-shadow: $shadow;

  &--primary {
    border-color: rgba($accent, 0.35);
    box-shadow: $shadow, 0 0 0 1px rgba($accent, 0.08);
  }
}

.fin-dash__kpi-label {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $text-muted;
  margin-bottom: 4px;
}

.fin-dash__kpi-value {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-bottom: 2px;
  font-variant-numeric: tabular-nums;

  &--accent { color: $accent; }
  &--green  { color: $green; }
}

.fin-dash__kpi-sub {
  font-size: 11px;
  color: $text-muted;
}

.fin-dash__kpi-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;

  &--up { background: $green-bg; color: $green; }
}

.fin-dash__kpi-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.fin-dash__kpi-bar-track {
  flex: 1;
  height: 5px;
  background: $border;
  border-radius: 3px;
  overflow: hidden;
}

.fin-dash__kpi-bar-fill {
  height: 100%;
  background: $accent;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.fin-dash__kpi-bar-pct {
  font-size: 11px;
  font-weight: 600;
  color: $accent;
  white-space: nowrap;
}

// ── shared card ─────────────────────────────────────────────────────────────
.fin-dash__card,
.fin-dash__chart-card {
  background: $surface;
  border: 1px solid $border;
  border-radius: 8px;
  padding: sp.$space-3 sp.$space-4;
  box-shadow: $shadow;
}

.fin-dash__card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: sp.$space-3;
}

.fin-dash__card-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $text-muted;
}

.fin-dash__card-sub {
  font-size: 10px;
  color: $text-muted;
}

// ── two-column row ──────────────────────────────────────────────────────────
.fin-dash__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: sp.$space-3;

  &--single {
    grid-template-columns: 1fr;
  }
}

// ── revenue breakdown ───────────────────────────────────────────────────────
.fin-dash__seg-bar {
  display: flex;
  height: 5px;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: sp.$space-2;
}

.fin-dash__seg {
  height: 100%;
}

.fin-dash__rev-list {
  display: flex;
  flex-direction: column;
}

.fin-dash__rev-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  border-bottom: 1px solid $border;
  font-size: 12px;

  &:last-child { border-bottom: none; }
}

.fin-dash__rev-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.fin-dash__rev-name {
  flex: 1;
  color: $text-primary;
  font-weight: 500;
}

.fin-dash__rev-pct {
  font-weight: 600;
  color: $text-secondary;
  width: 36px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.fin-dash__rev-amount {
  font-weight: 700;
  color: $text-primary;
  font-variant-numeric: tabular-nums;
  min-width: 100px;
  text-align: right;
}

// ── generation table ────────────────────────────────────────────────────────
.fin-dash__gen-list {
  display: flex;
  flex-direction: column;
}

.fin-dash__gen-row {
  display: grid;
  grid-template-columns: 1.5fr 0.8fr 1fr 1.5fr 0.6fr 0.7fr;
  gap: 8px;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid $border;
  font-size: 12px;

  &--head {
    font-size: 10px;
    font-weight: 600;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-bottom: 6px;
  }

  &:last-child { border-bottom: none; }
}

.fin-dash__gen-name {
  font-weight: 600;
  color: $text-primary;
}

.fin-dash__gen-type {
  font-size: 11px;
  color: $text-secondary;
}

.fin-dash__gen-val {
  font-variant-numeric: tabular-nums;
  color: $text-secondary;
  text-align: right;
}

.fin-dash__gen-eff {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: $text-primary;
}

.fin-dash__gen-status {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;
  text-align: center;

  &--live { background: $green-bg; color: $green; }
  &--warn { background: $yellow-bg; color: $yellow; }
  &--off  { background: #fee2e2; color: $red; }
}

.fin-dash__gen-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px 0;
  margin-top: 4px;
  border: none;
  border-top: 1px solid $border;
  background: none;
  color: $accent;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s;

  &:hover { color: #3a55d4; }

  svg {
    transition: transform 0.2s;
  }
}

.fin-dash__gen-toggle-icon--open {
  transform: rotate(180deg);
}

// ── transactions ────────────────────────────────────────────────────────────
.fin-dash__tx-list {
  display: flex;
  flex-direction: column;
}

.fin-dash__tx-row {
  display: flex;
  align-items: center;
  gap: sp.$space-2;
  padding: 6px 0;
  border-bottom: 1px solid $border;

  &:last-child { border-bottom: none; }
}

.fin-dash__tx-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 5px;
  flex-shrink: 0;
  letter-spacing: 0.04em;

  &--blue   { background: #dbeafe; color: #2563eb; }
  &--amber  { background: #fef3c7; color: #d97706; }
  &--green  { background: $green-bg; color: $green; }
  &--violet { background: #ede9fe; color: #7c3aed; }
}

.fin-dash__tx-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fin-dash__tx-desc {
  font-size: 12px;
  font-weight: 500;
  color: $text-primary;
}

.fin-dash__tx-date {
  font-size: 10px;
  color: $text-muted;
}

.fin-dash__tx-amount {
  font-size: 13px;
  font-weight: 700;
  color: $green;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

// ── quick actions ───────────────────────────────────────────────────────────
.fin-dash__actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: sp.$space-3;
}

.fin-dash__action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: sp.$space-1;
  padding: sp.$space-3;
  background: $surface;
  border: 1px solid $border;
  border-radius: 8px;
  text-decoration: none;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
  cursor: pointer;
  color: $text-secondary;

  &:hover {
    border-color: $accent;
    box-shadow: 0 0 0 3px rgba(79, 106, 245, 0.1);
    transform: translateY(-1px);
    color: $accent;
  }
}

.fin-dash__action-label {
  font-size: 12px;
  font-weight: 600;
  color: $text-primary;
}

.fin-dash__action-sub {
  font-size: 10px;
  color: $text-muted;
}

// ── responsive ──────────────────────────────────────────────────────────────
@media (max-width: 992px) {
  .fin-dash__kpis {
    grid-template-columns: 1fr;
  }
  .fin-dash__row {
    grid-template-columns: 1fr;
  }
  .fin-dash__actions {
    grid-template-columns: 1fr;
  }
}
</style>
