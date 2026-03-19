<script setup lang="ts">
import { ref, computed } from "vue";
import { IcoChartUp, IcoSearch, IcoArrowRight } from "@/components/icons";

interface Transaction {
  id: string;
  date: string;
  type: "smp" | "rec" | "dr" | "dividend" | "investment";
  typeLabel: string;
  description: string;
  amount: number;
  positive: boolean;
  project: string;
  txHash: string;
}

const transactions: Transaction[] = [
  { id: "t1", date: "2026-03-15", type: "smp", typeLabel: "SMP 정산", description: "3월 상반기 SMP 정산금", amount: 142300, positive: true, project: "용인시 지상형 태양광", txHash: "0x8a3f...b2e1" },
  { id: "t2", date: "2026-03-12", type: "rec", typeLabel: "REC 판매", description: "REC 현물 10건 판매", amount: 425000, positive: true, project: "용인시 지붕형 태양광", txHash: "0x3c7e...a4d9" },
  { id: "t3", date: "2026-03-10", type: "dr", typeLabel: "DR 보상", description: "수요반응 참여 보상금", amount: 84000, positive: true, project: "용인시 FEMS 연계형", txHash: "0x9f1b...c3a7" },
  { id: "t4", date: "2026-03-05", type: "smp", typeLabel: "SMP 정산", description: "2월 SMP 정산금 입금", amount: 209320, positive: true, project: "용인시 지상형 태양광", txHash: "0x5d2a...e8f3" },
  { id: "t5", date: "2026-03-01", type: "dividend", typeLabel: "배당금", description: "2월 투자 배당금", amount: 38500, positive: true, project: "용인시 ESS통합형", txHash: "0x1e4c...d6b2" },
  { id: "t6", date: "2026-02-28", type: "investment", typeLabel: "투자", description: "영농형 태양광 추가 투자", amount: -200000, positive: false, project: "용인시 영농형 태양광", txHash: "0x7b8d...f1a5" },
  { id: "t7", date: "2026-02-25", type: "rec", typeLabel: "REC 판매", description: "REC 현물 8건 판매", amount: 340000, positive: true, project: "용인시 지상형 태양광", txHash: "0x2f6e...b9c4" },
  { id: "t8", date: "2026-02-20", type: "smp", typeLabel: "SMP 정산", description: "2월 상반기 SMP 정산금", amount: 118700, positive: true, project: "용인시 지붕형 태양광", txHash: "0x4a1d...e7f8" },
  { id: "t9", date: "2026-02-15", type: "dr", typeLabel: "DR 보상", description: "수요반응 참여 보상금", amount: 62000, positive: true, project: "용인시 FEMS 연계형", txHash: "0x6c3b...a2d1" },
  { id: "t10", date: "2026-02-10", type: "dividend", typeLabel: "배당금", description: "1월 투자 배당금", amount: 31200, positive: true, project: "용인시 ESS통합형", txHash: "0x8e5f...c4b6" },
];

const searchQuery = ref("");
const filterType = ref("all");

const typeFilters = [
  { value: "all", label: "전체" },
  { value: "smp", label: "SMP" },
  { value: "rec", label: "REC" },
  { value: "dr", label: "DR" },
  { value: "dividend", label: "배당" },
  { value: "investment", label: "투자" },
];

const filtered = computed(() => {
  return transactions.filter((t) => {
    if (filterType.value !== "all" && t.type !== filterType.value) return false;
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      return t.description.toLowerCase().includes(q) || t.project.toLowerCase().includes(q);
    }
    return true;
  });
});

const totalIncome = computed(() =>
  filtered.value.filter((t) => t.positive).reduce((s, t) => s + t.amount, 0),
);
const totalExpense = computed(() =>
  filtered.value.filter((t) => !t.positive).reduce((s, t) => s + Math.abs(t.amount), 0),
);

function formatKrw(amount: number): string {
  return `₩${Math.abs(amount).toLocaleString("ko-KR")}`;
}

const TYPE_COLORS: Record<string, string> = {
  smp: "#2563eb", rec: "#d97706", dr: "#16a34a", dividend: "#7c3aed", investment: "#0891b2",
};
const TYPE_BGS: Record<string, string> = {
  smp: "#dbeafe", rec: "#fef3c7", dr: "#dcfce7", dividend: "#ede9fe", investment: "#ccfbf1",
};
</script>

<template>
  <div class="tx">
    <div class="tx__header">
      <h1 class="tx__title">거래 내역</h1>
      <p class="tx__sub">SMP, REC, DR, 배당금 등 모든 거래 이력</p>
    </div>

    <!-- Summary -->
    <div class="tx__summary">
      <div class="tx__summary-card tx__summary-card--income">
        <span class="tx__summary-label">총 수입</span>
        <span class="tx__summary-val">{{ formatKrw(totalIncome) }}</span>
      </div>
      <div class="tx__summary-card tx__summary-card--expense">
        <span class="tx__summary-label">총 지출</span>
        <span class="tx__summary-val">{{ formatKrw(totalExpense) }}</span>
      </div>
      <div class="tx__summary-card">
        <span class="tx__summary-label">순이익</span>
        <span class="tx__summary-val tx__summary-val--accent">{{ formatKrw(totalIncome - totalExpense) }}</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="tx__filters">
      <div class="tx__search-wrap">
        <IcoSearch class="tx__search-icon" :size="14" :strokeWidth="2" />
        <input v-model="searchQuery" type="text" class="tx__search" placeholder="거래 검색..." />
      </div>
      <div class="tx__type-tabs">
        <button
          v-for="f in typeFilters"
          :key="f.value"
          type="button"
          class="tx__type-tab"
          :class="{ 'tx__type-tab--active': filterType === f.value }"
          @click="filterType = f.value"
        >{{ f.label }}</button>
      </div>
    </div>

    <!-- Transaction list -->
    <div class="tx__list">
      <div v-for="t in filtered" :key="t.id" class="tx__item">
        <div class="tx__item-type" :style="{ background: TYPE_BGS[t.type], color: TYPE_COLORS[t.type] }">{{ t.typeLabel }}</div>
        <div class="tx__item-body">
          <span class="tx__item-desc">{{ t.description }}</span>
          <span class="tx__item-project">{{ t.project }}</span>
        </div>
        <div class="tx__item-right">
          <span class="tx__item-amount" :class="t.positive ? 'tx__item-amount--plus' : 'tx__item-amount--minus'">
            {{ t.positive ? '+' : '-' }}{{ formatKrw(t.amount) }}
          </span>
          <span class="tx__item-date">{{ t.date }}</span>
        </div>
        <code class="tx__item-hash">{{ t.txHash }}</code>
      </div>
    </div>

    <div v-if="filtered.length === 0" class="tx__empty">
      조건에 맞는 거래 내역이 없습니다.
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

.tx { padding: 20px; max-width: 860px; margin: 0 auto; }
.tx__header { margin-bottom: 16px; }
.tx__title { font-size: 20px; font-weight: 900; color: $text-primary; margin: 0 0 4px; letter-spacing: -0.03em; }
.tx__sub { font-size: 13px; color: $text-muted; margin: 0; }

.tx__summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; @media (max-width: 640px) { grid-template-columns: 1fr; } }
.tx__summary-card { background: $surface; border: 1px solid $border; border-radius: 10px; padding: 14px; text-align: center; &--income { border-left: 3px solid #16a34a; } &--expense { border-left: 3px solid #dc2626; } }
.tx__summary-label { display: block; font-size: 10.5px; font-weight: 600; color: $text-muted; margin-bottom: 3px; }
.tx__summary-val { font-size: 18px; font-weight: 900; color: $text-primary; font-variant-numeric: tabular-nums; &--accent { color: $accent; } }

.tx__filters { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.tx__search-wrap { position: relative; flex: 1; min-width: 180px; }
.tx__search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: $text-muted; pointer-events: none; }
.tx__search { width: 100%; height: 38px; padding: 0 12px 0 34px; background: $surface; border: 1px solid $border; border-radius: 8px; font-size: 13px; font-family: "Inter", sans-serif; color: $text-primary; outline: none; &:focus { border-color: $accent; } &::placeholder { color: $text-muted; } }
.tx__type-tabs { display: flex; gap: 4px; }
.tx__type-tab { padding: 7px 12px; background: $surface; border: 1px solid $border; border-radius: 7px; font-size: 11.5px; font-weight: 600; font-family: "Inter", sans-serif; color: $text-secondary; cursor: pointer; transition: all 0.15s; &:hover { border-color: #a3b3fa; } &--active { background: $accent; color: #fff; border-color: $accent; } }

.tx__list { display: flex; flex-direction: column; gap: 6px; }
.tx__item { display: flex; align-items: center; gap: 10px; background: $surface; border: 1px solid $border; border-radius: 10px; padding: 12px 14px; transition: box-shadow 0.15s; &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.04); } }
.tx__item-type { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 5px; white-space: nowrap; flex-shrink: 0; }
.tx__item-body { flex: 1; min-width: 0; }
.tx__item-desc { display: block; font-size: 13px; font-weight: 700; color: $text-primary; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tx__item-project { font-size: 11px; color: $text-muted; }
.tx__item-right { text-align: right; flex-shrink: 0; }
.tx__item-amount { display: block; font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums; &--plus { color: #16a34a; } &--minus { color: #dc2626; } }
.tx__item-date { font-size: 10.5px; color: $text-muted; }
.tx__item-hash { font-family: "JetBrains Mono", monospace; font-size: 9.5px; color: $text-muted; flex-shrink: 0; display: none; @media (min-width: 768px) { display: block; } }

.tx__empty { text-align: center; padding: 40px; color: $text-muted; font-size: 14px; }
</style>
