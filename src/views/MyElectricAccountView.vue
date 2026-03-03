<script setup lang="ts">
import { ref, computed } from "vue";
import { IcoStar } from "@/components/icons";

const carouselRef = ref<HTMLElement | null>(null);

function scrollCarousel(dir: "prev" | "next") {
  const el = carouselRef.value;
  if (!el) return;
  const cardWidth = el.querySelector(".pp-card")?.clientWidth ?? 400;
  const gap = 24;
  el.scrollBy({ left: dir === "next" ? cardWidth + gap : -(cardWidth + gap), behavior: "smooth" });
}

interface ProfitEntry {
  label: string;
  amount: number; // 만원
}

interface PowerPlantCard {
  id: string;
  typeTag: string;
  liveBadgeStyle: "green" | "blue" | "pink" | "orange";
  title: string;
  subtitle: string;
  pillClass: string;
  pillText: string;
  capacity: number;
  capacityUnit: string;
  changeDir: "up" | "down" | "neutral";
  changeText: string;
  changePct: string;
  currentKw: number;
  capacityKw: number;
  effPct: number;
  effClass: "high" | "mid" | "low";
  pctBadgeClass: "high" | "mid" | "low";
  monthlyMwh: string;
  peMultiple: string;
  totalProjectCost: string;
  userInvestment: string;
  annualReturn: string;
  weeklyProfit: ProfitEntry[];
  monthlyProfit: ProfitEntry[];
}

const cards = ref<PowerPlantCard[]>([
  {
    id: "1",
    typeTag: "태양광 · 지붕형",
    liveBadgeStyle: "green",
    title: "용인 푸르지오 발전소",
    subtitle: "지붕형 임대 투자 · APT 단지 · 경기 용인",
    pillClass: "pill-smp-rec",
    pillText: "Type 4 · SMP + REC 현물형",
    capacity: 250,
    capacityUnit: "kW",
    changeDir: "up",
    changeText: "+4.0 kW 발전 상승",
    changePct: "+1.6%",
    currentKw: 193.8,
    capacityKw: 250,
    effPct: 77.5,
    effClass: "mid",
    pctBadgeClass: "mid",
    monthlyMwh: "45.2 MWh",
    peMultiple: "29.1 x",
    totalProjectCost: "4.2억원",
    userInvestment: "300만원",
    annualReturn: "연 8.4%",
    weeklyProfit: [
      { label: "8주", amount: 12 }, { label: "7주", amount: 15 },
      { label: "6주", amount: 11 }, { label: "5주", amount: 18 },
      { label: "4주", amount: 14 }, { label: "3주", amount: 16 },
      { label: "2주", amount: 13 }, { label: "1주", amount: 17 },
    ],
    monthlyProfit: [
      { label: "7월", amount: 48 }, { label: "8월", amount: 52 },
      { label: "9월", amount: 55 }, { label: "10월", amount: 45 },
      { label: "11월", amount: 58 }, { label: "12월", amount: 61 },
      { label: "1월", amount: 54 }, { label: "2월", amount: 63 },
    ],
  },
  {
    id: "2",
    typeTag: "태양광 · 지상형",
    liveBadgeStyle: "green",
    title: "음성 솔라파크 1호",
    subtitle: "민간 소유 발전소 · 충북 음성군",
    pillClass: "pill-fit",
    pillText: "Type 6 · FIT 고정가격계약형",
    capacity: 1500,
    capacityUnit: "kW",
    changeDir: "up",
    changeText: "+22.0 kW 발전 상승",
    changePct: "+1.5%",
    currentKw: 1248,
    capacityKw: 1500,
    effPct: 83.2,
    effClass: "high",
    pctBadgeClass: "high",
    monthlyMwh: "312.8 MWh",
    peMultiple: "18.6 x",
    totalProjectCost: "21억원",
    userInvestment: "1,000만원",
    annualReturn: "연 11.2%",
    weeklyProfit: [
      { label: "8주", amount: 85 }, { label: "7주", amount: 92 },
      { label: "6주", amount: 88 }, { label: "5주", amount: 102 },
      { label: "4주", amount: 95 }, { label: "3주", amount: 98 },
      { label: "2주", amount: 91 }, { label: "1주", amount: 108 },
    ],
    monthlyProfit: [
      { label: "7월", amount: 340 }, { label: "8월", amount: 380 },
      { label: "9월", amount: 395 }, { label: "10월", amount: 310 },
      { label: "11월", amount: 420 }, { label: "12월", amount: 415 },
      { label: "1월", amount: 388 }, { label: "2월", amount: 432 },
    ],
  },
  {
    id: "3",
    typeTag: "풍력 · 육상형",
    liveBadgeStyle: "blue",
    title: "영덕 바람언덕 풍력단지",
    subtitle: "민간 공동 투자 · 경북 영덕군",
    pillClass: "pill-corp-ppa",
    pillText: "Type 7 · 기업PPA (직접계약)",
    capacity: 4200,
    capacityUnit: "kW",
    changeDir: "down",
    changeText: "-48.0 kW 발전 감소",
    changePct: "-1.1%",
    currentKw: 3600,
    capacityKw: 4200,
    effPct: 85.7,
    effClass: "high",
    pctBadgeClass: "high",
    monthlyMwh: "1,080 MWh",
    peMultiple: "12.4 x",
    totalProjectCost: "58억원",
    userInvestment: "2,000만원",
    annualReturn: "연 13.5%",
    weeklyProfit: [
      { label: "8주", amount: 180 }, { label: "7주", amount: 165 },
      { label: "6주", amount: 172 }, { label: "5주", amount: 155 },
      { label: "4주", amount: 188 }, { label: "3주", amount: 176 },
      { label: "2주", amount: 169 }, { label: "1주", amount: 192 },
    ],
    monthlyProfit: [
      { label: "7월", amount: 725 }, { label: "8월", amount: 680 },
      { label: "9월", amount: 710 }, { label: "10월", amount: 625 },
      { label: "11월", amount: 760 }, { label: "12월", amount: 745 },
      { label: "1월", amount: 695 }, { label: "2월", amount: 780 },
    ],
  },
  {
    id: "4",
    typeTag: "연료전지",
    liveBadgeStyle: "pink",
    title: "화성 수소연료전지 발전소",
    subtitle: "민간 소유 · 경기 화성시",
    pillClass: "pill-community",
    pillText: "Type 11 · 주민참여 · 시민펀드형",
    capacity: 1200,
    capacityUnit: "kW",
    changeDir: "neutral",
    changeText: "+0.0 kW 변동 없음",
    changePct: "0.00%",
    currentKw: 504,
    capacityKw: 1200,
    effPct: 42,
    effClass: "low",
    pctBadgeClass: "low",
    monthlyMwh: "576 MWh",
    peMultiple: "38.7 x",
    totalProjectCost: "35억원",
    userInvestment: "800만원",
    annualReturn: "연 6.8%",
    weeklyProfit: [
      { label: "8주", amount: 38 }, { label: "7주", amount: 42 },
      { label: "6주", amount: 35 }, { label: "5주", amount: 44 },
      { label: "4주", amount: 40 }, { label: "3주", amount: 37 },
      { label: "2주", amount: 41 }, { label: "1주", amount: 46 },
    ],
    monthlyProfit: [
      { label: "7월", amount: 155 }, { label: "8월", amount: 168 },
      { label: "9월", amount: 142 }, { label: "10월", amount: 176 },
      { label: "11월", amount: 161 }, { label: "12월", amount: 148 },
      { label: "1월", amount: 163 }, { label: "2월", amount: 184 },
    ],
  },
  {
    id: "5",
    typeTag: "태양광 · 수상형",
    liveBadgeStyle: "orange",
    title: "합천댐 수상태양광",
    subtitle: "공공부지 임대 투자 · 경남 합천군",
    pillClass: "pill-vpp",
    pillText: "Type 9 · VPP / 중개형",
    capacity: 2000,
    capacityUnit: "kW",
    changeDir: "up",
    changeText: "+31.0 kW 발전 상승",
    changePct: "+1.7%",
    currentKw: 1860,
    capacityKw: 2000,
    effPct: 93,
    effClass: "high",
    pctBadgeClass: "high",
    monthlyMwh: "548.4 MWh",
    peMultiple: "14.2 x",
    totalProjectCost: "28억원",
    userInvestment: "1,500만원",
    annualReturn: "연 12.1%",
    weeklyProfit: [
      { label: "8주", amount: 125 }, { label: "7주", amount: 138 },
      { label: "6주", amount: 142 }, { label: "5주", amount: 115 },
      { label: "4주", amount: 155 }, { label: "3주", amount: 148 },
      { label: "2주", amount: 136 }, { label: "1주", amount: 162 },
    ],
    monthlyProfit: [
      { label: "7월", amount: 498 }, { label: "8월", amount: 542 },
      { label: "9월", amount: 568 }, { label: "10월", amount: 458 },
      { label: "11월", amount: 618 }, { label: "12월", amount: 592 },
      { label: "1월", amount: 544 }, { label: "2월", amount: 645 },
    ],
  },
]);

// ── Portfolio aggregate computations ──────────────────────────────────────────
const totalInvestmentRaw = computed(() => {
  const map: Record<string, number> = {
    "300만원": 300, "1,000만원": 1000, "2,000만원": 2000,
    "800만원": 800, "1,500만원": 1500,
  };
  return cards.value.reduce((s, c) => s + (map[c.userInvestment] ?? 0), 0);
});

const totalInvestmentDisplay = computed(() => {
  const v = totalInvestmentRaw.value;
  return v >= 10000 ? (v / 10000).toFixed(1).replace(/\.0$/, "") + "억원" : v.toLocaleString() + "만원";
});

const aggregateMonthly = computed(() => {
  const months = cards.value[0].monthlyProfit.map((e) => e.label);
  return months.map((label, i) => ({
    label,
    amount: cards.value.reduce((s, c) => s + (c.monthlyProfit[i]?.amount ?? 0), 0),
  }));
});

const cumulativeReturns = computed(() =>
  aggregateMonthly.value.reduce((s, e) => s + e.amount, 0)
);

const weightedAvgReturn = computed(() => {
  const map: Record<string, number> = {
    "300만원": 300, "1,000만원": 1000, "2,000만원": 2000,
    "800만원": 800, "1,500만원": 1500,
  };
  const retMap: Record<string, number> = {
    "연 8.4%": 8.4, "연 11.2%": 11.2, "연 13.5%": 13.5,
    "연 6.8%": 6.8, "연 12.1%": 12.1,
  };
  let wSum = 0, totalW = 0;
  cards.value.forEach((c) => {
    const w = map[c.userInvestment] ?? 0;
    const r = retMap[c.annualReturn] ?? 0;
    wSum += w * r;
    totalW += w;
  });
  return totalW > 0 ? (wSum / totalW).toFixed(1) : "0.0";
});

// SVG area chart helpers
const chartW = 480;
const chartH = 120;
const chartPadX = 0;
const chartPadTop = 10;
const chartPadBot = 0;

const aggMax = computed(() => Math.max(...aggregateMonthly.value.map((e) => e.amount)));

function aggX(i: number): number {
  const count = aggregateMonthly.value.length;
  if (count <= 1) return chartW / 2;
  return chartPadX + (i / (count - 1)) * (chartW - chartPadX * 2);
}

function aggY(amount: number): number {
  const range = chartH - chartPadTop - chartPadBot;
  return chartPadTop + range - (amount / aggMax.value) * range;
}

const areaPath = computed(() => {
  const pts = aggregateMonthly.value;
  if (!pts.length) return "";
  const linePoints = pts.map((e, i) => `${aggX(i)},${aggY(e.amount)}`);
  return `M${linePoints.join(" L")} L${aggX(pts.length - 1)},${chartH} L${aggX(0)},${chartH} Z`;
});

const linePath = computed(() => {
  const pts = aggregateMonthly.value;
  if (!pts.length) return "";
  return "M" + pts.map((e, i) => `${aggX(i)},${aggY(e.amount)}`).join(" L");
});

// Monthly change percentage (last vs previous month)
const monthlyChange = computed(() => {
  const agg = aggregateMonthly.value;
  if (agg.length < 2) return { pct: "0.0", dir: "neutral" as const };
  const last = agg[agg.length - 1].amount;
  const prev = agg[agg.length - 2].amount;
  if (prev === 0) return { pct: "0.0", dir: "neutral" as const };
  const pct = ((last - prev) / prev * 100).toFixed(1);
  return {
    pct: (last >= prev ? "+" : "") + pct + "%",
    dir: last > prev ? "up" as const : last < prev ? "down" as const : "neutral" as const,
  };
});

// Per-site comparison: 이번 달 수익 for bar chart
const siteComparison = computed(() =>
  cards.value.map((c) => {
    const lastMonth = c.monthlyProfit[c.monthlyProfit.length - 1];
    return {
      id: c.id,
      title: c.title,
      amount: lastMonth?.amount ?? 0,
      effPct: c.effPct,
    };
  })
);
const siteComparisonMax = computed(() => {
  const amts = siteComparison.value.map((s) => s.amount);
  return Math.max(1, ...amts);
});
const topEarningSite = computed(() => {
  const list = siteComparison.value;
  if (!list.length) return null;
  return list.reduce((a, b) => (a.amount >= b.amount ? a : b));
});

// Investment activity history
interface ActivityEntry {
  date: string;
  type: "invest" | "dividend" | "reinvest" | "bonus";
  title: string;
  plant: string;
  amount: string;
  amountClass: "positive" | "negative" | "neutral";
}

const investmentHistory = ref<ActivityEntry[]>([
  { date: "2026.02.15", type: "dividend", title: "2월 배당금 입금", plant: "합천댐 수상태양광", amount: "+645만원", amountClass: "positive" },
  { date: "2026.02.10", type: "dividend", title: "2월 배당금 입금", plant: "영덕 바람언덕 풍력단지", amount: "+780만원", amountClass: "positive" },
  { date: "2026.02.05", type: "reinvest", title: "수익 재투자", plant: "음성 솔라파크 1호", amount: "-200만원", amountClass: "negative" },
  { date: "2026.01.28", type: "bonus", title: "VPP 인센티브 지급", plant: "합천댐 수상태양광", amount: "+82만원", amountClass: "positive" },
  { date: "2026.01.15", type: "dividend", title: "1월 배당금 입금", plant: "용인 푸르지오 발전소", amount: "+54만원", amountClass: "positive" },
  { date: "2026.01.10", type: "invest", title: "신규 투자 실행", plant: "합천댐 수상태양광", amount: "-1,500만원", amountClass: "negative" },
  { date: "2025.12.20", type: "dividend", title: "12월 배당금 입금", plant: "음성 솔라파크 1호", amount: "+415만원", amountClass: "positive" },
  { date: "2025.12.15", type: "invest", title: "추가 투자 실행", plant: "영덕 바람언덕 풍력단지", amount: "-500만원", amountClass: "negative" },
]);

function activityIcon(type: ActivityEntry["type"]) {
  switch (type) {
    case "invest": return "↓";
    case "dividend": return "↑";
    case "reinvest": return "↻";
    case "bonus": return "";
  }
}

function activityIconClass(type: ActivityEntry["type"]) {
  switch (type) {
    case "invest": return "activity-icon--invest";
    case "dividend": return "activity-icon--dividend";
    case "reinvest": return "activity-icon--reinvest";
    case "bonus": return "activity-icon--bonus";
  }
}

const selectedCardId = ref<string | null>(null);
const selectedCard = computed(() =>
  selectedCardId.value ? cards.value.find((c) => c.id === selectedCardId.value) ?? null : null
);

const profitTab = ref<"weekly" | "monthly">("monthly");

function selectCard(id: string) {
  if (selectedCardId.value === id) {
    selectedCardId.value = null;
  } else {
    selectedCardId.value = id;
    profitTab.value = "monthly";
  }
}

function changeArrow(dir: "up" | "down" | "neutral") {
  if (dir === "up") return "↗";
  if (dir === "down") return "↘";
  return "→";
}

const activeHistory = computed(() => {
  if (!selectedCard.value) return [];
  return profitTab.value === "weekly"
    ? selectedCard.value.weeklyProfit
    : selectedCard.value.monthlyProfit;
});

const maxProfit = computed(() => {
  const list = activeHistory.value;
  if (!list.length) return 1;
  return Math.max(...list.map((e) => e.amount));
});

const totalProfit = computed(() =>
  activeHistory.value.reduce((s, e) => s + e.amount, 0)
);

function barH(amount: number): string {
  if (!maxProfit.value) return "4px";
  return Math.max(4, Math.round((amount / maxProfit.value) * 64)) + "px";
}
</script>

<template>
  <div class="my-electric">
    <!-- ═══ Financial Performance Dashboard ═══ -->
    <section class="perf">
      <div class="perf__header">
        <div class="my-electric__page-title my-electric__page-title--no-mb">내 투자 포트폴리오</div>
        <span class="perf__date">{{ new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) }} 기준</span>
      </div>

      <!-- KPI cards -->
      <div class="perf__kpis">
        <div class="perf__kpi-card">
          <span class="perf__kpi-label">총 투자 금액</span>
          <span class="perf__kpi-value perf__kpi-value--accent">{{ totalInvestmentDisplay }}</span>
          <span class="perf__kpi-sub">{{ cards.length }}개 발전소 분산투자</span>
        </div>
        <div class="perf__kpi-card">
          <span class="perf__kpi-label">누적 수익</span>
          <span class="perf__kpi-value perf__kpi-value--green">{{ cumulativeReturns.toLocaleString() }}만원</span>
          <span class="perf__kpi-sub perf__kpi-sub--up">
            {{ monthlyChange.pct }} 전월 대비
          </span>
        </div>
        <div class="perf__kpi-card">
          <span class="perf__kpi-label">평균 수익률</span>
          <span class="perf__kpi-value">연 {{ weightedAvgReturn }}%</span>
          <span class="perf__kpi-sub">가중 평균 기준</span>
        </div>
        <div class="perf__kpi-card">
          <span class="perf__kpi-label">이번 달 수익</span>
          <span class="perf__kpi-value perf__kpi-value--green">{{ (aggregateMonthly.length ? aggregateMonthly[aggregateMonthly.length - 1].amount : 0).toLocaleString() }}만원</span>
          <span class="perf__kpi-sub">전체 발전소 합산</span>
        </div>
      </div>

      <!-- Monthly returns area chart -->
      <div class="perf__chart-card">
        <div class="perf__chart-header">
          <span class="perf__chart-title">월별 수익 추이</span>
          <span class="perf__chart-badge" :class="monthlyChange.dir">
            {{ monthlyChange.dir === 'up' ? '↗' : monthlyChange.dir === 'down' ? '↘' : '→' }}
            {{ monthlyChange.pct }}
          </span>
        </div>
        <div class="perf__chart-svg-wrap" v-if="aggregateMonthly.length">
          <svg :viewBox="'0 0 ' + chartW + ' ' + (chartH + 28)" preserveAspectRatio="none" class="perf__chart-svg">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#4F6AF5" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#4F6AF5" stop-opacity="0.02"/>
              </linearGradient>
            </defs>
            <!-- Grid lines -->
            <line v-for="i in 4" :key="'grid'+i"
              :x1="0" :x2="chartW"
              :y1="chartPadTop + ((chartH - chartPadTop - chartPadBot) / 4) * (i - 1)"
              :y2="chartPadTop + ((chartH - chartPadTop - chartPadBot) / 4) * (i - 1)"
              stroke="#f0f1f3" stroke-width="1"
            />
            <!-- Area fill -->
            <path :d="areaPath" fill="url(#areaGrad)" />
            <!-- Line -->
            <path :d="linePath" fill="none" stroke="#4F6AF5" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
            <!-- Dots + labels -->
            <g v-for="(pt, i) in aggregateMonthly" :key="'dot'+i">
              <circle :cx="aggX(i)" :cy="aggY(pt.amount)" r="4" fill="#fff" stroke="#4F6AF5" stroke-width="2" />
              <text :x="aggX(i)" :y="aggY(pt.amount) - 10" text-anchor="middle" class="perf__chart-dot-label">{{ pt.amount.toLocaleString() }}</text>
              <text :x="aggX(i)" :y="chartH + 18" text-anchor="middle" class="perf__chart-x-label">{{ pt.label }}</text>
            </g>
          </svg>
        </div>
        <p v-else class="perf__chart-empty">수익 데이터가 없습니다.</p>
      </div>

      <!-- Per-site comparison: 발전소별 이번 달 수익 -->
      <div class="perf__compare-card">
        <div class="perf__compare-header">
          <span class="perf__chart-title">발전소별 이번 달 수익</span>
          <span v-if="topEarningSite" class="perf__compare-top">1위 {{ topEarningSite.title }}</span>
        </div>
        <div class="perf__compare-bars">
          <div v-for="s in siteComparison" :key="s.id" class="perf__compare-row">
            <span class="perf__compare-label" :title="s.title">{{ s.title }}</span>
            <div class="perf__compare-track">
              <div
                class="perf__compare-fill"
                :style="{ width: (s.amount / siteComparisonMax) * 100 + '%' }"
              ></div>
            </div>
            <span class="perf__compare-val">{{ s.amount.toLocaleString() }}만원</span>
          </div>
        </div>
      </div>

      <!-- Investment activity history -->
      <div class="perf__history-card">
        <div class="perf__history-header">
          <span class="perf__history-title">최근 투자 활동</span>
          <span class="perf__history-count">{{ investmentHistory.length }}건</span>
        </div>
        <div class="perf__history-list">
          <div v-for="(act, idx) in investmentHistory" :key="idx" class="activity-row">
            <div class="activity-icon" :class="activityIconClass(act.type)"><IcoStar v-if="act.type === 'bonus'" :size="14" /><template v-else>{{ activityIcon(act.type) }}</template></div>
            <div class="activity-body">
              <div class="activity-body__top">
                <span class="activity-body__title">{{ act.title }}</span>
                <span class="activity-body__amount" :class="'activity-body__amount--' + act.amountClass">{{ act.amount }}</span>
              </div>
              <div class="activity-body__bottom">
                <span class="activity-body__plant">{{ act.plant }}</span>
                <span class="activity-body__date">{{ act.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="my-electric__section-divider"></div>

    <!-- ═══ Existing: Power plant cards ═══ -->
    <div class="my-electric__page-title">발전소 투자 현황</div>

    <div class="my-electric__carousel-wrap">
      <button class="carousel-arrow carousel-arrow--prev" aria-label="이전" @click="scrollCarousel('prev')">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4L6 9L11 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div ref="carouselRef" class="my-electric__carousel">
        <article
          v-for="c in cards"
          :key="c.id"
          class="pp-card"
          :class="{ 'pp-card--selected': selectedCardId === c.id }"
          role="button"
          tabindex="0"
          @click="selectCard(c.id)"
          @keydown.enter="selectCard(c.id)"
          @keydown.space.prevent="selectCard(c.id)"
        >
          <!-- Top row: type + live badge -->
          <div class="pp-card__top-row">
            <span class="pp-card__type-tag">{{ c.typeTag }}</span>
            <span class="pp-card__live" :class="'pp-card__live--' + c.liveBadgeStyle">
              <span class="pp-card__live-dot"></span>Live
            </span>
          </div>

          <!-- Title -->
          <h3 class="pp-card__title">{{ c.title }}</h3>
          <p class="pp-card__subtitle">{{ c.subtitle }}</p>

          <!-- Contract type pill -->
          <div class="pp-card__pill" :class="c.pillClass">{{ c.pillText }}</div>

          <div class="pp-card__divider"></div>

          <!-- Capacity + change -->
          <div class="pp-card__kpi-row">
            <div class="pp-card__kpi">
              <div class="pp-card__kpi-label">설비용량</div>
              <div class="pp-card__kpi-value">{{ c.capacity.toLocaleString() }}<span class="pp-card__kpi-unit">{{ c.capacityUnit }}</span></div>
            </div>
            <div class="pp-card__kpi">
              <div class="pp-card__kpi-label">발전 출력</div>
              <div class="pp-card__kpi-value">{{ c.currentKw.toLocaleString(undefined, { maximumFractionDigits: 1 }) }}<span class="pp-card__kpi-unit">kW</span></div>
            </div>
            <div class="pp-card__kpi">
              <div class="pp-card__kpi-label">월 발전량</div>
              <div class="pp-card__kpi-value pp-card__kpi-value--sm">{{ c.monthlyMwh }}</div>
            </div>
          </div>

          <!-- Efficiency bar -->
          <div class="pp-card__gauge-track">
            <div class="pp-card__gauge-fill" :class="'eff-' + c.effClass" :style="{ width: c.effPct + '%' }"></div>
          </div>
          <div class="pp-card__gauge-foot">
            <span class="pp-card__gauge-foot-label">효율</span>
            <span class="pp-card__gauge-pct" :class="'pct-' + c.pctBadgeClass">{{ c.effPct }}%</span>
            <span class="pp-card__price-change" :class="c.changeDir">
              {{ changeArrow(c.changeDir) }} {{ c.changePct }}
            </span>
          </div>
        </article>
      </div>

      <button class="carousel-arrow carousel-arrow--next" aria-label="다음" @click="scrollCarousel('next')">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 4L12 9L7 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- 상세: 선택한 카드 아래 공간에 표시 -->
    <section v-if="selectedCard" class="my-electric__detail">
      <h4 class="my-electric__detail-title">발전소 상세</h4>
      <div class="my-electric__detail-card">
        <!-- Header -->
        <div class="pp-card__top-row pp-card__top-row--mb">
          <span class="pp-card__type-tag">{{ selectedCard.typeTag }}</span>
          <span class="pp-card__live" :class="'pp-card__live--' + selectedCard.liveBadgeStyle">
            <span class="pp-card__live-dot"></span>Live
          </span>
        </div>

        <h3 class="pp-card__title pp-card__title--detail">{{ selectedCard.title }}</h3>
        <p class="pp-card__subtitle">{{ selectedCard.subtitle }}</p>

        <div class="pp-card__pill" :class="selectedCard.pillClass">{{ selectedCard.pillText }}</div>

        <!-- Investment info row -->
        <div class="detail__invest-row">
          <div class="detail__invest-item">
            <span class="detail__invest-label">총 사업비</span>
            <span class="detail__invest-value">{{ selectedCard.totalProjectCost }}</span>
          </div>
          <div class="detail__invest-divider"></div>
          <div class="detail__invest-item">
            <span class="detail__invest-label">내 투자 금액</span>
            <span class="detail__invest-value detail__invest-value--accent">{{ selectedCard.userInvestment }}</span>
          </div>
          <div class="detail__invest-divider"></div>
          <div class="detail__invest-item">
            <span class="detail__invest-label">수익률</span>
            <span class="detail__invest-value detail__invest-value--green">{{ selectedCard.annualReturn }}</span>
          </div>
        </div>

        <div class="pp-card__divider"></div>

        <div class="pp-card__kpi-row">
          <div class="pp-card__kpi">
            <div class="pp-card__kpi-label">설비용량</div>
            <div class="pp-card__kpi-value">{{ selectedCard.capacity.toLocaleString() }}<span class="pp-card__kpi-unit">{{ selectedCard.capacityUnit }}</span></div>
          </div>
          <div class="pp-card__kpi">
            <div class="pp-card__kpi-label">발전 출력</div>
            <div class="pp-card__kpi-value">{{ selectedCard.currentKw.toLocaleString(undefined, { maximumFractionDigits: 1 }) }}<span class="pp-card__kpi-unit">kW</span></div>
          </div>
          <div class="pp-card__kpi">
            <div class="pp-card__kpi-label">월 발전량</div>
            <div class="pp-card__kpi-value pp-card__kpi-value--sm">{{ selectedCard.monthlyMwh }}</div>
          </div>
          <div class="pp-card__kpi">
            <div class="pp-card__kpi-label">수익 배수 (P/E)</div>
            <div class="pp-card__kpi-value pp-card__kpi-value--sm">{{ selectedCard.peMultiple }}</div>
          </div>
        </div>

        <div class="pp-card__gauge-track">
          <div class="pp-card__gauge-fill" :class="'eff-' + selectedCard.effClass" :style="{ width: selectedCard.effPct + '%' }"></div>
        </div>
        <div class="pp-card__gauge-foot">
          <span class="pp-card__gauge-foot-label">효율</span>
          <span class="pp-card__gauge-pct" :class="'pct-' + selectedCard.pctBadgeClass">{{ selectedCard.effPct }}%</span>
          <span class="pp-card__price-change" :class="selectedCard.changeDir">
            {{ changeArrow(selectedCard.changeDir) }} {{ selectedCard.changePct }}
          </span>
        </div>

        <div class="pp-card__divider"></div>

        <!-- Profit History -->
        <div class="detail__profit">
          <div class="detail__profit-header">
            <span class="detail__profit-title">투자자 수익 내역</span>
            <div class="detail__profit-tabs">
              <button
                class="profit-tab"
                :class="{ 'profit-tab--active': profitTab === 'monthly' }"
                @click="profitTab = 'monthly'"
              >월간</button>
              <button
                class="profit-tab"
                :class="{ 'profit-tab--active': profitTab === 'weekly' }"
                @click="profitTab = 'weekly'"
              >주간</button>
            </div>
          </div>

          <div class="detail__chart">
            <div v-for="entry in activeHistory" :key="entry.label" class="bar-col">
              <span class="bar-col__val">{{ entry.amount }}</span>
              <div class="bar-col__bar" :style="{ height: barH(entry.amount) }"></div>
              <span class="bar-col__lbl">{{ entry.label }}</span>
            </div>
          </div>

          <div class="detail__profit-footer">
            <span class="detail__profit-footer-label">{{ profitTab === 'monthly' ? '8개월 누적 수익' : '8주 누적 수익' }}</span>
            <span class="detail__profit-footer-value">{{ totalProfit.toLocaleString() }}만원</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables/spacing" as sp;
@use "@/assets/scss/variables/layout" as layout-vars;
@use "@/assets/scss/variables/colors" as c;

.my-electric {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: c.$bg-base;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Inter", sans-serif;
}

.my-electric__page-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: c.$text-secondary;
  flex-shrink: 0;
  margin-bottom: sp.$space-2;

  &--no-mb { margin-bottom: 0; }
}

.my-electric__section-divider {
  height: 1px;
  background: c.$border-color;
  margin: sp.$space-5 0;
  flex-shrink: 0;
}

.my-electric__carousel-wrap {
  flex-shrink: 0;
  margin: 0 calc(-1 * layout-vars.$page-padding-x);
  padding: 0 layout-vars.$page-padding-x;
  display: flex;
  align-items: center;
  gap: sp.$space-2;
}

.carousel-arrow {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.10);
  }

  &:active {
    background: #f3f4f6;
    transform: scale(0.96);
  }
}

.my-electric__detail {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin-top: sp.$space-5;
  padding-top: sp.$space-5;
  border-top: 1px solid c.$border-color;
}

.my-electric__detail-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: c.$text-secondary;
  margin: 0 0 sp.$space-3;
}

.my-electric__detail-card {
  background: #fff;
  border-radius: 12px;
  padding: sp.$space-5;
  border: 1px solid c.$border-color;
  position: relative;
  overflow: hidden;
}

// ── Investment info row ─────────────────────────────────────────────────────
.detail__invest-row {
  display: flex;
  align-items: center;
  background: #f8f9fc;
  border-radius: sp.$space-2;
  padding: sp.$space-3 sp.$space-4;
  margin: sp.$space-3 0 0;
}

.detail__invest-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: sp.$space-1;
}

.detail__invest-divider {
  width: 1px;
  height: 32px;
  background: c.$border-color;
  margin: 0 sp.$space-4;
  flex-shrink: 0;
}

.detail__invest-label {
  font-size: 10px;
  color: c.$text-secondary;
  font-weight: 500;
}

.detail__invest-value {
  font-size: 14px;
  font-weight: 700;
  color: c.$text-primary;

  &--accent { color: c.$primary; }
  &--green  { color: #16a34a; }
}

// ── Profit history chart ────────────────────────────────────────────────────
.detail__profit {
  margin-top: 0;
}

.detail__profit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: sp.$space-3;
}

.detail__profit-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: c.$text-secondary;
}

.detail__profit-tabs {
  display: flex;
  gap: sp.$space-1;
  background: #f3f4f6;
  border-radius: 7px;
  padding: sp.$space-1;
}

.profit-tab {
  padding: sp.$space-1 sp.$space-3;
  font-size: 11px;
  font-weight: 600;
  color: c.$text-secondary;
  background: transparent;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &--active {
    background: #fff;
    color: c.$primary;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
}

.detail__chart {
  display: flex;
  gap: sp.$space-1;
  align-items: flex-end;
  height: 96px;
  padding-bottom: sp.$space-4;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  gap: 2px;
  position: relative;
}

.bar-col__val {
  font-size: 8px;
  color: c.$text-secondary;
  white-space: nowrap;
  line-height: 1;
}

.bar-col__bar {
  width: 100%;
  max-width: 26px;
  background: linear-gradient(180deg, #4F6AF5 0%, #818cf8 100%);
  border-radius: 3px 3px 0 0;
  transition: height 0.4s ease;
  min-height: 4px;
}

.bar-col__lbl {
  font-size: 8px;
  color: c.$text-secondary;
  white-space: nowrap;
  text-align: center;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.detail__profit-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: sp.$space-2;
  padding-top: sp.$space-2;
  border-top: 1px solid #f3f4f6;
}

.detail__profit-footer-label {
  font-size: 11px;
  color: c.$text-secondary;
}

.detail__profit-footer-value {
  font-size: 14px;
  font-weight: 700;
  color: c.$text-primary;
}

.my-electric__carousel {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: sp.$space-5;
  overflow-x: auto;
  overflow-y: hidden;
  padding: sp.$space-2 0 sp.$space-4;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
}

/* ───── Card ───── */
.pp-card {
  scroll-snap-align: start;
  flex-shrink: 0;
  width: 300px;
  background: #fff;
  border-radius: 12px;
  padding: sp.$space-4;
  border: 1px solid c.$border-color;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: "Inter", sans-serif;
  cursor: pointer;
}

.pp-card:hover {
  border-color: #c7d0fd;
  box-shadow: 0 4px 16px rgba(79, 106, 245, 0.08);
}

.pp-card--selected {
  border-color: c.$primary;
  box-shadow: 0 0 0 3px rgba(79, 106, 245, 0.12);
}

/* Top row */
.pp-card__top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: sp.$space-3;
}

.pp-card__top-row--mb {
  margin-bottom: sp.$space-3;
}

.pp-card__title--detail {
  font-size: 18px;
  margin-bottom: sp.$space-1;
}

.pp-card__type-tag {
  font-size: 10px;
  font-weight: 600;
  color: c.$text-secondary;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.pp-card__title {
  font-size: 15px;
  font-weight: 700;
  color: c.$text-primary;
  line-height: 1.3;
  margin: 0 0 sp.$space-1;
}

.pp-card__subtitle {
  font-size: 11.5px;
  color: c.$text-secondary;
  margin: 0 0 sp.$space-3;
}

/* Live badge */
.pp-card__live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 20px;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.pp-card__live--green  { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
.pp-card__live--blue   { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; }
.pp-card__live--pink   { background: #fdf2f8; border: 1px solid #fbcfe8; color: #9d174d; }
.pp-card__live--orange { background: #fff7ed; border: 1px solid #fed7aa; color: #c2410c; }

.pp-card__live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  animation: livePulse 1.8s ease-in-out infinite;
}

@keyframes livePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.8); }
}

/* Pill */
.pp-card__pill {
  display: inline-flex;
  border-radius: 6px;
  padding: sp.$space-1 sp.$space-2;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  margin-bottom: sp.$space-3;
}
.pill-smp-rec   { background: #eff6ff; color: #1d4ed8; }
.pill-fit       { background: #f0fdf4; color: #15803d; }
.pill-corp-ppa  { background: #faf5ff; color: #7c3aed; }
.pill-vpp       { background: #fff7ed; color: #c2410c; }
.pill-community { background: #fdf2f8; color: #9d174d; }

/* Divider */
.pp-card__divider {
  height: 1px;
  background: #f3f4f6;
  margin: sp.$space-3 0;
}

/* KPI row */
.pp-card__kpi-row {
  display: flex;
  gap: 0;
  margin-bottom: sp.$space-3;
}

.pp-card__kpi {
  flex: 1;
  padding: 0 sp.$space-3 0 0;

  &:not(:last-child) {
    border-right: 1px solid #f3f4f6;
    margin-right: sp.$space-3;
  }
}

.pp-card__kpi-label {
  font-size: 10.5px;
  color: c.$text-secondary;
  font-weight: 500;
  margin-bottom: sp.$space-1;
}

.pp-card__kpi-value {
  font-size: 18px;
  font-weight: 700;
  color: c.$text-primary;
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: sp.$space-1;

  &--sm { font-size: 13px; font-weight: 600; }
}

.pp-card__kpi-unit {
  font-size: 11px;
  font-weight: 500;
  color: c.$text-secondary;
  margin-left: sp.$space-1;
}

/* Gauge */
.pp-card__gauge-track {
  height: 6px;
  border-radius: 20px;
  background: #e5e7eb;
  overflow: hidden;
  margin-bottom: sp.$space-2;
}

.pp-card__gauge-fill {
  height: 100%;
  border-radius: 20px;
  transition: width 1.1s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.eff-high { background: linear-gradient(90deg, #22c55e, #4ade80); }
.eff-mid  { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.eff-low  { background: linear-gradient(90deg, #ef4444, #f87171); }

.pp-card__gauge-foot {
  display: flex;
  align-items: center;
  gap: sp.$space-2;
}

.pp-card__gauge-foot-label {
  font-size: 11px;
  color: c.$text-secondary;
  flex: 1;
}

.pp-card__gauge-pct {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
}
.pct-high { background: #dcfce7; color: #15803d; }
.pct-mid  { background: #fef3c7; color: #92400e; }
.pct-low  { background: #fee2e2; color: #991b1b; }

.pp-card__price-change {
  font-size: 11.5px;
  font-weight: 600;
  &.up      { color: #16a34a; }
  &.down    { color: #dc2626; }
  &.neutral { color: #d97706; }
}

// ── Section divider (spacing tokens) ────────────────────────────────────────
.my-electric__section-divider {
  height: 1px;
  background: c.$border-color;
  margin: sp.$space-5 0 sp.$space-5;
  flex-shrink: 0;
}

// ── Financial Performance Dashboard ─────────────────────────────────────────
.perf {
  flex-shrink: 0;
}

.perf__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: sp.$space-4;
}

.perf__date {
  font-size: 11px;
  color: c.$text-secondary;
  font-weight: 500;
}

// KPI cards
.perf__kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: sp.$space-3;
  margin-bottom: sp.$space-4;
}

.perf__kpi-card {
  background: #fff;
  border-radius: 10px;
  padding: sp.$space-4;
  border: 1px solid c.$border-color;
  display: flex;
  flex-direction: column;
  gap: sp.$space-1;
}

.perf__kpi-label {
  font-size: 10.5px;
  font-weight: 600;
  color: c.$text-secondary;
  letter-spacing: 0.04em;
}

.perf__kpi-value {
  font-size: 20px;
  font-weight: 800;
  color: c.$text-primary;
  line-height: 1.2;

  &--accent { color: c.$primary; }
  &--green  { color: #16a34a; }
}

.perf__kpi-sub {
  font-size: 10.5px;
  color: c.$text-secondary;
  font-weight: 500;

  &--up { color: #16a34a; }
  &--down { color: #dc2626; }
}

// Chart card
.perf__chart-card {
  background: #fff;
  border-radius: 10px;
  padding: sp.$space-4 sp.$space-5 sp.$space-3;
  border: 1px solid c.$border-color;
  margin-bottom: sp.$space-4;
}

.perf__chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: sp.$space-3;
}

.perf__chart-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: c.$text-secondary;
}

.perf__chart-badge {
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 5px;

  &.up      { background: #dcfce7; color: #15803d; }
  &.down    { background: #fee2e2; color: #991b1b; }
  &.neutral { background: #fef3c7; color: #92400e; }
}

.perf__chart-svg-wrap {
  width: 100%;
  overflow: hidden;
}

.perf__chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

.perf__chart-dot-label {
  font-size: 10px;
  fill: #6b7280;
  font-weight: 600;
  font-family: "Inter", sans-serif;
}

.perf__chart-x-label {
  font-size: 10px;
  fill: c.$text-secondary;
  font-weight: 500;
  font-family: "Inter", sans-serif;
}

.perf__chart-empty {
  font-size: 12px;
  color: c.$text-secondary;
  padding: sp.$space-4 0;
  margin: 0;
}

// Per-site comparison bars
.perf__compare-card {
  background: #fff;
  border-radius: 10px;
  padding: sp.$space-4 sp.$space-5;
  border: 1px solid c.$border-color;
  margin-bottom: sp.$space-4;
}

.perf__compare-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: sp.$space-3;
}

.perf__compare-top {
  font-size: 10.5px;
  font-weight: 600;
  color: c.$primary;
}

.perf__compare-bars {
  display: flex;
  flex-direction: column;
  gap: sp.$space-2;
}

.perf__compare-row {
  display: grid;
  grid-template-columns: 1fr minmax(80px, 2fr) auto;
  align-items: center;
  gap: sp.$space-2;
}

.perf__compare-label {
  font-size: 11px;
  font-weight: 500;
  color: c.$text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.perf__compare-track {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.perf__compare-fill {
  height: 100%;
  background: linear-gradient(90deg, c.$primary, #818cf8);
  border-radius: 4px;
  transition: width 0.4s ease;
}

.perf__compare-val {
  font-size: 11px;
  font-weight: 600;
  color: c.$text-primary;
  font-variant-numeric: tabular-nums;
  min-width: 4em;
  text-align: right;
}

// Activity history
.perf__history-card {
  background: #fff;
  border-radius: 10px;
  padding: sp.$space-4 sp.$space-5;
  border: 1px solid c.$border-color;
}

.perf__history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: sp.$space-3;
}

.perf__history-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: c.$text-secondary;
}

.perf__history-count {
  font-size: 10.5px;
  font-weight: 600;
  background: #f3f4f6;
  color: c.$text-secondary;
  padding: sp.$space-1 sp.$space-2;
  border-radius: 10px;
}

.perf__history-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 320px;
  overflow-y: auto;
}

.activity-row {
  display: flex;
  align-items: flex-start;
  gap: sp.$space-3;
  padding: sp.$space-2 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child { border-bottom: none; }
}

.activity-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;

  &--invest   { background: #eff6ff; color: #1d4ed8; }
  &--dividend  { background: #f0fdf4; color: #16a34a; }
  &--reinvest  { background: #faf5ff; color: #7c3aed; }
  &--bonus     { background: #fff7ed; color: #c2410c; }
}

.activity-body {
  flex: 1;
  min-width: 0;
}

.activity-body__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: sp.$space-1;
}

.activity-body__title {
  font-size: 13px;
  font-weight: 600;
  color: c.$text-primary;
}

.activity-body__amount {
  font-size: 13px;
  font-weight: 700;

  &--positive { color: #16a34a; }
  &--negative { color: c.$primary; }
  &--neutral  { color: c.$text-secondary; }
}

.activity-body__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.activity-body__plant {
  font-size: 11px;
  color: c.$text-secondary;
  font-weight: 500;
}

.activity-body__date {
  font-size: 10.5px;
  color: #b0b5bf;
  font-weight: 500;
}

// ── Responsive ────────────────────────────────────────────────────────────────
@media (max-width: 768px) {
  .my-electric {
    overflow: visible;
  }

  .perf__kpis {
    grid-template-columns: repeat(2, 1fr);
    gap: sp.$space-2;
  }

  .perf__kpi-value {
    font-size: 17px;
  }

  .my-electric__section-divider {
    margin: sp.$space-5 layout-vars.$page-padding-x-mobile sp.$space-4;
  }

  // Carousel: edge-to-edge; layout wrapper provides horizontal padding
  .my-electric__carousel-wrap {
    margin: 0 calc(-1 * layout-vars.$page-padding-x-mobile);
    padding: 0 layout-vars.$page-padding-x-mobile;
    gap: 0;
  }

  // Hide arrow buttons on mobile (swipe instead)
  .carousel-arrow {
    display: none;
  }

  .my-electric__carousel {
    padding: sp.$space-2 layout-vars.$page-padding-x-mobile sp.$space-4;
    gap: sp.$space-4;
  }

  // Cards slightly narrower to hint at next card
  .pp-card {
    width: calc(100vw - 56px); // shows ~1/3 of next card
    min-width: 260px;
  }

  // Detail section full-width below carousel
  .my-electric__detail {
    margin: 0;
    padding: layout-vars.$page-padding-x-mobile;
    border-top: sp.$space-2 solid c.$bg-base;
    overflow: visible;
    flex: none;
  }

  .my-electric__detail-card {
    padding: sp.$space-4;
    border-radius: 10px;
  }
}

@media (max-width: 480px) {
  .pp-card {
    width: calc(100vw - 40px);
  }
}
</style>
