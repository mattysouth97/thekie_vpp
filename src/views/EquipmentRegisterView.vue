<script setup lang="ts">
import { reactive, ref, computed, onMounted } from "vue";
import {
  IcoSolar, IcoWind, IcoBattery, IcoHydro, IcoFuelCell,
  IcoPlug, IcoInverter, IcoMapPin, IcoMeter,
  IcoInfo, IcoClose, IcoCheck, IcoArrowRight,
} from "@/components/icons";
import { useAuthStore } from "@/stores/auth-store";
import { useEquipmentStore } from "@/stores/equipment-store";
import type { EquipmentType, ConnectionProtocol, EquipmentRegistrationPayload } from "@/types/equipment";

const authStore = useAuthStore();
const equipmentStore = useEquipmentStore();

// ── Form state ──
const showForm = ref(false);
const localError = ref("");
const successMsg = ref("");

const equipmentTypes: { key: EquipmentType; icon: string; label: string }[] = [
  { key: "태양광", icon: "solar", label: "태양광" },
  { key: "풍력", icon: "wind", label: "풍력" },
  { key: "ESS", icon: "battery", label: "ESS" },
  { key: "소수력", icon: "hydro", label: "소수력" },
  { key: "연료전지", icon: "fuelcell", label: "연료전지" },
];

const protocols: ConnectionProtocol[] = [
  "Modbus TCP", "Modbus RTU", "DNP3", "IEC 61850", "MQTT",
];

const form = reactive<EquipmentRegistrationPayload>({
  name: "",
  type: "태양광",
  siteName: "",
  siteAddress: "",
  capacity: "",
  capacityUnit: "kW",
  rtu: {
    rtuId: "",
    rtuModel: "",
    rtuSerial: "",
    protocol: "Modbus TCP",
    ipAddress: "",
    port: "502",
  },
  inverter: {
    inverterModel: "",
    inverterSerial: "",
    inverterCapacity: "",
    manufacturer: "",
  },
});

function resetForm() {
  form.name = "";
  form.type = "태양광";
  form.siteName = "";
  form.siteAddress = "";
  form.capacity = "";
  form.capacityUnit = "kW";
  form.rtu.rtuId = "";
  form.rtu.rtuModel = "";
  form.rtu.rtuSerial = "";
  form.rtu.protocol = "Modbus TCP";
  form.rtu.ipAddress = "";
  form.rtu.port = "502";
  form.inverter.inverterModel = "";
  form.inverter.inverterSerial = "";
  form.inverter.inverterCapacity = "";
  form.inverter.manufacturer = "";
}

// ── Stats ──
const stats = computed(() => ({
  total: equipmentStore.equipmentList.length,
  registered: equipmentStore.equipmentList.filter((e) => e.status === "registered").length,
  active: equipmentStore.equipmentList.filter((e) => e.status === "active").length,
}));

// ── Handlers ──
async function handleRegister() {
  localError.value = "";
  successMsg.value = "";

  if (!form.name.trim()) { localError.value = "설비명을 입력해 주세요."; return; }
  if (!form.siteName.trim()) { localError.value = "발전소명을 입력해 주세요."; return; }
  if (!form.siteAddress.trim()) { localError.value = "발전소 주소를 입력해 주세요."; return; }
  if (!form.capacity.trim()) { localError.value = "설비 용량을 입력해 주세요."; return; }
  if (!form.rtu.rtuId.trim()) { localError.value = "RTU ID를 입력해 주세요."; return; }
  if (!form.rtu.rtuModel.trim()) { localError.value = "RTU 모델명을 입력해 주세요."; return; }
  if (!form.inverter.inverterModel.trim()) { localError.value = "인버터 모델명을 입력해 주세요."; return; }

  const userId = authStore.user?.id;
  if (!userId) { localError.value = "로그인이 필요합니다."; return; }

  const payload: EquipmentRegistrationPayload = JSON.parse(JSON.stringify(form));
  const ok = await equipmentStore.registerEquipment(payload, userId);

  if (ok) {
    successMsg.value = `${form.name} 설비가 등록되었습니다.`;
    resetForm();
    showForm.value = false;
    setTimeout(() => { successMsg.value = ""; }, 3000);
  } else {
    localError.value = equipmentStore.error;
  }
}

async function handleRemove(id: string) {
  await equipmentStore.removeEquipment(id);
}

function formatDate(iso: string) {
  return iso.slice(0, 10);
}

onMounted(() => {
  if (authStore.user?.id) {
    equipmentStore.loadEquipment(authStore.user.id);
  }
});
</script>

<template>
  <div class="er">
    <!-- Header -->
    <div class="er-header">
      <div>
        <h1 class="er-header__title">설비등록</h1>
        <p class="er-header__sub">RTU 연결 설비를 등록하고 포트폴리오에 추가하세요</p>
      </div>
      <button type="button" class="er-header__add-btn" @click="showForm = !showForm">
        {{ showForm ? '취소' : '+ 새 설비 등록' }}
      </button>
    </div>

    <!-- Success message -->
    <div v-if="successMsg" class="er-success">
      <IcoCheck :size="14" :strokeWidth="2" />
      {{ successMsg }}
    </div>

    <!-- Stats -->
    <div class="er-stats">
      <div class="er-stat">
        <span class="er-stat__num">{{ stats.total }}</span>
        <span class="er-stat__label">전체 등록</span>
      </div>
      <div class="er-stat er-stat--blue">
        <span class="er-stat__num">{{ stats.registered }}</span>
        <span class="er-stat__label">등록 완료</span>
      </div>
      <div class="er-stat er-stat--green">
        <span class="er-stat__num">{{ stats.active }}</span>
        <span class="er-stat__label">가동 중</span>
      </div>
    </div>

    <!-- Registration form -->
    <section v-if="showForm" class="er-form-section">
      <form @submit.prevent="handleRegister" class="er-form" autocomplete="off">

        <!-- Section A: 기본 정보 -->
        <div class="er-section">
          <h3 class="er-section__title"><IcoMeter :size="14" :strokeWidth="2" /> 기본 정보</h3>
          <div class="er-grid">
            <div class="er-field">
              <label class="er-field__label">설비명 <span class="er-req">*</span></label>
              <input v-model="form.name" type="text" class="er-field__input" placeholder="예: 당진 태양광 1호기" />
            </div>
            <div class="er-field">
              <label class="er-field__label">발전소명 <span class="er-req">*</span></label>
              <input v-model="form.siteName" type="text" class="er-field__input" placeholder="예: 충남 당진 태양광발전소" />
            </div>
            <div class="er-field er-field--full">
              <label class="er-field__label">발전소 주소 <span class="er-req">*</span></label>
              <div class="er-field__icon-wrap">
                <IcoMapPin :size="13" :strokeWidth="2" />
                <input v-model="form.siteAddress" type="text" class="er-field__input" placeholder="예: 충남 당진시 석문면 통정리 123" />
              </div>
            </div>
          </div>

          <!-- Equipment type radio -->
          <label class="er-field__label" style="margin-top: 6px;">설비 유형 <span class="er-req">*</span></label>
          <div class="er-type-grid">
            <label
              v-for="t in equipmentTypes"
              :key="t.key"
              class="er-type-card"
              :class="{ 'er-type-card--active': form.type === t.key }"
            >
              <input v-model="form.type" type="radio" :value="t.key" class="er-type-card__radio" />
              <div class="er-type-card__icon" :class="`er-type-card__icon--${t.icon}`">
                <IcoSolar v-if="t.icon === 'solar'" :size="18" :strokeWidth="2" />
                <IcoWind v-else-if="t.icon === 'wind'" :size="18" :strokeWidth="2" />
                <IcoBattery v-else-if="t.icon === 'battery'" :size="18" :strokeWidth="2" />
                <IcoHydro v-else-if="t.icon === 'hydro'" :size="18" :strokeWidth="2" />
                <IcoFuelCell v-else :size="18" :strokeWidth="2" />
              </div>
              <span class="er-type-card__label">{{ t.label }}</span>
            </label>
          </div>

          <div class="er-grid" style="margin-top: 8px;">
            <div class="er-field">
              <label class="er-field__label">설비 용량 <span class="er-req">*</span></label>
              <div class="er-field__row">
                <input v-model="form.capacity" type="text" class="er-field__input" placeholder="예: 2500" />
                <select v-model="form.capacityUnit" class="er-field__select">
                  <option value="kW">kW</option>
                  <option value="MW">MW</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Section B: RTU 정보 -->
        <div class="er-section">
          <h3 class="er-section__title"><IcoPlug :size="14" :strokeWidth="2" /> RTU 정보</h3>
          <div class="er-grid">
            <div class="er-field">
              <label class="er-field__label">RTU ID <span class="er-req">*</span></label>
              <input v-model="form.rtu.rtuId" type="text" class="er-field__input" placeholder="예: RTU-DJ-001" />
            </div>
            <div class="er-field">
              <label class="er-field__label">RTU 모델명 <span class="er-req">*</span></label>
              <input v-model="form.rtu.rtuModel" type="text" class="er-field__input" placeholder="예: LS-RTU3000" />
            </div>
            <div class="er-field">
              <label class="er-field__label">RTU 시리얼</label>
              <input v-model="form.rtu.rtuSerial" type="text" class="er-field__input" placeholder="예: SN-20240101-0001" />
            </div>
            <div class="er-field">
              <label class="er-field__label">통신 프로토콜</label>
              <select v-model="form.rtu.protocol" class="er-field__select er-field__select--full">
                <option v-for="p in protocols" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
            <div class="er-field">
              <label class="er-field__label">IP 주소</label>
              <input v-model="form.rtu.ipAddress" type="text" class="er-field__input" placeholder="예: 192.168.1.100" />
            </div>
            <div class="er-field">
              <label class="er-field__label">포트</label>
              <input v-model="form.rtu.port" type="text" class="er-field__input" placeholder="502" />
            </div>
          </div>
        </div>

        <!-- Section C: 인버터 정보 -->
        <div class="er-section">
          <h3 class="er-section__title"><IcoInverter :size="14" :strokeWidth="2" /> 인버터 정보</h3>
          <div class="er-grid">
            <div class="er-field">
              <label class="er-field__label">인버터 모델명 <span class="er-req">*</span></label>
              <input v-model="form.inverter.inverterModel" type="text" class="er-field__input" placeholder="예: SMA Sunny Tripower" />
            </div>
            <div class="er-field">
              <label class="er-field__label">인버터 시리얼</label>
              <input v-model="form.inverter.inverterSerial" type="text" class="er-field__input" placeholder="예: INV-20240301-0001" />
            </div>
            <div class="er-field">
              <label class="er-field__label">인버터 용량 (kW)</label>
              <input v-model="form.inverter.inverterCapacity" type="text" class="er-field__input" placeholder="예: 500" />
            </div>
            <div class="er-field">
              <label class="er-field__label">제조사</label>
              <input v-model="form.inverter.manufacturer" type="text" class="er-field__input" placeholder="예: SMA Solar" />
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-if="localError || equipmentStore.error" class="er-error">
          <IcoInfo :size="14" :strokeWidth="2" />
          {{ localError || equipmentStore.error }}
        </div>

        <!-- Submit -->
        <button type="submit" class="er-submit" :disabled="equipmentStore.loading">
          <span v-if="!equipmentStore.loading">설비 등록 <IcoArrowRight :size="14" :strokeWidth="2" /></span>
          <span v-else class="er-spinner"></span>
        </button>
      </form>
    </section>

    <!-- Equipment list -->
    <section class="er-list-section">
      <h2 class="er-section-title">등록된 설비</h2>

      <div v-if="equipmentStore.equipmentList.length" class="er-list">
        <div
          v-for="eq in equipmentStore.equipmentList"
          :key="eq.id"
          class="er-row"
        >
          <div class="er-row__icon" :class="{
            'er-row__icon--solar': eq.type === '태양광',
            'er-row__icon--wind': eq.type === '풍력',
            'er-row__icon--battery': eq.type === 'ESS',
            'er-row__icon--hydro': eq.type === '소수력',
            'er-row__icon--fuelcell': eq.type === '연료전지',
          }">
            <IcoSolar v-if="eq.type === '태양광'" :size="16" :strokeWidth="2" />
            <IcoWind v-else-if="eq.type === '풍력'" :size="16" :strokeWidth="2" />
            <IcoBattery v-else-if="eq.type === 'ESS'" :size="16" :strokeWidth="2" />
            <IcoHydro v-else-if="eq.type === '소수력'" :size="16" :strokeWidth="2" />
            <IcoFuelCell v-else :size="16" :strokeWidth="2" />
          </div>
          <div class="er-row__main">
            <div class="er-row__top">
              <span class="er-row__name">{{ eq.name }}</span>
              <span class="er-row__badge">{{ eq.type }}</span>
              <span class="er-row__status" :class="`er-row__status--${eq.status}`">
                <span class="er-row__dot"></span>
                {{ eq.status === 'registered' ? '등록 완료' : eq.status === 'active' ? '가동 중' : eq.status }}
              </span>
            </div>
            <div class="er-row__location">
              <IcoMapPin :size="11" :strokeWidth="2" />
              {{ eq.siteAddress }} · {{ eq.capacity }} {{ eq.capacityUnit }}
            </div>
            <div class="er-row__details">
              <span class="er-row__detail"><IcoPlug :size="11" :strokeWidth="2" /> {{ eq.rtu.rtuId }} ({{ eq.rtu.protocol }})</span>
              <span class="er-row__detail"><IcoInverter :size="11" :strokeWidth="2" /> {{ eq.inverter.inverterModel }}</span>
              <span class="er-row__detail">등록일: {{ formatDate(eq.registeredAt) }}</span>
            </div>
          </div>
          <button type="button" class="er-row__delete" @click="handleRemove(eq.id)" title="삭제">
            <IcoClose :size="14" :strokeWidth="2" />
          </button>
        </div>
      </div>

      <div v-else class="er-empty">
        <IcoPlug :size="32" :strokeWidth="1.5" />
        <p class="er-empty__title">등록된 설비가 없습니다</p>
        <p class="er-empty__sub">위의 "새 설비 등록" 버튼을 눌러 첫 번째 설비를 추가해 보세요.</p>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
$bg: #f8f9fb;
$surface: #ffffff;
$border: #e8eaef;
$accent: #4f6af5;
$accent-light: #eef1fe;
$text-primary: #1a1d26;
$text-secondary: #5a5f72;
$text-muted: #9ea3b5;

.er {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px 28px;
  max-width: 100%;
  @media (max-width: 768px) { padding: 12px 10px 20px; }
}

.er-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  &__title { font-size: 18px; font-weight: 900; color: $text-primary; letter-spacing: -0.03em; margin: 0 0 3px; }
  &__sub { font-size: 12px; color: $text-secondary; margin: 0; }
  &__add-btn {
    background: $accent; color: #fff; font-size: 12px; font-weight: 700; font-family: "Inter", sans-serif;
    padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: background 0.15s;
    &:hover { background: darken($accent, 8%); }
  }
}

.er-success {
  display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 8px;
  background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 600;
  svg { flex-shrink: 0; }
}

// ── Stats ──
.er-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
  @media (max-width: 500px) { grid-template-columns: repeat(3, 1fr); }
}
.er-stat {
  background: $surface; border: 1px solid $border; border-radius: 8px; padding: 10px 12px;
  display: flex; flex-direction: column; gap: 2px;
  &--blue { border-left: 3px solid $accent; }
  &--green { border-left: 3px solid #16a34a; }
  &__num { font-size: 18px; font-weight: 900; color: $text-primary; font-variant-numeric: tabular-nums; }
  &__label { font-size: 11px; font-weight: 600; color: $text-muted; }
}

.er-section-title { font-size: 13px; font-weight: 800; color: $text-primary; margin: 0; }

// ── Form ──
.er-form-section {
  background: $surface; border: 1px solid $border; border-radius: 10px; padding: 16px;
}
.er-form { display: flex; flex-direction: column; gap: 16px; }

.er-section {
  &__title {
    display: flex; align-items: center; gap: 5px;
    font-size: 13px; font-weight: 800; color: $text-primary; margin: 0 0 10px;
    svg { color: $accent; }
  }
}

.er-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
}

.er-field {
  display: flex; flex-direction: column; gap: 3px;
  &--full { grid-column: 1 / -1; }
  &__label { font-size: 11px; font-weight: 700; color: $text-secondary; }
  &__input {
    font-size: 13px; font-family: "Inter", sans-serif; color: $text-primary;
    padding: 7px 10px; border: 1px solid $border; border-radius: 6px; outline: none;
    background: $bg; transition: border-color 0.15s;
    &::placeholder { color: $text-muted; }
    &:focus { border-color: $accent; background: #fff; }
  }
  &__select {
    font-size: 12px; font-weight: 600; font-family: "Inter", sans-serif; color: $text-secondary;
    background: $bg; border: 1px solid $border; border-radius: 6px; padding: 7px 10px; cursor: pointer; outline: none;
    &:focus { border-color: $accent; }
    &--full { width: 100%; }
  }
  &__row { display: flex; gap: 6px; .er-field__input { flex: 1; } .er-field__select { width: 70px; } }
  &__icon-wrap {
    display: flex; align-items: center; gap: 6px; padding: 0 0 0 10px;
    border: 1px solid $border; border-radius: 6px; background: $bg; transition: border-color 0.15s;
    svg { color: $text-muted; flex-shrink: 0; }
    &:focus-within { border-color: $accent; background: #fff; }
    .er-field__input { border: none; background: none; padding-left: 0; &:focus { border-color: transparent; } }
  }
}

.er-req { color: #dc2626; }

// ── Type radio cards ──
.er-type-grid {
  display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;
}
.er-type-card {
  display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer;
  padding: 8px 12px; border: 1.5px solid $border; border-radius: 8px; background: $bg; transition: all 0.15s;
  &:hover { border-color: darken($border, 10%); }
  &--active { border-color: $accent; background: $accent-light; }
  &__radio { display: none; }
  &__icon {
    width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
    &--solar { background: #fef3c7; color: #d97706; }
    &--wind { background: #cffafe; color: #0891b2; }
    &--battery { background: #dcfce7; color: #16a34a; }
    &--hydro { background: #dbeafe; color: #2563eb; }
    &--fuelcell { background: #ede9fe; color: #7c3aed; }
  }
  &__label { font-size: 11px; font-weight: 700; color: $text-secondary; }
  &--active &__label { color: $accent; }
}

// ── Error & Submit ──
.er-error {
  display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 8px;
  background: #fef2f2; color: #dc2626; font-size: 12px; font-weight: 600;
  svg { flex-shrink: 0; }
}
.er-submit {
  align-self: flex-end; display: inline-flex; align-items: center; gap: 6px;
  background: $accent; color: #fff; font-size: 13px; font-weight: 700; font-family: "Inter", sans-serif;
  padding: 10px 24px; border: none; border-radius: 8px; cursor: pointer; transition: background 0.15s;
  &:hover { background: darken($accent, 8%); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
.er-spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: er-spin 0.6s linear infinite;
}
@keyframes er-spin { to { transform: rotate(360deg); } }

// ── Equipment list ──
.er-list-section { margin-top: 4px; }
.er-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }

.er-row {
  display: flex; align-items: center; gap: 10px; background: $surface; border: 1px solid $border;
  border-radius: 8px; padding: 10px 12px; transition: border-color 0.12s;
  &:hover { border-color: $accent; }

  &__icon {
    width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    &--solar { background: #fef3c7; color: #d97706; }
    &--wind { background: #cffafe; color: #0891b2; }
    &--battery { background: #dcfce7; color: #16a34a; }
    &--hydro { background: #dbeafe; color: #2563eb; }
    &--fuelcell { background: #ede9fe; color: #7c3aed; }
  }
  &__main { flex: 1; min-width: 0; }
  &__top { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; flex-wrap: wrap; }
  &__name { font-size: 13.5px; font-weight: 700; color: $text-primary; }
  &__badge {
    font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px;
    color: $accent; background: $accent-light;
  }
  &__status {
    display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 5px;
    &--registered { color: #1d4ed8; background: #dbeafe; }
    &--active { color: #15803d; background: #dcfce7; }
    &--pending { color: #b45309; background: #fef3c7; }
    &--inactive { color: #64748b; background: #f1f5f9; }
  }
  &__dot {
    width: 6px; height: 6px; border-radius: 50%; display: inline-block;
    .er-row__status--registered & { background: #3b82f6; }
    .er-row__status--active & { background: #16a34a; }
    .er-row__status--pending & { background: #f59e0b; }
    .er-row__status--inactive & { background: #94a3b8; }
  }
  &__location {
    font-size: 11px; color: $text-muted; display: flex; align-items: center; gap: 3px; margin-bottom: 3px;
    svg { flex-shrink: 0; }
  }
  &__details { display: flex; gap: 10px; flex-wrap: wrap; }
  &__detail {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 10.5px; font-weight: 600; color: $text-secondary;
    svg { color: $text-muted; }
  }
  &__delete {
    width: 28px; height: 28px; border-radius: 6px; border: 1px solid $border; background: $bg;
    display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;
    color: $text-muted; transition: all 0.15s;
    &:hover { color: #dc2626; border-color: #fca5a5; background: #fef2f2; }
  }
}

// ── Empty state ──
.er-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 40px 20px; background: $surface; border: 1px dashed $border; border-radius: 10px; margin-top: 8px;
  svg { color: $text-muted; }
  &__title { font-size: 14px; font-weight: 700; color: $text-primary; margin: 10px 0 4px; }
  &__sub { font-size: 12px; color: $text-muted; margin: 0; }
}
</style>
