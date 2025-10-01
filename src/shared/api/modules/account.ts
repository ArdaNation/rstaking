import { api } from '../client';

export interface BalanceResponse {
  success: boolean;
  message: string;
  data: {
    balance: number;
    balanceUsd: number;
  };
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    puid: string;
    name: string;
    surname: string;
    email: string;
    telegmarId: string;
    lang: 'en' | 'ru' | string;
    isVerified: boolean;
    isDisabled: boolean;
    isDeleted: boolean;
  };
}

export interface TwoFaGenerateResponse {
  success: boolean;
  message: string;
  data: {
    secret: string;
  };
}

export interface TwoFaSetRequest {
  twoFaToken: string;
}

export interface TwoFaSetResponse {
  success: boolean;
  message: string;
  data: Record<string, never>;
}

export interface Session {
  id: number;
  token: string;
  expiresAt: string;
  country: string;
  timezone: string;
  ip: string;
  deviceId: string;
}

export interface ActiveSessionsResponse {
  success: boolean;
  message: string;
  data: Session[];
  server: {
    time: string;
    version: string;
    commit: string;
    date: string;
  };
}

export const accountApi = {
  async currentBalance(): Promise<BalanceResponse> {
    return api.get<BalanceResponse>('/private/account/balance/current');
  },
  async profileGet(): Promise<ProfileResponse> {
    return api.get<ProfileResponse>('/private/account/profile/get');
  },
  async setLang(lang: string): Promise<{ success: boolean; message: string; data: Record<string, never> }> {
    // Adjust this path if your backend differs
    return api.post<{ success: boolean; message: string; data: Record<string, never> }, { lang: string }>(
      '/private/account/profile/lang',
      { lang }
    );
  },
  async generate2FA(): Promise<TwoFaGenerateResponse> {
    return api.post<TwoFaGenerateResponse, Record<string, never>>('/private/account/profile/2fa/generate', {});
  },
  async set2FA(request: TwoFaSetRequest): Promise<TwoFaSetResponse> {
    return api.post<TwoFaSetResponse, TwoFaSetRequest>('/private/account/profile/2fa/set', request);
  },
  async getActiveSessions(): Promise<ActiveSessionsResponse> {
    return api.get<ActiveSessionsResponse>('/private/account/session/active');
  },
};


