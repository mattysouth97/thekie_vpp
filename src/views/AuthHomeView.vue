<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth-store";
import { useMarketStore } from "@/stores/market-store";
import { useProjectStore } from "@/stores/project-store";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  IcoSolar, IcoWind, IcoBattery, IcoArrowRight, IcoClose,
  IcoSmp, IcoRec, IcoKau, IcoMapPin, IcoSearch,
} from "@/components/icons";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

const router = useRouter();
const authStore = useAuthStore();
const marketStore = useMarketStore();
const projectStore = useProjectStore();

const mapContainer = ref<HTMLElement | null>(null);
let map: mapboxgl.Map | null = null;
const markers: mapboxgl.Marker[] = [];

// ── Category filter ──
const categories = [
  { key: "all", label: "전체", icon: "" },
  { key: "태양광", label: "태양광", icon: "solar" },
  { key: "풍력", label: "풍력", icon: "wind" },
  { key: "ESS", label: "ESS", icon: "battery" },
];
const activeCategory = ref("all");
const searchQuery = ref("");

const filteredProjects = computed(() => {
  let list = projectStore.projects;
  if (activeCategory.value !== "all") {
    list = list.filter((p) => p.type === activeCategory.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q),
    );
  }
  return list;
});

// ── Market ticker ──
const marketData = computed(() => [
  { label: "SMP", value: marketStore.smpDisplay.landAvg, unit: "원/kWh", change: marketStore.smp ? (marketStore.smp.landAvg >= 117 ? "+" : "") + (marketStore.smp.landAvg - 117).toFixed(2) : "—", up: (marketStore.smp?.landAvg ?? 117) >= 117, icon: "smp" },
  { label: "REC", value: marketStore.recDisplay.avgPrice, unit: "원/REC", change: marketStore.recDisplay.change, up: marketStore.recDisplay.changeUp, icon: "rec" },
  { label: "KAU", value: "8,500", unit: "원/tCO₂", change: "+200", up: true, icon: "kau" },
]);

// ── Project interaction ──
function selectProject(project: typeof projectStore.projects[0]) {
  if (map) {
    map.flyTo({ center: [project.lng, project.lat], zoom: 12, duration: 800 });
  }
  // Highlight marker
  document.querySelectorAll(".map-marker").forEach((el) => el.classList.remove("map-marker--active"));
  const idx = projectStore.projects.findIndex((p) => p.id === project.id);
  const els = document.querySelectorAll(".map-marker");
  if (els[idx]) els[idx].classList.add("map-marker--active");
}

function goToProject(id: string) {
  router.push(`/marketplace/projects/${id}`);
}

// ── Map ──
function createMarkerEl(project: typeof projectStore.projects[0]): HTMLElement {
  const el = document.createElement("div");
  el.className = "map-marker";
  el.dataset.type = project.typeIcon;
  el.innerHTML = `<span class="map-marker__dot"></span>`;
  el.addEventListener("click", () => selectProject(project));
  return el;
}

function addMarkersToMap() {
  if (!map) return;
  markers.forEach((m) => m.remove());
  markers.length = 0;
  projectStore.projects.forEach((p) => {
    const el = createMarkerEl(p);
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([p.lng, p.lat])
      .addTo(map!);
    markers.push(marker);
  });
}

onMounted(async () => {
  await projectStore.loadProjects();
  marketStore.startPolling();

  if (!mapContainer.value) return;
  mapboxgl.accessToken = MAPBOX_TOKEN;
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: "mapbox://styles/mapbox/navigation-night-v1",
    center: [127.15, 37.24],
    zoom: 10,
    attributionControl: false,
    pitchWithRotate: false,
  });
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
  map.on("load", () => addMarkersToMap());
});

watch(() => projectStore.projects.length, () => {
  if (map && projectStore.projects.length > 0) addMarkersToMap();
});

onUnmounted(() => {
  markers.forEach((m) => m.remove());
  map?.remove();
  map = null;
});

// Photo URLs per project type for card thumbnails
const TYPE_IMAGE: Record<string, string> = {
  "태양광": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80&auto=format&fit=crop",
  "풍력": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&q=80&auto=format&fit=crop",
  "ESS": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&q=80&auto=format&fit=crop",
  "소수력": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80&auto=format&fit=crop",
  "연료전지": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&auto=format&fit=crop",
};

// Fallback overlay tint per type
const TYPE_TINT: Record<string, string> = {
  "태양광": "rgba(217, 119, 6, 0.35)",
  "풍력": "rgba(8, 145, 178, 0.35)",
  "ESS": "rgba(22, 163, 74, 0.35)",
  "소수력": "rgba(37, 99, 235, 0.35)",
  "연료전지": "rgba(109, 40, 217, 0.35)",
};
</script>

<template>
  <div class="dash">

    <!-- ═══ Left panel: project cards ═══ -->
    <div class="dash__left">

      <!-- Header -->
      <div class="dash__header">
        <h1 class="dash__title">C&I 재생에너지 사이트</h1>
        <div class="dash__header-stats">
          <span class="dash__header-stat">{{ projectStore.totalCount }}개 프로젝트</span>
          <span class="dash__header-sep">|</span>
          <span class="dash__header-stat">{{ projectStore.totalCapacityMw.toFixed(1) }} MW</span>
          <span class="dash__header-sep">|</span>
          <span class="dash__header-stat dash__header-stat--accent">평균 {{ projectStore.avgYield.toFixed(1) }}%</span>
        </div>
      </div>

      <!-- Unified search + filter panel -->
      <div class="dash__search-panel">
        <div class="dash__search-row">
          <IcoSearch class="dash__search-ico" :size="15" :strokeWidth="2" />
          <input
            v-model="searchQuery"
            type="text"
            class="dash__search-input"
            placeholder="프로젝트, 지역, 유형으로 검색..."
          />
          <button v-if="searchQuery" type="button" class="dash__search-clear" @click="searchQuery = ''">
            <IcoClose :size="12" :strokeWidth="2.5" />
          </button>
        </div>
        <div class="dash__search-divider"></div>
        <div class="dash__filter-row">
          <button
            v-for="cat in categories"
            :key="cat.key"
            type="button"
            class="dash__filter-chip"
            :class="{ 'dash__filter-chip--active': activeCategory === cat.key }"
            @click="activeCategory = cat.key"
          >
            <IcoSolar v-if="cat.icon === 'solar'" :size="13" :strokeWidth="2" />
            <IcoWind v-else-if="cat.icon === 'wind'" :size="13" :strokeWidth="2" />
            <IcoBattery v-else-if="cat.icon === 'battery'" :size="13" :strokeWidth="2" />
            {{ cat.label }}
          </button>
          <span class="dash__filter-count">{{ filteredProjects.length }}개</span>
        </div>
      </div>

      <!-- Market ticker (inline) -->
      <div class="dash__ticker">
        <div v-for="m in marketData" :key="m.label" class="dash__tick">
          <span class="dash__tick-label">{{ m.label }}</span>
          <span class="dash__tick-val">{{ m.value }}</span>
          <span class="dash__tick-change" :class="m.up ? 'dash__tick-change--up' : 'dash__tick-change--down'">
            {{ m.up ? '▲' : '▼' }}{{ typeof m.change === 'string' ? m.change.replace('-', '') : m.change }}
          </span>
        </div>
      </div>

      <!-- Project cards grid -->
      <div class="dash__grid">
        <div
          v-for="p in filteredProjects"
          :key="p.id"
          class="pcard"
          @click="selectProject(p)"
        >
          <!-- Thumbnail -->
          <div class="pcard__thumb">
            <img
              class="pcard__thumb-img"
              :src="TYPE_IMAGE[p.type] || TYPE_IMAGE['태양광']"
              :alt="p.type"
              loading="lazy"
            />
            <div class="pcard__thumb-overlay" :style="{ background: TYPE_TINT[p.type] || TYPE_TINT['태양광'] }"></div>
            <span class="pcard__badge" :class="`pcard__badge--${p.statusColor}`">{{ p.status }}</span>
            <span class="pcard__yield-badge">{{ p.expectedYield }}</span>
          </div>

          <!-- Body -->
          <div class="pcard__body">
            <h3 class="pcard__name">{{ p.name }}</h3>
            <div class="pcard__meta">
              <IcoMapPin :size="11" :strokeWidth="2" />
              <span>{{ p.location }}</span>
              <span class="pcard__meta-sep">|</span>
              <span>{{ p.capacity }}</span>
            </div>
            <div class="pcard__footer">
              <div class="pcard__progress">
                <div class="pcard__progress-bar">
                  <div class="pcard__progress-fill" :style="{ width: p.progress + '%' }"></div>
                </div>
                <span class="pcard__progress-pct">{{ p.progress }}%</span>
              </div>
              <button class="pcard__cta" @click.stop="goToProject(p.id)">
                상세 <IcoArrowRight :size="12" :strokeWidth="2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredProjects.length === 0" class="dash__empty">
        조건에 맞는 프로젝트가 없습니다.
      </div>
    </div>

    <!-- ═══ Right panel: map ═══ -->
    <div class="dash__right">
      <div ref="mapContainer" class="dash__map"></div>
      <div class="dash__map-legend">
        <span class="dash__map-lg dash__map-lg--solar">태양광</span>
        <span class="dash__map-lg dash__map-lg--wind">풍력</span>
        <span class="dash__map-lg dash__map-lg--battery">ESS</span>
      </div>
      <!-- Live badge -->
      <div class="dash__map-live">
        <span class="dash__map-live-dot"></span>
        {{ projectStore.totalCount }} sites
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
$accent: #4F6AF5;
$accent-light: #EEF2FF;
$text-primary: #0f172a;
$text-secondary: #475569;
$text-muted: #94a3b8;
$border: #e2e8f0;
$surface: #ffffff;
$bg: #f8fafc;

.dash {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 56px);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

// ═══ Left panel ═══
.dash__left {
  padding: 16px 18px 24px;
  overflow-y: auto;
  max-height: calc(100vh - 56px);

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

  @media (max-width: 1024px) { max-height: none; }
}

// Header
.dash__header { margin-bottom: 14px; }

.dash__title {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: $text-primary;
  margin: 0 0 4px;
}

.dash__header-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: $text-muted;
}

.dash__header-stat--accent { color: $accent; }
.dash__header-sep { color: $border; }

// Unified search + filter panel
.dash__search-panel {
  background: $surface;
  border: 1.5px solid $border;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 12px;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: $accent;
    box-shadow: 0 0 0 3px rgba($accent, 0.07);
  }
}

.dash__search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
}

.dash__search-ico {
  color: $text-muted;
  flex-shrink: 0;
}

.dash__search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13.5px;
  font-family: "Inter", sans-serif;
  color: $text-primary;
  background: transparent;
  min-width: 0;

  &::placeholder { color: $text-muted; }
}

.dash__search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  color: $text-muted;
  flex-shrink: 0;
  padding: 0;
  transition: background 0.15s;

  &:hover { background: #cbd5e1; }
}

.dash__search-divider {
  height: 1px;
  background: $border;
}

.dash__filter-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 10px;
  overflow-x: auto;

  &::-webkit-scrollbar { display: none; }
}

.dash__filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid $border;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 600;
  color: $text-secondary;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  font-family: "Inter", sans-serif;
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover { border-color: $accent; color: $accent; background: $accent-light; }

  &--active {
    border-color: $accent;
    background: $accent;
    color: #fff;
  }

  svg { flex-shrink: 0; }
}

.dash__filter-count {
  margin-left: auto;
  font-size: 10.5px;
  font-weight: 700;
  color: $text-muted;
  white-space: nowrap;
  flex-shrink: 0;
  padding-right: 2px;
}

// Market ticker
.dash__ticker {
  display: flex;
  gap: 0;
  background: $surface;
  border: 1px solid $border;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 14px;
}

.dash__tick {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 8px;
  font-size: 11px;
  font-weight: 600;
  border-right: 1px solid $border;

  &:last-child { border-right: none; }
}

.dash__tick-label { color: $text-muted; font-weight: 700; font-size: 10px; }
.dash__tick-val { color: $text-primary; font-weight: 800; font-variant-numeric: tabular-nums; }
.dash__tick-change {
  font-size: 10px; font-weight: 700;
  &--up { color: #16a34a; }
  &--down { color: #dc2626; }
}

// ═══ Project cards grid ═══
.dash__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 640px) { grid-template-columns: 1fr; }
}

.pcard {
  background: $surface;
  border: 1px solid $border;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;

  &:hover {
    border-color: $accent;
    box-shadow: 0 6px 24px rgba(79,106,245,0.1);
    transform: translateY(-2px);
  }
}

// Card thumbnail
.pcard__thumb {
  position: relative;
  height: 120px;
  overflow: hidden;
  background: #1e293b;
}

.pcard__thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;

  .pcard:hover & { transform: scale(1.05); }
}

.pcard__thumb-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.pcard__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  backdrop-filter: blur(4px);

  &--green { background: rgba(22,163,74,0.85); color: #fff; }
  &--amber { background: rgba(217,119,6,0.85); color: #fff; }
  &--blue { background: rgba(37,99,235,0.85); color: #fff; }
}

.pcard__yield-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 12px;
  font-weight: 900;
  color: #fff;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
  padding: 3px 10px;
  border-radius: 6px;
  font-variant-numeric: tabular-nums;
}

// Card body
.pcard__body {
  padding: 12px 14px 14px;
}

.pcard__name {
  font-size: 14px;
  font-weight: 800;
  color: $text-primary;
  margin: 0 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pcard__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: $text-muted;
  margin-bottom: 10px;

  svg { color: $text-muted; flex-shrink: 0; }
}

.pcard__meta-sep { color: $border; margin: 0 2px; }

.pcard__footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pcard__progress { flex: 1; display: flex; align-items: center; gap: 6px; }

.pcard__progress-bar {
  flex: 1;
  height: 5px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.pcard__progress-fill {
  height: 100%;
  background: $accent;
  border-radius: 3px;
  transition: width 0.4s;
}

.pcard__progress-pct {
  font-size: 10.5px;
  font-weight: 700;
  color: $text-muted;
  font-variant-numeric: tabular-nums;
}

.pcard__cta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 5px 10px;
  background: $accent;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover { background: #3b56d9; }
}

.dash__empty {
  text-align: center;
  padding: 48px 16px;
  color: $text-muted;
  font-size: 14px;
  grid-column: 1 / -1;
}

// ═══ Right panel: map ═══
.dash__right {
  position: sticky;
  top: 0;
  height: calc(100vh - 56px);
  border-left: 1px solid $border;

  @media (max-width: 1024px) {
    position: relative;
    height: 400px;
    border-left: none;
    border-top: 1px solid $border;
  }
}

.dash__map {
  width: 100%;
  height: 100%;
}

.dash__map-legend {
  position: absolute;
  bottom: 14px;
  left: 14px;
  display: flex;
  gap: 6px;
  z-index: 2;
}

.dash__map-lg {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
  padding: 5px 11px;
  border-radius: 20px;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &--solar::before { background: #f59e0b; }
  &--wind::before { background: #06b6d4; }
  &--battery::before { background: #22c55e; }
}

.dash__map-live {
  position: absolute;
  top: 14px;
  left: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(8px);
  padding: 6px 12px;
  border-radius: 20px;
  z-index: 2;
}

.dash__map-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  animation: livepulse 2s infinite;
}

@keyframes livepulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50% { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
}

// Transitions
.detail-slide-enter-active { transition: opacity 0.2s, transform 0.2s; }
.detail-slide-enter-from { opacity: 0; transform: translateY(10px); }
.detail-slide-leave-active { transition: opacity 0.15s; }
.detail-slide-leave-to { opacity: 0; }
</style>

<!-- Global (unscoped) styles for map markers -->
<style lang="scss">
.map-marker {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  transition: transform 0.2s;

  &:hover { transform: scale(1.3); }
  &--active { transform: scale(1.4); }

  &__dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2.5px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  &[data-type="solar"] .map-marker__dot { background: #f59e0b; }
  &[data-type="wind"] .map-marker__dot { background: #06b6d4; }
  &[data-type="battery"] .map-marker__dot { background: #22c55e; }
}
</style>
