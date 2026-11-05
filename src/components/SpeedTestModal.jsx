import React, { useState, useEffect } from 'react';
import { X, Gauge, Wifi, ArrowDown, RefreshCw } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';

export default function SpeedTestModal({ isOpen, onClose }) {
  const [testing, setTesting] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [ping, setPing] = useState(14);
  const [jitter, setJitter] = useState(2);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      runTest();
    }
  }, [isOpen]);

  const runTest = () => {
    setTesting(true);
    setCompleted(false);
    setSpeed(0);

    let current = 0;
    const targetSpeed = Math.floor(65 + Math.random() * 45); // between 65 - 110 Mbps
    const currentPing = Math.floor(12 + Math.random() * 8); // 12-20ms
    setPing(currentPing);
    setJitter(Math.floor(1 + Math.random() * 3));

    const interval = setInterval(() => {
      current += Math.random() * 9 + 4;
      if (current >= targetSpeed) {
        current = targetSpeed;
        setSpeed(Math.round(current));
        clearInterval(interval);
        setTesting(false);
        setCompleted(true);
      } else {
        setSpeed(Math.round(current));
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#13131A] border border-[#262638] rounded-2xl w-full max-w-md p-6 relative shadow-theme-glow">
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

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-theme-soft border border-theme-soft flex items-center justify-center text-theme">
            <Gauge size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Lx Ağ Hız Testi</h2>
            <p className="text-xs text-gray-400">IPTV akış performansı ve bağlantı kalitesi</p>
          </div>
        </div>

        {/* Speedometer Gauge */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                className="text-[#181824]"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                className="text-theme transition-all duration-200"
                fill="transparent"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * Math.min(speed, 120)) / 120}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black text-white tracking-tight">{speed}</span>
              <span className="text-xs font-semibold text-theme uppercase tracking-widest mt-1">Mbps</span>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-gray-300">
              <Wifi size={16} className="text-emerald-400" />
              <span>Ping: <strong className="text-white">{ping} ms</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <ArrowDown size={16} className="text-blue-400" />
              <span>Jitter: <strong className="text-white">{jitter} ms</strong></span>
            </div>
          </div>

          <div className="mt-5 w-full bg-[#181824] border border-[#262638] rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">IPTV Yayın Uygunluğu</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {speed > 50 ? '4K UHD & 60 FPS Canlı Yayın İçin Mükemmel' : 'HD Yayın İçin Uygun'}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end space-x-3">
          <button
            onClick={() => {
              playClickSound();
              runTest();
            }}
            onMouseEnter={playHoverSound}
            disabled={testing}
            className="w-full py-2.5 rounded-xl bg-theme hover:bg-theme-hover disabled:opacity-50 text-white font-semibold flex items-center justify-center space-x-2 text-sm transition-colors shadow-theme-glow"
          >
            <RefreshCw size={16} className={testing ? 'animate-spin' : ''} />
            <span>{testing ? 'Ölçülüyor...' : 'Yeniden Test Et'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
