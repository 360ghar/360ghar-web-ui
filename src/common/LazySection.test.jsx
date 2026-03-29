import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LazySection from './LazySection';

describe('LazySection', () => {
  afterEach(() => {
    delete document.documentElement.dataset.prerendered;
  });

  it('renders children immediately when IntersectionObserver is unavailable', () => {
    const originalObserver = window.IntersectionObserver;
    delete window.IntersectionObserver;

    render(
      <LazySection>
        <div>Visible content</div>
      </LazySection>
    );

    expect(screen.getByText('Visible content')).toBeInTheDocument();

    window.IntersectionObserver = originalObserver;
  });

  it('renders children immediately on prerendered documents', () => {
    document.documentElement.dataset.prerendered = 'true';

    render(
      <LazySection>
        <div>Prerendered content</div>
      </LazySection>
    );

    expect(screen.getByText('Prerendered content')).toBeInTheDocument();
  });
});
