import { Menu, LogOut } from 'lucide-react';
import { useLogout } from '@/shared/hooks/useLogout';
import { useUiStore } from '@/shared/stores/uiStore';
import { Button } from '@/shared/components/ui/Button';
import { Breadcrumb } from './Breadcrumb';

export function Header() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const logout = useLogout();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3 min-w-0">
        {/* Sidebar toggle — visible on all sizes */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <Breadcrumb />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => logout()}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
