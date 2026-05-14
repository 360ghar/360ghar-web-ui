import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const BeforeAfterCompare = ({ beforeImage, afterImage, beforeLabel, afterLabel }) => {
  const { t } = useTranslation('tools');
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const handleDownloadCombined = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imgBefore = new Image();
    const imgAfter = new Image();
    imgBefore.crossOrigin = 'anonymous';
    imgAfter.crossOrigin = 'anonymous';

    let loaded = 0;
    const onBothLoaded = () => {
      const w = Math.max(imgBefore.naturalWidth || 0, imgAfter.naturalWidth || 0);
      const h = Math.max(imgBefore.naturalHeight || 0, imgAfter.naturalHeight || 0);
      if (!w || !h) return;

      const halfW = Math.ceil(w / 2);
      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(imgBefore, 0, 0, halfW, h);
      ctx.drawImage(imgAfter, halfW, 0, w - halfW, h);

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(halfW, 0);
      ctx.lineTo(halfW, h);
      ctx.stroke();

      ctx.font = 'bold 16px sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(8, 8, ctx.measureText(beforeLabel || 'Original').width + 16, 28);
      ctx.fillRect(halfW + 8, 8, ctx.measureText(afterLabel || 'AI Redesign').width + 16, 28);
      ctx.fillStyle = '#fff';
      ctx.fillText(beforeLabel || 'Original', 16, 14);
      ctx.fillText(afterLabel || 'AI Redesign', halfW + 16, 14);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `360ghar-before-after-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const onLoad = () => {
      loaded++;
      if (loaded === 2) onBothLoaded();
    };

    imgBefore.onload = onLoad;
    imgAfter.onload = onLoad;
    imgBefore.onerror = onLoad;
    imgAfter.onerror = onLoad;
    imgBefore.src = beforeImage;
    imgAfter.src = afterImage;
  }, [beforeImage, afterImage, beforeLabel, afterLabel]);

  return (
    <div className="before-after-compare">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <label className="form-label mb-0">
          <i className="fas fa-columns me-2"></i>
          {t('aiDesignStudio.beforeAfter')}
        </label>
        <button
          type="button"
          className="btn btn-sm btn-outline-main"
          onClick={handleDownloadCombined}
        >
          <i className="fas fa-download me-1"></i>
          {t('aiDesignStudio.download')}
        </button>
      </div>

      <div
        ref={containerRef}
        className="compare-container"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <div className="compare-image compare-before">
          <img src={beforeImage} alt={beforeLabel} />
          <span className="compare-label label-before">{beforeLabel}</span>
        </div>

        <div
          className="compare-image compare-after"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img src={afterImage} alt={afterLabel} />
          <span className="compare-label label-after">{afterLabel}</span>
        </div>

        <div
          className="compare-slider"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="slider-handle">
            <i className="fas fa-grip-lines-vertical"></i>
          </div>
          <div className="slider-line"></div>
        </div>
      </div>

      <p className="text-muted small mt-2 text-center">
        <i className="fas fa-hand-pointer me-1"></i>
        {t('aiDesignStudio.dragSlider')}
      </p>
    </div>
  );
};

export default BeforeAfterCompare;
