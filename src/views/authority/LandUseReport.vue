<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useBlockchainStore } from "@/stores/blockchain-store";
import {
  IcoMapPin,
  IcoCoin,
  IcoLightning,
  IcoGlobe,
  IcoUsers,
  IcoCheck,
  IcoBlockchain,
} from "@/components/icons";

const blockchainStore = useBlockchainStore();

onMounted(async () => {
  await blockchainStore.loadRecords();
});

// ── Summary Stats (partially mocked) ──
const summaryStats = computed(() => ({
  totalParcels: blockchainStore.stats.publicLandParcels,
  totalLeaseRevenue: blockchainStore.stats.publicLandRevenue,
  energyProduced: "8,420 MWh",
  co2Avoided: "3,922 tCO2",
  localJobs: 34,
}));

// ── Lease Records ──
const leaseRecords = computed(() => {
  return blockchainStore
    .getRecordsByType("lease")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

// ── Community Benefit Records ──
const communityRecords = computed(() => {
  return blockchainStore
    .getRecordsByType("community_benefit")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatWon(amount: number): string {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

function getMunicipality(data: Record<string, unknown>): string {
  const id = data.municipalityId as string;
  const map: Record<string, string> = {
    "yongin-city": "용인시",
    "hwaseong-city": "화성시",
    "eumseong-gun": "음성군",
  };
  return map[id] || id || "-";
}
</script>

<template>
  <div class="land-report">
    <!-- Header -->
    <div class="land-report__header">
      <div class="land-report__header-text">
        <h1 class="land-report__title">공유지 현황 보고서</h1>
        <p class="land-report__subtitle">공유지 활용 신재생에너지 프로젝트 현황 및 지역사회 기여 보고</p>
      </div>
      <div class="land-report__header-badge">
        <IcoBlockchain :size="14" :strokeWidth="2" />
        블록체인 검증 데이터
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="land-report__summary-grid">
      <div class="land-report__summary-card">
        <div class="land-report__summary-icon land-report__summary-icon--blue">
          <IcoMapPin :size="18" :strokeWidth="2" />
        </div>
        <div class="land-report__summary-body">
          <span class="land-report__summary-label">공유지 필지 수</span>
          <span class="land-report__summary-value">{{ summaryStats.totalParcels }}개</span>
        </div>
      </div>

      <div class="land-report__summary-card">
        <div class="land-report__summary-icon land-report__summary-icon--green">
          <IcoCoin :size="18" :strokeWidth="2" />
        </div>
        <div class="land-report__summary-body">
          <span class="land-report__summary-label">총 임대 수익</span>
          <span class="land-report__summary-value">{{ summaryStats.totalLeaseRevenue }}</span>
        </div>
      </div>

      <div class="land-report__summary-card">
        <div class="land-report__summary-icon land-report__summary-icon--amber">
          <IcoLightning :size="18" :strokeWidth="2" />
        </div>
        <div class="land-report__summary-body">
          <span class="land-report__summary-label">공유지 에너지 생산량</span>
          <span class="land-report__summary-value">{{ summaryStats.energyProduced }}</span>
        </div>
      </div>

      <div class="land-report__summary-card">
        <div class="land-report__summary-icon land-report__summary-icon--emerald">
          <IcoGlobe :size="18" :strokeWidth="2" />
        </div>
        <div class="land-report__summary-body">
          <span class="land-report__summary-label">공유지 CO2 감축</span>
          <span class="land-report__summary-value">{{ summaryStats.co2Avoided }}</span>
        </div>
      </div>

      <div class="land-report__summary-card">
        <div class="land-report__summary-icon land-report__summary-icon--violet">
          <IcoUsers :size="18" :strokeWidth="2" />
        </div>
        <div class="land-report__summary-body">
          <span class="land-report__summary-label">지역 일자리 창출</span>
          <span class="land-report__summary-value">{{ summaryStats.localJobs }}명</span>
        </div>
      </div>
    </div>

    <!-- Lease Records Table -->
    <div class="land-report__section">
      <div class="land-report__section-head">
        <h2 class="land-report__section-title">임대 계약 기록</h2>
        <span class="land-report__section-badge">{{ leaseRecords.length }}건</span>
      </div>
      <div class="land-report__table-wrap">
        <table class="land-report__table">
          <thead>
            <tr>
              <th>프로젝트명</th>
              <th>지자체</th>
              <th>연간 임대료</th>
              <th>계약 시작일</th>
              <th>TX 해시</th>
              <th>검증</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in leaseRecords" :key="r.id">
              <td class="land-report__cell-name">{{ r.projectName }}</td>
              <td>{{ getMunicipality(r.data) }}</td>
              <td class="land-report__cell-number">{{ formatWon(r.data.annualRent as number) }}</td>
              <td>{{ r.data.startDate || '-' }}</td>
              <td class="land-report__cell-hash">{{ blockchainStore.shortHash(r.txHash) }}</td>
              <td>
                <span v-if="r.verified" class="land-report__verified">
                  <IcoCheck :size="11" :strokeWidth="3" />
                  검증됨
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="leaseRecords.length === 0" class="land-report__empty">
          임대 계약 기록이 없습니다.
        </div>
      </div>
    </div>

    <!-- Community Benefit Records -->
    <div class="land-report__section">
      <div class="land-report__section-head">
        <h2 class="land-report__section-title">지역사회 기여 기록</h2>
        <span class="land-report__section-badge land-report__section-badge--pink">{{ communityRecords.length }}건</span>
      </div>
      <div class="land-report__table-wrap">
        <table class="land-report__table">
          <thead>
            <tr>
              <th>프로젝트명</th>
              <th>임대 수익</th>
              <th>지역 일자리</th>
              <th>지역사회 기금</th>
              <th>TX 해시</th>
              <th>검증</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in communityRecords" :key="r.id">
              <td class="land-report__cell-name">{{ r.projectName }}</td>
              <td class="land-report__cell-number">{{ formatWon(r.data.leaseRevenue as number) }}</td>
              <td class="land-report__cell-center">{{ r.data.localJobs }}명</td>
              <td class="land-report__cell-number">{{ formatWon(r.data.communityFund as number) }}</td>
              <td class="land-report__cell-hash">{{ blockchainStore.shortHash(r.txHash) }}</td>
              <td>
                <span v-if="r.verified" class="land-report__verified">
                  <IcoCheck :size="11" :strokeWidth="3" />
                  검증됨
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="communityRecords.length === 0" class="land-report__empty">
          지역사회 기여 기록이 없습니다.
        </div>
      </div>
    </div>

    <!-- Impact Summary -->
    <div class="land-report__impact">
      <div class="land-report__impact-title">공유지 활용 종합 성과</div>
      <div class="land-report__impact-grid">
        <div class="land-report__impact-item">
          <span class="land-report__impact-number">{{ summaryStats.totalParcels }}</span>
          <span class="land-report__impact-label">필지 활용</span>
        </div>
        <div class="land-report__impact-divider"></div>
        <div class="land-report__impact-item">
          <span class="land-report__impact-number">{{ summaryStats.energyProduced }}</span>
          <span class="land-report__impact-label">청정 에너지 생산</span>
        </div>
        <div class="land-report__impact-divider"></div>
        <div class="land-report__impact-item">
          <span class="land-report__impact-number">{{ summaryStats.co2Avoided }}</span>
          <span class="land-report__impact-label">탄소 감축</span>
        </div>
        <div class="land-report__impact-divider"></div>
        <div class="land-report__impact-item">
          <span class="land-report__impact-number">{{ summaryStats.localJobs }}명</span>
          <span class="land-report__impact-label">지역 고용 창출</span>
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

.land-report {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: $bg;
  min-height: 100%;
}

// ── Header ──
.land-report__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.land-report__header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.land-report__title {
  font-size: 22px;
  font-weight: 800;
  color: $text-primary;
  margin: 0;
  letter-spacing: -0.02em;
}

.land-report__subtitle {
  font-size: 13px;
  color: $text-secondary;
  margin: 0;
}

.land-report__header-badge {
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

// ── Summary Cards ──
.land-report__summary-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.land-report__summary-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 16px;
  box-shadow: $shadow;
  transition: border-color 0.15s;

  &:hover {
    border-color: rgba($accent, 0.3);
  }
}

.land-report__summary-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--blue { background: #dbeafe; color: #2563eb; }
  &--green { background: #dcfce7; color: #16a34a; }
  &--amber { background: #fef3c7; color: #d97706; }
  &--emerald { background: #d1fae5; color: #059669; }
  &--violet { background: #ede9fe; color: #7c3aed; }
}

.land-report__summary-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.land-report__summary-label {
  font-size: 10px;
  font-weight: 600;
  color: $text-muted;
  letter-spacing: 0.02em;
}

.land-report__summary-value {
  font-size: 17px;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

// ── Section ──
.land-report__section {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  box-shadow: $shadow;
  overflow: hidden;
}

.land-report__section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid $border;
}

.land-report__section-title {
  font-size: 14px;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
}

.land-report__section-badge {
  font-size: 10px;
  font-weight: 700;
  color: $accent;
  background: rgba($accent, 0.08);
  padding: 3px 10px;
  border-radius: 12px;

  &--pink {
    color: #db2777;
    background: #fce7f3;
  }
}

// ── Table ──
.land-report__table-wrap {
  overflow-x: auto;
}

.land-report__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th {
    padding: 12px 16px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: $bg;
    border-bottom: 1px solid $border;
    white-space: nowrap;
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid $border;
    vertical-align: middle;
    color: $text-secondary;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr {
    transition: background 0.1s;

    &:hover {
      background: rgba($accent, 0.02);
    }
  }
}

.land-report__cell-name {
  font-weight: 600;
  color: $text-primary;
  white-space: nowrap;
}

.land-report__cell-number {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: $text-primary;
  white-space: nowrap;
}

.land-report__cell-center {
  text-align: center;
  font-weight: 600;
  color: $text-primary;
}

.land-report__cell-hash {
  font-family: "SF Mono", "Fira Code", "Consolas", monospace;
  font-size: 11px;
  color: $accent;
  white-space: nowrap;
}

.land-report__verified {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
  color: #16a34a;
  background: #dcfce7;
  padding: 3px 8px;
  border-radius: 4px;
}

.land-report__empty {
  text-align: center;
  padding: 40px 0;
  font-size: 13px;
  color: $text-muted;
}

// ── Impact Summary ──
.land-report__impact {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.land-report__impact-title {
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 20px;
  letter-spacing: 0.02em;
}

.land-report__impact-grid {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 16px;
}

.land-report__impact-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.land-report__impact-number {
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.land-report__impact-label {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
}

.land-report__impact-divider {
  width: 1px;
  height: 40px;
  background: #475569;
}

// ── Responsive ──
@media (max-width: 1200px) {
  .land-report__summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .land-report {
    padding: 16px;
  }

  .land-report__header {
    flex-direction: column;
  }

  .land-report__summary-grid {
    grid-template-columns: 1fr 1fr;
  }

  .land-report__impact-grid {
    flex-direction: column;
    gap: 16px;
  }

  .land-report__impact-divider {
    width: 60px;
    height: 1px;
  }
}

@media (max-width: 480px) {
  .land-report__summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
