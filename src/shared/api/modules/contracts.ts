import { api } from '../client';
import { trackContractAction } from '../../analytics/gtag';

export type ContractType = 'unlimited' | 'yearly' | 'monthly' | string;

export interface BuyContractRequest {
  type: ContractType;
  amount: number;
}

export interface UnstakeContractRequest {
  puid: string;
}

export interface ContractEntity {
  id: number;
  contractId: number;
  puid?: string;
  contractType: ContractType;
  stakedAmount: number;
  maxContractReward: number;
  totalRewardReceived: number;
  contractRewardRate: number;
  nextRewardAmount: number;
  nextRewardAt: string;
  isUnstakeable: boolean;
  isStakedAmountWithdrawen?: boolean;
  isCompleted?: boolean;
  filledPercent?: number;
  createdAt?: string;
  rate?: number;
  // New fields from backend for unstake/resume flow
  isUnstaked?: boolean;
  unstakedAt?: string | null;
  stakedAmountWithdrawenAt?: string | null;
}

export interface BuyContractResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    isUnstakeable: boolean;
    userId: number;
    contractType: ContractType;
    stakedAmount: number;
    maxContractReward: number;
    totalRewardReceived: number;
    contractRewardRate: number;
    nextRewardAmount: number;
    nextRewardAt: string;
    updatedAt: string;
    createdAt: string;
    isUnstaked: boolean;
    unstakedAt: string | null;
    isStakedAmountWithdrawen: boolean;
    stakedAmountWithdrawenAt: string | null;
    isCompleted: boolean;
    completedAt: string | null;
    isDeleted: boolean;
    deletedAt: string | null;
  };
}

export interface ContractsListResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    rows: ContractEntity[];
  };
}

export interface ContractsStatisticResponse {
  success: boolean;
  message: string;
  data: {
    totalAmount: number;
    totalContracts: number;
    totalRewardReceived: number;
    totalAccountReward: number;
    maxContractReward: number;
    avgRewardRate: number;
    contractRewardRemaining: number;
    monthlyProfit: number;
    avgProfit: number;
  };
}

export interface UnstakeContractResponse {
  success: boolean;
  message: string;
  data: {
    puid: string;
    contractId: number;
    filledPercent: number | null;
    isUnstaked: boolean;
    unstakedAt: string | null;
    isStakedAmountWithdrawen: boolean;
    stakedAmountWithdrawenAt: string | null;
    isCompleted: boolean;
    completedAt: string | null;
    contractType: string;
    stakedAmount: number;
    maxContractReward: number;
    totalRewardReceived: number;
  };
}

export interface ResumeUnstakedContractRequest {
  puid: string;
}

export interface ResumeUnstakedContractResponse {
  success: boolean;
  message: string;
  data: {
    puid: string;
    contractId: number;
    isUnstaked: boolean;
    unstakedAt: string | null;
    isCompleted: boolean;
    completedAt: string | null;
    contractType: string;
    stakedAmount: number;
    maxContractReward: number;
    totalRewardReceived: number;
    nextRewardAt?: string;
    nextRewardAmount?: number;
  };
}

export const contractsApi = {
  async buy(payload: BuyContractRequest): Promise<BuyContractResponse> {
    const response = await api.post<BuyContractResponse, BuyContractRequest>('/private/account/contracts/buy', payload);
    if (response.success) {
      trackContractAction('buy', payload.type, payload.amount);
    }
    return response;
  },
  async unstake(payload: UnstakeContractRequest): Promise<UnstakeContractResponse> {
    const response = await api.post<UnstakeContractResponse, UnstakeContractRequest>('/private/account/contracts/unstake', payload);
    if (response.success) {
      trackContractAction('unstake');
    }
    return response;
  },
  async resumeUnstakedContract(payload: ResumeUnstakedContractRequest): Promise<ResumeUnstakedContractResponse> {
    const response = await api.post<ResumeUnstakedContractResponse, ResumeUnstakedContractRequest>(
      '/private/account/contracts/resume-unstaked-contract',
      payload
    );
    if (response.success) {
      trackContractAction('resume');
    }
    return response;
  },
  async active(params: { offset?: number; limit?: number; order?: 'asc' | 'desc' } = {}): Promise<ContractsListResponse> {
    const { offset = 0, limit = 15, order = 'desc' } = params;
    return api.get<ContractsListResponse>(`/private/account/contracts/active?offset=${offset}&limit=${limit}&order=${order}`);
  },
  async completed(params: { offset?: number; limit?: number; order?: 'asc' | 'desc' } = {}): Promise<ContractsListResponse> {
    const { offset = 0, limit = 15, order = 'desc' } = params;
    return api.get<ContractsListResponse>(`/private/account/contracts/completed?offset=${offset}&limit=${limit}&order=${order}`);
  },
  async statistic(): Promise<ContractsStatisticResponse> {
    return api.get<ContractsStatisticResponse>('/private/account/contracts/statistic');
  },
};


