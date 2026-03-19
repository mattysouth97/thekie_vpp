<script setup lang="ts">
import { ref, computed } from "vue";
import { IcoArrowRight, IcoSearch, IcoChevronDown, IcoDocument, IcoClose, IcoStar, IcoCheck } from "@/components/icons";
import { useAuthStore } from "@/stores/auth-store";

const authStore = useAuthStore();

// ── Tab state ──
type MarketTab = "rec" | "carbon";
const activeTab = ref<MarketTab>("rec");

// ── Filters ──
const filterRegion = ref("");
const filterVintage = ref("");
const filterFuelType = ref("");
const searchQuery = ref("");
const showFilters = ref(true);

// ── Selection ──
const selectMode = ref(false);
const selectedIds = ref<Set<string>>(new Set());

function toggleSelect(id: string) {
  if (selectedIds.value.has(id)) selectedIds.value.delete(id);
  else selectedIds.value.add(id);
}

function clearSelection() {
  selectedIds.value.clear();
  selectMode.value = false;
}

// ── Sorting ──
type SortKey = "vintage" | "quantity" | "unitPrice" | "closing";
const sortKey = ref<SortKey | null>(null);
const sortAsc = ref(true);

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = key;
    sortAsc.value = true;
  }
}

// ── Pagination ──
const currentPage = ref(1);
const rowsPerPage = ref(15);

// ── REC Offerings Data ──
interface RecOffering {
  id: string;
  product: string;
  registry: string;
  region: string;
  fuelType: string;
  vintageStart: string;
  vintageEnd: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  closing: string;
  isNew: boolean;
  verified: boolean;
}

const recOfferings = ref<RecOffering[]>([
  { id: "REC-001", product: "REC", registry: "한국에너지공단", region: "제주특별자치도", fuelType: "태양광", vintageStart: "2025/01", vintageEnd: "2025/12", quantity: 45000, unitPrice: 42500, currency: "KRW", closing: "2025/06/30", isNew: true, verified: true },
  { id: "REC-002", product: "REC", registry: "한국에너지공단", region: "전라남도", fuelType: "풍력", vintageStart: "2025/01", vintageEnd: "2025/12", quantity: 28000, unitPrice: 48200, currency: "KRW", closing: "2025/07/15", isNew: true, verified: true },
  { id: "REC-003", product: "REC", registry: "한국에너지공단", region: "강원도", fuelType: "풍력", vintageStart: "2024/07", vintageEnd: "2024/12", quantity: 12500, unitPrice: 44800, currency: "KRW", closing: "2025/05/31", isNew: false, verified: true },
  { id: "REC-004", product: "REC", registry: "한국에너지공단", region: "충청남도", fuelType: "태양광", vintageStart: "2024/01", vintageEnd: "2024/12", quantity: 67200, unitPrice: 41200, currency: "KRW", closing: "2025/06/15", isNew: false, verified: true },
  { id: "REC-005", product: "REC", registry: "한국에너지공단", region: "경상북도", fuelType: "수력", vintageStart: "2025/01", vintageEnd: "2025/06", quantity: 8400, unitPrice: 52100, currency: "KRW", closing: "2025/08/01", isNew: true, verified: true },
  { id: "REC-006", product: "REC", registry: "한국에너지공단", region: "전라북도", fuelType: "바이오매스", vintageStart: "2024/01", vintageEnd: "2024/12", quantity: 15800, unitPrice: 47600, currency: "KRW", closing: "2025/05/20", isNew: false, verified: true },
  { id: "REC-007", product: "I-REC", registry: "I-REC Standard", region: "베트남", fuelType: "태양광", vintageStart: "2025/01", vintageEnd: "2025/12", quantity: 120000, unitPrice: 2.85, currency: "USD", closing: "2025/09/30", isNew: true, verified: true },
  { id: "REC-008", product: "I-REC", registry: "I-REC Standard", region: "인도", fuelType: "풍력, 태양광", vintageStart: "2024/01", vintageEnd: "2024/12", quantity: 250000, unitPrice: 2.10, currency: "USD", closing: "2025/08/15", isNew: false, verified: true },
  { id: "REC-009", product: "I-REC", registry: "I-REC Standard", region: "태국", fuelType: "태양광", vintageStart: "2024/07", vintageEnd: "2025/06", quantity: 85000, unitPrice: 3.20, currency: "USD", closing: "2025/07/31", isNew: false, verified: true },
  { id: "REC-010", product: "REC", registry: "한국에너지공단", region: "제주특별자치도", fuelType: "풍력", vintageStart: "2024/01", vintageEnd: "2024/12", quantity: 32000, unitPrice: 46300, currency: "KRW", closing: "2025/06/01", isNew: false, verified: true },
  { id: "REC-011", product: "REC", registry: "한국에너지공단", region: "경상남도", fuelType: "태양광", vintageStart: "2025/01", vintageEnd: "2025/12", quantity: 54000, unitPrice: 43100, currency: "KRW", closing: "2025/09/15", isNew: true, verified: true },
  { id: "REC-012", product: "I-REC", registry: "I-REC Standard", region: "인도네시아", fuelType: "수력", vintageStart: "2024/01", vintageEnd: "2024/12", quantity: 180000, unitPrice: 1.95, currency: "USD", closing: "2025/06/30", isNew: false, verified: true },
  { id: "REC-013", product: "REC", registry: "한국에너지공단", region: "충청북도", fuelType: "연료전지", vintageStart: "2024/07", vintageEnd: "2025/06", quantity: 6200, unitPrice: 58400, currency: "KRW", closing: "2025/07/01", isNew: false, verified: true },
  { id: "REC-014", product: "REC", registry: "한국에너지공단", region: "전라남도", fuelType: "태양광", vintageStart: "2025/01", vintageEnd: "2025/12", quantity: 38500, unitPrice: 42800, currency: "KRW", closing: "2025/08/31", isNew: true, verified: true },
  { id: "REC-015", product: "I-REC", registry: "I-REC Standard", region: "필리핀", fuelType: "풍력, 태양광", vintageStart: "2025/01", vintageEnd: "2025/12", quantity: 95000, unitPrice: 2.60, currency: "USD", closing: "2025/10/15", isNew: true, verified: true },
  { id: "REC-016", product: "REC", registry: "한국에너지공단", region: "경기도", fuelType: "태양광", vintageStart: "2024/01", vintageEnd: "2024/12", quantity: 21000, unitPrice: 41800, currency: "KRW", closing: "2025/05/15", isNew: false, verified: true },
]);

// ── Carbon Offerings Data ──
interface CarbonOffering {
  id: string;
  product: string;
  standard: string;
  projectType: string;
  region: string;
  vintageStart: string;
  vintageEnd: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  closing: string;
  isNew: boolean;
  verified: boolean;
}

const carbonOfferings = ref<CarbonOffering[]>([
  { id: "CRB-001", product: "KAU", standard: "한국거래소", projectType: "배출허용량", region: "한국", vintageStart: "2025", vintageEnd: "2025", quantity: 10000, unitPrice: 9200, currency: "KRW", closing: "2025/06/30", isNew: true, verified: true },
  { id: "CRB-002", product: "KCU", standard: "한국거래소", projectType: "상쇄배출권", region: "한국", vintageStart: "2024", vintageEnd: "2024", quantity: 5000, unitPrice: 8900, currency: "KRW", closing: "2025/07/15", isNew: true, verified: true },
  { id: "CRB-003", product: "VCS", standard: "Verra", projectType: "재생에너지", region: "베트남", vintageStart: "2024", vintageEnd: "2024", quantity: 75000, unitPrice: 8.50, currency: "USD", closing: "2025/09/30", isNew: false, verified: true },
  { id: "CRB-004", product: "Gold Standard", standard: "Gold Standard", projectType: "에너지효율", region: "인도", vintageStart: "2024", vintageEnd: "2025", quantity: 42000, unitPrice: 12.80, currency: "USD", closing: "2025/08/15", isNew: true, verified: true },
  { id: "CRB-005", product: "KAU", standard: "한국거래소", projectType: "배출허용량", region: "한국", vintageStart: "2024", vintageEnd: "2024", quantity: 25000, unitPrice: 8600, currency: "KRW", closing: "2025/05/31", isNew: false, verified: true },
  { id: "CRB-006", product: "VCS", standard: "Verra", projectType: "REDD+", region: "인도네시아", vintageStart: "2023", vintageEnd: "2024", quantity: 150000, unitPrice: 6.20, currency: "USD", closing: "2025/06/30", isNew: false, verified: true },
  { id: "CRB-007", product: "KCU", standard: "한국거래소", projectType: "산림탄소", region: "한국", vintageStart: "2025", vintageEnd: "2025", quantity: 8000, unitPrice: 9500, currency: "KRW", closing: "2025/10/01", isNew: true, verified: true },
  { id: "CRB-008", product: "VCS", standard: "Verra", projectType: "태양광", region: "태국", vintageStart: "2024", vintageEnd: "2025", quantity: 55000, unitPrice: 7.80, currency: "USD", closing: "2025/07/31", isNew: false, verified: true },
  { id: "CRB-009", product: "Gold Standard", standard: "Gold Standard", projectType: "바이오가스", region: "캄보디아", vintageStart: "2024", vintageEnd: "2024", quantity: 30000, unitPrice: 14.50, currency: "USD", closing: "2025/08/30", isNew: true, verified: true },
  { id: "CRB-010", product: "KAU", standard: "한국거래소", projectType: "배출허용량", region: "한국", vintageStart: "2025", vintageEnd: "2025", quantity: 18000, unitPrice: 9350, currency: "KRW", closing: "2025/12/31", isNew: true, verified: true },
  { id: "CRB-011", product: "VCS", standard: "Verra", projectType: "풍력", region: "브라질", vintageStart: "2024", vintageEnd: "2025", quantity: 200000, unitPrice: 5.40, currency: "USD", closing: "2025/09/15", isNew: false, verified: true },
  { id: "CRB-012", product: "Gold Standard", standard: "Gold Standard", projectType: "정수 필터", region: "케냐", vintageStart: "2024", vintageEnd: "2024", quantity: 18000, unitPrice: 18.20, currency: "USD", closing: "2025/06/15", isNew: false, verified: true },
]);

// ── Unique filter options ──
const recRegions = computed(() => [...new Set(recOfferings.value.map(o => o.region))]);
const recFuelTypes = computed(() => [...new Set(recOfferings.value.map(o => o.fuelType))]);
const recVintages = computed(() => {
  const set = new Set<string>();
  recOfferings.value.forEach(o => { set.add(o.vintageStart.split("/")[0]); });
  return [...set].sort().reverse();
});

const carbonRegions = computed(() => [...new Set(carbonOfferings.value.map(o => o.region))]);
const carbonProjectTypes = computed(() => [...new Set(carbonOfferings.value.map(o => o.projectType))]);
const carbonVintages = computed(() => {
  const set = new Set<string>();
  carbonOfferings.value.forEach(o => { set.add(o.vintageStart); });
  return [...set].sort().reverse();
});

// ── Filtered data ──
const filteredRec = computed(() => {
  let data = recOfferings.value;
  if (filterRegion.value) data = data.filter(o => o.region === filterRegion.value);
  if (filterVintage.value) data = data.filter(o => o.vintageStart.startsWith(filterVintage.value));
  if (filterFuelType.value) data = data.filter(o => o.fuelType.includes(filterFuelType.value));
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    data = data.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.region.toLowerCase().includes(q) ||
      o.fuelType.toLowerCase().includes(q) ||
      o.registry.toLowerCase().includes(q)
    );
  }
  return data;
});

const filteredCarbon = computed(() => {
  let data = carbonOfferings.value;
  if (filterRegion.value) data = data.filter(o => o.region === filterRegion.value);
  if (filterVintage.value) data = data.filter(o => o.vintageStart === filterVintage.value);
  if (filterFuelType.value) data = data.filter(o => o.projectType.includes(filterFuelType.value));
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    data = data.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.region.toLowerCase().includes(q) ||
      o.projectType.toLowerCase().includes(q) ||
      o.standard.toLowerCase().includes(q)
    );
  }
  return data;
});

// ── Paginated data ──
const paginatedRec = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredRec.value.slice(start, start + rowsPerPage.value);
});

const paginatedCarbon = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredCarbon.value.slice(start, start + rowsPerPage.value);
});

const totalItems = computed(() => activeTab.value === "rec" ? filteredRec.value.length : filteredCarbon.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / rowsPerPage.value));

// ── Tab switch resets ──
function switchTab(tab: MarketTab) {
  activeTab.value = tab;
  currentPage.value = 1;
  filterRegion.value = "";
  filterVintage.value = "";
  filterFuelType.value = "";
  searchQuery.value = "";
  selectedIds.value.clear();
}

// ── Format helpers ──
function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

function formatPrice(price: number, currency: string): string {
  if (currency === "KRW") return `₩${formatNumber(price)}`;
  return `$${price.toFixed(2)}`;
}
</script>

<template>
  <div class="mkt">
    <!-- Header -->
    <div class="mkt__header">
      <div class="mkt__header-left">
        <h1 class="mkt__title">마켓플레이스</h1>
        <p class="mkt__sub">Active Offerings — REC 및 탄소배출권 거래</p>
      </div>
      <div class="mkt__header-right">
        <div class="mkt__stats-bar">
          <div class="mkt__stat-pill">
            <span class="mkt__stat-pill-val">{{ formatNumber(totalItems) }}</span>
            <span class="mkt__stat-pill-label">오퍼링</span>
          </div>
          <div class="mkt__stat-pill">
            <span class="mkt__stat-pill-val">99.97%</span>
            <span class="mkt__stat-pill-label">블록체인 검증률</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mkt__tabs">
      <button
        :class="['mkt__tab', { 'mkt__tab--active': activeTab === 'rec' }]"
        @click="switchTab('rec')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        REC
        <span class="mkt__tab-count">{{ recOfferings.length }}</span>
      </button>
      <button
        :class="['mkt__tab', { 'mkt__tab--active': activeTab === 'carbon' }]"
        @click="switchTab('carbon')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12s1.5-2 4-2 4 2 4 2"/><path d="M8 16s1.5-2 4-2 4 2 4 2"/></svg>
        Carbon
        <span class="mkt__tab-count">{{ carbonOfferings.length }}</span>
      </button>
    </div>

    <!-- Toolbar -->
    <div class="mkt__toolbar">
      <div class="mkt__toolbar-left">
        <button class="mkt__tool-btn" @click="showFilters = !showFilters">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          필터
          <IcoChevronDown :size="12" :strokeWidth="2.5" :style="{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }" />
        </button>
        <button class="mkt__tool-btn" @click="selectMode = !selectMode; selectedIds.clear()">
          <IcoCheck :size="14" :strokeWidth="2.5" />
          {{ selectMode ? '선택 해제' : '복수 선택' }}
        </button>
        <button v-if="selectMode && selectedIds.size > 0" class="mkt__tool-btn mkt__tool-btn--accent">
          <IcoDocument :size="14" :strokeWidth="2" />
          {{ selectedIds.size }}건 견적 요청
        </button>
      </div>
      <div class="mkt__toolbar-right">
        <button class="mkt__tool-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV
        </button>
        <div class="mkt__search-wrap">
          <IcoSearch :size="14" :strokeWidth="2" class="mkt__search-ico" />
          <input v-model="searchQuery" type="text" class="mkt__search-input" placeholder="ID, 지역, 유형 검색..." />
          <button v-if="searchQuery" type="button" class="mkt__search-clear" @click="searchQuery = ''">
            <IcoClose :size="11" :strokeWidth="2.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Filters row -->
    <Transition name="mkt-slide">
      <div v-if="showFilters" class="mkt__filters">
        <!-- REC filters -->
        <template v-if="activeTab === 'rec'">
          <div class="mkt__filter-group">
            <label class="mkt__filter-label">지역</label>
            <select v-model="filterRegion" class="mkt__filter-select">
              <option value="">전체</option>
              <option v-for="r in recRegions" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div class="mkt__filter-group">
            <label class="mkt__filter-label">빈티지</label>
            <select v-model="filterVintage" class="mkt__filter-select">
              <option value="">전체</option>
              <option v-for="v in recVintages" :key="v" :value="v">{{ v }}</option>
            </select>
          </div>
          <div class="mkt__filter-group">
            <label class="mkt__filter-label">연료 유형</label>
            <select v-model="filterFuelType" class="mkt__filter-select">
              <option value="">전체</option>
              <option v-for="f in recFuelTypes" :key="f" :value="f">{{ f }}</option>
            </select>
          </div>
        </template>
        <!-- Carbon filters -->
        <template v-else>
          <div class="mkt__filter-group">
            <label class="mkt__filter-label">지역</label>
            <select v-model="filterRegion" class="mkt__filter-select">
              <option value="">전체</option>
              <option v-for="r in carbonRegions" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div class="mkt__filter-group">
            <label class="mkt__filter-label">빈티지</label>
            <select v-model="filterVintage" class="mkt__filter-select">
              <option value="">전체</option>
              <option v-for="v in carbonVintages" :key="v" :value="v">{{ v }}</option>
            </select>
          </div>
          <div class="mkt__filter-group">
            <label class="mkt__filter-label">프로젝트 유형</label>
            <select v-model="filterFuelType" class="mkt__filter-select">
              <option value="">전체</option>
              <option v-for="p in carbonProjectTypes" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
        </template>
        <button v-if="filterRegion || filterVintage || filterFuelType" class="mkt__filter-clear" @click="filterRegion = ''; filterVintage = ''; filterFuelType = ''">
          <IcoClose :size="11" :strokeWidth="2.5" /> 초기화
        </button>
      </div>
    </Transition>

    <!-- ═══════════ REC TABLE ═══════════ -->
    <div v-if="activeTab === 'rec'" class="mkt__table-wrap">
      <table class="mkt__table">
        <thead>
          <tr>
            <th v-if="selectMode" class="mkt__th mkt__th--check"></th>
            <th class="mkt__th">ID</th>
            <th class="mkt__th">제품 / 레지스트리</th>
            <th class="mkt__th">지역</th>
            <th class="mkt__th">연료 유형</th>
            <th class="mkt__th mkt__th--sort" @click="toggleSort('vintage')">
              빈티지
              <span class="mkt__sort-arrow" :class="{ 'mkt__sort-arrow--active': sortKey === 'vintage', 'mkt__sort-arrow--desc': sortKey === 'vintage' && !sortAsc }">▲</span>
            </th>
            <th class="mkt__th mkt__th--sort mkt__th--right" @click="toggleSort('quantity')">
              수량
              <span class="mkt__sort-arrow" :class="{ 'mkt__sort-arrow--active': sortKey === 'quantity', 'mkt__sort-arrow--desc': sortKey === 'quantity' && !sortAsc }">▲</span>
            </th>
            <th class="mkt__th mkt__th--sort mkt__th--right" @click="toggleSort('unitPrice')">
              단가
              <span class="mkt__sort-arrow" :class="{ 'mkt__sort-arrow--active': sortKey === 'unitPrice', 'mkt__sort-arrow--desc': sortKey === 'unitPrice' && !sortAsc }">▲</span>
            </th>
            <th class="mkt__th mkt__th--sort" @click="toggleSort('closing')">
              마감일
              <span class="mkt__sort-arrow" :class="{ 'mkt__sort-arrow--active': sortKey === 'closing', 'mkt__sort-arrow--desc': sortKey === 'closing' && !sortAsc }">▲</span>
            </th>
            <th class="mkt__th mkt__th--actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedRec" :key="item.id" class="mkt__row" :class="{ 'mkt__row--selected': selectedIds.has(item.id) }">
            <td v-if="selectMode" class="mkt__td mkt__td--check">
              <input type="checkbox" :checked="selectedIds.has(item.id)" @change="toggleSelect(item.id)" class="mkt__checkbox" />
            </td>
            <td class="mkt__td">
              <span class="mkt__id">{{ item.id }}</span>
              <span v-if="item.isNew" class="mkt__new-badge">NEW</span>
            </td>
            <td class="mkt__td">
              <div class="mkt__product">
                <span class="mkt__product-type" :class="item.product === 'I-REC' ? 'mkt__product-type--irec' : ''">{{ item.product }}</span>
                <span class="mkt__registry">{{ item.registry }}</span>
              </div>
            </td>
            <td class="mkt__td">{{ item.region }}</td>
            <td class="mkt__td">
              <span class="mkt__fuel-chip">{{ item.fuelType }}</span>
            </td>
            <td class="mkt__td">{{ item.vintageStart }} ~ {{ item.vintageEnd }}</td>
            <td class="mkt__td mkt__td--right mkt__td--mono">{{ formatNumber(item.quantity) }}</td>
            <td class="mkt__td mkt__td--right mkt__td--mono mkt__td--price">{{ formatPrice(item.unitPrice, item.currency) }} <span class="mkt__currency">{{ item.currency }}</span></td>
            <td class="mkt__td">{{ item.closing }}</td>
            <td class="mkt__td mkt__td--actions">
              <button class="mkt__row-btn mkt__row-btn--cart" title="장바구니 추가">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </button>
              <button class="mkt__row-btn" title="상세보기">
                <IcoArrowRight :size="14" :strokeWidth="2" />
              </button>
            </td>
          </tr>
          <tr v-if="paginatedRec.length === 0">
            <td :colspan="selectMode ? 10 : 9" class="mkt__empty">검색 결과가 없습니다</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═══════════ CARBON TABLE ═══════════ -->
    <div v-if="activeTab === 'carbon'" class="mkt__table-wrap">
      <table class="mkt__table">
        <thead>
          <tr>
            <th v-if="selectMode" class="mkt__th mkt__th--check"></th>
            <th class="mkt__th">ID</th>
            <th class="mkt__th">제품 / 인증기관</th>
            <th class="mkt__th">프로젝트 유형</th>
            <th class="mkt__th">지역</th>
            <th class="mkt__th mkt__th--sort" @click="toggleSort('vintage')">
              빈티지
              <span class="mkt__sort-arrow" :class="{ 'mkt__sort-arrow--active': sortKey === 'vintage', 'mkt__sort-arrow--desc': sortKey === 'vintage' && !sortAsc }">▲</span>
            </th>
            <th class="mkt__th mkt__th--sort mkt__th--right" @click="toggleSort('quantity')">
              수량 (tCO2e)
              <span class="mkt__sort-arrow" :class="{ 'mkt__sort-arrow--active': sortKey === 'quantity', 'mkt__sort-arrow--desc': sortKey === 'quantity' && !sortAsc }">▲</span>
            </th>
            <th class="mkt__th mkt__th--sort mkt__th--right" @click="toggleSort('unitPrice')">
              단가
              <span class="mkt__sort-arrow" :class="{ 'mkt__sort-arrow--active': sortKey === 'unitPrice', 'mkt__sort-arrow--desc': sortKey === 'unitPrice' && !sortAsc }">▲</span>
            </th>
            <th class="mkt__th mkt__th--sort" @click="toggleSort('closing')">
              마감일
              <span class="mkt__sort-arrow" :class="{ 'mkt__sort-arrow--active': sortKey === 'closing', 'mkt__sort-arrow--desc': sortKey === 'closing' && !sortAsc }">▲</span>
            </th>
            <th class="mkt__th mkt__th--actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paginatedCarbon" :key="item.id" class="mkt__row" :class="{ 'mkt__row--selected': selectedIds.has(item.id) }">
            <td v-if="selectMode" class="mkt__td mkt__td--check">
              <input type="checkbox" :checked="selectedIds.has(item.id)" @change="toggleSelect(item.id)" class="mkt__checkbox" />
            </td>
            <td class="mkt__td">
              <span class="mkt__id">{{ item.id }}</span>
              <span v-if="item.isNew" class="mkt__new-badge">NEW</span>
            </td>
            <td class="mkt__td">
              <div class="mkt__product">
                <span class="mkt__product-type" :class="{
                  'mkt__product-type--kau': item.product === 'KAU',
                  'mkt__product-type--kcu': item.product === 'KCU',
                  'mkt__product-type--vcs': item.product === 'VCS',
                  'mkt__product-type--gs': item.product === 'Gold Standard',
                }">{{ item.product }}</span>
                <span class="mkt__registry">{{ item.standard }}</span>
              </div>
            </td>
            <td class="mkt__td">
              <span class="mkt__fuel-chip">{{ item.projectType }}</span>
            </td>
            <td class="mkt__td">{{ item.region }}</td>
            <td class="mkt__td">{{ item.vintageStart }} ~ {{ item.vintageEnd }}</td>
            <td class="mkt__td mkt__td--right mkt__td--mono">{{ formatNumber(item.quantity) }}</td>
            <td class="mkt__td mkt__td--right mkt__td--mono mkt__td--price">{{ formatPrice(item.unitPrice, item.currency) }} <span class="mkt__currency">{{ item.currency }}</span></td>
            <td class="mkt__td">{{ item.closing }}</td>
            <td class="mkt__td mkt__td--actions">
              <button class="mkt__row-btn mkt__row-btn--cart" title="장바구니 추가">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </button>
              <button class="mkt__row-btn" title="상세보기">
                <IcoArrowRight :size="14" :strokeWidth="2" />
              </button>
            </td>
          </tr>
          <tr v-if="paginatedCarbon.length === 0">
            <td :colspan="selectMode ? 10 : 9" class="mkt__empty">검색 결과가 없습니다</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mkt__pagination">
      <div class="mkt__pagination-info">
        <span class="mkt__pagination-label">Rows per page:</span>
        <select v-model.number="rowsPerPage" class="mkt__pagination-select" @change="currentPage = 1">
          <option :value="10">10</option>
          <option :value="15">15</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
        <span class="mkt__pagination-range">
          {{ (currentPage - 1) * rowsPerPage + 1 }}-{{ Math.min(currentPage * rowsPerPage, totalItems) }} of {{ totalItems }}
        </span>
      </div>
      <div class="mkt__pagination-nav">
        <button class="mkt__page-btn" :disabled="currentPage === 1" @click="currentPage--">
          <IcoArrowRight :size="14" :strokeWidth="2.5" style="transform: rotate(180deg)" />
        </button>
        <template v-for="p in totalPages" :key="p">
          <button
            v-if="p <= 3 || p === totalPages || Math.abs(p - currentPage) <= 1"
            :class="['mkt__page-btn', { 'mkt__page-btn--active': p === currentPage }]"
            @click="currentPage = p"
          >{{ p }}</button>
          <span v-else-if="p === 4 && currentPage > 4" class="mkt__page-dots">...</span>
        </template>
        <button class="mkt__page-btn" :disabled="currentPage === totalPages || totalPages === 0" @click="currentPage++">
          <IcoArrowRight :size="14" :strokeWidth="2.5" />
        </button>
      </div>
    </div>

    <!-- Footer note -->
    <p class="mkt__footnote">
      * 가격은 KRW의 경우 원 단위, USD의 경우 소수점 둘째 자리까지 반올림되었습니다. 블록체인 검증 완료 오퍼링만 표시됩니다.
    </p>
  </div>
</template>

<style scoped lang="scss">
$accent: #4F6AF5;
$green: #16a34a;
$red: #ef4444;
$orange: #f59e0b;
$purple: #7c3aed;
$text-primary: #0f172a;
$text-secondary: #475569;
$text-muted: #94a3b8;
$border: #e2e8f0;
$surface: #ffffff;
$bg: #f8fafc;
$radius: 10px;
$mono: "SF Mono", "Fira Code", "Cascadia Code", monospace;

.mkt {
  padding: 20px 24px;
  max-width: 100%;
}

// ── Header ──
.mkt__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}
.mkt__header-left { flex: 1; }
.mkt__title {
  font-size: 20px;
  font-weight: 900;
  color: $text-primary;
  margin: 0 0 4px;
  letter-spacing: -0.03em;
}
.mkt__sub {
  font-size: 13px;
  color: $text-muted;
  margin: 0;
}
.mkt__stats-bar {
  display: flex;
  gap: 8px;
}
.mkt__stat-pill {
  background: $surface;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 8px 14px;
  text-align: center;
}
.mkt__stat-pill-val {
  display: block;
  font-size: 14px;
  font-weight: 800;
  color: $text-primary;
  font-variant-numeric: tabular-nums;
}
.mkt__stat-pill-label {
  font-size: 10px;
  color: $text-muted;
  font-weight: 600;
}

// ── Tabs ──
.mkt__tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid $border;
  margin-bottom: 12px;
}
.mkt__tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  color: $text-muted;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;

  &:hover { color: $text-secondary; }

  &--active {
    color: $accent;
    border-bottom-color: $accent;
  }
}
.mkt__tab-count {
  font-size: 10px;
  font-weight: 800;
  background: rgba($accent, 0.1);
  color: $accent;
  padding: 1px 6px;
  border-radius: 4px;

  .mkt__tab--active & {
    background: $accent;
    color: #fff;
  }
}

// ── Toolbar ──
.mkt__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.mkt__toolbar-left,
.mkt__toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.mkt__tool-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  font-size: 11.5px;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  color: $text-secondary;
  background: $surface;
  border: 1px solid $border;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;

  &:hover { border-color: $accent; color: $accent; }

  &--accent {
    background: rgba($accent, 0.06);
    border-color: rgba($accent, 0.3);
    color: $accent;
  }
}
.mkt__search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.mkt__search-ico {
  position: absolute;
  left: 10px;
  color: $text-muted;
  pointer-events: none;
}
.mkt__search-input {
  width: 200px;
  padding: 6px 28px 6px 30px;
  font-size: 12px;
  font-family: "Inter", sans-serif;
  color: $text-primary;
  background: $surface;
  border: 1px solid $border;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.15s, width 0.2s;
  &::placeholder { color: $text-muted; }
  &:focus { border-color: $accent; width: 240px; }
}
.mkt__search-clear {
  position: absolute;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: $bg;
  border: none;
  border-radius: 50%;
  color: $text-muted;
  cursor: pointer;
  &:hover { color: $text-primary; }
}

// ── Filters ──
.mkt__filters {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 10px 0;
  flex-wrap: wrap;
}
.mkt__filter-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.mkt__filter-label {
  font-size: 10px;
  font-weight: 700;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.mkt__filter-select {
  padding: 5px 28px 5px 10px;
  font-size: 12px;
  font-family: "Inter", sans-serif;
  color: $text-primary;
  background: $surface;
  border: 1px solid $border;
  border-radius: 6px;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  min-width: 120px;
  cursor: pointer;

  &:focus { border-color: $accent; }
}
.mkt__filter-clear {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  color: $red;
  background: none;
  border: 1px solid rgba($red, 0.2);
  border-radius: 6px;
  cursor: pointer;
  &:hover { background: rgba($red, 0.04); }
}

// ── Transition ──
.mkt-slide-enter-active { transition: all 0.2s ease; }
.mkt-slide-leave-active { transition: all 0.15s ease; }
.mkt-slide-enter-from,
.mkt-slide-leave-to { opacity: 0; transform: translateY(-8px); }

// ── Table ──
.mkt__table-wrap {
  overflow-x: auto;
  border: 1px solid $border;
  border-radius: $radius;
  background: $surface;
}
.mkt__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.mkt__th {
  padding: 10px 14px;
  font-size: 10.5px;
  font-weight: 800;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: left;
  border-bottom: 1px solid $border;
  white-space: nowrap;
  background: $bg;
  position: sticky;
  top: 0;

  &--sort { cursor: pointer; user-select: none; &:hover { color: $text-secondary; } }
  &--right { text-align: right; }
  &--check { width: 36px; padding: 10px 8px; }
  &--actions { width: 72px; }
}
.mkt__sort-arrow {
  font-size: 8px;
  color: transparent;
  margin-left: 2px;
  transition: color 0.12s, transform 0.12s;
  display: inline-block;

  &--active { color: $accent; }
  &--desc { transform: rotate(180deg); }

  .mkt__th:hover & { color: $text-muted; }
}

.mkt__row {
  transition: background 0.1s;
  &:hover { background: rgba($accent, 0.02); }
  &--selected { background: rgba($accent, 0.05); }
  &:not(:last-child) .mkt__td { border-bottom: 1px solid rgba($border, 0.6); }
}
.mkt__td {
  padding: 10px 14px;
  color: $text-primary;
  white-space: nowrap;
  vertical-align: middle;

  &--right { text-align: right; }
  &--mono { font-family: $mono; font-size: 12px; font-variant-numeric: tabular-nums; }
  &--check { padding: 10px 8px; }
  &--actions { padding: 6px 8px; }
  &--price { font-weight: 600; }
}
.mkt__checkbox {
  width: 15px;
  height: 15px;
  accent-color: $accent;
  cursor: pointer;
}
.mkt__empty {
  padding: 40px;
  text-align: center;
  color: $text-muted;
  font-size: 13px;
}

// ── Cell content ──
.mkt__id {
  font-family: $mono;
  font-size: 11.5px;
  font-weight: 700;
  color: $accent;
}
.mkt__new-badge {
  display: inline-block;
  font-size: 8px;
  font-weight: 800;
  color: #fff;
  background: $red;
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 5px;
  vertical-align: middle;
  letter-spacing: 0.05em;
}
.mkt__product {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mkt__product-type {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba($accent, 0.1);
  color: $accent;
  width: fit-content;

  &--irec { background: rgba($green, 0.1); color: $green; }
  &--kau { background: rgba($orange, 0.1); color: #d97706; }
  &--kcu { background: rgba($purple, 0.1); color: $purple; }
  &--vcs { background: rgba(#0891b2, 0.1); color: #0891b2; }
  &--gs { background: rgba($orange, 0.1); color: #e08e0b; }
}
.mkt__registry {
  font-size: 10px;
  color: $text-muted;
}
.mkt__fuel-chip {
  font-size: 11px;
  font-weight: 600;
  color: $text-secondary;
  background: $bg;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba($border, 0.6);
}
.mkt__currency {
  font-size: 9px;
  font-weight: 600;
  color: $text-muted;
  margin-left: 2px;
}

// ── Row actions ──
.mkt__row-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid $border;
  background: $surface;
  border-radius: 6px;
  color: $text-muted;
  cursor: pointer;
  transition: all 0.12s;
  margin-left: 2px;

  &:hover { border-color: $accent; color: $accent; }
  &--cart:hover { border-color: $green; color: $green; }
}

// ── Pagination ──
.mkt__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  gap: 16px;
  flex-wrap: wrap;
}
.mkt__pagination-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mkt__pagination-label {
  font-size: 11px;
  color: $text-muted;
}
.mkt__pagination-select {
  padding: 3px 6px;
  font-size: 11.5px;
  font-family: "Inter", sans-serif;
  border: 1px solid $border;
  border-radius: 4px;
  outline: none;
  &:focus { border-color: $accent; }
}
.mkt__pagination-range {
  font-size: 11.5px;
  font-weight: 600;
  color: $text-secondary;
  font-variant-numeric: tabular-nums;
}
.mkt__pagination-nav {
  display: flex;
  align-items: center;
  gap: 2px;
}
.mkt__page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 11.5px;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  color: $text-secondary;
  background: $surface;
  border: 1px solid $border;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.12s;

  &:hover:not(:disabled) { border-color: $accent; color: $accent; }
  &:disabled { opacity: 0.35; cursor: default; }
  &--active { background: $accent; color: #fff; border-color: $accent; }
}
.mkt__page-dots {
  font-size: 11px;
  color: $text-muted;
  padding: 0 4px;
}

// ── Footnote ──
.mkt__footnote {
  font-size: 10.5px;
  color: $text-muted;
  line-height: 1.5;
  margin: 8px 0 0;
}

// ── Responsive ──
@media (max-width: 768px) {
  .mkt__header { flex-direction: column; }
  .mkt__toolbar { flex-direction: column; align-items: stretch; }
  .mkt__toolbar-left,
  .mkt__toolbar-right { flex-wrap: wrap; }
  .mkt__search-input { width: 100%; &:focus { width: 100%; } }
  .mkt__filters { flex-direction: column; }
}
</style>
