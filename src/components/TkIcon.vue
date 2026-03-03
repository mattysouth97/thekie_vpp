<!--
  TkIcon — THEKIE Duotone Icon System (wrapper)

  Usage:
    <TkIcon name="solar" />
    <TkIcon name="lightning" :size="28" color="#4F6AF5" />

  For direct imports (tree-shakeable):
    import { IcoSolar } from '@/components/icons';
    <IcoSolar :size="24" />
-->
<script setup lang="ts">
import { computed, type Component } from "vue";

import IcoHome from "./icons/IcoHome.vue";
import IcoWallet from "./icons/IcoWallet.vue";
import IcoSavings from "./icons/IcoSavings.vue";
import IcoGlobe from "./icons/IcoGlobe.vue";
import IcoBell from "./icons/IcoBell.vue";
import IcoSearch from "./icons/IcoSearch.vue";
import IcoUser from "./icons/IcoUser.vue";
import IcoSettings from "./icons/IcoSettings.vue";
import IcoArrowRight from "./icons/IcoArrowRight.vue";
import IcoArrowLeft from "./icons/IcoArrowLeft.vue";
import IcoCheck from "./icons/IcoCheck.vue";
import IcoLock from "./icons/IcoLock.vue";
import IcoLightning from "./icons/IcoLightning.vue";
import IcoCoin from "./icons/IcoCoin.vue";
import IcoChartUp from "./icons/IcoChartUp.vue";
import IcoChartDown from "./icons/IcoChartDown.vue";
import IcoChartBar from "./icons/IcoChartBar.vue";
import IcoSolar from "./icons/IcoSolar.vue";
import IcoWind from "./icons/IcoWind.vue";
import IcoBattery from "./icons/IcoBattery.vue";
import IcoGrid from "./icons/IcoGrid.vue";
import IcoMeter from "./icons/IcoMeter.vue";
import IcoInverter from "./icons/IcoInverter.vue";
import IcoPlug from "./icons/IcoPlug.vue";
import IcoHydro from "./icons/IcoHydro.vue";
import IcoFuelCell from "./icons/IcoFuelCell.vue";
import IcoSmp from "./icons/IcoSmp.vue";
import IcoRec from "./icons/IcoRec.vue";
import IcoPpa from "./icons/IcoPpa.vue";
import IcoKau from "./icons/IcoKau.vue";
import IcoDr from "./icons/IcoDr.vue";
import IcoNpv from "./icons/IcoNpv.vue";
import IcoWeatherClear from "./icons/IcoWeatherClear.vue";
import IcoWeatherPartly from "./icons/IcoWeatherPartly.vue";
import IcoWeatherWind from "./icons/IcoWeatherWind.vue";
import IcoWeatherRain from "./icons/IcoWeatherRain.vue";
import IcoWeatherCloud from "./icons/IcoWeatherCloud.vue";
import IcoBlockchain from "./icons/IcoBlockchain.vue";
import IcoBuilding from "./icons/IcoBuilding.vue";
import IcoDocument from "./icons/IcoDocument.vue";
import IcoEye from "./icons/IcoEye.vue";
import IcoEyeOff from "./icons/IcoEyeOff.vue";
import IcoClose from "./icons/IcoClose.vue";
import IcoChevronDown from "./icons/IcoChevronDown.vue";
import IcoLink from "./icons/IcoLink.vue";
import IcoUsers from "./icons/IcoUsers.vue";
import IcoLogout from "./icons/IcoLogout.vue";
import IcoStar from "./icons/IcoStar.vue";
import IcoInfo from "./icons/IcoInfo.vue";
import IcoGithub from "./icons/IcoGithub.vue";
import IcoMail from "./icons/IcoMail.vue";
import IcoMapPin from "./icons/IcoMapPin.vue";

const props = defineProps<{
  name: string;
  size?: number | string;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
}>();

const iconMap: Record<string, Component> = {
  home: IcoHome,
  wallet: IcoWallet,
  savings: IcoSavings,
  globe: IcoGlobe,
  bell: IcoBell,
  search: IcoSearch,
  user: IcoUser,
  settings: IcoSettings,
  "arrow-right": IcoArrowRight,
  "arrow-left": IcoArrowLeft,
  check: IcoCheck,
  lock: IcoLock,
  lightning: IcoLightning,
  coin: IcoCoin,
  "chart-up": IcoChartUp,
  "chart-down": IcoChartDown,
  "chart-bar": IcoChartBar,
  solar: IcoSolar,
  wind: IcoWind,
  battery: IcoBattery,
  grid: IcoGrid,
  meter: IcoMeter,
  inverter: IcoInverter,
  plug: IcoPlug,
  hydro: IcoHydro,
  "fuel-cell": IcoFuelCell,
  smp: IcoSmp,
  rec: IcoRec,
  ppa: IcoPpa,
  kau: IcoKau,
  dr: IcoDr,
  npv: IcoNpv,
  "weather-clear": IcoWeatherClear,
  "weather-partly": IcoWeatherPartly,
  "weather-wind": IcoWeatherWind,
  "weather-rain": IcoWeatherRain,
  "weather-cloud": IcoWeatherCloud,
  blockchain: IcoBlockchain,
  building: IcoBuilding,
  document: IcoDocument,
  eye: IcoEye,
  "eye-off": IcoEyeOff,
  close: IcoClose,
  "chevron-down": IcoChevronDown,
  link: IcoLink,
  users: IcoUsers,
  logout: IcoLogout,
  star: IcoStar,
  info: IcoInfo,
  github: IcoGithub,
  mail: IcoMail,
  "map-pin": IcoMapPin,
  // Legacy alias
  "logo-mark": IcoLightning,
};

const IconComponent = computed(() => iconMap[props.name] ?? null);
</script>

<template>
  <component
    :is="IconComponent"
    v-if="IconComponent"
    :size="size"
    :color="color"
    :fillColor="fillColor"
    :strokeWidth="strokeWidth"
  />
</template>
