<script setup lang="ts">
import { computed } from "vue";
import { getSmoothStepPath, Position } from "@vue-flow/core";

interface Props {
  id: string;
  sourceX: number;
  sourceY: number;
  sourcePosition: Position;
  targetX: number;
  targetY: number;
  targetPosition: Position;
  data: { isActive: boolean; showPower: boolean };
}

const props = defineProps<Props>();

const pathResult = computed(() =>
  getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    borderRadius: 0, // right-angle / orthogonal routing
  })
);

const edgePath = computed(() => pathResult.value[0]);
const pathId    = computed(() => `ef-${props.id}`);
const filterId  = computed(() => `gf-${props.id}`);

// Arrowhead: small filled triangle pointing along last segment
const arrowSize = 6;
// We approximate arrow position at targetX/Y with a naive inbound direction
const arrowAngle = computed(() => {
  // Compare last approach direction: sourceX/Y → targetX/Y gives rough angle
  const dx = props.targetX - props.sourceX;
  const dy = props.targetY - props.sourceY;
  // For right-angle paths, final segment is mostly horizontal or vertical
  if (Math.abs(dy) > Math.abs(dx)) {
    return dy > 0 ? Math.PI / 2 : -Math.PI / 2;
  }
  return dx > 0 ? 0 : Math.PI;
});

const arrowPoints = computed(() => {
  const a = arrowAngle.value;
  const tx = props.targetX;
  const ty = props.targetY;
  const sz = arrowSize;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  // Triangle: tip at target, base behind
  const tip = { x: tx,              y: ty };
  const bl  = { x: tx - sz * cos + sz * 0.5 * sin, y: ty - sz * sin - sz * 0.5 * cos };
  const br  = { x: tx - sz * cos - sz * 0.5 * sin, y: ty - sz * sin + sz * 0.5 * cos };
  return `${tip.x},${tip.y} ${bl.x},${bl.y} ${br.x},${br.y}`;
});

// Animation duration: shorter for active flow
const dotDur = 2.4; // seconds per full path traversal
</script>

<template>
  <g>
    <!-- Glow filter for flow dots -->
    <defs>
      <filter
        :id="filterId"
        x="-80%"
        y="-80%"
        width="260%"
        height="260%"
        color-interpolation-filters="sRGB"
      >
        <feGaussianBlur stdDeviation="2.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Named path (used for animateMotion) -->
    <path
      :id="pathId"
      :d="edgePath"
      fill="none"
      stroke="none"
    />

    <!-- Visible base line -->
    <path
      :d="edgePath"
      fill="none"
      :stroke="data.isActive ? 'rgba(46,204,113,0.65)' : 'rgba(110,140,125,0.38)'"
      stroke-width="2.5"
      stroke-linejoin="miter"
      stroke-linecap="square"
    />

    <!-- Arrowhead polygon -->
    <polygon
      :points="arrowPoints"
      :fill="data.isActive ? 'rgba(46,204,113,0.95)' : 'rgba(100,130,115,0.6)'"
    />

    <!-- Flow dots — SVG animateMotion (zero JS, GPU smooth) -->
    <template v-if="data.isActive && data.showPower">
      <circle
        v-for="i in 4"
        :key="i"
        r="2.8"
        fill="white"
        opacity="0.92"
        :filter="`url(#${filterId})`"
      >
        <animateMotion
          :dur="`${dotDur}s`"
          :begin="`${((i - 1) * dotDur) / 4}s`"
          repeatCount="indefinite"
          calcMode="linear"
          keyPoints="0;1"
          keyTimes="0;1"
          rotate="auto"
        >
          <mpath :href="`#${pathId}`" />
        </animateMotion>
      </circle>
    </template>
  </g>
</template>
