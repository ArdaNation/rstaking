import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { invoicesApi } from '../../shared/api/modules/invoices';
import { clearPendingInvoice, readPendingInvoice, PENDING_INVOICE_EVENT } from '../../shared/invoices/invoiceStorage';
import { useBalance } from '../../shared/account/useBalance';
import { useDepositModal } from '../ui/layout/DepositModalContext';
import { emitBalanceReload, emitCloseDepositModal } from '../../shared/events';

export default function InvoiceWatcherProvider({ children }: { children: React.ReactNode }) {
  const timerRef = useRef<number | null>(null);
  const lastPuidRef = useRef<string | null>(null);
  const { reload: reloadBalance } = useBalance();
  const { closeDepositModal } = useDepositModal();

  useEffect(() => {
    const stop = () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const tick = async () => {
      const pending = readPendingInvoice();
      if (!pending || !pending.puid || pending.status !== 'pending') {
        stop();
        return;
      }
      try {
        const res = await invoicesApi.getById({ puid: pending.puid });
        const status = res?.data?.status || 'pending';
        if (status !== 'pending') {
          stop();
          clearPendingInvoice();
          toast.success('Deposit confirmed');
          // Закрываем модал депозита и эмитим события для сторонних слушателей
          try { closeDepositModal(); } catch {}
          emitCloseDepositModal();
          // Небольшая задержка перед обновлением баланса, чтобы бэкенд успел обновить данные
          setTimeout(async () => {
            try {
              await reloadBalance();
            } catch (e) {
              console.error('Failed to reload balance:', e);
            } finally {
              emitBalanceReload();
            }
          }, 1000);
        }
      } catch {
        // silent fail
      }
    };

    const start = () => {
      const pending = readPendingInvoice();
      const puid = pending?.puid || null;
      if (!puid) {
        stop();
        lastPuidRef.current = null;
        return;
      }
      if (lastPuidRef.current !== puid) {
        stop();
        lastPuidRef.current = puid;
        timerRef.current = window.setInterval(() => { void tick(); }, 15000);
        // run immediately
        void tick();
      }
    };

    start();
    const handler = () => start();
    window.addEventListener(PENDING_INVOICE_EVENT, handler);
    return () => {
      window.removeEventListener(PENDING_INVOICE_EVENT, handler);
      stop();
    };
  }, []);

  return <>{children}</>;
}


