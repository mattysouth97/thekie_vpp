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
    <circle cx="12" cy="12" r="9" :fill="fillColor" />
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10M9.5 9.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5S13.4 12 12 12s-2.5 1.1-2.5 2.5 1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5" />
  </svg>
</template>
