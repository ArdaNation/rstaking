export const BALANCE_RELOAD_EVENT = 'BALANCE_RELOAD_EVENT';
export const CLOSE_DEPOSIT_MODAL_EVENT = 'CLOSE_DEPOSIT_MODAL_EVENT';

export function emitBalanceReload() {
  window.dispatchEvent(new Event(BALANCE_RELOAD_EVENT));
}

export function emitCloseDepositModal() {
  window.dispatchEvent(new Event(CLOSE_DEPOSIT_MODAL_EVENT));
}


