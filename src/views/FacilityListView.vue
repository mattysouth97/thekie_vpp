<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  IcoSolar, IcoWind, IcoBattery, IcoHydro, IcoFuelCell,
  IcoArrowRight, IcoMapPin, IcoCheck, IcoLightning,
  IcoChartUp, IcoChartDown, IcoMeter, IcoBell,
  IcoSearch, IcoClose, IcoInfo, IcoSettings,
} from "@/components/icons";

const router = useRouter();

// ── Facility data ──

interface FacilityAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  source: string;
  resolved: boolean;
}

interface FacilityItem {
  id: string;
  projectName: string;
  type: string;
  typeIcon: string;
  location: string;
  capacity: string;
  status: "normal" | "warning" | "maintenance" | "offline";
  statusLabel: string;
  currentOutput: string;
  dailyGeneration: string;
  availability: number;
  nextMaintenance: string;
  maintenanceType: string;
  lastInspection: string;
  alerts: FacilityAlert[];
}

interface OmSchedule {
  id: string;
  facilityId: string;
  facilityName: string;
  date: string;
  daysUntil: number;
  type: "inspection" | "cleaning" | "repair" | "replacement";
  typeLabel: string;
  description: string;
  status: "scheduled" | "in_progress" | "completed";
}

const facilities: FacilityItem[] = [
  {
    id: "dangjin-solar", projectName: "충남 당진 태양광 1호", type: "태양광", typeIcon: "solar",
    location: "충남 당진시 석문면", capacity: "2.5 MW", status: "normal", statusLabel: "정상 가동",
    currentOutput: "2.1 MW", dailyGeneration: "12.4 MWh", availability: 98.2,
    nextMaintenance: "2026-03-15", maintenanceType: "패널 세정", lastInspection: "2026-01-20",
    alerts: [
      { id: "a1", severity: "warning", message: "일사량 대비 출력 92% — 모니터링 중", timestamp: "2시간 전", source: "RTU", resolved: false },
    ],
  },
  {
    id: "jeju-wind", projectName: "제주 한림 풍력 3호", type: "풍력", typeIcon: "wind",
    location: "제주 한림읍 금능리", capacity: "5.0 MW", status: "warning", statusLabel: "출력 저하",
    currentOutput: "3.2 MW", dailyGeneration: "38.6 MWh", availability: 89.1,
    nextMaintenance: "2026-03-02", maintenanceType: "블레이드 점검", lastInspection: "2026-02-10",
    alerts: [
      { id: "a2", severity: "warning", message: "블레이드 #2 결빙 감지 — 자동 제빙 가동", timestamp: "1시간 전", source: "SCADA", resolved: false },
      { id: "a3", severity: "info", message: "풍속 7.8m/s → 정상 범위", timestamp: "3시간 전", source: "RTU", resolved: true },
    ],
  },
  {
    id: "ansan-ess", projectName: "경기 안산 ESS 2호", type: "ESS", typeIcon: "battery",
    location: "경기 안산시 단원구", capacity: "1.2 MWh", status: "maintenance", statusLabel: "점검 예정",
    currentOutput: "0.8 MW", dailyGeneration: "4.2 MWh", availability: 95.4,
    nextMaintenance: "2026-03-04", maintenanceType: "정기 점검", lastInspection: "2025-12-15",
    alerts: [
      { id: "a4", severity: "info", message: "정기 점검 D-5 알림", timestamp: "오늘", source: "BMS", resolved: false },
      { id: "a5", severity: "info", message: "SOC 72% — 정상 범위", timestamp: "30분 전", source: "BMS", resolved: true },
    ],
  },
  {
    id: "boryeong-solar", projectName: "충남 보령 수상태양광", type: "태양광", typeIcon: "solar",
    location: "충남 보령시 청라면", capacity: "3.8 MW", status: "normal", statusLabel: "시운전 중",
    currentOutput: "1.4 MW", dailyGeneration: "6.8 MWh", availability: 92.0,
    nextMaintenance: "2026-04-01", maintenanceType: "준공 후 점검", lastInspection: "—",
    alerts: [
      { id: "a6", severity: "info", message: "시운전 3일차 — 출력 안정화 중", timestamp: "오늘", source: "RTU", resolved: false },
    ],
  },
  {
    id: "gunsan-wind", projectName: "전북 군산 해상풍력", type: "풍력", typeIcon: "wind",
    location: "전북 군산시 옥도면", capacity: "8.0 MW", status: "offline", statusLabel: "건설 중",
    currentOutput: "—", dailyGeneration: "—", availability: 0,
    nextMaintenance: "—", maintenanceType: "—", lastInspection: "—",
    alerts: [],
  },
  {
    id: "sejong-agri-solar", projectName: "세종 영농형 태양광", type: "태양광", typeIcon: "solar",
    location: "세종시 연서면", capacity: "1.0 MW", status: "normal", statusLabel: "정상 가동",
    currentOutput: "0.82 MW", dailyGeneration: "4.9 MWh", availability: 97.8,
    nextMaintenance: "2026-04-10", maintenanceType: "정기 점검", lastInspection: "2026-01-05",
    alerts: [],
  },
  {
    id: "gimpo-ppa", projectName: "김포 물류센터 PPA", type: "태양광", typeIcon: "solar",
    location: "경기 김포시 양촌읍", capacity: "2.0 MW", status: "warning", statusLabel: "인버터 이상",
    currentOutput: "1.3 MW", dailyGeneration: "7.1 MWh", availability: 85.6,
    nextMaintenance: "2026-03-01", maintenanceType: "인버터 수리",lastInspection: "2026-02-20",
    alerts: [
      { id: "a7", severity: "critical", message: "인버터 #3 출력 0 — 긴급 점검 필요", timestamp: "30분 전", source: "RTU", resolved: false },
      { id: "a8", severity: "warning", message: "인버터 #2 온도 78°C — 과열 주의", timestamp: "1시간 전", source: "RTU", resolved: false },
    ],
  },
  {
    id: "naju-fit", projectName: "나주 에너지밸리 태양광", type: "태양광", typeIcon: "solar",
    location: "전남 나주시 산포면", capacity: "3.0 MW", status: "normal", statusLabel: "정상 가동",
    currentOutput: "2.6 MW", dailyGeneration: "14.2 MWh", availability: 99.1,
    nextMaintenance: "2026-05-01", maintenanceType: "정기 점검", lastInspection: "2026-02-01",
    alerts: [],
  },
  {
    id: "hwaseong-self", projectName: "화성 공장 자가소비", type: "태양광", typeIcon: "solar",
    location: "경기 화성시 팔탄면", capacity: "0.5 MW", status: "normal", statusLabel: "정상 가동",
    currentOutput: "0.41 MW", dailyGeneration: "2.3 MWh", availability: 96.5,
    nextMaintenance: "2026-03-20", maintenanceType: "패널 세정", lastInspection: "2025-11-15",
    alerts: [],
  },
  {
    id: "yeongam-rental", projectName: "영암 태양광 렌탈", type: "태양광", typeIcon: "solar",
    location: "전남 영암군 삼호읍", capacity: "1.5 MW", status: "maintenance", statusLabel: "패널 세정 중",
    currentOutput: "0 MW", dailyGeneration: "3.8 MWh", availability: 94.2,
    nextMaintenance: "진행 중", maintenanceType: "패널 세정", lastInspection: "2026-02-27",
    alerts: [
      { id: "a9", severity: "info", message: "패널 세정 작업 진행 중 (14:00~17:00)", timestamp: "진행 중", source: "O&M팀", resolved: false },
    ],
  },
  {
    id: "chungju-hydro", projectName: "충주댐 소수력 발전", type: "소수력", typeIcon: "hydro",
    location: "충북 충주시 동량면", capacity: "2.0 MW", status: "normal", statusLabel: "정상 가동",
    currentOutput: "1.7 MW", dailyGeneration: "38.4 MWh", availability: 99.5,
    nextMaintenance: "2026-06-01", maintenanceType: "터빈 점검", lastInspection: "2026-01-10",
    alerts: [],
  },
  {
    id: "ulsan-hydrogen", projectName: "울산 수소연료전지", type: "연료전지", typeIcon: "fuelcell",
    location: "울산 남구 매암동", capacity: "5.0 MW", status: "offline", statusLabel: "건설 중",
    currentOutput: "—", dailyGeneration: "—", availability: 0,
    nextMaintenance: "—", maintenanceType: "—", lastInspection: "—",
    alerts: [],
  },
];

const omSchedules: OmSchedule[] = [
  { id: "om1", facilityId: "gimpo-ppa", facilityName: "김포 물류센터 PPA", date: "2026-03-01", daysUntil: 2, type: "repair", typeLabel: "인버터 수리", description: "인버터 #3 교체 및 #2 냉각 시스템 점검", status: "scheduled" },
  { id: "om2", facilityId: "jeju-wind", facilityName: "제주 한림 풍력 3호", date: "2026-03-02", daysUntil: 3, type: "inspection", typeLabel: "블레이드 점검", description: "결빙 감지 후 블레이드 전수 점검", status: "scheduled" },
  { id: "om3", facilityId: "ansan-ess", facilityName: "경기 안산 ESS 2호", date: "2026-03-04", daysUntil: 5, type: "inspection", typeLabel: "정기 점검", description: "BMS 업데이트 + 셀 밸런싱 + 소방 설비 점검", status: "scheduled" },
  { id: "om4", facilityId: "yeongam-rental", facilityName: "영암 태양광 렌탈", date: "2026-02-27", daysUntil: 0, type: "cleaning", typeLabel: "패널 세정", description: "전체 패널 세정 작업 (14:00~17:00)", status: "in_progress" },
  { id: "om5", facilityId: "dangjin-solar", facilityName: "충남 당진 태양광 1호", date: "2026-03-15", daysUntil: 16, type: "cleaning", typeLabel: "패널 세정", description: "1분기 정기 패널 세정", status: "scheduled" },
  { id: "om6", facilityId: "hwaseong-self", facilityName: "화성 공장 자가소비", date: "2026-03-20", daysUntil: 21, type: "cleaning", typeLabel: "패널 세정", description: "공장 옥상 패널 세정", status: "scheduled" },
  { id: "om7", facilityId: "naju-fit", facilityName: "나주 에너지밸리", date: "2026-02-25", daysUntil: -2, type: "inspection", typeLabel: "정기 점검", description: "2월 정기 점검 완료", status: "completed" },
  { id: "om8", facilityId: "sejong-agri-solar", facilityName: "세종 영농형 태양광", date: "2026-04-10", daysUntil: 42, type: "inspection", typeLabel: "정기 점검", description: "영농형 특수 구조물 안전 점검", status: "scheduled" },
];

// ── Filters ──
const filterType = ref<string>("all");
const filterStatus = ref<string>("all");
const searchQuery = ref("");

const filteredFacilities = computed(() => {
  let result = facilities;
  if (filterType.value !== "all") result = result.filter(f => f.type === filterType.value);
  if (filterStatus.value !== "all") result = result.filter(f => f.status === filterStatus.value);
  const q = searchQuery.value.trim().toLowerCase();
  if (q) result = result.filter(f => f.projectName.toLowerCase().includes(q) || f.location.toLowerCase().includes(q));
  return result;
});

// ── Stats ──
const stats = computed(() => ({
  total: facilities.length,
  normal: facilities.filter(f => f.status === "normal").length,
  warning: facilities.filter(f => f.status === "warning").length,
  maintenance: facilities.filter(f => f.status === "maintenance").length,
  offline: facilities.filter(f => f.status === "offline").length,
  totalAlerts: facilities.reduce((s, f) => s + f.alerts.filter(a => !a.resolved).length, 0),
}));

// ── All unresolved alerts sorted by severity ──
const allAlerts = computed(() => {
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  return facilities
    .flatMap(f => f.alerts.filter(a => !a.resolved).map(a => ({ ...a, facilityName: f.projectName, facilityId: f.id })))
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
});

const upcomingOm = computed(() =>
  omSchedules.filter(s => s.status !== "completed").sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 6),
);

function goProject(id: string) {
  router.push(`/projects/${id}`);
}
</script>

<template>
  <div class="fl">
    <!-- Header -->
    <div class="fl-header">
      <div>
        <h1 class="fl-header__title">설비 관리</h1>
        <p class="fl-header__sub">RTU 실시간 모니터링 · O&M 서비스 관리</p>
      </div>
    </div>

    <!-- KPI stats -->
    <div class="fl-stats">
      <div class="fl-stat">
        <span class="fl-stat__num">{{ stats.total }}</span>
        <span class="fl-stat__label">전체 설비</span>
      </div>
      <div class="fl-stat fl-stat--green">
        <span class="fl-stat__num">{{ stats.normal }}</span>
        <span class="fl-stat__label">정상 가동</span>
      </div>
      <div class="fl-stat fl-stat--amber">
        <span class="fl-stat__num">{{ stats.warning + stats.maintenance }}</span>
        <span class="fl-stat__label">점검 필요</span>
      </div>
      <div class="fl-stat fl-stat--red">
        <span class="fl-stat__num">{{ stats.totalAlerts }}</span>
        <span class="fl-stat__label">미처리 알림</span>
      </div>
    </div>

    <!-- Alerts panel -->
    <section v-if="allAlerts.length" class="fl-alerts">
      <div class="fl-alerts__head">
        <IcoBell :size="15" :strokeWidth="2" />
        <h2 class="fl-section-title">실시간 알림</h2>
        <span class="fl-alerts__count">{{ allAlerts.length }}건</span>
      </div>
      <div class="fl-alerts__list">
        <div
          v-for="alert in allAlerts"
          :key="alert.id"
          class="fl-alert"
          :class="`fl-alert--${alert.severity}`"
          @click="goProject(alert.facilityId)"
        >
          <div class="fl-alert__icon">
            <IcoBell v-if="alert.severity === 'critical'" :size="14" :strokeWidth="2.5" />
            <IcoInfo v-else-if="alert.severity === 'warning'" :size="14" :strokeWidth="2" />
            <IcoCheck v-else :size="14" :strokeWidth="2" />
          </div>
          <div class="fl-alert__body">
            <span class="fl-alert__facility">{{ alert.facilityName }}</span>
            <span class="fl-alert__msg">{{ alert.message }}</span>
          </div>
          <div class="fl-alert__meta">
            <span class="fl-alert__source">{{ alert.source }}</span>
            <span class="fl-alert__time">{{ alert.timestamp }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <div class="fl-toolbar">
      <div class="fl-toolbar__filters">
        <select v-model="filterType" class="fl-toolbar__select">
          <option value="all">전체 유형</option>
          <option value="태양광">태양광</option>
          <option value="풍력">풍력</option>
          <option value="ESS">ESS</option>
          <option value="소수력">소수력</option>
          <option value="연료전지">연료전지</option>
        </select>
        <select v-model="filterStatus" class="fl-toolbar__select">
          <option value="all">전체 상태</option>
          <option value="normal">정상 가동</option>
          <option value="warning">주의</option>
          <option value="maintenance">점검</option>
          <option value="offline">오프라인</option>
        </select>
      </div>
      <div class="fl-toolbar__search">
        <IcoSearch :size="13" :strokeWidth="2" />
        <input v-model="searchQuery" type="text" placeholder="발전소명, 지역 검색..." class="fl-toolbar__input" />
      </div>
    </div>

    <!-- Facility list -->
    <div class="fl-list">
      <div
        v-for="f in filteredFacilities"
        :key="f.id"
        class="fl-row"
        :class="`fl-row--${f.status}`"
        @click="goProject(f.id)"
      >
        <div class="fl-row__icon" :class="`fl-row__icon--${f.typeIcon}`">
          <IcoSolar v-if="f.typeIcon === 'solar'" :size="16" :strokeWidth="2" />
          <IcoWind v-else-if="f.typeIcon === 'wind'" :size="16" :strokeWidth="2" />
          <IcoBattery v-else-if="f.typeIcon === 'battery'" :size="16" :strokeWidth="2" />
          <IcoHydro v-else-if="f.typeIcon === 'hydro'" :size="16" :strokeWidth="2" />
          <IcoFuelCell v-else :size="16" :strokeWidth="2" />
        </div>
        <div class="fl-row__main">
          <div class="fl-row__top">
            <span class="fl-row__name">{{ f.projectName }}</span>
            <span class="fl-row__status" :class="`fl-row__status--${f.status}`">
              <span class="fl-row__dot"></span>
              {{ f.statusLabel }}
            </span>
          </div>
          <div class="fl-row__location">
            <IcoMapPin :size="11" :strokeWidth="2" />
            {{ f.location }} · {{ f.capacity }}
          </div>
        </div>
        <div class="fl-row__metrics">
          <div class="fl-row__metric">
            <span class="fl-row__metric-val">{{ f.currentOutput }}</span>
            <span class="fl-row__metric-label">현재 출력</span>
          </div>
          <div class="fl-row__metric">
            <span class="fl-row__metric-val">{{ f.dailyGeneration }}</span>
            <span class="fl-row__metric-label">금일 발전</span>
          </div>
          <div class="fl-row__metric">
            <span class="fl-row__metric-val" :class="{ 'fl-row__metric-val--warn': f.availability < 90 && f.availability > 0 }">
              {{ f.availability > 0 ? f.availability + '%' : '—' }}
            </span>
            <span class="fl-row__metric-label">가동률</span>
          </div>
          <div class="fl-row__metric">
            <span class="fl-row__metric-val">{{ f.nextMaintenance === '—' || f.nextMaintenance === '진행 중' ? f.nextMaintenance : f.nextMaintenance.slice(5) }}</span>
            <span class="fl-row__metric-label">다음 점검</span>
          </div>
        </div>
        <div v-if="f.alerts.filter(a => !a.resolved).length" class="fl-row__alert-badge">
          {{ f.alerts.filter(a => !a.resolved).length }}
        </div>
        <IcoArrowRight class="fl-row__arrow" :size="14" :strokeWidth="2" />
      </div>
    </div>

    <!-- O&M Schedule -->
    <section class="fl-om">
      <div class="fl-om__head">
        <IcoSettings :size="15" :strokeWidth="2" />
        <h2 class="fl-section-title">O&M 일정</h2>
      </div>
      <div class="fl-om__list">
        <div
          v-for="s in upcomingOm"
          :key="s.id"
          class="fl-om-item"
          :class="{
            'fl-om-item--urgent': s.daysUntil <= 3 && s.daysUntil >= 0,
            'fl-om-item--active': s.status === 'in_progress',
          }"
        >
          <div class="fl-om-item__date">
            <span class="fl-om-item__day">{{ s.date.slice(8) }}</span>
            <span class="fl-om-item__month">{{ s.date.slice(5, 7) }}월</span>
          </div>
          <div class="fl-om-item__body">
            <span class="fl-om-item__name">{{ s.facilityName }}</span>
            <span class="fl-om-item__type">{{ s.typeLabel }}</span>
            <span class="fl-om-item__desc">{{ s.description }}</span>
          </div>
          <div class="fl-om-item__right">
            <span v-if="s.status === 'in_progress'" class="fl-om-item__badge fl-om-item__badge--active">진행 중</span>
            <span v-else-if="s.daysUntil <= 3" class="fl-om-item__badge fl-om-item__badge--urgent">D-{{ s.daysUntil }}</span>
            <span v-else class="fl-om-item__badge">D-{{ s.daysUntil }}</span>
          </div>
        </div>
      </div>
    </section>
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

.fl {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px 28px;
  max-width: 100%;
  @media (max-width: 768px) { padding: 12px 10px 20px; }
}

.fl-header {
  &__title { font-size: 18px; font-weight: 900; color: $text-primary; letter-spacing: -0.03em; margin: 0 0 3px; }
  &__sub { font-size: 12px; color: $text-secondary; margin: 0; }
}

.fl-section-title { font-size: 13px; font-weight: 800; color: $text-primary; margin: 0; }

// ── Stats ──
.fl-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  @media (max-width: 500px) { grid-template-columns: repeat(2, 1fr); }
}
.fl-stat {
  background: $surface; border: 1px solid $border; border-radius: 8px; padding: 10px 12px;
  display: flex; flex-direction: column; gap: 2px;
  &--green { border-left: 3px solid #16a34a; }
  &--amber { border-left: 3px solid #f59e0b; }
  &--red { border-left: 3px solid #dc2626; }
  &__num { font-size: 18px; font-weight: 900; color: $text-primary; font-variant-numeric: tabular-nums; }
  &__label { font-size: 11px; font-weight: 600; color: $text-muted; }
}

// ── Alerts ──
.fl-alerts {
  background: $surface; border: 1px solid $border; border-radius: 10px; padding: 12px 14px;
  &__head { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; svg { color: #dc2626; } }
  &__count { font-size: 11px; font-weight: 700; color: #dc2626; background: #fef2f2; padding: 3px 9px; border-radius: 10px; margin-left: auto; }
  &__list { display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto; }
}
.fl-alert {
  display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 8px;
  cursor: pointer; transition: background 0.12s; border-left: 3px solid transparent;
  &--critical { background: #fef2f2; border-left-color: #dc2626; }
  &--warning { background: #fffbeb; border-left-color: #f59e0b; }
  &--info { background: $bg; border-left-color: #94a3b8; }
  &:hover { filter: brightness(0.97); }
  &__icon {
    width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; background: rgba(255,255,255,0.8);
  }
  &--critical &__icon { color: #dc2626; }
  &--warning &__icon { color: #d97706; }
  &--info &__icon { color: #94a3b8; }
  &__body { flex: 1; min-width: 0; }
  &__facility { font-size: 12px; font-weight: 700; color: $text-primary; display: block; }
  &__msg { font-size: 11.5px; color: $text-secondary; line-height: 1.4; }
  &__meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
  &__source { font-size: 9.5px; font-weight: 700; color: $text-muted; background: $bg; padding: 2px 6px; border-radius: 4px; }
  &__time { font-size: 10px; color: $text-muted; white-space: nowrap; }
}

// ── Toolbar ──
.fl-toolbar {
  display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;
  &__filters { display: flex; gap: 6px; }
  &__select {
    font-size: 11.5px; font-weight: 600; font-family: "Inter", sans-serif; color: $text-secondary;
    background: $surface; border: 1px solid $border; border-radius: 6px; padding: 5px 10px; cursor: pointer; outline: none;
    &:focus { border-color: $accent; }
  }
  &__search {
    display: flex; align-items: center; gap: 5px; background: $surface; border: 1px solid $border;
    border-radius: 8px; padding: 5px 10px; min-width: 180px;
    svg { color: $text-muted; }
    &:focus-within { border-color: $accent; }
  }
  &__input {
    border: none; background: none; outline: none; font-size: 12px; font-family: "Inter", sans-serif;
    color: $text-primary; flex: 1; min-width: 0;
    &::placeholder { color: $text-muted; }
  }
}

// ── Facility rows ──
.fl-list { display: flex; flex-direction: column; gap: 6px; }
.fl-row {
  display: flex; align-items: center; gap: 10px; background: $surface; border: 1px solid $border;
  border-radius: 8px; padding: 10px 12px; cursor: pointer; transition: border-color 0.12s, box-shadow 0.12s;
  &:hover { border-color: $accent; box-shadow: 0 2px 12px rgba(79,106,245,0.06); }
  &--warning { border-left: 3px solid #f59e0b; }
  &--maintenance { border-left: 3px solid #3b82f6; }
  &--offline { border-left: 3px solid #94a3b8; opacity: 0.7; }

  &__icon {
    width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    &--solar { background: #fef3c7; color: #d97706; }
    &--wind { background: #cffafe; color: #0891b2; }
    &--battery { background: #dcfce7; color: #16a34a; }
    &--hydro { background: #dbeafe; color: #2563eb; }
    &--fuelcell { background: #ede9fe; color: #7c3aed; }
  }
  &__main { flex: 1; min-width: 0; }
  &__top { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
  &__name { font-size: 13.5px; font-weight: 700; color: $text-primary; }
  &__status {
    display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 5px;
    &--normal { color: #15803d; background: #dcfce7; }
    &--warning { color: #b45309; background: #fef3c7; }
    &--maintenance { color: #1d4ed8; background: #dbeafe; }
    &--offline { color: #64748b; background: #f1f5f9; }
  }
  &__dot {
    width: 6px; height: 6px; border-radius: 50%; display: inline-block;
    .fl-row__status--normal & { background: #16a34a; }
    .fl-row__status--warning & { background: #f59e0b; }
    .fl-row__status--maintenance & { background: #3b82f6; }
    .fl-row__status--offline & { background: #94a3b8; }
  }
  &__location { font-size: 11px; color: $text-muted; display: flex; align-items: center; gap: 3px; svg { flex-shrink: 0; } }
  &__metrics {
    display: flex; gap: 10px; flex-shrink: 0;
    @media (max-width: 700px) { display: none; }
  }
  &__metric { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 60px; }
  &__metric-val {
    font-size: 12.5px; font-weight: 800; color: $text-primary; font-variant-numeric: tabular-nums;
    &--warn { color: #f59e0b; }
  }
  &__metric-label { font-size: 9.5px; font-weight: 600; color: $text-muted; }
  &__alert-badge {
    width: 20px; height: 20px; border-radius: 50%; background: #dc2626; color: #fff; font-size: 10px; font-weight: 800;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  &__arrow { color: $text-muted; flex-shrink: 0; }
}

// ── O&M Schedule ──
.fl-om {
  background: $surface; border: 1px solid $border; border-radius: 10px; padding: 12px 14px;
  &__head { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; svg { color: $accent; } }
  &__list { display: flex; flex-direction: column; gap: 5px; }
}
.fl-om-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; background: $bg;
  border-left: 3px solid $border; transition: background 0.1s;
  &--urgent { border-left-color: #f59e0b; background: #fffbeb; }
  &--active { border-left-color: #3b82f6; background: #eff6ff; }
  &__date { display: flex; flex-direction: column; align-items: center; min-width: 36px; flex-shrink: 0; }
  &__day { font-size: 16px; font-weight: 900; color: $text-primary; line-height: 1; }
  &__month { font-size: 10px; font-weight: 600; color: $text-muted; }
  &__body { flex: 1; min-width: 0; }
  &__name { font-size: 13px; font-weight: 700; color: $text-primary; display: block; }
  &__type { font-size: 11px; font-weight: 600; color: $accent; display: block; margin: 2px 0; }
  &__desc { font-size: 11px; color: $text-secondary; line-height: 1.4; }
  &__right { flex-shrink: 0; }
  &__badge {
    font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 5px;
    color: $text-muted; background: $surface; border: 1px solid $border;
    &--urgent { color: #b45309; background: #fef3c7; border-color: #fde68a; }
    &--active { color: #1d4ed8; background: #dbeafe; border-color: #bfdbfe; }
  }
}
</style>
