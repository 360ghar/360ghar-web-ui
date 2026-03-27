
const VastuScoreCard = ({ score, summary, confidence, hasWarnings }) => {
    const getScoreColor = (score) => {
        if (score >= 8) return '#28a745'; // Green - Excellent
        if (score >= 6) return '#ff6b00'; // Orange - Good (theme color)
        if (score >= 4) return '#ffc107'; // Yellow - Needs Improvement
        return '#dc3545'; // Red - Poor
    };

    const getScoreLabel = (score) => {
        if (score >= 8) return 'Excellent';
        if (score >= 6) return 'Good';
        if (score >= 4) return 'Needs Improvement';
        return 'Poor';
    };

    const getScoreDescription = (score) => {
        if (score >= 8) return 'Your property follows most Vastu principles excellently!';
        if (score >= 6) return 'Your property has good Vastu compliance with minor improvements needed.';
        if (score >= 4) return 'Several Vastu corrections recommended for better energy flow.';
        return 'Significant Vastu remedies recommended for this property.';
    };

    const getScoreEmoji = (score) => {
        if (score >= 8) return '🌟';
        if (score >= 6) return '👍';
        if (score >= 4) return '⚠️';
        return '⚡';
    };

    const scoreValue = parseFloat(score) || 0;
    const confidenceValue = parseFloat(confidence) || 1.0;
    const showConfidenceWarning = confidenceValue < 0.8;
    const percentage = (scoreValue / 10) * 100;
    const circumference = 2 * Math.PI * 54; // radius = 54
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className={`vastu-score-card bg-white p-4 rounded-3 shadow-sm mb-4 ${hasWarnings ? 'has-warnings' : ''}`}>
            <div className="row align-items-center">
                <div className="col-md-4 text-center mb-4 mb-md-0">
                    <div className="score-circle-wrapper">
                        <svg width="160" height="160" viewBox="0 0 120 120">
                            {/* Background circle */}
                            <circle
                                cx="60"
                                cy="60"
                                r="54"
                                fill="none"
                                stroke="#e9ecef"
                                strokeWidth="8"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="60"
                                cy="60"
                                r="54"
                                fill="none"
                                stroke={getScoreColor(scoreValue)}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 60 60)"
                                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                            />
                            {/* Score text */}
                            <text
                                x="60"
                                y="55"
                                textAnchor="middle"
                                fontSize="28"
                                fontWeight="bold"
                                fill={getScoreColor(scoreValue)}
                            >
                                {scoreValue.toFixed(0)}
                            </text>
                            <text
                                x="60"
                                y="75"
                                textAnchor="middle"
                                fontSize="12"
                                fill="#6c757d"
                            >
                                out of 10
                            </text>
                        </svg>
                    </div>
                    <div className="score-label mt-3">
                        <span
                            className="badge fs-6 px-3 py-2"
                            style={{ backgroundColor: getScoreColor(scoreValue) }}
                        >
                            {getScoreEmoji(scoreValue)} {getScoreLabel(scoreValue)}
                        </span>
                    </div>
                </div>

                <div className="col-md-8">
                    <h3 className="mb-3">
                        <i className="fas fa-compass me-2 text-main"></i>
                        Vastu Analysis Complete
                    </h3>
                    <p className="text-muted mb-3">
                        {getScoreDescription(scoreValue)}
                    </p>
                    {summary && (
                        <div className="summary-box bg-light p-3 rounded-2">
                            <h6 className="mb-2">
                                <i className="fas fa-info-circle me-2 text-main"></i>
                                Summary
                            </h6>
                            <p className="mb-0 small">{summary}</p>
                        </div>
                    )}

                    {/* Confidence Indicator */}
                    {showConfidenceWarning && (
                        <div className="confidence-indicator mt-3 p-3 bg-warning-subtle rounded-2 border border-warning">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                                    <small className="fw-semibold">Analysis Confidence</small>
                                </div>
                                <small className={confidenceValue < 0.5 ? 'text-danger fw-bold' : 'text-warning fw-bold'}>
                                    {Math.round(confidenceValue * 100)}%
                                </small>
                            </div>
                            <div className="progress" style={{ height: '6px' }}>
                                <div
                                    className={`progress-bar ${confidenceValue < 0.5 ? 'bg-danger' : 'bg-warning'}`}
                                    style={{ width: `${confidenceValue * 100}%` }}
                                ></div>
                            </div>
                            <small className="text-muted d-block mt-2">
                                <i className="fas fa-info-circle me-1"></i>
                                This score may be less reliable due to image quality or unclear floor plan layout.
                            </small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VastuScoreCard;
