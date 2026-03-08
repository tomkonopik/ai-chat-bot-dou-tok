'use client';
import React, { useState, useEffect, useCallback } from 'react';

export interface CanvasSlide {
  title: string;
  content: string;
  bg: string; // gradient background
}

export interface CanvasData {
  type: 'presentation' | 'app';
  title: string;
  slides?: CanvasSlide[];
  appHtml?: string;
}

interface CanvasProps {
  data: CanvasData;
  onClose: () => void;
}

export function Canvas({ data, onClose }: CanvasProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isBuilding, setIsBuilding] = useState(true);
  const [builtSlides, setBuiltSlides] = useState(0);

  const totalSlides = data.slides?.length || 0;

  // Simulate progressive building
  useEffect(() => {
    if (data.type !== 'presentation' || !data.slides) {
      // For apps, just show progress then reveal
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 15 + 5;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setTimeout(() => setIsBuilding(false), 300);
        }
        setProgress(Math.min(p, 100));
      }, 200);
      return () => clearInterval(interval);
    }

    // For presentations, build slide by slide
    let built = 0;
    const interval = setInterval(() => {
      built++;
      setBuiltSlides(built);
      setProgress((built / totalSlides) * 100);
      if (built >= totalSlides) {
        clearInterval(interval);
        setTimeout(() => setIsBuilding(false), 400);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [data, totalSlides]);

  const goNext = useCallback(() => {
    if (data.slides && currentSlide < data.slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide, data.slides]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  // Key navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onClose]);

  // Building progress screen
  if (isBuilding) {
    return (
      <div className="canvas-overlay">
        <div className="canvas-building">
          <div className="canvas-building-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C12 7.52 16.48 12 22 12C16.48 12 12 16.48 12 22C12 16.48 7.52 12 2 12C7.52 12 12 7.52 12 2Z" fill="#ff4d4d"/>
            </svg>
          </div>
          <h2>{data.type === 'presentation' ? 'Vytvářím prezentaci...' : 'Vytvářím aplikaci...'}</h2>
          <p className="canvas-building-title">{data.title}</p>
          {data.type === 'presentation' && (
            <p className="canvas-building-status">Slide {builtSlides} z {totalSlides}</p>
          )}
          <div className="canvas-progress-bar">
            <div className="canvas-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="canvas-progress-pct">{Math.round(progress)}%</span>
        </div>
      </div>
    );
  }

  // Presentation mode
  if (data.type === 'presentation' && data.slides) {
    const slide = data.slides[currentSlide];
    return (
      <div className="canvas-overlay">
        <div className="canvas-container">
          {/* Top bar */}
          <div className="canvas-topbar">
            <span className="canvas-topbar-title">{data.title}</span>
            <span className="canvas-topbar-count">Slide {currentSlide + 1} / {data.slides.length}</span>
            <button className="canvas-close-btn" onClick={onClose}>✕</button>
          </div>

          {/* Slide area */}
          <div className="canvas-slide" style={{ background: slide.bg }}>
            <h1 className="canvas-slide-title">{slide.title}</h1>
            <div className="canvas-slide-content" dangerouslySetInnerHTML={{ __html: slide.content }} />
          </div>

          {/* Bottom controls */}
          <div className="canvas-controls">
            <button className="canvas-nav-btn" onClick={goPrev} disabled={currentSlide === 0}>
              ◀ Zpět
            </button>
            <div className="canvas-dots">
              {data.slides.map((_, i) => (
                <button key={i} className={`canvas-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} />
              ))}
            </div>
            <button className="canvas-nav-btn" onClick={goNext} disabled={currentSlide === data.slides.length - 1}>
              Další ▶
            </button>
          </div>
        </div>
      </div>
    );
  }

  // App mode (iframe sandbox)
  if (data.type === 'app' && data.appHtml) {
    return (
      <div className="canvas-overlay">
        <div className="canvas-container canvas-app-container">
          <div className="canvas-topbar">
            <span className="canvas-topbar-title">🎮 {data.title}</span>
            <button className="canvas-close-btn" onClick={onClose}>✕</button>
          </div>
          <iframe
            className="canvas-app-frame"
            srcDoc={data.appHtml}
            sandbox="allow-scripts allow-modals"
            title={data.title}
          />
        </div>
      </div>
    );
  }

  return null;
}
