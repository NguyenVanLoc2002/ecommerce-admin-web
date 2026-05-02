import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Router } from './Router';
import { BreadcrumbProvider } from '@/shared/components/layout/BreadcrumbProvider';
import { ConfirmDialogProvider } from '@/shared/components/ui/ConfirmDialog';
import { ToastContainer } from '@/shared/components/feedback/Toast';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ConfirmDialogProvider>
          <BreadcrumbProvider>
            <Router />
            <ToastContainer />
          </BreadcrumbProvider>
        </ConfirmDialogProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
