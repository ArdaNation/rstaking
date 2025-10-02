// Google Analytics utilities
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackPageView = (page_path: string, page_title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-HWZ7SL96ES', {
      page_path,
      page_title,
    });
  }
};

// API action tracking
export const trackApiSuccess = (apiName: string, action: string, additionalData?: Record<string, unknown>) => {
  trackEvent('api_success', 'api', `${apiName}_${action}`, undefined);
  
  if (additionalData && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'api_success', {
      event_category: 'api',
      event_label: `${apiName}_${action}`,
      custom_parameters: additionalData,
    });
  }
};

// Specific API tracking functions
export const trackContractAction = (action: 'buy' | 'unstake' | 'resume', contractType?: string, amount?: number) => {
  trackApiSuccess('contracts', action, {
    contract_type: contractType,
    amount: amount,
  });
};

export const trackInvoiceAction = (action: 'request' | 'get', amount?: number) => {
  trackApiSuccess('invoices', action, {
    amount: amount,
  });
};

export const trackWithdrawAction = (action: 'request' | 'cancel', amount?: number) => {
  trackApiSuccess('withdraw', action, {
    amount: amount,
  });
};

export const trackAuthAction = (action: 'login' | 'register' | 'logout' | 'reset_password' | 'verify_email') => {
  trackApiSuccess('auth', action);
};

export const trackAccountAction = (action: 'balance_check' | 'profile_update' | '2fa_setup' | 'session_check') => {
  trackApiSuccess('account', action);
};
