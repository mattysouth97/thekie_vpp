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
    <rect x="3" y="4" width="18" height="12" rx="1.5" :fill="fillColor" />
    <rect x="3" y="4" width="18" height="12" rx="1.5" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="14" x2="21" y2="14" />
    <line x1="9" y1="4" x2="9" y2="16" />
    <line x1="15" y1="4" x2="15" y2="16" />
    <line x1="7" y1="20" x2="17" y2="20" />
    <line x1="12" y1="16" x2="12" y2="20" />
  </svg>
</template>
