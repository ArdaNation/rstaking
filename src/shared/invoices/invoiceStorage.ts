export interface PendingInvoiceData {
  puid: string;
  address: string;
  memo: string;
  amount: number;
  status: string;
}

const PENDING_INVOICE_KEY = 'pending_invoice';
export const PENDING_INVOICE_EVENT = 'pending-invoice-changed';

export function savePendingInvoice(data: PendingInvoiceData): void {
  try {
    localStorage.setItem(PENDING_INVOICE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(PENDING_INVOICE_EVENT));
  } catch {
    // silent
  }
}

export function readPendingInvoice(): PendingInvoiceData | null {
  try {
    const raw = localStorage.getItem(PENDING_INVOICE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingInvoiceData;
  } catch {
    return null;
  }
}

export function clearPendingInvoice(): void {
  try {
    localStorage.removeItem(PENDING_INVOICE_KEY);
    window.dispatchEvent(new Event(PENDING_INVOICE_EVENT));
  } catch {
    // silent
  }
}


