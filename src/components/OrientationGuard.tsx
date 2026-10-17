import React, { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

export const OrientationGuard: React.FC = () => {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // 画面の幅が高さより大きく、かつモバイル端末サイズのときは縦画面への回転を促す
      const isLandscapeView = window.innerWidth > window.innerHeight && window.innerHeight < 600;
      setIsLandscape(isLandscapeView);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isLandscape) return null;

  return (
    <div
      id="orientation-guard-overlay"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fbf9f4]/95 px-6 text-center backdrop-blur-md"
    >
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#d4af37]/60 bg-[#ffffff] shadow-md">
        <Smartphone className="h-10 w-10 animate-bounce text-[#aa771c]" />
      </div>
      <p className="font-mincho text-lg font-medium tracking-widest text-[#2c241c]">
        スマートフォンを縦向きにして
        <br />
        お楽しみください
      </p>
      <p className="mt-3 text-xs tracking-wider text-[#796c5b]">
        PLEASE ROTATE TO PORTRAIT
      </p>
    </div>
  );
};
