import { ref, computed } from "vue";
import { defineStore } from "pinia";
import RestClient from "@/api/rest-client";
import EquipmentService from "@/api/equipment-service";
import type { Equipment, EquipmentRegistrationPayload } from "@/types/equipment";

export const useEquipmentStore = defineStore("equipmentStore", () => {
  const equipmentList = ref<Equipment[]>([]);
  const loading = ref(false);
  const error = ref("");

  const equipmentService = new EquipmentService(new RestClient());

  const totalCount = computed(() => equipmentList.value.length);
  const activeCount = computed(
    () => equipmentList.value.filter((e) => e.status === "active").length,
  );

  async function loadEquipment(userId: string): Promise<void> {
    loading.value = true;
    error.value = "";
    try {
      equipmentList.value = await equipmentService.getByUserId(userId);
    } catch {
      error.value = "설비 목록을 불러오는데 실패했습니다.";
    } finally {
      loading.value = false;
    }
  }

  async function registerEquipment(
    payload: EquipmentRegistrationPayload,
    userId: string,
  ): Promise<boolean> {
    loading.value = true;
    error.value = "";
    try {
      const result = await equipmentService.register(payload, userId);
      if (result.success && result.equipment) {
        equipmentList.value.push(result.equipment);
        return true;
      }
      error.value = result.message ?? "설비 등록에 실패했습니다.";
      return false;
    } catch {
      error.value = "서버 연결에 실패했습니다.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function removeEquipment(equipmentId: string): Promise<boolean> {
    loading.value = true;
    error.value = "";
    try {
      const result = await equipmentService.remove(equipmentId);
      if (result.success) {
        equipmentList.value = equipmentList.value.filter(
          (e) => e.id !== equipmentId,
        );
        return true;
      }
      error.value = result.message ?? "설비 삭제에 실패했습니다.";
      return false;
    } catch {
      error.value = "서버 연결에 실패했습니다.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  function clearError(): void {
    error.value = "";
  }

  return {
    equipmentList,
    loading,
    error,
    totalCount,
    activeCount,
    loadEquipment,
    registerEquipment,
    removeEquipment,
    clearError,
  };
});
