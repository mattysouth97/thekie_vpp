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
    <path d="M2 12 L6 12 L9 3 L15 21 L18 12 L22 12 L22 21 L2 21 Z" :fill="fillColor" stroke="none" />
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
</template>
