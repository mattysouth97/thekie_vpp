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
    <rect x="2" y="7" width="18" height="10" rx="2" :fill="fillColor" />
    <rect x="2" y="7" width="18" height="10" rx="2" />
    <path d="M22 11v2" />
    <line x1="6" y1="11" x2="6" y2="13" />
    <line x1="10" y1="11" x2="10" y2="13" />
    <line x1="14" y1="11" x2="14" y2="13" />
  </svg>
</template>
