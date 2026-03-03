<script setup lang="ts">
import type { Facility } from "@/composables/useSolarFacilityCanvas";

defineProps<{
  data: Facility;
  selected: boolean;
}>();
</script>

<template>
  <div
    class="node-card rooftop"
    :class="[`status-${data.status}`, { selected }]"
    :style="{ width: data.w + 'px', height: data.h + 'px' }"
  >
    <div class="accent-bar"></div>

    <!-- Building roof body -->
    <div class="roof-body"></div>
    <!-- Panel strip bottom half -->
    <div class="panels"></div>

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
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  font-family: "Urbanist", system-ui, sans-serif;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.node-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.13); }
.node-card.selected {
  border-color: #06b6d4;
  box-shadow: 0 0 0 2px rgba(6,182,212,0.25), 0 4px 16px rgba(0,0,0,0.1);
}
.node-card.status-standby { opacity: 0.75; }
.node-card.status-offline  { opacity: 0.5; filter: grayscale(0.6); }

/* Cyan accent top bar */
.accent-bar {
  position: absolute; top: 0; left: 0; right: 0; height: 5px;
  background: linear-gradient(to right, #0891b2, #67e8f9);
  border-radius: 8px 8px 0 0;
  z-index: 3;
}

/* Roof base — warm off-white */
.roof-body {
  position: absolute; top: 5px; left: 0; right: 0; bottom: 50%;
  background: #f5f0e8;
}

/* Panel strip on lower 50% */
.panels {
  position: absolute; bottom: 22px; left: 0; right: 0;
  height: calc(50% - 22px);
  background:
    repeating-linear-gradient(to right,
      rgba(6,182,212,0.3) 0, rgba(6,182,212,0.3) 1px,
      transparent 1px, transparent 16px),
    repeating-linear-gradient(to bottom,
      rgba(6,182,212,0.25) 0, rgba(6,182,212,0.25) 1px,
      #1a3a4a 1px, #1a3a4a 100%);
  background-size: 16px 11px;
  border-top: 1.5px solid #67e8f9;
}
/* Sheen on panels */
.panels::before {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 55%);
}

.dot {
  position: absolute; top: 8px; right: 7px;
  width: 7px; height: 7px; border-radius: 50%; z-index: 4;
}
.dot-online  { background: #22c55e; box-shadow: 0 0 5px 2px rgba(34,197,94,0.6); }
.dot-standby { background: #f59e0b; box-shadow: 0 0 4px 2px rgba(245,158,11,0.6); }
.dot-offline { background: #ef4444; box-shadow: 0 0 4px 2px rgba(239,68,68,0.6); }

.footer {
  position: absolute; bottom: 0; left: 0; right: 0; height: 22px;
  background: rgba(255,255,255,0.96);
  border-top: 1px solid #e0f7fa;
  display: flex; align-items: center; padding: 0 7px; gap: 4px;
  z-index: 3;
}
.fname {
  flex: 1; font-size: 9px; font-weight: 700; color: #0c4a6e;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.fval { font-size: 9px; font-weight: 700; color: #0891b2; white-space: nowrap; }
</style>
