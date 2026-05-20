import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Package, User, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/shared/stores/authStore';
import { useUiStore } from '@/shared/stores/uiStore';
import { Role } from '@/shared/types/auth.types';
import {
  dashboardNavItem,
  sidebarNavGroups,
  type SidebarNavGroup,
  type SidebarNavItem,
} from './navigation';

function isRouteActive(pathname: string, item: SidebarNavItem) {
  if (item.to === '/') {
    return pathname === '/';
  }

  const prefixes = item.matchPrefixes?.length ? item.matchPrefixes : [item.to];
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function formatRole(role: string | null): string {
  if (!role) {
    return 'Admin';
  }

  return role
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getUserDisplayName(firstName?: string, lastName?: string, email?: string) {
  const displayName = [firstName, lastName]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .trim();

  if (displayName) {
    return displayName;
  }

  const safeEmail = email?.trim();
  return safeEmail || 'Admin User';
}

function SidebarNavItemLink({
  item,
  pathname,
}: {
  item: SidebarNavItem;
  pathname: string;
}) {
  const isActive = isRouteActive(pathname, item);

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-gray-800 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white',
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" aria-hidden />
      {item.label}
    </NavLink>
  );
}

function SidebarGroup({
  group,
  pathname,
  expanded,
  onToggle,
}: {
  group: SidebarNavGroup;
  pathname: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hasActiveItem = group.items.some((item) => isRouteActive(pathname, item));
  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors',
          hasActiveItem ? 'text-gray-200' : 'text-gray-500 hover:text-gray-300',
        )}
        aria-expanded={expanded}
      >
        <span>{group.label}</span>
        <ChevronIcon className="h-3.5 w-3.5" aria-hidden />
      </button>

      {expanded && (
        <div className="space-y-0.5 pl-2">
          {group.items.map((item) => (
            <SidebarNavItemLink key={item.to} item={item} pathname={pathname} />
          ))}
        </div>
      )}
    </section>
  );
}

export function Sidebar() {
  const { pathname } = useLocation();
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  const isAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;
  const visibleGroups = useMemo(
    () =>
      sidebarNavGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => !(item.adminOnly && !isAdmin)),
        }))
        .filter((group) => group.items.length > 0),
    [isAdmin],
  );

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(visibleGroups.map((group) => [group.id, true])),
  );

  useEffect(() => {
    setExpandedGroups((current) => {
      const next = { ...current };
      let changed = false;

      for (const group of visibleGroups) {
        if (group.items.some((item) => isRouteActive(pathname, item)) && !next[group.id]) {
          next[group.id] = true;
          changed = true;
        }

        if (!(group.id in next)) {
          next[group.id] = true;
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [pathname, visibleGroups]);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          aria-hidden
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex h-screen min-h-0 w-64 shrink-0 flex-col overflow-hidden bg-gray-900 transition-transform duration-300 lg:static lg:h-screen lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-700/60 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600">
              <Package className="h-4 w-4 text-white" aria-hidden />
            </div>
            <span className="tracking-wide text-sm font-semibold text-white">Fashion Admin</span>
          </div>
          <button
            type="button"
            className="rounded p-2 text-gray-400 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          <SidebarNavItemLink item={dashboardNavItem} pathname={pathname} />

          {visibleGroups.map((group) => (
            <SidebarGroup
              key={group.id}
              group={group}
              pathname={pathname}
              expanded={expandedGroups[group.id] ?? true}
              onToggle={() =>
                setExpandedGroups((current) => ({
                  ...current,
                  [group.id]: !(current[group.id] ?? true),
                }))
              }
            />
          ))}
        </nav>

        <div className="shrink-0 border-t border-gray-700/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700">
              <User className="h-4 w-4 text-gray-300" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {getUserDisplayName(user?.firstName, user?.lastName, user?.email)}
              </p>
              <p className="truncate text-xs text-gray-400">{formatRole(role)}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

