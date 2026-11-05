import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { playHoverSound, playClickSound } from '../utils/soundEngine';

export default function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI?.onMaximizeChange) {
      const cleanup = window.electronAPI.onMaximizeChange((maxState) => {
        setIsMaximized(maxState);
      });
      return cleanup;
    }
  }, []);

  const handleMinimize = () => {
    playClickSound();
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    playClickSound();
    if (window.electronAPI?.maximize) {
      window.electronAPI.maximize();
    } else {
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = () => {
    playClickSound();
    if (window.electronAPI?.close) {
      window.electronAPI.close();
    }
  };

  return (
    <div className="h-[34px] w-full bg-[#09090D] border-b border-[#262638]/70 flex items-center justify-between px-3 select-none z-50 text-xs text-gray-300 drag-region flex-shrink-0">
      {/* Sol: Logo ve İsim */}
      <div className="flex items-center space-x-2 no-drag-region">
        <img
          src="./logo1.png"
          alt="LxPlayer"
          className="w-4 h-4 object-contain drop-shadow-[0_0_8px_var(--color-glow)]"
          onError={(e) => {
            e.currentTarget.src = './logo.svg';
          }}
        />
        <span className="font-bold text-gray-200 tracking-wider text-[11px]">
          LxPlayer Desktop
        </span>
      </div>

      {/* Orta: Temiz, çakışmayan boş alan (sürüklenebilir) */}
      <div className="flex-1 h-full" />

      {/* Sağ: Pencere Kontrolleri */}
      <div className="flex items-center space-x-1 no-drag-region">
        <button
          onClick={handleMinimize}
          onMouseEnter={playHoverSound}
          title="Küçült"
          className="w-8 h-6 flex items-center justify-center rounded hover:bg-[#181824] hover:text-white transition-colors text-gray-400"
        >
          <Minus size={13} strokeWidth={2.2} />
        </button>

        <button
          onClick={handleMaximize}
          onMouseEnter={playHoverSound}
          title={isMaximized ? 'Geri Yükle' : 'Büyüt'}
          className="w-8 h-6 flex items-center justify-center rounded hover:bg-[#181824] hover:text-white transition-colors text-gray-400"
        >
          {isMaximized ? (
            <Copy size={11} strokeWidth={2.2} className="rotate-180" />
          ) : (
            <Square size={11} strokeWidth={2.2} />
          )}
        </button>

        <button
          onClick={handleClose}
          onMouseEnter={playHoverSound}
          title="Kapat"
          className="w-8 h-6 flex items-center justify-center rounded hover:bg-red-600 hover:text-white transition-colors text-gray-400 group"
        >
          <X size={13} strokeWidth={2.2} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
