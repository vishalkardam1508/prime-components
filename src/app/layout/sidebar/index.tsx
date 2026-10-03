import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { XMarkIcon, ArrowRightOnRectangleIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import { useLogoutMutation } from '@/features/auth/api/auth.api';
import { clearAuthContext } from '@/features/auth/redux/auth.slice';
import { clearActiveSession } from '@/utils/authSession';
import { applyTheme } from '@/theme/applyTheme';
import { getStoredTheme, clearStoredTheme } from '@/utils/themeStorage';
import { APP_MENU_GROUPS } from '@/app/menu/appMenu';
import { SidebarItem } from './SidebarItem';

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return (words[0] ?? '').slice(0, 2).toUpperCase();
  return ((words[0]?.[0] ?? '') + (words[words.length - 1]?.[0] ?? '')).toUpperCase();
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps): JSX.Element | null {
  const { t } = useT('common');
  const panelRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();

  const handleSignOut = (): void => {
    onClose();
    void (async (): Promise<void> => {
      try {
        await logout().unwrap();
      } finally {
        clearActiveSession();
        dispatch(clearAuthContext());
        clearStoredTheme();
        applyTheme(getStoredTheme());
        await navigate('/login', { replace: true });
      }
    })();
  };

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const initials = user?.name != null ? getInitials(user.name) : 'U';

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={clsx(
          'fixed inset-y-0 start-0 z-50 flex w-[280px] flex-col bg-surface shadow-lg transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border-muted px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold tracking-widest text-primary-foreground">EQ</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-wide text-primary">EQAS</span>
              <span className="mt-0.5 text-[10px] font-normal text-text-muted">V2.0</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Nav — scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-4">
            {APP_MENU_GROUPS.map((group) => (
              <div key={group.labelKey}>
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  {t(group.labelKey)}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <SidebarItem key={item.id} item={item} onNavigate={onClose} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        {isAuthenticated && (
          <div className="flex-shrink-0 border-t border-border-muted px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-xs font-bold text-primary-foreground">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-text">{user?.name ?? '—'}</p>
                <p className="truncate text-xs font-medium text-primary capitalize">
                  {(user?.role ?? '').replace(/_/g, ' ')}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-error"
                aria-label={t('nav.signOut')}
              >
                <ArrowRightOnRectangleIcon className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
