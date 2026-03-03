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
    <circle cx="9" cy="8" r="4" :fill="fillColor" stroke="none" opacity="0.5" />
    <circle cx="9" cy="8" r="4" stroke-width="1.2" />
    <line x1="9" y1="1" x2="9" y2="2.5" stroke-width="1.2" />
    <line x1="4" y1="3" x2="5" y2="4" stroke-width="1.2" />
    <line x1="1" y1="8" x2="2.5" y2="8" stroke-width="1.2" />
    <path d="M6 19h12a4 4 0 0 0 0-8h-1a5 5 0 0 0-9.73-1.3A3.5 3.5 0 0 0 6 13.5V19z" :fill="fillColor" />
    <path d="M6 19h12a4 4 0 0 0 0-8h-1a5 5 0 0 0-9.73-1.3A3.5 3.5 0 0 0 6 13.5" />
  </svg>
</template>
