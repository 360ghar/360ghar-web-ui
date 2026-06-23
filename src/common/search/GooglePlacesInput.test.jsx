import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@googlemaps/js-api-loader', () => ({
  Loader: vi.fn(() => ({
    load: vi.fn().mockResolvedValue(undefined),
  })),
}));

import GooglePlacesInput from './GooglePlacesInput';

describe('GooglePlacesInput', () => {
  const originalApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  let fetchAutocompleteSuggestions;
  let fetchFields;
  let toPlace;

  beforeEach(() => {
    // Place returned after a suggestion is picked + fetchFields() resolves.
    fetchFields = vi.fn().mockResolvedValue(undefined);
    const place = {
      fetchFields,
      location: { lat: () => 28.4595, lng: () => 77.0266 },
      formattedAddress: 'Gurgaon, Haryana, India',
      displayName: 'Gurgaon',
    };
    toPlace = vi.fn(() => place);

    const prediction = {
      placeId: 'place-1',
      text: { toString: () => 'Gurgaon, Haryana, India' },
      mainText: { toString: () => 'Gurgaon' },
      secondaryText: { toString: () => 'Haryana, India' },
      toPlace,
    };

    fetchAutocompleteSuggestions = vi.fn().mockResolvedValue({
      suggestions: [{ placePrediction: prediction }],
    });

    const placesLibrary = {
      AutocompleteSuggestion: { fetchAutocompleteSuggestions },
      AutocompleteSessionToken: vi.fn(function AutocompleteSessionToken() {}),
    };

    import.meta.env.VITE_GOOGLE_PLACES_API_KEY = 'test-api-key';
    window.requestIdleCallback = vi.fn((callback) => {
      callback();
      return 1;
    });
    window.cancelIdleCallback = vi.fn();
    globalThis.google = {
      maps: {
        importLibrary: vi.fn(async (name) => (name === 'places' ? placesLibrary : {})),
      },
    };
  });

  afterEach(() => {
    import.meta.env.VITE_GOOGLE_PLACES_API_KEY = originalApiKey;
    delete window.requestIdleCallback;
    delete window.cancelIdleCallback;
    delete globalThis.google;
    vi.clearAllMocks();
  });

  it('renders a native input for manual entry fallback', () => {
    render(<GooglePlacesInput placeholder="Enter location, city, or area..." />);

    expect(
      screen.getByPlaceholderText('Enter location, city, or area...')
    ).toBeInTheDocument();
  });

  it('requests autocomplete suggestions with mapped New-API options', async () => {
    render(
      <GooglePlacesInput
        placeholder="Enter location, city, or area..."
        restrictCountry="in"
        types={['(cities)']}
      />
    );

    const input = screen.getByPlaceholderText('Enter location, city, or area...');
    fireEvent.change(input, { target: { value: 'gurgaon' } });

    await waitFor(() => {
      expect(fetchAutocompleteSuggestions).toHaveBeenCalledWith(
        expect.objectContaining({
          input: 'gurgaon',
          includedRegionCodes: ['in'],
          includedPrimaryTypes: ['(cities)'],
        })
      );
    });
  });

  it('calls onSelect with place details when a prediction is chosen', async () => {
    const onSelect = vi.fn();

    render(
      <GooglePlacesInput placeholder="Enter location, city, or area..." onSelect={onSelect} />
    );

    const input = screen.getByPlaceholderText('Enter location, city, or area...');
    fireEvent.change(input, { target: { value: 'gurgaon' } });

    // Wait for the suggestion dropdown to render.
    const option = await screen.findByRole('option');
    fireEvent.mouseDown(option);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith({
        lat: 28.4595,
        lng: 77.0266,
        name: 'Gurgaon, Haryana, India',
      });
    });

    expect(toPlace).toHaveBeenCalled();
    expect(fetchFields).toHaveBeenCalledWith({
      fields: ['location', 'formattedAddress', 'displayName'],
    });
  });
});
