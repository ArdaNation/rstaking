import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { withdrawApi, type WithdrawHistoryItem } from '../../../../shared/api/modules/withdraw';
import './withdraw.scss';
import { useBalance } from '../../../../shared/account/useBalance';
import toast from 'react-hot-toast';
import ShutIcon from '../../../../assets/shut.svg';

export default function WithdrawPage() {
  const { t } = useTranslation();

  const [wAmount, setWAmount] = useState(0);
  const [displayValue, setDisplayValue] = useState<string>('');
  const { balance, reload: reloadBalance } = useBalance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mAddress, setMAddress] = useState('');
  const [mCode, setMCode] = useState('');
  const canModalWithdraw = useMemo(() => wAmount >= 30 && mAddress.length >= 25, [wAmount, mAddress]);

  const [history, setHistory] = useState<WithdrawHistoryItem[]>([]);
  const [loadingH, setLoadingH] = useState(false);

  const loadHistory = async () => {
    setLoadingH(true);
    try {
      const res = await withdrawApi.history({ offset: 0, limit: 20, order: 'desc' });
      setHistory(res.data.rows);
    } finally {
      setLoadingH(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await loadHistory();
      await reloadBalance();
    })();
  }, []);

  useEffect(() => {
    if (balance !== null && Number(balance) > 0 && wAmount === 0) {
      setWAmount(Number(balance));
    }
  }, [balance, wAmount]);

  useEffect(() => {
    if (wAmount > 0) {
      setDisplayValue(`${wAmount} XRP`);
    } else {
      setDisplayValue('');
    }
  }, [wAmount]);

  const submitModalWithdraw = async () => {
    if (wAmount < 30) {
      toast.error('Minimum is 30 XRP');
      return;
    }
    
    if (balance !== null && wAmount > Number(balance)) {
      toast.error('Insufficient balance');
      return;
    }
    
    const res = await withdrawApi.request({ amount: wAmount, address: mAddress, memo: mCode || null });
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    setIsModalOpen(false);
    await loadHistory();
    await reloadBalance();
  };

  const handleWithdrawalClick = () => {
    if (wAmount < 30) {
      toast.error('Minimum is 30 XRP');
      return;
    }
    
    if (balance !== null && wAmount > Number(balance)) {
      toast.error('Insufficient balance');
      return;
    }
    
    // Если все проверки пройдены, открываем модал
    setIsModalOpen(true);
    setMAddress('');
    setMCode('');
  };

  const cancelWithdrawRequest = async (puid: string) => {
    try {
      await withdrawApi.cancel({ puid });
      await loadHistory();
      await reloadBalance();
    } catch (e) {
      console.error('Failed to cancel withdraw request:', e);
    }
  };


  return (
    <section className="withdraw">
      <h1 className="section-title">{t('finance.title')}</h1>

      <div className="withdraw__panel" >
        <div className="withdraw__balance">
          <div className="withdraw__balance-label">Available balance</div>
          <div className="withdraw__balance-value">{balance !== null ? `${balance} XRP` : '-'}</div>
        </div>
        <div className="withdraw__form">
          <label>
            <span>{t('contracts.amount')}</span>
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
                  setWAmount(numValue);
                  
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
          </label>
          <div className="withdraw__hint">Minimal withdrawal 30 XRP</div>
          <div className="withdraw__actions">
            <button className="btn btn--withdrawal" onClick={handleWithdrawalClick}>Withdrawal</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__content">
            <div className="modal__head">
              <div className="modal__title">Withdrawal</div>
              <button className="modal__close" aria-label="Close" onClick={() => setIsModalOpen(false)}>
                <img src={ShutIcon} alt="Close" />
              </button>
            </div>
            <div className="modal__body">
              <div className="modal__amount">
                <div className="modal__label">Withdrawal amount</div>
                <div className="modal__value">{wAmount} XRP</div>
              </div>
              {/* <label className="modal__field">
                <span>Network</span>
                <input value="RStaking" disabled />
              </label>
              <label className="modal__field">
                <span>Currency</span>
                <input value="XRP" disabled />
              </label> */}
              <label className="modal__field">
                <span>Wallet Address</span>
                <input value={mAddress} onChange={(e) => setMAddress(e.target.value)} placeholder="r..." />
              </label>
              {/* <label className="modal__field">
                <span>Telegram verification code</span>
                <div className="modal__inline">
                  <input value={mCode} onChange={(e) => setMCode(e.target.value)} placeholder="123456" />
                  <button type="button" className="link-btn">Send verification code</button>
                </div>
              </label> */}
            </div>
            <div className="modal__foot">
              <button className="btn" onClick={() => setIsModalOpen(false)}>Back</button>
              <button className="btn btn--primary" disabled={!canModalWithdraw} onClick={submitModalWithdraw}>Withdraw</button>
            </div>
          </div>
        </div>
      )}

      <div className="withdraw__history">
        {/* <div className="history__head">{t('finance.withdraw.history')}</div> */}
        <div className="history__list">
          {loadingH && <p>{t('contracts.loading')}</p>}
          {!loadingH && history.map((h) => {
            const statusClass = h.status === 'pending' ? 'status status--pending' : h.status === 'confirmed' ? 'status status--confirmed' : 'status status--canceled';
            const createdAt = new Date(h.requestedAt);
            const deadline = `${createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${createdAt.toLocaleDateString()}`;
            return (
              <div className="history__item" key={h.puid}>
                <div className="history__top">
                  <div className="history__title">Request №{h.puid.slice(0, 6)}</div>
                  {h.status === 'pending' && <button className="history__cancel" onClick={() => cancelWithdrawRequest(h.puid)}>Cancel</button>}
                </div>
                <div className="history__meta">
                  <div className="meta__item"><span className="meta__label">Amount</span><span className="meta__value">{h.amount} XRP</span></div>
                  <div className="meta__item"><span className="meta__label">Deadline</span><span className="meta__value">{deadline}</span></div>
                  <div className="meta__item"><span className="meta__label">Status</span><span className={statusClass}>{h.status.charAt(0).toUpperCase() + h.status.slice(1)}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


