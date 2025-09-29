import { api } from '../client';

export interface HealthcheckResponse {
  success: boolean;
  message: string;
  data: Record<string, never>;
}

export const systemApi = {
  async healthcheck(): Promise<HealthcheckResponse> {
    // Backend shown sending GET with body; we will send query params instead
    return api.get<HealthcheckResponse>('/system/healthcheck?symbol=pax&isTrusted=true');
  },
};


