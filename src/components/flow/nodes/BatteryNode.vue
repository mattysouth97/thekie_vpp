<script setup lang="ts">
import { computed } from "vue";
import type { Facility } from "@/composables/useSolarFacilityCanvas";

const props = defineProps<{
  data: Facility;
  selected: boolean;
}>();

const soc = computed(() => props.data.soc ?? 0);
const socClass = computed(() => soc.value > 60 ? "sg" : soc.value > 30 ? "sa" : "sr");
</script>

<template>
  <div
    class="node-card battery"
    :class="[`status-${data.status}`, { selected }]"
    :style="{ width: data.w + 'px', height: data.h + 'px' }"
  >
    <div class="accent-bar"></div>

    <!-- SOC fill bar (visual body) -->
    <div class="soc-body">
      <div class="soc-fill" :class="socClass" :style="{ width: soc + '%' }"></div>
    </div>
    <div class="soc-pct">{{ soc }}%</div>

    <span class="dot" :class="`dot-${data.status}`"></span>
    <div class="footer">
      <span class="fname">{{ data.name }}</span>
      <span class="fval" :class="socClass">SOC {{ soc }}%</span>
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
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16,185,129,0.25), 0 4px 16px rgba(0,0,0,0.1);
}
.node-card.status-offline { opacity: 0.5; border-color: #ef4444; }

/* Emerald accent bar */
.accent-bar {
  position: absolute; top: 0; left: 0; right: 0; height: 5px;
  background: linear-gradient(to right, #059669, #34d399);
  border-radius: 8px 8px 0 0;
  z-index: 3;
}

/* SOC body — light fill behind the charge bar */
.soc-body {
  position: absolute; top: 5px; left: 0; right: 0; bottom: 22px;
  background: #f0fdf4;
  overflow: hidden;
}
.soc-fill {
  height: 100%;
  opacity: 0.18;
  transition: width 0.4s ease;
}
.sg { background: #10b981; }
.sa { background: #f59e0b; }
.sr { background: #ef4444; }

/* SOC percentage large text */
.soc-pct {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, calc(-50% + 2px));
  font-size: 22px; font-weight: 800;
  font-family: "Urbanist", system-ui, sans-serif;
  color: #064e3b;
  z-index: 3; pointer-events: none;
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
  display: flex; align-items: center; padding: 0 7px; gap: 4px;
  z-index: 3;
}
.fname {
  flex: 1; font-size: 9px; font-weight: 700; color: #052e16;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.fval { font-size: 9px; font-weight: 700; white-space: nowrap; }
.fval.sg { color: #059669; }
.fval.sa { color: #d97706; }
.fval.sr { color: #dc2626; }
</style>
