import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './withdraw.scss';
import { withdrawApi } from '../../../shared/api/modules/withdraw';
import { api } from '../../../shared/api/client';

type InnerRow = {
  puid: string;
  status: string;
  type: string;
  actionText: string;
  address: string;
  amount: number;
  txHash: string;
  balance: number;
  createdAt?: string;
};

export default function HistoryPage() {
  const { t } = useTranslation();
  const [inner, setInner] = useState<InnerRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [iType] = useState<string>('');
  const [iFromDate] = useState<string>('');
  const [iToDate] = useState<string>('');
  const [wFromDate] = useState<string>('');
  const [wToDate] = useState<string>('');
  const [iPage, setIPage] = useState<number>(1);
  const [wPage, setWPage] = useState<number>(1);
  const PAGE_SIZE = 7;
  const INITIAL_LOAD_PAGES = 7;
  
  const [innerTotal, setInnerTotal] = useState<number>(0);
  const [withdrawTotal, setWithdrawTotal] = useState<number>(0);
  const [innerLoading, setInnerLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const formatDateUS = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const loadInnerTransactions = async (offset: number, limit: number, append = false) => {
    setInnerLoading(true);
    try {
      const innerJson = await api.get<{ success: boolean; data: { rows: InnerRow[]; count: number } }>(
        `/private/account/inner-transactions/history?offset=${offset}&limit=${limit}&order=desc`
      );
      const newRows = innerJson?.data?.rows ?? [];
      const total = innerJson?.data?.count ?? 0;
      
      setInner(prev => append ? [...prev, ...newRows] : newRows);
      setInnerTotal(total);
    } finally {
      setInnerLoading(false);
    }
  };

  const loadWithdrawals = async (offset: number, limit: number, append = false) => {
    setWithdrawLoading(true);
    try {
      const wRes = await withdrawApi.history({ offset, limit, order: 'desc' });
      const newRows = wRes.data.rows;
      const total = wRes.data.count || 0;
      
      setWithdrawals(prev => append ? [...prev, ...newRows] : newRows);
      setWithdrawTotal(total);
    } finally {
      setWithdrawLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadInnerTransactions(0, PAGE_SIZE * INITIAL_LOAD_PAGES),
          loadWithdrawals(0, PAGE_SIZE * INITIAL_LOAD_PAGES)
        ]);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const innerFiltered = useMemo(() => {
    return inner.filter((r) => {
      if (iType && r.type !== iType) return false;
      if (iFromDate) {
        const d = new Date(r.createdAt || 0).getTime();
        if (d < new Date(iFromDate).getTime()) return false;
      }
      if (iToDate) {
        const d = new Date(r.createdAt || 0).getTime();
        if (d > new Date(iToDate).getTime() + 86_399_000) return false;
      }
      return true;
    });
  }, [inner, iType, iFromDate, iToDate]);

  const innerPaged = useMemo(() => {
    const start = (iPage - 1) * PAGE_SIZE;
    return innerFiltered.slice(start, start + PAGE_SIZE);
  }, [innerFiltered, iPage]);

  const withdrawFiltered = useMemo(() => {
    return withdrawals.filter((r) => {
      if (wFromDate) {
        const d = new Date(r.requestedAt || 0).getTime();
        if (d < new Date(wFromDate).getTime()) return false;
      }
      if (wToDate) {
        const d = new Date(r.requestedAt || 0).getTime();
        if (d > new Date(wToDate).getTime() + 86_399_000) return false;
      }
      return true;
    });
  }, [withdrawals, wFromDate, wToDate]);

  const withdrawPaged = useMemo(() => {
    const start = (wPage - 1) * PAGE_SIZE;
    return withdrawFiltered.slice(start, start + PAGE_SIZE);
  }, [withdrawFiltered, wPage]);

  const handleInnerPageChange = async (newPage: number) => {
    const currentLoadedCount = inner.length;
    const requiredMinCount = newPage * PAGE_SIZE;
    
    if (requiredMinCount > currentLoadedCount && currentLoadedCount < innerTotal) {
      const newOffset = currentLoadedCount;
      const newLimit = Math.min(PAGE_SIZE * INITIAL_LOAD_PAGES, innerTotal - currentLoadedCount);
      await loadInnerTransactions(newOffset, newLimit, true);
    }
    
    setIPage(newPage);
  };

  const handleWithdrawPageChange = async (newPage: number) => {
    const currentLoadedCount = withdrawals.length;
    const requiredMinCount = newPage * PAGE_SIZE;
    
    if (requiredMinCount > currentLoadedCount && currentLoadedCount < withdrawTotal) {
      const newOffset = currentLoadedCount;
      const newLimit = Math.min(PAGE_SIZE * INITIAL_LOAD_PAGES, withdrawTotal - currentLoadedCount);
      await loadWithdrawals(newOffset, newLimit, true);
    }
    
    setWPage(newPage);
  };

  const renderPagination = (page: number, dataLength: number, totalCount: number, onChange: (p: number) => void, isLoading: boolean) => {
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const loadedPages = Math.ceil(dataLength / PAGE_SIZE);
    const canGoNext = page < totalPages;
    const canGoPrev = page > 1;
    
    const maxVisiblePage = Math.min(page + 2, loadedPages);
    const minVisiblePage = Math.max(1, page - 2);
    const nums = Array.from({ length: maxVisiblePage - minVisiblePage + 1 }, (_, i) => i + minVisiblePage);
    
    return (
      <div className="table__pagination">
        <button className='btn' disabled={!canGoPrev || isLoading} onClick={() => onChange(page - 1)}>Previous</button>
        {nums.map((n) => (
          <button key={n} className={n === page ? 'btn active' : 'btn'} onClick={() => onChange(n)}>{n}</button>
        ))}
        {page < totalPages && (
          <span>... {totalPages}</span>
        )}
        <button className='btn' disabled={!canGoNext || isLoading} onClick={() => onChange(page + 1)}>
          {isLoading ? 'Loading...' : 'Next'}
        </button>
      </div>
    );
  };

  return (
    <section className="withdraw">
      <h1 className="section-title">{t('nav.history')}</h1>

      <div className="section-header">
        <h2 className="section-header__title">Actions</h2>
      </div>
{/*       
      <div className="filters-bar filters-bar--two-rows">
        <select value={iType} onChange={(e) => { setIType(e.target.value); setIPage(1); }}>
          <option value="" className='all'>All action type</option>
          <option value="buyContract">buyContract</option>
          <option value="reward">reward</option>
          <option value="deposit">deposit</option>
        </select>
        <div className="filters-bar__range">
          <input type="date" value={iFromDate} onChange={(e) => { setIFromDate(e.target.value); setIPage(1); }} />
          <input type="date" value={iToDate} onChange={(e) => { setIToDate(e.target.value); setIPage(1); }} />
        </div>
      </div> */}

      <div className="table">
        <div className="table__head">
          <div />
          <div />
        </div>
        <div className="table__body">
          <table>
            <thead>
              <tr>
                <th>Action type</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Date and time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5}>{t('contracts.loading')}</td></tr>
              )}
              {!loading && innerPaged.map((r) => {
                const statusClass = r.status === 'confirmed' ? 'status status--confirmed' : r.status === 'canceled' ? 'status status--canceled' : 'status status--pending';
                const dt = r.createdAt ? new Date(r.createdAt) : null;
                const when = dt ? `${formatDateUS(dt)} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '-';
                return (
                  <tr key={r.puid}>
                    <td>{r.type ? r.type == "deposit" ? "Deposit" : r.type == "withdraw" ? "Withdraw" : r.type == "buyContract" ? "Buy Contract" : r.type == "stakeReward" ? "Staking Reward" : "Unknown" : r.type}</td>
                    <td>{r.amount?.toFixed(2)} XRP</td>
                    <td>{r.balance?.toFixed(2)} XRP</td>
                    <td>{when}</td>
                    <td><span className={statusClass}>{r.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {renderPagination(iPage, innerFiltered.length, innerTotal, handleInnerPageChange, innerLoading)}
      </div>

      <div className="section-header section-header--withdrawals">
        <h2 className="section-header__title">Withdrawals</h2>
      </div>
{/*       
      <div className="filters-bar filters-bar--one-row">
        <div className="filters-bar__range">
          <input type="date" value={wFromDate} onChange={(e) => { setWFromDate(e.target.value); setWPage(1); }} />
          <input type="date" value={wToDate} onChange={(e) => { setWToDate(e.target.value); setWPage(1); }} />
        </div>
      </div> */}

      <div className="table">
        <div className="table__head">
          <div />
          <div />
        </div>
        <div className="table__body">
          <table>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Balance</th>
                <th>Date and time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (<tr><td colSpan={4}>{t('contracts.loading')}</td></tr>)}
              {!loading && withdrawPaged.map((h) => {
                const statusClass = h.status === 'confirmed' ? 'status status--confirmed' : h.status === 'canceled' ? 'status status--canceled' : 'status status--pending';
                const dt = new Date(h.requestedAt);
                const when = `${formatDateUS(dt)} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                return (
                  <tr key={h.puid}>
                    <td>{h.amount} XRP</td>
                    <td>-</td>
                    <td>{when}</td>
                    <td><span className={statusClass}>{h.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {renderPagination(wPage, withdrawFiltered.length, withdrawTotal, handleWithdrawPageChange, withdrawLoading)}
      </div>
    </section>
  );
}


