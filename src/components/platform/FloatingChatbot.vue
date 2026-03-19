<script setup lang="ts">
import { ref } from "vue";
import { IcoLightning, IcoClose, IcoArrowRight, IcoUser, IcoInfo } from "@/components/icons";

defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

interface ChatMsg {
  role: "user" | "assistant";
  text: string;
}

const chatInput = ref("");
const chatMessages = ref<ChatMsg[]>([]);
const chatLoading = ref(false);
const activeTab = ref<"invest" | "energy">("invest");

// ── Investment FAQ ──
const investFaqs = [
  { q: "이 수익률 안전한가요?", a: "재생에너지 투자 수익률은 PPA 장기 계약과 REC 판매 수익에 기반합니다. 정부 보조금과 20년 장기 계약이 수익을 뒷받침하므로, 일반 주식 대비 변동성이 낮은 편입니다. 다만 기상 조건과 정책 변화 리스크는 존재합니다." },
  { q: "REC 가중치란?", a: "REC(신재생에너지 인증서) 가중치는 발전 방식에 따라 차등 적용되는 배수입니다. 예: 일반 태양광 1.0, 수상태양광 1.5, 해상풍력 2.0. 가중치가 높을수록 동일 발전량 대비 더 많은 REC를 받을 수 있어 수익이 증가합니다." },
  { q: "초보자 추천 상품은?", a: "처음 투자하시는 분께는 태양광 기반 SMP+REC 현물형 상품을 추천드립니다. 발전 구조가 단순하고, 일사량 예측이 비교적 정확하여 수익 안정성이 높습니다." },
];

// ── Energy Policy FAQ ──
const energyFaqs = [
  { q: "올해 SMP 전망은?", a: "2026년 SMP는 LNG 가격 안정화와 재생에너지 확대로 연평균 110~125원/kWh 수준이 예상됩니다. 다만 여름철 피크 시즌에는 일시적으로 150원대까지 상승할 수 있습니다." },
  { q: "RE100 정책 동향", a: "2026년 기준 RE100 가입 한국 기업은 95개사로 확대되었습니다. 정부는 제3자 PPA 활성화를 위해 전기사업법 개정안을 추진 중이며, 녹색프리미엄 단가도 인하 검토 중입니다." },
  { q: "REC 가격 하반기 전망", a: "REC 현물가는 2026년 상반기 40,000~45,000원/REC 수준에서 거래되고 있습니다. 하반기에는 RPS 상향 조정과 RE100 수요 증가로 소폭 상승하여 45,000~50,000원대가 예상됩니다." },
];

const currentFaqs = () => activeTab.value === "invest" ? investFaqs : energyFaqs;

function sendFaq(q: string, a: string) {
  chatMessages.value.push({ role: "user", text: q });
  chatLoading.value = true;
  setTimeout(() => {
    chatMessages.value.push({ role: "assistant", text: a });
    chatLoading.value = false;
  }, 800);
}

function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatMessages.value.push({ role: "user", text });
  chatInput.value = "";
  chatLoading.value = true;
  setTimeout(() => {
    chatMessages.value.push({
      role: "assistant",
      text: "좋은 질문입니다! 현재 AI 어시스턴트는 시범 운영 중입니다. 보다 정확한 답변을 위해 EPSIS(epsis.kpx.or.kr)를 참고하시거나, THEKIE 전문 상담팀(1588-0000)으로 문의해 주세요.",
    });
    chatLoading.value = false;
  }, 1000);
}

function clearChat() {
  chatMessages.value = [];
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fchat-slide">
      <div v-if="open" class="fchat" @click.self="emit('close')">
        <div class="fchat__panel">
          <!-- Header -->
          <div class="fchat__header">
            <div class="fchat__header-left">
              <div class="fchat__header-icon">
                <IcoLightning :size="16" :strokeWidth="2" />
              </div>
              <div>
                <div class="fchat__header-title">THEKIE AI</div>
                <div class="fchat__header-sub">에너지 투자 어시스턴트</div>
              </div>
            </div>
            <div class="fchat__header-actions">
              <span class="fchat__badge">Beta</span>
              <button v-if="chatMessages.length" class="fchat__clear-btn" @click="clearChat" title="대화 초기화">
                <IcoClose :size="10" :strokeWidth="2.5" />
              </button>
              <button class="fchat__close-btn" @click="emit('close')">
                <IcoClose :size="16" :strokeWidth="2" />
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="fchat__tabs">
            <button
              class="fchat__tab"
              :class="{ 'fchat__tab--active': activeTab === 'invest' }"
              @click="activeTab = 'invest'"
            >투자 상담</button>
            <button
              class="fchat__tab"
              :class="{ 'fchat__tab--active': activeTab === 'energy' }"
              @click="activeTab = 'energy'"
            >에너지 정책</button>
          </div>

          <!-- Body -->
          <div class="fchat__body">
            <!-- Welcome state -->
            <div v-if="chatMessages.length === 0" class="fchat__welcome">
              <div class="fchat__welcome-icon">
                <IcoInfo :size="20" :strokeWidth="1.5" />
              </div>
              <p class="fchat__welcome-text">
                {{ activeTab === 'invest' ? '투자에 대해 궁금한 점을 물어보세요' : '에너지 정책, 시장 동향에 대해 질문하세요' }}
              </p>
            </div>

            <!-- FAQ quick buttons -->
            <div class="fchat__faq" :class="{ 'fchat__faq--bottom': chatMessages.length > 0 }">
              <button
                v-for="faq in currentFaqs()"
                :key="faq.q"
                class="fchat__faq-btn"
                @click="sendFaq(faq.q, faq.a)"
              >{{ faq.q }}</button>
            </div>

            <!-- Messages -->
            <div v-if="chatMessages.length > 0" class="fchat__messages">
              <div
                v-for="(msg, i) in chatMessages"
                :key="i"
                class="fchat__msg"
                :class="msg.role === 'user' ? 'fchat__msg--user' : 'fchat__msg--ai'"
              >
                <div class="fchat__msg-avatar">
                  <IcoUser v-if="msg.role === 'user'" :size="12" :strokeWidth="2" />
                  <IcoLightning v-else :size="12" :strokeWidth="2" />
                </div>
                <div class="fchat__msg-bubble">{{ msg.text }}</div>
              </div>
              <div v-if="chatLoading" class="fchat__msg fchat__msg--ai">
                <div class="fchat__msg-avatar"><IcoLightning :size="12" :strokeWidth="2" /></div>
                <div class="fchat__msg-bubble fchat__msg-bubble--loading">
                  <span class="fchat__dots"><i></i><i></i><i></i></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="fchat__input-wrap">
            <input
              v-model="chatInput"
              type="text"
              class="fchat__input"
              placeholder="질문을 입력하세요..."
              @keyup.enter="sendChat"
            />
            <button type="button" class="fchat__send" :disabled="!chatInput.trim()" @click="sendChat">
              <IcoArrowRight :size="14" :strokeWidth="2.5" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
$accent: #4F6AF5;
$accent-light: #EEF2FF;
$text: #0f172a;
$text-muted: #94a3b8;
$text-secondary: #475569;
$border: #e2e8f0;
$panel-w: 380px;

.fchat {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding-top: 52px;
  padding-right: 16px;
  pointer-events: none;
}

.fchat__panel {
  width: $panel-w;
  max-height: calc(100vh - 72px);
  background: #fff;
  border: 1px solid $border;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
}

// Header
.fchat__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid $border;
  background: linear-gradient(135deg, #f8fafc 0%, $accent-light 100%);
}

.fchat__header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fchat__header-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, $accent, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.fchat__header-title {
  font-size: 13px;
  font-weight: 800;
  color: $text;
  letter-spacing: -0.02em;
}

.fchat__header-sub {
  font-size: 10px;
  color: $text-muted;
  font-weight: 500;
}

.fchat__header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fchat__badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 9999px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: linear-gradient(135deg, $accent, #6366f1);
  color: #fff;
}

.fchat__clear-btn {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: none;
  background: rgba(0,0,0,0.06);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-muted;
  transition: background 0.15s;
  &:hover { background: rgba(0,0,0,0.1); color: $text; }
}

.fchat__close-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
  transition: background 0.15s;
  &:hover { background: rgba(0,0,0,0.06); }
}

// Tabs
.fchat__tabs {
  display: flex;
  border-bottom: 1px solid $border;
  padding: 0 16px;
  gap: 0;
}

.fchat__tab {
  flex: 1;
  padding: 8px 0;
  font-size: 11.5px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  color: $text-muted;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  text-align: center;
  transition: color 0.15s, border-color 0.15s;

  &:hover { color: $text-secondary; }

  &--active {
    color: $accent;
    border-bottom-color: $accent;
  }
}

// Body
.fchat__body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
  max-height: 400px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: $border; border-radius: 2px; }
}

.fchat__welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 0 8px;
  text-align: center;
}

.fchat__welcome-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: $accent-light;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $accent;
}

.fchat__welcome-text {
  font-size: 12px;
  color: $text-secondary;
  margin: 0;
  line-height: 1.5;
}

// FAQ
.fchat__faq {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  &--bottom {
    padding-top: 6px;
    border-top: 1px solid rgba($border, 0.5);
  }
}

.fchat__faq-btn {
  background: #fff;
  border: 1px solid $border;
  border-radius: 16px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 500;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  font-family: "Inter", sans-serif;

  &:hover {
    border-color: $accent;
    color: $accent;
    background: $accent-light;
  }
}

// Messages
.fchat__messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fchat__msg {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 90%;

  &--user {
    flex-direction: row-reverse;
    align-self: flex-end;

    .fchat__msg-avatar {
      background: $accent;
      color: #fff;
    }

    .fchat__msg-bubble {
      background: $accent;
      color: #fff;
      border-radius: 14px 14px 2px 14px;
    }
  }

  &--ai {
    align-self: flex-start;

    .fchat__msg-avatar {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
    }
  }
}

.fchat__msg-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f8fafc;
  color: $text-muted;
}

.fchat__msg-bubble {
  background: #f8fafc;
  border: 1px solid $border;
  border-radius: 14px 14px 14px 2px;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.55;
  color: $text;
  word-break: break-word;

  &--loading {
    padding: 10px 18px;
    display: flex;
    align-items: center;
  }
}

.fchat__dots {
  display: flex;
  gap: 4px;

  i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: $text-muted;
    animation: fchat-bounce 1.2s ease-in-out infinite;
    display: block;

    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.3s; }
  }
}

@keyframes fchat-bounce {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}

// Input
.fchat__input-wrap {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 10px 16px;
  border-top: 1px solid $border;
  background: #fafbfc;
}

.fchat__input {
  flex: 1;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  color: $text;
  background: #fff;
  outline: none;
  font-family: "Inter", sans-serif;
  transition: border-color 0.15s;

  &::placeholder { color: $text-muted; }
  &:focus { border-color: $accent; box-shadow: 0 0 0 2px rgba($accent, 0.08); }
}

.fchat__send {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: $accent;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover { background: #3d58d9; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

// Transition
.fchat-slide-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fchat-slide-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.fchat-slide-enter-from { opacity: 0; transform: translateY(-8px) scale(0.97); }
.fchat-slide-leave-to { opacity: 0; transform: translateY(-8px) scale(0.97); }

// Responsive
@media (max-width: 480px) {
  .fchat {
    padding: 0;
  }
  .fchat__panel {
    width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>
