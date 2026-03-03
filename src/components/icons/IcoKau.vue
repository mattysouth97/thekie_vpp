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
    <circle cx="12" cy="12" r="10" :fill="fillColor" />
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12l3 3 5-5" stroke-width="2" />
    <path d="M12 6v2M12 16v2M6 12H4M20 12h-2" stroke-width="1.2" opacity="0.5" />
  </svg>
</template>
