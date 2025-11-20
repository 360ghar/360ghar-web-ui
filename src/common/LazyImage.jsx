import React, { forwardRef } from 'react';

/**
 * Centralized <img> wrapper that defaults to native lazy loading while
 * letting critical assets opt into eager loading via the `priority` flag.
 */
const LazyImage = forwardRef(
  (
    {
      priority = false,
      loading,
      decoding = 'async',
      fetchPriority,
      ...rest
    },
    ref
  ) => {
    const resolvedLoading = priority ? 'eager' : loading ?? 'lazy';
    const resolvedDecoding = priority ? 'auto' : decoding;
    const resolvedFetchPriority = priority ? 'high' : fetchPriority;

    return (
      <img
        ref={ref}
        loading={resolvedLoading}
        decoding={resolvedDecoding}
        fetchPriority={resolvedFetchPriority}
        {...rest}
      />
    );
  }
);

LazyImage.displayName = 'LazyImage';

export default LazyImage;
