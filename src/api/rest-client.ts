/**
 * REST API 클라이언트 (AGENTS.md 6.1)
 */
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export interface RequestParameter {
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

class RestClient {
  private client: AxiosInstance;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL ?? "") {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true,
    });
  }

  async call<T>(method: string, url: string, config?: RequestParameter): Promise<T> {
    const axiosConfig: AxiosRequestConfig = {
      method,
      url,
      data: config?.body,
      params: config?.params,
      headers: config?.headers,
    };
    const { data } = await this.client.request<T>(axiosConfig);
    return data;
  }
}

export default RestClient;
