// NOTE: 공통 타입 정의 (AGENTS.md 2.1)

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface ApiResponseError {
  message?: string;
  code?: string;
  status?: number;
}

export type {
  Equipment,
  EquipmentRegistrationPayload,
  EquipmentType,
  RtuInfo,
  InverterInfo,
  ConnectionProtocol,
  EquipmentStatus,
} from "./equipment";
