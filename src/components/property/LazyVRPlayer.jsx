import { useState } from 'react';
import './LazyVRPlayer.scss';

const LazyVRPlayer = ({ virtualTourUrl, thumbnailUrl, title }) => {
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    return (
      <div className="lazy-vr-player" onClick={() => setLoaded(true)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setLoaded(true)} aria-label="Click to load 360° virtual tour">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title || 'Property'} className="lazy-vr-player__thumb" />
        ) : (
          <div className="lazy-vr-player__placeholder">
            <i className="fas fa-home fa-3x text-muted" />
          </div>
        )}
        <div className="lazy-vr-player__overlay">
          <div className="lazy-vr-player__content">
            <i className="fas fa-vr-cardboard fa-3x mb-2" />
            <div className="fw-bold">Click to Load 360° Tour</div>
            <small>Immersive virtual walkthrough</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={virtualTourUrl}
      title={title || '360° Virtual Tour'}
      className="lazy-vr-player__iframe"
      allowFullScreen
      loading="lazy"
    />
  );
};

export default LazyVRPlayer;
