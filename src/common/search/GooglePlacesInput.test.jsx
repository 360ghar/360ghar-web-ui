import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@googlemaps/js-api-loader', () => ({
  Loader: vi.fn(() => ({
    load: vi.fn().mockResolvedValue(undefined),
  })),
}));

import GooglePlacesInput from './GooglePlacesInput';

describe('GooglePlacesInput', () => {
  const originalApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  let autocompleteInstance;
  let autocompleteConstructor;
  let placeChangedHandler;

  beforeEach(() => {
    autocompleteInstance = {
      addListener: vi.fn((eventName, callback) => {
        if (eventName === 'place_changed') {
          placeChangedHandler = callback;
        }
      }),
      getPlace: vi.fn(() => ({
        formatted_address: 'Gurgaon, Haryana, India',
        geometry: {
          location: {
            lat: () => 28.4595,
            lng: () => 77.0266,
          },
        },
      })),
    };

    autocompleteConstructor = vi.fn(() => autocompleteInstance);

    import.meta.env.VITE_GOOGLE_PLACES_API_KEY = 'test-api-key';
    window.requestIdleCallback = vi.fn((callback) => {
      callback();
      return 1;
    });
    window.cancelIdleCallback = vi.fn();
    globalThis.google = {
      maps: {
        places: {
          Autocomplete: autocompleteConstructor,
        },
      },
    };
  });

  afterEach(() => {
    import.meta.env.VITE_GOOGLE_PLACES_API_KEY = originalApiKey;
    delete window.requestIdleCallback;
    delete window.cancelIdleCallback;
    delete globalThis.google;
    placeChangedHandler = undefined;
    vi.clearAllMocks();
  });

  it('renders a native input for manual entry fallback', () => {
    render(<GooglePlacesInput placeholder="Enter location, city, or area..." />);

    expect(
      screen.getByPlaceholderText('Enter location, city, or area...')
    ).toBeInTheDocument();
  });

  it('initializes legacy Google Maps autocomplete with mapped options', async () => {
    render(
      <GooglePlacesInput
        placeholder="Enter location, city, or area..."
        restrictCountry="in"
        types={['(cities)']}
      />
    );

    const input = screen.getByPlaceholderText('Enter location, city, or area...');

    await waitFor(() => {
      expect(autocompleteConstructor).toHaveBeenCalledWith(input, {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'name'],
        types: ['(cities)'],
      });
    });
  });

  it('calls onSelect with place details when a prediction is chosen', async () => {
    const onSelect = vi.fn();

    render(<GooglePlacesInput placeholder="Enter location, city, or area..." onSelect={onSelect} />);

    await waitFor(() => {
      expect(autocompleteInstance.addListener).toHaveBeenCalledWith('place_changed', expect.any(Function));
    });

    placeChangedHandler();

    expect(onSelect).toHaveBeenCalledWith({
      lat: 28.4595,
      lng: 77.0266,
      name: 'Gurgaon, Haryana, India',
    });
  });
});
