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
    <path d="M12 12 C12 12 8 8 9 4.5a3 3 0 0 1 5.8 0C15.6 8.5 12 12 12 12z" :fill="fillColor" />
    <path d="M12 12 C12 12 16.5 9.5 19.5 11.5a3 3 0 0 1-2 5.5C14 16.5 12 12 12 12z" :fill="fillColor" />
    <path d="M12 12 C12 12 7.5 14.5 6 18a3 3 0 0 0 5.5 1.5C13.5 16 12 12 12 12z" :fill="fillColor" />
    <path d="M12 12 C12 12 8 8 9 4.5a3 3 0 0 1 5.8 0C15.6 8.5 12 12 12 12z" />
    <path d="M12 12 C12 12 16.5 9.5 19.5 11.5a3 3 0 0 1-2 5.5C14 16.5 12 12 12 12z" />
    <path d="M12 12 C12 12 7.5 14.5 6 18a3 3 0 0 0 5.5 1.5C13.5 16 12 12 12 12z" />
    <circle cx="12" cy="12" r="1.5" :fill="color" stroke="none" />
  </svg>
</template>
