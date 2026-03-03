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
    <rect x="4" y="2" width="16" height="20" rx="2" :fill="fillColor" />
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="9" y1="6" x2="9" y2="6.01" />
    <line x1="15" y1="6" x2="15" y2="6.01" />
    <line x1="9" y1="10" x2="9" y2="10.01" />
    <line x1="15" y1="10" x2="15" y2="10.01" />
    <line x1="9" y1="14" x2="9" y2="14.01" />
    <line x1="15" y1="14" x2="15" y2="14.01" />
    <path d="M10 22v-4h4v4" />
  </svg>
</template>
