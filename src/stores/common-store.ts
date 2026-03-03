import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useCommonStore = defineStore("commonStore", () => {
  const appTitle = ref<string>("thekie.com Prototype");
  const displayTitle = computed(() => appTitle.value);

  function setAppTitle(title: string): void {
    appTitle.value = title;
  }

  return { appTitle, displayTitle, setAppTitle };
});
