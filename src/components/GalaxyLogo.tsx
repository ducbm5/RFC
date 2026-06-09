/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface GalaxyLogoProps {
  className?: string;
  size?: number; // scale factor
}

export default function GalaxyLogo({ className = '', size = 1 }: GalaxyLogoProps) {
  // Use a state to control different fallbacks if the image fails to load due to ISP blocks or CDN issues.
  // Stage 0: Cloudflare-cached proxy of the official logo (extremely reliable and fast in Vietnam)
  // Stage 1: Direct wikipedia URL
  // Stage 2: Handcrafted SVG vector fallback with typography
  const [loadStage, setLoadStage] = useState<number>(0);

  const getImgSrc = () => {
    if (loadStage === 0) {
      return 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/vi/f/f6/Logo_VnExpress_Marathon.png';
    }
    return 'https://upload.wikimedia.org/wikipedia/vi/f/f6/Logo_VnExpress_Marathon.png';
  };

  const handleImgError = () => {
    if (loadStage === 0) {
      // Switch from Cloudflare proxy to direct URL
      setLoadStage(1);
    } else {
      // If direct URL also fails, use the inline SVG fallback
      setLoadStage(2);
    }
  };

  if (loadStage === 2) {
    // Stage 2: Crisp vector SVG representation with standard typography when image blocks occur
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <svg 
          width={40 * size} 
          height={36 * size} 
          viewBox="0 0 150 130" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <polygon 
            points="42.5,10 107.5,10 140,65 107.5,120 42.5,120 10,65" 
            fill="#9a1d49" 
          />
          <polygon 
            points="34,78 46,55 62,84 50,107" 
            fill="white" 
          />
          <polygon 
            points="116,78 104,55 88,84 100,107" 
            fill="white" 
          />
          <polygon 
            points="75,107 48,56 63,48 75,70 87,48 102,56" 
            fill="white" 
          />
        </svg>
        <div className="flex flex-col text-left">
          <span className="font-sans font-black tracking-tight leading-none text-[#9a1d49]" style={{ fontSize: `${16 * size}px` }}>
            VnExpress
          </span>
          <span className="font-sans font-black tracking-normal leading-tight text-[#9a1d49] mt-0.5" style={{ fontSize: `${16 * size}px` }}>
            Marathon
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src={getImgSrc()}
        alt="VnExpress Marathon Logo"
        style={{ height: `${36 * size}px` }}
        className="w-auto object-contain shrink-0"
        onError={handleImgError}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
