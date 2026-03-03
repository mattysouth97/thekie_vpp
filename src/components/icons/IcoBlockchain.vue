<script setup lang="ts">
withDefaults(defineProps<{
  size?: number | string;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
}>(), { size: 20, color: 'currentColor', fillColor: 'var(--tk-icon-fill, rgba(79,106,245,0.15))', strokeWidth: 1.8 });
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none"
       :stroke="color" :stroke-width="strokeWidth"
       stroke-linecap="round" stroke-linejoin="round"
       class="tk-ico" aria-hidden="true">
    <rect x="2" y="9" width="6" height="6" rx="1.5" :fill="fillColor" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" :fill="fillColor" />
    <rect x="16" y="9" width="6" height="6" rx="1.5" :fill="fillColor" />
    <rect x="2" y="9" width="6" height="6" rx="1.5" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
    <rect x="16" y="9" width="6" height="6" rx="1.5" />
    <line x1="8" y1="12" x2="9" y2="12" />
    <line x1="15" y1="12" x2="16" y2="12" />
  </svg>
</template>
