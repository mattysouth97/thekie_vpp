import { ref, computed } from "vue";
import { defineStore } from "pinia";

export interface BlockchainRecord {
  id: string;
  recordType: "settlement" | "generation" | "milestone" | "lease" | "rec_issuance" | "community_benefit";
  projectId: string | null;
  projectName: string;
  txHash: string;
  data: Record<string, unknown>;
  verified: boolean;
  createdAt: string;
}

export interface PlatformStats {
  totalMwDeployed: number;
  totalInvested: string;
  totalCo2Avoided: number;
  totalProjects: number;
  totalInvestors: number;
  totalSettlements: string;
  publicLandParcels: number;
  publicLandRevenue: string;
}

function randomHash(): string {
  const chars = "0123456789abcdef";
  let h = "0x";
  for (let i = 0; i < 64; i++) h += chars[Math.floor(Math.random() * 16)];
  return h;
}

function shortHash(hash: string): string {
  return hash.slice(0, 10) + "..." + hash.slice(-6);
}

// ── Seed blockchain records ──
const SEED_RECORDS: BlockchainRecord[] = [
  { id: "br-001", recordType: "settlement", projectId: "yongin-rooftop", projectName: "용인시 지붕형 태양광", txHash: randomHash(), data: { period: "2026-02", smpIncome: 4820000, recIncome: 2940000, drIncome: 580000, totalPayout: 8340000 }, verified: true, createdAt: "2026-03-05T09:00:00Z" },
  { id: "br-002", recordType: "generation", projectId: "yongin-ground", projectName: "용인시 지상형 태양광", txHash: randomHash(), data: { date: "2026-03-17", kWh: 8420, capacityFactor: 0.117 }, verified: true, createdAt: "2026-03-17T18:00:00Z" },
  { id: "br-003", recordType: "milestone", projectId: "yongin-ess", projectName: "용인시 ESS통합형 태양광", txHash: randomHash(), data: { milestone: "construction_start", documentHash: randomHash() }, verified: true, createdAt: "2026-03-10T10:00:00Z" },
  { id: "br-004", recordType: "lease", projectId: "yongin-floating", projectName: "용인시 수상형 태양광", txHash: randomHash(), data: { parcelId: "parcel-001", municipalityId: "yongin-city", annualRent: 48000000, startDate: "2026-01-01" }, verified: true, createdAt: "2026-01-01T09:00:00Z" },
  { id: "br-005", recordType: "rec_issuance", projectId: "yongin-ground", projectName: "용인시 지상형 태양광", txHash: randomHash(), data: { recCount: 328, period: "2026-02" }, verified: true, createdAt: "2026-03-01T09:00:00Z" },
  { id: "br-006", recordType: "community_benefit", projectId: "yongin-agri", projectName: "용인시 영농형 태양광", txHash: randomHash(), data: { municipalityId: "yongin-city", leaseRevenue: 24000000, localJobs: 12, communityFund: 8000000 }, verified: true, createdAt: "2026-03-15T09:00:00Z" },
  { id: "br-007", recordType: "settlement", projectId: "yongin-ground", projectName: "용인시 지상형 태양광", txHash: randomHash(), data: { period: "2026-02", smpIncome: 7230000, recIncome: 4120000, drIncome: 0, totalPayout: 11350000 }, verified: true, createdAt: "2026-03-05T09:30:00Z" },
  { id: "br-008", recordType: "generation", projectId: "yongin-rooftop", projectName: "용인시 지붕형 태양광", txHash: randomHash(), data: { date: "2026-03-17", kWh: 5240, capacityFactor: 0.109 }, verified: true, createdAt: "2026-03-17T18:00:00Z" },
  { id: "br-009", recordType: "milestone", projectId: "yongin-floating", projectName: "용인시 수상형 태양광", txHash: randomHash(), data: { milestone: "permit_approved", documentHash: randomHash() }, verified: true, createdAt: "2026-02-15T09:00:00Z" },
  { id: "br-010", recordType: "settlement", projectId: "yongin-agri", projectName: "용인시 영농형 태양광", txHash: randomHash(), data: { period: "2026-01", smpIncome: 3940000, recIncome: 2210000, drIncome: 0, totalPayout: 6150000 }, verified: true, createdAt: "2026-02-05T09:00:00Z" },
];

const SEED_STATS: PlatformStats = {
  totalMwDeployed: 15.8,
  totalInvested: "₩24.8억",
  totalCo2Avoided: 9670,
  totalProjects: 7,
  totalInvestors: 2568,
  totalSettlements: "₩480억+",
  publicLandParcels: 3,
  publicLandRevenue: "₩1.44억",
};

export const useBlockchainStore = defineStore("blockchainStore", () => {
  const records = ref<BlockchainRecord[]>([]);
  const stats = ref<PlatformStats>(SEED_STATS);
  const loading = ref(false);

  const totalRecords = computed(() => records.value.length);
  const verifiedCount = computed(() => records.value.filter((r) => r.verified).length);

  async function loadRecords(): Promise<void> {
    if (records.value.length > 0) return;
    loading.value = true;
    await new Promise((r) => setTimeout(r, 400));
    records.value = [...SEED_RECORDS];
    loading.value = false;
  }

  function getRecordsByProject(projectId: string): BlockchainRecord[] {
    return records.value.filter((r) => r.projectId === projectId);
  }

  function getRecordsByType(type: BlockchainRecord["recordType"]): BlockchainRecord[] {
    return records.value.filter((r) => r.recordType === type);
  }

  function verifyByHash(txHash: string): BlockchainRecord | null {
    return records.value.find((r) => r.txHash === txHash) ?? null;
  }

  return {
    records,
    stats,
    loading,
    totalRecords,
    verifiedCount,
    loadRecords,
    getRecordsByProject,
    getRecordsByType,
    verifyByHash,
    shortHash,
  };
});
