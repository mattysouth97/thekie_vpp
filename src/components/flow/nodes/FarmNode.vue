<script setup lang="ts">
import type { Facility } from "@/composables/useSolarFacilityCanvas";

defineProps<{
  data: Facility;
  selected: boolean;
}>();
</script>

<template>
  <div
    class="node-card farm"
    :class="[`status-${data.status}`, { selected }]"
    :style="{ width: data.w + 'px', height: data.h + 'px' }"
  >
    <div class="accent-bar"></div>
    <!-- Mini panel grid fills body -->
    <div class="panel-grid"></div>

    <span class="dot" :class="`dot-${data.status}`"></span>
    <div class="footer">
      <span class="fname">{{ data.name }}</span>
      <span class="fval">+{{ data.output.toFixed(1) }} MW</span>
    </div>
  </div>
</template>

<style scoped>
.node-card {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 0 0 0 transparent;
  cursor: pointer;
  font-family: "Urbanist", system-ui, sans-serif;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.node-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.13);
}
.node-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.25), 0 4px 16px rgba(0,0,0,0.1);
}
.node-card.status-standby { opacity: 0.75; }
.node-card.status-offline  { opacity: 0.5; filter: grayscale(0.6); }

/* Blue accent top bar */
.accent-bar {
  position: absolute; top: 0; left: 0; right: 0;
  height: 5px;
  background: linear-gradient(to right, #2563eb, #60a5fa);
  border-radius: 8px 8px 0 0;
}

/* Mini panel grid fills body below accent bar */
.panel-grid {
  position: absolute;
  top: 5px; bottom: 22px; left: 0; right: 0;
  background:
    repeating-linear-gradient(to right,
      rgba(59,130,246,0.18) 0, rgba(59,130,246,0.18) 1px,
      transparent 1px, transparent 20px),
    repeating-linear-gradient(to bottom,
      #c8dff8 0%, #c8dff8 28%,
      rgba(59,130,246,0.25) 28%, rgba(59,130,246,0.25) 30%,
      #1e3a5f 30%, #1e3a5f 66%,
      rgba(59,130,246,0.25) 66%, rgba(59,130,246,0.25) 68%,
      #c8dff8 68%, #c8dff8 100%);
  background-size: 20px 22px;
}
/* Glass sheen on panel grid */
.panel-grid::before {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%);
  pointer-events: none;
}

/* Status dot */
.dot {
  position: absolute; top: 8px; right: 7px;
  width: 7px; height: 7px; border-radius: 50%; z-index: 4;
}
.dot-online  { background: #22c55e; box-shadow: 0 0 5px 2px rgba(34,197,94,0.6); }
.dot-standby { background: #f59e0b; box-shadow: 0 0 4px 2px rgba(245,158,11,0.6); }
.dot-offline { background: #ef4444; box-shadow: 0 0 4px 2px rgba(239,68,68,0.6); }

/* Footer label bar */
.footer {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 22px;
  background: rgba(255,255,255,0.96);
  border-top: 1px solid #e8f0fe;
  display: flex; align-items: center;
  padding: 0 7px;
  gap: 4px;
  z-index: 3;
}
.fname {
  flex: 1;
  font-size: 9px; font-weight: 700; color: #1e3a5f;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.fval {
  font-size: 9px; font-weight: 700; color: #2563eb;
  white-space: nowrap;
}
</style>
