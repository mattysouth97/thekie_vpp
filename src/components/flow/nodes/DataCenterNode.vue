<script setup lang="ts">
import type { Facility } from "@/composables/useSolarFacilityCanvas";

defineProps<{
  data: Facility;
  selected: boolean;
}>();
</script>

<template>
  <div
    class="node-card datacenter"
    :class="[`status-${data.status}`, { selected }]"
    :style="{ width: data.w + 'px', height: data.h + 'px' }"
  >
    <div class="accent-bar"></div>
    <!-- Server row body -->
    <div class="body"></div>

    <span class="dot" :class="`dot-${data.status}`"></span>
    <div class="footer">
      <span class="fname">{{ data.name }}</span>
      <span class="fval">{{ data.output.toFixed(1) }} MW</span>
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
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99,102,241,0.25), 0 4px 16px rgba(0,0,0,0.1);
}
.node-card.status-offline { opacity: 0.5; filter: grayscale(0.5); }

/* Indigo accent bar */
.accent-bar {
  position: absolute; top: 0; left: 0; right: 0; height: 5px;
  background: linear-gradient(to right, #4f46e5, #818cf8);
  border-radius: 8px 8px 0 0;
  z-index: 3;
}

/* Server rack rows */
.body {
  position: absolute; top: 5px; left: 0; right: 0; bottom: 22px;
  background: #f8f9ff;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0, transparent 7px,
    #e8eaf8 7px, #e8eaf8 9px
  );
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
  border-top: 1px solid #eef0ff;
  display: flex; align-items: center; padding: 0 7px; gap: 4px;
  z-index: 3;
}
.fname {
  flex: 1; font-size: 9px; font-weight: 700; color: #1e1b4b;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.fval { font-size: 9px; font-weight: 700; color: #6366f1; white-space: nowrap; }
</style>
