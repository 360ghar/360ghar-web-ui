import './PageLoader.css';

const PageLoader = () => {
  return (
    <div className="page-loader" role="status" aria-live="polite" aria-label="Loading 360Ghar">
      {/* Animated Background Elements */}
      <div className="loader-bg-elements">
        <div className="bg-circle bg-circle--1"></div>
        <div className="bg-circle bg-circle--2"></div>
        <div className="bg-circle bg-circle--3"></div>
      </div>

      <div className="loader-content">
        {/* 3D Rotating House Container */}
        <div className="house-wrapper">
          <div className="house-3d">
            {/* Front Face - House Body */}
            <div className="house-face house-face--front">
              <svg className="house-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="houseGradientNew" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--main-color)" />
                    <stop offset="100%" stopColor="var(--main-color-dark)" />
                  </linearGradient>
                  <linearGradient id="glowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--main-color-light)" />
                    <stop offset="100%" stopColor="var(--main-color)" />
                  </linearGradient>
                </defs>
                
                {/* House Body */}
                <path
                  className="house-body-path"
                  d="M50 20 L85 50 L85 90 L15 90 L15 50 Z"
                />
                
                {/* Windows */}
                <rect className="window window--left" x="25" y="55" width="14" height="14" rx="2" />
                <rect className="window window--right" x="61" y="55" width="14" height="14" rx="2" />
                
                {/* Door */}
                <rect className="door-new" x="42" y="65" width="16" height="25" rx="2" />
              </svg>
            </div>
            
            {/* Roof */}
            <div className="house-roof">
              <svg className="roof-svg" viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--main-color)" />
                    <stop offset="100%" stopColor="var(--main-color-dark)" />
                  </linearGradient>
                </defs>
                <path className="roof-path" d="M10 45 L60 5 L110 45" />
              </svg>
            </div>
            
            {/* Location Pin */}
            <div className="location-pin-3d">
              <svg className="pin-svg" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="pinGradientNew" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--main-color-light)" />
                    <stop offset="100%" stopColor="var(--main-color-dark)" />
                  </linearGradient>
                </defs>
                <path className="pin-path" d="M20 0 C10 0 2 10 2 22 C2 35 20 48 20 48 C20 48 38 35 38 22 C38 10 30 0 20 0 Z" />
                <circle className="pin-dot" cx="20" cy="22" r="6" />
              </svg>
              <div className="pin-glow"></div>
            </div>
          </div>
          
          {/* Orbiting Elements */}
          <div className="orbit orbit--1">
            <div className="orbit-dot"></div>
          </div>
          <div className="orbit orbit--2">
            <div className="orbit-dot"></div>
          </div>
          <div className="orbit orbit--3">
            <div className="orbit-dot"></div>
          </div>
        </div>

        {/* Floating Particles */}
        <div className="particles-3d">
          <div className="particle-3d particle-3d--1"></div>
          <div className="particle-3d particle-3d--2"></div>
          <div className="particle-3d particle-3d--3"></div>
        </div>

        {/* Loading Text */}
        <div className="loader-text">
          <h1 className="brand-name-3d">
            <span className="brand-number">360</span>
            <span className="brand-ghar">Ghar</span>
          </h1>
          <p className="loader-message-3d">
            <span aria-hidden="true">
              Finding your dream home
              <span className="loading-dots-3d">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </span>
            <span className="sr-only">Loading, please wait</span>
          </p>
          <div className="loader-progress-3d" aria-hidden="true">
            <div className="loader-progress-bar-3d"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
