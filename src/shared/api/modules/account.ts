import { api } from '../client';
import { trackAccountAction } from '../../analytics/gtag';

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
    const response = await api.get<BalanceResponse>('/private/account/balance/current');
    if (response.success) {
      trackAccountAction('balance_check');
    }
    return response;
  },
  async profileGet(): Promise<ProfileResponse> {
    const response = await api.get<ProfileResponse>('/private/account/profile/get');
    if (response.success) {
      trackAccountAction('profile_update');
    }
    return response;
  },
  async setLang(lang: string): Promise<{ success: boolean; message: string; data: Record<string, never> }> {
    // Adjust this path if your backend differs
    const response = await api.post<{ success: boolean; message: string; data: Record<string, never> }, { lang: string }>(
      '/private/account/profile/lang',
      { lang }
    );
    if (response.success) {
      trackAccountAction('profile_update');
    }
    return response;
  },
  async generate2FA(): Promise<TwoFaGenerateResponse> {
    const response = await api.post<TwoFaGenerateResponse, Record<string, never>>('/private/account/profile/2fa/generate', {});
    if (response.success) {
      trackAccountAction('2fa_setup');
    }
    return response;
  },
  async set2FA(request: TwoFaSetRequest): Promise<TwoFaSetResponse> {
    const response = await api.post<TwoFaSetResponse, TwoFaSetRequest>('/private/account/profile/2fa/set', request);
    if (response.success) {
      trackAccountAction('2fa_setup');
    }
    return response;
  },
  async getActiveSessions(): Promise<ActiveSessionsResponse> {
    const response = await api.get<ActiveSessionsResponse>('/private/account/session/active');
    if (response.success) {
      trackAccountAction('session_check');
    }
    return response;
  },
};


