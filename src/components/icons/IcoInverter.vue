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
    <rect x="3" y="8" width="18" height="8" rx="2" :fill="fillColor" />
    <rect x="3" y="8" width="18" height="8" rx="2" />
    <path d="M7 12l2-2 2 4 2-4 2 2" />
    <line x1="3" y1="4" x2="21" y2="4" stroke-width="1.2" opacity="0.5" />
    <line x1="3" y1="20" x2="21" y2="20" stroke-width="1.2" opacity="0.5" />
  </svg>
</template>
