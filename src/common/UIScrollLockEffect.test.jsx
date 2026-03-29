import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import UIScrollLockEffect from './UIScrollLockEffect';
import { useUIStore } from '../store';

describe('UIScrollLockEffect', () => {
  beforeEach(() => {
    useUIStore.setState({
      toggleMobileMenu: false,
      offCanvas: false,
      hideScroll: false,
    });
  });

  it('adds and removes the mobile scroll lock class', () => {
    const { unmount } = render(<UIScrollLockEffect />);

    act(() => {
      useUIStore.setState({ toggleMobileMenu: true });
    });

    expect(document.body).toHaveClass('scroll-hide-sm');
    expect(document.body).not.toHaveClass('scroll-hide');

    unmount();

    expect(document.body).not.toHaveClass('scroll-hide-sm');
    expect(document.body).not.toHaveClass('scroll-hide');
  });

  it('prefers the desktop scroll lock class when off-canvas is open', () => {
    render(<UIScrollLockEffect />);

    act(() => {
      useUIStore.setState({ toggleMobileMenu: false, offCanvas: true });
    });

    expect(document.body).toHaveClass('scroll-hide');
    expect(document.body).not.toHaveClass('scroll-hide-sm');
  });
});
