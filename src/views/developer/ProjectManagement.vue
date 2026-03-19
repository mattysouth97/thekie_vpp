<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectStore } from "@/stores/project-store";
import { useBlockchainStore } from "@/stores/blockchain-store";
import type { Project } from "@/stores/project-store";
import {
  IcoArrowLeft, IcoSolar, IcoWind, IcoBattery, IcoMapPin, IcoUsers,
  IcoChartUp, IcoCheck, IcoBlockchain, IcoDocument, IcoLightning, IcoArrowRight,
} from "@/components/icons";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const blockchainStore = useBlockchainStore();

const project = ref<Project | null>(null);
const loading = ref(true);

const projectRecords = computed(() => {
  if (!project.value) return [];
  return blockchainStore.getRecordsByProject(project.value.id);
});

const fundingPct = computed(() => {
  if (!project.value || !project.value.totalFundingRequired) return 0;
  return Math.round((project.value.currentFunding / project.value.totalFundingRequired) * 100);
});

function formatKrw(amount: number): string {
  if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억원`;
  if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만원`;
  return `${amount.toLocaleString("ko-KR")}원`;
}

const TYPE_LABELS: Record<string, string> = {
  settlement: "정산", generation: "발전량", milestone: "마일스톤",
  lease: "임대", rec_issuance: "REC 발급", community_benefit: "지역사회",
};

const milestones = [
  { label: "사업 등록", done: true },
  { label: "인허가 승인", done: true },
  { label: "자금 모집", done: false },
  { label: "착공", done: false },
  { label: "계통 연계", done: false },
  { label: "상업 운전", done: false },
];

onMounted(async () => {
  await projectStore.loadProjects();
  await blockchainStore.loadRecords();
  const id = route.params.id as string;
  project.value = await projectStore.getProjectById(id);
  loading.value = false;
});
</script>

<template>
  <div class="pm">
    <div v-if="loading" class="pm__loading">불러오는 중...</div>

    <template v-else-if="project">
      <!-- Header -->
      <div class="pm__header">
        <button type="button" class="pm__back" @click="router.push('/developer/projects')">
          <IcoArrowLeft :size="16" :strokeWidth="2.5" />
        </button>
        <div class="pm__header-body">
          <div class="pm__header-top">
            <div class="pm__type-icon">
              <IcoSolar v-if="project.typeIcon === 'solar'" :size="16" :strokeWidth="2" />
              <IcoWind v-else-if="project.typeIcon === 'wind'" :size="16" :strokeWidth="2" />
              <IcoBattery v-else :size="16" :strokeWidth="2" />
            </div>
            <span class="pm__type">{{ project.type }}</span>
            <span class="pm__status" :class="`pm__status--${project.statusColor}`">{{ project.status }}</span>
          </div>
          <h1 class="pm__title">{{ project.name }}</h1>
          <div class="pm__location"><IcoMapPin :size="12" :strokeWidth="2" /> {{ project.location }}</div>
        </div>
      </div>

      <!-- KPIs -->
      <div class="pm__kpis">
        <div class="pm__kpi">
          <span class="pm__kpi-label">발전 용량</span>
          <span class="pm__kpi-val">{{ project.capacity }}</span>
        </div>
        <div class="pm__kpi">
          <span class="pm__kpi-label">기대 수익률</span>
          <span class="pm__kpi-val pm__kpi-val--accent">{{ project.expectedYield }}</span>
        </div>
        <div class="pm__kpi">
          <span class="pm__kpi-label">투자자 수</span>
          <span class="pm__kpi-val">{{ project.investorCount.toLocaleString() }}명</span>
        </div>
        <div class="pm__kpi">
          <span class="pm__kpi-label">자금 모집률</span>
          <span class="pm__kpi-val">{{ fundingPct }}%</span>
        </div>
      </div>

      <!-- Funding progress -->
      <div class="pm__section">
        <h2 class="pm__section-title"><IcoChartUp :size="15" :strokeWidth="2" /> 자금 모집 현황</h2>
        <div class="pm__funding">
          <div class="pm__funding-bar">
            <div class="pm__funding-fill" :style="{ width: fundingPct + '%' }"></div>
          </div>
          <div class="pm__funding-labels">
            <span>{{ formatKrw(project.currentFunding) }}</span>
            <span class="pm__funding-total">목표 {{ formatKrw(project.totalFundingRequired) }}</span>
          </div>
        </div>
      </div>

      <!-- Milestones -->
      <div class="pm__section">
        <h2 class="pm__section-title"><IcoDocument :size="15" :strokeWidth="2" /> 프로젝트 마일스톤</h2>
        <div class="pm__milestones">
          <div v-for="(ms, i) in milestones" :key="i" class="pm__ms" :class="{ 'pm__ms--done': ms.done }">
            <div class="pm__ms-dot">
              <IcoCheck v-if="ms.done" :size="10" :strokeWidth="3" />
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="pm__ms-label">{{ ms.label }}</span>
            <div v-if="i < milestones.length - 1" class="pm__ms-line" :class="{ 'pm__ms-line--done': ms.done }"></div>
          </div>
        </div>
      </div>

      <!-- Blockchain records -->
      <div class="pm__section">
        <h2 class="pm__section-title"><IcoBlockchain :size="15" :strokeWidth="2" /> 블록체인 기록</h2>
        <div v-if="projectRecords.length === 0" class="pm__empty">이 프로젝트에 대한 블록체인 기록이 아직 없습니다.</div>
        <div v-else class="pm__records">
          <div v-for="r in projectRecords" :key="r.id" class="pm__record">
            <span class="pm__record-type" :class="`pm__record-type--${r.recordType}`">{{ TYPE_LABELS[r.recordType] || r.recordType }}</span>
            <code class="pm__record-hash">{{ blockchainStore.shortHash(r.txHash) }}</code>
            <IcoCheck v-if="r.verified" class="pm__record-verified" :size="12" :strokeWidth="2.5" />
            <span class="pm__record-date">{{ new Date(r.createdAt).toLocaleDateString('ko-KR') }}</span>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="pm__section">
        <h2 class="pm__section-title"><IcoLightning :size="15" :strokeWidth="2" /> 프로젝트 개요</h2>
        <p class="pm__desc">{{ project.description }}</p>
        <div class="pm__tags">
          <span class="pm__tag">{{ project.businessTypeLabel }}</span>
          <span class="pm__tag">{{ project.powerStructure }}</span>
          <span class="pm__tag">{{ project.marketStructure }}</span>
          <span class="pm__tag">{{ project.landRights }}</span>
          <span class="pm__tag">{{ project.capitalStructure }}</span>
        </div>
      </div>
    </template>

    <div v-else class="pm__notfound">
      <p>프로젝트를 찾을 수 없습니다.</p>
      <button type="button" class="pm__back-btn" @click="router.push('/developer/projects')">
        프로젝트 목록으로 <IcoArrowRight :size="14" :strokeWidth="2.5" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
$accent: #4F6AF5;
$text-primary: #0f172a;
$text-secondary: #475569;
$text-muted: #94a3b8;
$border: #e2e8f0;
$surface: #ffffff;
$bg: #f8fafc;

.pm { padding: 20px; max-width: 800px; margin: 0 auto; }
.pm__loading, .pm__notfound { text-align: center; padding: 48px; color: $text-muted; font-size: 14px; }
.pm__back-btn { background: $accent; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-size: 13px; font-weight: 700; font-family: "Inter", sans-serif; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; }

.pm__header { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
.pm__back { background: $bg; border: 1px solid $border; border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: $text-secondary; flex-shrink: 0; transition: background 0.15s; &:hover { background: $border; } }
.pm__header-body { flex: 1; }
.pm__header-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.pm__type-icon { width: 28px; height: 28px; border-radius: 7px; background: linear-gradient(135deg, #eef2ff, #f0f4ff); color: $accent; display: flex; align-items: center; justify-content: center; }
.pm__type { font-size: 12px; font-weight: 600; color: $text-secondary; }
.pm__status { font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 5px; margin-left: auto; &--green { background: #dcfce7; color: #16a34a; } &--blue { background: #dbeafe; color: #2563eb; } &--amber { background: #fef3c7; color: #d97706; } }
.pm__title { font-size: 20px; font-weight: 900; color: $text-primary; margin: 0 0 4px; letter-spacing: -0.03em; }
.pm__location { display: flex; align-items: center; gap: 4px; font-size: 12px; color: $text-muted; svg { color: $text-muted; } }

.pm__kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); } }
.pm__kpi { background: $surface; border: 1px solid $border; border-radius: 10px; padding: 12px; text-align: center; }
.pm__kpi-label { display: block; font-size: 10.5px; font-weight: 600; color: $text-muted; margin-bottom: 3px; }
.pm__kpi-val { font-size: 16px; font-weight: 900; color: $text-primary; font-variant-numeric: tabular-nums; &--accent { color: $accent; } }

.pm__section { background: $surface; border: 1px solid $border; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
.pm__section-title { display: flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 800; color: $text-primary; margin: 0 0 12px; svg { color: $accent; } }

.pm__funding-bar { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; margin-bottom: 6px; }
.pm__funding-fill { height: 100%; background: linear-gradient(90deg, $accent, #818cf8); border-radius: 5px; transition: width 0.4s; }
.pm__funding-labels { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: $accent; }
.pm__funding-total { color: $text-muted; font-weight: 600; }

.pm__milestones { display: flex; align-items: center; gap: 0; overflow-x: auto; padding-bottom: 4px; }
.pm__ms { display: flex; align-items: center; flex-shrink: 0; position: relative; }
.pm__ms-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid $border; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: $text-muted; background: $bg; flex-shrink: 0; .pm__ms--done & { background: $accent; border-color: $accent; color: #fff; } }
.pm__ms-label { font-size: 10.5px; font-weight: 600; color: $text-muted; margin-left: 5px; white-space: nowrap; .pm__ms--done & { color: $accent; font-weight: 700; } }
.pm__ms-line { width: 24px; height: 2px; background: $border; margin: 0 4px; flex-shrink: 0; &--done { background: $accent; } }

.pm__empty { text-align: center; padding: 20px; color: $text-muted; font-size: 13px; }
.pm__records { display: flex; flex-direction: column; gap: 5px; }
.pm__record { display: flex; align-items: center; gap: 8px; padding: 7px 10px; background: $bg; border-radius: 6px; font-size: 12px; }
.pm__record-type { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; white-space: nowrap; &--settlement { background: #dbeafe; color: #2563eb; } &--generation { background: #dcfce7; color: #16a34a; } &--milestone { background: #ede9fe; color: #7c3aed; } &--lease { background: #fef3c7; color: #d97706; } &--rec_issuance { background: #ccfbf1; color: #0d9488; } &--community_benefit { background: #fce7f3; color: #db2777; } }
.pm__record-hash { font-family: "JetBrains Mono", monospace; font-size: 10.5px; color: $text-muted; flex: 1; }
.pm__record-verified { color: #16a34a; flex-shrink: 0; }
.pm__record-date { font-size: 10.5px; color: $text-muted; white-space: nowrap; }

.pm__desc { font-size: 13px; line-height: 1.7; color: $text-secondary; margin: 0 0 10px; }
.pm__tags { display: flex; flex-wrap: wrap; gap: 6px; }
.pm__tag { font-size: 10.5px; font-weight: 600; padding: 3px 9px; background: $bg; border: 1px solid $border; border-radius: 5px; color: $text-secondary; }
</style>
