<script setup lang="ts">
import type { Facility } from "@/composables/useSolarFacilityCanvas";

defineProps<{
  data: Facility;
  selected: boolean;
}>();
</script>

<template>
  <div
    class="node-card grid"
    :class="[`status-${data.status}`, { selected }]"
    :style="{ width: data.w + 'px', height: data.h + 'px' }"
  >
    <div class="accent-bar"></div>
    <div class="body">
      <div class="transf"></div>
      <div class="transf"></div>
    </div>

    <span class="dot" :class="`dot-${data.status}`"></span>
    <div class="footer">
      <span class="fname">{{ data.name }}</span>
      <span class="fbadge">GRID</span>
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
  border-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34,197,94,0.25), 0 4px 16px rgba(0,0,0,0.1);
}
.node-card.status-offline { opacity: 0.5; filter: grayscale(0.5); }

/* Green accent bar */
.accent-bar {
  position: absolute; top: 0; left: 0; right: 0; height: 5px;
  background: linear-gradient(to right, #16a34a, #4ade80);
  border-radius: 8px 8px 0 0;
  z-index: 3;
}

/* Body with two transformer blocks */
.body {
  position: absolute; top: 5px; left: 0; right: 0; bottom: 22px;
  background: #f0fdf4;
  display: flex; align-items: center; justify-content: center;
  gap: 14px;
}
.transf {
  width: 22px; height: 32px;
  background: #1a2e20;
  border-radius: 3px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
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
  border-top: 1px solid #e8fdf4;
  display: flex; align-items: center; padding: 0 7px; gap: 5px;
  z-index: 3;
}
.fname {
  flex: 1; font-size: 9px; font-weight: 700; color: #052e16;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.fbadge {
  font-size: 8px; font-weight: 800; letter-spacing: 0.08em;
  color: #16a34a; background: #dcfce7;
  padding: 1px 5px; border-radius: 3px;
}
</style>
