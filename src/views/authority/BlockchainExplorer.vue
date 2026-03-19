<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useBlockchainStore } from "@/stores/blockchain-store";
import type { BlockchainRecord } from "@/stores/blockchain-store";
import {
  IcoSearch,
  IcoCheck,
  IcoBlockchain,
  IcoClose,
  IcoInfo,
} from "@/components/icons";

const blockchainStore = useBlockchainStore();

onMounted(async () => {
  await blockchainStore.loadRecords();
});

// ── Hash Verification ──
const verifyInput = ref("");
const verifyResult = ref<BlockchainRecord | null | undefined>(undefined);
const hasSearched = ref(false);

function handleVerify() {
  const hash = verifyInput.value.trim();
  if (!hash) return;
  hasSearched.value = true;
  verifyResult.value = blockchainStore.verifyByHash(hash);
}

function clearVerify() {
  verifyInput.value = "";
  verifyResult.value = undefined;
  hasSearched.value = false;
}

// ── Filter Tabs ──
type FilterType = "all" | "settlement" | "generation" | "milestone" | "lease" | "rec_issuance" | "community_benefit";

const activeFilter = ref<FilterType>("all");

const filterTabs: { key: FilterType; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "settlement", label: "정산" },
  { key: "generation", label: "발전량" },
  { key: "milestone", label: "마일스톤" },
  { key: "lease", label: "임대" },
  { key: "rec_issuance", label: "REC" },
  { key: "community_benefit", label: "지역사회" },
];

const filteredRecords = computed(() => {
  if (activeFilter.value === "all") {
    return [...blockchainStore.records].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  return blockchainStore
    .getRecordsByType(activeFilter.value)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function summarizeData(data: Record<string, unknown>): string {
  const entries = Object.entries(data);
  if (entries.length === 0) return "-";
  return entries
    .slice(0, 3)
    .map(([k, v]) => {
      if (typeof v === "number") {
        return `${k}: ${v.toLocaleString()}`;
      }
      if (typeof v === "string" && v.startsWith("0x")) {
        return `${k}: ${v.slice(0, 10)}...`;
      }
      return `${k}: ${v}`;
    })
    .join(" / ");
}
</script>

<template>
  <div class="explorer">
    <!-- Header -->
    <div class="explorer__header">
      <div class="explorer__header-left">
        <h1 class="explorer__title">블록체인 검증</h1>
        <div class="explorer__badges">
          <span class="explorer__badge explorer__badge--total">
            <IcoBlockchain :size="12" :strokeWidth="2" />
            전체 {{ blockchainStore.totalRecords }}건
          </span>
          <span class="explorer__badge explorer__badge--verified">
            <IcoCheck :size="12" :strokeWidth="2.5" />
            검증 {{ blockchainStore.verifiedCount }}건
          </span>
        </div>
      </div>
    </div>

    <!-- Hash Verification -->
    <div class="explorer__verify-card">
      <div class="explorer__verify-head">
        <span class="explorer__verify-title">트랜잭션 해시 검증</span>
        <span class="explorer__verify-desc">블록체인에 기록된 트랜잭션 해시를 입력하여 검증할 수 있습니다</span>
      </div>
      <div class="explorer__verify-input-wrap">
        <input
          v-model="verifyInput"
          type="text"
          class="explorer__verify-input"
          placeholder="0x 트랜잭션 해시를 입력하세요..."
          @keyup.enter="handleVerify"
        />
        <button class="explorer__verify-btn" @click="handleVerify">
          <IcoSearch :size="14" :strokeWidth="2" />
          검증
        </button>
        <button
          v-if="hasSearched"
          class="explorer__verify-clear"
          @click="clearVerify"
        >
          <IcoClose :size="14" :strokeWidth="2" />
        </button>
      </div>

      <!-- Verify Result -->
      <div v-if="hasSearched" class="explorer__verify-result">
        <div v-if="verifyResult" class="explorer__verify-found">
          <div class="explorer__verify-found-header">
            <IcoCheck :size="16" :strokeWidth="2.5" />
            <span>검증 완료 - 기록이 확인되었습니다</span>
          </div>
          <div class="explorer__verify-found-grid">
            <div class="explorer__verify-field">
              <span class="explorer__verify-field-label">기록 유형</span>
              <span
                class="explorer__record-badge"
                :class="`explorer__record-badge--${typeColors[verifyResult.recordType]}`"
              >
                {{ typeLabels[verifyResult.recordType] }}
              </span>
            </div>
            <div class="explorer__verify-field">
              <span class="explorer__verify-field-label">프로젝트</span>
              <span class="explorer__verify-field-value">{{ verifyResult.projectName }}</span>
            </div>
            <div class="explorer__verify-field">
              <span class="explorer__verify-field-label">TX 해시</span>
              <span class="explorer__verify-field-value explorer__verify-field-value--mono">{{ verifyResult.txHash }}</span>
            </div>
            <div class="explorer__verify-field">
              <span class="explorer__verify-field-label">기록일</span>
              <span class="explorer__verify-field-value">{{ formatDate(verifyResult.createdAt) }}</span>
            </div>
            <div class="explorer__verify-field">
              <span class="explorer__verify-field-label">데이터</span>
              <span class="explorer__verify-field-value">{{ summarizeData(verifyResult.data) }}</span>
            </div>
            <div class="explorer__verify-field">
              <span class="explorer__verify-field-label">상태</span>
              <span class="explorer__verify-status explorer__verify-status--ok">
                <IcoCheck :size="12" :strokeWidth="3" />
                검증됨
              </span>
            </div>
          </div>
        </div>
        <div v-else class="explorer__verify-not-found">
          <IcoInfo :size="16" :strokeWidth="2" />
          <span>기록을 찾을 수 없습니다. 해시를 다시 확인해 주세요.</span>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="explorer__tabs">
      <button
        v-for="tab in filterTabs"
        :key="tab.key"
        class="explorer__tab"
        :class="{ 'explorer__tab--active': activeFilter === tab.key }"
        @click="activeFilter = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Record List -->
    <div class="explorer__records-card">
      <div
        v-for="r in filteredRecords"
        :key="r.id"
        class="explorer__record"
      >
        <span
          class="explorer__record-badge"
          :class="`explorer__record-badge--${typeColors[r.recordType]}`"
        >
          {{ typeLabels[r.recordType] }}
        </span>
        <div class="explorer__record-body">
          <div class="explorer__record-top">
            <span class="explorer__record-project">{{ r.projectName }}</span>
            <span
              v-if="r.verified"
              class="explorer__record-verified"
            >
              <IcoCheck :size="11" :strokeWidth="3" />
              검증됨
            </span>
          </div>
          <div class="explorer__record-hash">{{ blockchainStore.shortHash(r.txHash) }}</div>
          <div class="explorer__record-data">{{ summarizeData(r.data) }}</div>
        </div>
        <div class="explorer__record-time">
          {{ formatDate(r.createdAt) }}
        </div>
      </div>

      <div v-if="filteredRecords.length === 0" class="explorer__empty">
        해당 유형의 블록체인 기록이 없습니다.
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

.explorer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: $bg;
  min-height: 100%;
}

// ── Header ──
.explorer__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.explorer__header-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.explorer__title {
  font-size: 22px;
  font-weight: 800;
  color: $text-primary;
  margin: 0;
  letter-spacing: -0.02em;
}

.explorer__badges {
  display: flex;
  gap: 8px;
}

.explorer__badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;

  &--total {
    background: rgba($accent, 0.08);
    color: $accent;
  }

  &--verified {
    background: #dcfce7;
    color: #16a34a;
  }
}

// ── Verify Card ──
.explorer__verify-card {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 20px;
  box-shadow: $shadow;
}

.explorer__verify-head {
  margin-bottom: 14px;
}

.explorer__verify-title {
  font-size: 14px;
  font-weight: 700;
  color: $text-primary;
  display: block;
  margin-bottom: 4px;
}

.explorer__verify-desc {
  font-size: 12px;
  color: $text-muted;
}

.explorer__verify-input-wrap {
  display: flex;
  gap: 8px;
  align-items: center;
}

.explorer__verify-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid $border;
  border-radius: 8px;
  font-size: 13px;
  font-family: "SF Mono", "Fira Code", "Consolas", monospace;
  color: $text-primary;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: $accent;
    box-shadow: 0 0 0 3px rgba($accent, 0.1);
  }

  &::placeholder {
    color: $text-muted;
    font-family: "Inter", sans-serif;
  }
}

.explorer__verify-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  background: $accent;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;

  &:hover { background: #3a55d4; }
}

.explorer__verify-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid $border;
  border-radius: 8px;
  background: $surface;
  color: $text-muted;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: #dc2626;
    color: #dc2626;
  }
}

.explorer__verify-result {
  margin-top: 16px;
}

.explorer__verify-found {
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  background: #f0fdf4;
  padding: 16px;
}

.explorer__verify-found-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #16a34a;
  margin-bottom: 14px;
}

.explorer__verify-found-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.explorer__verify-field {
  display: flex;
  flex-direction: column;
  gap: 3px;

  &:nth-child(3),
  &:nth-child(5) {
    grid-column: 1 / -1;
  }
}

.explorer__verify-field-label {
  font-size: 10px;
  font-weight: 600;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.explorer__verify-field-value {
  font-size: 12px;
  font-weight: 500;
  color: $text-primary;
  word-break: break-all;

  &--mono {
    font-family: "SF Mono", "Fira Code", "Consolas", monospace;
    font-size: 11px;
  }
}

.explorer__verify-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  width: fit-content;

  &--ok {
    color: #16a34a;
    background: #dcfce7;
    padding: 3px 10px;
    border-radius: 6px;
  }
}

.explorer__verify-not-found {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  background: #fff7ed;
  font-size: 13px;
  font-weight: 500;
  color: #c2410c;
}

// ── Filter Tabs ──
.explorer__tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.explorer__tab {
  padding: 8px 16px;
  border: 1px solid $border;
  border-radius: 8px;
  background: $surface;
  font-size: 12px;
  font-weight: 600;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    border-color: rgba($accent, 0.3);
    color: $accent;
  }

  &--active {
    background: $accent;
    border-color: $accent;
    color: #fff;

    &:hover {
      background: #3a55d4;
      border-color: #3a55d4;
      color: #fff;
    }
  }
}

// ── Record List ──
.explorer__records-card {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  box-shadow: $shadow;
  overflow: hidden;
}

.explorer__record {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid $border;
  transition: background 0.1s;

  &:last-child { border-bottom: none; }
  &:hover { background: rgba($accent, 0.015); }
}

.explorer__record-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  flex-shrink: 0;
  min-width: 56px;
  text-align: center;
  margin-top: 2px;

  &--blue { background: #dbeafe; color: #2563eb; }
  &--green { background: #dcfce7; color: #16a34a; }
  &--violet { background: #ede9fe; color: #7c3aed; }
  &--amber { background: #fef3c7; color: #d97706; }
  &--teal { background: #ccfbf1; color: #0d9488; }
  &--pink { background: #fce7f3; color: #db2777; }
}

.explorer__record-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.explorer__record-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.explorer__record-project {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
}

.explorer__record-verified {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 700;
  color: #16a34a;
  background: #dcfce7;
  padding: 2px 7px;
  border-radius: 4px;
}

.explorer__record-hash {
  font-size: 11px;
  font-family: "SF Mono", "Fira Code", "Consolas", monospace;
  color: $accent;
}

.explorer__record-data {
  font-size: 11px;
  color: $text-muted;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.explorer__record-time {
  font-size: 11px;
  color: $text-muted;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 2px;
}

.explorer__empty {
  text-align: center;
  padding: 40px 0;
  font-size: 13px;
  color: $text-muted;
}

// ── Responsive ──
@media (max-width: 768px) {
  .explorer {
    padding: 16px;
  }

  .explorer__verify-input-wrap {
    flex-direction: column;
  }

  .explorer__verify-btn {
    width: 100%;
    justify-content: center;
  }

  .explorer__verify-found-grid {
    grid-template-columns: 1fr;

    .explorer__verify-field:nth-child(3),
    .explorer__verify-field:nth-child(5) {
      grid-column: 1;
    }
  }

  .explorer__record {
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px;
  }

  .explorer__record-time {
    align-self: flex-end;
  }

  .explorer__tabs {
    gap: 4px;
  }

  .explorer__tab {
    padding: 6px 12px;
    font-size: 11px;
  }
}
</style>
