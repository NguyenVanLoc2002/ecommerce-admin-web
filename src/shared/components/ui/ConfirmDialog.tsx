import { useCallback, useRef, useState } from 'react';
import { ConfirmDialogContext, type ConfirmOptions } from './confirmDialogContext';
import { Modal } from './Modal';
import { Button } from './Button';

interface DialogState extends ConfirmOptions {
  open: boolean;
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>({ open: false, title: '' });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ ...options, open: true });
    });
  }, []);

  const handleClose = (result: boolean) => {
    setState((prev) => ({ ...prev, open: false }));
    resolveRef.current?.(result);
    resolveRef.current = null;
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <Modal
        open={state.open}
        onClose={() => handleClose(false)}
        title={state.title}
        description={state.description}
        size="sm"
        closeOnBackdropClick={false}
        footer={
          <>
            <Button variant="secondary" onClick={() => handleClose(false)}>
              {state.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              variant={state.variant === 'destructive' ? 'danger' : 'primary'}
              onClick={() => handleClose(true)}
            >
              {state.confirmLabel ?? 'Confirm'}
            </Button>
          </>
        }
      >
        {null}
      </Modal>
    </ConfirmDialogContext.Provider>
  );
}
