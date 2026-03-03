<script setup lang="ts">
// 1. Libraries
import { RouterView } from "vue-router";
</script>

<template>
  <div class="app-root">
    <RouterView />
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables/colors";

.app-root {
  min-height: 100vh;
  background-color: colors.$bg-base;
}
</style>
