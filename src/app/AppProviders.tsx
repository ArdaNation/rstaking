import { UserProvider } from './providers/user/UserProvider';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './providers/errorBoundary/ErrorBoundary';
import InvoiceWatcherProvider from './providers/InvoiceWatcherProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <UserProvider>
        <InvoiceWatcherProvider>
          {children}
        </InvoiceWatcherProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </UserProvider>
    </ErrorBoundary>
  );
}


