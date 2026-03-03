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
    <path d="M5 14h14a4 4 0 0 0 0-8h-1a5.5 5.5 0 0 0-10.6-1A4 4 0 0 0 5 9v5z" :fill="fillColor" />
    <path d="M5 14h14a4 4 0 0 0 0-8h-1a5.5 5.5 0 0 0-10.6-1A4 4 0 0 0 5 9" />
    <line x1="8" y1="17" x2="7" y2="21" opacity="0.6" />
    <line x1="12" y1="17" x2="11" y2="21" opacity="0.6" />
    <line x1="16" y1="17" x2="15" y2="21" opacity="0.6" />
  </svg>
</template>
