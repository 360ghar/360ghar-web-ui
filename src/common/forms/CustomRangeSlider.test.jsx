import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import CustomRangeSlider from './CustomRangeSlider';

describe('CustomRangeSlider', () => {
  it('does not emit a filter change during initial render', () => {
    const onChange = vi.fn();

    render(<CustomRangeSlider min={0} max={100} onChange={onChange} />);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('emits the next range when a thumb changes', () => {
    const onChange = vi.fn();

    render(<CustomRangeSlider min={0} max={100} onChange={onChange} />);

    const [minThumb] = screen.getAllByRole('slider');
    fireEvent.change(minThumb, { target: { value: '25' } });

    expect(onChange).toHaveBeenCalledWith({ min: 25, max: 100 });
  });
});
