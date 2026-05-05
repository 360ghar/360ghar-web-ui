import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, expect, it, vi } from 'vitest';

import VirtualTourPage from './VirtualTourPage';
import { propertyAPIService } from '../../services/propertyAPIService';

vi.mock('../../common/layout/Header', () => ({ default: () => <header /> }));
vi.mock('../../common/layout/Footer', () => ({ default: () => <footer /> }));
vi.mock('../../common/layout/MobileMenu', () => ({ default: () => null }));
vi.mock('../../common/layout/OffCanvas', () => ({ default: () => null }));
vi.mock('../../services/propertyAPIService', () => ({
  propertyAPIService: {
    getPropertyById: vi.fn(),
  },
}));

function renderVirtualTourPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/property/42/virtual-tour']}>
        <Routes>
          <Route path="/property/:id/virtual-tour" element={<VirtualTourPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('VirtualTourPage', () => {
  it('renders property data from the API response body', async () => {
    propertyAPIService.getPropertyById.mockResolvedValue({
      data: {
        id: 42,
        title: 'Skyline Residency',
        locality: 'DLF Phase 1',
        bhk: 3,
        purpose: 'rent',
        monthly_rent: 85000,
        virtual_tour_url: 'https://tour.example.com/skyline',
        images: [{ image_url: 'https://images.example.com/skyline.jpg' }],
      },
    });

    renderVirtualTourPage();

    await waitFor(() => {
      expect(propertyAPIService.getPropertyById).toHaveBeenCalledWith('42');
    });

    const iframe = await screen.findByTitle('Skyline Residency - 360° Virtual Tour');
    expect(iframe).toHaveAttribute('src', 'https://tour.example.com/skyline');
    expect(screen.getByText('3 BHK')).toBeInTheDocument();
    expect(screen.getByText('DLF Phase 1')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Skyline Residency/i })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ pathname: '/property/42' }),
      ])
    );
  });
});
