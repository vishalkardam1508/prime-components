# Code Generation Requirements

**Project:** Resume Tracker Frontend

---

## 1. Authentication Implementation

* JWT token handling via existing auth utilities
* Session-based authentication with cookies (`credentials: 'include'`)
* Auth state managed in `features/auth/auth.slice.ts`
* Protected routes via `RequireAuth` guard
* Permission checks via `RequirePermission` guard (if implemented)
* No custom auth logic outside existing patterns

---

## 2. State Management Pattern

* RTK Query for all server state
* Redux slices ONLY for:
  * Authentication state (`auth.slice.ts`)
  * Tenant configuration (`tenant.slice.ts`)
  * Global UI state (if needed)
* Normalized response handling
* Auto caching via RTK Query defaults
* No manual cache layers
* Use typed Redux hooks from `@/hooks/reduxHooks.ts`

### API Response Mapping (MANDATORY)
* **All dropdown/list APIs** MUST use `transformResponse` when needed
* **Standard pattern**: Backend field names → Frontend field names
* **Mapper location**: `features/{feature}/utils/{feature}.mappers.ts` (if needed)
* **Naming convention**: `map{Entity}Response`

**Example:**
```typescript
// features/company/api/company.api.ts
export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanyMasters: builder.query<CompanyMasters, void>({
      query: () => '/company/masters',
      transformResponse: (response: BackendMasters) => ({
        cities: response.cities.map(c => ({ id: c.cityId, label: c.cityName })),
        states: response.states.map(s => ({ id: s.stateId, label: s.stateName })),
      }),
    }),
  }),
});
```

---

## 3. Data Shape Authority (MANDATORY)

* API request/response types MUST live in:
  ```
  features/<feature>/types/<feature>.types.ts
  ```
* RTK Query MUST use these types
* Pages/components MUST NOT redefine API shapes
* Form types can be derived from Zod schemas using `z.infer<typeof schema>`

**Example:**
```typescript
// features/auth/auth.types.ts
export type User = {
  id: string;
  username: string;
  displayName: string;
};

export type Tenant = {
  id: string;
  name: string;
  code: string;
};

export type Permission = string;

export type AuthState = {
  user: User | null;
  tenant: Tenant | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  sessionExpiresAt?: string;
};

```

---

## 4. Form Implementation

* React Hook Form + Zod (MANDATORY)
* `zodResolver` is mandatory
* No inline validation rules
* Form components MUST use:
  * `FormField` wrapper
  * `FormGrid` for layout
  * `FormSection` for grouping
  * `FormErrorBanner` for form-level errors
* Form inputs MUST use:
  * `FormInput` for text inputs
  * `FormSelect` for dropdowns
  * `FormCombobox` for searchable dropdowns
  * `Checkbox`, `Radio`, `Switch` for boolean inputs
* Validation errors from Zod schemas

**Example:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySchema } from '../schemas/company.schema';

export function CompanyForm() {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: { isActive: true },
  });
  
  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

---

## 5. Component Standards

* Functional components ONLY
* Named exports ONLY (no default exports)
* Typed props required with TypeScript
* Return type MUST be `JSX.Element`
* `React.memo` where beneficial for performance
* No CSS modules (Tailwind only)
* Use path aliases: `@/` → `src/`

**Example:**
```typescript
import type { JSX } from 'react';

type Props = {
  title: string;
  onSubmit: () => void;
};

export function MyComponent({ title, onSubmit }: Props): JSX.Element {
  return <div>{title}</div>;
}
```

---

## 6. Performance Optimizations

* Lazy-loaded routes (MANDATORY)
* Debounced search inputs
* Memoized heavy calculations with `useMemo`
* Memoized callbacks with `useCallback`
* DataGrid virtualization for large lists
* No premature optimization

**Example:**
```typescript
// Lazy loading
const HomePage = lazy(() => import('@/features/home/HomePage'));

// Debounced search
const debouncedSearch = useDebouncedValue(searchTerm, 300);
```

---

## 7. Import Rules (MANDATORY)

* Absolute imports ONLY using `@/` alias
* No relative imports (e.g., `../../../`)
* Import order:
  1. React imports
  2. Third-party libraries
  3. `@/components`
  4. `@/features`
  5. `@/hooks`
  6. `@/services`
  7. `@/utils`
  8. Types (import type)

**Example:**
```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormInput } from '@/components/ui/input';
import { useCreateCompanyMutation } from '@/features/company/api/company.api';
import { useAppDispatch } from '@/hooks/reduxHooks';
import type { CompanyFormValues } from '@/features/company/types/company.types';
```

---

## 8. Naming Rules (MANDATORY)

* Files → camelCase (e.g., `company.api.ts`)
* Components → PascalCase (e.g., `CompanyForm.tsx`)
* Functions/variables → camelCase (e.g., `handleSubmit`)
* Types/interfaces → PascalCase (e.g., `CompanyFormValues`)
* Constants → UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
* Hooks → camelCase starting with `use` (e.g., `useCompanyForm`)

---

## 9. File Naming Expectations

* API files → `<feature>.api.ts`
* Validation files → `<feature>.schema.ts`
* Type files → `<feature>.types.ts`
* Slice files → `<feature>.slice.ts`
* Selector files → `<feature>.selectors.ts`
* Mapper files → `<feature>.mappers.ts` (if needed)
* Pages → `<Feature>Page.tsx`
* Forms → `<Feature>Form.tsx`
* Components → `PascalCase.tsx`

---

## 10. Internationalization Rules (MANDATORY)

* All user-facing text MUST use i18next
* Use `useT` hook from `@/i18n/useT`
* Translation files in `public/locales/<lang>/<namespace>.json`
* Namespaces: common, auth, patient, orders, settings
* No hardcoded strings in UI

**Example:**
```typescript
import { useT } from '@/i18n/useT';

export function MyComponent() {
  const t = useT();
  return <button>{t('common:save')}</button>;
}
```

---

## 11. API Error Handling Rules

* Use RTK Query error objects only
* Display errors using Toast notifications
* Form errors handled by react-hook-form
* No custom error parsing
* Error messages from i18n translations

**Example:**
```typescript
const [createCompany, { isLoading, error }] = useCreateCompanyMutation();

const onSubmit = async (data: CompanyFormValues) => {
  try {
    await createCompany(data).unwrap();
    toast.success(t('common:saveSuccess'));
  } catch (err) {
    // RTK Query middleware handles toast automatically
  }
};
```

---

## 12. DataGrid Implementation Rules

* Use existing `DataGrid` component from `@/components/datagrid`
* Column definitions in separate files: `<feature>.columns.ts`
* Use TanStack Table column definitions
* Enable features via props:
  * `enableRowSelection` for row selection
  * `enableVirtualization` for large datasets
  * `enableRowExpansion` for expandable rows
* Use `useGridUrlState` for URL state persistence
* Export functionality built-in (PDF, Excel)

**Example:**
```typescript
import { DataGrid } from '@/components/datagrid/DataGrid';
import { companyColumns } from './company.columns';

export function CompanyList() {
  const { data, isLoading } = useGetCompaniesQuery();
  
  return (
    <DataGrid
      data={data ?? []}
      columns={companyColumns}
      loading={isLoading}
      enableRowSelection
      enableVirtualization
    />
  );
}
```

---

## 13. Transformation Rules (MANDATORY)

* Backend-generated identifiers (id, createdAt, updatedAt) MUST NOT be in form validation
* Conditional fields MUST follow same transformation rules in Add/Edit/View
* Form data → API payload transformation in submit handler
* API response → Form data transformation in `defaultValues`

**Example:**
```typescript
// Form submission
const onSubmit = async (formData: CompanyFormValues) => {
  const payload = {
    ...formData,
    contacts: formData.contacts.map(c => ({
      ...c,
      id: c.id || undefined, // Remove empty id for new records
    })),
  };
  await createCompany(payload).unwrap();
};

// Edit mode initialization
const { data: company } = useGetCompanyByIdQuery(id);
const form = useForm({
  defaultValues: company ? {
    name: company.name,
    address1: company.address1,
    // ... map API response to form shape
  } : undefined,
});
```

---

## 14. Page Layout Rules (MANDATORY)

* All pages MUST use container components:
  * `PageContainer` - Outer wrapper
  * `PageHeader` - Title and description
  * `PageSection` - Content sections
  * `FormCard` - Form wrappers
  * `TableCard` - Table wrappers

**Example:**
```typescript
import { PageContainer } from '@/components/containers/PageContainer';
import { PageHeader } from '@/components/containers/PageHeader';
import { PageSection } from '@/components/containers/PageSection';
import { FormCard } from '@/components/containers/FormCard';

export function CompanyMasterPage() {
  return (
    <PageContainer>
      <PageHeader title="Company Master" description="Manage companies" />
      <PageSection>
        <FormCard>
          <CompanyForm />
        </FormCard>
      </PageSection>
    </PageContainer>
  );
}
```

---

## 15. Route Registration Rules (MANDATORY)

* Routes ONLY in `src/app/router.tsx`
* Use lazy loading for all page components
* Wrap with `Suspense` fallback
* Protected routes under `AppInitialization` → `RequireAuth` → `AppShell`

**Example:**
```typescript
const CompanyPage = lazy(() => import('@/features/company/ui/CompanyMasterPage'));

export const router = createBrowserRouter([
  {
    element: (
      <AppInitialization>
        <RequireAuth>
          <AppShell />
        </RequireAuth>
      </AppInitialization>
    ),
    children: [
      {
        path: '/company',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <CompanyPage />
          </Suspense>
        ),
      },
    ],
  },
]);
```

---

## 16. Output Rules (VERY IMPORTANT)

When generating code:

* Return ONLY required files
* Include file path as comment at top: `// features/company/api/company.api.ts`
* Use proper TypeScript types
* Follow naming conventions exactly
* Do NOT explain React basics
* Do NOT include installation commands
* Do NOT include unrelated files
* Do NOT create files outside defined structure

---

## 17. Final Rule (SAFETY NET)

If any requirement is unclear:

* **STOP**
* **ASK**
* **DO NOT invent behavior**
* **DO NOT assume**

---

## 18. Strict Documentation Compliance

* Code generation MUST match documentation exactly
* Assumptions = STOP and ASK
* Undocumented features = Not implemented
* If unclear = Ask, never assume
* This document + `frontend-standards.md` = Single source of truth

---

**This document defines code generation requirements for Resume Tracker Frontend.**
