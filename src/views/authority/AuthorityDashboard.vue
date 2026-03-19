<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useBlockchainStore } from "@/stores/blockchain-store";
import { useProjectStore } from "@/stores/project-store";
import {
  IcoLightning,
  IcoCoin,
  IcoGlobe,
  IcoChartUp,
  IcoUsers,
  IcoBlockchain,
  IcoBuilding,
  IcoMapPin,
  IcoCheck,
  IcoSolar,
} from "@/components/icons";

const blockchainStore = useBlockchainStore();
const projectStore = useProjectStore();

onMounted(async () => {
  await Promise.all([
    blockchainStore.loadRecords(),
    projectStore.loadProjects(),
  ]);
});

const stats = computed(() => blockchainStore.stats);

const treeEquivalent = computed(() => {
  const trees = Math.round(stats.value.totalCo2Avoided * 1000 / 22);
  return trees.toLocaleString();
});

const recentRecords = computed(() => {
  return [...blockchainStore.records]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
});

const typeLabels: Record<string, string> = {
  settlement: "정산",
  generation: "발전량",
  milestone: "마일스톤",
  lease: "임대",
  rec_issuance: "REC 발행",
  community_benefit: "지역사회",
};

const typeColors: Record<string, string> = {
  settlement: "blue",
  generation: "green",
  milestone: "violet",
  lease: "amber",
  rec_issuance: "teal",
  community_benefit: "pink",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
</script>

<template>
  <div class="auth-dash">
    <!-- Header -->
    <div class="auth-dash__header">
      <div class="auth-dash__header-text">
        <h1 class="auth-dash__title">관리기관 대시보드</h1>
        <p class="auth-dash__subtitle">플랫폼 전체 현황을 한눈에 확인합니다</p>
      </div>
      <div class="auth-dash__header-badge">
        <IcoBlockchain :size="16" :strokeWidth="2" />
        <span>블록체인 검증 플랫폼</span>
      </div>
    </div>

    <!-- KPI Grid: 2 rows x 4 cols -->
    <div class="auth-dash__kpi-grid">
      <div class="auth-dash__kpi">
        <div class="auth-dash__kpi-icon auth-dash__kpi-icon--blue">
          <IcoLightning :size="18" :strokeWidth="2" />
        </div>
        <div class="auth-dash__kpi-body">
          <span class="auth-dash__kpi-label">총 배치 용량</span>
          <span class="auth-dash__kpi-value">{{ stats.totalMwDeployed }} MW</span>
        </div>
      </div>

      <div class="auth-dash__kpi">
        <div class="auth-dash__kpi-icon auth-dash__kpi-icon--green">
          <IcoCoin :size="18" :strokeWidth="2" />
        </div>
        <div class="auth-dash__kpi-body">
          <span class="auth-dash__kpi-label">총 투자액</span>
          <span class="auth-dash__kpi-value">{{ stats.totalInvested }}</span>
        </div>
      </div>

      <div class="auth-dash__kpi">
        <div class="auth-dash__kpi-icon auth-dash__kpi-icon--emerald">
          <IcoGlobe :size="18" :strokeWidth="2" />
        </div>
        <div class="auth-dash__kpi-body">
          <span class="auth-dash__kpi-label">CO2 감축량</span>
          <span class="auth-dash__kpi-value">{{ stats.totalCo2Avoided.toLocaleString() }} tCO2</span>
          <span class="auth-dash__kpi-sub">= {{ treeEquivalent }}그루 나무</span>
        </div>
      </div>

      <div class="auth-dash__kpi">
        <div class="auth-dash__kpi-icon auth-dash__kpi-icon--violet">
          <IcoSolar :size="18" :strokeWidth="2" />
        </div>
        <div class="auth-dash__kpi-body">
          <span class="auth-dash__kpi-label">총 프로젝트</span>
          <span class="auth-dash__kpi-value">{{ stats.totalProjects }}개</span>
        </div>
      </div>

      <div class="auth-dash__kpi">
        <div class="auth-dash__kpi-icon auth-dash__kpi-icon--indigo">
          <IcoUsers :size="18" :strokeWidth="2" />
        </div>
        <div class="auth-dash__kpi-body">
          <span class="auth-dash__kpi-label">총 투자자</span>
          <span class="auth-dash__kpi-value">{{ stats.totalInvestors.toLocaleString() }}명</span>
        </div>
      </div>

      <div class="auth-dash__kpi">
        <div class="auth-dash__kpi-icon auth-dash__kpi-icon--amber">
          <IcoChartUp :size="18" :strokeWidth="2" />
        </div>
        <div class="auth-dash__kpi-body">
          <span class="auth-dash__kpi-label">총 정산액</span>
          <span class="auth-dash__kpi-value">{{ stats.totalSettlements }}</span>
        </div>
      </div>

      <div class="auth-dash__kpi">
        <div class="auth-dash__kpi-icon auth-dash__kpi-icon--teal">
          <IcoMapPin :size="18" :strokeWidth="2" />
        </div>
        <div class="auth-dash__kpi-body">
          <span class="auth-dash__kpi-label">공유지 필지</span>
          <span class="auth-dash__kpi-value">{{ stats.publicLandParcels }}개</span>
        </div>
      </div>

      <div class="auth-dash__kpi">
        <div class="auth-dash__kpi-icon auth-dash__kpi-icon--rose">
          <IcoBuilding :size="18" :strokeWidth="2" />
        </div>
        <div class="auth-dash__kpi-body">
          <span class="auth-dash__kpi-label">공유지 수익</span>
          <span class="auth-dash__kpi-value">{{ stats.publicLandRevenue }}</span>
        </div>
      </div>
    </div>

    <!-- Recent Blockchain Records -->
    <div class="auth-dash__card">
      <div class="auth-dash__card-head">
        <span class="auth-dash__card-title">최근 블록체인 기록</span>
        <span class="auth-dash__card-count">{{ blockchainStore.totalRecords }}건</span>
      </div>
      <div class="auth-dash__record-list">
        <div
          v-for="r in recentRecords"
          :key="r.id"
          class="auth-dash__record"
        >
          <span
            class="auth-dash__record-badge"
            :class="`auth-dash__record-badge--${typeColors[r.recordType]}`"
          >
            {{ typeLabels[r.recordType] }}
          </span>
          <div class="auth-dash__record-info">
            <span class="auth-dash__record-project">{{ r.projectName }}</span>
            <span class="auth-dash__record-hash">{{ blockchainStore.shortHash(r.txHash) }}</span>
          </div>
          <div class="auth-dash__record-meta">
            <span
              v-if="r.verified"
              class="auth-dash__record-verified"
            >
              <IcoCheck :size="12" :strokeWidth="3" />
              검증됨
            </span>
            <span class="auth-dash__record-date">{{ formatDate(r.createdAt) }}</span>
          </div>
        </div>

        <div v-if="recentRecords.length === 0" class="auth-dash__empty">
          블록체인 기록이 없습니다.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$accent: #4F6AF5;
$text-primary: #0f172a;
$text-secondary: #475569;
$text-muted: #94a3b8;
$border: #e2e8f0;
$surface: #ffffff;
$bg: #f8fafc;
$shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);

.auth-dash {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: $bg;
  min-height: 100%;
}

// ── Header ──
.auth-dash__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.auth-dash__header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.auth-dash__title {
  font-size: 22px;
  font-weight: 800;
  color: $text-primary;
  margin: 0;
  letter-spacing: -0.02em;
}

.auth-dash__subtitle {
  font-size: 13px;
  color: $text-secondary;
  margin: 0;
}

.auth-dash__header-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #4338ca;
  flex-shrink: 0;
}

// ── KPI Grid ──
.auth-dash__kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.auth-dash__kpi {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 16px;
  box-shadow: $shadow;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: rgba($accent, 0.3);
    box-shadow: $shadow, 0 0 0 1px rgba($accent, 0.08);
  }
}

.auth-dash__kpi-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--blue { background: #dbeafe; color: #2563eb; }
  &--green { background: #dcfce7; color: #16a34a; }
  &--emerald { background: #d1fae5; color: #059669; }
  &--violet { background: #ede9fe; color: #7c3aed; }
  &--indigo { background: #e0e7ff; color: #4338ca; }
  &--amber { background: #fef3c7; color: #d97706; }
  &--teal { background: #ccfbf1; color: #0d9488; }
  &--rose { background: #ffe4e6; color: #e11d48; }
}

.auth-dash__kpi-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.auth-dash__kpi-label {
  font-size: 11px;
  font-weight: 600;
  color: $text-muted;
  letter-spacing: 0.02em;
}

.auth-dash__kpi-value {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: -0.02em;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.auth-dash__kpi-sub {
  font-size: 10px;
  color: #059669;
  font-weight: 500;
}

// ── Card ──
.auth-dash__card {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 20px;
  box-shadow: $shadow;
}

.auth-dash__card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.auth-dash__card-title {
  font-size: 14px;
  font-weight: 700;
  color: $text-primary;
}

.auth-dash__card-count {
  font-size: 11px;
  font-weight: 600;
  color: $accent;
  background: rgba($accent, 0.08);
  padding: 3px 10px;
  border-radius: 12px;
}

// ── Record List ──
.auth-dash__record-list {
  display: flex;
  flex-direction: column;
}

.auth-dash__record {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid $border;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
}

.auth-dash__record-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  flex-shrink: 0;
  letter-spacing: 0.02em;
  min-width: 56px;
  text-align: center;

  &--blue { background: #dbeafe; color: #2563eb; }
  &--green { background: #dcfce7; color: #16a34a; }
  &--violet { background: #ede9fe; color: #7c3aed; }
  &--amber { background: #fef3c7; color: #d97706; }
  &--teal { background: #ccfbf1; color: #0d9488; }
  &--pink { background: #fce7f3; color: #db2777; }
}

.auth-dash__record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.auth-dash__record-project {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.auth-dash__record-hash {
  font-size: 11px;
  font-family: "SF Mono", "Fira Code", "Consolas", monospace;
  color: $text-muted;
}

.auth-dash__record-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.auth-dash__record-verified {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
  color: #16a34a;
  background: #dcfce7;
  padding: 2px 8px;
  border-radius: 4px;
}

.auth-dash__record-date {
  font-size: 11px;
  color: $text-muted;
  font-variant-numeric: tabular-nums;
}

.auth-dash__empty {
  text-align: center;
  padding: 32px 0;
  font-size: 13px;
  color: $text-muted;
}

// ── Responsive ──
@media (max-width: 1024px) {
  .auth-dash__kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .auth-dash {
    padding: 16px;
  }

  .auth-dash__kpi-grid {
    grid-template-columns: 1fr;
  }

  .auth-dash__header {
    flex-direction: column;
    gap: 12px;
  }

  .auth-dash__record {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
