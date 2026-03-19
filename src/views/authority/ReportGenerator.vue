<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useBlockchainStore } from "@/stores/blockchain-store";
import { useProjectStore } from "@/stores/project-store";
import {
  IcoDocument,
  IcoCheck,
  IcoChartBar,
  IcoBlockchain,
} from "@/components/icons";

const blockchainStore = useBlockchainStore();
const projectStore = useProjectStore();

onMounted(async () => {
  await Promise.all([
    blockchainStore.loadRecords(),
    projectStore.loadProjects(),
  ]);
});

// ── Form State ──
const reportType = ref("monthly");
const dateStart = ref("2026-01-01");
const dateEnd = ref("2026-03-18");
const municipality = ref("all");

const metrics = ref({
  energy: true,
  co2: true,
  lease: true,
  investors: false,
  blockchain: false,
});

const reportTypes = [
  { value: "monthly", label: "월간 요약" },
  { value: "quarterly", label: "분기 보고서" },
  { value: "annual", label: "연간 보고서" },
  { value: "project", label: "프로젝트별 보고서" },
];

const municipalities = [
  { value: "all", label: "전체" },
  { value: "yongin", label: "용인시" },
  { value: "hwaseong", label: "화성시" },
  { value: "eumseong", label: "음성군" },
];

const metricOptions = [
  { key: "energy", label: "에너지 생산량" },
  { key: "co2", label: "CO2 감축량" },
  { key: "lease", label: "임대 수익" },
  { key: "investors", label: "투자자 현황" },
  { key: "blockchain", label: "블록체인 기록" },
];

// ── Submit State ──
const isGenerated = ref(false);
const isGenerating = ref(false);

async function handleGenerate() {
  isGenerating.value = true;
  // Simulate generation delay
  await new Promise((r) => setTimeout(r, 1200));
  isGenerating.value = false;
  isGenerated.value = true;
}

function handleReset() {
  isGenerated.value = false;
}

function handleDownload() {
  // Mock download
  alert("보고서 파일이 다운로드됩니다. (시뮬레이션)");
}

// ── Report Type Label ──
const reportTypeLabel = computed(() => {
  return reportTypes.find((t) => t.value === reportType.value)?.label || "";
});

const municipalityLabel = computed(() => {
  return municipalities.find((m) => m.value === municipality.value)?.label || "";
});

// ── Preview Stats ──
const stats = computed(() => blockchainStore.stats);

const selectedMetrics = computed(() => {
  return metricOptions.filter(
    (m) => metrics.value[m.key as keyof typeof metrics.value],
  );
});
</script>

<template>
  <div class="report-gen">
    <!-- Header -->
    <div class="report-gen__header">
      <div class="report-gen__header-text">
        <h1 class="report-gen__title">보고서 생성</h1>
        <p class="report-gen__subtitle">관리기관용 정기 보고서를 생성합니다</p>
      </div>
    </div>

    <div class="report-gen__layout">
      <!-- Form Section -->
      <div class="report-gen__form-card">
        <div class="report-gen__form-title">
          <IcoDocument :size="16" :strokeWidth="2" />
          보고서 설정
        </div>

        <!-- Report Type -->
        <div class="report-gen__field">
          <label class="report-gen__label">보고서 유형</label>
          <select v-model="reportType" class="report-gen__select">
            <option
              v-for="t in reportTypes"
              :key="t.value"
              :value="t.value"
            >
              {{ t.label }}
            </option>
          </select>
        </div>

        <!-- Date Range -->
        <div class="report-gen__field-row">
          <div class="report-gen__field">
            <label class="report-gen__label">시작일</label>
            <input
              v-model="dateStart"
              type="date"
              class="report-gen__input"
            />
          </div>
          <div class="report-gen__field">
            <label class="report-gen__label">종료일</label>
            <input
              v-model="dateEnd"
              type="date"
              class="report-gen__input"
            />
          </div>
        </div>

        <!-- Municipality Filter -->
        <div class="report-gen__field">
          <label class="report-gen__label">지자체</label>
          <select v-model="municipality" class="report-gen__select">
            <option
              v-for="m in municipalities"
              :key="m.value"
              :value="m.value"
            >
              {{ m.label }}
            </option>
          </select>
        </div>

        <!-- Metrics Checkboxes -->
        <div class="report-gen__field">
          <label class="report-gen__label">포함 항목</label>
          <div class="report-gen__checkboxes">
            <label
              v-for="opt in metricOptions"
              :key="opt.key"
              class="report-gen__checkbox"
            >
              <input
                v-model="metrics[opt.key as keyof typeof metrics]"
                type="checkbox"
                class="report-gen__checkbox-input"
              />
              <span class="report-gen__checkbox-mark">
                <IcoCheck :size="10" :strokeWidth="3" />
              </span>
              <span class="report-gen__checkbox-label">{{ opt.label }}</span>
            </label>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          class="report-gen__submit"
          :class="{ 'report-gen__submit--loading': isGenerating }"
          :disabled="isGenerating"
          @click="handleGenerate"
        >
          <template v-if="isGenerating">
            <span class="report-gen__spinner"></span>
            생성 중...
          </template>
          <template v-else>
            <IcoDocument :size="14" :strokeWidth="2" />
            보고서 생성
          </template>
        </button>

        <!-- Success State -->
        <div v-if="isGenerated" class="report-gen__success">
          <div class="report-gen__success-header">
            <IcoCheck :size="18" :strokeWidth="2.5" />
            <span>보고서가 생성되었습니다</span>
          </div>
          <div class="report-gen__success-info">
            <span>{{ reportTypeLabel }} | {{ municipalityLabel }} | {{ dateStart }} ~ {{ dateEnd }}</span>
          </div>
          <div class="report-gen__success-actions">
            <button class="report-gen__download-btn" @click="handleDownload">
              <IcoDocument :size="14" :strokeWidth="2" />
              PDF 다운로드
            </button>
            <button class="report-gen__reset-btn" @click="handleReset">
              새 보고서 만들기
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Section -->
      <div class="report-gen__preview-card">
        <div class="report-gen__preview-title">
          <IcoChartBar :size="16" :strokeWidth="2" />
          보고서 미리보기
        </div>

        <div class="report-gen__preview-header">
          <div class="report-gen__preview-doc-title">THEKIE 관리기관 보고서</div>
          <div class="report-gen__preview-doc-sub">
            {{ reportTypeLabel }} | {{ municipalityLabel }} | {{ dateStart }} ~ {{ dateEnd }}
          </div>
        </div>

        <div class="report-gen__preview-section" v-if="metrics.energy">
          <div class="report-gen__preview-section-title">에너지 생산량</div>
          <div class="report-gen__preview-stat-row">
            <span class="report-gen__preview-stat-label">총 배치 용량</span>
            <span class="report-gen__preview-stat-value">{{ stats.totalMwDeployed }} MW</span>
          </div>
          <div class="report-gen__preview-stat-row">
            <span class="report-gen__preview-stat-label">총 프로젝트</span>
            <span class="report-gen__preview-stat-value">{{ stats.totalProjects }}개</span>
          </div>
          <div class="report-gen__preview-stat-row">
            <span class="report-gen__preview-stat-label">총 정산액</span>
            <span class="report-gen__preview-stat-value">{{ stats.totalSettlements }}</span>
          </div>
        </div>

        <div class="report-gen__preview-section" v-if="metrics.co2">
          <div class="report-gen__preview-section-title">CO2 감축량</div>
          <div class="report-gen__preview-stat-row">
            <span class="report-gen__preview-stat-label">총 CO2 감축</span>
            <span class="report-gen__preview-stat-value">{{ stats.totalCo2Avoided.toLocaleString() }} tCO2</span>
          </div>
          <div class="report-gen__preview-stat-row">
            <span class="report-gen__preview-stat-label">나무 환산</span>
            <span class="report-gen__preview-stat-value">{{ Math.round(stats.totalCo2Avoided * 1000 / 22).toLocaleString() }}그루</span>
          </div>
        </div>

        <div class="report-gen__preview-section" v-if="metrics.lease">
          <div class="report-gen__preview-section-title">임대 수익</div>
          <div class="report-gen__preview-stat-row">
            <span class="report-gen__preview-stat-label">공유지 필지</span>
            <span class="report-gen__preview-stat-value">{{ stats.publicLandParcels }}개</span>
          </div>
          <div class="report-gen__preview-stat-row">
            <span class="report-gen__preview-stat-label">공유지 수익</span>
            <span class="report-gen__preview-stat-value">{{ stats.publicLandRevenue }}</span>
          </div>
        </div>

        <div class="report-gen__preview-section" v-if="metrics.investors">
          <div class="report-gen__preview-section-title">투자자 현황</div>
          <div class="report-gen__preview-stat-row">
            <span class="report-gen__preview-stat-label">총 투자자</span>
            <span class="report-gen__preview-stat-value">{{ stats.totalInvestors.toLocaleString() }}명</span>
          </div>
          <div class="report-gen__preview-stat-row">
            <span class="report-gen__preview-stat-label">총 투자액</span>
            <span class="report-gen__preview-stat-value">{{ stats.totalInvested }}</span>
          </div>
        </div>

        <div class="report-gen__preview-section" v-if="metrics.blockchain">
          <div class="report-gen__preview-section-title">블록체인 기록</div>
          <div class="report-gen__preview-stat-row">
            <span class="report-gen__preview-stat-label">총 기록 수</span>
            <span class="report-gen__preview-stat-value">{{ blockchainStore.totalRecords }}건</span>
          </div>
          <div class="report-gen__preview-stat-row">
            <span class="report-gen__preview-stat-label">검증 완료</span>
            <span class="report-gen__preview-stat-value">{{ blockchainStore.verifiedCount }}건</span>
          </div>
          <div class="report-gen__preview-stat-row">
            <span class="report-gen__preview-stat-label">검증률</span>
            <span class="report-gen__preview-stat-value">
              {{ blockchainStore.totalRecords > 0 ? Math.round(blockchainStore.verifiedCount / blockchainStore.totalRecords * 100) : 0 }}%
            </span>
          </div>
        </div>

        <div v-if="selectedMetrics.length === 0" class="report-gen__preview-empty">
          포함 항목을 선택하면 미리보기가 표시됩니다.
        </div>

        <div class="report-gen__preview-footer">
          <IcoBlockchain :size="12" :strokeWidth="2" />
          <span>THEKIE 블록체인 검증 플랫폼 | 자동 생성 보고서</span>
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

.report-gen {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: $bg;
  min-height: 100%;
}

// ── Header ──
.report-gen__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.report-gen__header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.report-gen__title {
  font-size: 22px;
  font-weight: 800;
  color: $text-primary;
  margin: 0;
  letter-spacing: -0.02em;
}

.report-gen__subtitle {
  font-size: 13px;
  color: $text-secondary;
  margin: 0;
}

// ── Layout ──
.report-gen__layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

// ── Form Card ──
.report-gen__form-card {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 24px;
  box-shadow: $shadow;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.report-gen__form-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: $text-primary;
}

// ── Fields ──
.report-gen__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.report-gen__field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.report-gen__label {
  font-size: 11px;
  font-weight: 700;
  color: $text-secondary;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.report-gen__select,
.report-gen__input {
  padding: 10px 12px;
  border: 1px solid $border;
  border-radius: 8px;
  font-size: 13px;
  color: $text-primary;
  background: $surface;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;

  &:focus {
    border-color: $accent;
    box-shadow: 0 0 0 3px rgba($accent, 0.1);
  }
}

.report-gen__select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
  cursor: pointer;
}

// ── Checkboxes ──
.report-gen__checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.report-gen__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.report-gen__checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.report-gen__checkbox-mark {
  width: 18px;
  height: 18px;
  border: 2px solid $border;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 0.15s;
  flex-shrink: 0;
}

.report-gen__checkbox-input:checked + .report-gen__checkbox-mark {
  background: $accent;
  border-color: $accent;
  color: #fff;
}

.report-gen__checkbox-label {
  font-size: 13px;
  font-weight: 500;
  color: $text-secondary;
}

// ── Submit Button ──
.report-gen__submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: $accent;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  width: 100%;

  &:hover:not(:disabled) { background: #3a55d4; }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &--loading {
    background: #6b7def;
  }
}

.report-gen__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// ── Success State ──
.report-gen__success {
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  background: #f0fdf4;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-gen__success-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #16a34a;
}

.report-gen__success-info {
  font-size: 12px;
  color: $text-secondary;
  padding-left: 26px;
}

.report-gen__success-actions {
  display: flex;
  gap: 8px;
  padding-left: 26px;
}

.report-gen__download-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #16a34a;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: #15803d; }
}

.report-gen__reset-btn {
  padding: 8px 16px;
  border: 1px solid $border;
  border-radius: 6px;
  background: $surface;
  color: $text-secondary;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: $accent;
    color: $accent;
  }
}

// ── Preview Card ──
.report-gen__preview-card {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 24px;
  box-shadow: $shadow;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-gen__preview-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: $text-primary;
}

.report-gen__preview-header {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 8px;
  padding: 20px;
}

.report-gen__preview-doc-title {
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 4px;
}

.report-gen__preview-doc-sub {
  font-size: 11px;
  color: #94a3b8;
}

.report-gen__preview-section {
  border: 1px solid $border;
  border-radius: 8px;
  padding: 14px;
}

.report-gen__preview-section-title {
  font-size: 11px;
  font-weight: 700;
  color: $accent;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid $border;
}

.report-gen__preview-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;

  & + & {
    border-top: 1px dashed lighten($border, 3%);
  }
}

.report-gen__preview-stat-label {
  font-size: 12px;
  color: $text-secondary;
}

.report-gen__preview-stat-value {
  font-size: 13px;
  font-weight: 700;
  color: $text-primary;
  font-variant-numeric: tabular-nums;
}

.report-gen__preview-empty {
  text-align: center;
  padding: 32px 0;
  font-size: 13px;
  color: $text-muted;
  border: 1px dashed $border;
  border-radius: 8px;
}

.report-gen__preview-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid $border;
  font-size: 10px;
  color: $text-muted;
}

// ── Responsive ──
@media (max-width: 1024px) {
  .report-gen__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .report-gen {
    padding: 16px;
  }

  .report-gen__field-row {
    grid-template-columns: 1fr;
  }

  .report-gen__success-actions {
    flex-direction: column;
    padding-left: 0;
  }
}
</style>
