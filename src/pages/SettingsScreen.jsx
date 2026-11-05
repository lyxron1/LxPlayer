import React from 'react';
import {
  Globe,
  Palette,
  Volume2,
  Tv,
  Subtitles,
  Database,
  Users,
  Check,
  RotateCcw,
  Sparkles,
  Shield,
  Trash2,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';
import { useApp, THEMES } from '../context/AppContext';
import { clearAllCache } from '../services/xtreamService';

export default function SettingsScreen() {
  const {
    t,
    theme,
    setTheme,
    soundEnabled,
    toggleSound,
    language,
    setLanguage,
    liveExtension,
    setLiveExtension,
    userAgent,
    setUserAgent,
    hardwareAccel,
    setHardwareAccel,
    setCurrentScreen,
    activeProfile,
    deleteProfile,
  } = useApp();

  const handleClearCache = async () => {
    playClickSound();
    await clearAllCache();
    alert(t('settings.cacheCleared'));
  };

  const handleRefreshNow = async () => {
    playClickSound();
    await clearAllCache();
    alert(t('settings.libraryRefreshed'));
  };

  const handleDeleteActiveProfile = () => {
    playClickSound();
    if (activeProfile?.isDemo) {
      alert(t('settings.demoDeleteError'));
      return;
    }
    if (activeProfile && confirm(`"${activeProfile.name}" ${t('settings.deleteProfileConfirm')}`)) {
      deleteProfile(activeProfile.id);
      setCurrentScreen('profiles');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto select-none p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="pb-4 border-b border-[#262638]">
        <h1 className="text-2xl font-black text-white tracking-wide">{t('settings.title')}</h1>
        <p className="text-xs text-gray-400 mt-1">
          {t('settings.desc')}
        </p>
      </div>

      {/* 1. Görünüm & Tema Seçimi (6 Renk Preset) */}
      <div className="bg-[#13131A] border border-[#262638] rounded-2xl p-5 shadow-lg">
        <div className="flex items-center space-x-2.5 mb-2">
          <Palette size={18} className="text-theme" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {t('settings.theme')}
          </h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          {t('settings.themeDesc')}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.values(THEMES).map((tTheme) => {
            const isSelected = theme === tTheme.id;
            return (
              <div
                key={tTheme.id}
                onClick={() => {
                  playClickSound();
                  setTheme(tTheme.id);
                }}
                onMouseEnter={playHoverSound}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center group ${
                  isSelected
                    ? 'bg-[#181824] border-white shadow-theme-glow'
                    : 'bg-[#181824]/60 border-[#262638] hover:border-gray-500'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full mb-2 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${tTheme.accent}, ${tTheme.hover})`,
                    boxShadow: `0 0 14px ${tTheme.glow}`,
                  }}
                >
                  {isSelected && <Check size={18} className="text-white drop-shadow" />}
                </div>
                <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                  {tTheme.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Dil Seçimi */}
      <div className="bg-[#13131A] border border-[#262638] rounded-2xl p-5 shadow-lg">
        <div className="flex items-center space-x-2.5 mb-4">
          <Globe size={18} className="text-blue-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {t('settings.language')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'tr', title: 'Türkçe (Türkiye)', desc: 'Varsayılan Türkçe arayüz' },
            { id: 'en', title: 'English (US / UK)', desc: 'English localized interface' },
          ].map((lang) => (
            <div
              key={lang.id}
              onClick={() => {
                playClickSound();
                setLanguage(lang.id);
              }}
              onMouseEnter={playHoverSound}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                language === lang.id
                  ? 'bg-theme-soft border-theme text-white'
                  : 'bg-[#181824] border-[#262638] text-gray-400 hover:text-white'
              }`}
            >
              <div>
                <div className="text-xs font-bold">{lang.title}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{lang.desc}</div>
              </div>
              {language === lang.id && <Check size={16} className="text-theme" />}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Ses Motoru & UI Efektleri */}
      <div className="bg-[#13131A] border border-[#262638] rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-theme-soft border border-theme-soft flex items-center justify-center text-theme">
              <Volume2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {t('settings.sound')}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {t('settings.soundDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              toggleSound();
            }}
            onMouseEnter={playHoverSound}
            className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
              soundEnabled ? 'bg-theme justify-end' : 'bg-[#262638] justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* 4. Oynatıcı Ayarları */}
      <div className="bg-[#13131A] border border-[#262638] rounded-2xl p-5 shadow-lg">
        <div className="flex items-center space-x-2.5 mb-4">
          <Tv size={18} className="text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {t('settings.playerParams')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#181824] p-3.5 rounded-xl border border-[#262638]">
            <label className="text-xs font-semibold text-gray-300 block mb-2">
              {t('settings.streamExt')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['ts', 'm3u8'].map((ext) => (
                <button
                  key={ext}
                  onClick={() => {
                    playClickSound();
                    setLiveExtension(ext);
                  }}
                  onMouseEnter={playHoverSound}
                  className={`py-2 rounded-lg text-xs font-bold uppercase transition-colors ${
                    liveExtension === ext
                      ? 'pill-theme-active'
                      : 'bg-[#13131A] text-gray-400 hover:text-white border border-[#262638]'
                  }`}
                >
                  .{ext} {ext === 'ts' ? `(${t('settings.faster')})` : `(${t('settings.hlsStream')})`}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#181824] p-3.5 rounded-xl border border-[#262638]">
            <label className="text-xs font-semibold text-gray-300 block mb-2">
              {t('settings.userAgent')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['IPTVSmarters', 'VLC', 'ExoPlayer'].map((ua) => (
                <button
                  key={ua}
                  onClick={() => {
                    playClickSound();
                    setUserAgent(ua);
                  }}
                  onMouseEnter={playHoverSound}
                  className={`py-2 rounded-lg text-[11px] font-bold transition-colors ${
                    userAgent === ua
                      ? 'pill-theme-active'
                      : 'bg-[#13131A] text-gray-400 hover:text-white border border-[#262638]'
                  }`}
                >
                  {ua}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#181824] p-3.5 rounded-xl border border-[#262638] flex items-center justify-between md:col-span-2">
            <div>
              <div className="text-xs font-bold text-white">{t('settings.gpuAccel')}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {t('settings.gpuAccelDesc')}
              </div>
            </div>
            <button
              onClick={() => {
                playClickSound();
                setHardwareAccel(!hardwareAccel);
              }}
              onMouseEnter={playHoverSound}
              className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                hardwareAccel ? 'bg-theme justify-end' : 'bg-[#262638] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. 12 Saatlik Veri ve Önbellek */}
      <div className="bg-[#13131A] border border-[#262638] rounded-2xl p-5 shadow-lg">
        <div className="flex items-center space-x-2.5 mb-2">
          <Database size={18} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {t('settings.cacheTitle')}
          </h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          {t('settings.cacheDesc')}
        </p>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefreshNow}
            onMouseEnter={playHoverSound}
            className="flex-1 py-2.5 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#262638] hover:border-theme text-gray-200 hover:text-white text-xs font-bold transition-colors"
          >
            {t('settings.refreshNow')}
          </button>
          <button
            onClick={handleClearCache}
            onMouseEnter={playHoverSound}
            className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-colors"
          >
            {t('settings.clearCache')}
          </button>
        </div>
      </div>

      {/* 6. Hesap & Profil Yönetimi */}
      <div className="bg-[#13131A] border border-[#262638] rounded-2xl p-5 shadow-lg">
        <div className="flex items-center space-x-2.5 mb-4">
          <Users size={18} className="text-theme" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {t('settings.accountMgmt')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => {
              playClickSound();
              setCurrentScreen('profiles');
            }}
            onMouseEnter={playHoverSound}
            className="py-2.5 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#262638] text-gray-200 hover:text-white text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
          >
            <Users size={14} />
            <span>{t('settings.switchAccount')}</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setCurrentScreen('login');
            }}
            onMouseEnter={playHoverSound}
            className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center space-x-1.5"
          >
            <UserPlus size={14} />
            <span>{t('settings.addNewAccount')}</span>
          </button>

          <button
            onClick={handleDeleteActiveProfile}
            onMouseEnter={playHoverSound}
            disabled={activeProfile?.isDemo}
            className="py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-40"
          >
            <Trash2 size={14} />
            <span>{t('settings.deleteProfile')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
