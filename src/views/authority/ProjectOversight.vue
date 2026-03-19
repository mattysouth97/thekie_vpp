<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useProjectStore } from "@/stores/project-store";
import {
  IcoSearch,
  IcoSolar,
  IcoWind,
  IcoBattery,
  IcoUsers,
  IcoMapPin,
} from "@/components/icons";

const projectStore = useProjectStore();

onMounted(async () => {
  await projectStore.loadProjects();
});

const searchQuery = ref("");

const filteredProjects = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return projectStore.projects;
  return projectStore.projects.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.developerName.toLowerCase().includes(q),
  );
});

const typeIconMap: Record<string, typeof IcoSolar> = {
  solar: IcoSolar,
  wind: IcoWind,
  battery: IcoBattery,
};

function getTypeIcon(typeIcon: string) {
  return typeIconMap[typeIcon] || IcoSolar;
}

function statusColorClass(statusColor: string): string {
  const map: Record<string, string> = {
    green: "status--green",
    blue: "status--blue",
    amber: "status--amber",
    red: "status--red",
    gray: "status--gray",
  };
  return map[statusColor] || "status--blue";
}

function formatCapacity(capacity: string): string {
  return capacity;
}

function formatFunding(current: number, total: number): string {
  return `${(current / 100000000).toFixed(1)}억 / ${(total / 100000000).toFixed(1)}억`;
}
</script>

<template>
  <div class="oversight">
    <!-- Header -->
    <div class="oversight__header">
      <div class="oversight__header-left">
        <h1 class="oversight__title">프로젝트 감독</h1>
        <span class="oversight__count-badge">{{ projectStore.totalCount }}개 프로젝트</span>
      </div>
      <div class="oversight__summary">
        <div class="oversight__summary-item">
          <span class="oversight__summary-label">총 용량</span>
          <span class="oversight__summary-value">{{ projectStore.totalCapacityMw.toFixed(1) }} MW</span>
        </div>
        <div class="oversight__summary-item">
          <span class="oversight__summary-label">참여 가능</span>
          <span class="oversight__summary-value oversight__summary-value--green">{{ projectStore.openCount }}개</span>
        </div>
        <div class="oversight__summary-item">
          <span class="oversight__summary-label">평균 수익률</span>
          <span class="oversight__summary-value">{{ projectStore.avgYield.toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="oversight__search">
      <IcoSearch :size="16" :strokeWidth="2" class="oversight__search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        class="oversight__search-input"
        placeholder="프로젝트명, 위치, 개발사로 검색..."
      />
    </div>

    <!-- Table -->
    <div class="oversight__table-wrap">
      <table class="oversight__table">
        <thead>
          <tr>
            <th>프로젝트명</th>
            <th>유형</th>
            <th>위치</th>
            <th>용량</th>
            <th>수익률</th>
            <th>상태</th>
            <th>진행률</th>
            <th>투자자</th>
            <th>개발사</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in filteredProjects"
            :key="p.id"
            class="oversight__row"
          >
            <td class="oversight__cell-name">
              <span class="oversight__project-name">{{ p.name }}</span>
            </td>
            <td class="oversight__cell-type">
              <span class="oversight__type-badge">
                <component :is="getTypeIcon(p.typeIcon)" :size="14" :strokeWidth="2" />
                {{ p.type }}
              </span>
            </td>
            <td class="oversight__cell-location">
              <span class="oversight__location">
                <IcoMapPin :size="12" :strokeWidth="2" />
                {{ p.location }}
              </span>
            </td>
            <td class="oversight__cell-capacity">{{ formatCapacity(p.capacity) }}</td>
            <td class="oversight__cell-yield">{{ p.expectedYield }}</td>
            <td>
              <span
                class="oversight__status"
                :class="statusColorClass(p.statusColor)"
              >
                {{ p.status }}
              </span>
            </td>
            <td class="oversight__cell-progress">
              <div class="oversight__progress-wrap">
                <div class="oversight__progress-bar">
                  <div
                    class="oversight__progress-fill"
                    :style="{ width: p.progress + '%' }"
                  ></div>
                </div>
                <span class="oversight__progress-pct">{{ p.progress }}%</span>
              </div>
            </td>
            <td class="oversight__cell-investors">
              <span class="oversight__investors">
                <IcoUsers :size="12" :strokeWidth="2" />
                {{ p.investorCount.toLocaleString() }}명
              </span>
            </td>
            <td class="oversight__cell-dev">{{ p.developerName }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredProjects.length === 0" class="oversight__empty">
        검색 결과가 없습니다.
      </div>
    </div>

    <!-- Funding Summary -->
    <div class="oversight__funding-section">
      <h3 class="oversight__section-title">투자 현황 요약</h3>
      <div class="oversight__funding-grid">
        <div
          v-for="p in filteredProjects"
          :key="p.id"
          class="oversight__funding-card"
        >
          <div class="oversight__funding-name">{{ p.name }}</div>
          <div class="oversight__funding-bar-wrap">
            <div class="oversight__funding-bar">
              <div
                class="oversight__funding-fill"
                :style="{ width: p.progress + '%' }"
              ></div>
            </div>
          </div>
          <div class="oversight__funding-info">
            <span class="oversight__funding-amount">{{ formatFunding(p.currentFunding, p.totalFundingRequired) }}</span>
            <span class="oversight__funding-pct">{{ p.progress }}%</span>
          </div>
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

.oversight {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: $bg;
  min-height: 100%;
}

// ── Header ──
.oversight__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.oversight__header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.oversight__title {
  font-size: 22px;
  font-weight: 800;
  color: $text-primary;
  margin: 0;
  letter-spacing: -0.02em;
}

.oversight__count-badge {
  font-size: 11px;
  font-weight: 700;
  color: $accent;
  background: rgba($accent, 0.08);
  padding: 4px 12px;
  border-radius: 12px;
}

.oversight__summary {
  display: flex;
  gap: 20px;
}

.oversight__summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.oversight__summary-label {
  font-size: 10px;
  font-weight: 600;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.oversight__summary-value {
  font-size: 15px;
  font-weight: 700;
  color: $text-primary;
  font-variant-numeric: tabular-nums;

  &--green { color: #16a34a; }
}

// ── Search ──
.oversight__search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: $shadow;
  transition: border-color 0.15s;

  &:focus-within {
    border-color: $accent;
    box-shadow: $shadow, 0 0 0 3px rgba($accent, 0.1);
  }
}

.oversight__search-icon {
  color: $text-muted;
  flex-shrink: 0;
}

.oversight__search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: $text-primary;
  background: transparent;

  &::placeholder {
    color: $text-muted;
  }
}

// ── Table ──
.oversight__table-wrap {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  box-shadow: $shadow;
  overflow-x: auto;
}

.oversight__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th {
    padding: 12px 14px;
    text-align: left;
    font-size: 10px;
    font-weight: 700;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid $border;
    background: $bg;
    white-space: nowrap;
  }

  td {
    padding: 12px 14px;
    border-bottom: 1px solid $border;
    vertical-align: middle;
    color: $text-secondary;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
}

.oversight__row {
  transition: background 0.1s;

  &:hover {
    background: rgba($accent, 0.02);
  }
}

.oversight__project-name {
  font-weight: 600;
  color: $text-primary;
  font-size: 12px;
  white-space: nowrap;
}

.oversight__type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: $text-secondary;
  white-space: nowrap;
}

.oversight__location {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: $text-secondary;
  white-space: nowrap;
}

.oversight__cell-capacity,
.oversight__cell-yield {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: $text-primary;
}

.oversight__status {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  white-space: nowrap;

  &.status--green { background: #dcfce7; color: #16a34a; }
  &.status--blue { background: #dbeafe; color: #2563eb; }
  &.status--amber { background: #fef3c7; color: #d97706; }
  &.status--red { background: #fee2e2; color: #dc2626; }
  &.status--gray { background: #f1f5f9; color: #64748b; }
}

.oversight__cell-progress {
  min-width: 100px;
}

.oversight__progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.oversight__progress-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.oversight__progress-fill {
  height: 100%;
  background: $accent;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.oversight__progress-pct {
  font-size: 11px;
  font-weight: 700;
  color: $accent;
  font-variant-numeric: tabular-nums;
  min-width: 32px;
  text-align: right;
}

.oversight__investors {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: $text-secondary;
  white-space: nowrap;
}

.oversight__cell-dev {
  font-size: 11px;
  color: $text-secondary;
  white-space: nowrap;
}

.oversight__empty {
  text-align: center;
  padding: 40px 0;
  font-size: 13px;
  color: $text-muted;
}

// ── Funding Section ──
.oversight__funding-section {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 20px;
  box-shadow: $shadow;
}

.oversight__section-title {
  font-size: 14px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 16px;
}

.oversight__funding-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.oversight__funding-card {
  padding: 14px;
  border: 1px solid $border;
  border-radius: 8px;
  background: $bg;
}

.oversight__funding-name {
  font-size: 12px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.oversight__funding-bar-wrap {
  margin-bottom: 6px;
}

.oversight__funding-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.oversight__funding-fill {
  height: 100%;
  background: linear-gradient(90deg, $accent, #818cf8);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.oversight__funding-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.oversight__funding-amount {
  font-size: 11px;
  color: $text-secondary;
  font-variant-numeric: tabular-nums;
}

.oversight__funding-pct {
  font-size: 11px;
  font-weight: 700;
  color: $accent;
  font-variant-numeric: tabular-nums;
}

// ── Responsive ──
@media (max-width: 1024px) {
  .oversight__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .oversight__summary {
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .oversight {
    padding: 16px;
  }

  .oversight__funding-grid {
    grid-template-columns: 1fr;
  }
}
</style>
