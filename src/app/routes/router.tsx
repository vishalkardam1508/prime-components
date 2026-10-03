import { createBrowserRouter } from 'react-router-dom';
// import { AppInitialization } from '../middleware/AppInitialization';
// import { RequireAuth } from '../guards/RequireAuth';
// import { AppShell } from '../layout/pageLayout/privateLayout/AppShell';
// import { NotFound } from '@/components/ui/notFound';
// import { LoginPage } from '@/features/auth/LoginPage';
import { GridDemoPage } from '@/features/gridDemo/GridDemoPage';
import { VGridDemoPage } from '@/features/vGridDemo/VGridDemoPage';
import { LandingPage } from '@/features/landing/pages/LandingPage';
import { NovaExcelDemoPage } from '@/features/demo/pages/NovaExcelDemoPage';
import { WordpadDemoPage } from '@/features/wordpadDemo/WordpadDemoPage';

export const router = createBrowserRouter(
  [
    // ── Authenticated routes (inside AppShell) ─────────────────────────────────
    // {
    //   element: (
    //     <AppInitialization>
    //       <RequireAuth>
    //         <AppShell />
    //       </RequireAuth>
    //     </AppInitialization>
    //   ),
    //   children: [
    //     {
    //       path: '/',
    //       element: <LandingPage />,
    //     },
    //     {
    //       path: '*',
    //       element: <NotFound />,
    //     },
    //   ],
    // },
    // ── Login ──────────────────────────────────────────────────────────────────
    // {
    //   path: '/login',
    //   element: (
    //     <AppInitialization>
    //       <LoginPage />
    //     </AppInitialization>
    //   ),
    // },
    // ── Landing ────────────────────────────────────────────────────────────────
    {
      path: '/',
      element: <LandingPage />,
    },
    // ── Demo pages ─────────────────────────────────────────────────────────────
    
    {
      path: '/demo/grid',
      element: <GridDemoPage />,
    },
    {
      path: '/demo/vgrid',
      element: <VGridDemoPage />,
    },
    {
      path: '/demo/excel',
      element: <NovaExcelDemoPage />,
    },
    {
      path: '/demo/wordpad',
      element: <WordpadDemoPage />,
    },
  ],
  {
    basename: '/',
  }
);
