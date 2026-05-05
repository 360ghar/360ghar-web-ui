import { useState, useEffect } from 'react';
import './PageLoader.css';

const MESSAGES = [
  'Finding your dream home…',
  'Curating the best listings…',
  'Preparing your experience…',
  'Almost there…',
];

const MESSAGE_INTERVAL = 2500;

const PageLoader = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, MESSAGE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="page-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading 360Ghar"
    >
      {/* Soft radial glow behind the house */}
      <div className="loader-glow" aria-hidden="true" />

      {/* House + Pin */}
      <div className="loader-center" aria-hidden="true">
        <svg
          className="house-svg"
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="houseStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--main-color)" />
              <stop offset="100%" stopColor="var(--main-color-dark)" />
            </linearGradient>
          </defs>

          {/* House outline: body + roof + door + two windows */}
          <path
            className="house-path"
            d="
              M 60 10
              L 100 45
              L 100 105
              L 20 105
              L 20 45
              Z
              M 60 10
              L 60 45
              M 42 70 L 42 88 L 58 88 L 58 70 Z
              M 72 62 L 72 76 L 88 76 L 88 62 Z
            "
            fill="none"
            stroke="url(#houseStroke)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Location pin drops in after house draws */}
        <div className="pin-wrapper">
          <svg
            className="pin-svg"
            viewBox="0 0 40 56"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--main-color-light)" />
                <stop offset="100%" stopColor="var(--main-color-dark)" />
              </linearGradient>
            </defs>
            <path
              className="pin-path"
              d="M20 0C9 0 0 9 0 20c0 11 20 36 20 36s20-25 20-36C40 9 31 0 20 0z"
              fill="url(#pinGradient)"
            />
            <circle className="pin-dot" cx="20" cy="20" r="7" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <div className="loader-text">
        <h1 className="brand-name">
          <span className="brand-number">360</span>
          <span className="brand-ghar">Ghar</span>
        </h1>

        <p className="brand-message">
          <span aria-hidden="true">{MESSAGES[messageIndex]}</span>
          <span className="sr-only">Loading, please wait</span>
        </p>

        <div className="loader-progress" aria-hidden="true">
          <div className="loader-progress-bar" />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
