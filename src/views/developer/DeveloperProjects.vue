<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/stores/project-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  IcoSolar, IcoWind, IcoBattery,
  IcoArrowRight, IcoMapPin, IcoUsers, IcoDocument, IcoBuilding,
} from "@/components/icons";

const router = useRouter();
const projectStore = useProjectStore();
const authStore = useAuthStore();

onMounted(() => {
  projectStore.loadProjects();
});

const myProjects = computed(() =>
  projectStore.getProjectsByDeveloper(authStore.user?.id ?? ""),
);

function formatWon(amount: number): string {
  if (amount >= 100_000_000) {
    return `${(amount / 100_000_000).toFixed(1)}억`;
  }
  if (amount >= 10_000) {
    return `${Math.round(amount / 10_000).toLocaleString()}만`;
  }
  return amount.toLocaleString();
}

function goProject(id: string) {
  router.push(`/developer/projects/${id}`);
}

function goCreate() {
  router.push("/developer/projects/new");
}
</script>

<template>
  <div class="dp">
    <!-- Header -->
    <div class="dp-header">
      <div class="dp-header__left">
        <h1 class="dp-header__title">내 프로젝트</h1>
        <p class="dp-header__sub">등록된 프로젝트 {{ myProjects.length }}건</p>
      </div>
      <button class="dp-header__cta" @click="goCreate">
        <IcoDocument :size="14" :strokeWidth="2" />
        새 프로젝트
      </button>
    </div>

    <!-- Project Grid -->
    <div v-if="myProjects.length" class="dp-grid">
      <div
        v-for="p in myProjects"
        :key="p.id"
        class="dp-card"
        @click="goProject(p.id)"
      >
        <!-- Card Top: Status -->
        <div class="dp-card__top">
          <div class="dp-card__type-badge">
            <IcoSolar v-if="p.typeIcon === 'solar'" :size="12" :strokeWidth="2" />
            <IcoWind v-else-if="p.typeIcon === 'wind'" :size="12" :strokeWidth="2" />
            <IcoBattery v-else :size="12" :strokeWidth="2" />
            <span>{{ p.type }}</span>
          </div>
          <span class="dp-card__status" :class="`dp-card__status--${p.statusColor}`">{{ p.status }}</span>
        </div>

        <!-- Card Title -->
        <h3 class="dp-card__name">{{ p.name }}</h3>

        <!-- Location -->
        <div class="dp-card__location">
          <IcoMapPin :size="11" :strokeWidth="2" />
          <span>{{ p.location }}</span>
        </div>

        <!-- Key Metrics -->
        <div class="dp-card__metrics">
          <div class="dp-card__metric">
            <span class="dp-card__metric-label">설비용량</span>
            <span class="dp-card__metric-value">{{ p.capacity }}</span>
          </div>
          <div class="dp-card__metric">
            <span class="dp-card__metric-label">기대수익</span>
            <span class="dp-card__metric-value dp-card__metric-value--accent">{{ p.expectedYield }}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="dp-card__progress-section">
          <div class="dp-card__progress-header">
            <span class="dp-card__progress-label">모집 진행률</span>
            <span class="dp-card__progress-pct">{{ p.progress }}%</span>
          </div>
          <div class="dp-card__progress-bar">
            <div
              class="dp-card__progress-fill"
              :class="`dp-card__progress-fill--${p.statusColor}`"
              :style="{ width: p.progress + '%' }"
            ></div>
          </div>
        </div>

        <!-- Bottom Row: Investors + Funding -->
        <div class="dp-card__bottom">
          <div class="dp-card__investors">
            <IcoUsers :size="11" :strokeWidth="2" />
            <span>{{ p.investorCount.toLocaleString() }}명</span>
          </div>
          <div class="dp-card__funding">
            <span class="dp-card__funding-current">{{ formatWon(p.currentFunding) }}</span>
            <span class="dp-card__funding-sep">/</span>
            <span class="dp-card__funding-total">{{ formatWon(p.totalFundingRequired) }}</span>
          </div>
        </div>

        <!-- Go Arrow -->
        <div class="dp-card__arrow">
          <IcoArrowRight :size="14" :strokeWidth="2" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="dp-empty">
      <div class="dp-empty__icon">
        <IcoBuilding :size="36" :strokeWidth="1.5" />
      </div>
      <h3 class="dp-empty__title">아직 등록된 프로젝트가 없습니다</h3>
      <p class="dp-empty__desc">새 프로젝트를 등록하고 투자자를 모집하세요</p>
      <button class="dp-empty__cta" @click="goCreate">
        <IcoDocument :size="14" :strokeWidth="2" />
        첫 프로젝트 등록하기
      </button>
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

.dp {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px 28px;

  @media (max-width: 768px) {
    padding: 12px 10px 20px;
  }
}

// ── Header ──
.dp-header {
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

// ── Grid ──
.dp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
}

// ── Card ──
.dp-card {
  position: relative;
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
  box-shadow: $shadow;

  &:hover {
    border-color: rgba($accent, 0.4);
    box-shadow: $shadow, 0 0 0 3px rgba($accent, 0.06);
    transform: translateY(-1px);
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__type-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10.5px;
    font-weight: 600;
    color: $text-secondary;
    background: $bg;
    padding: 3px 8px;
    border-radius: 5px;

    svg { flex-shrink: 0; }
  }

  &__status {
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

  &__name {
    font-size: 13px;
    font-weight: 800;
    color: $text-primary;
    margin: 0;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  &__location {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: $text-muted;

    svg { flex-shrink: 0; color: $text-muted; }
  }

  &__metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 6px 0;
    border-top: 1px solid $border;
    border-bottom: 1px solid $border;
  }

  &__metric {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  &__metric-label {
    font-size: 10px;
    font-weight: 600;
    color: $text-muted;
  }

  &__metric-value {
    font-size: 13px;
    font-weight: 800;
    color: $text-primary;
    font-variant-numeric: tabular-nums;

    &--accent { color: $accent; }
  }

  &__progress-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__progress-label {
    font-size: 10px;
    font-weight: 600;
    color: $text-muted;
  }

  &__progress-pct {
    font-size: 10.5px;
    font-weight: 700;
    color: $text-secondary;
    font-variant-numeric: tabular-nums;
  }

  &__progress-bar {
    height: 5px;
    background: $bg;
    border-radius: 3px;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;

    &--green { background: #16a34a; }
    &--amber { background: #f59e0b; }
    &--blue { background: $accent; }
    &--slate { background: #94a3b8; }
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__investors {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: $text-secondary;

    svg { color: $text-muted; }
  }

  &__funding {
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  &__funding-current {
    font-weight: 700;
    color: $text-primary;
  }

  &__funding-sep {
    color: $text-muted;
    margin: 0 2px;
  }

  &__funding-total {
    font-weight: 500;
    color: $text-muted;
  }

  &__arrow {
    position: absolute;
    top: 14px;
    right: 14px;
    color: $text-muted;
    opacity: 0;
    transition: opacity 0.15s;
  }

  &:hover &__arrow {
    opacity: 1;
    color: $accent;
  }
}

// ── Empty State ──
.dp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 64px 20px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 12px;
  text-align: center;

  &__icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: $bg;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-muted;
    margin-bottom: 4px;
  }

  &__title {
    font-size: 15px;
    font-weight: 800;
    color: $text-primary;
    margin: 0;
  }

  &__desc {
    font-size: 12px;
    color: $text-muted;
    margin: 0;
  }

  &__cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 22px;
    font-size: 12.5px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    color: #fff;
    background: $accent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 4px;
    transition: background 0.15s, transform 0.1s;

    &:hover {
      background: #3d58e0;
      transform: translateY(-1px);
    }
  }
}
</style>
