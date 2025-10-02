import { api } from '../client';
import { trackInvoiceAction } from '../../analytics/gtag';

export interface InvoiceRequestBody {
  amount: number;
}

export interface InvoiceByIdRequest {
  puid: string;
}

export interface InvoiceRequestResponse {
  success: boolean;
  message: string;
  data: {
    puid: string;
    isCompleted: boolean;
    compeledAt: string | null;
    isAccounted: boolean;
    accountedAt: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
    id: number;
    userId: number;
    assetId: number;
    amount: number;
    address: string;
    memo: string;
    status: string;
    txHash: string;
    updatedAt: string;
    createdAt: string;
  };
}

export const invoicesApi = {
  async request(body: InvoiceRequestBody): Promise<InvoiceRequestResponse> {
    const response = await api.post<InvoiceRequestResponse, InvoiceRequestBody>('/private/account/invoices/request', body);
    if (response.success) {
      trackInvoiceAction('request', body.amount);
    }
    return response;
  },
  async getByPuid(): Promise<InvoiceRequestResponse> {
    const response = await api.get<InvoiceRequestResponse>(`/private/account/invoices/request`);
    if (response.success) {
      trackInvoiceAction('get');
    }
    return response;
  },
  async getById(body: InvoiceByIdRequest): Promise<InvoiceRequestResponse> {
    const response = await api.post<InvoiceRequestResponse, InvoiceByIdRequest>('/private/account/invoices/invoice/by/id', body);
    if (response.success) {
      trackInvoiceAction('get');
    }
    return response;
  },
};


