import React from 'react';
import {
  X,
  Users,
  Radio,
  Trash2,
  ListVideo,
  Settings,
  Lock,
  Globe,
  Gauge,
  RefreshCw,
  Info,
  LogOut,
} from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';
import { useApp } from '../context/AppContext';

export default function SidebarDrawer() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    activeProfile,
    setCurrentScreen,
    clearHistory,
    setIsSpeedTestOpen,
    setIsPinModalOpen,
    setIsUpdateModalOpen,
    setIsAboutModalOpen,
    language,
    setLanguage,
    t,
  } = useApp();

  if (!isDrawerOpen) return null;

  const navigateTo = (screen) => {
    playClickSound();
    setIsDrawerOpen(false);
    setCurrentScreen(screen);
  };

  return (
    <div className="fixed inset-0 z-50 flex select-none">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in transition-opacity"
        onClick={() => {
          playClickSound();
          setIsDrawerOpen(false);
        }}
      />

      <div className="relative w-80 max-w-[85vw] h-full bg-[#0D0D14]/95 border-r border-[#262638] flex flex-col z-10 shadow-2xl backdrop-blur-xl animate-fade-in overflow-hidden">
        {/* Header / Profile Card */}
        <div className="p-5 border-b border-[#262638] bg-gradient-to-b from-[#181824] to-transparent relative">
          <button
            onClick={() => {
              playClickSound();
              setIsDrawerOpen(false);
            }}
            onMouseEnter={playHoverSound}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#262638] transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-theme p-0.5 shadow-theme-glow">
              <div className="w-full h-full bg-[#13131A] rounded-2xl flex items-center justify-center text-theme font-bold text-lg">
                {activeProfile?.name ? activeProfile.name.slice(0, 2).toUpperCase() : 'LX'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-sm tracking-wide">
                  {activeProfile?.name || 'Demo Hesabı'}
                </h3>
                <span className="text-[9px] font-bold text-theme bg-theme-soft border border-theme-soft px-1.5 py-0.2 rounded">
                  {activeProfile?.isDemo ? 'DEMO' : 'XTREAM'}
                </span>
              </div>
              <div className="text-[11px] text-gray-400">
                @{activeProfile?.username || 'demo'}
              </div>
              <div className="mt-1 flex items-center space-x-1 text-[10px] font-medium text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{activeProfile?.expiryDate || 'Aktif'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Menu Items */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
          <div>
            <div className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Medya & Araçlar
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => navigateTo('profiles')}
                onMouseEnter={playHoverSound}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#181824] transition-colors group"
              >
                <Users size={16} className="text-theme group-hover:scale-110 transition-transform" />
                <span>{t('nav.profiles')}</span>
              </button>

              <button
                onClick={() => navigateTo('livetv')}
                onMouseEnter={playHoverSound}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#181824] transition-colors group"
              >
                <Radio size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span>{t('nav.livetv')}</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  clearHistory();
                  alert(language === 'en' ? 'Watch history cleared.' : 'İzleme geçmişi temizlendi.');
                }}
                onMouseEnter={playHoverSound}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#181824] transition-colors group"
              >
                <Trash2 size={16} className="text-red-400 group-hover:scale-110 transition-transform" />
                <span>{language === 'en' ? 'Clear History' : 'Geçmişi Temizle'}</span>
              </button>

              <button
                onClick={() => navigateTo('login')}
                onMouseEnter={playHoverSound}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#181824] transition-colors group"
              >
                <ListVideo size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>{language === 'en' ? 'Playlist (M3U / Xtream)' : 'Oynatma Listesi (M3U / Xtream)'}</span>
              </button>
            </div>
          </div>

          <div>
            <div className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              {language === 'en' ? 'Settings Group' : 'Ayarlar Grubu'}
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => navigateTo('settings')}
                onMouseEnter={playHoverSound}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#181824] transition-colors group"
              >
                <Settings size={16} className="text-theme group-hover:scale-110 transition-transform" />
                <span>{t('nav.settings')}</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setIsDrawerOpen(false);
                  setIsPinModalOpen(true);
                }}
                onMouseEnter={playHoverSound}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#181824] transition-colors group"
              >
                <Lock size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <span>{t('nav.parental')}</span>
              </button>

              <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-300">
                <span className="flex items-center space-x-3">
                  <Globe size={16} className="text-emerald-400" />
                  <span>{t('settings.language')}</span>
                </span>
                <button
                  onClick={() => {
                    playClickSound();
                    setLanguage(language === 'tr' ? 'en' : 'tr');
                  }}
                  onMouseEnter={playHoverSound}
                  className="bg-[#181824] border border-[#262638] text-[11px] font-bold px-2 py-0.5 rounded-lg text-theme hover:border-theme"
                >
                  {language === 'tr' ? 'TR (Türkçe)' : 'EN (English)'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Lx Player
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  playClickSound();
                  setIsDrawerOpen(false);
                  setIsSpeedTestOpen(true);
                }}
                onMouseEnter={playHoverSound}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#181824] transition-colors group"
              >
                <Gauge size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>{t('nav.speedtest')}</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setIsDrawerOpen(false);
                  setIsAboutModalOpen(true);
                }}
                onMouseEnter={playHoverSound}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#181824] transition-colors group"
              >
                <Info size={16} className="text-theme group-hover:scale-110 transition-transform" />
                <span>{t('nav.about')}</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setIsDrawerOpen(false);
                  setIsAboutModalOpen(true);
                }}
                onMouseEnter={playHoverSound}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#181824] transition-colors group"
              >
                <Info size={16} className="text-theme group-hover:scale-110 transition-transform" />
                <span>Hakkımızda</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setIsDrawerOpen(false);
                  setCurrentScreen('profiles');
                }}
                onMouseEnter={playHoverSound}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors group"
              >
                <LogOut size={16} className="text-red-400 group-hover:translate-x-0.5 transition-transform" />
                <span>Hesaptan Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
