import './PageLoader.css';

const PageLoader = () => {
  return (
    <div className="page-loader">
      <div className="loader-content">
        {/* House Animation */}
        <div className="house-animation">
          {/* Floating particles */}
          <div className="particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>

          {/* SVG House with draw animation */}
          <svg className="house-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* House gradient */}
              <linearGradient id="houseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff8c3a" />
                <stop offset="100%" stopColor="#cc5500" />
              </linearGradient>

              {/* Pin gradient */}
              <linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff8c3a" />
                <stop offset="100%" stopColor="#cc5500" />
              </linearGradient>
            </defs>

            {/* House outline - single path for draw animation */}
            <path
              className="house-path"
              d="M50 15 L85 45 L85 85 L15 85 L15 45 Z"
            />

            {/* Roof */}
            <path
              className="house-path"
              d="M10 45 L50 15 L90 45"
              style={{ animationDelay: '0.3s' }}
            />

            {/* House fill (appears after stroke) */}
            <path
              className="house-fill"
              d="M50 15 L85 45 L85 85 L15 85 L15 45 Z"
            />

            {/* Left Window */}
            <rect
              className="window-left"
              x="25" y="50"
              width="15" height="15"
              rx="2"
            />
            <rect
              className="window-glow-left"
              x="25" y="50"
              width="15" height="15"
              rx="2"
            />

            {/* Right Window */}
            <rect
              className="window-right"
              x="60" y="50"
              width="15" height="15"
              rx="2"
            />
            <rect
              className="window-glow-right"
              x="60" y="50"
              width="15" height="15"
              rx="2"
            />

            {/* Door */}
            <rect
              className="door"
              x="42" y="60"
              width="16" height="25"
              rx="2"
            />

            {/* Location Pin on roof */}
            <g className="location-pin-group">
              <path
                className="location-pin"
                d="M50 5 C46 5 43 8 43 12 C43 17 50 25 50 25 C50 25 57 17 57 12 C57 8 54 5 50 5 Z"
              />
              <circle
                className="location-pin-dot"
                cx="50" cy="12" r="3"
              />
            </g>
          </svg>
        </div>

        {/* Loading Text */}
        <div className="loader-text">
          <span className="brand-name">360Ghar</span>
          <p className="loader-message">
            Finding your dream home
            <span className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </p>
          <div className="loader-progress">
            <div className="loader-progress-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
