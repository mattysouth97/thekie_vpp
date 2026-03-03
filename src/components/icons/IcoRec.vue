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
    <rect x="4" y="3" width="16" height="18" rx="2" :fill="fillColor" />
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 7h8M8 11h8M8 15h5" />
    <circle cx="17" cy="17" r="3.5" fill="white" :stroke="color" />
    <path d="M15.5 17l1 1 2-2" stroke-width="1.5" />
  </svg>
</template>
