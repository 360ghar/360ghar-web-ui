import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import ListingSidebar from './ListingSidebar';

describe('ListingSidebar', () => {
  it('smooth-scrolls to listing sections and marks the clicked section active', () => {
    const scrollIntoView = vi.fn();
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <MemoryRouter>
        <>
          <ListingSidebar />
          <div id="basicInformation">Basic Information section</div>
          <div id="propertyGallery">Property Gallery section</div>
          <div id="propertyInformation">Property Information section</div>
          <div id="propertyContactDetails">Property Contact Details section</div>
        </>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /Property Gallery/i });

    fireEvent.click(link);

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(link).toHaveClass('active');

    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });
});
