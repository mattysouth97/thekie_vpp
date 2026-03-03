<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  IcoSolar, IcoWind, IcoBattery, IcoHydro, IcoFuelCell,
  IcoArrowLeft, IcoMapPin, IcoCheck, IcoLightning,
  IcoChartUp, IcoDocument, IcoSmp, IcoRec,
  IcoMeter, IcoSettings, IcoInfo, IcoUsers, IcoBuilding,
} from "@/components/icons";

const route = useRoute();
const router = useRouter();

// ── Project data (synced with ProjectListView) ──

interface DetailSection { label: string; text: string }

interface Project {
  id: string;
  name: string;
  type: string;
  typeIcon: string;
  location: string;
  capacity: string;
  expectedYield: string;
  yieldRate: number;
  minInvest: string;
  progress: number;
  status: string;
  statusColor: string;
  desc: string;
  ppaYears: number;
  annualOutput: string;
  co2Reduction: string;
  investor: string;
  gridConnection: string;
  // 4-module tags
  power: string;
  powerLabel: string;
  market: string;
  marketLabel: string;
  land: string;
  landLabel: string;
  capital: string;
  capitalLabel: string;
  bizTypeLabel: string;
  // Financials
  totalFunding: string;
  currentFunding: string;
  investorCount: number;
  fundingDeadline: string;
  // Detail write-ups
  sections: DetailSection[];
}

const projects: Project[] = [
  {
    id: "yongin-rooftop",
    name: "용인시 지붕형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 기흥구 보정동",
    capacity: "2.0 MW",
    expectedYield: "연 7.8%",
    yieldRate: 7.8,
    minInvest: "₩50,000",
    progress: 38,
    status: "참여 가능",
    statusColor: "green",
    desc: "용인시 기흥구 상업시설 지붕에 설치하는 2MW 규모 태양광 발전소. RE100 기업 직접 PPA 계약으로 장기 안정 수익.",
    ppaYears: 15,
    annualOutput: "2,628 MWh",
    co2Reduction: "1,224 tCO₂",
    investor: "THEKIE 지붕형사업단",
    gridConnection: "용인 기흥 22.9kV 배전선로",
    power: "full_sale", powerLabel: "전면매전",
    market: "corporate_ppa", marketLabel: "기업 PPA",
    land: "leased", landLabel: "임대",
    capital: "corporate_credit", capitalLabel: "기업 신용",
    bizTypeLabel: "기업PPA(직접)",
    totalFunding: "₩6억",
    currentFunding: "₩2.28억",
    investorCount: 64,
    fundingDeadline: "2026-06-15",
    sections: [
      { label: "프로젝트 개요", text: "용인시 기흥구 보정동 대형 상업시설 지붕(약 12,000㎡)에 2MW 규모 태양광을 설치합니다. RE100 선언 기업과 15년 직접 PPA 계약을 체결하여 전량 기업에 직접 판매합니다." },
      { label: "수익 구조", text: "기업 PPA 단가는 한전 전기요금 대비 할인된 가격이지만, 장기 고정가격 계약으로 시장 변동 리스크를 제거합니다. RE100 인증서(REC) 수익이 추가로 발생합니다." },
      { label: "리스크 관리", text: "PPA 계약 상대방의 신용등급 AA 이상. 건물 구조안전 진단 완료. 지붕 방수 보증 20년. THEKIE 원격 모니터링 24시간 운영." },
    ],
  },
  {
    id: "yongin-ground",
    name: "용인시 지상형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 양지면",
    capacity: "3.0 MW",
    expectedYield: "연 6.8%",
    yieldRate: 6.8,
    minInvest: "₩10,000",
    progress: 72,
    status: "참여 가능",
    statusColor: "green",
    desc: "용인시 처인구 양지면 유휴부지를 활용한 3MW 규모 지상형 태양광. SMP+REC 현물 매입으로 이중 수익 구조.",
    ppaYears: 20,
    annualOutput: "3,942 MWh",
    co2Reduction: "1,836 tCO₂",
    investor: "THEKIE 지상형사업단",
    gridConnection: "용인 처인 154kV 양지 변전소",
    power: "full_sale", powerLabel: "전면매전",
    market: "smp_rec_spot", marketLabel: "SMP+REC 현물",
    land: "leased", landLabel: "임대",
    capital: "community_fund", capitalLabel: "주민참여/펀드",
    bizTypeLabel: "SMP+REC 현물형",
    totalFunding: "₩7억",
    currentFunding: "₩5.04억",
    investorCount: 342,
    fundingDeadline: "2026-04-15",
    sections: [
      { label: "프로젝트 개요", text: "용인시 처인구 양지면 일대 약 4만㎡ 부지에 3MW 규모의 지상형 태양광 발전소를 건설합니다. 높은 일사량(연평균 4.0kWh/㎡)과 최적 경사각 설계로 발전 효율을 극대화했습니다." },
      { label: "수익 구조", text: "한전과 20년 장기 PPA 계약을 체결하여 안정적인 수익을 보장합니다. SMP(계통한계가격)와 REC(신재생에너지 인증서) 이중 수익 구조로, 연 6.8%의 기대 수익률을 제공합니다." },
      { label: "리스크 관리", text: "발전소 운영보험 및 자연재해 보험 가입 완료. 패널 제조사 25년 출력 보증. THEKIE 자체 모니터링 시스템으로 24시간 원격 감시." },
    ],
  },
  {
    id: "yongin-floating",
    name: "용인시 수상형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 이동면",
    capacity: "2.5 MW",
    expectedYield: "연 7.5%",
    yieldRate: 7.5,
    minInvest: "₩20,000",
    progress: 28,
    status: "신규 오픈",
    statusColor: "blue",
    desc: "용인시 처인구 이동면 저수지 수면을 활용한 2.5MW 수상태양광. 수면 냉각 효과로 발전 효율 15% 향상.",
    ppaYears: 20,
    annualOutput: "3,285 MWh",
    co2Reduction: "1,530 tCO₂",
    investor: "THEKIE 수상형사업단",
    gridConnection: "용인 처인 22.9kV 이동 배전선로",
    power: "full_sale", powerLabel: "전면매전",
    market: "smp_rec_spot", marketLabel: "SMP+REC 현물",
    land: "floating", landLabel: "수상형",
    capital: "community_fund", capitalLabel: "주민참여/펀드",
    bizTypeLabel: "SMP+REC 현물형",
    totalFunding: "₩5.5억",
    currentFunding: "₩1.54억",
    investorCount: 76,
    fundingDeadline: "2026-06-30",
    sections: [
      { label: "프로젝트 개요", text: "용인시 처인구 이동면 저수지 수면 위에 2.5MW 규모의 수상태양광 발전소를 설치합니다. 수면 냉각 효과로 지상형 대비 약 15% 높은 발전 효율을 달성하며, 토지 사용 부담이 없습니다." },
      { label: "수익 구조", text: "수상태양광 REC 가중치 1.5가 적용되어 높은 REC 수익을 확보합니다. 20년 장기 PPA와 결합하여 연 7.5%의 안정적 수익률을 목표로 합니다." },
      { label: "리스크 관리", text: "한국수자원공사와 수면 사용 계약 체결. 부유식 앵커링 시스템으로 풍랑 대비. 수질 영향 환경평가 통과 완료." },
    ],
  },
  {
    id: "yongin-fems",
    name: "용인시 FEMS 연계형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 기흥구 영덕동",
    capacity: "0.8 MW",
    expectedYield: "연 4.8%",
    yieldRate: 4.8,
    minInvest: "₩10,000",
    progress: 100,
    status: "참여 완료",
    statusColor: "slate",
    desc: "용인시 기흥구 공장에너지관리시스템(FEMS)과 연계한 0.8MW 태양광. 자가소비 최적화로 전기요금 절감.",
    ppaYears: 15,
    annualOutput: "1,051 MWh",
    co2Reduction: "490 tCO₂",
    investor: "THEKIE FEMS사업단",
    gridConnection: "용인 기흥 22.9kV 영덕 배전선로",
    power: "self_consume", powerLabel: "자가소비",
    market: "smp_rec_spot", marketLabel: "SMP+REC 현물",
    land: "self_owned", landLabel: "자가 보유",
    capital: "equity_pf", capitalLabel: "자기자본+PF",
    bizTypeLabel: "전방 자가소비",
    totalFunding: "₩1.5억",
    currentFunding: "₩1.5억",
    investorCount: 87,
    fundingDeadline: "—",
    sections: [
      { label: "프로젝트 개요", text: "용인시 기흥구 영덕동 제조 공장에 0.8MW 규모의 태양광을 설치하고 FEMS(공장에너지관리시스템)와 연계합니다. 생산 전력의 약 80%를 공장에서 직접 소비하고, 잉여분은 상계거래로 처리합니다." },
      { label: "수익 구조", text: "전기요금 절감 효과가 주요 수익원입니다. 산업용 전기요금(현재 kWh당 약 120원) 대비 태양광 발전 원가(약 80원)로 약 33%의 비용 절감을 달성합니다. FEMS 최적화로 자가소비율을 극대화합니다." },
      { label: "리스크 관리", text: "공장 가동률에 따른 자가소비율 변동이 주요 리스크이나, 상계거래 제도로 잉여 전력을 한전에 판매하여 완충합니다. 공장 운영사와 15년 전력 사용 계약 체결." },
    ],
  },
  {
    id: "yongin-bipv",
    name: "용인시 BIPV형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 수지구 성복동",
    capacity: "0.5 MW",
    expectedYield: "연 5.8%",
    yieldRate: 5.8,
    minInvest: "₩10,000",
    progress: 82,
    status: "마감 임박",
    statusColor: "amber",
    desc: "용인시 수지구 건물일체형(BIPV) 태양광. FIT 고정가격매입 적용, 정책 기반 안정 수익.",
    ppaYears: 20,
    annualOutput: "657 MWh",
    co2Reduction: "306 tCO₂",
    investor: "THEKIE BIPV사업단",
    gridConnection: "용인 수지 22.9kV 성복 배전선로",
    power: "full_sale", powerLabel: "전면매전",
    market: "fit", marketLabel: "FIT형",
    land: "self_owned", landLabel: "자가 보유",
    capital: "policy", capitalLabel: "정책형",
    bizTypeLabel: "FIT형",
    totalFunding: "₩1.2억",
    currentFunding: "₩0.98억",
    investorCount: 412,
    fundingDeadline: "2026-03-25",
    sections: [
      { label: "프로젝트 개요", text: "용인시 수지구 성복동 공공건물 외벽과 창호에 0.5MW 규모의 BIPV(건물일체형 태양광)를 설치합니다. 건축자재 겸 발전설비로 도심형 재생에너지의 새로운 모델입니다." },
      { label: "수익 구조", text: "정부 FIT(Feed-in Tariff) 제도에 의해 20년간 고정가격으로 전력을 판매합니다. 시장 가격 변동과 무관하게 안정적 수익이 보장되는 가장 보수적인 사업 구조입니다." },
      { label: "리스크 관리", text: "정부 정책 기반 매입 보장으로 시장 리스크 제거. 건물 소유자와 장기 사용 계약(30년) 체결. BIPV 모듈 성능 보증 25년." },
    ],
  },
  {
    id: "yongin-ess",
    name: "용인시 ESS통합형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 남사읍",
    capacity: "2.0 MW",
    expectedYield: "연 5.5%",
    yieldRate: 5.5,
    minInvest: "₩30,000",
    progress: 91,
    status: "마감 임박",
    statusColor: "amber",
    desc: "용인시 처인구 남사읍 ESS 결합형 태양광 2MW. 피크 시간대 방전으로 전력 차익 거래 및 DR 참여 수익.",
    ppaYears: 15,
    annualOutput: "2,628 MWh",
    co2Reduction: "1,224 tCO₂",
    investor: "THEKIE ESS사업단",
    gridConnection: "용인 처인 22.9kV 남사 배전선로",
    power: "full_sale", powerLabel: "전면매전",
    market: "vpp", marketLabel: "VPP/중개",
    land: "leased", landLabel: "임대",
    capital: "equity_pf", capitalLabel: "자기자본+PF",
    bizTypeLabel: "VPP/중개형",
    totalFunding: "₩5억",
    currentFunding: "₩4.55억",
    investorCount: 127,
    fundingDeadline: "2026-03-10",
    sections: [
      { label: "프로젝트 개요", text: "용인시 처인구 남사읍에 2MW 규모의 태양광 발전소와 1MWh 규모의 ESS(에너지저장장치)를 통합 설치합니다. 피크 시간대 방전, 경부하 시간대 충전을 반복하여 전력 차익을 실현합니다." },
      { label: "수익 구조", text: "태양광 발전 수익에 더해 ESS 피크/오프피크 가격차 차익거래와 한전 수요반응(DR) 프로그램 참여 보상금이 추가 수익원입니다. VPP 중개 플랫폼을 통해 최적 운영합니다." },
      { label: "리스크 관리", text: "BMS(배터리관리시스템) 4중 안전 체계. 소방법 기준 초과 안전 설비. 배터리 열화율 연 2% 이내 보장 계약. 삼성SDI NCM 배터리 셀 적용." },
    ],
  },
  {
    id: "yongin-agri",
    name: "용인시 영농형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 원삼면",
    capacity: "1.5 MW",
    expectedYield: "연 6.2%",
    yieldRate: 6.2,
    minInvest: "₩10,000",
    progress: 55,
    status: "참여 가능",
    statusColor: "green",
    desc: "용인시 처인구 원삼면 농경지에서 농작물 재배와 태양광 병행. 영농형 REC 가중치 1.2 적용으로 추가 수익.",
    ppaYears: 20,
    annualOutput: "1,971 MWh",
    co2Reduction: "918 tCO₂",
    investor: "THEKIE 영농형사업단",
    gridConnection: "용인 처인 22.9kV 원삼 배전선로",
    power: "surplus_sale", powerLabel: "잉여전력 매입",
    market: "smp_rec_spot", marketLabel: "SMP+REC 현물",
    land: "agrivoltaic", landLabel: "영농형",
    capital: "community_fund", capitalLabel: "주민참여/펀드",
    bizTypeLabel: "잉여전력 한전매입",
    totalFunding: "₩3억",
    currentFunding: "₩1.65억",
    investorCount: 98,
    fundingDeadline: "2026-05-10",
    sections: [
      { label: "프로젝트 개요", text: "용인시 처인구 원삼면 농경지에 1.5MW 규모의 영농형 태양광을 설치합니다. 3.5m 높이의 지주 위에 패널을 설치하여 하부에서 작물 재배가 가능합니다. 농업 수익과 발전 수익을 동시에 확보합니다." },
      { label: "수익 구조", text: "영농형 태양광은 REC 가중치 1.2가 적용되며, 잉여전력 한전 매입 방식으로 안정적인 수익을 확보합니다. 농작물 판매 수익은 별도로 토지 소유자에게 귀속됩니다." },
      { label: "리스크 관리", text: "농촌진흥청 공인 영농형 시스템 인증 완료. 작물 수확량 80% 이상 유지 보장. 패널 투과율 조절 가능한 양면형 모듈 적용." },
    ],
  },
  {
    id: "yongin-carport",
    name: "용인시 주차장형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 기흥구 구갈동",
    capacity: "1.2 MW",
    expectedYield: "연 7.2%",
    yieldRate: 7.2,
    minInvest: "₩50,000",
    progress: 45,
    status: "참여 가능",
    statusColor: "green",
    desc: "용인시 기흥구 구갈동 대형 주차장 캐노피에 설치하는 1.2MW 태양광. EV 충전 인프라 연계 복합 수익.",
    ppaYears: 15,
    annualOutput: "1,577 MWh",
    co2Reduction: "735 tCO₂",
    investor: "THEKIE 주차장형사업단",
    gridConnection: "용인 기흥 22.9kV 구갈 배전선로",
    power: "full_sale", powerLabel: "전면매전",
    market: "corporate_ppa", marketLabel: "기업 PPA",
    land: "leased", landLabel: "임대",
    capital: "corporate_credit", capitalLabel: "기업 신용",
    bizTypeLabel: "기업PPA(직접)",
    totalFunding: "₩3.5억",
    currentFunding: "₩1.58억",
    investorCount: 189,
    fundingDeadline: "2026-05-20",
    sections: [
      { label: "프로젝트 개요", text: "용인시 기흥구 구갈동 대형 상업시설 주차장에 캐노피형 태양광 1.2MW를 설치합니다. 주차장 차양 기능과 EV 충전 인프라를 결합하여 복합 가치를 창출합니다." },
      { label: "수익 구조", text: "기업 PPA 계약으로 발전 전력을 인근 상업시설에 직접 판매합니다. EV 충전 수익과 주차장 부대수익이 추가로 발생하는 복합 수익 모델입니다." },
      { label: "리스크 관리", text: "주차장 구조물 안전 인증 완료. 방수·방진 등급 IP67 인버터 적용. EV 충전기 운영사와 10년 장기 임대 계약 체결." },
    ],
  },
  {
    id: "yongin-tracker",
    name: "용인시 추적식 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 백암면",
    capacity: "3.5 MW",
    expectedYield: "연 8.1%",
    yieldRate: 8.1,
    minInvest: "₩100,000",
    progress: 15,
    status: "신규 오픈",
    statusColor: "blue",
    desc: "용인시 처인구 백암면에 태양 추적 시스템을 적용한 3.5MW 태양광. 고정식 대비 발전량 25% 이상 향상.",
    ppaYears: 20,
    annualOutput: "5,694 MWh",
    co2Reduction: "2,653 tCO₂",
    investor: "THEKIE 추적식사업단",
    gridConnection: "용인 처인 154kV 백암 변전소",
    power: "full_sale", powerLabel: "전면매전",
    market: "smp_rec_contract", marketLabel: "SMP+REC 장기계약",
    land: "leased", landLabel: "임대",
    capital: "equity_pf", capitalLabel: "자기자본+PF",
    bizTypeLabel: "고정가격계약(입찰)",
    totalFunding: "₩12억",
    currentFunding: "₩1.8억",
    investorCount: 52,
    fundingDeadline: "2026-08-31",
    sections: [
      { label: "프로젝트 개요", text: "용인시 처인구 백암면에 3.5MW 규모의 단축·양축 추적식 태양광을 설치합니다. 태양의 고도와 방위각을 실시간 추적하여 고정식 대비 25~35% 높은 발전량을 달성합니다." },
      { label: "수익 구조", text: "SMP+REC 장기계약 방식으로 20년간 고정 수익을 확보합니다. 추적식의 높은 발전량으로 연 8.1%의 업계 최고 수준 기대수익을 제공합니다." },
      { label: "리스크 관리", text: "NEXTracker 단축 추적기 채택(글로벌 시장 점유율 1위). 풍속 센서 연동 자동 안전 모드. 추적 모터 10년 무상 보증. 적설 시 자동 수평 전환 기능." },
    ],
  },
  {
    id: "yongin-bifacial",
    name: "용인시 양면형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 모현읍",
    capacity: "2.0 MW",
    expectedYield: "연 5.2%",
    yieldRate: 5.2,
    minInvest: "₩10,000",
    progress: 65,
    status: "참여 가능",
    statusColor: "green",
    desc: "용인시 처인구 모현읍에 양면 수광 모듈을 적용한 2MW 태양광. 반사광 활용으로 단면형 대비 효율 15% 향상.",
    ppaYears: 20,
    annualOutput: "2,628 MWh",
    co2Reduction: "1,224 tCO₂",
    investor: "THEKIE 양면형사업단",
    gridConnection: "용인 처인 22.9kV 모현 배전선로",
    power: "self_consume", powerLabel: "자가소비",
    market: "smp_rec_spot", marketLabel: "SMP+REC 현물",
    land: "self_owned", landLabel: "자가 보유",
    capital: "rental", capitalLabel: "렌탈 구조",
    bizTypeLabel: "태양광대여(렌탈)",
    totalFunding: "₩4.5억",
    currentFunding: "₩2.93억",
    investorCount: 156,
    fundingDeadline: "2026-05-30",
    sections: [
      { label: "프로젝트 개요", text: "용인시 처인구 모현읍 자가 보유 부지에 2MW 규모의 양면형 태양광을 렌탈 방식으로 설치합니다. 양면 수광 모듈이 지면 반사광을 추가 흡수하여 단면형 대비 10~15% 높은 발전량을 생산합니다." },
      { label: "수익 구조", text: "렌탈 구조에서 사업자는 설비 소유권을 보유하고, 토지 소유자로부터 렌탈료를 수취합니다. 동시에 발전 전력의 SMP+REC 판매 수익을 얻어 이중 수익 구조를 형성합니다." },
      { label: "리스크 관리", text: "토지 소유자와 20년 장기 렌탈 계약 체결. 렌탈료 미납 시 설비 회수 조항 포함. LONGi 양면형 모듈 30년 출력 보증 적용." },
    ],
  },
  {
    id: "yongin-distributed",
    name: "용인시 소규모 분산형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 수지구 풍덕천동",
    capacity: "0.3 MW",
    expectedYield: "연 6.0%",
    yieldRate: 6.0,
    minInvest: "₩10,000",
    progress: 20,
    status: "신규 오픈",
    statusColor: "blue",
    desc: "용인시 수지구 도심 유휴 공간 활용 소규모 분산형 태양광 0.3MW. 주민참여 시민펀드 구조.",
    ppaYears: 20,
    annualOutput: "394 MWh",
    co2Reduction: "184 tCO₂",
    investor: "THEKIE 분산형사업단",
    gridConnection: "용인 수지 22.9kV 풍덕천 배전선로",
    power: "net_metering", powerLabel: "상계거래",
    market: "smp_rec_spot", marketLabel: "SMP+REC 현물",
    land: "public_land", landLabel: "공공부지",
    capital: "community_fund", capitalLabel: "주민참여/펀드",
    bizTypeLabel: "주민참여·시민펀드",
    totalFunding: "₩0.8억",
    currentFunding: "₩0.16억",
    investorCount: 34,
    fundingDeadline: "2026-07-31",
    sections: [
      { label: "프로젝트 개요", text: "용인시 수지구 풍덕천동 공공시설 유휴 공간에 0.3MW 규모의 소규모 분산형 태양광을 설치합니다. 주민참여 시민펀드 방식으로 지역 주민이 직접 사업에 참여하고 수익을 공유합니다." },
      { label: "수익 구조", text: "상계거래 방식으로 생산 전력을 공공시설에서 자가소비하고, 잉여분은 한전에 판매합니다. SMP 수익에 더해 주민참여 사업으로 지자체 보조금도 수령합니다." },
      { label: "리스크 관리", text: "공공부지 장기 사용 계약(20년) 체결. 용인시 에너지자립마을 사업 선정으로 행정 지원 확보. 소규모 분산형이라 계통 영향 최소." },
    ],
  },
  {
    id: "yongin-industrial",
    name: "용인시 산단 연계형 태양광 발전 사업",
    type: "태양광",
    typeIcon: "solar",
    location: "용인시 처인구 유방동",
    capacity: "5.0 MW",
    expectedYield: "연 6.5%",
    yieldRate: 6.5,
    minInvest: "₩100,000",
    progress: 10,
    status: "신규 오픈",
    statusColor: "blue",
    desc: "용인시 처인구 산업단지 유휴부지에 5MW 대규모 태양광. 기업 PPA 제3자 계약으로 안정 수익.",
    ppaYears: 15,
    annualOutput: "6,570 MWh",
    co2Reduction: "3,061 tCO₂",
    investor: "THEKIE 산단사업단",
    gridConnection: "용인 처인 154kV 변전소",
    power: "full_sale", powerLabel: "전면매전",
    market: "corporate_ppa", marketLabel: "기업 PPA",
    land: "industrial", landLabel: "산단형",
    capital: "corporate_credit", capitalLabel: "기업 신용",
    bizTypeLabel: "기업PPA(제3자)",
    totalFunding: "₩15억",
    currentFunding: "₩1.5억",
    investorCount: 28,
    fundingDeadline: "2026-09-30",
    sections: [
      { label: "프로젝트 개요", text: "용인시 처인구 유방동 산업단지 내 유휴부지에 5MW 규모의 대규모 태양광 발전소를 건설합니다. 산단 내 RE100 수요 기업에 제3자 PPA 방식으로 전력을 공급합니다." },
      { label: "수익 구조", text: "기업 PPA 제3자 계약으로 발전 전력을 산단 내 기업에 판매합니다. 대규모 설비로 규모의 경제를 달성하고, RE100 프리미엄을 확보하여 연 6.5% 수익률을 목표합니다." },
      { label: "리스크 관리", text: "산업단지 관리공단과 부지 사용 협약 체결. 다수 수요 기업 분산 계약으로 단일 거래처 리스크 최소화. 24시간 원격 관제 시스템 운영." },
    ],
  },
];

const project = computed(() =>
  projects.find((p) => p.id === route.params.id) ?? null,
);

function goBack() {
  router.back();
}

// ── Tabs ──
const activeTab = ref<"overview" | "invest" | "facility">("overview");

// ── ROI Calculator ──
const investAmountPresets = [10000, 50000, 100000, 500000, 1000000];
const selectedInvestAmount = ref(100000);

const roiResults = computed(() => {
  const p = project.value;
  if (!p) return null;
  const amount = selectedInvestAmount.value;
  const rate = p.yieldRate / 100;
  const years = [1, 3, 5, 10];
  return years.map((y) => {
    const total = amount * Math.pow(1 + rate, y);
    const profit = total - amount;
    return {
      year: y,
      total: Math.round(total),
      profit: Math.round(profit),
      roi: ((profit / amount) * 100).toFixed(1),
    };
  });
});

function formatKRW(n: number): string {
  if (n >= 100000000) return `₩${(n / 100000000).toFixed(1)}억`;
  if (n >= 10000) return `₩${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}만`;
  return `₩${n.toLocaleString()}`;
}

// ── Specs table rows ──
const specRows = computed(() => {
  const p = project.value;
  if (!p) return [];
  return [
    { label: "발전 유형", value: p.type },
    { label: "설비 용량", value: p.capacity },
    { label: "소재지", value: p.location },
    { label: "연간 예상 발전량", value: p.annualOutput },
    { label: "CO₂ 감축량", value: p.co2Reduction },
    { label: "계통 연계", value: p.gridConnection },
    { label: "PPA 계약 기간", value: `${p.ppaYears}년` },
    { label: "사업 운영", value: p.investor },
  ];
});

// ── D-day computation ──
const daysUntilDeadline = computed(() => {
  const p = project.value;
  if (!p || p.fundingDeadline === "—") return null;
  const deadline = new Date(p.fundingDeadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
});

// ── Facility Tab ──
interface EquipmentItem {
  name: string;
  status: "normal" | "warning" | "offline";
  statusLabel: string;
  output?: string;
}

interface FacilityAlert {
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  source: string;
}

interface FacilityData {
  currentOutput: string;
  ratedCapacity: string;
  availability: number;
  dailyGeneration: string;
  monthlyGeneration: string;
  equipment: EquipmentItem[];
  alerts: FacilityAlert[];
  nextMaintenance: string;
  nextMaintenanceType: string;
  lastInspection: string;
  lastInspectionType: string;
}

const facilityDataMap: Record<string, FacilityData> = {
  "yongin-ground": {
    currentOutput: "2.5 MW",
    ratedCapacity: "3.0 MW",
    availability: 98.2,
    dailyGeneration: "15.8 MWh",
    monthlyGeneration: "328 MWh",
    equipment: [
      { name: "인버터 #1", status: "normal", statusLabel: "정상", output: "1,050 kW" },
      { name: "인버터 #2", status: "normal", statusLabel: "정상", output: "980 kW" },
      { name: "인버터 #3", status: "warning", statusLabel: "출력 저하", output: "470 kW" },
      { name: "변압기", status: "normal", statusLabel: "정상" },
      { name: "계통연계", status: "normal", statusLabel: "정상" },
    ],
    alerts: [
      { severity: "warning", message: "인버터 #3 출력 정격 대비 50% 미달", timestamp: "2시간 전", source: "RTU" },
      { severity: "info", message: "일사량 대비 출력 효율 93.2%", timestamp: "6시간 전", source: "SCADA" },
      { severity: "info", message: "월간 발전량 목표 달성률 94%", timestamp: "1일 전", source: "시스템" },
    ],
    nextMaintenance: "2026-03-15",
    nextMaintenanceType: "정기 점검",
    lastInspection: "2026-01-20",
    lastInspectionType: "패널 세정",
  },
  "yongin-tracker": {
    currentOutput: "2.9 MW",
    ratedCapacity: "3.5 MW",
    availability: 96.5,
    dailyGeneration: "22.8 MWh",
    monthlyGeneration: "474 MWh",
    equipment: [
      { name: "추적 모터 어레이 A", status: "normal", statusLabel: "정상", output: "1.5 MW" },
      { name: "추적 모터 어레이 B", status: "normal", statusLabel: "정상", output: "1.4 MW" },
      { name: "추적 제어기", status: "normal", statusLabel: "추적 운전 중" },
      { name: "인버터 #1~4", status: "normal", statusLabel: "정상", output: "2.9 MW" },
      { name: "변압기", status: "normal", statusLabel: "정상" },
      { name: "계통연계", status: "normal", statusLabel: "정상" },
    ],
    alerts: [
      { severity: "info", message: "태양 추적각 최적 — 발전 효율 고정식 대비 +28%", timestamp: "1시간 전", source: "SCADA" },
      { severity: "info", message: "일사량 대비 출력 효율 96.1%", timestamp: "3시간 전", source: "SCADA" },
    ],
    nextMaintenance: "2026-03-08",
    nextMaintenanceType: "추적 모터 점검",
    lastInspection: "2026-02-10",
    lastInspectionType: "추적 제어기 캘리브레이션",
  },
  "yongin-ess": {
    currentOutput: "1.6 MW",
    ratedCapacity: "2.0 MW",
    availability: 96.8,
    dailyGeneration: "10.5 MWh (발전+충방전)",
    monthlyGeneration: "219 MWh (발전+차익거래)",
    equipment: [
      { name: "태양광 인버터 #1~2", status: "normal", statusLabel: "정상", output: "1.2 MW" },
      { name: "배터리 랙 A", status: "normal", statusLabel: "정상", output: "SOC 72%" },
      { name: "배터리 랙 B", status: "normal", statusLabel: "정상", output: "SOC 68%" },
      { name: "PCS (충방전기)", status: "normal", statusLabel: "방전 중", output: "400 kW" },
      { name: "BMS", status: "normal", statusLabel: "정상" },
      { name: "소방설비", status: "normal", statusLabel: "정상" },
    ],
    alerts: [
      { severity: "info", message: "정기 점검 D-5 알림", timestamp: "12시간 전", source: "시스템" },
      { severity: "info", message: "배터리 열화율 1.8% — 정상 범위", timestamp: "1일 전", source: "BMS" },
    ],
    nextMaintenance: "2026-03-04",
    nextMaintenanceType: "정기 점검",
    lastInspection: "2026-01-15",
    lastInspectionType: "배터리 셀 밸런싱",
  },
  "yongin-floating": {
    currentOutput: "0 MW",
    ratedCapacity: "2.5 MW",
    availability: 0,
    dailyGeneration: "— (시운전 준비)",
    monthlyGeneration: "—",
    equipment: [
      { name: "부유체 구조물", status: "normal", statusLabel: "설치 완료" },
      { name: "인버터 #1~3", status: "offline", statusLabel: "미가동" },
      { name: "앵커링 시스템", status: "normal", statusLabel: "고정 완료" },
      { name: "계통연계", status: "offline", statusLabel: "승인 대기" },
    ],
    alerts: [
      { severity: "info", message: "용인 이동면 저수지 수상 설치 완료 — 계통연계 승인 대기", timestamp: "2일 전", source: "시스템" },
    ],
    nextMaintenance: "—",
    nextMaintenanceType: "—",
    lastInspection: "2026-02-22",
    lastInspectionType: "수상 구조물 설치 완료 점검",
  },
  "yongin-industrial": {
    currentOutput: "0 MW",
    ratedCapacity: "5.0 MW",
    availability: 0,
    dailyGeneration: "— (건설 중)",
    monthlyGeneration: "—",
    equipment: [
      { name: "부지 기초 구조물", status: "normal", statusLabel: "시공 중 (70%)" },
      { name: "인버터 #1~5", status: "offline", statusLabel: "설치 예정" },
      { name: "계통연계", status: "offline", statusLabel: "승인 예정" },
    ],
    alerts: [
      { severity: "info", message: "용인 유방동 산단 부지 기초 시공 70% 진행", timestamp: "1일 전", source: "현장" },
    ],
    nextMaintenance: "—",
    nextMaintenanceType: "—",
    lastInspection: "2026-02-20",
    lastInspectionType: "기초 구조물 검사",
  },
};

const facilityData = computed(() => {
  const p = project.value;
  if (!p) return null;
  return facilityDataMap[p.id] ?? null;
});

function statusClass(status: string): string {
  return `fac-eq__status--${status}`;
}

function alertIcon(severity: string): string {
  if (severity === "critical") return "!!";
  if (severity === "warning") return "!";
  return "i";
}
</script>

<template>
  <div v-if="project" class="pd">
    <!-- Back nav -->
    <button class="pd-back" @click="goBack">
      <IcoArrowLeft :size="16" :strokeWidth="2.5" />
      사업 목록
    </button>

    <!-- ── Hero ── -->
    <div class="pd-hero">
      <div class="pd-hero__left">
        <div class="pd-hero__icon" :class="`pd-hero__icon--${project.typeIcon}`">
          <IcoSolar v-if="project.typeIcon === 'solar'" :size="28" :strokeWidth="1.5" />
          <IcoWind v-else-if="project.typeIcon === 'wind'" :size="28" :strokeWidth="1.5" />
          <IcoBattery v-else-if="project.typeIcon === 'battery'" :size="28" :strokeWidth="1.5" />
          <IcoHydro v-else-if="project.typeIcon === 'hydro'" :size="28" :strokeWidth="1.5" />
          <IcoFuelCell v-else :size="28" :strokeWidth="1.5" />
        </div>
      </div>
      <div class="pd-hero__body">
        <div class="pd-hero__meta">
          <span class="pd-hero__badge" :class="`pd-hero__badge--${project.statusColor}`">{{ project.status }}</span>
          <span class="pd-hero__type-tag">{{ project.type }}</span>
          <span class="pd-hero__biz-tag">{{ project.bizTypeLabel }}</span>
        </div>
        <h1 class="pd-hero__name">{{ project.name }}</h1>
        <div class="pd-hero__location">
          <IcoMapPin :size="12" :strokeWidth="2" />
          {{ project.location }}
        </div>
        <p class="pd-hero__desc">{{ project.desc }}</p>
      </div>
    </div>

    <!-- ── Highlight strip ── -->
    <div class="pd-highlights">
      <div class="pd-hl pd-hl--accent">
        <span class="pd-hl__label">기대 수익률</span>
        <span class="pd-hl__value">{{ project.expectedYield }}</span>
      </div>
      <div class="pd-hl">
        <span class="pd-hl__label">설비 용량</span>
        <span class="pd-hl__value">{{ project.capacity }}</span>
      </div>
      <div class="pd-hl">
        <span class="pd-hl__label">최소 참여금</span>
        <span class="pd-hl__value">{{ project.minInvest }}</span>
      </div>
      <div class="pd-hl">
        <span class="pd-hl__label">계약 기간</span>
        <span class="pd-hl__value">{{ project.ppaYears }}년</span>
      </div>
    </div>

    <!-- ── Funding progress ── -->
    <div class="pd-funding">
      <div class="pd-funding__top">
        <span class="pd-funding__label">참여 현황</span>
        <span class="pd-funding__pct">{{ project.progress }}%</span>
      </div>
      <div class="pd-funding__bar">
        <div class="pd-funding__fill" :style="{ width: Math.min(project.progress, 100) + '%' }"></div>
      </div>
      <div class="pd-funding__info">
        <div class="pd-funding__stat">
          <IcoUsers :size="12" :strokeWidth="2" />
          <span>{{ project.investorCount }}명 참여</span>
        </div>
        <div class="pd-funding__stat">
          <IcoBuilding :size="12" :strokeWidth="2" />
          <span>{{ project.investor }}</span>
        </div>
        <div class="pd-funding__stat" v-if="daysUntilDeadline !== null">
          <span class="pd-funding__dday">D-{{ daysUntilDeadline }}</span>
          <span>마감 {{ project.fundingDeadline }}</span>
        </div>
        <div class="pd-funding__stat" v-else>
          <span>참여 완료</span>
        </div>
      </div>
    </div>

    <!-- ── Tab nav ── -->
    <div class="pd-tabs">
      <button
        class="pd-tabs__btn"
        :class="{ 'pd-tabs__btn--active': activeTab === 'overview' }"
        @click="activeTab = 'overview'"
      >
        <IcoDocument :size="13" :strokeWidth="2" />
        사업 개요
      </button>
      <button
        class="pd-tabs__btn"
        :class="{ 'pd-tabs__btn--active': activeTab === 'invest' }"
        @click="activeTab = 'invest'"
      >
        <IcoChartUp :size="13" :strokeWidth="2" />
        사업 구조
      </button>
      <button
        class="pd-tabs__btn"
        :class="{ 'pd-tabs__btn--active': activeTab === 'facility' }"
        @click="activeTab = 'facility'"
      >
        <IcoMeter :size="13" :strokeWidth="2" />
        설비 현황
      </button>
    </div>

    <!-- ═══════════ OVERVIEW TAB ═══════════ -->
    <template v-if="activeTab === 'overview'">
      <!-- Project spec table -->
      <div class="pd-specs">
        <h3 class="pd-section-title">
          <IcoInfo :size="14" :strokeWidth="2" />
          프로젝트 기본정보
        </h3>
        <div class="pd-specs__table">
          <div v-for="row in specRows" :key="row.label" class="pd-specs__row">
            <span class="pd-specs__label">{{ row.label }}</span>
            <span class="pd-specs__value">{{ row.value }}</span>
          </div>
        </div>
      </div>

      <!-- 4-module business structure -->
      <div class="pd-modules">
        <h3 class="pd-section-title">
          <IcoSmp :size="14" :strokeWidth="2" />
          사업 구조 (4-Module)
        </h3>
        <div class="pd-modules__grid">
          <div class="pd-mod">
            <span class="pd-mod__label">전력 구조</span>
            <span class="pd-mod__value">{{ project.powerLabel }}</span>
          </div>
          <div class="pd-mod">
            <span class="pd-mod__label">시장/REC</span>
            <span class="pd-mod__value">{{ project.marketLabel }}</span>
          </div>
          <div class="pd-mod">
            <span class="pd-mod__label">권원/입지</span>
            <span class="pd-mod__value">{{ project.landLabel }}</span>
          </div>
          <div class="pd-mod">
            <span class="pd-mod__label">자본 구조</span>
            <span class="pd-mod__value">{{ project.capitalLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Detail sections (write-ups) -->
      <div class="pd-writeups">
        <div v-for="(sec, i) in project.sections" :key="i" class="pd-writeup">
          <h3 class="pd-section-title">
            <IcoDocument :size="14" :strokeWidth="2" />
            {{ sec.label }}
          </h3>
          <p class="pd-writeup__text">{{ sec.text }}</p>
        </div>
      </div>
    </template>

    <!-- ═══════════ INVEST TAB ═══════════ -->
    <template v-if="activeTab === 'invest'">
      <!-- Revenue & yield breakdown -->
      <div class="pd-revenue">
        <h3 class="pd-section-title">
          <IcoRec :size="14" :strokeWidth="2" />
          수익 분석
        </h3>
        <div class="pd-revenue__grid">
          <div class="pd-rev-card pd-rev-card--accent">
            <span class="pd-rev-card__label">기대 수익률</span>
            <span class="pd-rev-card__value">{{ project.expectedYield }}</span>
          </div>
          <div class="pd-rev-card">
            <span class="pd-rev-card__label">연간 발전량</span>
            <span class="pd-rev-card__value">{{ project.annualOutput }}</span>
          </div>
          <div class="pd-rev-card">
            <span class="pd-rev-card__label">CO₂ 감축</span>
            <span class="pd-rev-card__value">{{ project.co2Reduction }}</span>
          </div>
          <div class="pd-rev-card">
            <span class="pd-rev-card__label">총 사업 규모</span>
            <span class="pd-rev-card__value">{{ project.totalFunding }}</span>
          </div>
        </div>
      </div>

      <!-- ROI Calculator -->
      <div v-if="roiResults" class="pd-roi">
        <h3 class="pd-section-title">
          <IcoChartUp :size="14" :strokeWidth="2" />
          수익 시뮬레이션
        </h3>

        <div class="pd-roi__presets">
          <button
            v-for="amt in investAmountPresets"
            :key="amt"
            class="pd-roi__preset"
            :class="{ 'pd-roi__preset--active': selectedInvestAmount === amt }"
            @click="selectedInvestAmount = amt"
          >
            {{ formatKRW(amt) }}
          </button>
        </div>

        <div class="pd-roi__table">
          <div class="pd-roi__row pd-roi__row--head">
            <span>기간</span>
            <span>예상 수익</span>
            <span>총 자산</span>
            <span>ROI</span>
          </div>
          <div v-for="r in roiResults" :key="r.year" class="pd-roi__row">
            <span class="pd-roi__period">{{ r.year }}년</span>
            <span class="pd-roi__profit">+{{ formatKRW(r.profit) }}</span>
            <span class="pd-roi__total">{{ formatKRW(r.total) }}</span>
            <span class="pd-roi__pct">{{ r.roi }}%</span>
          </div>
        </div>

        <p class="pd-roi__note">
          * 복리 기준 예상 수익이며, 실제 수익은 시장 상황에 따라 달라질 수 있습니다.
        </p>
      </div>

      <!-- Risk management (from sections) -->
      <div v-if="project.sections.find(s => s.label === '수익 구조')" class="pd-text-card">
        <h3 class="pd-section-title">
          <IcoSmp :size="14" :strokeWidth="2" />
          수익 구조
        </h3>
        <p class="pd-text-card__body">{{ project.sections.find(s => s.label === '수익 구조')!.text }}</p>
      </div>

      <div v-if="project.sections.find(s => s.label === '리스크 관리')" class="pd-text-card">
        <h3 class="pd-section-title">
          <IcoInfo :size="14" :strokeWidth="2" />
          리스크 관리
        </h3>
        <p class="pd-text-card__body">{{ project.sections.find(s => s.label === '리스크 관리')!.text }}</p>
      </div>

      <!-- Key notices -->
      <div class="pd-notices">
        <h3 class="pd-section-title">
          <IcoDocument :size="14" :strokeWidth="2" />
          참여 유의사항
        </h3>
        <ul class="pd-notices__list">
          <li>본 사업 참여는 원금 보장이 되지 않으며, 참여금의 손실이 발생할 수 있습니다.</li>
          <li>기대 수익률은 예상치이며, 실제 수익은 발전량, 전력시장 가격, 정부 정책 변동 등에 따라 달라질 수 있습니다.</li>
          <li>참여 전 사업설명서를 반드시 확인하시기 바랍니다.</li>
          <li>참여 철회는 확정일로부터 7일 이내 가능합니다.</li>
        </ul>
      </div>
    </template>

    <!-- ═══════════ FACILITY TAB ═══════════ -->
    <template v-if="activeTab === 'facility'">
      <div v-if="facilityData" class="fac">
        <!-- Real-time overview -->
        <div class="fac-card">
          <h3 class="pd-section-title">
            <IcoLightning :size="14" :strokeWidth="2" />
            실시간 발전 현황
          </h3>
          <div class="fac-overview__grid">
            <div class="fac-ov fac-ov--accent">
              <span class="fac-ov__label">현재 출력</span>
              <span class="fac-ov__value">{{ facilityData.currentOutput }}</span>
              <span class="fac-ov__sub">/ {{ facilityData.ratedCapacity }}</span>
            </div>
            <div class="fac-ov">
              <span class="fac-ov__label">가동률</span>
              <span class="fac-ov__value">{{ facilityData.availability }}%</span>
            </div>
            <div class="fac-ov">
              <span class="fac-ov__label">금일 발전량</span>
              <span class="fac-ov__value">{{ facilityData.dailyGeneration }}</span>
            </div>
            <div class="fac-ov">
              <span class="fac-ov__label">월 발전량</span>
              <span class="fac-ov__value">{{ facilityData.monthlyGeneration }}</span>
            </div>
          </div>
        </div>

        <!-- Equipment status -->
        <div class="fac-card">
          <h3 class="pd-section-title">
            <IcoSettings :size="14" :strokeWidth="2" />
            설비 상태 모니터링
          </h3>
          <div class="fac-eq__list">
            <div v-for="(eq, i) in facilityData.equipment" :key="i" class="fac-eq__row">
              <span class="fac-eq__name">{{ eq.name }}</span>
              <span class="fac-eq__status" :class="statusClass(eq.status)">{{ eq.statusLabel }}</span>
              <span v-if="eq.output" class="fac-eq__output">{{ eq.output }}</span>
            </div>
          </div>
        </div>

        <!-- Alerts -->
        <div class="fac-card">
          <h3 class="pd-section-title">
            <IcoInfo :size="14" :strokeWidth="2" />
            최근 알림
          </h3>
          <div class="fac-alerts__list">
            <div v-for="(alert, i) in facilityData.alerts" :key="i" class="fac-alert" :class="`fac-alert--${alert.severity}`">
              <span class="fac-alert__icon" :class="`fac-alert__icon--${alert.severity}`">{{ alertIcon(alert.severity) }}</span>
              <div class="fac-alert__body">
                <span class="fac-alert__msg">{{ alert.message }}</span>
                <span class="fac-alert__meta">{{ alert.source }} · {{ alert.timestamp }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- O&M schedule -->
        <div class="fac-card">
          <h3 class="pd-section-title">
            <IcoDocument :size="14" :strokeWidth="2" />
            O&amp;M 일정
          </h3>
          <div class="fac-om__grid">
            <div class="fac-om__item">
              <span class="fac-om__label">다음 정기 점검</span>
              <span class="fac-om__value">{{ facilityData.nextMaintenance }}</span>
              <span class="fac-om__type">{{ facilityData.nextMaintenanceType }}</span>
            </div>
            <div class="fac-om__item">
              <span class="fac-om__label">최근 점검</span>
              <span class="fac-om__value">{{ facilityData.lastInspection }}</span>
              <span class="fac-om__type">{{ facilityData.lastInspectionType }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- No facility data -->
      <div v-else class="fac-empty">
        <IcoMeter :size="32" :strokeWidth="1.5" />
        <p>설비 데이터가 준비 중입니다.</p>
        <span class="fac-empty__sub">건설 중이거나 시운전 전 프로젝트는 가동 후 데이터가 제공됩니다.</span>
      </div>
    </template>

    <!-- ── Bottom CTA ── -->
    <div class="pd-cta" v-if="project.progress < 100">
      <button class="pd-cta__primary">
        <IcoCheck :size="16" :strokeWidth="2.5" />
        참여 신청하기
      </button>
      <button class="pd-cta__ghost" @click="goBack">목록으로</button>
    </div>
    <div class="pd-cta" v-else>
      <button class="pd-cta__ghost pd-cta__ghost--full" @click="goBack">사업 목록으로</button>
    </div>
  </div>

  <!-- Not found -->
  <div v-else class="pd-empty">
    <p>프로젝트를 찾을 수 없습니다.</p>
    <button class="pd-cta__ghost" @click="goBack">돌아가기</button>
  </div>
</template>

<style scoped lang="scss">
$accent: #4F6AF5;
$accent-light: #EEF2FF;
$text-primary: #0f172a;
$text-secondary: #475569;
$text-muted: #94a3b8;
$border: #e2e8f0;
$surface: #ffffff;
$bg: #f8fafc;

.pd {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 0 24px;
  max-width: 100%;
}

// ── Back ──
.pd-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  font-family: "Inter", sans-serif;
  color: $text-secondary;
  cursor: pointer;
  padding: 0;
  transition: color 0.12s;
  &:hover { color: $accent; }
}

// ── Hero ──
.pd-hero {
  background: $surface;
  border: 1px solid $border;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  gap: 14px;

  @media (max-width: 500px) { flex-direction: column; }

  &__left { flex-shrink: 0; }

  &__icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    &--solar { background: #fef3c7; color: #d97706; }
    &--wind { background: #cffafe; color: #0891b2; }
    &--battery { background: #dcfce7; color: #16a34a; }
    &--hydro { background: #dbeafe; color: #2563eb; }
    &--fuelcell { background: #ede9fe; color: #7c3aed; }
  }

  &__body { flex: 1; min-width: 0; }

  &__meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }

  &__badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 5px;
    &--green { background: #dcfce7; color: #16a34a; }
    &--amber { background: #fef3c7; color: #d97706; }
    &--blue { background: #dbeafe; color: #2563eb; }
    &--slate { background: #f1f5f9; color: #64748b; }
  }

  &__type-tag,
  &__biz-tag {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 4px;
    background: $bg;
    color: $text-secondary;
  }

  &__name {
    font-size: 18px;
    font-weight: 900;
    color: $text-primary;
    letter-spacing: -0.03em;
    margin: 0 0 4px;
    line-height: 1.3;
  }

  &__location {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 11.5px;
    color: $text-muted;
    font-weight: 500;
    margin-bottom: 8px;
  }

  &__desc {
    font-size: 13px;
    line-height: 1.6;
    color: $text-secondary;
    margin: 0;
  }
}

// ── Highlight strip ──
.pd-highlights {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;

  @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
}

.pd-hl {
  background: $surface;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 10px;
  text-align: center;

  &--accent {
    background: $accent-light;
    border-color: rgba(79, 106, 245, 0.2);
  }

  &__label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    color: $text-muted;
    margin-bottom: 3px;
  }

  &__value {
    font-size: 15px;
    font-weight: 900;
    color: $text-primary;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }

  &--accent &__value { color: $accent; }
}

// ── Funding progress ──
.pd-funding {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 14px 16px;

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  &__label {
    font-size: 13px;
    font-weight: 700;
    color: $text-primary;
  }

  &__pct {
    font-size: 16px;
    font-weight: 900;
    color: $accent;
  }

  &__bar {
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, $accent, #818cf8);
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  &__info {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
  }

  &__stat {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11.5px;
    font-weight: 500;
    color: $text-muted;

    svg { color: $text-muted; }
  }

  &__dday {
    font-weight: 800;
    color: #dc2626;
    background: #fef2f2;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 10px;
  }
}

// ── Tabs ──
.pd-tabs {
  display: flex;
  gap: 3px;
  background: $bg;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 3px;

  &__btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 700;
    font-family: "Inter", sans-serif;
    color: $text-muted;
    background: none;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;

    &:hover { color: $text-secondary; background: rgba(255, 255, 255, 0.6); }

    &--active {
      color: $accent;
      background: $surface;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    }
  }
}

// ── Shared section title ──
.pd-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 800;
  color: $text-primary;
  margin: 0 0 10px;

  svg { color: $accent; }
}

// ── Specs table ──
.pd-specs {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 16px;

  &__table {
    border: 1px solid $border;
    border-radius: 8px;
    overflow: hidden;
  }

  &__row {
    display: flex;
    padding: 8px 12px;
    font-size: 12px;
    border-bottom: 1px solid $border;

    &:last-child { border-bottom: none; }
    &:nth-child(even) { background: $bg; }
  }

  &__label {
    width: 140px;
    flex-shrink: 0;
    font-weight: 600;
    color: $text-muted;
  }

  &__value {
    flex: 1;
    font-weight: 700;
    color: $text-primary;
  }
}

// ── 4-module structure ──
.pd-modules {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 16px;

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;

    @media (min-width: 640px) { grid-template-columns: repeat(4, 1fr); }
  }
}

.pd-mod {
  background: $bg;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 10px;
  text-align: center;

  &__label {
    display: block;
    font-size: 9.5px;
    font-weight: 700;
    color: $text-muted;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 3px;
  }

  &__value {
    font-size: 12px;
    font-weight: 800;
    color: $accent;
  }
}

// ── Write-ups ──
.pd-writeups {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pd-writeup {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 14px 16px;

  &__text {
    font-size: 12.5px;
    line-height: 1.7;
    color: $text-secondary;
    margin: 0;
  }
}

// ── Revenue cards ──
.pd-revenue {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 16px;

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;

    @media (min-width: 640px) { grid-template-columns: repeat(4, 1fr); }
  }
}

.pd-rev-card {
  background: $bg;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 10px;
  text-align: center;

  &--accent {
    background: $accent-light;
    border-color: rgba(79, 106, 245, 0.2);
  }

  &__label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    color: $text-muted;
    margin-bottom: 3px;
  }

  &__value {
    font-size: 14px;
    font-weight: 900;
    color: $text-primary;
    font-variant-numeric: tabular-nums;
  }

  &--accent &__value { color: $accent; }
}

// ── ROI Calculator ──
.pd-roi {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 16px;

  &__presets {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  &__preset {
    padding: 4px 10px;
    font-size: 11.5px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    background: $bg;
    border: 1px solid $border;
    border-radius: 8px;
    cursor: pointer;
    color: $text-secondary;
    transition: all 0.12s;

    &:hover { border-color: $accent; color: $accent; }

    &--active {
      background: $accent;
      border-color: $accent;
      color: #fff;
    }
  }

  &__table {
    border: 1px solid $border;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  &__row {
    display: grid;
    grid-template-columns: 60px 1fr 1fr 70px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: $text-primary;
    border-bottom: 1px solid $border;

    &:last-child { border-bottom: none; }

    &--head {
      background: $bg;
      font-size: 10.5px;
      font-weight: 700;
      color: $text-muted;
      padding: 8px 12px;
    }
  }

  &__period { color: $text-secondary; }
  &__profit { color: #16a34a; font-weight: 700; }
  &__total { font-weight: 700; }
  &__pct { color: $accent; font-weight: 800; text-align: right; }

  &__note {
    font-size: 10.5px;
    color: $text-muted;
    line-height: 1.5;
    margin: 0;
  }
}

// ── Text card ──
.pd-text-card {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 14px 16px;

  &__body {
    font-size: 12.5px;
    line-height: 1.7;
    color: $text-secondary;
    margin: 0;
  }
}

// ── Notices ──
.pd-notices {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 14px 16px;

  &__list {
    margin: 0;
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 5px;

    li {
      font-size: 11.5px;
      line-height: 1.6;
      color: $text-muted;
      font-weight: 500;
    }
  }
}

// ── CTA ──
.pd-cta {
  display: flex;
  gap: 10px;
  padding-top: 6px;

  &__primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    justify-content: center;
    padding: 12px 20px;
    background: $accent;
    color: #fff;
    font-size: 14px;
    font-weight: 800;
    font-family: "Inter", sans-serif;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 16px rgba(79, 106, 245, 0.3);

    &:hover { background: #3b56d9; }
  }

  &__ghost {
    padding: 12px 20px;
    background: none;
    border: 1px solid $border;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    font-family: "Inter", sans-serif;
    color: $text-secondary;
    cursor: pointer;
    transition: background 0.12s;

    &:hover { background: $bg; }

    &--full { flex: 1; text-align: center; }
  }
}

.pd-empty {
  text-align: center;
  padding: 80px 20px;
  color: $text-muted;
  font-size: 14px;
}

// ── Facility tab ──
.fac {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fac-card {
  background: $surface;
  border: 1px solid $border;
  border-radius: 10px;
  padding: 16px;
}

.fac-overview__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;

  @media (min-width: 640px) { grid-template-columns: repeat(4, 1fr); }
}

.fac-ov {
  background: $bg;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 10px;
  text-align: center;

  &--accent {
    background: $accent-light;
    border-color: rgba(79, 106, 245, 0.2);
  }

  &__label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    color: $text-muted;
    margin-bottom: 3px;
  }

  &__value {
    font-size: 15px;
    font-weight: 900;
    color: $text-primary;
    font-variant-numeric: tabular-nums;
  }

  &--accent &__value { color: $accent; }

  &__sub {
    display: block;
    font-size: 10.5px;
    font-weight: 500;
    color: $text-muted;
  }
}

// Equipment
.fac-eq__list {
  border: 1px solid $border;
  border-radius: 8px;
  overflow: hidden;
}

.fac-eq__row {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 12px;
  border-bottom: 1px solid $border;

  &:last-child { border-bottom: none; }
}

.fac-eq__name {
  flex: 1;
  font-weight: 600;
  color: $text-primary;
}

.fac-eq__status {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 5px;
  margin-right: 10px;

  &--normal { background: #dcfce7; color: #16a34a; }
  &--warning { background: #fef3c7; color: #d97706; }
  &--offline { background: #f1f5f9; color: #94a3b8; }
}

.fac-eq__output {
  font-size: 12px;
  font-weight: 700;
  color: $text-secondary;
  font-variant-numeric: tabular-nums;
  min-width: 68px;
  text-align: right;
}

// Alerts
.fac-alerts__list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.fac-alert {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid $border;
  background: $bg;

  &--warning { border-color: #fcd34d; background: #fffbeb; }
  &--critical { border-color: #fca5a5; background: #fef2f2; }

  &__icon {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 900;
    flex-shrink: 0;

    &--info { background: #e2e8f0; color: #64748b; }
    &--warning { background: #fde68a; color: #92400e; }
    &--critical { background: #fca5a5; color: #991b1b; }
  }

  &__body { display: flex; flex-direction: column; gap: 2px; }
  &__msg { font-size: 12px; font-weight: 600; color: $text-primary; line-height: 1.4; }
  &__meta { font-size: 10.5px; font-weight: 500; color: $text-muted; }
}

// O&M
.fac-om__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  @media (max-width: 500px) { grid-template-columns: 1fr; }
}

.fac-om__item {
  background: $bg;
  border: 1px solid $border;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.fac-om__label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: $text-muted;
  margin-bottom: 3px;
}

.fac-om__value {
  font-size: 13px;
  font-weight: 800;
  color: $text-primary;
  font-variant-numeric: tabular-nums;
}

.fac-om__type {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: $accent;
  margin-top: 3px;
}

.fac-empty {
  text-align: center;
  padding: 48px 20px;
  color: $text-muted;

  svg { color: $text-muted; margin-bottom: 10px; }

  p {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 4px;
  }

  &__sub {
    font-size: 12px;
    color: $text-muted;
    font-weight: 500;
  }
}
</style>
