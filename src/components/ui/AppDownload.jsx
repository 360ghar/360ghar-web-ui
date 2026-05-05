const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.the360ghar.ghar360';
const APP_SCREENSHOT_URL = 'https://play-lh.googleusercontent.com/_SLUEY0ZgYbE-9jzJd8QgRUV2PUVq9U22bYy5VjGKfF-XQkvtw-G-tepOh0C6_yIBYLEw3OEKZ4gw7GTubcb';

const AppDownload = () => {
    return (
        <section className="app-download padding-y-120">
            <div className="container container-two">
                <div className="row align-items-center gy-5">
                    <div className="col-lg-6">
                        <div className="app-download__content">
                            <span className="section-heading__subtitle bg-gray-100">
                                Download Our App
                            </span>
                            <h2 className="app-download__title mt-3">
                                India&apos;s Only App with{' '}
                                <span className="text-gradient">360° Property Tours</span>
                            </h2>
                            <p className="app-download__desc mt-3">
                                Browse verified listings, take immersive virtual walkthroughs, and chat with your dedicated Relationship Manager — no endless calls, no fake photos, no duplicates.
                            </p>

                            <div className="app-download__stats mt-3">
                                <div className="app-download__stat">
                                    <strong>50+</strong>
                                    <span>Downloads</span>
                                </div>
                                <div className="app-download__stat-divider"></div>
                                <div className="app-download__stat">
                                    <strong>v1.0.7</strong>
                                    <span>Latest</span>
                                </div>
                                <div className="app-download__stat-divider"></div>
                                <div className="app-download__stat">
                                    <strong>3+</strong>
                                    <span>Rated</span>
                                </div>
                            </div>

                            <div className="app-download__rating mt-3">
                                <div className="app-download__stars">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <i key={i} className="fas fa-star"></i>
                                    ))}
                                </div>
                                <span className="app-download__rating-text">
                                    Trusted by home seekers across India
                                </span>
                            </div>

                            <div className="app-download__features-grid mt-4">
                                <div className="app-download__feature-card">
                                    <span className="app-download__feature-icon">
                                        <i className="fas fa-vr-cardboard"></i>
                                    </span>
                                    <div>
                                        <h6>360° Virtual Tours</h6>
                                        <p>Walk through every corner before visiting</p>
                                    </div>
                                </div>
                                <div className="app-download__feature-card">
                                    <span className="app-download__feature-icon">
                                        <i className="fas fa-robot"></i>
                                    </span>
                                    <div>
                                        <h6>AI Recommendations</h6>
                                        <p>Personalized matches based on preferences</p>
                                    </div>
                                </div>
                                <div className="app-download__feature-card">
                                    <span className="app-download__feature-icon">
                                        <i className="fas fa-bell"></i>
                                    </span>
                                    <div>
                                        <h6>Instant Alerts</h6>
                                        <p>New listings & price drop notifications</p>
                                    </div>
                                </div>
                                <div className="app-download__feature-card">
                                    <span className="app-download__feature-icon">
                                        <i className="fas fa-comments"></i>
                                    </span>
                                    <div>
                                        <h6>Direct RM Chat</h6>
                                        <p>One-tap connect with property experts</p>
                                    </div>
                                </div>
                            </div>

                            <div className="app-download__cta mt-4">
                                <div className="app-download__badges">
                                    <a
                                        href={PLAY_STORE_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="app-download__badge"
                                    >
                                        <img
                                            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                                            alt="Get it on Google Play"
                                        />
                                    </a>
                                    <div className="app-download__badge app-download__badge--ios">
                                        <div className="app-download__ios-badge">
                                            <i className="fab fa-apple"></i>
                                            <div>
                                                <small>Coming Soon on the</small>
                                                <strong>App Store</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="app-download__qr">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(PLAY_STORE_URL)}`}
                                        alt="Scan to download"
                                    />
                                    <span>Scan to download</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="app-download__visual">
                            <div className="app-download__phone-wrapper">
                                {/* Floating notification cards */}
                                <div className="app-download__float-card app-download__float-card--top">
                                    <div className="app-download__float-avatar">
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div>
                                        <strong>Rahul M.</strong>
                                        <span>RM sent a message</span>
                                    </div>
                                </div>
                                <div className="app-download__float-card app-download__float-card--right">
                                    <i className="fas fa-home text-gradient"></i>
                                    <div>
                                        <strong>3 New Listings</strong>
                                        <span>in Sector 57</span>
                                    </div>
                                </div>
                                <div className="app-download__float-card app-download__float-card--bottom">
                                    <i className="fas fa-check-circle text-gradient"></i>
                                    <div>
                                        <strong>Verified</strong>
                                        <span>Property photos</span>
                                    </div>
                                </div>

                                {/* Phone mockup — direct screenshot from Play Store */}
                                <div className="app-download__phone">
                                    <img
                                        src={APP_SCREENSHOT_URL}
                                        alt="360Ghar App — 360° Verified Tours"
                                    />
                                </div>
                            </div>

                            {/* Background decorative elements */}
                            <div className="app-download__bg-circle"></div>
                            <div className="app-download__bg-glow"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AppDownload;