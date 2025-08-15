"use client";

import React, { useState, useRef } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, position = 'top', className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(false), 100);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const getTooltipStyle = (): React.CSSProperties => {
    const offset = 10;
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      pointerEvents: 'none',
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          left: mousePosition.x,
          top: mousePosition.y - offset,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          ...baseStyle,
          left: mousePosition.x,
          top: mousePosition.y + offset,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          ...baseStyle,
          left: mousePosition.x - offset,
          top: mousePosition.y,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          ...baseStyle,
          left: mousePosition.x + offset,
          top: mousePosition.y,
          transform: 'translate(0, -50%)',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className={className}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          style={getTooltipStyle()}
          className="glass px-3 py-2 text-sm text-white rounded-lg shadow-2xl border border-white/20 animate-in fade-in duration-200"
        >
          {content}
          <div className="absolute w-2 h-2 bg-white/20 rotate-45 border border-white/20" />
        </div>
      )}
    </div>
  );
}
