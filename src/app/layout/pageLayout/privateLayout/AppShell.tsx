import { Outlet } from 'react-router-dom';
import { NavBar } from '../../navbar';
import { Breadcrumbs } from '../../breadcrumbs';
import { SearchHighlighter } from '../../navbar/components/SearchHighlighter';
import type { JSX } from 'react';

export function AppShell(): JSX.Element {
  return (
    <div className="flex h-screen flex-col bg-surface font-base text-base text-text">
      <NavBar />
      <SearchHighlighter />
      <main className="flex flex-1 flex-col overflow-hidden  pt-16">
        <div className="flex-shrink-0 px-6">
          <Breadcrumbs />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden overflowY-scroll px-6 pb-6 private-layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
