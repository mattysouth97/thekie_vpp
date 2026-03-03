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
    <path d="M8 12h8M12 8v8" />
    <circle cx="12" cy="12" r="3" stroke-width="1.2" opacity="0.5" />
  </svg>
</template>
