# Testing

The 360Ghar frontend uses Vitest with Testing Library and jsdom. There is no formal, exhaustive test suite yet, so contributors are expected to add tests alongside new code and to manually verify key flows (auth, property search, contact forms) when tests are missing. This page covers the existing setup, conventions, and patterns to follow.

## Key Files

| File | Purpose |
|------|---------|
| `vitest.config.js` | Vitest config: jsdom environment, setup file, glob |
| `src/test/setup.js` | Global setup: jest-dom matchers, `afterEach` cleanup, `ResizeObserver` shim |
| `package.json` | `npm test` script (`vitest run src`) |
| `src/pages/properties/VirtualTourPage.test.jsx` | Example component test |
| `src/pages/landing/Landing.test.jsx` | Example route-level test |
| `*.ssr.test.jsx` | Prerender / SSR smoke tests for pages |

## Commands

```bash
npm test            # run all tests once (vitest run src)
npm run dev         # manual verification of flows
```

`npm test` exits after a single run, which is what CI expects. For watch mode during local development, run `npx vitest` directly.

## Configuration

`vitest.config.js` is intentionally small:

```js
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,                              // import describe/it/expect explicitly
    include: ['./src/**/*.{test,spec}.{js,jsx}'],
    setupFiles: ['./src/test/setup.js'],
  },
});
```

- `globals: false` means you must import `describe`, `it`, `expect`, `vi`, etc. from `vitest`. Do not rely on global injects.
- `setupFiles` registers `@testing-library/jest-dom/vitest` matchers (`toBeInTheDocument`, `toHaveTextContent`, ...), cleans up the DOM and `localStorage` between tests, and shims `ResizeObserver` for components that use sliders and maps.

## Where Tests Live

Two co-location patterns are both accepted:

- **Colocated unit tests**: `src/pages/properties/VirtualTourPage.test.jsx` next to the component.
- **SSR smoke tests**: `src/pages/blogs/BlogClassic.ssr.test.jsx`, `src/pages/landing/Landing.ssr.test.jsx` verify that a page renders without throwing during prerender.
- A shared `src/__tests__/` directory is also acceptable for cross-cutting tests.

Prefer colocating tests with the source file so they move together during refactors.

## Patterns

### Testing a React component

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../../pages/core/NotFound';

describe('NotFound', () => {
  it('renders a search box and a link home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
  });
});
```

Wrap any component that uses `useParams`, `useLocation`, or `I18nLink` in `<MemoryRouter>` (or `RouterProvider` with a test router) so routing hooks resolve.

### Mocking services

Mock at the module level with `vi.mock` so the component under test never hits the network:

```jsx
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../services/blogService', () => ({
  blogService: {
    getPosts: vi.fn().mockResolvedValue({ items: [], total: 0, total_pages: 1 }),
  },
}));
```

### Mocking Zustand stores

For components that read from a store, either render a real `Provider`-free store (Zustand stores are just hooks) or mock the store module:

```jsx
vi.mock('../../store/propertyStore', () => ({
  usePropertyStore: vi.fn((selector) =>
    selector({
      properties: [],
      pagination: { page: 1, totalPages: 1, total: 0, limit: 10 },
      fetchProperties: vi.fn(),
    })
  ),
}));
```

Reset mocks in `beforeEach` with `vi.clearAllMocks()` and the global `afterEach` cleanup in `src/test/setup.js` handles DOM teardown.

### SSR smoke tests

SSR tests assert that a page component can be imported and rendered to a string without throwing, which guards the prerender step in the build. See `src/pages/landing/Landing.ssr.test.jsx` for the shape.

## What to Test

Prioritize:

1. **Pure logic**: filter builders (`src/utils/propertyFilters.js`), tax calculators (`src/pages/tools/CapitalGainsCalculator.jsx` CII table), schema generators (`src/seo/structuredData.js`).
2. **Form validation**: Formik + Yup schemas in `PostProperty.jsx`, `Contact.jsx`, `AccountDeletionRequest.jsx`.
3. **Route rendering**: each page mounts without throwing given mocked stores/services.
4. **SSR safety**: add a `*.ssr.test.jsx` for any new page that will be prerendered.

When you add a feature, prefer Vitest + React Testing Library and colocate the test file. See [Development Workflow](Development-Workflow) for how tests fit into the PR checklist and [Debugging](Debugging) for triaging test failures.
