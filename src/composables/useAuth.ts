import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "vue-router";

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  async function logoutAndRedirect() {
    authStore.logout();
    await router.push("/login");
  }

  return {
    ...authStore,
    logoutAndRedirect,
  };
}
