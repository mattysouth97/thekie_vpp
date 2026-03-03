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
    <rect x="3" y="5" width="18" height="14" rx="2" :fill="fillColor" />
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 9h10M7 13h7" />
    <circle cx="17" cy="16" r="1.5" :fill="color" stroke="none" />
  </svg>
</template>
