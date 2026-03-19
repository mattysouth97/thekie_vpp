<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useWalletStore, type ChainId } from "@/stores/wallet-store";
import { IcoClose, IcoCheck, IcoLock, IcoArrowRight, IcoBlockchain, IcoWallet, IcoEye, IcoEyeOff, IcoStar, IcoGlobe, IcoSettings, IcoLink } from "@/components/icons";
import QrcodeVue from "qrcode-vue3";
import * as jdenticon from "jdenticon";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

const walletStore = useWalletStore();

// ── View state ──
type WalletView = "main" | "create" | "import" | "unlock" | "send" | "receive" | "token-detail";
const currentView = ref<WalletView>("main");
const activeTab = ref<"tokens" | "activity" | "security">("tokens");
const chainFilter = ref<ChainId | "all">("all");

// ── Create wallet flow ──
const createStep = ref(0); // 0=password, 1=mnemonic, 2=verify, 3=done
const password = ref("");
const passwordConfirm = ref("");
const passwordError = ref("");
const showMnemonic = ref(false);
const generatedMnemonic = ref("");
const mnemonicWords = computed(() => generatedMnemonic.value.split(" "));
const verifyIndices = ref<number[]>([]);
const verifyInputs = ref<string[]>(["", "", ""]);
const verifyError = ref("");

// ── Import wallet flow ──
const importPhrase = ref("");
const importPassword = ref("");
const importError = ref("");

// ── Unlock flow ──
const unlockPassword = ref("");
const unlockError = ref("");

// ── Send flow ──
const sendChain = ref<ChainId>("ethereum");
const sendToken = ref("ETH");
const sendTo = ref("");
const sendAmount = ref("");
const sendMemo = ref("");

// ── Receive flow ──
const receiveChain = ref<ChainId>("ethereum");

// ── Token detail ──
const selectedToken = ref<string | null>(null);

// ── Identicon ──
const identiconSvg = computed(() => {
  if (!walletStore.currentAccount) return "";
  return jdenticon.toSvg(walletStore.currentAccount.ethAddress, 48);
});

// ── Clipboard ──
const copiedAddr = ref(false);
async function copyAddress(addr: string) {
  await navigator.clipboard.writeText(addr);
  copiedAddr.value = true;
  setTimeout(() => { copiedAddr.value = false; }, 2000);
}

// ── Receive address ──
const receiveAddress = computed(() => {
  if (!walletStore.currentAccount) return "";
  switch (receiveChain.value) {
    case "ethereum": return walletStore.currentAccount.ethAddress;
    case "solana": return walletStore.currentAccount.solAddress;
    case "thekie": return walletStore.currentAccount.tkAddress;
    default: return "";
  }
});

// ── Filtered tokens ──
const filteredTokens = computed(() => {
  if (chainFilter.value === "all") return walletStore.tokens;
  return walletStore.tokens.filter(t => t.chain === chainFilter.value);
});

// ── Filtered transactions ──
const filteredTx = computed(() => {
  if (chainFilter.value === "all") return walletStore.transactions;
  return walletStore.transactions.filter(t => t.chain === chainFilter.value);
});

// ── Token for detail view ──
const detailToken = computed(() => {
  if (!selectedToken.value) return null;
  return walletStore.tokens.find(t => t.symbol === selectedToken.value) || null;
});

const detailTokenTx = computed(() => {
  if (!selectedToken.value) return [];
  return walletStore.transactions.filter(t => t.symbol === selectedToken.value);
});

// ── Format helpers ──
function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatBalance(amount: number, decimals = 4): string {
  if (amount >= 1000) return amount.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
  return amount.toFixed(Math.min(decimals, 6));
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(ts).toLocaleDateString("ko-KR");
}

function txTypeLabel(type: string): string {
  const map: Record<string, string> = {
    send: "전송",
    receive: "수신",
    swap: "스왑",
    stake: "스테이킹",
    settlement: "정산",
    reward: "보상",
  };
  return map[type] || type;
}

function txTypeColor(type: string): string {
  const map: Record<string, string> = {
    send: "#ef4444",
    receive: "#22c55e",
    swap: "#a855f7",
    stake: "#3b82f6",
    settlement: "#f59e0b",
    reward: "#14b8a6",
  };
  return map[type] || "#64748b";
}

function chainLabel(chain: ChainId): string {
  return { ethereum: "Ethereum", solana: "Solana", thekie: "THEKIE" }[chain];
}

function chainColor(chain: ChainId): string {
  return { ethereum: "#627EEA", solana: "#9945FF", thekie: "#4F6AF5" }[chain];
}

// ── Wallet creation flow ──
function startCreate() {
  createStep.value = 0;
  password.value = "";
  passwordConfirm.value = "";
  passwordError.value = "";
  generatedMnemonic.value = walletStore.generateMnemonic();
  currentView.value = "create";
}

function startImport() {
  importPhrase.value = "";
  importPassword.value = "";
  importError.value = "";
  currentView.value = "import";
}

function nextCreateStep() {
  if (createStep.value === 0) {
    if (password.value.length < 6) {
      passwordError.value = "비밀번호는 6자 이상이어야 합니다";
      return;
    }
    if (password.value !== passwordConfirm.value) {
      passwordError.value = "비밀번호가 일치하지 않습니다";
      return;
    }
    passwordError.value = "";
    createStep.value = 1;
  } else if (createStep.value === 1) {
    // Pick 3 random word indices to verify
    const indices: number[] = [];
    while (indices.length < 3) {
      const i = Math.floor(Math.random() * 12);
      if (!indices.includes(i)) indices.push(i);
    }
    indices.sort((a, b) => a - b);
    verifyIndices.value = indices;
    verifyInputs.value = ["", "", ""];
    verifyError.value = "";
    createStep.value = 2;
  } else if (createStep.value === 2) {
    const words = generatedMnemonic.value.split(" ");
    for (let i = 0; i < 3; i++) {
      if (verifyInputs.value[i].trim().toLowerCase() !== words[verifyIndices.value[i]]) {
        verifyError.value = "단어가 일치하지 않습니다. 다시 확인해 주세요.";
        return;
      }
    }
    verifyError.value = "";
    finishCreate();
  }
}

async function finishCreate() {
  try {
    await walletStore.createWallet(password.value, generatedMnemonic.value);
    createStep.value = 3;
    setTimeout(() => {
      currentView.value = "main";
    }, 2000);
  } catch (e) {
    passwordError.value = "지갑 생성 중 오류가 발생했습니다.";
  }
}

async function doImport() {
  importError.value = "";
  if (!importPhrase.value.trim()) {
    importError.value = "복구 문구를 입력해 주세요.";
    return;
  }
  if (importPassword.value.length < 6) {
    importError.value = "비밀번호는 6자 이상이어야 합니다.";
    return;
  }
  try {
    await walletStore.importWallet(importPhrase.value.trim(), importPassword.value);
    currentView.value = "main";
  } catch {
    importError.value = "유효하지 않은 복구 문구입니다.";
  }
}

async function doUnlock() {
  unlockError.value = "";
  const ok = await walletStore.unlockWallet(unlockPassword.value);
  if (ok) {
    currentView.value = "main";
    unlockPassword.value = "";
  } else {
    unlockError.value = "비밀번호가 올바르지 않습니다.";
  }
}

function openTokenDetail(symbol: string) {
  selectedToken.value = symbol;
  currentView.value = "token-detail";
}

// ── Init on mount ──
onMounted(async () => {
  await walletStore.init();
  if (!walletStore.isInitialized) {
    currentView.value = "create";
  } else if (walletStore.isLocked) {
    currentView.value = "unlock";
  } else {
    currentView.value = "main";
  }
});

// Watch open prop to reset view when reopened
watch(() => props.open, (val) => {
  if (val) {
    if (!walletStore.isInitialized) {
      currentView.value = "create";
    } else if (walletStore.isLocked) {
      currentView.value = "unlock";
    } else {
      currentView.value = "main";
    }
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="lucia-fade">
      <div v-if="open" class="lucia-overlay" @click.self="emit('close')"></div>
    </Transition>
    <Transition name="lucia-slide">
      <div v-if="open" class="lucia-drawer">

        <!-- ═══════════ HEADER ═══════════ -->
        <div class="lucia-head">
          <div class="lucia-head__brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="8" cy="8" r="5" fill="#FF6B6B" opacity="0.85"/>
              <circle cx="16" cy="8" r="5" fill="#4ECDC4" opacity="0.85"/>
              <circle cx="12" cy="15" r="5" fill="#FFE66D" opacity="0.85"/>
            </svg>
            <span class="lucia-head__name">LUCIA</span>
            <span class="lucia-head__chain">THEKIE Chain</span>
          </div>
          <div class="lucia-head__right">
            <span class="lucia-head__net" :class="{ 'lucia-head__net--live': !walletStore.isLocked }">
              <span class="lucia-head__net-dot"></span>
              {{ walletStore.isLocked ? 'Locked' : 'Connected' }}
            </span>
            <button type="button" class="lucia-head__close" @click="emit('close')">
              <IcoClose :size="18" :strokeWidth="2" />
            </button>
          </div>
        </div>

        <!-- ═══════════ CREATE WALLET ═══════════ -->
        <template v-if="currentView === 'create' && !walletStore.isInitialized">
          <div class="lucia-body lucia-create">
            <!-- Step 0: Password -->
            <template v-if="createStep === 0">
              <div class="lucia-create__hero">
                <div class="lucia-create__icon-ring">
                  <IcoWallet :size="32" :strokeWidth="1.8" />
                </div>
                <h2 class="lucia-create__title">새 지갑 만들기</h2>
                <p class="lucia-create__desc">BIP-39 니모닉 기반 HD 지갑을 생성합니다.<br>Ethereum, Solana, THEKIE Chain을 지원합니다.</p>
              </div>

              <div class="lucia-form">
                <label class="lucia-form__label">비밀번호 설정</label>
                <input v-model="password" type="password" class="lucia-form__input" placeholder="6자 이상" autocomplete="new-password" />
                <label class="lucia-form__label">비밀번호 확인</label>
                <input v-model="passwordConfirm" type="password" class="lucia-form__input" placeholder="비밀번호 재입력" autocomplete="new-password" @keyup.enter="nextCreateStep" />
                <p v-if="passwordError" class="lucia-form__error">{{ passwordError }}</p>
              </div>

              <div class="lucia-create__btns">
                <button class="lucia-btn lucia-btn--primary lucia-btn--full" @click="nextCreateStep">
                  지갑 생성하기
                  <IcoArrowRight :size="14" :strokeWidth="2.5" />
                </button>
                <button class="lucia-btn lucia-btn--ghost lucia-btn--full" @click="startImport">
                  기존 지갑 복구
                </button>
              </div>
            </template>

            <!-- Step 1: Show Mnemonic -->
            <template v-else-if="createStep === 1">
              <div class="lucia-create__hero">
                <h2 class="lucia-create__title">복구 문구 백업</h2>
                <p class="lucia-create__desc">아래 12개 단어를 순서대로 안전하게 보관하세요.<br>이 문구를 잃으면 지갑을 복구할 수 없습니다.</p>
              </div>

              <div class="lucia-mnemonic">
                <div class="lucia-mnemonic__toggle" @click="showMnemonic = !showMnemonic">
                  <component :is="showMnemonic ? IcoEyeOff : IcoEye" :size="14" :strokeWidth="2" />
                  {{ showMnemonic ? '숨기기' : '복구 문구 보기' }}
                </div>
                <div class="lucia-mnemonic__grid" :class="{ 'lucia-mnemonic__grid--blur': !showMnemonic }">
                  <div v-for="(word, i) in mnemonicWords" :key="i" class="lucia-mnemonic__word">
                    <span class="lucia-mnemonic__num">{{ i + 1 }}</span>
                    {{ word }}
                  </div>
                </div>
              </div>

              <div class="lucia-create__warn">
                <IcoLock :size="13" :strokeWidth="2.2" />
                절대 스크린샷을 찍거나 온라인에 저장하지 마세요
              </div>

              <button class="lucia-btn lucia-btn--primary lucia-btn--full" @click="nextCreateStep">
                백업 완료 — 검증하기
                <IcoArrowRight :size="14" :strokeWidth="2.5" />
              </button>
            </template>

            <!-- Step 2: Verify Mnemonic -->
            <template v-else-if="createStep === 2">
              <div class="lucia-create__hero">
                <h2 class="lucia-create__title">복구 문구 검증</h2>
                <p class="lucia-create__desc">백업한 문구에서 아래 번호에 해당하는 단어를 입력하세요.</p>
              </div>

              <div class="lucia-form">
                <div v-for="(idx, i) in verifyIndices" :key="idx" class="lucia-verify-row">
                  <span class="lucia-verify-row__num">#{{ idx + 1 }}</span>
                  <input v-model="verifyInputs[i]" type="text" class="lucia-form__input" :placeholder="`${idx + 1}번째 단어`" @keyup.enter="nextCreateStep" />
                </div>
                <p v-if="verifyError" class="lucia-form__error">{{ verifyError }}</p>
              </div>

              <button class="lucia-btn lucia-btn--primary lucia-btn--full" :disabled="walletStore.isCreating" @click="nextCreateStep">
                {{ walletStore.isCreating ? '생성 중...' : '지갑 생성 완료' }}
              </button>
            </template>

            <!-- Step 3: Success -->
            <template v-else-if="createStep === 3">
              <div class="lucia-create__hero lucia-create__hero--success">
                <div class="lucia-create__check">
                  <IcoCheck :size="32" :strokeWidth="2.5" />
                </div>
                <h2 class="lucia-create__title">지갑 생성 완료!</h2>
                <p class="lucia-create__desc">멀티체인 HD 지갑이 성공적으로 생성되었습니다.</p>
              </div>
            </template>
          </div>
        </template>

        <!-- ═══════════ IMPORT WALLET ═══════════ -->
        <template v-else-if="currentView === 'import'">
          <div class="lucia-body lucia-create">
            <div class="lucia-create__hero">
              <h2 class="lucia-create__title">지갑 복구</h2>
              <p class="lucia-create__desc">12단어 복구 문구를 입력하여 기존 지갑을 복구합니다.</p>
            </div>
            <div class="lucia-form">
              <label class="lucia-form__label">복구 문구 (12 words)</label>
              <textarea v-model="importPhrase" class="lucia-form__textarea" rows="3" placeholder="단어를 공백으로 구분하여 입력..."></textarea>
              <label class="lucia-form__label">새 비밀번호</label>
              <input v-model="importPassword" type="password" class="lucia-form__input" placeholder="6자 이상" />
              <p v-if="importError" class="lucia-form__error">{{ importError }}</p>
            </div>
            <div class="lucia-create__btns">
              <button class="lucia-btn lucia-btn--primary lucia-btn--full" @click="doImport">
                지갑 복구하기
              </button>
              <button class="lucia-btn lucia-btn--ghost lucia-btn--full" @click="currentView = 'create'; createStep = 0;">
                새 지갑 만들기
              </button>
            </div>
          </div>
        </template>

        <!-- ═══════════ UNLOCK ═══════════ -->
        <template v-else-if="currentView === 'unlock'">
          <div class="lucia-body lucia-create">
            <div class="lucia-create__hero">
              <div class="lucia-create__icon-ring">
                <IcoLock :size="28" :strokeWidth="2" />
              </div>
              <h2 class="lucia-create__title">지갑 잠금 해제</h2>
              <p class="lucia-create__desc">비밀번호를 입력하여 LUCIA 지갑에 접근하세요.</p>
            </div>
            <div class="lucia-form">
              <input v-model="unlockPassword" type="password" class="lucia-form__input" placeholder="비밀번호 입력" @keyup.enter="doUnlock" />
              <p v-if="unlockError" class="lucia-form__error">{{ unlockError }}</p>
            </div>
            <button class="lucia-btn lucia-btn--primary lucia-btn--full" @click="doUnlock">
              잠금 해제
            </button>
          </div>
        </template>

        <!-- ═══════════ MAIN WALLET VIEW ═══════════ -->
        <template v-else-if="currentView === 'main'">
          <div class="lucia-body">

            <!-- Balance Card -->
            <div class="lucia-balance">
              <div class="lucia-balance__top">
                <div class="lucia-balance__ident" v-html="identiconSvg"></div>
                <div class="lucia-balance__info">
                  <div class="lucia-balance__addr" @click="copyAddress(walletStore.currentAccount?.ethAddress || '')">
                    {{ walletStore.shortenAddress(walletStore.currentAccount?.ethAddress || '') }}
                    <span v-if="copiedAddr" class="lucia-balance__copied">
                      <IcoCheck :size="10" :strokeWidth="3" /> copied
                    </span>
                  </div>
                  <div class="lucia-balance__kyc">
                    <IcoCheck :size="9" :strokeWidth="3" /> KYC 인증
                  </div>
                </div>
              </div>

              <div class="lucia-balance__amount">
                {{ formatKRW(walletStore.totalBalanceKRW) }}
              </div>
              <div class="lucia-balance__sub">
                ≈ {{ formatUSD(walletStore.totalBalanceUSD) }}
              </div>

              <!-- Allocation bar -->
              <div class="lucia-balance__alloc">
                <div
                  v-for="token in walletStore.tokens.slice(0, 5)"
                  :key="token.symbol"
                  class="lucia-balance__alloc-seg"
                  :style="{
                    width: ((token.balance * token.usdPrice) / walletStore.totalBalanceUSD * 100) + '%',
                    background: token.icon,
                  }"
                  :title="token.symbol"
                ></div>
              </div>
              <div class="lucia-balance__alloc-legend">
                <span v-for="token in walletStore.tokens.slice(0, 4)" :key="token.symbol" class="lucia-balance__alloc-tag">
                  <span class="lucia-balance__alloc-dot" :style="{ background: token.icon }"></span>
                  {{ token.symbol }}
                </span>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="lucia-actions">
              <button class="lucia-actions__btn" @click="currentView = 'receive'">
                <span class="lucia-actions__ico lucia-actions__ico--receive">
                  <IcoArrowRight :size="15" :strokeWidth="2.5" style="transform: rotate(-90deg)" />
                </span>
                입금
              </button>
              <button class="lucia-actions__btn" @click="currentView = 'send'">
                <span class="lucia-actions__ico lucia-actions__ico--send">
                  <IcoArrowRight :size="15" :strokeWidth="2.5" style="transform: rotate(90deg)" />
                </span>
                출금
              </button>
              <button class="lucia-actions__btn">
                <span class="lucia-actions__ico lucia-actions__ico--swap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                </span>
                스왑
              </button>
              <button class="lucia-actions__btn">
                <span class="lucia-actions__ico lucia-actions__ico--stake">
                  <IcoStar :size="15" :strokeWidth="2.2" />
                </span>
                스테이킹
              </button>
            </div>

            <!-- Tabs -->
            <div class="lucia-tabs">
              <button :class="['lucia-tabs__btn', { 'lucia-tabs__btn--active': activeTab === 'tokens' }]" @click="activeTab = 'tokens'">
                잔고
              </button>
              <button :class="['lucia-tabs__btn', { 'lucia-tabs__btn--active': activeTab === 'activity' }]" @click="activeTab = 'activity'">
                거래내역
              </button>
              <button :class="['lucia-tabs__btn', { 'lucia-tabs__btn--active': activeTab === 'security' }]" @click="activeTab = 'security'">
                보안
              </button>
            </div>

            <!-- Chain Filter -->
            <div v-if="activeTab !== 'security'" class="lucia-chain-filter">
              <button :class="['lucia-chain-filter__btn', { 'lucia-chain-filter__btn--active': chainFilter === 'all' }]" @click="chainFilter = 'all'">전체</button>
              <button :class="['lucia-chain-filter__btn', { 'lucia-chain-filter__btn--active': chainFilter === 'ethereum' }]" @click="chainFilter = 'ethereum'">
                <span class="lucia-chain-filter__dot" style="background: #627EEA"></span>ETH
              </button>
              <button :class="['lucia-chain-filter__btn', { 'lucia-chain-filter__btn--active': chainFilter === 'solana' }]" @click="chainFilter = 'solana'">
                <span class="lucia-chain-filter__dot" style="background: #9945FF"></span>SOL
              </button>
              <button :class="['lucia-chain-filter__btn', { 'lucia-chain-filter__btn--active': chainFilter === 'thekie' }]" @click="chainFilter = 'thekie'">
                <span class="lucia-chain-filter__dot" style="background: #4F6AF5"></span>TKE
              </button>
            </div>

            <!-- ── Tokens Tab ── -->
            <div v-if="activeTab === 'tokens'" class="lucia-tokens">
              <div
                v-for="token in filteredTokens"
                :key="token.symbol"
                class="lucia-token"
                @click="openTokenDetail(token.symbol)"
              >
                <div class="lucia-token__icon" :style="{ background: token.icon }">
                  {{ token.symbol.charAt(0) }}
                </div>
                <div class="lucia-token__info">
                  <div class="lucia-token__name">{{ token.symbol }}</div>
                  <div class="lucia-token__chain">{{ chainLabel(token.chain) }}</div>
                </div>
                <div class="lucia-token__vals">
                  <div class="lucia-token__amount">{{ formatBalance(token.balance) }} {{ token.symbol }}</div>
                  <div class="lucia-token__fiat">{{ formatKRW(token.balance * token.usdPrice * 1350) }}</div>
                </div>
              </div>
            </div>

            <!-- ── Activity Tab ── -->
            <div v-if="activeTab === 'activity'" class="lucia-activity">
              <div v-if="filteredTx.length === 0" class="lucia-empty">거래 내역이 없습니다</div>
              <div
                v-for="tx in filteredTx"
                :key="tx.id"
                class="lucia-tx"
              >
                <div class="lucia-tx__icon" :style="{ background: txTypeColor(tx.type) + '20', color: txTypeColor(tx.type) }">
                  <IcoArrowRight v-if="tx.type === 'send'" :size="14" :strokeWidth="2.5" style="transform: rotate(90deg)" />
                  <IcoArrowRight v-else-if="tx.type === 'receive'" :size="14" :strokeWidth="2.5" style="transform: rotate(-90deg)" />
                  <IcoBlockchain v-else-if="tx.type === 'settlement'" :size="14" :strokeWidth="2" />
                  <IcoStar v-else-if="tx.type === 'stake' || tx.type === 'reward'" :size="14" :strokeWidth="2" />
                  <IcoLink v-else :size="14" :strokeWidth="2" />
                </div>
                <div class="lucia-tx__info">
                  <div class="lucia-tx__type">
                    {{ txTypeLabel(tx.type) }}
                    <span class="lucia-tx__chain-badge" :style="{ color: chainColor(tx.chain) }">{{ chainLabel(tx.chain) }}</span>
                  </div>
                  <div class="lucia-tx__memo">{{ tx.memo || walletStore.shortenAddress(tx.type === 'send' ? tx.to : tx.from) }}</div>
                </div>
                <div class="lucia-tx__vals">
                  <div class="lucia-tx__amount" :class="{ 'lucia-tx__amount--plus': tx.type !== 'send' && tx.type !== 'stake' }">
                    {{ tx.type === 'send' || tx.type === 'stake' ? '-' : '+' }}{{ formatBalance(tx.amount) }} {{ tx.symbol }}
                  </div>
                  <div class="lucia-tx__time">{{ timeAgo(tx.timestamp) }}</div>
                </div>
              </div>
            </div>

            <!-- ── Security Tab ── -->
            <div v-if="activeTab === 'security'" class="lucia-security">
              <!-- Security Score -->
              <div class="lucia-sec-score">
                <div class="lucia-sec-score__ring">
                  <svg viewBox="0 0 100 100" width="80" height="80">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="6" />
                    <circle cx="50" cy="50" r="42" fill="none"
                      :stroke="walletStore.securityScore >= 75 ? '#22c55e' : walletStore.securityScore >= 50 ? '#f59e0b' : '#ef4444'"
                      stroke-width="6" stroke-linecap="round"
                      :stroke-dasharray="(walletStore.securityScore / 100 * 264) + ' 264'"
                      transform="rotate(-90 50 50)" />
                    <text x="50" y="54" text-anchor="middle" fill="#fff" font-size="20" font-weight="800">{{ walletStore.securityScore }}</text>
                  </svg>
                </div>
                <div class="lucia-sec-score__label">보안 점수</div>
              </div>

              <!-- Security Items -->
              <div class="lucia-sec-items">
                <div class="lucia-sec-item" :class="{ 'lucia-sec-item--ok': walletStore.security.hasPassword }">
                  <IcoLock :size="16" :strokeWidth="2" />
                  <span class="lucia-sec-item__label">비밀번호</span>
                  <span class="lucia-sec-item__status">{{ walletStore.security.hasPassword ? '설정됨' : '미설정' }}</span>
                </div>
                <div class="lucia-sec-item" :class="{ 'lucia-sec-item--ok': walletStore.security.kycVerified }">
                  <IcoCheck :size="16" :strokeWidth="2" />
                  <span class="lucia-sec-item__label">KYC 인증</span>
                  <span class="lucia-sec-item__status">{{ walletStore.security.kycVerified ? '완료' : '미완료' }}</span>
                </div>
                <div class="lucia-sec-item" :class="{ 'lucia-sec-item--ok': walletStore.security.has2FA }" @click="walletStore.toggleSecurity('has2FA')">
                  <IcoSettings :size="16" :strokeWidth="2" />
                  <span class="lucia-sec-item__label">2단계 인증</span>
                  <span class="lucia-sec-item__status">{{ walletStore.security.has2FA ? '활성' : '비활성' }}</span>
                  <span class="lucia-sec-item__toggle" :class="{ 'lucia-sec-item__toggle--on': walletStore.security.has2FA }">
                    <span class="lucia-sec-item__toggle-dot"></span>
                  </span>
                </div>
                <div class="lucia-sec-item" :class="{ 'lucia-sec-item--ok': walletStore.security.hasBackup }" @click="walletStore.toggleSecurity('hasBackup')">
                  <IcoWallet :size="16" :strokeWidth="2" />
                  <span class="lucia-sec-item__label">복구 문구 백업</span>
                  <span class="lucia-sec-item__status">{{ walletStore.security.hasBackup ? '완료' : '미완료' }}</span>
                  <span class="lucia-sec-item__toggle" :class="{ 'lucia-sec-item__toggle--on': walletStore.security.hasBackup }">
                    <span class="lucia-sec-item__toggle-dot"></span>
                  </span>
                </div>
              </div>

              <!-- Connected Apps -->
              <div class="lucia-sec-apps">
                <div class="lucia-sec-apps__head">연결된 앱</div>
                <div v-for="(app, i) in walletStore.security.connectedApps" :key="i" class="lucia-sec-app">
                  <div class="lucia-sec-app__icon">
                    <IcoGlobe :size="14" :strokeWidth="2" />
                  </div>
                  <div class="lucia-sec-app__info">
                    <div class="lucia-sec-app__name">{{ app.name }}</div>
                    <div class="lucia-sec-app__perms">{{ app.permissions.join(', ') }}</div>
                  </div>
                  <button class="lucia-sec-app__revoke" @click="walletStore.removeConnectedApp(i)">해제</button>
                </div>
              </div>

              <!-- Lock button -->
              <button class="lucia-btn lucia-btn--ghost lucia-btn--full lucia-btn--danger" @click="walletStore.lockWallet(); currentView = 'unlock'">
                <IcoLock :size="14" :strokeWidth="2" />
                지갑 잠금
              </button>
            </div>
          </div>
        </template>

        <!-- ═══════════ RECEIVE VIEW ═══════════ -->
        <template v-else-if="currentView === 'receive'">
          <div class="lucia-body">
            <button class="lucia-back" @click="currentView = 'main'">
              <IcoArrowRight :size="14" :strokeWidth="2.5" style="transform: rotate(180deg)" /> 뒤로
            </button>
            <h3 class="lucia-sub-title">입금 주소</h3>

            <div class="lucia-chain-filter" style="margin-bottom: 16px;">
              <button :class="['lucia-chain-filter__btn', { 'lucia-chain-filter__btn--active': receiveChain === 'ethereum' }]" @click="receiveChain = 'ethereum'">Ethereum</button>
              <button :class="['lucia-chain-filter__btn', { 'lucia-chain-filter__btn--active': receiveChain === 'solana' }]" @click="receiveChain = 'solana'">Solana</button>
              <button :class="['lucia-chain-filter__btn', { 'lucia-chain-filter__btn--active': receiveChain === 'thekie' }]" @click="receiveChain = 'thekie'">THEKIE</button>
            </div>

            <div class="lucia-receive">
              <div class="lucia-receive__qr">
                <QrcodeVue :value="receiveAddress" :size="180" :margin="2" render-as="svg" level="M" />
              </div>
              <div class="lucia-receive__addr" @click="copyAddress(receiveAddress)">
                {{ receiveAddress }}
              </div>
              <button class="lucia-btn lucia-btn--primary lucia-btn--full" @click="copyAddress(receiveAddress)">
                <IcoCheck v-if="copiedAddr" :size="14" :strokeWidth="2.5" />
                {{ copiedAddr ? '복사됨!' : '주소 복사' }}
              </button>
              <p class="lucia-receive__warn">
                {{ chainLabel(receiveChain) }} 네트워크의 자산만 이 주소로 입금하세요.
              </p>
            </div>
          </div>
        </template>

        <!-- ═══════════ SEND VIEW ═══════════ -->
        <template v-else-if="currentView === 'send'">
          <div class="lucia-body">
            <button class="lucia-back" @click="currentView = 'main'">
              <IcoArrowRight :size="14" :strokeWidth="2.5" style="transform: rotate(180deg)" /> 뒤로
            </button>
            <h3 class="lucia-sub-title">출금</h3>

            <div class="lucia-form">
              <label class="lucia-form__label">네트워크</label>
              <div class="lucia-chain-filter" style="margin-bottom: 12px;">
                <button :class="['lucia-chain-filter__btn', { 'lucia-chain-filter__btn--active': sendChain === 'ethereum' }]" @click="sendChain = 'ethereum'; sendToken = 'ETH'">ETH</button>
                <button :class="['lucia-chain-filter__btn', { 'lucia-chain-filter__btn--active': sendChain === 'solana' }]" @click="sendChain = 'solana'; sendToken = 'SOL'">SOL</button>
                <button :class="['lucia-chain-filter__btn', { 'lucia-chain-filter__btn--active': sendChain === 'thekie' }]" @click="sendChain = 'thekie'; sendToken = 'TKE'">TKE</button>
              </div>

              <label class="lucia-form__label">토큰</label>
              <select v-model="sendToken" class="lucia-form__input">
                <option v-for="t in walletStore.tokens.filter(t => t.chain === sendChain)" :key="t.symbol" :value="t.symbol">
                  {{ t.symbol }} — {{ formatBalance(t.balance) }}
                </option>
              </select>

              <label class="lucia-form__label">받는 주소</label>
              <input v-model="sendTo" type="text" class="lucia-form__input lucia-form__input--mono" placeholder="0x... 또는 Base58 주소" />

              <label class="lucia-form__label">금액</label>
              <input v-model="sendAmount" type="number" class="lucia-form__input" placeholder="0.00" step="any" />

              <label class="lucia-form__label">메모 (선택)</label>
              <input v-model="sendMemo" type="text" class="lucia-form__input" placeholder="거래 메모" />
            </div>

            <div class="lucia-send-summary">
              <div class="lucia-send-summary__row">
                <span>예상 가스비</span>
                <span>≈ {{ sendChain === 'solana' ? '0.000005 SOL' : '0.002 ETH' }}</span>
              </div>
              <div class="lucia-send-summary__row">
                <span>네트워크</span>
                <span>{{ chainLabel(sendChain) }} {{ walletStore.network === 'mainnet' ? 'Mainnet' : 'Testnet' }}</span>
              </div>
            </div>

            <button class="lucia-btn lucia-btn--primary lucia-btn--full">
              전송하기
              <IcoArrowRight :size="14" :strokeWidth="2.5" />
            </button>
          </div>
        </template>

        <!-- ═══════════ TOKEN DETAIL ═══════════ -->
        <template v-else-if="currentView === 'token-detail' && detailToken">
          <div class="lucia-body">
            <button class="lucia-back" @click="currentView = 'main'">
              <IcoArrowRight :size="14" :strokeWidth="2.5" style="transform: rotate(180deg)" /> 뒤로
            </button>

            <div class="lucia-token-detail">
              <div class="lucia-token-detail__icon" :style="{ background: detailToken.icon }">
                {{ detailToken.symbol.charAt(0) }}
              </div>
              <div class="lucia-token-detail__symbol">{{ detailToken.symbol }}</div>
              <div class="lucia-token-detail__name">{{ detailToken.name }}</div>
              <div class="lucia-token-detail__balance">{{ formatBalance(detailToken.balance) }}</div>
              <div class="lucia-token-detail__fiat">{{ formatKRW(detailToken.balance * detailToken.usdPrice * 1350) }}</div>
              <div class="lucia-token-detail__chain">
                <span class="lucia-chain-filter__dot" :style="{ background: chainColor(detailToken.chain) }"></span>
                {{ chainLabel(detailToken.chain) }}
              </div>
            </div>

            <div class="lucia-actions" style="margin-bottom: 16px;">
              <button class="lucia-actions__btn" @click="receiveChain = detailToken.chain; currentView = 'receive'">
                <span class="lucia-actions__ico lucia-actions__ico--receive"><IcoArrowRight :size="15" :strokeWidth="2.5" style="transform: rotate(-90deg)" /></span>
                입금
              </button>
              <button class="lucia-actions__btn" @click="sendChain = detailToken.chain; sendToken = detailToken.symbol; currentView = 'send'">
                <span class="lucia-actions__ico lucia-actions__ico--send"><IcoArrowRight :size="15" :strokeWidth="2.5" style="transform: rotate(90deg)" /></span>
                출금
              </button>
            </div>

            <div class="lucia-sec-apps__head">거래 내역</div>
            <div class="lucia-activity">
              <div v-if="detailTokenTx.length === 0" class="lucia-empty">{{ detailToken.symbol }} 거래 내역이 없습니다</div>
              <div v-for="tx in detailTokenTx" :key="tx.id" class="lucia-tx">
                <div class="lucia-tx__icon" :style="{ background: txTypeColor(tx.type) + '20', color: txTypeColor(tx.type) }">
                  <IcoArrowRight v-if="tx.type === 'send'" :size="14" :strokeWidth="2.5" style="transform: rotate(90deg)" />
                  <IcoArrowRight v-else-if="tx.type === 'receive'" :size="14" :strokeWidth="2.5" style="transform: rotate(-90deg)" />
                  <IcoBlockchain v-else :size="14" :strokeWidth="2" />
                </div>
                <div class="lucia-tx__info">
                  <div class="lucia-tx__type">{{ txTypeLabel(tx.type) }}</div>
                  <div class="lucia-tx__memo">{{ tx.memo || walletStore.shortenAddress(tx.type === 'send' ? tx.to : tx.from) }}</div>
                </div>
                <div class="lucia-tx__vals">
                  <div class="lucia-tx__amount" :class="{ 'lucia-tx__amount--plus': tx.type !== 'send' && tx.type !== 'stake' }">
                    {{ tx.type === 'send' || tx.type === 'stake' ? '-' : '+' }}{{ formatBalance(tx.amount) }}
                  </div>
                  <div class="lucia-tx__time">{{ timeAgo(tx.timestamp) }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>

      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
$drawer-w: 420px;
$bg-dark: #0f0f1a;
$bg-card: rgba(255, 255, 255, 0.04);
$bg-card-hover: rgba(255, 255, 255, 0.07);
$border-subtle: rgba(255, 255, 255, 0.08);
$border-focus: rgba(79, 106, 245, 0.5);
$accent: #4F6AF5;
$green: #22c55e;
$red: #ef4444;
$text-primary: #f1f5f9;
$text-secondary: #94a3b8;
$text-dim: #64748b;
$mono: "SF Mono", "Fira Code", "Cascadia Code", monospace;
$radius: 12px;
$radius-sm: 8px;

// ── Overlay & Drawer ──
.lucia-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9998;
}

.lucia-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: $drawer-w;
  max-width: 100vw;
  background: $bg-dark;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

// ── Transitions ──
.lucia-fade-enter-active,
.lucia-fade-leave-active {
  transition: opacity 0.25s ease;
}
.lucia-fade-enter-from,
.lucia-fade-leave-to {
  opacity: 0;
}

.lucia-slide-enter-active {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.lucia-slide-leave-active {
  transition: transform 0.2s ease-in;
}
.lucia-slide-enter-from,
.lucia-slide-leave-to {
  transform: translateX(100%);
}

// ── Header ──
.lucia-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid $border-subtle;
  flex-shrink: 0;

  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  &__name {
    font-size: 16px;
    font-weight: 900;
    color: #fff;
    letter-spacing: 0.1em;
  }
  &__chain {
    font-size: 9.5px;
    font-weight: 700;
    color: $accent;
    background: rgba($accent, 0.12);
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  &__right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  &__net {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    font-weight: 700;
    color: $red;
    &--live { color: $green; }
  }
  &__net-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 6px currentColor;
  }
  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: $bg-card;
    color: $text-secondary;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: all 0.12s;
    &:hover { background: $bg-card-hover; color: #fff; }
  }
}

// ── Body ──
.lucia-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
}

// ── Create Wallet ──
.lucia-create {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__hero {
    text-align: center;
    padding: 16px 0 8px;

    &--success { padding: 40px 0; }
  }
  &__icon-ring {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba($accent, 0.15);
    border: 2px solid rgba($accent, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: $accent;
  }
  &__check {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba($green, 0.15);
    border: 2px solid rgba($green, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: $green;
  }
  &__title {
    font-size: 18px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 8px;
  }
  &__desc {
    font-size: 12.5px;
    line-height: 1.6;
    color: $text-secondary;
    margin: 0;
  }
  &__btns {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  &__warn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.15);
    border-radius: $radius-sm;
    padding: 10px;
    margin-bottom: 8px;
  }
}

// ── Form ──
.lucia-form {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label {
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 4px;
  }
  &__input, &__textarea {
    width: 100%;
    padding: 10px 14px;
    font-size: 13px;
    font-family: "Inter", sans-serif;
    color: #fff;
    background: $bg-card;
    border: 1px solid $border-subtle;
    border-radius: $radius-sm;
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;

    &::placeholder { color: $text-dim; }
    &:focus { border-color: $border-focus; }

    &--mono { font-family: $mono; font-size: 12px; }
  }
  &__textarea {
    resize: vertical;
    min-height: 72px;
    font-family: $mono;
    font-size: 12px;
  }
  &__error {
    font-size: 11.5px;
    font-weight: 600;
    color: $red;
    margin: 0;
  }
}

// ── Mnemonic ──
.lucia-mnemonic {
  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 11.5px;
    font-weight: 600;
    color: $accent;
    cursor: pointer;
    margin-bottom: 12px;
    &:hover { opacity: 0.8; }
  }
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    transition: filter 0.2s;

    &--blur { filter: blur(6px); user-select: none; }
  }
  &__word {
    background: $bg-card;
    border: 1px solid $border-subtle;
    border-radius: $radius-sm;
    padding: 8px 10px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    font-family: $mono;
    text-align: center;
  }
  &__num {
    font-size: 9px;
    color: $text-dim;
    margin-right: 4px;
  }
}

// ── Verify row ──
.lucia-verify-row {
  display: flex;
  align-items: center;
  gap: 10px;

  &__num {
    font-size: 12px;
    font-weight: 800;
    color: $accent;
    min-width: 28px;
    font-family: $mono;
  }

  .lucia-form__input {
    flex: 1;
  }
}

// ── Buttons ──
.lucia-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 13px;
  font-weight: 700;
  font-family: "Inter", sans-serif;
  border: none;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: all 0.15s;

  &--primary {
    background: $accent;
    color: #fff;
    &:hover { background: #5f78f7; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
  &--ghost {
    background: transparent;
    color: $text-secondary;
    border: 1px solid $border-subtle;
    &:hover { background: $bg-card; color: #fff; }
  }
  &--full { width: 100%; }
  &--danger {
    color: $red;
    border-color: rgba($red, 0.2);
    &:hover { background: rgba($red, 0.1); }
  }
}

// ── Back button ──
.lucia-back {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: $text-secondary;
  font-size: 12px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  cursor: pointer;
  padding: 0;
  margin-bottom: 16px;
  &:hover { color: #fff; }
}

.lucia-sub-title {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 16px;
}

// ── Balance Card ──
.lucia-balance {
  background: linear-gradient(135deg, rgba($accent, 0.15) 0%, rgba(#9945FF, 0.1) 100%);
  border: 1px solid rgba($accent, 0.2);
  border-radius: $radius;
  padding: 20px;
  margin-bottom: 16px;

  &__top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  &__ident {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    background: $bg-card;
    flex-shrink: 0;
    :deep(svg) { display: block; }
  }
  &__info { flex: 1; }
  &__addr {
    font-size: 12px;
    font-weight: 600;
    color: $text-secondary;
    font-family: $mono;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    &:hover { color: #fff; }
  }
  &__copied {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 10px;
    font-weight: 700;
    color: $green;
    font-family: "Inter", sans-serif;
  }
  &__kyc {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 700;
    color: $green;
    background: rgba($green, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
    margin-top: 4px;
  }
  &__amount {
    font-size: 26px;
    font-weight: 900;
    color: #fff;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
    line-height: 1;
  }
  &__sub {
    font-size: 12px;
    color: $text-dim;
    margin-top: 4px;
    margin-bottom: 14px;
  }
  &__alloc {
    display: flex;
    height: 4px;
    border-radius: 2px;
    overflow: hidden;
    gap: 2px;
    margin-bottom: 8px;
  }
  &__alloc-seg {
    height: 100%;
    border-radius: 2px;
    min-width: 4px;
  }
  &__alloc-legend {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  &__alloc-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 600;
    color: $text-dim;
  }
  &__alloc-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
}

// ── Quick Actions ──
.lucia-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;

  &__btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 4px;
    background: $bg-card;
    border: 1px solid $border-subtle;
    border-radius: $radius;
    color: $text-secondary;
    font-size: 11px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    cursor: pointer;
    transition: all 0.12s;

    &:hover { background: $bg-card-hover; color: #fff; border-color: rgba(#fff, 0.12); }
  }
  &__ico {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &--receive { background: rgba($green, 0.12); color: $green; }
    &--send { background: rgba($red, 0.12); color: $red; }
    &--swap { background: rgba(#a855f7, 0.12); color: #a855f7; }
    &--stake { background: rgba(#3b82f6, 0.12); color: #3b82f6; }
  }
}

// ── Tabs ──
.lucia-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid $border-subtle;
  margin-bottom: 12px;

  &__btn {
    flex: 1;
    padding: 10px 0;
    font-size: 12.5px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    color: $text-dim;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
    text-align: center;

    &:hover { color: $text-secondary; }
    &--active {
      color: #fff;
      border-bottom-color: $accent;
    }
  }
}

// ── Chain filter ──
.lucia-chain-filter {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;

  &__btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    font-size: 11px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    color: $text-dim;
    background: $bg-card;
    border: 1px solid $border-subtle;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.12s;

    &:hover { color: $text-secondary; background: $bg-card-hover; }
    &--active {
      color: #fff;
      background: rgba($accent, 0.15);
      border-color: rgba($accent, 0.3);
    }
  }
  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
}

// ── Token list ──
.lucia-tokens {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lucia-token {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: background 0.12s;

  &:hover { background: $bg-card; }

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
    color: #fff;
    flex-shrink: 0;
  }
  &__info { flex: 1; min-width: 0; }
  &__name {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
  }
  &__chain {
    font-size: 10.5px;
    color: $text-dim;
  }
  &__vals { text-align: right; }
  &__amount {
    font-size: 12.5px;
    font-weight: 700;
    color: #fff;
    font-variant-numeric: tabular-nums;
  }
  &__fiat {
    font-size: 10.5px;
    color: $text-dim;
    font-variant-numeric: tabular-nums;
  }
}

// ── Activity / Transactions ──
.lucia-activity {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lucia-empty {
  text-align: center;
  padding: 32px 0;
  font-size: 12.5px;
  color: $text-dim;
}

.lucia-tx {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: $radius-sm;
  transition: background 0.12s;

  &:hover { background: $bg-card; }

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  &__info { flex: 1; min-width: 0; }
  &__type {
    font-size: 12.5px;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  &__chain-badge {
    font-size: 9px;
    font-weight: 700;
    opacity: 0.7;
  }
  &__memo {
    font-size: 10.5px;
    color: $text-dim;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__vals { text-align: right; flex-shrink: 0; }
  &__amount {
    font-size: 12px;
    font-weight: 700;
    color: $red;
    font-variant-numeric: tabular-nums;

    &--plus { color: $green; }
  }
  &__time {
    font-size: 10px;
    color: $text-dim;
  }
}

// ── Receive ──
.lucia-receive {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  &__qr {
    background: #fff;
    padding: 16px;
    border-radius: $radius;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__addr {
    font-size: 11px;
    font-family: $mono;
    color: $text-secondary;
    word-break: break-all;
    text-align: center;
    padding: 10px 14px;
    background: $bg-card;
    border: 1px solid $border-subtle;
    border-radius: $radius-sm;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
    &:hover { color: #fff; }
  }
  &__warn {
    font-size: 11px;
    color: #f59e0b;
    text-align: center;
    margin: 0;
  }
}

// ── Send summary ──
.lucia-send-summary {
  background: $bg-card;
  border: 1px solid $border-subtle;
  border-radius: $radius-sm;
  padding: 12px 14px;
  margin-bottom: 16px;

  &__row {
    display: flex;
    justify-content: space-between;
    font-size: 11.5px;
    color: $text-secondary;
    padding: 4px 0;

    span:last-child { color: #fff; font-weight: 600; }
  }
}

// ── Token detail ──
.lucia-token-detail {
  text-align: center;
  margin-bottom: 20px;

  &__icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    margin: 0 auto 12px;
  }
  &__symbol {
    font-size: 18px;
    font-weight: 800;
    color: #fff;
  }
  &__name {
    font-size: 12px;
    color: $text-dim;
    margin-bottom: 12px;
  }
  &__balance {
    font-size: 28px;
    font-weight: 900;
    color: #fff;
    font-variant-numeric: tabular-nums;
  }
  &__fiat {
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 8px;
  }
  &__chain {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 700;
    color: $text-dim;
    background: $bg-card;
    padding: 4px 12px;
    border-radius: 20px;
  }
}

// ── Security ──
.lucia-security {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lucia-sec-score {
  text-align: center;
  padding: 12px 0;

  &__ring {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }
  &__label {
    font-size: 12px;
    font-weight: 700;
    color: $text-dim;
  }
}

.lucia-sec-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lucia-sec-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: $bg-card;
  border: 1px solid $border-subtle;
  border-radius: $radius-sm;
  color: $text-dim;
  cursor: default;

  &--ok { color: $green; border-color: rgba($green, 0.15); }

  &__label {
    flex: 1;
    font-size: 12.5px;
    font-weight: 700;
    color: $text-primary;
  }
  &__status {
    font-size: 11px;
    font-weight: 600;
  }
  &__toggle {
    width: 32px;
    height: 18px;
    border-radius: 9px;
    background: rgba(#fff, 0.1);
    position: relative;
    cursor: pointer;
    transition: background 0.2s;

    &--on { background: rgba($green, 0.3); }
  }
  &__toggle-dot {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: $text-dim;
    transition: all 0.2s;

    .lucia-sec-item__toggle--on & {
      left: 16px;
      background: $green;
    }
  }
}

.lucia-sec-apps {
  &__head {
    font-size: 11.5px;
    font-weight: 800;
    color: $text-dim;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
  }
}

.lucia-sec-app {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: $bg-card;
  border: 1px solid $border-subtle;
  border-radius: $radius-sm;
  margin-bottom: 4px;

  &__icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba($accent, 0.12);
    color: $accent;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__info { flex: 1; }
  &__name {
    font-size: 12px;
    font-weight: 700;
    color: #fff;
  }
  &__perms {
    font-size: 10px;
    color: $text-dim;
  }
  &__revoke {
    font-size: 10.5px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    color: $red;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.12s;
    &:hover { background: rgba($red, 0.1); }
  }
}

// ── Responsive ──
@media (max-width: 480px) {
  .lucia-drawer {
    width: 100vw;
  }
}
</style>
