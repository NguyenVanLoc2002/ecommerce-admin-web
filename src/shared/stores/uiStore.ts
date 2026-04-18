import { create } from 'zustand';
import type { Toast, ToastVariant } from '../types/api.types';

type ToastInput = Omit<Toast, 'id'>;

interface UiState {
  sidebarOpen: boolean;
  toasts: Toast[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addToast: (toast: ToastInput) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  toasts: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addToast: (input) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...input, id }] }));
    return id;
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clearToasts: () => set({ toasts: [] }),
}));

// Convenience helpers callable outside React components
export const toast = {
  success: (message: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'message'>>) =>
    useUiStore.getState().addToast({ variant: 'success', message, duration: 4_000, ...opts }),

  error: (message: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'message'>>) =>
    useUiStore.getState().addToast({ variant: 'error', message, ...opts }),

  warning: (message: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'message'>>) =>
    useUiStore.getState().addToast({ variant: 'warning', message, duration: 6_000, ...opts }),

  info: (message: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'message'>>) =>
    useUiStore.getState().addToast({ variant: 'info', message, duration: 4_000, ...opts }),
} satisfies Record<ToastVariant, (message: string, opts?: Partial<Omit<Toast, 'id' | 'variant' | 'message'>>) => string>;
