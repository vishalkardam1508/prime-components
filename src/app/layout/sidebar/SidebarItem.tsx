import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ChevronDownIcon } from '@/icons';
import { useT } from '@/i18n/useT';
import type { MenuItem } from '@/app/menu/menu.types';

interface SidebarItemProps {
  item: MenuItem;
  depth?: number;
  onNavigate: () => void;
}

export function SidebarItem({ item, depth = 0, onNavigate }: SidebarItemProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useT('common');

  const hasChildren = item.children != null && item.children.length > 0;

  const isActiveLeaf =
    item.path != null &&
    (location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

  const hasActiveChild =
    hasChildren &&
    (item.children?.some(
      (child) =>
        child.path != null &&
        (location.pathname === child.path || location.pathname.startsWith(child.path + '/'))
    ) ??
      false);

  const isActive = isActiveLeaf || hasActiveChild;

  // Auto-expand when a child route becomes active
  useEffect(() => {
    if (hasActiveChild) setExpanded(true);
  }, [hasActiveChild]);

  const Icon = item.icon;

  const handleClick = (): void => {
    if (hasChildren) {
      setExpanded((v) => !v);
    } else if (item.path != null) {
      void navigate(item.path);
      onNavigate();
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={clsx(
          'relative flex w-full items-center gap-2.5 rounded-lg px-2.5 text-start text-xs font-semibold transition-colors',
          depth === 0 ? 'py-2' : 'py-1.5 ps-8',
          isActive ? 'bg-primary-subtle text-primary' : 'text-text-muted hover:bg-surface-muted'
        )}
      >
        {/* Active left bar */}
        {isActive && depth === 0 && (
          <div className="absolute start-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-primary rounded-e-sm" />
        )}

        {/* Icon box */}
        {Icon != null && (
          <div
            className={clsx(
              'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md transition-colors',
              isActive ? 'bg-primary' : 'bg-surface-muted'
            )}
          >
            <Icon
              className={clsx('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-text-muted')}
            />
          </div>
        )}

        <span className="min-w-0 flex-1 truncate">{t(item.labelKey)}</span>

        {hasChildren && (
          <ChevronDownIcon
            className={clsx(
              'h-4 w-4 flex-shrink-0 transition-transform duration-200',
              isActive ? 'text-primary' : 'text-text-muted',
              expanded && 'rotate-180'
            )}
          />
        )}
      </button>

      {/* Children — accordion */}
      {hasChildren && (
        <div
          className={clsx(
            'overflow-hidden transition-all duration-200',
            expanded ? 'mt-2.5 max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          {item.children?.map((child) => (
            <SidebarItem key={child.id} item={child} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}
