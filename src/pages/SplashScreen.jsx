import React, { useEffect, useState } from 'react';
import { playStartupSound } from '../utils/soundEngine';
import { useApp } from '../context/AppContext';
import { syncProfileLibrary } from '../services/xtreamService';

export default function SplashScreen() {
  const { activeProfile, setCurrentScreen } = useApp();
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState('12 saatlik önbellek kontrol ediliyor...');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Cinematic Ta-Dum sub-bass strike
    playStartupSound();

    let isMounted = true;

    async function runSync() {
      try {
        const result = await syncProfileLibrary(activeProfile, (pct, msg) => {
          if (isMounted) {
            setProgress(pct);
            setStatusText(msg);
          }
        });

        if (!isMounted) return;
        setStats(result);
        setProgress(100);

        setTimeout(() => {
          if (isMounted) {
            setCurrentScreen('dashboard');
          }
        }, 350);
      } catch (err) {
        console.warn('Sync notice:', err);
        if (isMounted) {
          setProgress(100);
          setTimeout(() => setCurrentScreen('dashboard'), 300);
        }
      }
    }

    runSync();

    return () => {
      isMounted = false;
    };
  }, [activeProfile]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden select-none bg-[#09090D]">
      {/* Symmetrical Centered Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial-ambient pointer-events-none animate-pulse-slow" />

      <div className="z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* Glowing 90px Logo */}
        <div className="relative mb-6">
          <div className="absolute -inset-6 rounded-full blur-2xl animate-pulse" style={{ backgroundColor: 'var(--lx-accent-glow)' }} />
          <img
            src="./logo1.png"
            alt="LxPlayer"
            className="w-[90px] h-[90px] object-contain relative drop-shadow-[0_0_25px_var(--lx-accent-glow)] animate-scale-in"
            onError={(e) => {
              e.currentTarget.src = './logo.svg';
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-white tracking-wide">
          LxPlayer Pro IPTV & Media Center
        </h1>

        {/* Active Account Pill */}
        <div className="text-xs font-semibold text-theme mt-2 flex items-center justify-center gap-1.5">
          <span>IPTV Hesabı:</span>
          <span className="text-white bg-[#181824] px-3 py-0.5 rounded-full border border-[#262638]">
            {activeProfile?.name || 'Demo Hesabı'}
          </span>
        </div>

        {/* Status Text */}
        <div className="mt-8 mb-2.5 text-xs font-medium text-gray-400 animate-pulse">
          {statusText}
        </div>

        {/* Centered Theme-Colored Progress Bar */}
        <div className="w-full bg-[#181824] h-1.5 rounded-full overflow-hidden border border-[#262638]">
          <div
            className="h-full bg-theme rounded-full shadow-theme-glow transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {stats && (
          <div className="mt-6 flex items-center justify-center space-x-4 text-[11px] text-gray-400">
            <span>{stats.liveCount} Canlı Yayın</span>
            <span>•</span>
            <span>{stats.vodCount} Film</span>
            <span>•</span>
            <span>{stats.seriesCount} Dizi</span>
          </div>
        )}
      </div>
    </div>
  );
}
