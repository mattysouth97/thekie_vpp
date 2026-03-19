<script setup lang="ts">
import { ref } from "vue";
import { IcoMapPin, IcoSearch, IcoGlobe, IcoArrowRight, IcoCheck } from "@/components/icons";

const searchQuery = ref("");
const selectedType = ref<string>("all");

interface LandParcel {
  id: string;
  name: string;
  address: string;
  areaSqm: number;
  landType: string;
  landTypeLabel: string;
  owner: string;
  annualRent: string;
  status: string;
  statusColor: string;
  permittedUse: string[];
  lng: number;
  lat: number;
}

const parcels: LandParcel[] = [
  { id: "p1", name: "용인시 처인구 유휴부지 A", address: "경기 용인시 처인구 양지면 100-1", areaSqm: 15000, landType: "public", landTypeLabel: "공공부지", owner: "용인시청", annualRent: "₩4,800만", status: "임대 가능", statusColor: "green", permittedUse: ["태양광", "ESS"], lng: 127.2856, lat: 37.218 },
  { id: "p2", name: "화성시 산업단지 옥상", address: "경기 화성시 동탄산단 3로 45", areaSqm: 8500, landType: "industrial", landTypeLabel: "산단형", owner: "화성산단관리공단", annualRent: "₩2,400만", status: "임대 가능", statusColor: "green", permittedUse: ["태양광"], lng: 127.0736, lat: 37.2063 },
  { id: "p3", name: "음성군 농경지 영농형 부지", address: "충북 음성군 삼성면 200-3", areaSqm: 22000, landType: "agricultural", landTypeLabel: "영농형", owner: "음성군청", annualRent: "₩3,200만", status: "심사 중", statusColor: "amber", permittedUse: ["태양광", "영농형"], lng: 127.6906, lat: 36.9406 },
  { id: "p4", name: "기흥저수지 수면부지", address: "경기 용인시 기흥구 구갈동", areaSqm: 12000, landType: "water", landTypeLabel: "수상형", owner: "한국수자원공사", annualRent: "₩5,600만", status: "임대 가능", statusColor: "green", permittedUse: ["수상태양광"], lng: 127.1148, lat: 37.2755 },
];

const typeOptions = [
  { value: "all", label: "전체" },
  { value: "public", label: "공공부지" },
  { value: "industrial", label: "산단형" },
  { value: "agricultural", label: "영농형" },
  { value: "water", label: "수상형" },
];

const filteredParcels = ref(parcels);

function applyFilters() {
  filteredParcels.value = parcels.filter((p) => {
    if (selectedType.value !== "all" && p.landType !== selectedType.value) return false;
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q);
    }
    return true;
  });
}

function formatArea(sqm: number): string {
  if (sqm >= 10000) return `${(sqm / 10000).toFixed(1)}만 m²`;
  return `${sqm.toLocaleString()} m²`;
}
</script>

<template>
  <div class="ls">
    <div class="ls__header">
      <h1 class="ls__title">부지 검색</h1>
      <p class="ls__sub">재생에너지 프로젝트를 위한 임대 가능한 부지를 찾으세요</p>
    </div>

    <!-- Filters -->
    <div class="ls__filters">
      <div class="ls__search-wrap">
        <IcoSearch class="ls__search-icon" :size="15" :strokeWidth="2" />
        <input
          v-model="searchQuery"
          type="text"
          class="ls__search"
          placeholder="부지명, 주소, 소유자 검색..."
          @input="applyFilters"
        />
      </div>
      <div class="ls__type-tabs">
        <button
          v-for="opt in typeOptions"
          :key="opt.value"
          type="button"
          class="ls__type-tab"
          :class="{ 'ls__type-tab--active': selectedType === opt.value }"
          @click="selectedType = opt.value; applyFilters()"
        >{{ opt.label }}</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="ls__stats">
      <span class="ls__stat">{{ filteredParcels.length }}개 부지</span>
      <span class="ls__stat-sep">|</span>
      <span class="ls__stat">총 {{ formatArea(filteredParcels.reduce((s, p) => s + p.areaSqm, 0)) }}</span>
    </div>

    <!-- Parcel cards -->
    <div class="ls__grid">
      <div v-for="p in filteredParcels" :key="p.id" class="ls__card">
        <div class="ls__card-head">
          <div class="ls__card-type">
            <IcoGlobe :size="12" :strokeWidth="2" />
            {{ p.landTypeLabel }}
          </div>
          <span class="ls__card-status" :class="`ls__card-status--${p.statusColor}`">{{ p.status }}</span>
        </div>
        <h3 class="ls__card-name">{{ p.name }}</h3>
        <div class="ls__card-addr"><IcoMapPin :size="11" :strokeWidth="2" /> {{ p.address }}</div>
        <div class="ls__card-details">
          <div class="ls__card-detail">
            <span class="ls__card-detail-label">면적</span>
            <span class="ls__card-detail-val">{{ formatArea(p.areaSqm) }}</span>
          </div>
          <div class="ls__card-detail">
            <span class="ls__card-detail-label">연간 임대료</span>
            <span class="ls__card-detail-val ls__card-detail-val--accent">{{ p.annualRent }}</span>
          </div>
          <div class="ls__card-detail">
            <span class="ls__card-detail-label">소유자</span>
            <span class="ls__card-detail-val">{{ p.owner }}</span>
          </div>
        </div>
        <div class="ls__card-tags">
          <span v-for="use in p.permittedUse" :key="use" class="ls__card-tag">
            <IcoCheck :size="10" :strokeWidth="2.5" /> {{ use }}
          </span>
        </div>
        <button type="button" class="ls__card-cta">
          임대 문의 <IcoArrowRight :size="13" :strokeWidth="2.5" />
        </button>
      </div>
    </div>

    <div v-if="filteredParcels.length === 0" class="ls__empty">
      검색 조건에 맞는 부지가 없습니다.
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

.ls { padding: 20px; max-width: 900px; margin: 0 auto; }
.ls__header { margin-bottom: 18px; }
.ls__title { font-size: 20px; font-weight: 900; color: $text-primary; margin: 0 0 4px; letter-spacing: -0.03em; }
.ls__sub { font-size: 13px; color: $text-muted; margin: 0; }

.ls__filters { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
.ls__search-wrap { position: relative; flex: 1; min-width: 200px; }
.ls__search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: $text-muted; pointer-events: none; }
.ls__search { width: 100%; height: 40px; padding: 0 12px 0 36px; background: $surface; border: 1px solid $border; border-radius: 8px; font-size: 13px; font-family: "Inter", sans-serif; color: $text-primary; outline: none; &:focus { border-color: $accent; box-shadow: 0 0 0 3px rgba(79,106,245,0.1); } &::placeholder { color: $text-muted; } }
.ls__type-tabs { display: flex; gap: 4px; }
.ls__type-tab { padding: 8px 14px; background: $surface; border: 1px solid $border; border-radius: 8px; font-size: 12px; font-weight: 600; font-family: "Inter", sans-serif; color: $text-secondary; cursor: pointer; transition: all 0.15s; &:hover { border-color: #a3b3fa; } &--active { background: $accent; color: #fff; border-color: $accent; } }

.ls__stats { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: $text-muted; margin-bottom: 14px; }
.ls__stat-sep { color: $border; }

.ls__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; @media (max-width: 640px) { grid-template-columns: 1fr; } }

.ls__card { background: $surface; border: 1px solid $border; border-radius: 12px; padding: 16px; transition: border-color 0.15s, box-shadow 0.15s; &:hover { border-color: $accent; box-shadow: 0 4px 16px rgba(79,106,245,0.08); } }
.ls__card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.ls__card-type { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: $accent; background: #eef2ff; padding: 3px 9px; border-radius: 5px; }
.ls__card-status { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; &--green { background: #dcfce7; color: #16a34a; } &--amber { background: #fef3c7; color: #d97706; } }
.ls__card-name { font-size: 14px; font-weight: 800; color: $text-primary; margin: 0 0 4px; }
.ls__card-addr { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: $text-muted; margin-bottom: 10px; }
.ls__card-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; }
.ls__card-detail { text-align: center; padding: 6px; background: $bg; border-radius: 6px; }
.ls__card-detail-label { display: block; font-size: 9.5px; font-weight: 600; color: $text-muted; margin-bottom: 2px; }
.ls__card-detail-val { font-size: 12px; font-weight: 800; color: $text-primary; font-variant-numeric: tabular-nums; &--accent { color: $accent; } }
.ls__card-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; }
.ls__card-tag { display: inline-flex; align-items: center; gap: 3px; font-size: 10.5px; font-weight: 600; color: #16a34a; background: #f0fdf4; padding: 2px 8px; border-radius: 4px; }
.ls__card-cta { width: 100%; padding: 9px; background: $accent; color: #fff; border: none; border-radius: 8px; font-size: 12.5px; font-weight: 700; font-family: "Inter", sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; transition: background 0.15s; &:hover { background: #3b56d9; } }

.ls__empty { text-align: center; padding: 40px; color: $text-muted; font-size: 14px; }
</style>
