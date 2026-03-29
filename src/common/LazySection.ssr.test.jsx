/* @vitest-environment node */

import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import LazySection from './LazySection';

describe('LazySection SSR', () => {
  it('renders without accessing window on the server', () => {
    expect(() =>
      renderToString(
        <LazySection>
          <div>SSR content</div>
        </LazySection>
      )
    ).not.toThrow();
  });
});
