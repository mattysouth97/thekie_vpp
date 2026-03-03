<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  IcoSolar, IcoWind, IcoBattery, IcoHydro, IcoFuelCell,
  IcoArrowRight, IcoCheck, IcoSearch, IcoClose,
} from "@/components/icons";

const router = useRouter();

// ── 4-Module Filter Definitions (from 정산시스템 설계 전략제안) ──

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  key: string;
  title: string;
  subtitle: string;
  options: FilterOption[];
}

const filterGroups: FilterGroup[] = [
  {
    key: "power",
    title: "전력 구조",
    subtitle: "발전소 전력 사용·판매 방식",
    options: [
      { value: "self_consume", label: "자가소비" },
      { value: "full_sale", label: "전면매전" },
      { value: "net_metering", label: "상계거래" },
      { value: "surplus_sale", label: "잉여전력 매입" },
    ],
  },
  {
    key: "market",
    title: "시장/REC",
    subtitle: "전력시장·인증 구조",
    options: [
      { value: "smp_rec_spot", label: "SMP+REC 현물" },
      { value: "smp_rec_contract", label: "SMP+REC 장기계약" },
      { value: "corporate_ppa", label: "기업 PPA" },
      { value: "fit", label: "FIT형" },
      { value: "vpp", label: "VPP/중개" },
    ],
  },
  {
    key: "land",
    title: "권원/입지",
    subtitle: "부지 소유·설치 유형",
    options: [
      { value: "self_owned", label: "자가 보유" },
      { value: "leased", label: "임대" },
      { value: "public_land", label: "공공부지" },
      { value: "agrivoltaic", label: "영농형" },
      { value: "floating", label: "수상형" },
      { value: "industrial", label: "산단형" },
    ],
  },
  {
    key: "capital",
    title: "자본 구조",
    subtitle: "자금 조달 방식",
    options: [
      { value: "equity_pf", label: "자기자본+PF" },
      { value: "community_fund", label: "주민참여/펀드" },
      { value: "corporate_credit", label: "기업 신용" },
      { value: "rental", label: "렌탈 구조" },
      { value: "policy", label: "정책형" },
    ],
  },
];

// Active filters
const activeFilters = ref<Record<string, Set<string>>>({
  power: new Set(),
  market: new Set(),
  land: new Set(),
  capital: new Set(),
});

const searchQuery = ref("");
const sortBy = ref<"yield" | "progress" | "capacity" | "recent">("recent");

function toggleFilter(group: string, value: string) {
  const s = activeFilters.value[group];
  if (s.has(value)) s.delete(value);
  else s.add(value);
}

function isActive(group: string, value: string): boolean {
  return activeFilters.value[group].has(value);
}

function clearAllFilters() {
  for (const key of Object.keys(activeFilters.value)) {
    activeFilters.value[key].clear();
  }
  searchQuery.value = "";
}

const hasAnyFilter = computed(() =>
  Object.values(activeFilters.value).some((s) => s.size > 0) || searchQuery.value.trim() !== "",
);

// ── Project Data ──

interface ProjectItem {
  id: string;
  name: string;
  type: string;
  typeIcon: string;
  location: string;
  capacity: string;
  expectedYield: string;
  yieldRate: number;
  minInvest: string;
  progress: number;
  status: string;
  statusColor: string;
  desc: string;
  ppaYears: number;
  annualOutput: string;
  co2Reduction: string;
  investor: string;
  // Module tags
  power: string;
  market: string;
  land: string;
  capital: string;
  // Business type label (12 types)
  bizType: string;
  bizTypeLabel: string;
}

const projects: ProjectItem[] = [
  {
    id: "yongin-rooftop",
    name: "용인시 지붕형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 기흥구 보정동",
    capacity: "2.0 MW",
    expectedYield: "연 7.8%",
    yieldRate: 7.8,
    minInvest: "₩50,000",
    progress: 38,
    status: "참여 가능",
    statusColor: "green",
    desc: "상업시설 지붕 태양광. RE100 기업 직접 PPA 계약으로 장기 안정 수익.",
    ppaYears: 15,
    annualOutput: "2,628 MWh",
    co2Reduction: "1,224 tCO₂",
    investor: "THEKIE 지붕형사업단",
    power: "full_sale",
    market: "corporate_ppa",
    land: "leased",
    capital: "corporate_credit",
    bizType: "Type 7",
    bizTypeLabel: "기업PPA(직접)",
  },
  {
    id: "yongin-ground",
    name: "용인시 지상형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 양지면",
    capacity: "3.0 MW",
    expectedYield: "연 6.8%",
    yieldRate: 6.8,
    minInvest: "₩10,000",
    progress: 72,
    status: "참여 가능",
    statusColor: "green",
    desc: "유휴부지 활용 지상형 태양광. SMP+REC 현물 매입으로 이중 수익 구조.",
    ppaYears: 20,
    annualOutput: "3,942 MWh",
    co2Reduction: "1,836 tCO₂",
    investor: "THEKIE 지상형사업단",
    power: "full_sale",
    market: "smp_rec_spot",
    land: "leased",
    capital: "community_fund",
    bizType: "Type 4",
    bizTypeLabel: "SMP+REC 현물형",
  },
  {
    id: "yongin-floating",
    name: "용인시 수상형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 이동면",
    capacity: "2.5 MW",
    expectedYield: "연 7.5%",
    yieldRate: 7.5,
    minInvest: "₩20,000",
    progress: 28,
    status: "신규 오픈",
    statusColor: "blue",
    desc: "저수지 수면 활용 수상태양광. 수면 냉각 효과로 발전 효율 15% 향상.",
    ppaYears: 20,
    annualOutput: "3,285 MWh",
    co2Reduction: "1,530 tCO₂",
    investor: "THEKIE 수상형사업단",
    power: "full_sale",
    market: "smp_rec_spot",
    land: "floating",
    capital: "community_fund",
    bizType: "Type 4",
    bizTypeLabel: "SMP+REC 현물형",
  },
  {
    id: "yongin-fems",
    name: "용인시 FEMS 연계형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 기흥구 영덕동",
    capacity: "0.8 MW",
    expectedYield: "연 4.8%",
    yieldRate: 4.8,
    minInvest: "₩10,000",
    progress: 100,
    status: "참여 완료",
    statusColor: "slate",
    desc: "공장에너지관리시스템(FEMS) 연계 태양광. 자가소비 최적화로 전기요금 절감.",
    ppaYears: 15,
    annualOutput: "1,051 MWh",
    co2Reduction: "490 tCO₂",
    investor: "THEKIE FEMS사업단",
    power: "self_consume",
    market: "smp_rec_spot",
    land: "self_owned",
    capital: "equity_pf",
    bizType: "Type 1",
    bizTypeLabel: "전방 자가소비",
  },
  {
    id: "yongin-bipv",
    name: "용인시 BIPV형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 수지구 성복동",
    capacity: "0.5 MW",
    expectedYield: "연 5.8%",
    yieldRate: 5.8,
    minInvest: "₩10,000",
    progress: 82,
    status: "마감 임박",
    statusColor: "amber",
    desc: "건물일체형(BIPV) 태양광. FIT 고정가격매입 적용, 정책 기반 안정 수익.",
    ppaYears: 20,
    annualOutput: "657 MWh",
    co2Reduction: "306 tCO₂",
    investor: "THEKIE BIPV사업단",
    power: "full_sale",
    market: "fit",
    land: "self_owned",
    capital: "policy",
    bizType: "Type 6",
    bizTypeLabel: "FIT형",
  },
  {
    id: "yongin-ess",
    name: "용인시 ESS통합형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 남사읍",
    capacity: "2.0 MW",
    expectedYield: "연 5.5%",
    yieldRate: 5.5,
    minInvest: "₩30,000",
    progress: 91,
    status: "마감 임박",
    statusColor: "amber",
    desc: "ESS 결합형 태양광. 피크 시간대 방전으로 전력 차익 거래 및 DR 참여 수익.",
    ppaYears: 15,
    annualOutput: "2,628 MWh",
    co2Reduction: "1,224 tCO₂",
    investor: "THEKIE ESS사업단",
    power: "full_sale",
    market: "vpp",
    land: "leased",
    capital: "equity_pf",
    bizType: "Type 9",
    bizTypeLabel: "VPP/중개형",
  },
  {
    id: "yongin-agri",
    name: "용인시 영농형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 원삼면",
    capacity: "1.5 MW",
    expectedYield: "연 6.2%",
    yieldRate: 6.2,
    minInvest: "₩10,000",
    progress: 55,
    status: "참여 가능",
    statusColor: "green",
    desc: "농작물 재배와 태양광 병행. 영농형 REC 가중치 1.2 적용으로 추가 수익.",
    ppaYears: 20,
    annualOutput: "1,971 MWh",
    co2Reduction: "918 tCO₂",
    investor: "THEKIE 영농형사업단",
    power: "surplus_sale",
    market: "smp_rec_spot",
    land: "agrivoltaic",
    capital: "community_fund",
    bizType: "Type 3",
    bizTypeLabel: "잉여전력 한전매입",
  },
  {
    id: "yongin-carport",
    name: "용인시 주차장형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 기흥구 구갈동",
    capacity: "1.2 MW",
    expectedYield: "연 7.2%",
    yieldRate: 7.2,
    minInvest: "₩50,000",
    progress: 45,
    status: "참여 가능",
    statusColor: "green",
    desc: "대형 주차장 캐노피 태양광. EV 충전 인프라 연계 복합 수익 구조.",
    ppaYears: 15,
    annualOutput: "1,577 MWh",
    co2Reduction: "735 tCO₂",
    investor: "THEKIE 주차장형사업단",
    power: "full_sale",
    market: "corporate_ppa",
    land: "leased",
    capital: "corporate_credit",
    bizType: "Type 7",
    bizTypeLabel: "기업PPA(직접)",
  },
  {
    id: "yongin-tracker",
    name: "용인시 추적식 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 백암면",
    capacity: "3.5 MW",
    expectedYield: "연 8.1%",
    yieldRate: 8.1,
    minInvest: "₩100,000",
    progress: 15,
    status: "신규 오픈",
    statusColor: "blue",
    desc: "태양 추적 시스템 적용. 고정식 대비 발전량 25% 이상 향상.",
    ppaYears: 20,
    annualOutput: "5,694 MWh",
    co2Reduction: "2,653 tCO₂",
    investor: "THEKIE 추적식사업단",
    power: "full_sale",
    market: "smp_rec_contract",
    land: "leased",
    capital: "equity_pf",
    bizType: "Type 5",
    bizTypeLabel: "고정가격계약(입찰)",
  },
  {
    id: "yongin-bifacial",
    name: "용인시 양면형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 모현읍",
    capacity: "2.0 MW",
    expectedYield: "연 5.2%",
    yieldRate: 5.2,
    minInvest: "₩10,000",
    progress: 65,
    status: "참여 가능",
    statusColor: "green",
    desc: "양면 수광 모듈 적용. 반사광 활용으로 단면형 대비 효율 15% 향상.",
    ppaYears: 20,
    annualOutput: "2,628 MWh",
    co2Reduction: "1,224 tCO₂",
    investor: "THEKIE 양면형사업단",
    power: "self_consume",
    market: "smp_rec_spot",
    land: "self_owned",
    capital: "rental",
    bizType: "Type 10",
    bizTypeLabel: "태양광대여(렌탈)",
  },
  {
    id: "yongin-distributed",
    name: "용인시 소규모 분산형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 수지구 풍덕천동",
    capacity: "0.3 MW",
    expectedYield: "연 6.0%",
    yieldRate: 6.0,
    minInvest: "₩10,000",
    progress: 20,
    status: "신규 오픈",
    statusColor: "blue",
    desc: "도심 유휴 공간 활용 소규모 분산형 태양광. 주민참여 시민펀드 구조.",
    ppaYears: 20,
    annualOutput: "394 MWh",
    co2Reduction: "184 tCO₂",
    investor: "THEKIE 분산형사업단",
    power: "net_metering",
    market: "smp_rec_spot",
    land: "public_land",
    capital: "community_fund",
    bizType: "Type 11",
    bizTypeLabel: "주민참여·시민펀드",
  },
  {
    id: "yongin-industrial",
    name: "용인시 산단 연계형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 유방동",
    capacity: "5.0 MW",
    expectedYield: "연 6.5%",
    yieldRate: 6.5,
    minInvest: "₩100,000",
    progress: 10,
    status: "신규 오픈",
    statusColor: "blue",
    desc: "산업단지 유휴부지 대규모 태양광. 기업 PPA 제3자 계약으로 안정 수익.",
    ppaYears: 15,
    annualOutput: "6,570 MWh",
    co2Reduction: "3,061 tCO₂",
    investor: "THEKIE 산단사업단",
    power: "full_sale",
    market: "corporate_ppa",
    land: "industrial",
    capital: "corporate_credit",
    bizType: "Type 8",
    bizTypeLabel: "기업PPA(제3자)",
  },
];

// ── Filtered + sorted results ──

const filteredProjects = computed(() => {
  let result = projects;

  // Search
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.bizTypeLabel.toLowerCase().includes(q) ||
        p.investor.toLowerCase().includes(q),
    );
  }

  // Module filters
  for (const key of ["power", "market", "land", "capital"] as const) {
    const set = activeFilters.value[key];
    if (set.size > 0) {
      result = result.filter((p) => set.has(p[key]));
    }
  }

  // Sort
  if (sortBy.value === "yield") {
    result = [...result].sort((a, b) => b.yieldRate - a.yieldRate);
  } else if (sortBy.value === "progress") {
    result = [...result].sort((a, b) => b.progress - a.progress);
  } else if (sortBy.value === "capacity") {
    result = [...result].sort(
      (a, b) => parseFloat(b.capacity) - parseFloat(a.capacity),
    );
  }
  // "recent" keeps original order

  return result;
});

const totalActiveFilters = computed(() =>
  Object.values(activeFilters.value).reduce((sum, s) => sum + s.size, 0),
);

function goProject(id: string) {
  router.push(`/projects/${id}`);
}

function getTypeIcon(icon: string) {
  return icon;
}

// Stats
const stats = computed(() => ({
  total: projects.length,
  recruiting: projects.filter((p) => p.status === "참여 가능" || p.status === "신규 오픈").length,
  totalCapacity: projects.reduce((s, p) => s + parseFloat(p.capacity), 0).toFixed(1),
  avgYield: (projects.reduce((s, p) => s + p.yieldRate, 0) / projects.length).toFixed(1),
}));
</script>

<template>
  <div class="pl">
    <!-- Header -->
    <div class="pl-header">
      <div class="pl-header__top">
        <div>
          <h1 class="pl-header__title">사업 현황</h1>
          <p class="pl-header__sub">C&I 재생에너지 프로젝트 — 4개 모듈 기반 사업 구조 분석</p>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="pl-stats">
        <div class="pl-stat">
          <span class="pl-stat__num">{{ stats.total }}</span>
          <span class="pl-stat__label">전체 프로젝트</span>
        </div>
        <div class="pl-stat">
          <span class="pl-stat__num pl-stat__num--green">{{ stats.recruiting }}</span>
          <span class="pl-stat__label">참여 가능</span>
        </div>
        <div class="pl-stat">
          <span class="pl-stat__num">{{ stats.totalCapacity }}<small>MW</small></span>
          <span class="pl-stat__label">총 설비용량</span>
        </div>
        <div class="pl-stat">
          <span class="pl-stat__num pl-stat__num--accent">{{ stats.avgYield }}<small>%</small></span>
          <span class="pl-stat__label">평균 기대수익</span>
        </div>
      </div>
    </div>

    <!-- Products container: filters + search + grid -->
    <div class="pl-products">
      <!-- Toolbar: search + sort + clear -->
      <div class="pl-toolbar">
        <div class="pl-toolbar__search">
          <IcoSearch :size="14" :strokeWidth="2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="프로젝트명, 지역, 유형 검색..."
            class="pl-toolbar__input"
          />
          <button v-if="searchQuery" class="pl-toolbar__clear" @click="searchQuery = ''">
            <IcoClose :size="12" :strokeWidth="2.5" />
          </button>
        </div>
        <div class="pl-toolbar__right">
          <span class="pl-toolbar__count">{{ filteredProjects.length }}건</span>
          <select v-model="sortBy" class="pl-toolbar__sort">
            <option value="recent">최신순</option>
            <option value="yield">수익률순</option>
            <option value="progress">진행률순</option>
            <option value="capacity">설비용량순</option>
          </select>
          <button v-if="hasAnyFilter" class="pl-toolbar__reset" @click="clearAllFilters">
            <IcoClose :size="11" :strokeWidth="2.5" />
            초기화
          </button>
        </div>
      </div>

      <!-- Compact inline filters -->
      <div class="pl-filters-inline">
        <div v-for="group in filterGroups" :key="group.key" class="pl-fgroup-inline">
          <span class="pl-fgroup-inline__label">{{ group.title }}</span>
          <button
            v-for="opt in group.options"
            :key="opt.value"
            class="pl-chip"
            :class="{ 'pl-chip--active': isActive(group.key, opt.value) }"
            @click="toggleFilter(group.key, opt.value)"
          >
            {{ opt.label }}
            <IcoCheck v-if="isActive(group.key, opt.value)" :size="11" :strokeWidth="3" />
          </button>
        </div>
      </div>

      <!-- Active filter tags -->
      <div v-if="totalActiveFilters > 0" class="pl-active-filters">
        <template v-for="group in filterGroups" :key="group.key">
          <span
            v-for="opt in group.options.filter((o) => isActive(group.key, o.value))"
            :key="opt.value"
            class="pl-active-tag"
          >
            {{ group.title }}: {{ opt.label }}
            <button class="pl-active-tag__remove" @click="toggleFilter(group.key, opt.value)">
              <IcoClose :size="10" :strokeWidth="3" />
            </button>
          </span>
        </template>
      </div>

      <!-- Data Table -->
      <div v-if="filteredProjects.length" class="pl-table-wrap">
        <table class="pl-table">
          <thead>
            <tr>
              <th class="pl-table__th">프로젝트</th>
              <th class="pl-table__th">유형</th>
              <th class="pl-table__th pl-table__th--right">설비용량</th>
              <th class="pl-table__th pl-table__th--right">기대 수익</th>
              <th class="pl-table__th pl-table__th--right">최소 참여금</th>
              <th class="pl-table__th">사업구조</th>
              <th class="pl-table__th">진행률</th>
              <th class="pl-table__th">상태</th>
              <th class="pl-table__th"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredProjects" :key="p.id" class="pl-table__row" @click="goProject(p.id)">
              <td class="pl-table__td">
                <div class="pl-table__project">
                  <div class="pl-table__icon" :class="`pl-table__icon--${p.typeIcon}`">
                    <IcoSolar v-if="p.typeIcon === 'solar'" :size="14" :strokeWidth="2" />
                    <IcoWind v-else-if="p.typeIcon === 'wind'" :size="14" :strokeWidth="2" />
                    <IcoBattery v-else-if="p.typeIcon === 'battery'" :size="14" :strokeWidth="2" />
                    <IcoHydro v-else-if="p.typeIcon === 'hydro'" :size="14" :strokeWidth="2" />
                    <IcoFuelCell v-else :size="14" :strokeWidth="2" />
                  </div>
                  <div>
                    <span class="pl-table__name">{{ p.name }}</span>
                    <span class="pl-table__location">{{ p.location }}</span>
                  </div>
                </div>
              </td>
              <td class="pl-table__td">
                <span class="pl-table__type">{{ p.type }}</span>
              </td>
              <td class="pl-table__td pl-table__td--right pl-table__td--mono">{{ p.capacity }}</td>
              <td class="pl-table__td pl-table__td--right">
                <span class="pl-table__yield">{{ p.expectedYield }}</span>
              </td>
              <td class="pl-table__td pl-table__td--right pl-table__td--mono">{{ p.minInvest }}</td>
              <td class="pl-table__td">
                <span class="pl-table__biz">{{ p.bizTypeLabel }}</span>
              </td>
              <td class="pl-table__td">
                <div class="pl-table__progress">
                  <div class="pl-table__progress-bar">
                    <div class="pl-table__progress-fill" :class="`pl-table__progress-fill--${p.statusColor}`" :style="{ width: p.progress + '%' }"></div>
                  </div>
                  <span class="pl-table__progress-pct">{{ p.progress }}%</span>
                </div>
              </td>
              <td class="pl-table__td">
                <span class="pl-table__status" :class="`pl-table__status--${p.statusColor}`">{{ p.status }}</span>
              </td>
              <td class="pl-table__td pl-table__td--action">
                <IcoArrowRight :size="14" :strokeWidth="2" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-else class="pl-empty">
        <IcoSearch :size="28" :strokeWidth="1.5" />
        <p>필터 조건에 맞는 프로젝트가 없습니다</p>
        <button class="pl-empty__btn" @click="clearAllFilters">필터 초기화</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$bg: #f8f9fb;
$surface: #ffffff;
$border: #e8eaef;
$accent: #4f6af5;
$accent-light: #eef1fe;
$text-primary: #1a1d26;
$text-secondary: #5a5f72;
$text-muted: #9ea3b5;

.pl {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px 28px;
  max-width: 100%;

  @media (max-width: 768px) {
    padding: 12px 10px 20px;
  }
}

// ── Header ──
.pl-header {
  &__top { margin-bottom: 10px; }

  &__title {
    font-size: 18px;
    font-weight: 900;
    color: $text-primary;
    letter-spacing: -0.03em;
    margin: 0 0 3px;
  }

  &__sub {
    font-size: 12px;
    color: $text-secondary;
    margin: 0;
  }
}

.pl-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.pl-stat {
  background: $surface;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &__num {
    font-size: 17px;
    font-weight: 900;
    color: $text-primary;
    font-variant-numeric: tabular-nums;

    small {
      font-size: 12px;
      font-weight: 600;
      margin-left: 2px;
    }

    &--green { color: #16a34a; }
    &--accent { color: $accent; }
  }

  &__label {
    font-size: 11px;
    font-weight: 600;
    color: $text-muted;
  }
}

// ── Products container ──
.pl-products {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

// ── Toolbar (inside container) ──
.pl-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;

  &__search {
    display: flex;
    align-items: center;
    gap: 8px;
    background: $bg;
    border: 1px solid $border;
    border-radius: 8px;
    padding: 6px 10px;
    flex: 1;
    min-width: 180px;
    max-width: 320px;
    transition: border-color 0.12s;

    &:focus-within { border-color: $accent; }

    svg { color: $text-muted; flex-shrink: 0; }
  }

  &__input {
    border: none;
    background: none;
    outline: none;
    font-size: 12px;
    font-family: "Inter", sans-serif;
    color: $text-primary;
    flex: 1;
    min-width: 0;

    &::placeholder { color: $text-muted; }
  }

  &__clear {
    background: none;
    border: none;
    color: $text-muted;
    cursor: pointer;
    padding: 2px;
    display: flex;
    &:hover { color: $text-primary; }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__count {
    font-size: 11px;
    font-weight: 700;
    color: $text-muted;
    white-space: nowrap;
  }

  &__sort {
    font-size: 11px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    color: $text-secondary;
    background: $bg;
    border: 1px solid $border;
    border-radius: 6px;
    padding: 5px 10px;
    cursor: pointer;
    outline: none;

    &:focus { border-color: $accent; }
  }

  &__reset {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10.5px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    color: #dc2626;
    background: #fef2f2;
    border: none;
    padding: 5px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.12s;
    &:hover { background: #fee2e2; }
  }
}

// ── Compact inline filters ──
.pl-filters-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  padding: 8px 0 4px;
  border-top: 1px solid $border;
}

.pl-fgroup-inline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;

  &__label {
    font-size: 10px;
    font-weight: 700;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-right: 2px;
    white-space: nowrap;
  }
}

.pl-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 9px;
  font-size: 10.5px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  color: $text-secondary;
  background: $bg;
  border: 1px solid transparent;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    border-color: $accent;
    color: $accent;
  }

  &--active {
    background: $accent;
    border-color: $accent;
    color: #fff;
  }
}

// ── Active filter tags ──
.pl-active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.pl-active-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 600;
  color: $accent;
  background: $accent-light;
  border-radius: 5px;

  &__remove {
    background: none;
    border: none;
    color: $accent;
    cursor: pointer;
    padding: 0;
    display: flex;
    opacity: 0.6;
    transition: opacity 0.1s;
    &:hover { opacity: 1; }
  }
}

// ── Data Table ──
.pl-table-wrap {
  overflow-x: auto;
  margin: 0 -14px;
  padding: 0 14px;

  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
}

.pl-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 780px;
}

.pl-table__th {
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 6px 8px;
  border-bottom: 1px solid $border;
  white-space: nowrap;

  &--right { text-align: right; }
}

.pl-table__row {
  cursor: pointer;
  transition: background 0.1s;

  &:hover { background: rgba($accent, 0.03); }

  &:not(:last-child) .pl-table__td {
    border-bottom: 1px solid rgba($border, 0.6);
  }
}

.pl-table__td {
  padding: 10px 8px;
  vertical-align: middle;
  white-space: nowrap;
  color: $text-secondary;

  &--right { text-align: right; }
  &--mono { font-variant-numeric: tabular-nums; font-weight: 600; color: $text-primary; }
  &--action { color: $text-muted; width: 28px; padding-right: 4px; }
}

.pl-table__project {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pl-table__icon {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--solar { background: #fef3c7; color: #d97706; }
  &--wind { background: #cffafe; color: #0891b2; }
  &--battery { background: #dcfce7; color: #16a34a; }
  &--hydro { background: #dbeafe; color: #2563eb; }
  &--fuelcell { background: #ede9fe; color: #7c3aed; }
}

.pl-table__name {
  font-size: 12px;
  font-weight: 700;
  color: $text-primary;
  display: block;
  white-space: nowrap;
}

.pl-table__location {
  font-size: 10px;
  font-weight: 500;
  color: $text-muted;
  display: block;
}

.pl-table__type {
  font-size: 11px;
  font-weight: 600;
  color: $text-secondary;
}

.pl-table__yield {
  font-weight: 800;
  color: $accent;
}

.pl-table__biz {
  font-size: 10px;
  font-weight: 600;
  color: $text-secondary;
  background: $bg;
  padding: 2px 7px;
  border-radius: 4px;
}

.pl-table__progress {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 90px;
}

.pl-table__progress-bar {
  flex: 1;
  height: 4px;
  background: $bg;
  border-radius: 2px;
  overflow: hidden;
}

.pl-table__progress-fill {
  height: 100%;
  border-radius: 2px;

  &--green { background: #16a34a; }
  &--amber { background: #f59e0b; }
  &--blue { background: $accent; }
  &--slate { background: #94a3b8; }
}

.pl-table__progress-pct {
  font-size: 10px;
  font-weight: 700;
  color: $text-muted;
  font-variant-numeric: tabular-nums;
  min-width: 28px;
  text-align: right;
}

.pl-table__status {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 5px;
  white-space: nowrap;

  &--green { background: #dcfce7; color: #15803d; }
  &--amber { background: #fef3c7; color: #b45309; }
  &--blue { background: #dbeafe; color: #1d4ed8; }
  &--slate { background: #f1f5f9; color: #64748b; }
}

// ── Empty state ──
.pl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: $text-muted;
  text-align: center;

  p {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
  }

  &__btn {
    font-size: 12.5px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    color: $accent;
    background: $accent-light;
    border: none;
    padding: 8px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.12s;
    &:hover { background: #dde3fc; }
  }
}
</style>
