import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Router } from './Router';
import { ConfirmDialogProvider } from '@/shared/components/ui/ConfirmDialog';
import { ToastContainer } from '@/shared/components/feedback/Toast';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ConfirmDialogProvider>
          <Router />
          <ToastContainer />
        </ConfirmDialogProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
