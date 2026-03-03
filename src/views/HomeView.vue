<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { IcoSearch, IcoClose, IcoMapPin, IcoLightning, IcoInfo, IcoUser, IcoArrowRight } from "@/components/icons";
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

// ── Energy AI Chatbot ──
interface EnergyChat {
  role: "user" | "assistant";
  text: string;
}

const energyChatInput = ref("");
const energyChatMessages = ref<EnergyChat[]>([]);
const energyChatLoading = ref(false);

const energyFaqQuestions = [
  { q: "올해 SMP 전망은?", a: "2026년 SMP는 LNG 가격 안정화와 재생에너지 확대로 연평균 110~125원/kWh 수준이 예상됩니다. 다만 여름철 피크 시즌에는 일시적으로 150원대까지 상승할 수 있으며, 탄소배출권 가격 연동으로 하반기 소폭 상승 전망이 있습니다." },
  { q: "RE100 정책 동향", a: "2026년 기준 RE100 가입 한국 기업은 95개사로 확대되었습니다. 정부는 제3자 PPA 활성화를 위해 전기사업법 개정안을 추진 중이며, 녹색프리미엄 단가도 인하 검토 중입니다. 특히 반도체·배터리 수출기업의 RE100 이행 압박이 강화되면서 PPA 수요가 급증하고 있습니다." },
  { q: "지역별 재생에너지 이슈", a: "전남·전북 해상풍력 단지가 본격 착공에 들어가며 지역 수용성 문제가 부각되고 있습니다. 충남·경북 태양광은 농지 규제 강화로 신규 인허가가 어려워지는 추세이며, 제주도는 출력제한 빈도 증가로 ESS 연계 투자가 주목받고 있습니다." },
  { q: "REC 가격 하반기 전망", a: "REC 현물가는 2026년 상반기 40,000~45,000원/REC 수준에서 거래되고 있습니다. 하반기에는 재생에너지 의무공급비율(RPS) 상향 조정과 RE100 수요 증가로 소폭 상승하여 45,000~50,000원대가 예상됩니다. 다만 대규모 태양광 공급 증가가 상승폭을 제한할 수 있습니다." },
];

function sendEnergyFaq(q: string, a: string) {
  energyChatMessages.value.push({ role: "user", text: q });
  energyChatLoading.value = true;
  setTimeout(() => {
    energyChatMessages.value.push({ role: "assistant", text: a });
    energyChatLoading.value = false;
  }, 800);
}

function sendEnergyChat() {
  const text = energyChatInput.value.trim();
  if (!text) return;
  energyChatMessages.value.push({ role: "user", text });
  energyChatInput.value = "";
  energyChatLoading.value = true;
  setTimeout(() => {
    energyChatMessages.value.push({
      role: "assistant",
      text: "좋은 질문입니다! 현재 에너지 정책 AI는 시범 운영 중입니다. 보다 정확한 답변을 위해 EPSIS(epsis.kpx.or.kr)를 참고하시거나, THEKIE 전문 상담팀(1588-0000)으로 문의해 주세요.",
    });
    energyChatLoading.value = false;
  }, 1000);
}
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

        <!-- ── 에너지 정책 AI 어시스턴트 ── -->
        <div class="ep-chat-section">
          <div class="ep-chat-head">
            <IcoInfo :size="14" :strokeWidth="2" />
            <h2 class="ep-chat-title">에너지 정책 AI 어시스턴트</h2>
            <span class="ep-chat-badge">Beta</span>
          </div>
          <p class="ep-chat-desc">에너지 정책, 시장 동향, 지역 이슈에 대해 AI에게 질문하세요</p>

          <!-- FAQ quick buttons -->
          <div class="ep-chat-faq">
            <button
              v-for="faq in energyFaqQuestions" :key="faq.q"
              type="button"
              class="ep-chat-faq__btn"
              @click="sendEnergyFaq(faq.q, faq.a)"
            >{{ faq.q }}</button>
          </div>

          <!-- Messages -->
          <div class="ep-chat-messages" v-if="energyChatMessages.length > 0">
            <div
              v-for="(msg, i) in energyChatMessages" :key="i"
              class="ep-chat-msg"
              :class="msg.role === 'user' ? 'ep-chat-msg--user' : 'ep-chat-msg--ai'"
            >
              <div class="ep-chat-msg__avatar">
                <IcoUser v-if="msg.role === 'user'" :size="12" :strokeWidth="2" />
                <IcoLightning v-else :size="12" :strokeWidth="2" />
              </div>
              <div class="ep-chat-msg__bubble">{{ msg.text }}</div>
            </div>
            <div v-if="energyChatLoading" class="ep-chat-msg ep-chat-msg--ai">
              <div class="ep-chat-msg__avatar"><IcoLightning :size="12" :strokeWidth="2" /></div>
              <div class="ep-chat-msg__bubble ep-chat-msg__bubble--loading">
                <span class="ep-chat-dots"><i></i><i></i><i></i></span>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="ep-chat-input">
            <input
              v-model="energyChatInput"
              type="text"
              placeholder="에너지 정책에 대해 질문하세요..."
              @keyup.enter="sendEnergyChat"
            />
            <button type="button" @click="sendEnergyChat">
              <IcoArrowRight :size="14" :strokeWidth="2.5" />
            </button>
          </div>
        </div>

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

// ── Energy Policy AI Chatbot ──────────────────────────────────────────────────
$accent: #4F6AF5;
$accent-light: #EEF2FF;
$chat-text: #0f172a;
$chat-muted: #94a3b8;
$chat-secondary: #475569;
$chat-border: #e2e8f0;

.ep-chat-section {
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  border: 1px solid rgba(79,106,245,0.12);
  border-radius: 12px;
  padding: 14px 16px;
  flex-shrink: 0;
}

.ep-chat-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;

  svg { color: $accent; flex-shrink: 0; }
}

.ep-chat-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--sg-text-muted);
  margin: 0;
}

.ep-chat-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 9999px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: linear-gradient(135deg, $accent, #6366f1);
  color: #fff;
  margin-left: 6px;
}

.ep-chat-desc {
  font-size: 11.5px;
  color: $chat-secondary;
  margin: 0 0 10px;
  line-height: 1.5;
}

.ep-chat-faq {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;

  &__btn {
    background: #fff;
    border: 1px solid $chat-border;
    border-radius: 16px;
    padding: 5px 12px;
    font-size: 11px;
    font-weight: 500;
    color: $chat-secondary;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    font-family: "Inter", sans-serif;

    &:hover {
      border-color: $accent;
      color: $accent;
      background: $accent-light;
    }
  }
}

.ep-chat-messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 260px;
  overflow-y: auto;
  margin-bottom: 10px;
  padding: 2px 0;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: $chat-border; border-radius: 2px; }
}

.ep-chat-msg {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 88%;

  &--user {
    flex-direction: row-reverse;
    align-self: flex-end;

    .ep-chat-msg__avatar {
      background: $accent;
      color: #fff;
    }

    .ep-chat-msg__bubble {
      background: $accent;
      color: #fff;
      border-radius: 14px 14px 2px 14px;
    }
  }

  &--ai {
    align-self: flex-start;

    .ep-chat-msg__avatar {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
    }
  }

  &__avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: #f8fafc;
    color: $chat-muted;
  }

  &__bubble {
    background: #fff;
    border: 1px solid $chat-border;
    border-radius: 14px 14px 14px 2px;
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1.55;
    color: $chat-text;
    word-break: break-word;

    &--loading {
      padding: 10px 18px;
      display: flex;
      align-items: center;
    }
  }
}

.ep-chat-dots {
  display: flex;
  gap: 4px;

  i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: $chat-muted;
    animation: ep-dot-bounce 1.2s ease-in-out infinite;
    display: block;

    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
}

@keyframes ep-dot-bounce {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}

.ep-chat-input {
  display: flex;
  gap: 6px;
  align-items: center;
  background: #fff;
  border: 1px solid $chat-border;
  border-radius: 10px;
  padding: 3px 3px 3px 12px;
  transition: border-color 0.15s;

  &:focus-within {
    border-color: $accent;
    box-shadow: 0 0 0 2px rgba(79,106,245,0.08);
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 12px;
    color: $chat-text;
    background: transparent;
    padding: 6px 0;
    font-family: "Inter", sans-serif;

    &::placeholder { color: $chat-muted; }
  }

  button {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: none;
    background: $accent;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s;

    &:hover { background: #3d58d9; }
  }
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
