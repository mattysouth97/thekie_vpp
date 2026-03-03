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
    <path d="M12 2C6 8 3 12 3 16a9 9 0 0 0 18 0c0-4-3-8-9-14z" :fill="fillColor" />
    <path d="M12 2C6 8 3 12 3 16a9 9 0 0 0 18 0c0-4-3-8-9-14z" />
    <path d="M9 17c.5-2 1.5-3 3-3s2.5 1 3 3" stroke-width="1.5" opacity="0.6" />
  </svg>
</template>
