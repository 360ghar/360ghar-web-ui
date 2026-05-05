import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, expect, it } from 'vitest';

import Landing from './Landing';

function renderLanding(location = '/gurgaon/buy/flats') {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[location]}>
        <Routes>
          <Route path="/:citySlug/:intent/:type" element={<Landing />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('Landing FAQ interactions', () => {
  it('toggles FAQ answers without relying on Bootstrap collapse scripts', () => {
    renderLanding();

    const button = screen.getByRole('button', {
      name: /What is the average price range for apartment for sale gurgaon\?/i,
    });

    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
