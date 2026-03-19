<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useProjectStore } from "@/stores/project-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  IcoArrowRight, IcoArrowLeft, IcoCheck, IcoDocument,
  IcoSolar, IcoWind, IcoBattery, IcoLightning,
  IcoMapPin, IcoBuilding, IcoChartUp, IcoInfo,
} from "@/components/icons";

const router = useRouter();
const projectStore = useProjectStore();
const authStore = useAuthStore();

const currentStep = ref(1);
const submitting = ref(false);
const totalSteps = 4;

// ── Step labels ──
const stepLabels = ["기본 정보", "4-Module 분류", "재무 정보", "확인 및 등록"];

// ── Step 1: Basic Info ──
const form = ref({
  name: "",
  type: "태양광",
  typeIcon: "solar",
  location: "",
  address: "",
  lng: 127.18,
  lat: 37.23,
  capacityMw: 0,
  yieldRate: 0,
  minInvestAmount: 0,
  description: "",
});

const typeOptions = [
  { value: "태양광", icon: "solar", label: "태양광" },
  { value: "풍력", icon: "wind", label: "풍력" },
  { value: "ESS", icon: "battery", label: "ESS/배터리" },
];

function selectType(opt: { value: string; icon: string }) {
  form.value.type = opt.value;
  form.value.typeIcon = opt.icon;
}

// ── Step 2: 4-Module Classification ──
const modules = ref({
  powerStructure: "",
  marketStructure: "",
  landRights: "",
  capitalStructure: "",
});

interface ModuleGroup {
  key: keyof typeof modules.value;
  title: string;
  subtitle: string;
  options: { value: string; label: string }[];
}

const moduleGroups: ModuleGroup[] = [
  {
    key: "powerStructure",
    title: "전력 구조",
    subtitle: "발전소 전력 사용/판매 방식",
    options: [
      { value: "self_consume", label: "자가소비" },
      { value: "full_sale", label: "전면매전" },
      { value: "net_metering", label: "상계거래" },
      { value: "surplus_sale", label: "잉여전력 매입" },
    ],
  },
  {
    key: "marketStructure",
    title: "시장/REC 구조",
    subtitle: "전력시장 및 인증 구조",
    options: [
      { value: "smp_rec_spot", label: "SMP+REC 현물" },
      { value: "smp_rec_contract", label: "SMP+REC 장기계약" },
      { value: "corporate_ppa", label: "기업 PPA" },
      { value: "fit", label: "FIT형" },
      { value: "vpp", label: "VPP/중개" },
    ],
  },
  {
    key: "landRights",
    title: "권원/입지",
    subtitle: "부지 소유 및 설치 유형",
    options: [
      { value: "self_owned", label: "자가 보유" },
      { value: "leased", label: "임대" },
      { value: "public_land", label: "공공부지" },
      { value: "agrivoltaic", label: "영농형" },
      { value: "floating", label: "수상형" },
      { value: "industrial", label: "산단형" },
    ],
  },
  {
    key: "capitalStructure",
    title: "자본 구조",
    subtitle: "자금 조달 방식",
    options: [
      { value: "equity_pf", label: "자기자본+PF" },
      { value: "community_fund", label: "주민참여/펀드" },
      { value: "corporate_credit", label: "기업 신용" },
      { value: "rental", label: "렌탈 구조" },
      { value: "policy", label: "정책형" },
    ],
  },
];

function selectModule(key: keyof typeof modules.value, value: string) {
  modules.value[key] = value;
}

// ── Step 3: Financial Details ──
const financial = ref({
  totalFundingRequired: 0,
  ppaYears: 20,
  fundingDeadline: "",
});

// ── Navigation ──
function nextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function goToStep(step: number) {
  if (step >= 1 && step <= totalSteps) {
    currentStep.value = step;
  }
}

// ── Validation ──
const step1Valid = computed(() =>
  form.value.name.trim() !== "" &&
  form.value.type !== "" &&
  form.value.location.trim() !== "" &&
  form.value.capacityMw > 0,
);

const step2Valid = computed(() =>
  modules.value.powerStructure !== "" &&
  modules.value.marketStructure !== "" &&
  modules.value.landRights !== "" &&
  modules.value.capitalStructure !== "",
);

const step3Valid = computed(() =>
  financial.value.totalFundingRequired > 0 &&
  financial.value.ppaYears > 0,
);

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1: return step1Valid.value;
    case 2: return step2Valid.value;
    case 3: return step3Valid.value;
    case 4: return true;
    default: return false;
  }
});

// ── Derived values for review ──
const capacityLabel = computed(() => {
  const mw = form.value.capacityMw;
  return mw > 0 ? `${mw.toFixed(1)} MW` : "-";
});

const yieldLabel = computed(() => {
  const y = form.value.yieldRate;
  return y > 0 ? `연 ${y.toFixed(1)}%` : "-";
});

const minInvestLabel = computed(() => {
  const a = form.value.minInvestAmount;
  return a > 0 ? `${a.toLocaleString()}원` : "-";
});

const fundingLabel = computed(() => {
  const f = financial.value.totalFundingRequired;
  if (f >= 100_000_000) return `${(f / 100_000_000).toFixed(1)}억원`;
  if (f >= 10_000) return `${Math.round(f / 10_000).toLocaleString()}만원`;
  return f > 0 ? `${f.toLocaleString()}원` : "-";
});

function getModuleLabel(group: ModuleGroup, value: string): string {
  return group.options.find((o) => o.value === value)?.label ?? "-";
}

// ── Submit ──
async function handleSubmit() {
  if (submitting.value) return;
  submitting.value = true;

  try {
    const result = await projectStore.createProject({
      developerId: authStore.user?.id ?? "",
      name: form.value.name,
      type: form.value.type,
      typeIcon: form.value.typeIcon,
      location: form.value.location,
      address: form.value.address || form.value.location,
      lng: form.value.lng,
      lat: form.value.lat,
      capacity: `${form.value.capacityMw.toFixed(1)} MW`,
      capacityMw: form.value.capacityMw,
      expectedYield: `연 ${form.value.yieldRate.toFixed(1)}%`,
      yieldRate: form.value.yieldRate,
      minInvest: `${form.value.minInvestAmount.toLocaleString()}원`,
      minInvestAmount: form.value.minInvestAmount,
      totalFundingRequired: financial.value.totalFundingRequired,
      progress: 0,
      status: "신규 오픈",
      statusColor: "blue",
      description: form.value.description,
      powerStructure: modules.value.powerStructure,
      marketStructure: modules.value.marketStructure,
      landRights: modules.value.landRights,
      capitalStructure: modules.value.capitalStructure,
      businessType: 0,
      businessTypeLabel: "",
      ppaYears: financial.value.ppaYears,
      annualOutput: "",
      co2Reduction: "",
      developerName: authStore.displayName || "개발사",
      fundingDeadline: financial.value.fundingDeadline || null,
    });

    if (result) {
      router.push("/developer/projects");
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="pw">
    <!-- Header -->
    <div class="pw-header">
      <h1 class="pw-header__title">새 프로젝트 등록</h1>
      <p class="pw-header__sub">4단계로 프로젝트 정보를 입력해 주세요</p>
    </div>

    <!-- Step Indicator -->
    <div class="pw-steps">
      <button
        v-for="(label, idx) in stepLabels"
        :key="idx"
        class="pw-step"
        :class="{
          'pw-step--active': currentStep === idx + 1,
          'pw-step--done': currentStep > idx + 1,
        }"
        @click="goToStep(idx + 1)"
      >
        <span class="pw-step__num">
          <IcoCheck v-if="currentStep > idx + 1" :size="12" :strokeWidth="3" />
          <template v-else>{{ idx + 1 }}</template>
        </span>
        <span class="pw-step__label">{{ label }}</span>
      </button>
    </div>

    <!-- Step Content -->
    <div class="pw-content">

      <!-- ── STEP 1: Basic Info ── -->
      <div v-if="currentStep === 1" class="pw-section">
        <div class="pw-section__head">
          <IcoDocument :size="16" :strokeWidth="2" />
          <div>
            <h2 class="pw-section__title">기본 정보</h2>
            <p class="pw-section__sub">프로젝트의 기본 정보를 입력하세요</p>
          </div>
        </div>

        <div class="pw-form">
          <div class="pw-field">
            <label class="pw-label">프로젝트명 <span class="pw-req">*</span></label>
            <input v-model="form.name" type="text" class="pw-input" placeholder="예: 용인시 지붕형 태양광 발전 사업" />
          </div>

          <div class="pw-field">
            <label class="pw-label">발전 유형 <span class="pw-req">*</span></label>
            <div class="pw-type-grid">
              <button
                v-for="opt in typeOptions"
                :key="opt.value"
                class="pw-type-btn"
                :class="{ 'pw-type-btn--active': form.type === opt.value }"
                @click="selectType(opt)"
              >
                <IcoSolar v-if="opt.icon === 'solar'" :size="18" :strokeWidth="2" />
                <IcoWind v-else-if="opt.icon === 'wind'" :size="18" :strokeWidth="2" />
                <IcoBattery v-else :size="18" :strokeWidth="2" />
                <span>{{ opt.label }}</span>
              </button>
            </div>
          </div>

          <div class="pw-field">
            <label class="pw-label">위치 <span class="pw-req">*</span></label>
            <div class="pw-input-icon">
              <IcoMapPin :size="14" :strokeWidth="2" />
              <input v-model="form.location" type="text" class="pw-input pw-input--icon" placeholder="예: 용인시 기흥구 보정동" />
            </div>
          </div>

          <div class="pw-row">
            <div class="pw-field">
              <label class="pw-label">설비용량 (MW) <span class="pw-req">*</span></label>
              <input v-model.number="form.capacityMw" type="number" step="0.1" min="0" class="pw-input" placeholder="0.0" />
            </div>
            <div class="pw-field">
              <label class="pw-label">기대수익률 (%)</label>
              <input v-model.number="form.yieldRate" type="number" step="0.1" min="0" class="pw-input" placeholder="0.0" />
            </div>
          </div>

          <div class="pw-field">
            <label class="pw-label">최소 투자금 (원)</label>
            <input v-model.number="form.minInvestAmount" type="number" step="1000" min="0" class="pw-input" placeholder="10000" />
          </div>

          <div class="pw-field">
            <label class="pw-label">프로젝트 설명</label>
            <textarea v-model="form.description" class="pw-textarea" rows="3" placeholder="프로젝트에 대한 간단한 설명을 작성해 주세요..."></textarea>
          </div>
        </div>
      </div>

      <!-- ── STEP 2: 4-Module Classification ── -->
      <div v-if="currentStep === 2" class="pw-section">
        <div class="pw-section__head">
          <IcoLightning :size="16" :strokeWidth="2" />
          <div>
            <h2 class="pw-section__title">4-Module 사업 구조 분류</h2>
            <p class="pw-section__sub">정산시스템 설계를 위한 사업 구조를 선택하세요</p>
          </div>
        </div>

        <div class="pw-modules">
          <div v-for="group in moduleGroups" :key="group.key" class="pw-module">
            <div class="pw-module__head">
              <span class="pw-module__title">{{ group.title }} <span class="pw-req">*</span></span>
              <span class="pw-module__sub">{{ group.subtitle }}</span>
            </div>
            <div class="pw-module__chips">
              <button
                v-for="opt in group.options"
                :key="opt.value"
                class="pw-chip"
                :class="{ 'pw-chip--active': modules[group.key] === opt.value }"
                @click="selectModule(group.key, opt.value)"
              >
                <IcoCheck v-if="modules[group.key] === opt.value" :size="11" :strokeWidth="3" />
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── STEP 3: Financial Details ── -->
      <div v-if="currentStep === 3" class="pw-section">
        <div class="pw-section__head">
          <IcoChartUp :size="16" :strokeWidth="2" />
          <div>
            <h2 class="pw-section__title">재무 정보</h2>
            <p class="pw-section__sub">펀딩 목표 금액 및 계약 조건을 입력하세요</p>
          </div>
        </div>

        <div class="pw-form">
          <div class="pw-field">
            <label class="pw-label">총 펀딩 목표 금액 (원) <span class="pw-req">*</span></label>
            <input v-model.number="financial.totalFundingRequired" type="number" step="10000000" min="0" class="pw-input" placeholder="예: 400000000" />
            <span v-if="financial.totalFundingRequired > 0" class="pw-field__hint">{{ fundingLabel }}</span>
          </div>

          <div class="pw-row">
            <div class="pw-field">
              <label class="pw-label">PPA 계약기간 (년) <span class="pw-req">*</span></label>
              <input v-model.number="financial.ppaYears" type="number" min="1" max="30" class="pw-input" placeholder="20" />
            </div>
            <div class="pw-field">
              <label class="pw-label">펀딩 마감일</label>
              <input v-model="financial.fundingDeadline" type="date" class="pw-input" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── STEP 4: Review & Submit ── -->
      <div v-if="currentStep === 4" class="pw-section">
        <div class="pw-section__head">
          <IcoInfo :size="16" :strokeWidth="2" />
          <div>
            <h2 class="pw-section__title">확인 및 등록</h2>
            <p class="pw-section__sub">입력한 정보를 확인하고 프로젝트를 등록하세요</p>
          </div>
        </div>

        <div class="pw-review">
          <!-- Basic Info -->
          <div class="pw-review__group">
            <h3 class="pw-review__group-title">기본 정보</h3>
            <div class="pw-review__grid">
              <div class="pw-review__item">
                <span class="pw-review__label">프로젝트명</span>
                <span class="pw-review__value">{{ form.name || '-' }}</span>
              </div>
              <div class="pw-review__item">
                <span class="pw-review__label">발전 유형</span>
                <span class="pw-review__value">{{ form.type }}</span>
              </div>
              <div class="pw-review__item">
                <span class="pw-review__label">위치</span>
                <span class="pw-review__value">{{ form.location || '-' }}</span>
              </div>
              <div class="pw-review__item">
                <span class="pw-review__label">설비용량</span>
                <span class="pw-review__value">{{ capacityLabel }}</span>
              </div>
              <div class="pw-review__item">
                <span class="pw-review__label">기대수익률</span>
                <span class="pw-review__value pw-review__value--accent">{{ yieldLabel }}</span>
              </div>
              <div class="pw-review__item">
                <span class="pw-review__label">최소 투자금</span>
                <span class="pw-review__value">{{ minInvestLabel }}</span>
              </div>
            </div>
            <div v-if="form.description" class="pw-review__desc">
              <span class="pw-review__label">설명</span>
              <p class="pw-review__desc-text">{{ form.description }}</p>
            </div>
          </div>

          <!-- 4-Module -->
          <div class="pw-review__group">
            <h3 class="pw-review__group-title">4-Module 사업 구조</h3>
            <div class="pw-review__grid">
              <div v-for="group in moduleGroups" :key="group.key" class="pw-review__item">
                <span class="pw-review__label">{{ group.title }}</span>
                <span class="pw-review__value">
                  <span class="pw-review__tag">{{ getModuleLabel(group, modules[group.key]) }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Financial -->
          <div class="pw-review__group">
            <h3 class="pw-review__group-title">재무 정보</h3>
            <div class="pw-review__grid">
              <div class="pw-review__item">
                <span class="pw-review__label">펀딩 목표</span>
                <span class="pw-review__value pw-review__value--bold">{{ fundingLabel }}</span>
              </div>
              <div class="pw-review__item">
                <span class="pw-review__label">PPA 계약기간</span>
                <span class="pw-review__value">{{ financial.ppaYears }}년</span>
              </div>
              <div class="pw-review__item">
                <span class="pw-review__label">펀딩 마감일</span>
                <span class="pw-review__value">{{ financial.fundingDeadline || '미설정' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Navigation -->
    <div class="pw-footer">
      <button
        v-if="currentStep > 1"
        class="pw-footer__btn pw-footer__btn--secondary"
        @click="prevStep"
      >
        <IcoArrowLeft :size="14" :strokeWidth="2" />
        이전
      </button>
      <div v-else class="pw-footer__spacer"></div>

      <div class="pw-footer__right">
        <span class="pw-footer__step-info">{{ currentStep }} / {{ totalSteps }}</span>
        <button
          v-if="currentStep < totalSteps"
          class="pw-footer__btn pw-footer__btn--primary"
          :disabled="!canProceed"
          @click="nextStep"
        >
          다음
          <IcoArrowRight :size="14" :strokeWidth="2" />
        </button>
        <button
          v-else
          class="pw-footer__btn pw-footer__btn--submit"
          :disabled="submitting"
          @click="handleSubmit"
        >
          <IcoCheck v-if="!submitting" :size="14" :strokeWidth="2.5" />
          {{ submitting ? '등록 중...' : '프로젝트 등록' }}
        </button>
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
$green: #16a34a;
$green-bg: #dcfce7;

.pw {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px 28px;

  @media (max-width: 768px) {
    padding: 12px 10px 20px;
  }
}

// ── Header ──
.pw-header {
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
}

// ── Step Indicator ──
.pw-steps {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  box-shadow: $shadow;

  @media (max-width: 600px) {
    gap: 2px;
    padding: 3px;
  }
}

.pw-step {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
  font-family: "Inter", sans-serif;

  &__num {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    background: $bg;
    color: $text-muted;
    border: 1.5px solid $border;
    flex-shrink: 0;
    transition: all 0.15s;
  }

  &__label {
    font-size: 11px;
    font-weight: 600;
    color: $text-muted;
    white-space: nowrap;
    transition: color 0.15s;

    @media (max-width: 600px) {
      display: none;
    }
  }

  &--active {
    background: $accent-light;

    .pw-step__num {
      background: $accent;
      color: #fff;
      border-color: $accent;
    }

    .pw-step__label {
      color: $accent;
      font-weight: 700;
    }
  }

  &--done {
    .pw-step__num {
      background: $green-bg;
      color: $green;
      border-color: $green-bg;
    }

    .pw-step__label {
      color: $green;
    }
  }

  &:hover:not(&--active) {
    background: $bg;
  }
}

// ── Content ──
.pw-content {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 20px;
  box-shadow: $shadow;

  @media (max-width: 768px) {
    padding: 14px;
  }
}

// ── Section ──
.pw-section {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__head {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: $accent;

    svg { flex-shrink: 0; margin-top: 2px; }
  }

  &__title {
    font-size: 14px;
    font-weight: 800;
    color: $text-primary;
    margin: 0;
    letter-spacing: -0.01em;
  }

  &__sub {
    font-size: 11.5px;
    color: $text-muted;
    margin: 2px 0 0;
  }
}

// ── Form Fields ──
.pw-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pw-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
}

.pw-field {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__hint {
    font-size: 10.5px;
    font-weight: 600;
    color: $accent;
  }
}

.pw-label {
  font-size: 11px;
  font-weight: 700;
  color: $text-secondary;
  letter-spacing: 0.02em;
}

.pw-req {
  color: #ef4444;
}

.pw-input {
  padding: 8px 12px;
  font-size: 12.5px;
  font-family: "Inter", sans-serif;
  color: $text-primary;
  background: $bg;
  border: 1px solid $border;
  border-radius: 7px;
  outline: none;
  transition: border-color 0.12s, box-shadow 0.12s;

  &:focus {
    border-color: $accent;
    box-shadow: 0 0 0 3px rgba($accent, 0.1);
  }

  &::placeholder { color: $text-muted; }

  &--icon { padding-left: 0; }
}

.pw-input-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: $bg;
  border: 1px solid $border;
  border-radius: 7px;
  transition: border-color 0.12s, box-shadow 0.12s;

  &:focus-within {
    border-color: $accent;
    box-shadow: 0 0 0 3px rgba($accent, 0.1);
  }

  svg { color: $text-muted; flex-shrink: 0; }

  .pw-input {
    border: none;
    background: none;
    box-shadow: none;
    padding: 8px 0;

    &:focus { box-shadow: none; border-color: transparent; }
  }
}

.pw-textarea {
  padding: 8px 12px;
  font-size: 12.5px;
  font-family: "Inter", sans-serif;
  color: $text-primary;
  background: $bg;
  border: 1px solid $border;
  border-radius: 7px;
  outline: none;
  resize: vertical;
  min-height: 72px;
  transition: border-color 0.12s, box-shadow 0.12s;

  &:focus {
    border-color: $accent;
    box-shadow: 0 0 0 3px rgba($accent, 0.1);
  }

  &::placeholder { color: $text-muted; }
}

// ── Type Selector ──
.pw-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
}

.pw-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 12px;
  background: $bg;
  border: 1.5px solid $border;
  border-radius: 8px;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: $text-secondary;
  transition: all 0.15s;

  &:hover {
    border-color: $accent;
    color: $accent;
  }

  &--active {
    background: $accent-light;
    border-color: $accent;
    color: $accent;
    box-shadow: 0 0 0 3px rgba($accent, 0.1);
  }
}

// ── Module Groups ──
.pw-modules {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pw-module {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: $bg;
  border: 1px solid $border;
  border-radius: 8px;

  &__head {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  &__title {
    font-size: 12px;
    font-weight: 700;
    color: $text-primary;
  }

  &__sub {
    font-size: 10.5px;
    color: $text-muted;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
}

.pw-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  color: $text-secondary;
  background: $surface;
  border: 1.5px solid $border;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    border-color: $accent;
    color: $accent;
  }

  &--active {
    background: $accent;
    border-color: $accent;
    color: #fff;
  }
}

// ── Review ──
.pw-review {
  display: flex;
  flex-direction: column;
  gap: 18px;

  &__group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-bottom: 14px;
    border-bottom: 1px solid $border;

    &:last-child { border-bottom: none; padding-bottom: 0; }
  }

  &__group-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: $text-muted;
    margin: 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__label {
    font-size: 10.5px;
    font-weight: 600;
    color: $text-muted;
  }

  &__value {
    font-size: 13px;
    font-weight: 700;
    color: $text-primary;

    &--accent { color: $accent; }
    &--bold { font-weight: 900; }
  }

  &__tag {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    background: $accent-light;
    color: $accent;
    border-radius: 5px;
  }

  &__desc {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__desc-text {
    font-size: 12px;
    color: $text-secondary;
    line-height: 1.5;
    margin: 0;
  }
}

// ── Footer Navigation ──
.pw-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  box-shadow: $shadow;

  &__spacer { flex: 1; }

  &__right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__step-info {
    font-size: 11px;
    font-weight: 600;
    color: $text-muted;
    font-variant-numeric: tabular-nums;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    font-size: 12px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &--secondary {
      background: $bg;
      color: $text-secondary;
      border: 1px solid $border;

      &:hover:not(:disabled) {
        background: #f1f5f9;
        color: $text-primary;
      }
    }

    &--primary {
      background: $accent;
      color: #fff;

      &:hover:not(:disabled) {
        background: #3d58e0;
        transform: translateY(-1px);
      }
    }

    &--submit {
      background: $green;
      color: #fff;

      &:hover:not(:disabled) {
        background: #15803d;
        transform: translateY(-1px);
      }
    }
  }
}
</style>
