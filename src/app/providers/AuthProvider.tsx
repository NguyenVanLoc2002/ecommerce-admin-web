import type { ReactNode } from 'react';

// Bootstraps auth state on app mount.
// Zustand's persist middleware rehydrates tokens from localStorage automatically
// when the store module is first imported, so no explicit bootstrap is needed here.
// This provider is an extension point for future eager token-validation logic (Phase 2).

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}
