/**
 * 공통 유틸리티 (AGENTS.md 12.1)
 */
class CommonUtil {
  static isNullOrEmpty<T>(obj: T | null | undefined): boolean {
    return obj === null || obj === undefined;
  }

  static isBlank(value: string | null | undefined): boolean {
    return value == null || value.trim() === "";
  }
}

export default CommonUtil;
