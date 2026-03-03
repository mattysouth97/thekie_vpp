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
    <path d="M5 6l7-4 7 4v6H5V6z" :fill="fillColor" stroke="none" />
    <path d="M12 22V12" />
    <path d="M5 12V6l7-4 7 4v6" />
    <path d="M5 12h14" />
    <path d="M9 17h6" />
  </svg>
</template>
