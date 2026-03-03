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
    <path d="M19 9.5C19 6.42 15.87 4 12 4S5 6.42 5 9.5c0 1.83.88 3.46 2.25 4.56L7 17h10l-.25-2.94A6.68 6.68 0 0 0 19 9.5z" :fill="fillColor" />
    <path d="M19 9.5C19 6.42 15.87 4 12 4S5 6.42 5 9.5c0 1.83.88 3.46 2.25 4.56L7 17h10l-.25-2.94A6.68 6.68 0 0 0 19 9.5z" />
    <line x1="9" y1="17" x2="9" y2="20" />
    <line x1="15" y1="17" x2="15" y2="20" />
    <line x1="7" y1="20" x2="17" y2="20" />
    <line x1="10" y1="9" x2="14" y2="9" />
  </svg>
</template>
