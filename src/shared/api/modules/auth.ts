import { api } from '../client';
import { trackAuthAction } from '../../analytics/gtag';

export interface LoginRequest {
  email: string;
  password: string;
  twoFaToken?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access: string;
    refresh: string;
  };
}

export interface RegisterRequest {
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: Record<string, never>;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
  data: Record<string, never>;
}

export interface ResetPasswordRequestPayload {
  email: string;
}

export interface ResetPasswordRequestResponse {
  success: boolean;
  message: string;
  data: Record<string, never>;
}

export interface ResetPasswordVerifyPayload {
  email: string;
  code: string;
  password: string;
}

export interface ResetPasswordVerifyResponse {
  success: boolean;
  message: string;
  data: Record<string, never>;
}

export interface RequestEmailVerificationPayload {
  email: string;
  password: string;
}

export interface RequestEmailVerificationResponse {
  success: boolean;
  message: string;
  data: Record<string, never>;
}

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse, LoginRequest>('/public/account/login', payload);
    if (response.success) {
      trackAuthAction('login');
    }
    return response;
  },
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse, RegisterRequest>('/public/account/create', payload);
    if (response.success) {
      trackAuthAction('register');
    }
    return response;
  },
  async logout(): Promise<LogoutResponse> {
    const response = await api.post<LogoutResponse, Record<string, never>>('/private/account/session/logout', {});
    if (response.success) {
      trackAuthAction('logout');
    }
    return response;
  },
  async resetPasswordRequest(payload: ResetPasswordRequestPayload): Promise<ResetPasswordRequestResponse> {
    const response = await api.post<ResetPasswordRequestResponse, ResetPasswordRequestPayload>(
      '/public/account/reset-password/request',
      payload
    );
    if (response.success) {
      trackAuthAction('reset_password');
    }
    return response;
  },
  async resetPasswordVerify(payload: ResetPasswordVerifyPayload): Promise<ResetPasswordVerifyResponse> {
    const response = await api.post<ResetPasswordVerifyResponse, ResetPasswordVerifyPayload>(
      '/public/account/reset-password/verify',
      payload
    );
    if (response.success) {
      trackAuthAction('reset_password');
    }
    return response;
  },
  async requestEmailVerification(
    payload: RequestEmailVerificationPayload
  ): Promise<RequestEmailVerificationResponse> {
    const response = await api.post<RequestEmailVerificationResponse, RequestEmailVerificationPayload>(
      '/public/account/request-email-verification',
      payload
    );
    if (response.success) {
      trackAuthAction('verify_email');
    }
    return response;
  },
};


