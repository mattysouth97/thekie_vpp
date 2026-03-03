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
    <path d="M3 21 L3 18 L8 12 L12 16 L17 9 L21 12 L21 21 Z" :fill="fillColor" stroke="none" />
    <path d="M3 18l5-6 4 4 5-7 4 3" />
    <line x1="3" y1="21" x2="21" y2="21" />
  </svg>
</template>
