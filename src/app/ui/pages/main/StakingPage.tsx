import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { contractsApi, type ContractType, type ContractEntity, type ContractsStatisticResponse } from '../../../../shared/api/modules/contracts';
import { useBalance } from '../../../../shared/account/useBalance';
import './contracts.scss';
import ShutIcon from '../../../../assets/shut.svg';
import { useDepositModal } from '../../layout/DepositModalContext';
import { emitBalanceReload, BALANCE_RELOAD_EVENT } from '../../../../shared/events';
import toast from 'react-hot-toast';

export default function StakingPage() {
  const { t } = useTranslation();
  const [type, setType] = useState<ContractType>('unlimited');
  const [amount, setAmount] = useState<number>(0);
  const [displayValue, setDisplayValue] = useState<string>('');
  const [active, setActive] = useState<ContractEntity[]>([]);
  const [completed, setCompleted] = useState<ContractEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [expandedContracts, setExpandedContracts] = useState<Set<number>>(new Set());
  const [statistics, setStatistics] = useState<ContractsStatisticResponse['data'] | null>(null);
  const [unstakeModal, setUnstakeModal] = useState<{ isOpen: boolean; contractPuid: string | null }>({
    isOpen: false,
    contractPuid: null
  });
  const [resumeModal, setResumeModal] = useState<{ isOpen: boolean; contractPuid: string | null; unstakedAt: string | null }>({
    isOpen: false,
    contractPuid: null,
    unstakedAt: null,
  });
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const { balance, realBalance, reload: reloadBalance } = useBalance();
  const { openDepositWithAmount } = useDepositModal();


  const potentialProfit = useMemo(() => {
    if (amount <= 0) return 0;
    
    switch (type) {
      case 'yearly':
        return amount * 0.30; // 30% profit per annum
      case 'monthly':
        return amount * 0.20; // 20% profit per month
      case 'unlimited':
        return amount * 0.09; // 9% profit per month
      default:
        return amount * 0.09;
    }
  }, [amount, type]);

  const profitPeriod = useMemo(() => {
    switch (type) {
      case 'yearly':
        return 'per month';
      case 'monthly':
      case 'unlimited':
      default:
        return 'per month';
    }
  }, [type]);


  const stats = useMemo(() => {
    if (statistics) {
      return {
        activeValue: activeTab === 'active' ? statistics.totalAmount : statistics.totalAmount,
        rewardsReceived: statistics.totalRewardReceived,
        remainingRewards: statistics.contractRewardRemaining,
      };
    }
    const contracts = activeTab === 'active' ? active : completed;
    const out = { activeValue: 0, rewardsReceived: 0, remainingRewards: 0 };
    for (const c of contracts) {
      const staked = Number(c.stakedAmount ?? 0);
      const received = Number(c.totalRewardReceived ?? 0);
      const max = Number(c.maxContractReward ?? 0);
      out.activeValue += staked;
      out.rewardsReceived += received;
      out.remainingRewards += Math.max(0, max - received);
    }
    return out;
  }, [active, completed, activeTab, statistics]);

  const canBuy = useMemo(() => amount > 0 && type && type.length > 0, [amount, type]);
  const isStakeDisabled = useMemo(() => {
    // console.log('realBalance', realBalance);
    if (realBalance == null || Number(realBalance) <= 0) {
      return false; // позволяем клик, чтобы открыть депозит
    }
    return !canBuy;
  }, [realBalance, canBuy]);


  const getContractTypeName = (contractType: string) => {
    switch (contractType) {
      case 'yearly':
        return 'Annual Staking';
      case 'monthly':
        return 'Monthly Staking';
      case 'unlimited':
        return 'Unlimited Staking';
      default:
        return 'Monthly Staking';
    }
  };


  const formatNextRewardTime = useCallback((dateString: string, isUnstaked?: boolean) => {
    if (isUnstaked) {
      return '00:00:00';
    }
    
    const targetDate = new Date(dateString);
    const diffMs = targetDate.getTime() - currentTime.getTime();
    
    if (diffMs <= 0) {
      return '00:00:00';
    }
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [currentTime]);

  const formatResumeRemaining = useCallback((unstakedAt?: string | null) => {
    if (!unstakedAt) return '00:00:00:00';
    const start = new Date(unstakedAt);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const diffMs = end.getTime() - currentTime.getTime();
    if (diffMs <= 0) return '00:00:00:00';
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diffMs % (60 * 1000)) / 1000);
    return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [currentTime]);

  const toggleContract = (contractId: number) => {
    setExpandedContracts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contractId)) {
        newSet.delete(contractId);
      } else {
        newSet.add(contractId);
      }
      return newSet;
    });
  };

  const loadLists = async () => {
    setLoading(true);
    try {
      const [a, c, s] = await Promise.all([
        contractsApi.active({ offset: 0, limit: 15, order: 'desc' }),
        contractsApi.completed({ offset: 0, limit: 15, order: 'desc' }),
        contractsApi.statistic(),
      ]);
      setActive(a.data.rows);
      setCompleted(c.data.rows);
      setStatistics(s.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLists();
  }, []);

  useEffect(() => {
    if (realBalance !== null && Number(realBalance) > 0) {
      setAmount(Number(realBalance));
    }
  }, [realBalance]);

  useEffect(() => {
    if (amount > 0) {
      setDisplayValue(`${amount} XRP`);
    } else {
      setDisplayValue('');
    }
  }, [amount]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onBalanceReload = () => { void reloadBalance(); };
    window.addEventListener(BALANCE_RELOAD_EVENT, onBalanceReload);
    return () => {
      window.removeEventListener(BALANCE_RELOAD_EVENT, onBalanceReload);
    };
  }, [reloadBalance]);

  const buy = async () => {
    if (realBalance == null || Number(realBalance) <= 0) {
      if (openDepositWithAmount) {
        void openDepositWithAmount(100);
      }
      return;
    }
    
    if (type === 'yearly' && amount < 1000) {
      toast.error('Minimum is 1000 XRP');
      return;
    }
    if (type === 'monthly' && amount < 500) {
      toast.error('Minimum is 500 XRP');
      return;
    }
    if (type === 'unlimited' && amount < 100) {
      toast.error('Minimum is 100 XRP');
      return;
    }

    
    if (amount > Number(realBalance)) {
      toast.error('Insufficient balance');
      return;
    }
    
    try {
      const res = await contractsApi.buy({ type, amount });
      console.log('Contract bought:', res.message);
      await loadLists();
      await reloadBalance();
      emitBalanceReload();
      toast.success('You successfully started staking');
    } catch (e) {
      console.error('Buy failed:', e instanceof Error ? e.message : 'Failed');
    }
  };

  const openUnstakeModal = (contractPuid: string) => {
    setUnstakeModal({ isOpen: true, contractPuid });
  };

  const closeUnstakeModal = () => {
    setUnstakeModal({ isOpen: false, contractPuid: null });
  };

  const unstake = async (contractPuid: string) => {
    try {
      const res = await contractsApi.unstake({ puid: contractPuid });
      console.log('Unstake successful:', res.message);
      await loadLists();
      await reloadBalance();
      closeUnstakeModal();
      toast.success('Your 7 days unstaking period started');
    } catch (e) {
      console.error('Unstake failed:', e instanceof Error ? e.message : 'Failed');
    }
  };

  const openResumeModal = (contractPuid: string, unstakedAt: string | null) => {
    setResumeModal({ isOpen: true, contractPuid, unstakedAt });
  };

  const closeResumeModal = () => {
    setResumeModal({ isOpen: false, contractPuid: null, unstakedAt: null });
  };

  const resumeStaking = async (contractPuid: string) => {
    try {
      const res = await contractsApi.resumeUnstakedContract({ puid: contractPuid });
      console.log('Resume successful:', res.message);
      await loadLists();
      await reloadBalance();
      closeResumeModal();
      toast.success('You successfully resumed staking');
    } catch (e) {
      console.error('Resume failed:', e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <section className="contracts">
      <h1 className="section-title">Staking</h1>
      
      {/* How to Start Banner */}
      <div className="how-to-start-banner">
        <h2 className="how-to-start-banner__title">How to Start Staking XRP</h2>
        
        <div className="how-to-start-banner__steps">
          <div className="how-to-start-banner__step">
            <div className="how-to-start-banner__step-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="how-to-start-banner__step-title">1. Fund Your Deposit</h3>
            <p className="how-to-start-banner__step-description">Sign up in just a few minutes and make your first deposit in XRP.</p>
          </div>
          
          <div className="how-to-start-banner__step">
            <div className="how-to-start-banner__step-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="how-to-start-banner__step-title">2. Choose Your Plan</h3>
            <p className="how-to-start-banner__step-description">Select the option that best fits your goals and investment style.</p>
          </div>
          
          <div className="how-to-start-banner__step">
            <div className="how-to-start-banner__step-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 9L12 15L6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="how-to-start-banner__step-title">3. Start Earning Right Away</h3>
            <p className="how-to-start-banner__step-description">Receive daily rewards and track your income anytime.</p>
          </div>
        </div>
      </div>
      
      <div>

      {/* <p className="section-desc">{t('contracts.staking')}</p> */}

      <div className="plans-wrap">
        
        <div className="plans">
          {(['yearly', 'monthly', 'unlimited'] as ContractType[]).map((p) => (
            <button key={p} className={`plan ${type === p ? 'plan--active' : ''}`} onClick={() => setType(p)}>
              <div className="plan__title">{t(`contracts.plans.${p}.title`)}</div>
              <div className="plan__info">
                <div className="plan__yield">{t(`contracts.plans.${p}.yield`)}</div>
                {/* <div className="plan__desc">{t(`contracts.plans.${p}.desc`)}</div> */}
              </div>
              <div className="plan__stickers">
                {p === 'yearly' && (
                  <>
                    <div className="plan__sticker">
                      <svg className="plan__sticker-icon" viewBox="0 0 12 12" fill="none">
                        <path d="M9.5 4.5V3.5C9.5 2.11929 8.38071 1 7 1H5C3.61929 1 2.5 2.11929 2.5 3.5V4.5M9.5 4.5H2.5M9.5 4.5V9.5C9.5 10.8807 8.38071 12 7 12H5C3.61929 12 2.5 10.8807 2.5 9.5V4.5M6 7.5V6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      365 days lock
                    </div>
                    <div className="plan__sticker">
                      <svg className="plan__sticker-icon" viewBox="0 0 12 12" fill="none">
                        <path d="M10 2H2C1.44772 2 1 2.44772 1 3V10C1 10.5523 1.44772 11 2 11H10C10.5523 11 11 10.5523 11 10V3C11 2.44772 10.5523 2 10 2Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 1V3M4 1V3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 5H11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      1000 XRP min
                    </div>
                    <div className="plan__sticker">
                      <svg className="plan__sticker-icon" viewBox="0 0 12 12" fill="none">
                        <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      No early withdrawal
                    </div>
                  </>
                )}
                {p === 'monthly' && (
                  <>
                    <div className="plan__sticker">
                      <svg className="plan__sticker-icon" viewBox="0 0 12 12" fill="none">
                        <path d="M9.5 4.5V3.5C9.5 2.11929 8.38071 1 7 1H5C3.61929 1 2.5 2.11929 2.5 3.5V4.5M9.5 4.5H2.5M9.5 4.5V9.5C9.5 10.8807 8.38071 12 7 12H5C3.61929 12 2.5 10.8807 2.5 9.5V4.5M6 7.5V6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      30 days lock
                    </div>
                    <div className="plan__sticker">
                      <svg className="plan__sticker-icon" viewBox="0 0 12 12" fill="none">
                        <path d="M10 2H2C1.44772 2 1 2.44772 1 3V10C1 10.5523 1.44772 11 2 11H10C10.5523 11 11 10.5523 11 10V3C11 2.44772 10.5523 2 10 2Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 1V3M4 1V3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 5H11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      500 XRP min
                    </div>
                    <div className="plan__sticker">
                      <svg className="plan__sticker-icon" viewBox="0 0 12 12" fill="none">
                        <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      No early withdrawal
                    </div>
                  </>
                )}
                {p === 'unlimited' && (
                  <>
                    <div className="plan__sticker">
                      <svg className="plan__sticker-icon" viewBox="0 0 12 12" fill="none">
                        <path d="M9.5 4.5V3.5C9.5 2.11929 8.38071 1 7 1H5C3.61929 1 2.5 2.11929 2.5 3.5V4.5M9.5 4.5H2.5M9.5 4.5V9.5C9.5 10.8807 8.38071 12 7 12H5C3.61929 12 2.5 10.8807 2.5 9.5V4.5M6 7.5V6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      No lock
                    </div>
                    <div className="plan__sticker">
                      <svg className="plan__sticker-icon" viewBox="0 0 12 12" fill="none">
                        <path d="M10 2H2C1.44772 2 1 2.44772 1 3V10C1 10.5523 1.44772 11 2 11H10C10.5523 11 11 10.5523 11 10V3C11 2.44772 10.5523 2 10 2Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 1V3M4 1V3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 5H11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      100 XRP min
                    </div>
                    <div className="plan__sticker">
                      <svg className="plan__sticker-icon" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.5L5 9L9.5 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Early withdrawal
                    </div>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
          </div>

      <div className="stake">
        <div className="stake__inner">
          <div className="stake__balance">
            <span>Potential Profit {profitPeriod}</span>
            <br />
            <strong>{potentialProfit?.toFixed(0)} XRP</strong>
          </div>
          <div className="stake__meta">
            <div className="stake__row"><span className="label">Potential Profit {profitPeriod}:</span><span className="value">{potentialProfit?.toFixed(0)} XRP</span></div>
            <div className="stake__row"><span className="label">Balance:</span><span className="value">{balance !== null ? `${balance} XRP` : '-'}</span></div>
          </div>
          <div className="stake__form">
            <div className="stake__input-wrap">
              <input 
                aria-label="amount" 
                type="text" 
                value={displayValue} 
                placeholder="0 XRP"
                onChange={(e) => {
                  const input = e.target.value;
                  const cursorPos = e.target.selectionStart ?? 0;
                  
                  // Убираем " XRP" из конца строки для обработки
                  const cleanValue = input.replace(/\s+XRP\s*$/, '');
                  
                  // Проверяем, что введено только число
                  if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
                    const numValue = Number(cleanValue) || 0;
                    setAmount(numValue);
                    
                    // Если есть число, добавляем " XRP", иначе оставляем пустым
                    if (numValue > 0) {
                      const newDisplayValue = `${numValue} XRP`;
                      setDisplayValue(newDisplayValue);
                      
                      // Устанавливаем курсор в правильную позицию
                      setTimeout(() => {
                        const newCursorPos = Math.min(cursorPos, newDisplayValue.length - 4); // -4 для " XRP"
                        e.target.setSelectionRange(newCursorPos, newCursorPos);
                      }, 0);
                    } else {
                      setDisplayValue('');
                    }
                  }
                }}
                onKeyDown={(e) => {
                  const cursorPos = e.currentTarget.selectionStart ?? 0;
                  const value = e.currentTarget.value;
                  const xrpStart = value.lastIndexOf('XRP');
                  
                  // Запрещаем удаление "XRP" с помощью клавиш только если есть значение
                  if (value && xrpStart >= 0) {
                    if (e.key === 'Backspace' && cursorPos >= xrpStart) {
                      e.preventDefault();
                    }
                    if (e.key === 'Delete' && cursorPos >= xrpStart) {
                      e.preventDefault();
                    }
                  }
                  
                  // Запрещаем ввод нецифровых символов
                  if (!/[\d\s]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onSelect={(e) => {
                  const cursorPos = e.currentTarget.selectionStart ?? 0;
                  const value = e.currentTarget.value;
                  const xrpStart = value.lastIndexOf('XRP');
                  
                  // Не позволяем выделить "XRP" только если есть значение
                  if (value && xrpStart >= 0 && cursorPos >= xrpStart) {
                    e.currentTarget.setSelectionRange(xrpStart, xrpStart);
                  }
                }}
              />
            </div>
            <button onClick={buy} disabled={isStakeDisabled}>
              <span className="desktop-text">{t('contracts.stake')}</span>
              <span className="mobile-text">Buy Contract</span>
            </button>
          </div>
        </div>
        {/* {buyMsg && <p className="stake__msg">{buyMsg}</p>}
        {unstakeMsg && <p className="stake__msg">{unstakeMsg}</p>} */}
      </div>

      <div className="my">
        <p className="section-desc">My Staking</p>
        <div className="my__tabs">
          <button className={activeTab === 'active' ? 'active' : ''} onClick={() => setActiveTab('active')}>Active Stake</button>
          <button className={activeTab === 'completed' ? 'active' : ''} onClick={() => setActiveTab('completed')}>Completed Staking</button>
        </div>
        <div className={`my__stats ${activeTab === 'completed' ? 'my__stats--completed' : ''}`}>
          <div className="stat">
            <div className="stat__title desktop-title">{activeTab === 'active' ? 'Active Contracts Value' : 'Deposited'}</div>
            <div className="stat__title mobile-title">{activeTab === 'active' ? 'Active Contracts Value' : 'Deposited'}</div>
            <div className="stat__value">{stats.activeValue?.toFixed(0)} XRP</div>
          </div>
          <div className="stat">
            <div className="stat__title desktop-title">{activeTab === 'active' ? 'Rewards Received' : 'Earned'}</div>
            <div className="stat__title mobile-title">{activeTab === 'active' ? 'Rewards Received' : 'Earned'}</div>
            <div className="stat__value">{stats.rewardsReceived?.toFixed(0)} XRP</div>
          </div>
          {activeTab === 'active' && (
            <div className="stat ">
              <div className="stat__title">Remaining Rewards</div>
              <div className="stat__value">{stats.remainingRewards?.toFixed(0)} XRP</div>
            </div>
          )}
        </div>
        <div className="my__grid">
          {loading && <p>{t('contracts.loading')}</p>}
          {!loading && ((activeTab === 'active' && active.length === 0) || (activeTab === 'completed' && completed.length === 0)) && (
            <div className="placeholder">No {activeTab} contracts yet</div>
          )}
          {!loading && (activeTab === 'active' ? active : completed).map((c) => {
            const isExpanded = expandedContracts.has(c.contractId);
            const profitRate = c.contractType === 'monthly' ? '20%' : c.contractType === 'yearly' ? '30%' : '9%';
            return (
              <div key={`${activeTab}_${c.contractId}`} className="card">
                <div className="card__head">
                  <div className="card__title">
                    <div className="card__contract-info">
                      <div className="card__contract-number">Contract #{c.contractId}</div>
                      <div className="card__expand mobile-only" onClick={() => toggleContract(c.contractId)}>
                        <svg className={`card__icon ${isExpanded ? 'card__icon--expanded' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                    {/* <div className="card__creation-date">{c.createdAt ? formatDate(c.createdAt) : formatDate(c.nextRewardAt)}</div> */}
                  </div>
                  <div className="card__next-reward desktop-only">
                    <div className="meta">{c.totalRewardReceived?.toFixed(2)} / {c.contractType === 'unlimited' ? '∞' : c.maxContractReward?.toFixed(2)} XRP</div>
                    {!c.isCompleted && (
                      <span>Next Reward <strong>{c.nextRewardAmount?.toFixed(2)} XRP</strong> in {formatNextRewardTime(c.nextRewardAt, c.isUnstaked)}</span>
                    )}
                  </div>
                  {!c.isCompleted && (
                    <div className="card__next-reward-mobile mobile-only">
                      +{c.nextRewardAmount?.toFixed(0)}$ in {formatNextRewardTime(c.nextRewardAt, c.isUnstaked)}
                    </div>
                  )}
                </div>
                <div className="card__progress">
                  <div className="bar"><span style={{ 
                    width: `${Math.min(100, Math.max(0, 
                      c.contractType === 'unlimited' 
                        ? 0 // Unlimited contracts don't have progress  
                        : (c.filledPercent !== null && c.filledPercent !== undefined) 
                          ? c.filledPercent 
                          : (c.totalRewardReceived / (c.maxContractReward || 1) * 100)
                    ))}%` 
                  }} /></div>
                </div>
                  <div className="under_progress">
                    <div className="card__contract-type desktop-only">
                      {
                      c.contractType === 'unlimited' ? 'Flexible (9% per month)' : c.contractType === 'yearly' ? 'Annual (30% per month)' : c.contractType === 'monthly' ? 'Monthly (20% per month)' : 'Unknown'
                      }
                    </div>
                    <div className="card__contract-type desktop-only">
                      {c.stakedAmount?.toFixed(2) + ' XRP'}
                    </div>
                    <div className="card__staked-amount mobile-only">
                      {c.stakedAmount?.toFixed(0)} XRP (1000$)
                    </div>
                    <div className="card__progress-numbers mobile-only">
                      {c.totalRewardReceived?.toFixed(0)} / {c.contractType === 'unlimited' ? '∞' : c.maxContractReward?.toFixed(0)} XRP
                    </div>
                  </div>
                <div className={`card__details mobile-only ${isExpanded ? 'card__details--expanded' : ''}`}>
                  <div className="card__info">
                    <div className="card__row">
                      <span>Profit rate:</span>
                      <span>{profitRate}</span>
                    </div>
                    <div className="card__row">
                      <span>Contract Type:</span>
                      <span>{getContractTypeName(c.contractType)}</span>
                    </div>
                  </div>
                {c.contractType === 'unlimited' && c.puid && !c.isCompleted && c.isUnstaked && c.unstakedAt && (
                  <button className="btn btn--resume" onClick={() => openResumeModal(c.puid!, c.unstakedAt!)}>
                    Resume staking
                  </button>
                )}
                  {c.contractType === 'unlimited' && c.isUnstakeable && c.puid && !c.isCompleted && !c.isUnstaked && (
                    <button className="btn btn--unstake" onClick={() => openUnstakeModal(c.puid!)}>
                      Unstake
                    </button>
                  )}
                </div>
                
                {/* Desktop unstake button */}
                {c.contractType === 'unlimited' && c.puid && !c.isCompleted && c.isUnstaked && c.unstakedAt && (
                  <div className="card__unstake desktop-only">
                    <button className="btn btn--resume" onClick={() => openResumeModal(c.puid!, c.unstakedAt!)}>
                      Resume staking
                    </button>
                  </div>
                )}
                {c.contractType === 'unlimited' && c.isUnstakeable && c.puid && !c.isCompleted && !c.isUnstaked && (
                  <div className="card__unstake desktop-only">
                    <button className="btn btn--unstake" onClick={() => openUnstakeModal(c.puid!)}>
                      Unstake
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* Unstake Confirmation Modal */}
      {unstakeModal.isOpen && (
        <div className="unstake-modal" onClick={closeUnstakeModal}>
          <div className="unstake-modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="unstake-modal__head">
              <h3 className="unstake-modal__title">Unstaking</h3>
              <button className="unstake-modal__close" onClick={closeUnstakeModal}>
                <img src={ShutIcon} alt="Close" />
              </button>
            </div>
            <div className="unstake-modal__body">
              <p className="unstake-modal__warning">
                The withdrawal period is 7 days, during which you won't be able to accrue additional rewards, including referral rewards.
              </p>
              <p className="unstake-modal__info">
                You can cancel your withdrawal at any time, without incurring any fees, to continue earning daily rewards.
              </p>
            </div>
            <div className="unstake-modal__foot">
              <button className="btn btn--secondary" onClick={closeUnstakeModal}>
                Close
              </button>
              <button 
                className="btn btn--unstake-confirm" 
                onClick={() => unstakeModal.contractPuid && unstake(unstakeModal.contractPuid)}
              >
                Unstaking
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Resume staking modal */}
      {resumeModal.isOpen && (
        <div className="unstake-modal" onClick={closeResumeModal}>
          <div className="unstake-modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="unstake-modal__head">
              <h3 className="unstake-modal__title">Resume staking</h3>
              <button className="unstake-modal__close" onClick={closeResumeModal}>
                <img src={ShutIcon} alt="Close" />
              </button>
            </div>
            <div className="unstake-modal__body">
              <p className="unstake-modal__warning">
                You have a 7-day cooling-off period from the moment you initiated unstaking. During this period, no rewards, including referral rewards, are accrued.
              </p>
              <p className="unstake-modal__info">
                You can resume staking at any time within this period to continue earning daily rewards.
              </p>
              <div className="unstake-modal__timer">
                Time remaining: <strong>{formatResumeRemaining(resumeModal.unstakedAt)}</strong>
              </div>
            </div>
            <div className="unstake-modal__foot">
              <button className="btn btn--secondary" onClick={closeResumeModal}>
                Back
              </button>
              <button 
                className="btn btn--unstake-confirm" 
                onClick={() => resumeModal.contractPuid && resumeStaking(resumeModal.contractPuid)}
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


