import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { supabase } from "@/lib/supabase";

// ── Shared project interface used across all views ──
export interface Project {
  id: string;
  developerId: string;
  name: string;
  type: string;
  typeIcon: string;
  location: string;
  address: string;
  lng: number;
  lat: number;
  capacity: string;
  capacityMw: number;
  expectedYield: string;
  yieldRate: number;
  minInvest: string;
  minInvestAmount: number;
  totalFundingRequired: number;
  currentFunding: number;
  investorCount: number;
  progress: number;
  status: string;
  statusColor: string;
  description: string;
  // 4-module classification
  powerStructure: string;
  marketStructure: string;
  landRights: string;
  capitalStructure: string;
  businessType: number;
  businessTypeLabel: string;
  // extras
  ppaYears: number;
  annualOutput: string;
  co2Reduction: string;
  developerName: string;
  fundingDeadline: string | null;
  createdAt: string;
}

// ── Seed data (used when Supabase is not configured) ──
const SEED_PROJECTS: Project[] = [
  {
    id: "yongin-rooftop",
    developerId: "dev-001",
    name: "용인시 지붕형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 기흥구 보정동",
    address: "경기 용인시 기흥구 보정동",
    lng: 127.1775,
    lat: 37.2342,
    capacity: "2.0 MW",
    capacityMw: 2.0,
    expectedYield: "연 7.8%",
    yieldRate: 7.8,
    minInvest: "₩50,000",
    minInvestAmount: 50000,
    totalFundingRequired: 400000000,
    currentFunding: 152000000,
    investorCount: 284,
    progress: 38,
    status: "참여 가능",
    statusColor: "green",
    description: "상업시설 지붕 태양광. RE100 기업 직접 PPA 계약으로 장기 안정 수익.",
    powerStructure: "full_sale",
    marketStructure: "corporate_ppa",
    landRights: "leased",
    capitalStructure: "corporate_credit",
    businessType: 7,
    businessTypeLabel: "기업PPA(직접)",
    ppaYears: 15,
    annualOutput: "2,628 MWh",
    co2Reduction: "1,224 tCO₂",
    developerName: "THEKIE 지붕형사업단",
    fundingDeadline: "2026-06-30",
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "yongin-ground",
    developerId: "dev-001",
    name: "용인시 지상형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 양지면",
    address: "경기 용인시 처인구 양지면",
    lng: 127.2856,
    lat: 37.2180,
    capacity: "3.0 MW",
    capacityMw: 3.0,
    expectedYield: "연 6.8%",
    yieldRate: 6.8,
    minInvest: "₩10,000",
    minInvestAmount: 10000,
    totalFundingRequired: 600000000,
    currentFunding: 432000000,
    investorCount: 1247,
    progress: 72,
    status: "참여 가능",
    statusColor: "green",
    description: "유휴부지 활용 지상형 태양광. SMP+REC 현물 매입으로 이중 수익 구조.",
    powerStructure: "full_sale",
    marketStructure: "smp_rec_spot",
    landRights: "leased",
    capitalStructure: "community_fund",
    businessType: 4,
    businessTypeLabel: "SMP+REC 현물형",
    ppaYears: 20,
    annualOutput: "3,942 MWh",
    co2Reduction: "1,836 tCO₂",
    developerName: "THEKIE 지상형사업단",
    fundingDeadline: "2026-05-15",
    createdAt: "2025-11-20T09:00:00Z",
  },
  {
    id: "yongin-floating",
    developerId: "dev-002",
    name: "용인시 수상형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 이동면",
    address: "경기 용인시 처인구 이동면",
    lng: 127.1148,
    lat: 37.2755,
    capacity: "2.5 MW",
    capacityMw: 2.5,
    expectedYield: "연 7.5%",
    yieldRate: 7.5,
    minInvest: "₩20,000",
    minInvestAmount: 20000,
    totalFundingRequired: 500000000,
    currentFunding: 140000000,
    investorCount: 412,
    progress: 28,
    status: "신규 오픈",
    statusColor: "blue",
    description: "저수지 수면 활용 수상태양광. REC 가중치 1.5배 적용으로 수익률 향상.",
    powerStructure: "full_sale",
    marketStructure: "smp_rec_spot",
    landRights: "floating",
    capitalStructure: "equity_pf",
    businessType: 4,
    businessTypeLabel: "SMP+REC 현물형",
    ppaYears: 20,
    annualOutput: "3,285 MWh",
    co2Reduction: "1,530 tCO₂",
    developerName: "그린워터솔라",
    fundingDeadline: "2026-08-31",
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "yongin-fems",
    developerId: "dev-001",
    name: "용인시 FEMS 연계형 태양광",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 수지구",
    address: "경기 용인시 수지구",
    lng: 127.0980,
    lat: 37.3220,
    capacity: "1.5 MW",
    capacityMw: 1.5,
    expectedYield: "연 6.8%",
    yieldRate: 6.8,
    minInvest: "₩20,000",
    minInvestAmount: 20000,
    totalFundingRequired: 300000000,
    currentFunding: 84000000,
    investorCount: 156,
    progress: 28,
    status: "신규 오픈",
    statusColor: "blue",
    description: "공장에너지관리시스템(FEMS) 연동. 실시간 수요 예측 기반 자가소비 최적화.",
    powerStructure: "self_consume",
    marketStructure: "vpp",
    landRights: "industrial",
    capitalStructure: "corporate_credit",
    businessType: 9,
    businessTypeLabel: "VPP/중개형",
    ppaYears: 15,
    annualOutput: "1,971 MWh",
    co2Reduction: "918 tCO₂",
    developerName: "THEKIE FEMS사업단",
    fundingDeadline: "2026-07-15",
    createdAt: "2026-02-10T09:00:00Z",
  },
  {
    id: "yongin-bipv",
    developerId: "dev-003",
    name: "용인시 BIPV형 태양광",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 남동",
    address: "경기 용인시 처인구 남동",
    lng: 127.2050,
    lat: 37.2510,
    capacity: "0.8 MW",
    capacityMw: 0.8,
    expectedYield: "연 5.9%",
    yieldRate: 5.9,
    minInvest: "₩15,000",
    minInvestAmount: 15000,
    totalFundingRequired: 200000000,
    currentFunding: 120000000,
    investorCount: 89,
    progress: 60,
    status: "참여 가능",
    statusColor: "green",
    description: "건물일체형 태양광(BIPV). 외벽·창호 일체 설치로 건축미 유지. RE100 이행 최적 솔루션.",
    powerStructure: "surplus_sale",
    marketStructure: "corporate_ppa",
    landRights: "self_owned",
    capitalStructure: "policy",
    businessType: 8,
    businessTypeLabel: "기업PPA(제3자)",
    ppaYears: 20,
    annualOutput: "1,051 MWh",
    co2Reduction: "489 tCO₂",
    developerName: "건축에너지랩",
    fundingDeadline: "2026-04-30",
    createdAt: "2025-12-05T09:00:00Z",
  },
  {
    id: "yongin-ess",
    developerId: "dev-001",
    name: "용인시 ESS통합형 태양광",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 이동",
    address: "경기 용인시 처인구 이동",
    lng: 127.1620,
    lat: 37.1950,
    capacity: "4.0 MW",
    capacityMw: 4.0,
    expectedYield: "연 8.1%",
    yieldRate: 8.1,
    minInvest: "₩100,000",
    minInvestAmount: 100000,
    totalFundingRequired: 700000000,
    currentFunding: 105000000,
    investorCount: 62,
    progress: 15,
    status: "신규 오픈",
    statusColor: "blue",
    description: "ESS 2MWh 연계 태양광 발전. 피크 시간대 방전으로 수익 극대화. 한전 계통 안정화 기여.",
    powerStructure: "full_sale",
    marketStructure: "smp_rec_contract",
    landRights: "leased",
    capitalStructure: "equity_pf",
    businessType: 5,
    businessTypeLabel: "SMP+REC 장기계약",
    ppaYears: 20,
    annualOutput: "5,256 MWh",
    co2Reduction: "2,449 tCO₂",
    developerName: "THEKIE ESS사업단",
    fundingDeadline: "2026-09-30",
    createdAt: "2026-03-01T09:00:00Z",
  },
  {
    id: "yongin-agri",
    developerId: "dev-002",
    name: "용인시 영농형 태양광",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 원삼면",
    address: "경기 용인시 원삼면",
    lng: 127.3100,
    lat: 37.1780,
    capacity: "2.0 MW",
    capacityMw: 2.0,
    expectedYield: "연 6.5%",
    yieldRate: 6.5,
    minInvest: "₩20,000",
    minInvestAmount: 20000,
    totalFundingRequired: 350000000,
    currentFunding: 133000000,
    investorCount: 318,
    progress: 38,
    status: "참여 가능",
    statusColor: "green",
    description: "농지 위 고설치형 태양광. 영농활동과 발전 병행. 농가 추가소득 + 신재생에너지 이중 효과.",
    powerStructure: "surplus_sale",
    marketStructure: "fit",
    landRights: "agrivoltaic",
    capitalStructure: "community_fund",
    businessType: 6,
    businessTypeLabel: "FIT(고정가격매입)",
    ppaYears: 20,
    annualOutput: "2,628 MWh",
    co2Reduction: "1,224 tCO₂",
    developerName: "그린팜에너지",
    fundingDeadline: "2026-05-31",
    createdAt: "2025-12-20T09:00:00Z",
  },
];

export const useProjectStore = defineStore("projectStore", () => {
  const projects = ref<Project[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isSupabaseConfigured = computed(() => supabase !== null);

  // ── Computed ──
  const totalCount = computed(() => projects.value.length);
  const openCount = computed(() => projects.value.filter((p) => ["참여 가능", "신규 오픈", "마감 임박"].includes(p.status)).length);
  const totalCapacityMw = computed(() => projects.value.reduce((sum, p) => sum + p.capacityMw, 0));
  const avgYield = computed(() => {
    if (projects.value.length === 0) return 0;
    return projects.value.reduce((sum, p) => sum + p.yieldRate, 0) / projects.value.length;
  });

  // ── Actions ──

  async function loadProjects(): Promise<void> {
    if (projects.value.length > 0) return; // already loaded
    loading.value = true;
    error.value = null;

    try {
      if (isSupabaseConfigured.value && supabase) {
        const { data, error: sbError } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (sbError) throw sbError;

        projects.value = (data ?? []).map(mapDbToProject);
      } else {
        // Fallback to seed data
        await new Promise((r) => setTimeout(r, 300));
        projects.value = [...SEED_PROJECTS];
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "프로젝트를 불러올 수 없습니다.";
      // Fallback to seed on error
      if (projects.value.length === 0) {
        projects.value = [...SEED_PROJECTS];
      }
    } finally {
      loading.value = false;
    }
  }

  async function getProjectById(id: string): Promise<Project | null> {
    if (projects.value.length === 0) await loadProjects();
    return projects.value.find((p) => p.id === id) ?? null;
  }

  /** Developer creates a new project */
  async function createProject(project: Omit<Project, "id" | "createdAt" | "currentFunding" | "investorCount">): Promise<Project | null> {
    loading.value = true;
    error.value = null;

    try {
      if (isSupabaseConfigured.value && supabase) {
        const { data, error: sbError } = await supabase
          .from("projects")
          .insert(mapProjectToDb(project))
          .select()
          .single();

        if (sbError) throw sbError;
        const newProject = mapDbToProject(data);
        projects.value.unshift(newProject);
        return newProject;
      } else {
        // Local-only fallback
        const newProject: Project = {
          ...project,
          id: crypto.randomUUID(),
          currentFunding: 0,
          investorCount: 0,
          createdAt: new Date().toISOString(),
        };
        projects.value.unshift(newProject);
        return newProject;
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "프로젝트 생성에 실패했습니다.";
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** Get projects by developer ID */
  function getProjectsByDeveloper(developerId: string): Project[] {
    return projects.value.filter((p) => p.developerId === developerId);
  }

  function clearError(): void {
    error.value = null;
  }

  return {
    projects,
    loading,
    error,
    totalCount,
    openCount,
    totalCapacityMw,
    avgYield,
    loadProjects,
    getProjectById,
    createProject,
    getProjectsByDeveloper,
    clearError,
  };
});

// ── DB ↔ Store mappers ──

function mapDbToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    developerId: row.developer_id as string,
    name: row.name as string,
    type: row.type as string,
    typeIcon: (row.type_icon as string) || "solar",
    location: row.location as string,
    address: (row.address as string) || "",
    lng: row.lng as number,
    lat: row.lat as number,
    capacity: row.capacity as string,
    capacityMw: row.capacity_mw as number,
    expectedYield: row.expected_yield as string,
    yieldRate: row.expected_yield_pct as number,
    minInvest: row.min_invest as string,
    minInvestAmount: row.min_invest_amount as number,
    totalFundingRequired: row.total_funding_required as number,
    currentFunding: row.current_funding as number,
    investorCount: row.investor_count as number,
    progress: row.progress as number,
    status: row.status as string,
    statusColor: (row.status_color as string) || "blue",
    description: (row.description as string) || "",
    powerStructure: (row.power_structure as string) || "",
    marketStructure: (row.market_structure as string) || "",
    landRights: (row.land_rights as string) || "",
    capitalStructure: (row.capital_structure as string) || "",
    businessType: (row.business_type as number) || 0,
    businessTypeLabel: "",
    ppaYears: 20,
    annualOutput: "",
    co2Reduction: "",
    developerName: "",
    fundingDeadline: (row.funding_deadline as string) || null,
    createdAt: (row.created_at as string) || new Date().toISOString(),
  };
}

function mapProjectToDb(project: Record<string, unknown>): Record<string, unknown> {
  return {
    developer_id: project.developerId,
    name: project.name,
    type: project.type,
    type_icon: project.typeIcon,
    location: project.location,
    address: project.address,
    lng: project.lng,
    lat: project.lat,
    capacity: project.capacity,
    capacity_mw: project.capacityMw,
    expected_yield: project.expectedYield,
    expected_yield_pct: project.yieldRate,
    min_invest: project.minInvest,
    min_invest_amount: project.minInvestAmount,
    total_funding_required: project.totalFundingRequired,
    progress: project.progress,
    status: project.status || "draft",
    status_color: project.statusColor,
    description: project.description,
    power_structure: project.powerStructure,
    market_structure: project.marketStructure,
    land_rights: project.landRights,
    capital_structure: project.capitalStructure,
    business_type: project.businessType,
    funding_deadline: project.fundingDeadline,
  };
}
