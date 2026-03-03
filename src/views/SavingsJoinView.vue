<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { IcoArrowRight } from "@/components/icons";

const router = useRouter();

// ── Product types ─────────────────────────────────────────────────────────────
const products = [
  { id: "stable",   name: "안정형",  sub: "PPA 기반 장기 계약",     rate: 0.065, risk: "낮은 위험",  color: "#22c55e" },
  { id: "balanced", name: "균형형",  sub: "PPA + REC 복합 수익",    rate: 0.078, risk: "중간 위험",  color: "#4F6AF5" },
  { id: "growth",   name: "성장형",  sub: "VPP 시장참여 프리미엄",  rate: 0.092, risk: "높은 수익",  color: "#8b5cf6" },
];

// ── Inputs ────────────────────────────────────────────────────────────────────
const selectedProduct = ref("balanced");
const investAmount = ref(50_000_000);
const investYears = ref(10);
const periodOptions = [3, 5, 10, 15, 20];

// ── Computed ──────────────────────────────────────────────────────────────────
const product = computed(() => products.find((p) => p.id === selectedProduct.value)!);
const rate = computed(() => product.value.rate);
const totalValue = computed(() => investAmount.value * Math.pow(1 + rate.value, investYears.value));
const totalReturn = computed(() => totalValue.value - investAmount.value);
const monthlyIncome = computed(() => (investAmount.value * rate.value) / 12);
const roiPct = computed(() => ((totalReturn.value / investAmount.value) * 100).toFixed(1));

const yearlyData = computed(() =>
  Array.from({ length: investYears.value }, (_, i) => ({
    year: i + 1,
    value: investAmount.value * Math.pow(1 + rate.value, i + 1),
  })),
);
const chartMax = computed(() => Math.max(...yearlyData.value.map((d) => d.value)));

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtWon(n: number): string {
  if (n >= 100_000_000) {
    const eok = n / 100_000_000;
    return (eok === Math.floor(eok) ? eok.toString() : eok.toFixed(1)) + "억";
  }
  const man = Math.round(n / 10_000);
  return man.toLocaleString() + "만";
}
</script>

<template>
  <div class="sj">
    <!-- ── Header ── -->
    <header class="sj__head">
      <div class="sj__head-inner">
        <div>
          <span class="sj__eyebrow">Investment Simulator</span>
          <h1 class="sj__title">내 투자금, 얼마나 불어날까요?</h1>
          <p class="sj__desc">투자 상품과 금액을 선택하면 예상 수익을 바로 확인할 수 있습니다.</p>
        </div>
        <router-link to="/landing" class="sj__back">← 홈으로</router-link>
      </div>
    </header>

    <!-- ── Content ── -->
    <div class="sj__content">

      <!-- Product selector -->
      <section class="sj__section">
        <div class="sj__label">투자 상품 선택</div>
        <div class="sj__products">
          <button
            v-for="p in products"
            :key="p.id"
            class="sj__prod"
            :class="{ 'sj__prod--active': selectedProduct === p.id }"
            :style="selectedProduct === p.id ? { borderColor: p.color, '--prod-color': p.color } : { '--prod-color': p.color }"
            @click="selectedProduct = p.id"
          >
            <span class="sj__prod-rate" :style="{ color: p.color }">연 {{ (p.rate * 100).toFixed(1) }}%</span>
            <span class="sj__prod-name">{{ p.name }}</span>
            <span class="sj__prod-sub">{{ p.sub }}</span>
            <span class="sj__prod-risk" :style="{ color: p.color }">{{ p.risk }}</span>
          </button>
        </div>
      </section>

      <!-- Inputs -->
      <section class="sj__section">
        <div class="sj__inputs">
          <div class="sj__input-group">
            <div class="sj__input-top">
              <span class="sj__input-label">투자 금액</span>
              <span class="sj__input-value">₩{{ fmtWon(investAmount) }}원</span>
            </div>
            <input
              v-model.number="investAmount"
              type="range"
              min="1000000"
              max="500000000"
              step="1000000"
              class="sj__slider"
            />
            <div class="sj__input-range">
              <span>₩100만</span>
              <span>₩5억</span>
            </div>
          </div>

          <div class="sj__input-group">
            <span class="sj__input-label">투자 기간</span>
            <div class="sj__period-btns">
              <button
                v-for="y in periodOptions"
                :key="y"
                class="sj__period-btn"
                :class="{ 'sj__period-btn--active': investYears === y }"
                @click="investYears = y"
              >
                {{ y }}년
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Results -->
      <section class="sj__section">
        <div class="sj__result-hero">
          <div class="sj__result-label">예상 총 수익</div>
          <div class="sj__result-row">
            <span class="sj__big-num">₩{{ fmtWon(totalReturn) }}</span>
            <span class="sj__roi">+{{ roiPct }}%</span>
          </div>
        </div>

        <div class="sj__kpis">
          <div class="sj__kpi">
            <span class="sj__kpi-label">연간 수익률</span>
            <span class="sj__kpi-val">{{ (rate * 100).toFixed(1) }}<em>%</em></span>
          </div>
          <div class="sj__kpi">
            <span class="sj__kpi-label">월 예상 수입</span>
            <span class="sj__kpi-val">₩{{ fmtWon(monthlyIncome) }}<em>원</em></span>
          </div>
          <div class="sj__kpi">
            <span class="sj__kpi-label">투자 원금</span>
            <span class="sj__kpi-val">₩{{ fmtWon(investAmount) }}<em>원</em></span>
          </div>
          <div class="sj__kpi">
            <span class="sj__kpi-label">만기 수령액</span>
            <span class="sj__kpi-val">₩{{ fmtWon(totalValue) }}<em>원</em></span>
          </div>
        </div>
      </section>

      <!-- Chart -->
      <section class="sj__section">
        <div class="sj__chart-wrap">
          <div class="sj__chart-title">자산 성장 추이 ({{ investYears }}년)</div>
          <div class="sj__chart">
            <div
              v-for="d in yearlyData"
              :key="d.year"
              class="sj__bar-col"
            >
              <div class="sj__bar-track">
                <div
                  class="sj__bar-fill"
                  :style="{ height: (d.value / chartMax * 100) + '%' }"
                >
                  <span v-if="d.year === investYears" class="sj__bar-tip">₩{{ fmtWon(d.value) }}</span>
                </div>
              </div>
              <span class="sj__bar-label">{{ d.year }}년</span>
            </div>
          </div>
          <div class="sj__chart-baseline">
            <span class="sj__baseline-line"></span>
            <span class="sj__baseline-text">원금 ₩{{ fmtWon(investAmount) }}</span>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="sj__section sj__cta">
        <button class="sj__cta-btn">
          상담 예약하기
          <IcoArrowRight :size="16" :strokeWidth="2.5" />
        </button>
        <p class="sj__cta-note">본 시뮬레이션은 투자 참고용이며, 실제 수익은 시장 조건에 따라 달라질 수 있습니다.</p>
      </section>

    </div>
  </div>
</template>

<style scoped lang="scss">
$accent:   #4F6AF5;
$border:   #E8EAED;
$bg:       #F4F5F7;
$surface:  #ffffff;
$text:     #111827;
$muted:    #6B7280;

.sj {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: $bg;
  font-family: "Inter", sans-serif;
  overflow-y: auto;
}

// ── Header ───────────────────────────────────────────────────────────────────
.sj__head {
  background: $surface;
  border-bottom: 1px solid $border;
  padding: 28px 24px;
  flex-shrink: 0;
}

.sj__head-inner {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.sj__eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $accent;
  display: block;
  margin-bottom: 6px;
}

.sj__title {
  font-size: 22px;
  font-weight: 800;
  color: $text;
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.sj__desc {
  font-size: 13px;
  color: $muted;
  line-height: 1.6;
  margin: 0;
}

.sj__back {
  font-size: 12px;
  color: $muted;
  text-decoration: none;
  flex-shrink: 0;
  margin-top: 4px;
  &:hover { color: $text; }
}

// ── Content ──────────────────────────────────────────────────────────────────
.sj__content {
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  padding: 24px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sj__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sj__label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $muted;
}

// ── Product cards ────────────────────────────────────────────────────────────
.sj__products {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.sj__prod {
  text-align: center;
  border: 2px solid $border;
  border-radius: 14px;
  padding: 20px 16px;
  background: $surface;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  &:hover {
    border-color: #c5cff8;
    background: #fafaff;
  }

  &--active {
    background: #f8f9ff;
    box-shadow: 0 0 0 3px rgba(79, 106, 245, 0.1);
  }
}

.sj__prod-rate {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.sj__prod-name {
  font-size: 15px;
  font-weight: 700;
  color: $text;
}

.sj__prod-sub {
  font-size: 11.5px;
  color: $muted;
  line-height: 1.4;
}

.sj__prod-risk {
  font-size: 10px;
  font-weight: 700;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.03);
}

// ── Inputs ───────────────────────────────────────────────────────────────────
.sj__inputs {
  background: $surface;
  border: 1px solid $border;
  border-radius: 14px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sj__input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sj__input-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.sj__input-label {
  font-size: 12px;
  font-weight: 600;
  color: $muted;
}

.sj__input-value {
  font-size: 18px;
  font-weight: 800;
  color: $text;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.sj__slider {
  width: 100%;
  height: 6px;
  accent-color: $accent;
  cursor: pointer;
}

.sj__input-range {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: $muted;
}

.sj__period-btns {
  display: flex;
  gap: 8px;
}

.sj__period-btn {
  flex: 1;
  padding: 10px 0;
  border: 1.5px solid $border;
  border-radius: 10px;
  background: $surface;
  font-size: 13px;
  font-weight: 600;
  color: $muted;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  transition: all 0.15s;

  &:hover {
    border-color: #c5cff8;
    color: $text;
  }

  &--active {
    border-color: $accent;
    background: #eef1fe;
    color: $accent;
    font-weight: 700;
  }
}

// ── Results ──────────────────────────────────────────────────────────────────
.sj__result-hero {
  background: linear-gradient(135deg, #4F6AF5 0%, #7c9fff 100%);
  border-radius: 16px;
  padding: 28px 28px 24px;
  color: #fff;
}

.sj__result-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.75;
  margin-bottom: 6px;
}

.sj__result-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.sj__big-num {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.sj__roi {
  font-size: 18px;
  font-weight: 700;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 8px;
}

.sj__kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.sj__kpi {
  background: $surface;
  border: 1px solid $border;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sj__kpi-label {
  font-size: 10.5px;
  color: $muted;
  font-weight: 500;
}

.sj__kpi-val {
  font-size: 17px;
  font-weight: 700;
  color: $text;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;

  em {
    font-style: normal;
    font-size: 11px;
    color: $muted;
    margin-left: 1px;
  }
}

// ── Chart ────────────────────────────────────────────────────────────────────
.sj__chart-wrap {
  background: $surface;
  border: 1px solid $border;
  border-radius: 14px;
  padding: 20px 24px;
}

.sj__chart-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $muted;
  margin-bottom: 16px;
}

.sj__chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
}

.sj__bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: 100%;
}

.sj__bar-track {
  flex: 1;
  width: 100%;
  background: $bg;
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: flex-end;
  overflow: visible;
  position: relative;
}

.sj__bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(to top, #4F6AF5, #7c9fff);
  transition: height 0.4s ease;
  position: relative;
}

.sj__bar-tip {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  font-weight: 700;
  color: $accent;
  white-space: nowrap;
}

.sj__bar-label {
  font-size: 9px;
  color: $muted;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.sj__chart-baseline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.sj__baseline-line {
  flex: 1;
  height: 1px;
  background: repeating-linear-gradient(
    to right,
    $muted 0,
    $muted 4px,
    transparent 4px,
    transparent 8px
  );
  opacity: 0.4;
}

.sj__baseline-text {
  font-size: 10px;
  color: $muted;
  white-space: nowrap;
}

// ── CTA ──────────────────────────────────────────────────────────────────────
.sj__cta {
  align-items: center;
  text-align: center;
  padding-top: 8px;
}

.sj__cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: $accent;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;

  &:hover  { background: #3d57e0; }
  &:active { transform: scale(0.97); }
}

.sj__cta-note {
  font-size: 10.5px;
  color: $muted;
  margin: 12px 0 0;
  line-height: 1.5;
}

// ── Responsive ───────────────────────────────────────────────────────────────
@media (max-width: 640px) {
  .sj__head-inner {
    flex-direction: column;
    gap: 8px;
  }

  .sj__products {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .sj__prod {
    flex-direction: row;
    text-align: left;
    gap: 8px;
    padding: 14px 16px;
  }

  .sj__prod-rate {
    font-size: 18px;
    min-width: 70px;
  }

  .sj__kpis {
    grid-template-columns: 1fr 1fr;
  }

  .sj__big-num {
    font-size: 30px;
  }

  .sj__period-btns {
    flex-wrap: wrap;
  }

  .sj__period-btn {
    flex: 0 0 auto;
    padding: 10px 16px;
  }
}
</style>
