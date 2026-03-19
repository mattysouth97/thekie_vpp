<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/stores/project-store";
import { useAuthStore } from "@/stores/auth-store";
import { useBlockchainStore } from "@/stores/blockchain-store";
import {
  IcoSolar, IcoWind, IcoBattery,
  IcoArrowRight, IcoChartUp, IcoUsers, IcoDocument,
  IcoBlockchain, IcoLightning, IcoBuilding,
} from "@/components/icons";

const router = useRouter();
const projectStore = useProjectStore();
const authStore = useAuthStore();
const blockchainStore = useBlockchainStore();

onMounted(async () => {
  await Promise.all([
    projectStore.loadProjects(),
    blockchainStore.loadRecords(),
  ]);
});

const myProjects = computed(() =>
  projectStore.getProjectsByDeveloper(authStore.user?.id ?? ""),
);

// ── KPI computeds ──
const totalProjects = computed(() => myProjects.value.length);
const totalMw = computed(() =>
  myProjects.value.reduce((s, p) => s + p.capacityMw, 0),
);
const totalFunding = computed(() =>
  myProjects.value.reduce((s, p) => s + p.currentFunding, 0),
);
const avgYield = computed(() => {
  if (myProjects.value.length === 0) return 0;
  return myProjects.value.reduce((s, p) => s + p.yieldRate, 0) / myProjects.value.length;
});
const totalInvestors = computed(() =>
  myProjects.value.reduce((s, p) => s + p.investorCount, 0),
);

// ── Blockchain recent ──
const recentRecords = computed(() =>
  [...blockchainStore.records]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5),
);

// ── Helpers ──
function formatWon(amount: number): string {
  if (amount >= 100_000_000) {
    return `${(amount / 100_000_000).toFixed(1)}억`;
  }
  if (amount >= 10_000) {
    return `${(amount / 10_000).toFixed(0)}만`;
  }
  return amount.toLocaleString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shortHash(hash: string): string {
  return hash.slice(0, 10) + "..." + hash.slice(-6);
}

const recordTypeLabel: Record<string, string> = {
  settlement: "정산",
  generation: "발전",
  milestone: "마일스톤",
  lease: "임대",
  rec_issuance: "REC 발급",
  community_benefit: "지역수혜",
};

const recordTypeColor: Record<string, string> = {
  settlement: "blue",
  generation: "green",
  milestone: "violet",
  lease: "amber",
  rec_issuance: "teal",
  community_benefit: "rose",
};

function goProject(id: string) {
  router.push(`/developer/projects/${id}`);
}
</script>

<template>
  <div class="dd">
    <!-- Header -->
    <div class="dd-header">
      <div class="dd-header__left">
        <h1 class="dd-header__title">개발사 대시보드</h1>
        <p class="dd-header__sub">{{ authStore.displayName || '개발사' }} -- 프로젝트 현황 및 관리</p>
      </div>
      <router-link to="/developer/projects/new" class="dd-header__cta">
        <IcoDocument :size="14" :strokeWidth="2" />
        새 프로젝트 등록
      </router-link>
    </div>

    <!-- KPI Cards -->
    <div class="dd-kpis">
      <div class="dd-kpi">
        <div class="dd-kpi__icon dd-kpi__icon--blue">
          <IcoBuilding :size="16" :strokeWidth="2" />
        </div>
        <div class="dd-kpi__body">
          <span class="dd-kpi__value">{{ totalProjects }}</span>
          <span class="dd-kpi__label">전체 프로젝트</span>
        </div>
      </div>
      <div class="dd-kpi">
        <div class="dd-kpi__icon dd-kpi__icon--amber">
          <IcoLightning :size="16" :strokeWidth="2" />
        </div>
        <div class="dd-kpi__body">
          <span class="dd-kpi__value">{{ totalMw.toFixed(1) }}<small>MW</small></span>
          <span class="dd-kpi__label">총 설비용량</span>
        </div>
      </div>
      <div class="dd-kpi">
        <div class="dd-kpi__icon dd-kpi__icon--green">
          <IcoChartUp :size="16" :strokeWidth="2" />
        </div>
        <div class="dd-kpi__body">
          <span class="dd-kpi__value dd-kpi__value--won">{{ formatWon(totalFunding) }}</span>
          <span class="dd-kpi__label">총 모집 금액</span>
        </div>
      </div>
      <div class="dd-kpi">
        <div class="dd-kpi__icon dd-kpi__icon--violet">
          <IcoChartUp :size="16" :strokeWidth="2" />
        </div>
        <div class="dd-kpi__body">
          <span class="dd-kpi__value dd-kpi__value--accent">{{ avgYield.toFixed(1) }}<small>%</small></span>
          <span class="dd-kpi__label">평균 기대수익</span>
        </div>
      </div>
      <div class="dd-kpi">
        <div class="dd-kpi__icon dd-kpi__icon--teal">
          <IcoUsers :size="16" :strokeWidth="2" />
        </div>
        <div class="dd-kpi__body">
          <span class="dd-kpi__value">{{ totalInvestors.toLocaleString() }}</span>
          <span class="dd-kpi__label">총 투자자 수</span>
        </div>
      </div>
    </div>

    <!-- Project Pipeline Table -->
    <div class="dd-card">
      <div class="dd-card__head">
        <span class="dd-card__title">프로젝트 파이프라인</span>
        <router-link to="/developer/projects" class="dd-card__link">
          전체 보기
          <IcoArrowRight :size="12" :strokeWidth="2.5" />
        </router-link>
      </div>

      <div v-if="myProjects.length" class="dd-table-wrap">
        <table class="dd-table">
          <thead>
            <tr>
              <th class="dd-table__th">프로젝트명</th>
              <th class="dd-table__th">유형</th>
              <th class="dd-table__th dd-table__th--right">설비용량</th>
              <th class="dd-table__th">상태</th>
              <th class="dd-table__th">모집 진행률</th>
              <th class="dd-table__th dd-table__th--right">투자자</th>
              <th class="dd-table__th dd-table__th--right">모집 금액</th>
              <th class="dd-table__th"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in myProjects"
              :key="p.id"
              class="dd-table__row"
              @click="goProject(p.id)"
            >
              <td class="dd-table__td">
                <div class="dd-table__project">
                  <div class="dd-table__icon" :class="`dd-table__icon--${p.typeIcon}`">
                    <IcoSolar v-if="p.typeIcon === 'solar'" :size="13" :strokeWidth="2" />
                    <IcoWind v-else-if="p.typeIcon === 'wind'" :size="13" :strokeWidth="2" />
                    <IcoBattery v-else :size="13" :strokeWidth="2" />
                  </div>
                  <div>
                    <span class="dd-table__name">{{ p.name }}</span>
                    <span class="dd-table__location">{{ p.location }}</span>
                  </div>
                </div>
              </td>
              <td class="dd-table__td">
                <span class="dd-table__type">{{ p.type }}</span>
              </td>
              <td class="dd-table__td dd-table__td--right dd-table__td--mono">{{ p.capacity }}</td>
              <td class="dd-table__td">
                <span class="dd-table__status" :class="`dd-table__status--${p.statusColor}`">{{ p.status }}</span>
              </td>
              <td class="dd-table__td">
                <div class="dd-table__progress">
                  <div class="dd-table__progress-bar">
                    <div
                      class="dd-table__progress-fill"
                      :class="`dd-table__progress-fill--${p.statusColor}`"
                      :style="{ width: p.progress + '%' }"
                    ></div>
                  </div>
                  <span class="dd-table__progress-pct">{{ p.progress }}%</span>
                </div>
              </td>
              <td class="dd-table__td dd-table__td--right dd-table__td--mono">{{ p.investorCount.toLocaleString() }}명</td>
              <td class="dd-table__td dd-table__td--right dd-table__td--mono">
                {{ formatWon(p.currentFunding) }} / {{ formatWon(p.totalFundingRequired) }}
              </td>
              <td class="dd-table__td dd-table__td--action">
                <IcoArrowRight :size="13" :strokeWidth="2" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="dd-empty">
        <IcoBuilding :size="28" :strokeWidth="1.5" />
        <p>등록된 프로젝트가 없습니다</p>
        <router-link to="/developer/projects/new" class="dd-empty__btn">첫 프로젝트 등록하기</router-link>
      </div>
    </div>

    <!-- Recent Blockchain Records -->
    <div class="dd-card">
      <div class="dd-card__head">
        <span class="dd-card__title">
          <IcoBlockchain :size="14" :strokeWidth="2" />
          최근 블록체인 기록
        </span>
        <span class="dd-card__sub">전체 플랫폼 최근 5건</span>
      </div>

      <div v-if="recentRecords.length" class="dd-bc-list">
        <div v-for="r in recentRecords" :key="r.id" class="dd-bc-row">
          <span
            class="dd-bc-badge"
            :class="`dd-bc-badge--${recordTypeColor[r.recordType] ?? 'blue'}`"
          >
            {{ recordTypeLabel[r.recordType] ?? r.recordType }}
          </span>
          <div class="dd-bc-info">
            <span class="dd-bc-project">{{ r.projectName }}</span>
            <span class="dd-bc-hash">{{ shortHash(r.txHash) }}</span>
          </div>
          <span class="dd-bc-date">{{ formatDate(r.createdAt) }}</span>
        </div>
      </div>

      <div v-else class="dd-bc-empty">
        블록체인 기록이 없습니다.
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$accent: #4F6AF5;
$accent-light: #eef1fe;
$surface: #ffffff;
$bg: #f8fafc;
$border: #e2e8f0;
$text-primary: #0f172a;
$text-secondary: #475569;
$text-muted: #94a3b8;
$shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);

.dd {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px 28px;

  @media (max-width: 768px) {
    padding: 12px 10px 20px;
  }
}

// ── Header ──
.dd-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;

  &__left {
    flex: 1;
    min-width: 0;
  }

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

  &__cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    color: #fff;
    background: $accent;
    border: none;
    border-radius: 8px;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    white-space: nowrap;
    flex-shrink: 0;

    &:hover {
      background: #3d58e0;
      transform: translateY(-1px);
    }
  }
}

// ── KPI Cards ──
.dd-kpis {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.dd-kpi {
  display: flex;
  align-items: center;
  gap: 10px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 12px;
  box-shadow: $shadow;

  &__icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--blue { background: #dbeafe; color: #2563eb; }
    &--amber { background: #fef3c7; color: #d97706; }
    &--green { background: #dcfce7; color: #16a34a; }
    &--violet { background: #ede9fe; color: #7c3aed; }
    &--teal { background: #ccfbf1; color: #0d9488; }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  &__value {
    font-size: 17px;
    font-weight: 900;
    color: $text-primary;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
    line-height: 1.1;

    small {
      font-size: 11px;
      font-weight: 600;
      margin-left: 1px;
    }

    &--accent { color: $accent; }
    &--won { color: #16a34a; }
  }

  &__label {
    font-size: 10.5px;
    font-weight: 600;
    color: $text-muted;
  }
}

// ── Card ──
.dd-card {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 14px;
  box-shadow: $shadow;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: $text-muted;
  }

  &__sub {
    font-size: 10px;
    color: $text-muted;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: $accent;
    text-decoration: none;
    transition: color 0.12s;

    &:hover { color: #3d58e0; }
  }
}

// ── Table ──
.dd-table-wrap {
  overflow-x: auto;
  margin: 0 -14px;
  padding: 0 14px;

  &::-webkit-scrollbar { height: 4px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
}

.dd-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 760px;
}

.dd-table__th {
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

.dd-table__row {
  cursor: pointer;
  transition: background 0.1s;

  &:hover { background: rgba($accent, 0.03); }

  &:not(:last-child) .dd-table__td {
    border-bottom: 1px solid rgba($border, 0.6);
  }
}

.dd-table__td {
  padding: 10px 8px;
  vertical-align: middle;
  white-space: nowrap;
  color: $text-secondary;

  &--right { text-align: right; }
  &--mono { font-variant-numeric: tabular-nums; font-weight: 600; color: $text-primary; }
  &--action { color: $text-muted; width: 28px; padding-right: 4px; }
}

.dd-table__project {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dd-table__icon {
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
}

.dd-table__name {
  font-size: 12px;
  font-weight: 700;
  color: $text-primary;
  display: block;
}

.dd-table__location {
  font-size: 10px;
  font-weight: 500;
  color: $text-muted;
  display: block;
}

.dd-table__type {
  font-size: 11px;
  font-weight: 600;
  color: $text-secondary;
}

.dd-table__status {
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

.dd-table__progress {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 90px;
}

.dd-table__progress-bar {
  flex: 1;
  height: 4px;
  background: $bg;
  border-radius: 2px;
  overflow: hidden;
}

.dd-table__progress-fill {
  height: 100%;
  border-radius: 2px;

  &--green { background: #16a34a; }
  &--amber { background: #f59e0b; }
  &--blue { background: $accent; }
  &--slate { background: #94a3b8; }
}

.dd-table__progress-pct {
  font-size: 10px;
  font-weight: 700;
  color: $text-muted;
  font-variant-numeric: tabular-nums;
  min-width: 28px;
  text-align: right;
}

// ── Empty ──
.dd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 20px;
  color: $text-muted;
  text-align: center;

  p {
    font-size: 13px;
    font-weight: 600;
    margin: 0;
  }

  &__btn {
    font-size: 12px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    color: #fff;
    background: $accent;
    border: none;
    padding: 8px 20px;
    border-radius: 8px;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.15s;

    &:hover { background: #3d58e0; }
  }
}

// ── Blockchain Records ──
.dd-bc-list {
  display: flex;
  flex-direction: column;
}

.dd-bc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid $border;

  &:last-child { border-bottom: none; }
}

.dd-bc-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 5px;
  flex-shrink: 0;
  white-space: nowrap;

  &--blue { background: #dbeafe; color: #2563eb; }
  &--green { background: #dcfce7; color: #16a34a; }
  &--violet { background: #ede9fe; color: #7c3aed; }
  &--amber { background: #fef3c7; color: #d97706; }
  &--teal { background: #ccfbf1; color: #0d9488; }
  &--rose { background: #ffe4e6; color: #e11d48; }
}

.dd-bc-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.dd-bc-project {
  font-size: 12px;
  font-weight: 600;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dd-bc-hash {
  font-size: 10px;
  font-family: "SF Mono", "Fira Code", monospace;
  color: $text-muted;
}

.dd-bc-date {
  font-size: 10.5px;
  font-weight: 500;
  color: $text-muted;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.dd-bc-empty {
  padding: 28px 0;
  text-align: center;
  font-size: 12px;
  color: $text-muted;
}
</style>
