import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-gray-900 focus:shadow-md focus:ring-2 focus:ring-primary-500"
      >
        Skip to main content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <Header />
        <main
          id="main-content"
          className="flex-1 overflow-x-clip px-4 py-6 pb-24 lg:px-6 lg:pb-24"
        >
          <div className="min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
