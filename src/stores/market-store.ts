/**
 * 시장 데이터 스토어
 * - 실시간 SMP / REC / PPA 가격 관리
 * - 자동 갱신 (5분 주기)
 * - 전역 접근 가능
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  fetchMarketData,
  type MarketSnapshot,
  type SmpPrice,
  type RecPrice,
  type PpaPrice,
} from "@/api/market-service";
import dayjs from "dayjs";

export const useMarketStore = defineStore("marketStore", () => {
  // ── State ────────────────────────────────────────────────────────────────────
  const snapshot = ref<MarketSnapshot | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<string | null>(null);

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  const POLL_INTERVAL = 5 * 60 * 1000; // 5분

  // ── Getters ──────────────────────────────────────────────────────────────────
  const smp = computed<SmpPrice | null>(() => snapshot.value?.smp ?? null);
  const rec = computed<RecPrice | null>(() => snapshot.value?.rec ?? null);
  const ppa = computed<PpaPrice | null>(() => snapshot.value?.ppa ?? null);
  const source = computed(() => snapshot.value?.source ?? "none");
  const isLive = computed(() => snapshot.value?.source === "api");

  const smpDisplay = computed(() => {
    if (!smp.value) return { landAvg: "—", landMax: "—", landMin: "—", jejuAvg: "—", jejuMax: "—", jejuMin: "—" };
    return {
      landAvg: smp.value.landAvg.toFixed(2),
      landMax: smp.value.landMax.toFixed(2),
      landMin: smp.value.landMin.toFixed(2),
      jejuAvg: smp.value.jejuAvg.toFixed(2),
      jejuMax: smp.value.jejuMax.toFixed(2),
      jejuMin: smp.value.jejuMin.toFixed(2),
    };
  });

  const recDisplay = computed(() => {
    if (!rec.value) return { avgPrice: "—", closePrice: "—", volume: "—", change: "0", changeUp: false };
    return {
      avgPrice: rec.value.avgPrice.toLocaleString("ko-KR"),
      closePrice: rec.value.closePrice.toLocaleString("ko-KR"),
      volume: rec.value.volume.toLocaleString("ko-KR"),
      change: (rec.value.change >= 0 ? "+" : "") + rec.value.change.toLocaleString("ko-KR"),
      changeUp: rec.value.change >= 0,
    };
  });

  const ppaDisplay = computed(() => {
    if (!ppa.value) return { price: "—" };
    return {
      price: ppa.value.price.toFixed(2),
    };
  });

  const dateDisplay = computed(() => {
    if (!snapshot.value) return "—";
    return dayjs(snapshot.value.smp.date).format("YYYY.MM.DD");
  });

  const timeDisplay = computed(() => {
    if (!lastUpdated.value) return "";
    return dayjs(lastUpdated.value).format("HH:mm:ss");
  });

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function refresh(force = false) {
    loading.value = true;
    error.value = null;
    try {
      snapshot.value = await fetchMarketData(force);
      lastUpdated.value = new Date().toISOString();
    } catch (e: any) {
      error.value = e?.message ?? "시장 데이터 조회 실패";
    } finally {
      loading.value = false;
    }
  }

  function startPolling() {
    if (pollTimer) return;
    refresh(); // 즉시 1회 조회
    pollTimer = setInterval(() => refresh(true), POLL_INTERVAL);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  /** TX_TYPES 에서 사용할 현재 시장가 기반 금액 생성기 */
  function liveAmount(type: "smp" | "rec" | "ppa" | "dr"): string {
    const s = snapshot.value;
    if (!s) return "—";
    switch (type) {
      case "smp": {
        // 실시간 SMP ± 작은 변동
        const base = s.smp.landAvg;
        const jitter = (Math.random() - 0.5) * 4;
        return (base + jitter).toFixed(2);
      }
      case "rec": {
        const base = s.rec.avgPrice;
        const jitter = (Math.random() - 0.5) * 600;
        return Math.round(base + jitter).toString();
      }
      case "ppa": {
        const base = s.ppa.price;
        const jitter = (Math.random() - 0.5) * 2;
        return (base + jitter).toFixed(2);
      }
      case "dr": {
        return (1800 + Math.random() * 300).toFixed(0);
      }
      default:
        return "0";
    }
  }

  return {
    // state
    snapshot,
    loading,
    error,
    lastUpdated,
    // getters
    smp,
    rec,
    ppa,
    source,
    isLive,
    smpDisplay,
    recDisplay,
    ppaDisplay,
    dateDisplay,
    timeDisplay,
    // actions
    refresh,
    startPolling,
    stopPolling,
    liveAmount,
  };
});
