<script setup lang="ts">
// 1. Libraries
import { RouterView } from "vue-router";
</script>

<template>
  <div class="default-layout">
    <main class="default-layout__main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables/colors";

.default-layout {
  min-height: 100vh;
  background-color: colors.$bg-base;

  &__main {
    min-height: 100vh;
  }
}
</style>
