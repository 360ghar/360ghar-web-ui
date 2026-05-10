import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import useLocaleStore from '../../store/localeStore';
import LanguageSwitcher from './LanguageSwitcher';

function LocationProbe() {
  const location = useLocation();

  return (
    <output data-testid="location">
      {`${location.pathname}${location.search}${location.hash}`}
    </output>
  );
}

function renderSwitcher(initialEntry, locale) {
  useLocaleStore.setState({ locale });

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="*"
          element={(
            <>
              <LanguageSwitcher />
              <LocationProbe />
            </>
          )}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('LanguageSwitcher', () => {
  afterEach(() => {
    useLocaleStore.setState({ locale: 'en' });
  });

  it('preserves search params and hash when switching locales', () => {
    renderSwitcher('/hi/account?tab=favorites#visits', 'hi');

    fireEvent.click(screen.getByRole('button', { name: /switch to english/i }));

    expect(screen.getByTestId('location')).toHaveTextContent('/account?tab=favorites#visits');
  });
});
