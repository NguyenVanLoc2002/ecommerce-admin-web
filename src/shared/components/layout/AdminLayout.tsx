import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-gray-900 focus:shadow-md focus:ring-2 focus:ring-primary-500"
      >
        Skip to main content
      </a>
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main
          id="main-content"
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 lg:px-6"
        >
          <div className="min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
