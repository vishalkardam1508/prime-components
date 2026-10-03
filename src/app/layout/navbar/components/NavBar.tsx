import { useState, useRef, useEffect, type JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useT } from '@/i18n/useT';
import { Bars3Icon, BellIcon, ChevronDownIcon } from '@/icons';
import { IconButton } from '@/components/ui/button';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectIsAuthenticated } from '@/features/auth/redux/auth.selectors';
import { AvatarMenu } from './AvatarMenu';
import { Sidebar } from '../../sidebar';
import { APP_MENU } from '@/app/menu/appMenu';

// ─── Nav tab types ────────────────────────────────────────────────────────────

type NavSubItem = { key: string; labelKey: string; path: string };
type NavTab = { key: string; labelKey: string; path: string; subItems?: NavSubItem[] };

const NAV_TABS: NavTab[] = APP_MENU.map((item) => ({
  key: item.id,
  labelKey: item.labelKey,
  path: item.path ?? '',
  ...(item.children != null && item.children.length > 0
    ? {
        subItems: item.children.map((c) => ({
          key: c.id,
          labelKey: c.labelKey,
          path: c.path ?? '',
        })),
      }
    : {}),
}));

// ─── Nav tabs ─────────────────────────────────────────────────────────────────

function NavTabs(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useT('common');
  const [openTab, setOpenTab] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenTab(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav ref={navRef} className="flex h-full items-end" aria-label={t('nav.mainNav')}>
      {NAV_TABS.map((tab) => {
        const hasDropdown = (tab.subItems?.length ?? 0) > 0;
        const isActive =
          tab.path === '/'
            ? location.pathname === '/'
            : hasDropdown
              ? (tab.subItems ?? []).some((sub) => location.pathname.startsWith(sub.path))
              : location.pathname.startsWith(tab.path);
        const isOpen = openTab === tab.key;

        return (
          <div key={tab.key} className="relative flex h-full items-end">
            <button
              type="button"
              onClick={() => {
                if (hasDropdown) {
                  setOpenTab(isOpen ? null : tab.key);
                } else {
                  setOpenTab(null);
                  void navigate(tab.path);
                }
              }}
              aria-current={isActive && !hasDropdown ? 'page' : undefined}
              aria-haspopup={hasDropdown ? 'menu' : undefined}
              aria-expanded={hasDropdown ? isOpen : undefined}
              className={clsx(
                'flex h-full items-center gap-1 border-b-4 px-3 text-sm transition-colors whitespace-nowrap focus:outline-none',
                isActive
                  ? 'border-primary font-semibold text-primary'
                  : 'border-transparent font-normal text-text-muted hover:text-text'
              )}
            >
              {t(tab.labelKey)}
              {hasDropdown && (
                <ChevronDownIcon
                  className={clsx(
                    'h-3.5 w-3.5 transition-transform duration-200',
                    isOpen && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              )}
            </button>

            {hasDropdown && isOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-border-muted bg-surface py-1 shadow-md"
              >
                {(tab.subItems ?? []).map((sub) => {
                  const isSubActive =
                    location.pathname === sub.path || location.pathname.startsWith(sub.path + '/');
                  return (
                    <button
                      key={sub.path}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpenTab(null);
                        void navigate(sub.path);
                      }}
                      className={clsx(
                        'flex w-full items-center px-4 py-2.5 text-start text-sm transition-colors',
                        isSubActive
                          ? 'bg-primary-subtle font-semibold text-primary'
                          : 'text-text hover:bg-surface-muted'
                      )}
                    >
                      {t(sub.labelKey)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────

// function SearchBar(): JSX.Element {
//   const { t } = useT('common');
//   const { searchTerm, setSearchTerm } = useGlobalSearch();
//   return (
//     <div className="w-[260px]">
//       <Input
//         type="search"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         placeholder={t('nav.search')}
//         leadingIcon={<MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />}
//         className="h-[38px]"
//       />
//     </div>
//   );
// }

// ─── NavBar ───────────────────────────────────────────────────────────────────

export function NavBar(): JSX.Element {
  const { t } = useT('common');
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-50 h-16 border-b border-border-muted bg-primary-subtle text-text">
        <div className="flex h-full items-center justify-between px-4 sm:px-6">
          {/* ── Left: Hamburger + Brand + Nav tabs ── */}
          <div className="flex h-full items-center gap-4 lg:gap-8">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-text transition-colors hover:bg-surface-muted lg:hidden"
                aria-label={t('nav.menuLabel')}
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            )}

            <div className="flex flex-shrink-0 items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-xs font-bold tracking-widest text-primary-foreground">
                  EQ
                </span>
              </div>
              <div className="hidden flex-col leading-none sm:flex">
                <span className="text-sm font-bold tracking-wide text-primary">EQAS</span>
                <span className="mt-0.5 text-[10px] font-normal text-text-muted">V2.0</span>
              </div>
            </div>

            {isAuthenticated && (
              <div className="hidden lg:flex lg:h-full">
                <NavTabs />
              </div>
            )}
          </div>

          {/* ── Right: Search + actions + avatar ── */}
          {isAuthenticated && (
            <div className="flex flex-shrink-0 items-center gap-2.5">
              <div className="hidden sm:block">{/* <SearchBar /> */}</div>

              <IconButton
                icon={<BellIcon className="h-5 w-5" />}
                ariaLabel={t('nav.notifications')}
                variant="ghost"
                size="md"
                bordered
                className="bg-surface hover:bg-surface"
              />

              {/* <IconButton
                icon={<QuestionMarkCircleIcon className="h-5 w-5" />}
                ariaLabel={t('nav.help')}
                variant="ghost"
                size="md"
                bordered
                className="bg-surface hover:bg-surface"
              /> */}

              <AvatarMenu />
            </div>
          )}
        </div>
      </header>

      {isAuthenticated && <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
    </>
  );
}
