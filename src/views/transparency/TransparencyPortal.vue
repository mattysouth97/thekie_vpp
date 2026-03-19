<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useBlockchainStore } from "@/stores/blockchain-store";
import { IcoBlockchain, IcoCheck, IcoSearch, IcoArrowRight, IcoGlobe, IcoChartUp } from "@/components/icons";

const blockchainStore = useBlockchainStore();

const verifyInput = ref("");
const verifyResult = ref<"idle" | "found" | "not_found">("idle");
const verifiedRecord = ref<ReturnType<typeof blockchainStore.verifyByHash>>(null);

function handleVerify() {
  const hash = verifyInput.value.trim();
  if (!hash) return;
  const record = blockchainStore.verifyByHash(hash);
  if (record) {
    verifiedRecord.value = record;
    verifyResult.value = "found";
  } else {
    verifiedRecord.value = null;
    verifyResult.value = "not_found";
  }
}

const TYPE_LABELS: Record<string, string> = {
  settlement: "정산",
  generation: "발전량",
  milestone: "마일스톤",
  lease: "임대 계약",
  rec_issuance: "REC 발급",
  community_benefit: "지역사회 혜택",
};

onMounted(() => {
  blockchainStore.loadRecords();
});
</script>

<template>
  <div class="tp">
    <div class="tp__hero">
      <div class="tp__hero-bg"></div>
      <div class="tp__hero-content">
        <div class="tp__hero-badge">
          <IcoBlockchain :size="14" :strokeWidth="2" />
          블록체인 투명성 포털
        </div>
        <h1 class="tp__hero-title">THEKIE 재생에너지 플랫폼<br />투명성 검증 시스템</h1>
        <p class="tp__hero-sub">모든 정산, 발전량, 임대 기록이 블록체인에 투명하게 기록됩니다. 누구나 검증할 수 있습니다.</p>

        <div class="tp__stats-row">
          <div class="tp__stat">
            <span class="tp__stat-val">{{ blockchainStore.stats.totalMwDeployed }} MW</span>
            <span class="tp__stat-label">총 설비 용량</span>
          </div>
          <div class="tp__stat">
            <span class="tp__stat-val">{{ blockchainStore.stats.totalInvested }}</span>
            <span class="tp__stat-label">누적 투자</span>
          </div>
          <div class="tp__stat">
            <span class="tp__stat-val">{{ blockchainStore.stats.totalCo2Avoided.toLocaleString() }} tCO2</span>
            <span class="tp__stat-label">탄소 감축</span>
          </div>
          <div class="tp__stat">
            <span class="tp__stat-val">{{ blockchainStore.totalRecords }}건</span>
            <span class="tp__stat-label">블록체인 기록</span>
          </div>
        </div>
      </div>
    </div>

    <div class="tp__body">
      <!-- Verification tool -->
      <section class="tp__section">
        <h2 class="tp__section-title">
          <IcoSearch :size="16" :strokeWidth="2" />
          거래 검증
        </h2>
        <p class="tp__section-desc">거래 해시를 입력하여 블록체인 기록을 검증하세요</p>
        <div class="tp__verify-form">
          <input
            v-model="verifyInput"
            type="text"
            class="tp__verify-input"
            placeholder="0x 트랜잭션 해시 입력..."
            @keyup.enter="handleVerify"
          />
          <button type="button" class="tp__verify-btn" @click="handleVerify">검증</button>
        </div>

        <div v-if="verifyResult === 'found' && verifiedRecord" class="tp__verify-result tp__verify-result--found">
          <IcoCheck :size="16" :strokeWidth="2.5" />
          <div>
            <strong>기록 확인됨</strong>
            <span class="tp__verify-detail">
              {{ TYPE_LABELS[verifiedRecord.recordType] }} | {{ verifiedRecord.projectName }} | {{ new Date(verifiedRecord.createdAt).toLocaleDateString('ko-KR') }}
            </span>
          </div>
        </div>
        <div v-else-if="verifyResult === 'not_found'" class="tp__verify-result tp__verify-result--notfound">
          해당 해시에 대한 기록을 찾을 수 없습니다.
        </div>
      </section>

      <!-- Recent records -->
      <section class="tp__section">
        <h2 class="tp__section-title">
          <IcoChartUp :size="16" :strokeWidth="2" />
          최근 블록체인 기록
        </h2>
        <div class="tp__records">
          <div v-for="r in blockchainStore.records.slice(0, 8)" :key="r.id" class="tp__record">
            <span class="tp__record-type" :class="`tp__record-type--${r.recordType}`">{{ TYPE_LABELS[r.recordType] }}</span>
            <span class="tp__record-project">{{ r.projectName }}</span>
            <code class="tp__record-hash">{{ blockchainStore.shortHash(r.txHash) }}</code>
            <IcoCheck v-if="r.verified" class="tp__record-verified" :size="13" :strokeWidth="2.5" />
            <span class="tp__record-date">{{ new Date(r.createdAt).toLocaleDateString('ko-KR') }}</span>
          </div>
        </div>
      </section>

      <div class="tp__cta">
        <IcoGlobe :size="18" :strokeWidth="2" />
        <div>
          <strong>플랫폼에 참여하세요</strong>
          <p>투자자, 개발사, 지자체 모두가 함께하는 재생에너지 생태계</p>
        </div>
        <router-link to="/signup" class="tp__cta-btn">
          시작하기 <IcoArrowRight :size="14" :strokeWidth="2.5" />
        </router-link>
      </div>
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

.tp { font-family: "Inter", sans-serif; }

.tp__hero {
  position: relative; padding: 48px 24px 36px; overflow: hidden;
  background: linear-gradient(135deg, #06082a 0%, #0f1a4a 100%);
}
.tp__hero-bg {
  position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(rgba(79,106,245,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(79,106,245,0.06) 1px, transparent 1px);
  background-size: 40px 40px;
}
.tp__hero-content { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; text-align: center; }
.tp__hero-badge {
  display: inline-flex; align-items: center; gap: 6px; background: rgba(79,106,245,0.2); color: #93b4ff;
  font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 20px; margin-bottom: 16px;
}
.tp__hero-title { font-size: 26px; font-weight: 900; color: #fff; margin: 0 0 10px; letter-spacing: -0.03em; line-height: 1.35; }
.tp__hero-sub { font-size: 14px; color: rgba(255,255,255,0.5); margin: 0 0 28px; line-height: 1.6; }

.tp__stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
}
.tp__stat { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; text-align: center; }
.tp__stat-val { display: block; font-size: 17px; font-weight: 900; color: #fff; font-variant-numeric: tabular-nums; margin-bottom: 2px; }
.tp__stat-label { font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 600; }

.tp__body { max-width: 720px; margin: 0 auto; padding: 24px; }

.tp__section { background: $surface; border: 1px solid $border; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.tp__section-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 800; color: $text-primary; margin: 0 0 4px; svg { color: $accent; } }
.tp__section-desc { font-size: 12.5px; color: $text-muted; margin: 0 0 14px; }

.tp__verify-form { display: flex; gap: 8px; margin-bottom: 12px; }
.tp__verify-input {
  flex: 1; height: 42px; padding: 0 14px; background: $bg; border: 1px solid $border; border-radius: 8px;
  font-size: 13px; font-family: "JetBrains Mono", monospace; color: $text-primary; outline: none;
  &:focus { border-color: $accent; box-shadow: 0 0 0 3px rgba(79,106,245,0.1); }
  &::placeholder { color: $text-muted; font-family: "Inter", sans-serif; }
}
.tp__verify-btn {
  padding: 0 20px; background: $accent; color: #fff; border: none; border-radius: 8px; font-size: 13px;
  font-weight: 700; font-family: "Inter", sans-serif; cursor: pointer; transition: background 0.15s;
  &:hover { background: #3b56d9; }
}

.tp__verify-result {
  padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 500;
  &--found { background: #dcfce7; color: #16a34a; display: flex; align-items: center; gap: 8px; strong { display: block; font-weight: 700; } }
  &--notfound { background: #fef2f2; color: #dc2626; }
}
.tp__verify-detail { display: block; font-size: 11.5px; color: #15803d; margin-top: 2px; }

.tp__records { display: flex; flex-direction: column; gap: 6px; }
.tp__record {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: $bg; border-radius: 6px;
  font-size: 12px;
}
.tp__record-type {
  font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; white-space: nowrap;
  &--settlement { background: #dbeafe; color: #2563eb; }
  &--generation { background: #dcfce7; color: #16a34a; }
  &--milestone { background: #ede9fe; color: #7c3aed; }
  &--lease { background: #fef3c7; color: #d97706; }
  &--rec_issuance { background: #ccfbf1; color: #0d9488; }
  &--community_benefit { background: #fce7f3; color: #db2777; }
}
.tp__record-project { font-weight: 600; color: $text-primary; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tp__record-hash { font-family: "JetBrains Mono", monospace; font-size: 10.5px; color: $text-muted; }
.tp__record-verified { color: #16a34a; flex-shrink: 0; }
.tp__record-date { font-size: 10.5px; color: $text-muted; white-space: nowrap; }

.tp__cta {
  display: flex; align-items: center; gap: 14px; background: linear-gradient(135deg, #f0f4ff, #fdf4ff); border: 1px solid #e0e7ff;
  border-radius: 12px; padding: 18px 20px;
  svg:first-child { color: $accent; flex-shrink: 0; }
  strong { font-size: 14px; color: $text-primary; display: block; }
  p { font-size: 12px; color: $text-muted; margin: 2px 0 0; }
}
.tp__cta-btn {
  display: inline-flex; align-items: center; gap: 5px; padding: 10px 18px; background: $accent; color: #fff;
  font-size: 13px; font-weight: 700; border-radius: 8px; text-decoration: none; white-space: nowrap; margin-left: auto;
  transition: background 0.15s;
  &:hover { background: #3b56d9; }
}
</style>
