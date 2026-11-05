import React, { useState } from 'react';
import {
  Menu,
  Home,
  Tv,
  Film,
  Clapperboard,
  Settings,
  RefreshCw,
  Gauge,
} from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';
import { useApp } from '../context/AppContext';
import { clearAllCache } from '../services/xtreamService';

export default function DesktopNavbar() {
  const {
    currentScreen,
    setCurrentScreen,
    activeProfile,
    setIsDrawerOpen,
    setIsSpeedTestOpen,
    t,
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const navTabs = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Home },
    { id: 'livetv', label: t('nav.livetv'), icon: Tv },
    { id: 'movies', label: t('nav.movies'), icon: Film },
    { id: 'series', label: t('nav.series'), icon: Clapperboard },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const handleRefresh = async () => {
    playClickSound();
    setIsRefreshing(true);
    await clearAllCache();
    setTimeout(() => {
      setIsRefreshing(false);
      alert('Kütüphane dizinleri başarıyla eşitlendi.');
    }, 800);
  };

  return (
    <header className="h-14 w-full bg-[#0D0D14]/95 border-b border-[#262638] backdrop-blur-xl px-5 flex items-center justify-between select-none z-30 flex-shrink-0">
      {/* Sol: Menü Butonu & Marka */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => {
            playClickSound();
            setIsDrawerOpen(true);
          }}
          onMouseEnter={playHoverSound}
          className="w-9 h-9 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#262638] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          title="Gelişmiş Menü"
        >
          <Menu size={18} />
        </button>

        <div
          onClick={() => {
            playClickSound();
            setCurrentScreen('dashboard');
          }}
          onMouseEnter={playHoverSound}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <img
            src="./logo1.png"
            alt="LxPlayer"
            className="w-7 h-7 object-contain drop-shadow-[0_0_8px_var(--lx-accent-glow)] group-hover:scale-105 transition-transform"
            onError={(e) => {
              e.currentTarget.src = './logo.svg';
            }}
          />
          <span className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
            LxPlayer{' '}
            <span className="text-[10px] font-bold text-theme bg-theme-soft border border-theme-soft px-1.5 py-0.2 rounded">
              PRO
            </span>
          </span>
        </div>
      </div>

      {/* Orta: Steam / Netflix Masaüstü Navigasyon Sekmeleri */}
      <nav className="flex items-center space-x-1.5">
        {navTabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setCurrentScreen(tab.id);
              }}
              onMouseEnter={playHoverSound}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                isActive
                  ? 'pill-theme-active'
                  : 'text-gray-400 hover:text-white hover:bg-[#181824]'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-white' : 'text-gray-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sağ: Araçlar & Profil Rozeti */}
      <div className="flex items-center space-x-2.5">
        {/* Hız Testi Kısayolu */}
        <button
          onClick={() => {
            playClickSound();
            setIsSpeedTestOpen(true);
          }}
          onMouseEnter={playHoverSound}
          className="w-8 h-8 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#262638] flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors"
          title="Ağ Hız Testi"
        >
          <Gauge size={15} />
        </button>

        {/* Kütüphane Yenile */}
        <button
          onClick={handleRefresh}
          onMouseEnter={playHoverSound}
          className="w-8 h-8 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#262638] flex items-center justify-center text-gray-400 hover:text-theme transition-colors group"
          title="Kütüphaneyi Yenile"
        >
          <RefreshCw
            size={14}
            className={`transition-transform duration-500 ${
              isRefreshing ? 'animate-spin text-theme' : 'group-hover:rotate-180'
            }`}
          />
        </button>

        {/* Profil Seç / Rozet */}
        <div
          onClick={() => {
            playClickSound();
            setCurrentScreen('profiles');
          }}
          onMouseEnter={playHoverSound}
          className="flex items-center space-x-2 bg-[#181824] hover:bg-[#222236] border border-[#262638] hover:border-theme px-2.5 py-1 rounded-xl cursor-pointer transition-all ml-1"
          title="Hesap Değiştir"
        >
          <div className="w-5 h-5 rounded-full bg-theme flex items-center justify-center text-white font-bold text-[10px] shadow-theme-glow">
            {activeProfile?.name ? activeProfile.name.slice(0, 1).toUpperCase() : 'D'}
          </div>
          <span className="text-xs font-semibold text-white max-w-[110px] truncate">
            {activeProfile?.name || 'Hesap Seç'}
          </span>
          {activeProfile?.isDemo && (
            <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1 rounded">
              DEMO
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
