export type EquipmentType = "태양광" | "풍력" | "ESS" | "소수력" | "연료전지";
export type ConnectionProtocol = "Modbus TCP" | "Modbus RTU" | "DNP3" | "IEC 61850" | "MQTT";
export type EquipmentStatus = "registered" | "pending" | "active" | "inactive";

export interface RtuInfo {
  rtuId: string;
  rtuModel: string;
  rtuSerial: string;
  protocol: ConnectionProtocol;
  ipAddress: string;
  port: string;
}

export interface InverterInfo {
  inverterModel: string;
  inverterSerial: string;
  inverterCapacity: string;
  manufacturer: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  siteName: string;
  siteAddress: string;
  capacity: string;
  capacityUnit: "kW" | "MW";
  rtu: RtuInfo;
  inverter: InverterInfo;
  status: EquipmentStatus;
  registeredAt: string;
  registeredBy: string;
}

export interface EquipmentRegistrationPayload {
  name: string;
  type: EquipmentType;
  siteName: string;
  siteAddress: string;
  capacity: string;
  capacityUnit: "kW" | "MW";
  rtu: RtuInfo;
  inverter: InverterInfo;
}
