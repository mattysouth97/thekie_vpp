<script setup lang="ts">
import type { Facility } from "@/composables/useSolarFacilityCanvas";

defineProps<{
  data: Facility;
  selected: boolean;
}>();
</script>

<template>
  <div
    class="inverter-node"
    :class="[`status-${data.status}`, { selected }]"
    :style="{ width: data.w + 'px', height: data.h + 'px' }"
  >
    <!-- Status LED -->
    <div class="led" :class="`led-${data.status}`"></div>

    <span class="status-dot" :class="`dot-${data.status}`"></span>
    <div class="label">
      <div class="name">{{ data.name }}</div>
    </div>
  </div>
</template>

<style scoped>
.inverter-node {
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  background: linear-gradient(160deg, #8a70c8 0%, #6248a8 100%);
  border: 1.5px solid #5040a0;
  box-shadow: 0 3px 12px rgba(80,40,160,0.35);
  cursor: pointer;
}
.inverter-node.selected { border-color: #2ecc71; box-shadow: 0 0 0 2px rgba(46,204,113,0.45), 0 3px 12px rgba(80,40,160,0.35); }
.inverter-node.status-offline { opacity: 0.5; filter: grayscale(0.5); }

/* Glowing LED centered */
.led {
  position: absolute;
  bottom: 10px; left: 50%; transform: translateX(-50%);
  width: 9px; height: 9px; border-radius: 50%;
}
.led-online  { background: #2ecc71; box-shadow: 0 0 8px 4px rgba(46,204,113,0.65); }
.led-standby { background: #f5c842; box-shadow: 0 0 6px 3px rgba(245,200,66,0.6); }
.led-offline { background: #555; box-shadow: none; }

.status-dot {
  position: absolute; top: 4px; right: 4px;
  width: 7px; height: 7px; border-radius: 50%; z-index: 3;
}
.dot-online  { background: #2ecc71; box-shadow: 0 0 4px 2px rgba(46,204,113,0.7); }
.dot-standby { background: #f5c842; box-shadow: 0 0 4px 2px rgba(245,200,66,0.7); }
.dot-offline { background: #e74c3c; box-shadow: 0 0 4px 2px rgba(231,76,60,0.7); }

.label {
  position: absolute; top: 6px; left: 0; right: 0; z-index: 2;
  text-align: center; pointer-events: none;
}
.name {
  font-size: 8.5px; font-weight: 700; color: rgba(240,232,255,0.95);
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
</style>
