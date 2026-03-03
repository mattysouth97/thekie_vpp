import type RestClient from "@/api/rest-client";

/**
 * API 서비스 베이스 클래스 (AGENTS.md 6.1)
 */
abstract class BaseService {
  protected restClient: RestClient;

  constructor(restClient: RestClient) {
    this.restClient = restClient;
  }
}

export default BaseService;
