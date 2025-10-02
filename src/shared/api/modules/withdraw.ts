import { api } from '../client';
import { trackWithdrawAction } from '../../analytics/gtag';

export interface WithdrawRequestBody {
  amount: number;
  address: string;
  memo?: string | null;
}

export interface WithdrawRequestResponse {
  success: boolean;
  message: string;
  data: {
    puid: string;
    leftBalance: number;
    address: string;
  };
}

export interface WithdrawHistoryItem {
  puid: string;
  status: string;
  destinationAddress: string;
  amount: number;
  destinationMemo: string | null;
  txHash: string;
  requestedAt: string;
  isWithdrawn: boolean;
  withdrawnAt: string | null;
}

export interface WithdrawHistoryResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    rows: WithdrawHistoryItem[];
  };
}

export interface ICancelWithdrawRequest {
  puid: string;
}

export interface CancelWithdrawResponse {
  success: boolean;
  message: string;
  data: {
    puid: string;
  };
}

export const withdrawApi = {
  async request(body: WithdrawRequestBody): Promise<WithdrawRequestResponse> {
    const response = await api.post<WithdrawRequestResponse, WithdrawRequestBody>('/private/account/withdraw-requests/request', body);
    if (response.success) {
      trackWithdrawAction('request', body.amount);
    }
    return response;
  },
  async history(params: { offset?: number; limit?: number; order?: 'asc' | 'desc' } = {}): Promise<WithdrawHistoryResponse> {
    const { offset = 0, limit = 20, order = 'desc' } = params;
    return api.get<WithdrawHistoryResponse>(`/private/account/withdraw-requests/history?offset=${offset}&limit=${limit}&order=${order}`);
  },
  async cancel(body: ICancelWithdrawRequest): Promise<CancelWithdrawResponse> {
    const response = await api.post<CancelWithdrawResponse, ICancelWithdrawRequest>('/private/account/withdraw-requests/cancel', body);
    if (response.success) {
      trackWithdrawAction('cancel');
    }
    return response;
  },
};


