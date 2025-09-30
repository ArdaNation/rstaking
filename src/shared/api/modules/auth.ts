import { api } from '../client';

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
    return api.post<LoginResponse, LoginRequest>('/public/account/login', payload);
  },
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    return api.post<RegisterResponse, RegisterRequest>('/public/account/create', payload);
  },
  async logout(): Promise<LogoutResponse> {
    return api.post<LogoutResponse, {}>('/private/account/session/logout', {});
  },
  async resetPasswordRequest(payload: ResetPasswordRequestPayload): Promise<ResetPasswordRequestResponse> {
    return api.post<ResetPasswordRequestResponse, ResetPasswordRequestPayload>(
      '/public/account/reset-password/request',
      payload
    );
  },
  async resetPasswordVerify(payload: ResetPasswordVerifyPayload): Promise<ResetPasswordVerifyResponse> {
    return api.post<ResetPasswordVerifyResponse, ResetPasswordVerifyPayload>(
      '/public/account/reset-password/verify',
      payload
    );
  },
  async requestEmailVerification(
    payload: RequestEmailVerificationPayload
  ): Promise<RequestEmailVerificationResponse> {
    return api.post<RequestEmailVerificationResponse, RequestEmailVerificationPayload>(
      '/public/account/request-email-verification',
      payload
    );
  },
};


