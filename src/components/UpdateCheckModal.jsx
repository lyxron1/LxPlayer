import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, RefreshCw } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';

export default function UpdateCheckModal({ isOpen, onClose }) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setChecking(true);
      const timer = setTimeout(() => {
        setChecking(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#13131A] border border-[#262638] rounded-2xl w-full max-w-sm p-6 relative shadow-theme-glow text-center">
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          onMouseEnter={playHoverSound}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#181824]"
        >
          <X size={18} />
        </button>

        {checking ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <RefreshCw size={36} className="text-theme animate-spin" />
            <h3 className="text-base font-bold text-white">Güncellemeler Kontrol Ediliyor...</h3>
            <p className="text-xs text-gray-400">Sunucudan son sürüm bilgisi alınıyor</p>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">Uygulama Güncel!</h3>
            <div className="bg-[#181824] px-3 py-1 rounded-full text-xs font-semibold text-theme border border-[#262638]">
              LxPlayer v2.4.0 (Desktop Edition)
            </div>
            <p className="text-xs text-gray-400 px-4">
              En son kararlı sürümü kullanıyorsunuz. Yeni özellikler ve güvenlik yamaları yüklü.
            </p>
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              onMouseEnter={playHoverSound}
              className="mt-4 w-full py-2.5 rounded-xl bg-theme hover:bg-theme-hover text-white font-semibold text-sm transition-colors shadow-theme-glow"
            >
              Tamam
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
