<script setup lang="ts">
import { ref, reactive, type Component } from "vue";
import { useRouter } from "vue-router";
import {
  IcoArrowLeft, IcoArrowRight, IcoCheck, IcoInfo,
  IcoBuilding, IcoDocument, IcoUser, IcoMail, IcoMapPin,
  IcoLightning, IcoMeter, IcoGrid, IcoChartUp,
  IcoSolar, IcoWind, IcoBattery, IcoHydro, IcoFuelCell,
} from "@/components/icons";

const router = useRouter();

// ── Types ──
type PlantType = "태양광" | "풍력" | "ESS" | "소수력" | "연료전지";
type PricingModel = "SMP+REC" | "FIT" | "PPA";

// ── Step definitions ──
const steps = [
  { num: 1, title: "사업자 정보", desc: "기본 사업자 정보를 입력하세요" },
  { num: 2, title: "발전소 정보", desc: "전환할 발전소의 상세 정보" },
  { num: 3, title: "계약 정보", desc: "현재 계약 및 정산 현황" },
  { num: 4, title: "검토 및 제출", desc: "입력 정보를 확인하세요" },
];

// ── Plant type config ──
const plantTypes: { key: PlantType; icon: Component; label: string }[] = [
  { key: "태양광", icon: IcoSolar, label: "태양광" },
  { key: "풍력", icon: IcoWind, label: "풍력" },
  { key: "ESS", icon: IcoBattery, label: "ESS" },
  { key: "소수력", icon: IcoHydro, label: "소수력" },
  { key: "연료전지", icon: IcoFuelCell, label: "연료전지" },
];

// ── State ──
const currentStep = ref(1);
const isSubmitting = ref(false);
const isSubmitted = ref(false);
const localError = ref("");

const step1 = reactive({
  companyName: "",
  businessNumber: "",
  representativeName: "",
  contactEmail: "",
  contactPhone: "",
});

const step2 = reactive({
  plantName: "",
  plantType: "" as PlantType | "",
  location: "",
  capacity: "",
  capacityUnit: "MW" as "kW" | "MW",
  gridConnectionDate: "",
  commissioningDate: "",
  currentOperator: "",
});

const step3 = reactive({
  hasPpa: null as boolean | null,
  ppaContractPeriod: "",
  pricingModel: "" as PricingModel | "",
  monthlyAvgGeneration: "",
  desiredSwitchDate: "",
});

const step4 = reactive({
  agreeTerms: false,
  agreePrivacy: false,
  agreeTransferPolicy: false,
});

// ── Validation ──
function validateStep1(): boolean {
  localError.value = "";
  if (!step1.companyName.trim()) { localError.value = "회사명을 입력해 주세요."; return false; }
  if (!step1.businessNumber.trim()) { localError.value = "사업자등록번호를 입력해 주세요."; return false; }
  if (!/^\d{3}-\d{2}-\d{5}$/.test(step1.businessNumber.trim())) {
    localError.value = "사업자등록번호 형식이 올바르지 않습니다. (000-00-00000)"; return false;
  }
  if (!step1.representativeName.trim()) { localError.value = "대표자명을 입력해 주세요."; return false; }
  if (!step1.contactEmail.trim()) { localError.value = "이메일을 입력해 주세요."; return false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1.contactEmail)) {
    localError.value = "올바른 이메일 형식을 입력해 주세요."; return false;
  }
  if (!step1.contactPhone.trim()) { localError.value = "연락처를 입력해 주세요."; return false; }
  return true;
}

function validateStep2(): boolean {
  localError.value = "";
  if (!step2.plantName.trim()) { localError.value = "발전소명을 입력해 주세요."; return false; }
  if (!step2.plantType) { localError.value = "발전소 유형을 선택해 주세요."; return false; }
  if (!step2.location.trim()) { localError.value = "소재지를 입력해 주세요."; return false; }
  if (!step2.capacity.trim() || isNaN(Number(step2.capacity))) {
    localError.value = "설비 용량을 올바르게 입력해 주세요."; return false;
  }
  if (!step2.gridConnectionDate) { localError.value = "계통연계일을 입력해 주세요."; return false; }
  if (!step2.commissioningDate) { localError.value = "준공일을 입력해 주세요."; return false; }
  if (!step2.currentOperator.trim()) { localError.value = "현재 운영사/중개사업자명을 입력해 주세요."; return false; }
  return true;
}

function validateStep3(): boolean {
  localError.value = "";
  if (step3.hasPpa === null) { localError.value = "PPA 계약 여부를 선택해 주세요."; return false; }
  if (step3.hasPpa && !step3.ppaContractPeriod.trim()) {
    localError.value = "PPA 계약 기간을 입력해 주세요."; return false;
  }
  if (!step3.pricingModel) { localError.value = "정산 모델을 선택해 주세요."; return false; }
  if (!step3.monthlyAvgGeneration.trim() || isNaN(Number(step3.monthlyAvgGeneration))) {
    localError.value = "월 평균 발전량을 올바르게 입력해 주세요."; return false;
  }
  if (!step3.desiredSwitchDate) { localError.value = "전환 희망일을 입력해 주세요."; return false; }
  return true;
}

function validateStep4(): boolean {
  localError.value = "";
  if (!step4.agreeTerms) { localError.value = "이용약관에 동의해 주세요."; return false; }
  if (!step4.agreePrivacy) { localError.value = "개인정보처리방침에 동의해 주세요."; return false; }
  if (!step4.agreeTransferPolicy) { localError.value = "전환 정책에 동의해 주세요."; return false; }
  return true;
}

const validators = [validateStep1, validateStep2, validateStep3, validateStep4];

function goNext() {
  if (validators[currentStep.value - 1]()) {
    if (currentStep.value < 4) {
      currentStep.value++;
      localError.value = "";
    }
  }
}

function goBack() {
  if (currentStep.value > 1) {
    currentStep.value--;
    localError.value = "";
  }
}

async function handleSubmit() {
  if (!validateStep4()) return;
  isSubmitting.value = true;
  await new Promise(resolve => setTimeout(resolve, 1500));
  isSubmitting.value = false;
  isSubmitted.value = true;
  setTimeout(() => { router.push("/login"); }, 3000);
}

function goLanding() { router.push("/landing"); }
</script>

<template>
  <div class="ob-page">
    <!-- ── Left Panel ── -->
    <div class="ob-left">
      <div class="ob-left__bg-grid"></div>
      <div class="ob-left__glow"></div>
      <button type="button" class="ob-left__back" @click="goLanding">
        <IcoArrowLeft :size="14" :strokeWidth="2.5" /> 홈으로
      </button>
      <div class="ob-left__content">
        <svg class="ob-left__logo" width="363" height="49" viewBox="0 0 363 49" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="THEKIE">
          <path d="M18.6548 9.15527e-05H9.93497C9.57 9.15527e-05 9.22252 0.311126 9.02801 0.811868L0.146424 23.6232C0.0699338 23.8196 0.0196689 24.038 0 24.263H11.526L19.8131 2.97808L18.6548 9.15527e-05Z" fill="currentColor"/>
          <path d="M11.526 24.735H0C0.0196689 24.96 0.0699338 25.1784 0.146424 25.3747L9.02583 48.186C9.22033 48.6868 9.56782 48.9978 9.93278 48.9978H18.6526L19.8109 46.0198L11.5238 24.7328L11.526 24.735Z" fill="currentColor"/>
          <path d="M28.5986 0.811777C28.4041 0.311034 28.0566 0 27.6916 0H19.1531L20.0623 2.33386L20.1868 2.65592L20.3114 2.97799L27.5212 21.4989L32.0843 9.77441L28.5964 0.811777H28.5986Z" fill="currentColor"/>
          <path d="M27.5255 28.7806L31.5904 39.2256L28.168 48.0162C28.0303 48.3692 27.8249 48.5324 27.6938 48.5324H19.8371L27.5255 28.7806ZM27.5255 27.5012L19.1575 49H27.6959C28.0609 49 28.4084 48.689 28.6029 48.1883L32.0908 39.2256L27.5277 27.5012H27.5255Z" fill="currentColor"/>
          <path d="M42.8869 0.467654L43.8638 2.97799L36.7283 21.3091H28.5964L36.5098 0.983838C36.6475 0.630892 36.8529 0.467654 36.984 0.467654H42.8869ZM43.2038 0H36.984C36.6213 0 36.2738 0.311034 36.0793 0.811777L27.9167 21.7768H37.043L44.3621 2.97799L43.2038 0Z" fill="currentColor"/>
          <path d="M37.1523 27.5012L37.043 27.221H27.9167L32.3378 38.5793L32.4624 38.9013L32.587 39.2234L36.0749 48.186C36.2694 48.6868 36.6169 48.9978 36.9797 48.9978H43.1994L44.3577 46.0198L37.1479 27.499L37.1523 27.5012Z" fill="currentColor"/>
          <path d="M44.7379 46.3441L44.6134 46.6662L43.7042 49H54.7428C55.1056 49 55.4531 48.689 55.6498 48.1882L64.5292 25.3769C64.6057 25.1805 64.6559 24.9622 64.6756 24.7372H53.1497L44.8625 46.0242L44.7379 46.3463V46.3441Z" fill="currentColor"/>
          <path d="M45.5225 0H43.7064L44.6156 2.33386L44.7401 2.65592L44.8647 2.97799L53.1519 24.2651H64.6778C64.6581 24.0401 64.6079 23.8217 64.5314 23.6254L55.6498 0.811777C55.4553 0.311034 55.1078 0 54.7428 0H45.5203H45.5225Z" fill="currentColor"/>
          <path d="M94.7165 47.8132V9.38837H75.24V4.45374H118.922V9.38837H100.069V47.8132H94.7187H94.7165Z" fill="currentColor"/>
          <path d="M161.2 47.8131V27.3356H129.205V47.8131H123.855V4.39188H129.205V22.401H161.2V4.39188H166.549V47.8131H161.2Z" fill="currentColor"/>
          <path d="M174.231 47.8131V4.51984H217.306V9.44565H180.517V22.4407H215.538V27.3665H180.517V42.8851H217.306V47.8109H174.231V47.8131Z" fill="currentColor"/>
          <path d="M279.958 47.8131L261.749 27.5827H246.962V47.8131H240.668V4.39188H246.962V22.648H261.629L279.777 4.39188H287.292L266.821 24.6841L287.231 47.8131H279.96H279.958Z" fill="currentColor"/>
          <path d="M298.84 47.8131V4.39188H305.134V47.8131H298.84Z" fill="currentColor"/>
          <path d="M319.86 47.8131V4.45364H363V9.38828H326.154V22.4032H361.228V27.3378H326.154V42.8807H363V47.8153H319.86V47.8131Z" fill="currentColor"/>
        </svg>
        <p class="ob-left__tagline">기존 발전소 전환 신청</p>

        <div class="ob-left__benefits">
          <div class="ob-benefit">
            <div class="ob-benefit__icon"><IcoLightning :size="18" :strokeWidth="2" /></div>
            <div>
              <div class="ob-benefit__title">전환 수수료 0%</div>
              <div class="ob-benefit__desc">기존 중개사업자에서 THEKIE로 전환 시 수수료가 없습니다</div>
            </div>
          </div>
          <div class="ob-benefit">
            <div class="ob-benefit__icon"><IcoDocument :size="18" :strokeWidth="2" /></div>
            <div>
              <div class="ob-benefit__title">기존 계약 유지 보장</div>
              <div class="ob-benefit__desc">현재 PPA/FIT 계약 조건을 그대로 유지하며 전환합니다</div>
            </div>
          </div>
          <div class="ob-benefit">
            <div class="ob-benefit__icon"><IcoMeter :size="18" :strokeWidth="2" /></div>
            <div>
              <div class="ob-benefit__title">24시간 실시간 모니터링</div>
              <div class="ob-benefit__desc">RTU 연동으로 발전소 상태를 실시간으로 확인합니다</div>
            </div>
          </div>
        </div>

        <!-- Step indicator -->
        <div class="ob-steps">
          <div
            v-for="s in steps" :key="s.num"
            class="ob-step"
            :class="{ 'ob-step--active': currentStep === s.num, 'ob-step--done': currentStep > s.num }"
          >
            <div class="ob-step__marker">
              <IcoCheck v-if="currentStep > s.num" :size="12" :strokeWidth="3" />
              <span v-else>{{ s.num }}</span>
            </div>
            <div v-if="s.num < 4" class="ob-step__line"></div>
            <div class="ob-step__text">
              <span class="ob-step__title">{{ s.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Right Panel ── -->
    <div class="ob-right">
      <div class="ob-form-wrap">
        <!-- Progress -->
        <div class="ob-progress">
          <div class="ob-progress__bar" :style="{ width: (currentStep * 25) + '%' }"></div>
        </div>
        <div class="ob-progress__label">단계 {{ currentStep }} / 4</div>

        <!-- ═══ Step 1: 사업자 정보 ═══ -->
        <div v-if="currentStep === 1" class="ob-form">
          <div class="ob-form__head">
            <h1 class="ob-form__title">사업자 정보</h1>
            <p class="ob-form__sub">기본 사업자 정보를 입력하세요</p>
          </div>
          <form @submit.prevent="goNext" novalidate>
            <div class="lf-group">
              <label class="lf-label">회사명</label>
              <div class="lf-input-wrap">
                <IcoBuilding class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input v-model="step1.companyName" type="text" class="lf-input" placeholder="주식회사 더키" />
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">사업자등록번호</label>
              <div class="lf-input-wrap">
                <IcoDocument class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input v-model="step1.businessNumber" type="text" class="lf-input" placeholder="000-00-00000" />
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">대표자명</label>
              <div class="lf-input-wrap">
                <IcoUser class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input v-model="step1.representativeName" type="text" class="lf-input" placeholder="홍길동" />
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">연락 이메일</label>
              <div class="lf-input-wrap">
                <IcoMail class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input v-model="step1.contactEmail" type="email" class="lf-input" placeholder="contact@company.com" />
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">연락처</label>
              <div class="lf-input-wrap">
                <IcoUser class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input v-model="step1.contactPhone" type="tel" class="lf-input" placeholder="010-0000-0000" />
              </div>
            </div>
          </form>
        </div>

        <!-- ═══ Step 2: 발전소 정보 ═══ -->
        <div v-if="currentStep === 2" class="ob-form">
          <div class="ob-form__head">
            <h1 class="ob-form__title">발전소 정보</h1>
            <p class="ob-form__sub">전환할 발전소의 상세 정보를 입력하세요</p>
          </div>
          <form @submit.prevent="goNext" novalidate>
            <div class="lf-group">
              <label class="lf-label">발전소명</label>
              <div class="lf-input-wrap">
                <IcoLightning class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input v-model="step2.plantName" type="text" class="lf-input" placeholder="충남 당진 태양광 1호" />
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">발전소 유형</label>
              <div class="ob-type-select">
                <button
                  v-for="pt in plantTypes" :key="pt.key"
                  type="button"
                  class="ob-type-btn"
                  :class="{ 'ob-type-btn--active': step2.plantType === pt.key }"
                  @click="step2.plantType = pt.key"
                >
                  <component :is="pt.icon" :size="18" :strokeWidth="2" />
                  {{ pt.label }}
                </button>
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">소재지</label>
              <div class="lf-input-wrap">
                <IcoMapPin class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input v-model="step2.location" type="text" class="lf-input" placeholder="충남 당진시 석문면" />
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">설비 용량</label>
              <div class="ob-capacity-row">
                <div class="lf-input-wrap" style="flex: 1">
                  <IcoMeter class="lf-input-icon" :size="15" :strokeWidth="2" />
                  <input v-model="step2.capacity" type="number" class="lf-input" placeholder="2.5" />
                </div>
                <div class="ob-unit-toggle">
                  <button type="button" :class="['ob-unit-btn', { 'ob-unit-btn--active': step2.capacityUnit === 'kW' }]" @click="step2.capacityUnit = 'kW'">kW</button>
                  <button type="button" :class="['ob-unit-btn', { 'ob-unit-btn--active': step2.capacityUnit === 'MW' }]" @click="step2.capacityUnit = 'MW'">MW</button>
                </div>
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">계통연계일</label>
              <div class="lf-input-wrap">
                <IcoGrid class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input v-model="step2.gridConnectionDate" type="date" class="lf-input" />
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">준공일</label>
              <div class="lf-input-wrap">
                <IcoCheck class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input v-model="step2.commissioningDate" type="date" class="lf-input" />
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">현재 운영사/중개사업자</label>
              <div class="lf-input-wrap">
                <IcoBuilding class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input v-model="step2.currentOperator" type="text" class="lf-input" placeholder="(주)OO에너지" />
              </div>
            </div>
          </form>
        </div>

        <!-- ═══ Step 3: 계약 정보 ═══ -->
        <div v-if="currentStep === 3" class="ob-form">
          <div class="ob-form__head">
            <h1 class="ob-form__title">계약 정보</h1>
            <p class="ob-form__sub">현재 계약 및 정산 현황을 입력하세요</p>
          </div>
          <form @submit.prevent="goNext" novalidate>
            <div class="lf-group">
              <label class="lf-label">현재 PPA 계약 여부</label>
              <div class="ob-radio-row">
                <label class="ob-radio" :class="{ 'ob-radio--active': step3.hasPpa === true }">
                  <input type="radio" :value="true" v-model="step3.hasPpa" />
                  <span>예</span>
                </label>
                <label class="ob-radio" :class="{ 'ob-radio--active': step3.hasPpa === false }">
                  <input type="radio" :value="false" v-model="step3.hasPpa" />
                  <span>아니오</span>
                </label>
              </div>
            </div>
            <div v-if="step3.hasPpa" class="lf-group">
              <label class="lf-label">PPA 계약 기간</label>
              <div class="lf-input-wrap">
                <IcoDocument class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input v-model="step3.ppaContractPeriod" type="text" class="lf-input" placeholder="예: 20년" />
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">정산 모델</label>
              <div class="ob-model-select">
                <button v-for="m in (['SMP+REC','FIT','PPA'] as PricingModel[])" :key="m" type="button"
                  :class="['ob-model-btn', { 'ob-model-btn--active': step3.pricingModel === m }]"
                  @click="step3.pricingModel = m"
                >{{ m }}</button>
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">월 평균 발전량 (MWh)</label>
              <div class="lf-input-wrap">
                <IcoChartUp class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input v-model="step3.monthlyAvgGeneration" type="number" class="lf-input" placeholder="120" />
              </div>
            </div>
            <div class="lf-group">
              <label class="lf-label">전환 희망일</label>
              <div class="lf-input-wrap">
                <IcoGrid class="lf-input-icon" :size="15" :strokeWidth="2" />
                <input v-model="step3.desiredSwitchDate" type="date" class="lf-input" />
              </div>
            </div>
          </form>
        </div>

        <!-- ═══ Step 4: 검토 및 제출 ═══ -->
        <div v-if="currentStep === 4 && !isSubmitted" class="ob-form">
          <div class="ob-form__head">
            <h1 class="ob-form__title">검토 및 제출</h1>
            <p class="ob-form__sub">입력하신 정보를 확인하세요</p>
          </div>

          <div class="ob-review">
            <!-- 사업자 정보 -->
            <div class="ob-review__section">
              <div class="ob-review__section-head">
                <IcoBuilding :size="14" :strokeWidth="2" />
                <span class="ob-review__section-title">사업자 정보</span>
                <button type="button" class="ob-review__edit" @click="currentStep = 1">수정</button>
              </div>
              <div class="ob-review__grid">
                <div class="ob-review__item"><span class="ob-review__label">회사명</span><span class="ob-review__value">{{ step1.companyName }}</span></div>
                <div class="ob-review__item"><span class="ob-review__label">사업자등록번호</span><span class="ob-review__value">{{ step1.businessNumber }}</span></div>
                <div class="ob-review__item"><span class="ob-review__label">대표자명</span><span class="ob-review__value">{{ step1.representativeName }}</span></div>
                <div class="ob-review__item"><span class="ob-review__label">이메일</span><span class="ob-review__value">{{ step1.contactEmail }}</span></div>
                <div class="ob-review__item"><span class="ob-review__label">연락처</span><span class="ob-review__value">{{ step1.contactPhone }}</span></div>
              </div>
            </div>
            <!-- 발전소 정보 -->
            <div class="ob-review__section">
              <div class="ob-review__section-head">
                <IcoLightning :size="14" :strokeWidth="2" />
                <span class="ob-review__section-title">발전소 정보</span>
                <button type="button" class="ob-review__edit" @click="currentStep = 2">수정</button>
              </div>
              <div class="ob-review__grid">
                <div class="ob-review__item"><span class="ob-review__label">발전소명</span><span class="ob-review__value">{{ step2.plantName }}</span></div>
                <div class="ob-review__item"><span class="ob-review__label">유형</span><span class="ob-review__value">{{ step2.plantType }}</span></div>
                <div class="ob-review__item"><span class="ob-review__label">소재지</span><span class="ob-review__value">{{ step2.location }}</span></div>
                <div class="ob-review__item"><span class="ob-review__label">설비 용량</span><span class="ob-review__value">{{ step2.capacity }} {{ step2.capacityUnit }}</span></div>
                <div class="ob-review__item"><span class="ob-review__label">계통연계일</span><span class="ob-review__value">{{ step2.gridConnectionDate }}</span></div>
                <div class="ob-review__item"><span class="ob-review__label">준공일</span><span class="ob-review__value">{{ step2.commissioningDate }}</span></div>
                <div class="ob-review__item"><span class="ob-review__label">현재 운영사</span><span class="ob-review__value">{{ step2.currentOperator }}</span></div>
              </div>
            </div>
            <!-- 계약 정보 -->
            <div class="ob-review__section">
              <div class="ob-review__section-head">
                <IcoDocument :size="14" :strokeWidth="2" />
                <span class="ob-review__section-title">계약 정보</span>
                <button type="button" class="ob-review__edit" @click="currentStep = 3">수정</button>
              </div>
              <div class="ob-review__grid">
                <div class="ob-review__item"><span class="ob-review__label">PPA 계약</span><span class="ob-review__value">{{ step3.hasPpa ? '예' : '아니오' }}</span></div>
                <div v-if="step3.hasPpa" class="ob-review__item"><span class="ob-review__label">PPA 기간</span><span class="ob-review__value">{{ step3.ppaContractPeriod }}</span></div>
                <div class="ob-review__item"><span class="ob-review__label">정산 모델</span><span class="ob-review__value">{{ step3.pricingModel }}</span></div>
                <div class="ob-review__item"><span class="ob-review__label">월 평균 발전량</span><span class="ob-review__value">{{ step3.monthlyAvgGeneration }} MWh</span></div>
                <div class="ob-review__item"><span class="ob-review__label">전환 희망일</span><span class="ob-review__value">{{ step3.desiredSwitchDate }}</span></div>
              </div>
            </div>
          </div>

          <!-- Agreements -->
          <div class="ob-agree">
            <label class="lf-checkbox"><input v-model="step4.agreeTerms" type="checkbox" class="lf-checkbox__input" /><span class="lf-checkbox__label"><a href="#">이용약관</a>에 동의합니다</span></label>
            <label class="lf-checkbox"><input v-model="step4.agreePrivacy" type="checkbox" class="lf-checkbox__input" /><span class="lf-checkbox__label"><a href="#">개인정보처리방침</a>에 동의합니다</span></label>
            <label class="lf-checkbox"><input v-model="step4.agreeTransferPolicy" type="checkbox" class="lf-checkbox__input" /><span class="lf-checkbox__label"><a href="#">전환 정책</a>에 동의합니다</span></label>
          </div>
        </div>

        <!-- ═══ Success state ═══ -->
        <div v-if="isSubmitted" class="ob-success">
          <div class="ob-success__icon"><IcoCheck :size="32" :strokeWidth="2.5" /></div>
          <h2 class="ob-success__title">전환 신청이 완료되었습니다</h2>
          <p class="ob-success__desc">담당자가 영업일 기준 1~2일 내에 연락드리겠습니다.</p>
          <p class="ob-success__redirect">잠시 후 로그인 페이지로 이동합니다...</p>
        </div>

        <!-- Navigation -->
        <div class="ob-nav" v-if="!isSubmitted">
          <div v-if="localError" class="lf-error">
            <IcoInfo :size="14" :strokeWidth="2" /> {{ localError }}
          </div>
          <div class="ob-nav__buttons">
            <button v-if="currentStep > 1" type="button" class="ob-nav__back" @click="goBack">
              <IcoArrowLeft :size="15" :strokeWidth="2.5" /> 이전
            </button>
            <div v-else class="ob-nav__spacer"></div>
            <button v-if="currentStep < 4" type="button" class="lf-submit" @click="goNext">
              <span>다음 <IcoArrowRight :size="15" :strokeWidth="2.5" /></span>
            </button>
            <button v-else type="button" class="lf-submit" :class="{ 'lf-submit--loading': isSubmitting }" :disabled="isSubmitting" @click="handleSubmit">
              <span v-if="!isSubmitting">신청 완료 <IcoCheck :size="15" :strokeWidth="2.5" /></span>
              <span v-else class="lf-spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$accent: #4F6AF5;
$accent-dark: #3b56d9;
$text-primary: #0f172a;
$text-secondary: #475569;
$text-muted: #94a3b8;
$border: #e2e8f0;
$surface: #ffffff;
$bg: #f8fafc;

* { box-sizing: border-box; }

.ob-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: "Inter", sans-serif;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
}

// ── Left panel ──
.ob-left {
  background: #06082a;
  position: relative;
  overflow: hidden;
  padding: 40px;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) { display: none; }
}

.ob-left__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(79,106,245,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79,106,245,0.07) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}

.ob-left__glow {
  position: absolute;
  width: 600px; height: 600px;
  border-radius: 50%;
  background: rgba(79,106,245,0.12);
  filter: blur(120px);
  bottom: -200px; left: -100px;
  pointer-events: none;
}

.ob-left__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.55);
  font-size: 12px;
  font-weight: 500;
  font-family: "Inter", sans-serif;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  z-index: 1;
  align-self: flex-start;
  transition: background 0.15s, color 0.15s;
  &:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.85); }
}

.ob-left__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
  gap: 32px;
}

.ob-left__logo { height: 24px; width: auto; color: #fff; }

.ob-left__tagline {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-top: -20px;
}

// ── Benefits ──
.ob-left__benefits { display: flex; flex-direction: column; gap: 14px; }

.ob-benefit {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
}

.ob-benefit__icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: rgba(79,106,245,0.15);
  color: #93b4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ob-benefit__title {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
  margin-bottom: 3px;
}

.ob-benefit__desc {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  line-height: 1.4;
}

// ── Step indicator ──
.ob-steps { display: flex; flex-direction: column; gap: 0; }

.ob-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  padding-bottom: 18px;

  &__marker {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
    border: 2px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
    transition: all 0.3s;
    position: relative;
    z-index: 1;
  }

  &__line {
    position: absolute;
    left: 13px;
    top: 28px;
    width: 2px;
    height: calc(100% - 28px);
    background: rgba(255,255,255,0.08);
  }

  &--active &__marker {
    background: $accent;
    border-color: $accent;
    color: #fff;
    box-shadow: 0 0 12px rgba(79,106,245,0.5);
  }

  &--done &__marker {
    background: rgba(79,106,245,0.25);
    border-color: rgba(79,106,245,0.4);
    color: #93b4ff;
  }

  &--done &__line { background: rgba(79,106,245,0.35); }

  &__title {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.3);
    line-height: 28px;
  }

  &--active &__title { color: rgba(255,255,255,0.9); }
  &--done &__title { color: rgba(255,255,255,0.5); }
}

// ── Right panel ──
.ob-right {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 32px;
  overflow-y: auto;
  background: $surface;
}

.ob-form-wrap {
  width: 100%;
  max-width: 460px;
}

// ── Progress bar ──
.ob-progress {
  width: 100%;
  height: 4px;
  background: $border;
  border-radius: 2px;
  margin-bottom: 6px;
  overflow: hidden;

  &__bar {
    height: 100%;
    background: $accent;
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  &__label {
    font-size: 11px;
    font-weight: 600;
    color: $text-muted;
    margin-bottom: 28px;
  }
}

// ── Form common ──
.ob-form__head { margin-bottom: 24px; }
.ob-form__title {
  font-size: 22px;
  font-weight: 800;
  color: $text-primary;
  margin: 0 0 4px;
}
.ob-form__sub {
  font-size: 13px;
  color: $text-muted;
  margin: 0;
}

// ── Shared lf-* form styles ──
.lf-group { margin-bottom: 16px; }
.lf-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 6px;
}
.lf-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.lf-input-icon {
  position: absolute;
  left: 12px;
  color: $text-muted;
  pointer-events: none;
}
.lf-input {
  width: 100%;
  height: 44px;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 0 12px 0 38px;
  font-size: 14px;
  font-family: "Inter", sans-serif;
  color: $text-primary;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder { color: $text-muted; }
  &:focus {
    border-color: $accent;
    box-shadow: 0 0 0 3px rgba(79,106,245,0.1);
  }
}

.lf-error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #dc2626;
  margin-bottom: 12px;
}

.lf-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 46px;
  padding: 0 28px;
  background: $accent;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
  box-shadow: 0 2px 12px rgba(79,106,245,0.3);

  &:hover { background: $accent-dark; box-shadow: 0 4px 20px rgba(79,106,245,0.4); }
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.lf-spinner {
  display: inline-block;
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: lf-spin 0.7s linear infinite;
}
@keyframes lf-spin { to { transform: rotate(360deg); } }

.lf-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 8px;
}
.lf-checkbox__input {
  width: 16px; height: 16px;
  accent-color: $accent;
  cursor: pointer;
}
.lf-checkbox__label {
  font-size: 12px;
  color: $text-secondary;
  a { color: $accent; font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }
}

// ── Plant type select ──
.ob-type-select {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  @media (max-width: 400px) { grid-template-columns: repeat(2, 1fr); }
}

.ob-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: $bg;
  border: 1px solid $border;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: $accent; background: #f5f7ff; }
  &--active {
    border-color: $accent;
    background: #eef1fe;
    color: $accent;
    box-shadow: 0 0 0 3px rgba(79,106,245,0.12);
  }
}

// ── Capacity row ──
.ob-capacity-row { display: flex; align-items: center; gap: 8px; }

.ob-unit-toggle {
  display: flex;
  border: 1px solid $border;
  border-radius: 8px;
  overflow: hidden;
}
.ob-unit-btn {
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  background: $bg;
  border: none;
  color: $text-muted;
  cursor: pointer;
  transition: all 0.15s;

  &--active { background: $accent; color: #fff; }
}

// ── Radio row ──
.ob-radio-row { display: flex; gap: 10px; }
.ob-radio {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px solid $border;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.15s;
  input { display: none; }
  &--active { border-color: $accent; background: #eef1fe; color: $accent; }
}

// ── Model select ──
.ob-model-select { display: flex; gap: 8px; }
.ob-model-btn {
  flex: 1;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  background: $bg;
  border: 1px solid $border;
  border-radius: 10px;
  color: $text-secondary;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;

  &:hover { border-color: $accent; }
  &--active { border-color: $accent; background: #eef1fe; color: $accent; box-shadow: 0 0 0 3px rgba(79,106,245,0.12); }
}

// ── Review section ──
.ob-review { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
.ob-review__section {
  background: $bg;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 14px;
}
.ob-review__section-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  svg { color: $accent; }
}
.ob-review__section-title { font-size: 13px; font-weight: 700; color: $text-primary; flex: 1; }
.ob-review__edit {
  font-size: 11px;
  font-weight: 600;
  color: $accent;
  background: none;
  border: none;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  &:hover { text-decoration: underline; }
}
.ob-review__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
  @media (max-width: 400px) { grid-template-columns: 1fr; }
}
.ob-review__item { display: flex; flex-direction: column; gap: 2px; }
.ob-review__label { font-size: 10px; font-weight: 600; color: $text-muted; }
.ob-review__value { font-size: 13px; font-weight: 600; color: $text-primary; }

// ── Agree ──
.ob-agree { margin-bottom: 16px; }

// ── Nav ──
.ob-nav { margin-top: 20px; }
.ob-nav__buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ob-nav__spacer { flex: 1; }
.ob-nav__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  color: $text-secondary;
  background: none;
  border: 1px solid $border;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: $bg; }
}

// ── Success ──
.ob-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 24px;
}
.ob-success__icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.ob-success__title {
  font-size: 22px;
  font-weight: 800;
  color: $text-primary;
  margin: 0 0 8px;
}
.ob-success__desc { font-size: 14px; color: $text-secondary; margin: 0 0 16px; }
.ob-success__redirect { font-size: 12px; color: $text-muted; margin: 0; }
</style>
