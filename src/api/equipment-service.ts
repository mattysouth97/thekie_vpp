import BaseService from "@/api/base-service";
import type RestClient from "@/api/rest-client";
import type { Equipment, EquipmentRegistrationPayload } from "@/types/equipment";

const STORAGE_KEY = "thekie_equipment_db";

class EquipmentService extends BaseService {
  constructor(restClient: RestClient) {
    super(restClient);
  }

  async getByUserId(userId: string): Promise<Equipment[]> {
    await this.delay(300);
    return this.getDb().filter((e) => e.registeredBy === userId);
  }

  async register(
    payload: EquipmentRegistrationPayload,
    userId: string,
  ): Promise<{ success: boolean; equipment?: Equipment; message?: string }> {
    await this.delay(600);

    const db = this.getDb();
    if (db.some((e) => e.rtu.rtuId === payload.rtu.rtuId)) {
      return { success: false, message: "이미 등록된 RTU ID입니다." };
    }

    const equipment: Equipment = {
      id: crypto.randomUUID(),
      ...payload,
      status: "registered",
      registeredAt: new Date().toISOString(),
      registeredBy: userId,
    };

    db.push(equipment);
    this.setDb(db);
    return { success: true, equipment };
  }

  async remove(
    equipmentId: string,
  ): Promise<{ success: boolean; message?: string }> {
    await this.delay(400);

    const db = this.getDb();
    const idx = db.findIndex((e) => e.id === equipmentId);
    if (idx === -1) return { success: false, message: "설비를 찾을 수 없습니다." };

    db.splice(idx, 1);
    this.setDb(db);
    return { success: true };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private getDb(): Equipment[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private setDb(data: Equipment[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export default EquipmentService;
