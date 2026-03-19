<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { IcoSearch, IcoClose, IcoMapPin, IcoLightning, IcoInfo } from "@/components/icons";
import { IcoSolar, IcoWind } from "@/components/icons";
import { useMarketStore } from "@/stores/market-store";

const marketStore = useMarketStore();
onMounted(() => { marketStore.startPolling(); });
import {
  FACILITIES_DATA,
  CONNECTIONS_DATA,
  type Facility,
} from "@/composables/useSolarFacilityCanvas";

const selectedId = ref<string | null>(null);
const filter = ref<"all" | "online" | "offline">("all");
const searchQuery = ref("");
const regionFilter = ref("전국");

// Derive unique 시/도 list from data
const regions = computed(() => {
  const seen = new Set<string>();
  FACILITIES_DATA.forEach((f) => { if (f.region) seen.add(f.region); });
  return ["전국", ...Array.from(seen).sort()];
});

const filteredFacilities = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return FACILITIES_DATA.filter((f) => {
    const statusOk =
      filter.value === "all" || f.status === filter.value;
    const regionOk =
      regionFilter.value === "전국" || f.region === regionFilter.value;
    const queryOk =
      !q ||
      f.name.toLowerCase().includes(q) ||
      (f.region ?? "").toLowerCase().includes(q) ||
      (f.city ?? "").toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q);
    return statusOk && regionOk && queryOk;
  });
});

function setFilter(f: "all" | "online" | "offline") {
  filter.value = f;
}

function clearSearch() {
  searchQuery.value = "";
}

function selectFacility(f: Facility) {
  selectedId.value = f.id;
}

function facilityEmoji(type: string) {
  const m: Record<string, string> = {
    farm: "🟦",
    rooftop: "🏛",
    battery: "🔋",
    consumer: "🏭",
    grid: "🔌",
  };
  return m[type] ?? "•";
}

// ── SVG diagram layout ───────────────────────────────────────────────────────
// Fixed positions scaled to a 860×480 viewBox
const NODE_W = 110;
const NODE_H = 54;

interface DiagramNode {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  color: string;
  textColor: string;
  status: string;
}

const DIAGRAM_NODES: DiagramNode[] = [
  // Row 1 — generators
  { id: "SF-001", label: "태양광 발전소 1호", sub: "+8.4 MW",   x: 40,  y: 30,  color: "#dbeafe", textColor: "#1e40af", status: "online"  },
  { id: "SF-002", label: "태양광 발전소 2호", sub: "+6.2 MW",   x: 190, y: 30,  color: "#dbeafe", textColor: "#1e40af", status: "online"  },
  { id: "SF-003", label: "옥상 태양광 A동",   sub: "+1.8 MW",   x: 340, y: 30,  color: "#dbeafe", textColor: "#1e40af", status: "online"  },
  { id: "SF-004", label: "옥상 태양광 B동",   sub: "+0.4 MW",   x: 490, y: 30,  color: "#fef9c3", textColor: "#854d0e", status: "standby" },
  // Row 2 — hub
  { id: "IN-001", label: "인버터 허브",       sub: "98% eff",   x: 265, y: 175, color: "#ede9fe", textColor: "#5b21b6", status: "online"  },
  // Row 2 — storage & grid
  { id: "BS-001", label: "ESS 1호기",         sub: "SOC 72%",   x: 490, y: 175, color: "#dcfce7", textColor: "#14532d", status: "online"  },
  { id: "BS-002", label: "ESS 2호기",         sub: "SOC 10%",   x: 640, y: 175, color: "#fee2e2", textColor: "#7f1d1d", status: "offline" },
  { id: "GS-001", label: "북부 계통 변전소",  sub: "계통 연계", x: 710, y: 30,  color: "#d1fae5", textColor: "#065f46", status: "online"  },
  // Row 3 — consumers
  { id: "FC-001", label: "산업단지 공장",     sub: "−9.2 MW",   x: 115, y: 340, color: "#f1f5f9", textColor: "#334155", status: "online"  },
  { id: "DC-001", label: "데이터 센터",       sub: "−5.8 MW",   x: 340, y: 340, color: "#f1f5f9", textColor: "#334155", status: "online"  },
];

const idMap = Object.fromEntries(DIAGRAM_NODES.map((n) => [n.id, n]));

function cx(n: DiagramNode) { return n.x + NODE_W / 2; }
function cy(n: DiagramNode) { return n.y + NODE_H / 2; }

interface EdgePath {
  id: string;
  d: string;
  active: boolean;
  mx: number;
  my: number;
}

const edges = computed<EdgePath[]>(() =>
  CONNECTIONS_DATA.map(([srcId, tgtId]) => {
    const s = idMap[srcId];
    const t = idMap[tgtId];
    if (!s || !t) return null as unknown as EdgePath;

    const sx = cx(s), sy = cy(s);
    const tx = cx(t), ty = cy(t);

    // Exit / entry point on node edges
    const dx = tx - sx, dy = ty - sy;
    let x1 = sx, y1 = sy, x2 = tx, y2 = ty;
    if (Math.abs(dy) > Math.abs(dx) * 0.8) {
      y1 = dy > 0 ? s.y + NODE_H : s.y;
      x1 = sx;
      y2 = dy > 0 ? t.y : t.y + NODE_H;
      x2 = tx;
    } else {
      x1 = dx > 0 ? s.x + NODE_W : s.x;
      y1 = sy;
      x2 = dx > 0 ? t.x : t.x + NODE_W;
      y2 = ty;
    }

    // Simple L-bend path
    let d: string;
    if (Math.abs(x1 - x2) < 4) {
      d = `M${x1},${y1} L${x2},${y2}`;
    } else if (Math.abs(y1 - y2) < 4) {
      d = `M${x1},${y1} L${x2},${y2}`;
    } else {
      const midY = (y1 + y2) / 2;
      const midX = (x1 + x2) / 2;
      if (Math.abs(dy) > Math.abs(dx) * 0.8) {
        d = `M${x1},${y1} L${x1},${midY} L${x2},${midY} L${x2},${y2}`;
      } else {
        d = `M${x1},${y1} L${midX},${y1} L${midX},${y2} L${x2},${y2}`;
      }
    }

    const active = s.status === "online" && t.status !== "offline";
    return {
      id: `${srcId}-${tgtId}`,
      d,
      active,
      mx: (x1 + x2) / 2,
      my: (y1 + y2) / 2,
    };
  }).filter(Boolean)
);

function statusColor(status: string) {
  if (status === "online")  return "#22c55e";
  if (status === "standby") return "#eab308";
  return "#ef4444";
}

// ── SMP / REC Price Timeline (24h) ──
const timeLabels = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"];

const smpPrices = [85, 82, 78, 76, 80, 95, 112, 125, 130, 128, 135, 142, 148, 145, 138, 132, 120, 115, 125, 135, 128, 118, 105, 92];
const recPrices = [42.2, 42.1, 42.0, 42.0, 42.1, 42.3, 42.8, 43.2, 43.5, 43.4, 43.8, 44.2, 44.5, 44.3, 44.0, 43.6, 43.2, 43.0, 43.3, 43.8, 43.5, 43.1, 42.8, 42.4];

const chartW = 520;
const chartH = 100;

function priceToPath(prices: number[], minV: number, maxV: number): string {
  const stepX = chartW / (prices.length - 1);
  return prices.map((v, i) => {
    const x = i * stepX;
    const y = chartH - ((v - minV) / (maxV - minV)) * (chartH - 10) - 5;
    return `${x},${y}`;
  }).join(" ");
}

const smpMin = Math.min(...smpPrices) - 5;
const smpMax = Math.max(...smpPrices) + 5;
const smpPath = computed(() => priceToPath(smpPrices, smpMin, smpMax));

const recMin = Math.min(...recPrices) - 0.5;
const recMax = Math.max(...recPrices) + 0.5;
const recPath = computed(() => priceToPath(recPrices, recMin, recMax));

const smpCurrent = smpPrices[smpPrices.length - 1];
const recCurrent = recPrices[recPrices.length - 1];
const smpHigh = Math.max(...smpPrices);
const smpLow = Math.min(...smpPrices);
const recHigh = Math.max(...recPrices);
const recLow = Math.min(...recPrices);

interface TimelineEvent {
  hour: number;
  label: string;
  type: "alert" | "config" | "market";
}
const timelineEvents: TimelineEvent[] = [
  { hour: 7, label: "SMP 급등 시작", type: "alert" },
  { hour: 12, label: "피크 가격 도달", type: "market" },
  { hour: 18, label: "야간 전환", type: "config" },
];

// ── Peak Demand Bar Chart (24h) ──
const demandData = [28, 22, 18, 15, 14, 20, 35, 58, 75, 82, 88, 92, 95, 93, 85, 78, 70, 65, 72, 80, 76, 62, 48, 35];
const peakStart = 9;
const peakEnd = 16;

// ── Generation Heatmap (24h blocks) ──
const heatmapSolar = [0, 0, 0, 0, 0, 5, 25, 55, 75, 85, 92, 95, 98, 95, 88, 72, 45, 20, 5, 0, 0, 0, 0, 0];
const heatmapWind = [65, 60, 55, 58, 62, 70, 68, 52, 45, 40, 38, 35, 32, 35, 42, 48, 55, 65, 72, 78, 82, 80, 75, 70];

function heatColor(val: number, type: "solar" | "wind"): string {
  if (type === "solar") {
    if (val === 0) return "#f1f5f9";
    if (val < 25) return "#fef3c7";
    if (val < 50) return "#fcd34d";
    if (val < 75) return "#f59e0b";
    return "#d97706";
  }
  if (val < 25) return "#e0f2fe";
  if (val < 50) return "#7dd3fc";
  if (val < 75) return "#0ea5e9";
  return "#0369a1";
}

const showTimeline = ref(true);
</script>

<template>
  <div class="solar-facility">
    <div class="solar-facility__main">
      <!-- Left sidebar -->
      <aside class="solar-facility__sidebar">
        <!-- Header -->
        <div class="solar-facility__sidebar-head">
          <span class="solar-facility__sidebar-title">시설 목록</span>
          <span class="sb-count">{{ filteredFacilities.length }} / {{ FACILITIES_DATA.length }}</span>
        </div>

        <!-- Search input -->
        <div class="sb-search">
          <IcoSearch class="sb-search__icon" :size="14" :strokeWidth="2.5" />
          <input
            v-model="searchQuery"
            type="text"
            class="sb-search__input"
            placeholder="이름, 지역, ID 검색..."
            autocomplete="off"
            spellcheck="false"
          />
          <button v-if="searchQuery" class="sb-search__clear" @click="clearSearch" aria-label="지우기">
            <IcoClose :size="12" :strokeWidth="2.5" />
          </button>
        </div>

        <!-- Region filter (시/도) -->
        <div class="sb-region">
          <div class="sb-region__label">
            <IcoMapPin :size="11" :strokeWidth="2.5" />
            지역 (시/도)
          </div>
          <div class="sb-region__chips">
            <button
              v-for="r in regions"
              :key="r"
              type="button"
              class="sb-region__chip"
              :class="{ 'sb-region__chip--active': regionFilter === r }"
              @click="regionFilter = r"
            >{{ r }}</button>
          </div>
        </div>

        <!-- Status filter -->
        <div class="solar-facility__filters">
          <button
            type="button"
            class="solar-facility__filter"
            :class="{ 'solar-facility__filter--active': filter === 'all' }"
            @click="setFilter('all')"
          >전체</button>
          <button
            type="button"
            class="solar-facility__filter"
            :class="{ 'solar-facility__filter--active': filter === 'online' }"
            @click="setFilter('online')"
          ><span class="dot dot--green"></span>온라인</button>
          <button
            type="button"
            class="solar-facility__filter"
            :class="{ 'solar-facility__filter--active': filter === 'offline' }"
            @click="setFilter('offline')"
          ><span class="dot dot--red"></span>오프라인</button>
        </div>

        <!-- Empty state -->
        <div v-if="filteredFacilities.length === 0" class="sb-empty">
          <IcoSearch :size="28" :strokeWidth="1.5" />
          <span>검색 결과 없음</span>
          <button class="sb-empty__reset" @click="searchQuery = ''; regionFilter = '전국'; filter = 'all'">필터 초기화</button>
        </div>

        <div class="solar-facility__list">
          <button
            v-for="f in filteredFacilities"
            :key="f.id"
            type="button"
            class="solar-facility__card"
            :class="{ 'solar-facility__card--selected': selectedId === f.id }"
            @click="selectFacility(f)"
          >
            <div class="solar-facility__card-head">
              <div>
                <div class="solar-facility__card-name"><IcoLightning v-if="f.type === 'inverter'" :size="14" /><template v-else>{{ facilityEmoji(f.type) }}</template> {{ f.name }}</div>
                <div class="solar-facility__card-id">{{ f.id }}</div>
                <div v-if="f.city" class="solar-facility__card-loc">
                  <IcoMapPin :size="9" :strokeWidth="2.5" />
                  {{ f.city }}
                </div>
              </div>
              <span
                class="solar-facility__card-status"
                :class="{
                  'solar-facility__card-status--online': f.status === 'online',
                  'solar-facility__card-status--offline': f.status === 'offline',
                  'solar-facility__card-status--standby': f.status === 'standby',
                }"
              >
                {{ f.status }}
              </span>
            </div>
            <template v-if="f.eff > 0">
              <div class="solar-facility__bar-label">
                <span>Efficiency</span>
                <span>{{ f.eff }}%</span>
              </div>
              <div class="solar-facility__bar-track">
                <div
                  class="solar-facility__bar-fill"
                  :class="{ 'solar-facility__bar-fill--warn': f.eff < 70 }"
                  :style="{ width: f.eff + '%' }"
                ></div>
              </div>
            </template>
            <div class="solar-facility__card-stats">
              <div class="solar-facility__stat">
                Output <span>{{ f.output > 0 ? "+" : "" }}{{ f.output.toFixed(1) }} MW</span>
              </div>
              <div v-if="f.panels > 0" class="solar-facility__stat">
                Panels <span>{{ f.panels }}</span>
              </div>
            </div>
          </button>
        </div>
      </aside>

      <!-- Main area: key metrics at top, then diagram -->
      <div class="solar-facility__map-area">
        <!-- Key metrics bar (top) -->
        <div class="solar-facility__bottom-bar">
          <div class="solar-facility__widget">
            <div class="solar-facility__widget-head">
              <span class="solar-facility__widget-title">Total Generation</span>
              <span class="solar-facility__widget-up">↑ 4.2%</span>
            </div>
            <div class="solar-facility__widget-value">24.7 <span class="solar-facility__widget-unit">MW</span></div>
          </div>
          <div class="solar-facility__widget">
            <div class="solar-facility__widget-head">
              <span class="solar-facility__widget-title">Grid Load Satisfied</span>
              <span class="solar-facility__widget-up">↑ 1.8%</span>
            </div>
            <div class="solar-facility__widget-value">18.3 <span class="solar-facility__widget-unit">MW</span></div>
          </div>
          <div class="solar-facility__widget">
            <div class="solar-facility__widget-head">
              <span class="solar-facility__widget-title">Battery Stored</span>
              <span class="solar-facility__widget-flat">→ 0.0%</span>
            </div>
            <div class="solar-facility__widget-value">6.4 <span class="solar-facility__widget-unit">MWh</span></div>
          </div>
          <div class="solar-facility__widget">
            <div class="solar-facility__widget-head">
              <span class="solar-facility__widget-title">CO₂ Offset Today</span>
              <span class="solar-facility__widget-up">↑ 2.1%</span>
            </div>
            <div class="solar-facility__widget-value">12.1 <span class="solar-facility__widget-unit">t</span></div>
          </div>
        </div>

        <div class="diagram-wrap">
          <svg
            class="diagram-svg"
            viewBox="0 0 860 440"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <!-- Arrow marker active — smaller tip -->
              <marker id="arrow-active" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
                <path d="M0,0.5 L0,4.5 L5,2.5 z" fill="#22c55e" />
              </marker>
              <!-- Arrow marker inactive — smaller tip -->
              <marker id="arrow-inactive" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto">
                <path d="M0,0.5 L0,4.5 L5,2.5 z" fill="#cbd5e1" />
              </marker>
            </defs>

            <!-- Background -->
            <rect width="860" height="440" rx="12" fill="#f8fafc" />

            <!-- Grid lines -->
            <g stroke="#e2e8f0" stroke-width="1">
              <line v-for="x in [172, 344, 516, 688]" :key="'vg'+x" :x1="x" y1="0" :x2="x" y2="440" />
              <line v-for="y in [110, 220, 330]" :key="'hg'+y" x1="0" :y1="y" x2="860" :y2="y" />
            </g>

            <!-- Row labels -->
            <text x="10" y="62"  font-size="9" fill="#94a3b8" font-family="DM Sans, sans-serif" font-weight="600" text-anchor="start">발전</text>
            <text x="10" y="207" font-size="9" fill="#94a3b8" font-family="DM Sans, sans-serif" font-weight="600" text-anchor="start">변환 · 저장</text>
            <text x="10" y="372" font-size="9" fill="#94a3b8" font-family="DM Sans, sans-serif" font-weight="600" text-anchor="start">수요</text>

            <!-- Edges -->
            <g>
              <path
                v-for="e in edges"
                :key="e.id"
                :d="e.d"
                fill="none"
                :stroke="e.active ? '#22c55e' : '#cbd5e1'"
                stroke-width="1.2"
                :stroke-dasharray="e.active ? 'none' : '4 3'"
                :marker-end="e.active ? 'url(#arrow-active)' : 'url(#arrow-inactive)'"
              />
            </g>

            <!-- Nodes -->
            <g v-for="node in DIAGRAM_NODES" :key="node.id">
              <!-- Shadow -->
              <rect
                :x="node.x + 2"
                :y="node.y + 2"
                :width="NODE_W"
                :height="NODE_H"
                rx="8"
                fill="rgba(0,0,0,0.07)"
              />
              <!-- Box -->
              <rect
                :x="node.x"
                :y="node.y"
                :width="NODE_W"
                :height="NODE_H"
                rx="8"
                :fill="node.color"
                :stroke="selectedId === node.id ? '#6366f1' : 'transparent'"
                stroke-width="2"
                class="diagram-node"
                @click="selectedId = node.id === selectedId ? null : node.id"
              />
              <!-- Status dot -->
              <circle
                :cx="node.x + NODE_W - 10"
                :cy="node.y + 10"
                r="4"
                :fill="statusColor(node.status)"
              />
              <!-- Label -->
              <text
                :x="node.x + NODE_W / 2"
                :y="node.y + 22"
                font-size="10"
                font-weight="600"
                font-family="DM Sans, sans-serif"
                text-anchor="middle"
                :fill="node.textColor"
              >{{ node.label }}</text>
              <!-- Sub -->
              <text
                :x="node.x + NODE_W / 2"
                :y="node.y + 37"
                font-size="9"
                font-family="Space Mono, monospace"
                text-anchor="middle"
                :fill="node.textColor"
                opacity="0.75"
              >{{ node.sub }}</text>
              <!-- ID chip -->
              <text
                :x="node.x + 8"
                :y="node.y + NODE_H - 6"
                font-size="7.5"
                font-family="Space Mono, monospace"
                :fill="node.textColor"
                opacity="0.55"
              >{{ node.id }}</text>
            </g>
          </svg>
        </div>

        <!-- ── KPX 전력 정보 ── -->
        <div class="kpx-section">
          <div class="kpx-section__head">
            <span class="kpx-section__title">전력 시장 현황</span>
            <span class="kpx-section__src">출처: 한국전력거래소 (KPX) · 2026.02.26</span>
            <span class="kpx-section__status">● 정상</span>
          </div>

          <div class="kpx-grid">

            <!-- 실시간 계통 현황 -->
            <div class="kpx-card">
              <div class="kpx-card__label">실시간 계통 현황</div>
              <div class="kpx-card__rows">
                <div class="kpx-row">
                  <span class="kpx-row__key">공급 가능 용량</span>
                  <span class="kpx-row__val">87,936 <span class="kpx-row__unit">MW</span></span>
                </div>
                <div class="kpx-row">
                  <span class="kpx-row__key">현재 계통 부하</span>
                  <span class="kpx-row__val">60,807 <span class="kpx-row__unit">MW</span></span>
                </div>
                <div class="kpx-row">
                  <span class="kpx-row__key">예비 용량</span>
                  <span class="kpx-row__val kpx-row__val--up">27,129 <span class="kpx-row__unit">MW</span></span>
                </div>
                <div class="kpx-row kpx-row--divider">
                  <span class="kpx-row__key">예비율</span>
                  <span class="kpx-row__val kpx-row__val--accent">44.61<span class="kpx-row__unit">%</span></span>
                </div>
              </div>
              <!-- Reserve bar -->
              <div class="kpx-bar-wrap">
                <div class="kpx-bar-labels">
                  <span>부하</span>
                  <span>예비</span>
                </div>
                <div class="kpx-bar-track">
                  <div class="kpx-bar-fill kpx-bar-fill--load" style="width: 69%"></div>
                  <div class="kpx-bar-fill kpx-bar-fill--reserve" style="width: 31%"></div>
                </div>
              </div>
              <!-- Peak forecast -->
              <div class="kpx-card__sub-label">금일 최대 수요 예측</div>
              <div class="kpx-row">
                <span class="kpx-row__key">예측 피크</span>
                <span class="kpx-row__val">74,000 <span class="kpx-row__unit">MW</span></span>
              </div>
              <div class="kpx-row">
                <span class="kpx-row__key">예상 시간대</span>
                <span class="kpx-row__val">08:00 – 09:00</span>
              </div>
              <div class="kpx-row">
                <span class="kpx-row__key">공급 예비율</span>
                <span class="kpx-row__val kpx-row__val--up">23<span class="kpx-row__unit">%</span></span>
              </div>
            </div>

            <!-- SMP (실시간) -->
            <div class="kpx-card">
              <div class="kpx-card__label">계통 한계 가격 (SMP)</div>
              <div class="kpx-card__sub-label" style="margin-top:0; margin-bottom: 10px;">{{ marketStore.dateDisplay }} 기준</div>

              <div class="kpx-smp-block">
                <div class="kpx-smp-region">
                  <span class="kpx-smp-region__name">육지</span>
                  <div class="kpx-smp-vals">
                    <div class="kpx-smp-row">
                      <span class="kpx-smp-row__lbl">평균</span>
                      <span class="kpx-smp-row__val kpx-smp-row__val--main">{{ marketStore.smpDisplay.landAvg }}</span>
                      <span class="kpx-smp-row__unit">원/kWh</span>
                    </div>
                    <div class="kpx-smp-row">
                      <span class="kpx-smp-row__lbl">최고</span>
                      <span class="kpx-smp-row__val">{{ marketStore.smpDisplay.landMax }}</span>
                      <span class="kpx-smp-row__unit">원/kWh</span>
                    </div>
                    <div class="kpx-smp-row">
                      <span class="kpx-smp-row__lbl">최저</span>
                      <span class="kpx-smp-row__val">{{ marketStore.smpDisplay.landMin }}</span>
                      <span class="kpx-smp-row__unit">원/kWh</span>
                    </div>
                  </div>
                </div>

                <div class="kpx-smp-divider"></div>

                <div class="kpx-smp-region">
                  <span class="kpx-smp-region__name">제주 <span class="kpx-smp-region__tag">DAM</span></span>
                  <div class="kpx-smp-vals">
                    <div class="kpx-smp-row">
                      <span class="kpx-smp-row__lbl">평균</span>
                      <span class="kpx-smp-row__val kpx-smp-row__val--main">{{ marketStore.smpDisplay.jejuAvg }}</span>
                      <span class="kpx-smp-row__unit">원/kWh</span>
                    </div>
                    <div class="kpx-smp-row">
                      <span class="kpx-smp-row__lbl">최고</span>
                      <span class="kpx-smp-row__val">{{ marketStore.smpDisplay.jejuMax }}</span>
                      <span class="kpx-smp-row__unit">원/kWh</span>
                    </div>
                    <div class="kpx-smp-row">
                      <span class="kpx-smp-row__lbl">최저</span>
                      <span class="kpx-smp-row__val">{{ marketStore.smpDisplay.jejuMin }}</span>
                      <span class="kpx-smp-row__unit">원/kWh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- REC (실시간) -->
            <div class="kpx-card">
              <div class="kpx-card__label">REC 거래 현황</div>
              <div class="kpx-card__sub-label" style="margin-top:0; margin-bottom: 14px;">{{ marketStore.dateDisplay }} 현물 시장</div>

              <div class="kpx-rec-big">
                <span class="kpx-rec-big__label">평균 가격</span>
                <span class="kpx-rec-big__val">{{ marketStore.recDisplay.avgPrice }}</span>
                <span class="kpx-rec-big__unit">원/REC</span>
              </div>

              <div class="kpx-row kpx-row--mt">
                <span class="kpx-row__key">거래 종가</span>
                <span class="kpx-row__val">{{ marketStore.recDisplay.closePrice }} <span class="kpx-row__unit">원/REC</span></span>
              </div>
              <div class="kpx-row">
                <span class="kpx-row__key">거래량</span>
                <span class="kpx-row__val">{{ marketStore.recDisplay.volume }} <span class="kpx-row__unit">REC</span></span>
              </div>

              <!-- REC price bar -->
              <div class="kpx-bar-wrap" style="margin-top: 14px;">
                <div class="kpx-bar-labels">
                  <span>종가 {{ marketStore.recDisplay.closePrice }}</span>
                  <span>평균 {{ marketStore.recDisplay.avgPrice }}</span>
                </div>
                <div class="kpx-bar-track">
                  <div class="kpx-bar-fill kpx-bar-fill--rec" :style="{ width: marketStore.rec ? Math.min(100, Math.round(marketStore.rec.closePrice / marketStore.rec.avgPrice * 100)) + '%' : '82%' }"></div>
                </div>
              </div>

              <div class="kpx-rec-note">
                REC 1개 = 신재생에너지 1 MWh 발전 인증
              </div>
            </div>

          </div>
        </div>

        <!-- ═══ SMP/REC Price Timeline + Peak Demand ═══ -->
        <div v-if="showTimeline" class="tl">
          <div class="tl__head">
            <h2 class="tl__head-title">
              <IcoLightning :size="14" :strokeWidth="2" />
              시장 가격 타임라인
            </h2>
            <span class="tl__head-period">최근 24시간</span>
            <button class="tl__head-close" @click="showTimeline = false">
              <IcoClose :size="12" :strokeWidth="2.5" />
            </button>
          </div>

          <!-- SMP / REC Price Line Chart -->
          <div class="tl__chart-card">
            <div class="tl__chart-header">
              <div class="tl__chart-legends">
                <span class="tl__legend"><span class="tl__legend-dot tl__legend-dot--smp"></span>SMP (원/kWh)</span>
                <span class="tl__legend"><span class="tl__legend-dot tl__legend-dot--rec"></span>REC (천원/REC)</span>
              </div>
              <div class="tl__chart-stats">
                <span class="tl__stat">
                  <span class="tl__stat-label">SMP</span>
                  <span class="tl__stat-val">{{ smpCurrent }}원</span>
                  <span class="tl__stat-range">{{ smpLow }}~{{ smpHigh }}</span>
                </span>
                <span class="tl__stat">
                  <span class="tl__stat-label">REC</span>
                  <span class="tl__stat-val">{{ recCurrent.toFixed(1) }}천원</span>
                  <span class="tl__stat-range">{{ recLow.toFixed(1) }}~{{ recHigh.toFixed(1) }}</span>
                </span>
              </div>
            </div>

            <div class="tl__chart-wrap">
              <svg :viewBox="`0 0 ${chartW} ${chartH}`" preserveAspectRatio="none" class="tl__svg">
                <line v-for="i in 5" :key="'g'+i" x1="0" :y1="chartH * i / 5" :x2="chartW" :y2="chartH * i / 5" stroke="#e2e8f0" stroke-width="0.5" stroke-dasharray="4,4" />
                <rect :x="(peakStart / 24) * chartW" y="0" :width="((peakEnd - peakStart) / 24) * chartW" :height="chartH" fill="rgba(245, 158, 11, 0.06)" />
                <line :x1="(peakStart / 24) * chartW" y1="0" :x2="(peakStart / 24) * chartW" :y2="chartH" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3" opacity="0.5" />
                <line :x1="(peakEnd / 24) * chartW" y1="0" :x2="(peakEnd / 24) * chartW" :y2="chartH" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3" opacity="0.5" />
                <polygon :points="`0,${chartH} ${smpPath} ${chartW},${chartH}`" fill="url(#smpGrad)" opacity="0.3" />
                <polyline :points="smpPath" fill="none" stroke="#a855f7" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
                <polygon :points="`0,${chartH} ${recPath} ${chartW},${chartH}`" fill="url(#recGrad)" opacity="0.3" />
                <polyline :points="recPath" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
                <defs>
                  <linearGradient id="smpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#a855f7" stop-opacity="0.4" />
                    <stop offset="100%" stop-color="#a855f7" stop-opacity="0" />
                  </linearGradient>
                  <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.4" />
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <g v-for="ev in timelineEvents" :key="ev.hour">
                  <circle :cx="(ev.hour / 24) * chartW" cy="8" r="4"
                    :fill="ev.type === 'alert' ? '#ef4444' : ev.type === 'market' ? '#f59e0b' : '#22c55e'" stroke="#fff" stroke-width="1.5" />
                </g>
              </svg>
              <div class="tl__time-labels">
                <span v-for="t in timeLabels" :key="t">{{ t }}시</span>
              </div>
              <div class="tl__peak-label" :style="{ left: ((peakStart + (peakEnd - peakStart) / 2) / 24) * 100 + '%' }">
                피크 시간대
              </div>
            </div>

            <div class="tl__events">
              <span class="tl__event-label">Events</span>
              <div class="tl__event-markers">
                <span v-for="ev in timelineEvents" :key="ev.hour" class="tl__event-tag"
                  :class="{ 'tl__event-tag--alert': ev.type === 'alert', 'tl__event-tag--market': ev.type === 'market', 'tl__event-tag--config': ev.type === 'config' }"
                >{{ ev.label }} ({{ ev.hour }}시)</span>
              </div>
            </div>
          </div>

          <!-- Peak Demand Bar Chart -->
          <div class="tl__chart-card">
            <div class="tl__chart-header">
              <div class="tl__chart-legends">
                <span class="tl__legend"><span class="tl__legend-dot tl__legend-dot--demand"></span>전력 수요 (%)</span>
              </div>
              <div class="tl__chart-stats">
                <span class="tl__stat">
                  <span class="tl__stat-label">피크</span>
                  <span class="tl__stat-val">{{ Math.max(...demandData) }}%</span>
                </span>
                <span class="tl__stat">
                  <span class="tl__stat-label">피크 시간</span>
                  <span class="tl__stat-val tl__stat-val--peak">{{ peakStart }}:00 ~ {{ peakEnd }}:00</span>
                </span>
              </div>
            </div>
            <div class="tl__bar-wrap">
              <div class="tl__bar-chart">
                <div
                  v-for="(val, i) in demandData"
                  :key="i"
                  class="tl__bar"
                  :class="{ 'tl__bar--peak': i >= peakStart && i < peakEnd }"
                  :style="{ height: val + '%' }"
                  :title="`${String(i).padStart(2, '0')}:00 — ${val}%`"
                ></div>
              </div>
              <div class="tl__bar-peak-zone" :style="{
                left: (peakStart / 24) * 100 + '%',
                width: ((peakEnd - peakStart) / 24) * 100 + '%',
              }"></div>
              <div class="tl__time-labels">
                <span v-for="t in timeLabels" :key="t">{{ t }}시</span>
              </div>
              <div class="tl__peak-marker tl__peak-marker--start" :style="{ left: (peakStart / 24) * 100 + '%' }">
                <span class="tl__peak-marker-dot"></span>
                {{ peakStart }}:00
              </div>
              <div class="tl__peak-marker tl__peak-marker--end" :style="{ left: (peakEnd / 24) * 100 + '%' }">
                <span class="tl__peak-marker-dot"></span>
                {{ peakEnd }}:00
              </div>
            </div>
          </div>

          <!-- Generation Heatmap -->
          <div class="tl__chart-card">
            <div class="tl__chart-header">
              <div class="tl__chart-legends">
                <span class="tl__legend">발전량 히트맵 (Capacity Factor)</span>
              </div>
            </div>
            <div class="tl__heatmap">
              <div class="tl__heatmap-row">
                <span class="tl__heatmap-label">
                  <IcoSolar :size="10" :strokeWidth="2" /> 태양광
                </span>
                <div class="tl__heatmap-cells">
                  <div
                    v-for="(val, i) in heatmapSolar"
                    :key="'s'+i"
                    class="tl__heatmap-cell"
                    :style="{ background: heatColor(val, 'solar') }"
                    :title="`${String(i).padStart(2, '0')}:00 — ${val}%`"
                  ></div>
                </div>
              </div>
              <div class="tl__heatmap-row">
                <span class="tl__heatmap-label">
                  <IcoWind :size="10" :strokeWidth="2" /> 풍력
                </span>
                <div class="tl__heatmap-cells">
                  <div
                    v-for="(val, i) in heatmapWind"
                    :key="'w'+i"
                    class="tl__heatmap-cell"
                    :style="{ background: heatColor(val, 'wind') }"
                    :title="`${String(i).padStart(2, '0')}:00 — ${val}%`"
                  ></div>
                </div>
              </div>
              <div class="tl__heatmap-peak" :style="{
                left: `calc(52px + ${(peakStart / 24) * 100}% * (1 - 52 / 100))`,
                width: `calc(${((peakEnd - peakStart) / 24) * 100}% * (1 - 52 / 100))`,
              }"></div>
              <div class="tl__time-labels" style="margin-left: 52px;">
                <span v-for="t in timeLabels" :key="t">{{ t }}시</span>
              </div>
            </div>
            <div class="tl__heatmap-legends">
              <IcoInfo :size="12" :strokeWidth="2" />
              <span class="tl__heatmap-scale">
                <span class="tl__heatmap-scale-block" style="background: #fef3c7"></span>
                <span class="tl__heatmap-scale-block" style="background: #fcd34d"></span>
                <span class="tl__heatmap-scale-block" style="background: #f59e0b"></span>
                <span class="tl__heatmap-scale-block" style="background: #d97706"></span>
                태양광
              </span>
              <span class="tl__heatmap-scale">
                <span class="tl__heatmap-scale-block" style="background: #e0f2fe"></span>
                <span class="tl__heatmap-scale-block" style="background: #7dd3fc"></span>
                <span class="tl__heatmap-scale-block" style="background: #0ea5e9"></span>
                <span class="tl__heatmap-scale-block" style="background: #0369a1"></span>
                풍력
              </span>
            </div>
          </div>
        </div>

        <button v-if="!showTimeline" class="tl__show-btn" @click="showTimeline = true">
          <IcoLightning :size="12" :strokeWidth="2" />
          시장 타임라인 보기
        </button>

      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables/spacing" as sp;
@use "@/assets/scss/variables/layout" as layout-vars;

.solar-facility {
  --sg-bg: #f1f5f9;
  --sg-surface: #ffffff;
  --sg-surface2: #f5f8f6;
  --sg-border: #e2e8f0;
  --sg-text: #1a2420;
  --sg-text-muted: #7a9088;
  --sg-green: #22c55e;
  --sg-green-dark: #15803d;
  --sg-red: #ef4444;
  --sg-blue: #3b82f6;
  --sg-solar: #eab308;
  --sg-solar-dark: #a16207;
  --sg-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);

  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--sg-bg);
  color: var(--sg-text);
}

.solar-facility__main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
.solar-facility__sidebar {
  width: 260px;
  background: var(--sg-surface);
  border-right: 1px solid var(--sg-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.solar-facility__sidebar-head {
  padding: sp.$space-4 sp.$space-4 sp.$space-3;
  border-bottom: 1px solid var(--sg-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.solar-facility__sidebar-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--sg-text-muted);
}

.sb-count {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--sg-text-muted);
  background: #f1f5f9;
  border-radius: 20px;
  padding: 2px 8px;
}

// ── Search input ────────────────────────────────────────────────────────────
.sb-search {
  display: flex;
  align-items: center;
  gap: sp.$space-2;
  margin: 0 sp.$space-3 sp.$space-2;
  background: #f8fafc;
  border: 1px solid var(--sg-border);
  border-radius: sp.$space-2;
  padding: 7px sp.$space-2;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: #4F6AF5;
    box-shadow: 0 0 0 3px rgba(79, 106, 245, 0.10);
    background: #fff;
  }
}

.sb-search__icon {
  color: var(--sg-text-muted);
  flex-shrink: 0;
}

.sb-search__input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 12px;
  color: var(--sg-text);
  outline: none;
  font-family: "Inter", sans-serif;
  min-width: 0;

  &::placeholder { color: #b0bec5; }
}

.sb-search__clear {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--sg-text-muted);
  padding: 0;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border-radius: 4px;

  &:hover { color: #ef4444; }
}

// ── Region filter ───────────────────────────────────────────────────────────
.sb-region {
  padding: 0 12px 10px;
}

.sb-region__label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--sg-text-muted);
  margin-bottom: 7px;
}

.sb-region__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.sb-region__chip {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid var(--sg-border);
  background: none;
  cursor: pointer;
  color: var(--sg-text-muted);
  font-family: "Inter", sans-serif;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: var(--sg-surface2);
    color: var(--sg-text);
  }

  &--active {
    background: #4F6AF5;
    border-color: #4F6AF5;
    color: #fff;
    font-weight: 600;
  }
}

// ── Empty state ─────────────────────────────────────────────────────────────
.sb-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: sp.$space-2;
  padding: sp.$space-5 layout-vars.$grid-gutter;
  color: var(--sg-text-muted);
  font-size: 12px;
  text-align: center;
}

.sb-empty__reset {
  font-size: 11px;
  font-weight: 600;
  color: #4F6AF5;
  background: none;
  border: 1px solid #4F6AF5;
  border-radius: 6px;
  padding: 4px 12px;
  cursor: pointer;
  margin-top: 4px;
  font-family: "Inter", sans-serif;

  &:hover { background: #eff2ff; }
}

// ── Location tag on card ────────────────────────────────────────────────────
.solar-facility__card-loc {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: var(--sg-text-muted);
  margin-top: 2px;
}

// ── Status dot ───────────────────────────────────────────────────────────────
.dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-right: 3px;
  vertical-align: middle;

  &--green { background: var(--sg-green); }
  &--red   { background: var(--sg-red); }
}

.solar-facility__filters {
  display: flex;
  gap: 6px;
  padding: sp.$space-2 layout-vars.$grid-gutter;
  flex-shrink: 0;
}

.solar-facility__filter {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid var(--sg-border);
  background: none;
  cursor: pointer;
  color: var(--sg-text-muted);
  transition: all 0.15s;

  &:hover {
    background: var(--sg-surface2);
    color: var(--sg-text);
  }
  &--active {
    background: var(--sg-green);
    border-color: var(--sg-green);
    color: white;
  }
}

.solar-facility__list {
  flex: 1;
  overflow-y: auto;
  padding: sp.$space-2;
}

.solar-facility__card {
  border: 1px solid var(--sg-border);
  border-radius: 10px;
  padding: sp.$space-3;
  margin-bottom: sp.$space-2;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--sg-surface);
  width: 100%;
  text-align: left;
  font: inherit;
  color: inherit;

  &:hover,
  &--selected {
    border-color: var(--sg-green);
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.12);
    background: #f0fdf4;
  }
}

.solar-facility__card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.solar-facility__card-name {
  font-size: 12.5px;
  font-weight: 600;
}

.solar-facility__card-id {
  font-size: 10px;
  color: var(--sg-text-muted);
  font-family: "Space Mono", monospace;
}

.solar-facility__card-status {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;

  &--online  { background: #dcfce7; color: var(--sg-green-dark); }
  &--offline { background: #fee2e2; color: var(--sg-red); }
  &--standby { background: #fef9c3; color: var(--sg-solar-dark); }
}

.solar-facility__bar-label {
  font-size: 10px;
  color: var(--sg-text-muted);
  margin-bottom: 3px;
  display: flex;
  justify-content: space-between;
}

.solar-facility__bar-track {
  height: 4px;
  background: var(--sg-border);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.solar-facility__bar-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--sg-green);
  transition: width 0.6s ease;

  &--warn { background: var(--sg-solar); }
}

.solar-facility__card-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  border-top: 1px solid var(--sg-border);
  padding-top: 8px;
  margin-top: 4px;
}

.solar-facility__stat {
  font-size: 10px;
  color: var(--sg-text-muted);

  span {
    font-family: "Space Mono", monospace;
    color: var(--sg-text);
    font-size: 11px;
  }
}

// ── Map / diagram area ───────────────────────────────────────────────────────
.solar-facility__map-area {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--sg-bg);
  display: flex;
  flex-direction: column;
  padding: layout-vars.$grid-gutter;
  gap: sp.$space-3;
}

.diagram-wrap {
  /* Lock to the viewBox aspect ratio (860 ÷ 440 ≈ 51.2%) so the SVG
     never grows taller than its natural proportions and nodes stay in view */
  width: 100%;
  position: relative;
  padding-top: min(51.2%, calc(100vh - 280px)); /* clamp height on very tall viewports */
  background: #ffffff;
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  box-shadow: var(--sg-shadow);
  overflow: hidden;
  flex-shrink: 0;
}

.diagram-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(248, 250, 252, 1);

  .diagram-node {
    cursor: pointer;
    transition: filter 0.15s;

    &:hover {
      filter: brightness(0.95);
    }
  }
}

// ── Key metrics bar (top) ─────────────────────────────────────────────────────
.solar-facility__bottom-bar {
  display: flex;
  gap: sp.$space-2;
  flex-shrink: 0;
  font-family: "Inter", sans-serif;
}

.solar-facility__widget {
  background: var(--sg-surface);
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  padding: sp.$space-3 14px;
  flex: 1;
  font-family: "Inter", sans-serif;
}

.solar-facility__widget-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.solar-facility__widget-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--sg-text-muted);
  font-family: "Inter", sans-serif;
}

.solar-facility__widget-up {
  font-size: 11px;
  color: var(--sg-green);
  font-weight: 600;
}

.solar-facility__widget-flat {
  font-size: 11px;
  color: var(--sg-solar);
  font-weight: 600;
}

.solar-facility__widget-value {
  font-family: "Inter", sans-serif;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.solar-facility__widget-unit {
  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: var(--sg-text-muted);
}

// ── KPX 전력 정보 ─────────────────────────────────────────────────────────────
.kpx-section {
  flex-shrink: 0;
  font-family: "Inter", sans-serif;
}

.kpx-section__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.kpx-section__title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--sg-text-muted);
}

.kpx-section__src {
  font-size: 10px;
  color: #b0bec5;
  flex: 1;
}

.kpx-section__status {
  font-size: 10.5px;
  font-weight: 600;
  color: #22c55e;
}

.kpx-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

// ── individual card ───────────────────────────────────────────────────────────
.kpx-card {
  background: #fff;
  border: 1px solid var(--sg-border);
  border-radius: 12px;
  padding: 14px 16px;
}

.kpx-card__label {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--sg-text-muted);
  margin-bottom: 12px;
}

.kpx-card__sub-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #b0bec5;
  margin-top: 14px;
  margin-bottom: 8px;
}

// ── key-value row ─────────────────────────────────────────────────────────────
.kpx-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: 12px;

  &--divider {
    border-top: 1px solid var(--sg-border);
    margin-top: 4px;
    padding-top: 8px;
  }
  &--mt { margin-top: 6px; }
}

.kpx-row__key {
  color: var(--sg-text-muted);
  font-size: 11.5px;
}

.kpx-row__val {
  font-weight: 700;
  color: var(--sg-text);
  font-variant-numeric: tabular-nums;

  &--up     { color: #22c55e; }
  &--accent { color: #4F6AF5; font-size: 16px; }
}

.kpx-row__unit {
  font-size: 10px;
  font-weight: 400;
  color: var(--sg-text-muted);
  margin-left: 2px;
}

// ── stacked bar ───────────────────────────────────────────────────────────────
.kpx-bar-wrap {
  margin-top: 10px;
}

.kpx-bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 9.5px;
  color: var(--sg-text-muted);
  margin-bottom: 4px;
}

.kpx-bar-track {
  height: 5px;
  background: var(--sg-border);
  border-radius: 3px;
  overflow: hidden;
  display: flex;
}

.kpx-bar-fill {
  height: 100%;
  border-radius: 3px;

  &--load    { background: #4F6AF5; }
  &--reserve { background: #22c55e; }
  &--rec     { background: #f59e0b; }
}

// ── SMP block ────────────────────────────────────────────────────────────────
.kpx-smp-block {
  display: flex;
  gap: 12px;
}

.kpx-smp-region {
  flex: 1;
}

.kpx-smp-region__name {
  font-size: 11px;
  font-weight: 600;
  color: var(--sg-text);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
}

.kpx-smp-region__tag {
  font-size: 9px;
  font-weight: 700;
  background: #ede9fe;
  color: #5b21b6;
  padding: 1px 5px;
  border-radius: 4px;
  letter-spacing: 0.04em;
}

.kpx-smp-vals {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.kpx-smp-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 11px;
}

.kpx-smp-row__lbl {
  color: var(--sg-text-muted);
  width: 26px;
  flex-shrink: 0;
}

.kpx-smp-row__val {
  font-weight: 700;
  color: var(--sg-text);
  font-variant-numeric: tabular-nums;

  &--main {
    font-size: 15px;
    color: #4F6AF5;
  }
}

.kpx-smp-row__unit {
  font-size: 9.5px;
  color: var(--sg-text-muted);
}

.kpx-smp-divider {
  width: 1px;
  background: var(--sg-border);
  flex-shrink: 0;
  margin: 0 4px;
}

// ── REC big number ────────────────────────────────────────────────────────────
.kpx-rec-big {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 4px;
}

.kpx-rec-big__label {
  font-size: 10.5px;
  color: var(--sg-text-muted);
  font-weight: 500;
  margin-right: 2px;
}

.kpx-rec-big__val {
  font-size: 26px;
  font-weight: 800;
  color: #f59e0b;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.kpx-rec-big__unit {
  font-size: 11px;
  color: var(--sg-text-muted);
}

.kpx-rec-note {
  margin-top: 12px;
  font-size: 10px;
  color: #b0bec5;
  border-top: 1px solid var(--sg-border);
  padding-top: 8px;
}

// ═══ Timeline Charts ═══
$tl-accent: #4F6AF5;
$tl-text: #0f172a;
$tl-muted: #94a3b8;
$tl-border: #e2e8f0;

.tl {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.tl__head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.tl__head-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 800;
  color: $tl-text;
  margin: 0;

  svg { color: $tl-accent; }
}

.tl__head-period {
  font-size: 10.5px;
  font-weight: 600;
  color: $tl-muted;
  background: #f8fafc;
  padding: 2px 8px;
  border-radius: 4px;
}

.tl__head-close {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  background: none;
  color: $tl-muted;
  cursor: pointer;
  border-radius: 4px;
  &:hover { background: #f8fafc; color: $tl-text; }
}

.tl__chart-card {
  background: #fff;
  border: 1px solid $tl-border;
  border-radius: 10px;
  padding: 12px 14px;
}

.tl__chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 8px;
  flex-wrap: wrap;
}

.tl__chart-legends {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tl__legend {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 600;
  color: $tl-muted;
}

.tl__legend-dot {
  width: 8px;
  height: 3px;
  border-radius: 1.5px;

  &--smp { background: #a855f7; }
  &--rec { background: #3b82f6; }
  &--demand { background: $tl-accent; }
}

.tl__chart-stats {
  display: flex;
  gap: 14px;
}

.tl__stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tl__stat-label {
  font-size: 10px;
  font-weight: 700;
  color: $tl-muted;
}

.tl__stat-val {
  font-size: 11px;
  font-weight: 800;
  color: $tl-text;
  font-variant-numeric: tabular-nums;

  &--peak {
    color: #d97706;
    background: rgba(245, 158, 11, 0.1);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 10px;
  }
}

.tl__stat-range {
  font-size: 9px;
  color: $tl-muted;
  font-variant-numeric: tabular-nums;
}

.tl__chart-wrap {
  position: relative;
}

.tl__svg {
  width: 100%;
  height: 100px;
  display: block;
}

.tl__time-labels {
  display: flex;
  justify-content: space-between;
  padding: 3px 0 0;
  font-size: 8.5px;
  font-weight: 600;
  color: $tl-muted;
  font-variant-numeric: tabular-nums;
}

.tl__peak-label {
  position: absolute;
  top: 2px;
  transform: translateX(-50%);
  font-size: 8px;
  font-weight: 700;
  color: #d97706;
  background: rgba(245, 158, 11, 0.12);
  padding: 1px 6px;
  border-radius: 3px;
  white-space: nowrap;
}

.tl__events {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba($tl-border, 0.5);
}

.tl__event-label {
  font-size: 9px;
  font-weight: 700;
  color: $tl-muted;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.tl__event-markers {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
}

.tl__event-tag {
  display: inline-flex;
  align-items: center;
  font-size: 9px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;

  &--alert { background: rgba(239, 68, 68, 0.08); color: #dc2626; }
  &--market { background: rgba(245, 158, 11, 0.08); color: #d97706; }
  &--config { background: rgba(34, 197, 94, 0.08); color: #16a34a; }
}

.tl__bar-wrap {
  position: relative;
}

.tl__bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 72px;
  padding: 0;
}

.tl__bar {
  flex: 1;
  background: rgba($tl-accent, 0.25);
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
  min-height: 2px;

  &--peak {
    background: $tl-accent;
    opacity: 0.7;
  }

  &:hover {
    opacity: 1;
    background: $tl-accent;
  }
}

.tl__bar-peak-zone {
  position: absolute;
  top: 0;
  height: 72px;
  background: rgba(245, 158, 11, 0.04);
  border-left: 1.5px solid rgba(245, 158, 11, 0.4);
  border-right: 1.5px solid rgba(245, 158, 11, 0.4);
  pointer-events: none;
}

.tl__peak-marker {
  position: absolute;
  bottom: -2px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 8.5px;
  font-weight: 700;
  color: #d97706;
  font-variant-numeric: tabular-nums;

  &--start { color: #0891b2; }
  &--end { color: #d97706; }
}

.tl__peak-marker-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 4px currentColor;
}

.tl__heatmap {
  position: relative;
}

.tl__heatmap-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.tl__heatmap-label {
  font-size: 9.5px;
  font-weight: 700;
  color: $tl-muted;
  width: 52px;
  text-align: right;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
}

.tl__heatmap-cells {
  display: flex;
  gap: 2px;
  flex: 1;
}

.tl__heatmap-cell {
  flex: 1;
  height: 16px;
  border-radius: 2px;
  transition: transform 0.1s;
  cursor: default;

  &:hover { transform: scaleY(1.3); z-index: 1; }
}

.tl__heatmap-peak {
  position: absolute;
  top: 0;
  height: calc(100% - 20px);
  border-left: 1.5px solid rgba(245, 158, 11, 0.4);
  border-right: 1.5px solid rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.04);
  pointer-events: none;
}

.tl__heatmap-legends {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba($tl-border, 0.5);

  svg { color: $tl-muted; }
}

.tl__heatmap-scale {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 9px;
  font-weight: 600;
  color: $tl-muted;
}

.tl__heatmap-scale-block {
  width: 10px;
  height: 8px;
  border-radius: 1.5px;
}

.tl__show-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  padding: 7px;
  font-size: 11px;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  color: $tl-muted;
  background: #fff;
  border: 1px dashed $tl-border;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.12s;
  flex-shrink: 0;

  &:hover { border-color: $tl-accent; color: $tl-accent; }
}

// ── Responsive ────────────────────────────────────────────────────────────────
@media (max-width: 768px) {

  // Full-width, no sidebar on mobile
  .solar-facility__main {
    flex-direction: column;
    overflow: visible;
  }

  // Sidebar becomes horizontal scroll chip list at top
  .solar-facility__sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--sg-border);
    flex-direction: column;
    overflow: hidden;
  }

  .solar-facility__list {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 8px 12px 12px;
    gap: 8px;
    flex: none;

    &::-webkit-scrollbar { display: none; }
  }

  // Sidebar cards become compact horizontal chips
  .solar-facility__card {
    flex-shrink: 0;
    width: 160px;
    padding: 10px;
    margin-bottom: 0;
  }

  .solar-facility__card-stats { display: none; }
  .solar-facility__bar-track  { margin-bottom: 0; }

  // Map area fills remaining space
  .solar-facility__map-area {
    padding: sp.$space-3;
    gap: sp.$space-2;
    overflow-y: visible;
    flex: none;
  }

  // Diagram stays aspect-ratio locked but smaller max height
  .diagram-wrap {
    padding-top: min(56%, calc(55vw)); // taller ratio feels better on portrait
    border-radius: 10px;
  }

  // Metrics widgets: 2-column grid
  .solar-facility__bottom-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: sp.$space-2;
  }

  // KPX cards: single column
  .kpx-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .kpx-section__head { flex-wrap: wrap; gap: 6px; }
  .kpx-section__src  { width: 100%; font-size: 9.5px; }
}

@media (max-width: 480px) {
  // On very small screens, metrics bar goes 1 column
  .solar-facility__bottom-bar {
    grid-template-columns: 1fr;
  }

  .solar-facility__sidebar-head {
    padding: sp.$space-3 sp.$space-3 sp.$space-2;
  }
}
</style>
