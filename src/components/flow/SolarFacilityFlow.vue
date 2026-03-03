<script setup lang="ts">
import { ref, computed, markRaw } from "vue";
import {
  VueFlow,
  useVueFlow,
  Position,
  type NodeMouseEvent,
} from "@vue-flow/core";
import {
  FACILITIES_DATA,
  CONNECTIONS_DATA,
  type Facility,
} from "@/composables/useSolarFacilityCanvas";

// Node components
import FarmNode       from "./nodes/FarmNode.vue";
import RooftopNode    from "./nodes/RooftopNode.vue";
import InverterNode   from "./nodes/InverterNode.vue";
import BatteryNode    from "./nodes/BatteryNode.vue";
import GridNode       from "./nodes/GridNode.vue";
import FactoryNode    from "./nodes/FactoryNode.vue";
import DataCenterNode from "./nodes/DataCenterNode.vue";

// Edge component
import PowerFlowEdge from "./edges/PowerFlowEdge.vue";

// ─── Props / Models ──────────────────────────────────────────────────────────

const props = defineProps<{
  showPower: boolean;
}>();

const selectedId = defineModel<string | null>("selectedId", { default: null });
const tooltip = defineModel<{
  show: boolean;
  x: number;
  y: number;
  f: Facility | null;
}>("tooltip");

// ─── Node / Edge types (markRaw prevents Vue from making them reactive) ─────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, any> = {
  farm:       markRaw(FarmNode),
  rooftop:    markRaw(RooftopNode),
  inverter:   markRaw(InverterNode),
  battery:    markRaw(BatteryNode),
  grid:       markRaw(GridNode),
  factory:    markRaw(FactoryNode),
  datacenter: markRaw(DataCenterNode),
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const edgeTypes: Record<string, any> = {
  powerFlow: markRaw(PowerFlowEdge),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nodeType(f: Facility): string {
  if (f.type === "consumer") return f.subtype ?? "factory";
  return f.type;
}

function getEdgePositions(
  from: Facility,
  to: Facility
): { sp: Position; tp: Position } {
  const fc = { x: from.x + from.w / 2, y: from.y + from.h / 2 };
  const tc = { x: to.x + to.w / 2,     y: to.y + to.h / 2 };
  const dx = tc.x - fc.x;
  const dy = tc.y - fc.y;
  let sp: Position, tp: Position;
  if (Math.abs(dy) > Math.abs(dx) * 0.7) {
    sp = dy > 0 ? Position.Bottom : Position.Top;
    tp = dy > 0 ? Position.Top    : Position.Bottom;
  } else {
    sp = dx > 0 ? Position.Right : Position.Left;
    tp = dx > 0 ? Position.Left  : Position.Right;
  }
  return { sp, tp };
}

// ─── Vue Flow nodes / edges ───────────────────────────────────────────────────

const nodes = computed(() =>
  FACILITIES_DATA.map((f) => ({
    id: f.id,
    type: nodeType(f),
    position: { x: f.x, y: f.y },
    data: f,
    selected: f.id === selectedId.value,
    connectable: false,
    draggable: false,
    style: { width: f.w + "px", height: f.h + "px" },
  }))
);

const edges = computed(() =>
  CONNECTIONS_DATA.map(([src, tgt]) => {
    const from = FACILITIES_DATA.find((f) => f.id === src)!;
    const to   = FACILITIES_DATA.find((f) => f.id === tgt)!;
    const isActive =
      from.status === "online" &&
      to.status !== "offline" &&
      (from.output !== 0 || to.output !== 0 || from.type === "grid" || to.type === "grid");
    const { sp, tp } = getEdgePositions(from, to);
    return {
      id: `${src}-${tgt}`,
      source: src,
      target: tgt,
      type: "powerFlow",
      sourceHandle: null,
      targetHandle: null,
      sourcePosition: sp,
      targetPosition: tp,
      data: { isActive, showPower: props.showPower },
      updatable: false,
    };
  })
);

// ─── Vue Flow API ─────────────────────────────────────────────────────────────

const { zoomIn, zoomOut, setViewport, setCenter } = useVueFlow();

// ─── Event handlers ───────────────────────────────────────────────────────────

const containerRef = ref<HTMLElement | null>(null);

function onNodeClick({ node }: NodeMouseEvent) {
  selectedId.value = node.id;
}

function onNodeMouseEnter({ node, event }: NodeMouseEvent) {
  if (!containerRef.value) return;
  const el = event.currentTarget as HTMLElement;
  if (!el) return;
  const nodeRect = el.getBoundingClientRect();
  // Position relative to the nearest positioned ancestor (map-area has position:relative)
  const anchorEl =
    (containerRef.value.closest(".solar-facility__map-area") as HTMLElement) ??
    containerRef.value;
  const anchorRect = anchorEl.getBoundingClientRect();
  let tx = nodeRect.right - anchorRect.left + 10;
  let ty = nodeRect.top  - anchorRect.top;
  // Boundary guard
  if (tx + 215 > anchorRect.width) tx = nodeRect.left - anchorRect.left - 220;
  if (ty + 150 > anchorRect.height) ty = anchorRect.height - 150;
  if (ty < 0) ty = 0;
  tooltip.value = { show: true, x: tx, y: ty, f: node.data as Facility };
}

function onNodeMouseLeave() {
  if (tooltip.value) {
    tooltip.value = { ...tooltip.value, show: false };
  }
}

function onPaneClick() {
  selectedId.value = null;
}

// ─── Exposed API (matches old canvasApi shape) ────────────────────────────────

defineExpose({
  zoom(factor: number) {
    if (factor > 1) zoomIn({ duration: 200 });
    else            zoomOut({ duration: 200 });
  },
  resetView() {
    setViewport({ x: 80, y: 50, zoom: 1 }, { duration: 350 });
  },
  panToFacility(f: Facility) {
    setCenter(f.x + f.w / 2, f.y + f.h / 2, { zoom: 1.3, duration: 400 });
  },
});
</script>

<template>
  <div ref="containerRef" class="sf-flow-wrap">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :node-types="nodeTypes"
      :edge-types="edgeTypes"
      :min-zoom="0.25"
      :max-zoom="3.5"
      :default-viewport="{ x: 80, y: 50, zoom: 1 }"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :pan-on-drag="true"
      :zoom-on-scroll="true"
      :zoom-on-pinch="true"
      :prevent-scrolling="true"
      @node-click="onNodeClick"
      @node-mouse-enter="onNodeMouseEnter"
      @node-mouse-leave="onNodeMouseLeave"
      @pane-click="onPaneClick"
    >
      <!-- Custom background: terrain gradient + grid -->
      <template #background>
        <svg
          class="sf-bg-svg"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sf-terrain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stop-color="#ccd8c0" />
              <stop offset="40%"  stop-color="#d8d8b8" />
              <stop offset="100%" stop-color="#c8c8a8" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#sf-terrain)" />
        </svg>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.sf-flow-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Hide Vue Flow attribution badge */
:deep(.vue-flow__attribution) {
  display: none;
}

/* Nodes — remove default vue-flow border/shadow wrapper */
:deep(.vue-flow__node) {
  cursor: pointer;
  /* Remove vue-flow default node styling */
  border: none !important;
  background: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}

/* Edges — remove default styles */
:deep(.vue-flow__edge-path) {
  stroke: none;
}

/* Background SVG fills the pane */
.sf-bg-svg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
