import React from 'react';
import { Plus, Play, Pencil, Trash2 } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';
import { useApp } from '../context/AppContext';

export default function ProfileSelectionScreen() {
  const { t, profiles, deleteProfile, selectProfile, selectDemoProfile, setCurrentScreen } = useApp();

  const handleSelect = (profile) => {
    playClickSound();
    selectProfile(profile);
  };

  const handleAddNew = () => {
    playClickSound();
    setCurrentScreen('login');
  };

  const handleDemo = () => {
    playClickSound();
    selectDemoProfile();
  };

  const handleDelete = (e, profileId) => {
    e.stopPropagation();
    playClickSound();
    if (confirm(t('profiles.deleteConfirm'))) {
      deleteProfile(profileId);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden select-none bg-[#09090D]">
      {/* Symmetrical Centered Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-radial-ambient pointer-events-none" />

      {/* Main Logo & Header */}
      <div className="text-center z-10 mb-12 flex flex-col items-center">
        <div className="relative mb-5 group">
          <div className="absolute -inset-4 rounded-full blur-2xl group-hover:opacity-100 opacity-70 transition-all duration-500" style={{ backgroundColor: 'var(--lx-accent-glow)' }} />
          <img
            src="./logo1.png"
            alt="LxPlayer Logo"
            className="w-24 h-24 object-contain relative drop-shadow-[0_0_20px_var(--lx-accent-glow)] transform group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = './logo.svg';
            }}
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
          {t('profiles.title')}
        </h1>
        <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-lg font-medium">
          {t('profiles.desc')}
        </p>
      </div>

      {/* Profiles Cards Grid */}
      <div className="z-10 flex flex-wrap items-center justify-center gap-7 max-w-6xl">
        {/* If user has saved profiles, show them first */}
        {profiles.length > 0 &&
          profiles.map((prof) => (
            <div
              key={prof.id}
              onClick={() => handleSelect(prof)}
              onMouseEnter={playHoverSound}
              className="w-72 h-80 rounded-2xl p-6 bg-[#13131A]/90 hover:bg-[#181824] border border-[#262638] hover:border-theme transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-xl hover:shadow-theme-glow transform hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Top Bar inside card */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-bold text-theme bg-theme-soft border border-theme-soft px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {prof.type === 'm3u' ? 'M3U' : 'XTREAM'}
                </span>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playClickSound();
                      setCurrentScreen('login');
                    }}
                    onMouseEnter={playHoverSound}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#262638] transition-colors"
                    title={t('common.search')}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, prof.id)}
                    onMouseEnter={playHoverSound}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title={t('settings.deleteProfile')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Avatar & Name */}
              <div className="flex flex-col items-center text-center my-auto">
                <div className="w-20 h-20 rounded-full p-1 ring-2 ring-theme ring-offset-4 ring-offset-[#13131A] shadow-theme-glow group-hover:scale-105 transition-transform duration-300 mb-4">
                  <div className="w-full h-full rounded-full bg-theme flex items-center justify-center text-white font-black text-2xl tracking-wider">
                    {prof.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white group-hover:text-theme transition-colors">
                  {prof.name}
                </h2>
                <p className="text-xs text-gray-400 mt-1">@{prof.username || 'iptv_user'}</p>
              </div>

              {/* Bottom Expiry Tag */}
              <div className="w-full pt-3 border-t border-[#262638]/70 flex items-center justify-center space-x-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{prof.expiryDate || t('profiles.activeSub')}</span>
              </div>
            </div>
          ))}

        {/* 1. [ + ] "Yeni Hesap Ekle" (Turuncu vurgulu kart) */}
        <div
          onClick={handleAddNew}
          onMouseEnter={playHoverSound}
          className="w-72 h-80 rounded-2xl p-6 bg-[#13131A]/70 hover:bg-[#181824] border-2 border-dashed border-orange-500/50 hover:border-orange-500 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center group shadow-xl hover:shadow-[0_12px_35px_-8px_rgba(249,115,22,0.35)] transform hover:-translate-y-2"
        >
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-orange-400/80 flex items-center justify-center text-orange-400 group-hover:scale-110 group-hover:bg-orange-500/10 transition-all duration-300 mb-5 shadow-sm">
            <Plus size={36} strokeWidth={2.4} />
          </div>
          <h2 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
            {t('profiles.addNew')}
          </h2>
          <p className="text-xs text-gray-400 mt-2 px-3 leading-relaxed">
            {t('profiles.addNewDesc')}
          </p>
          <span className="mt-4 px-3 py-1 rounded-full text-[11px] font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20">
            {t('profiles.xtreamM3u')}
          </span>
        </div>

        {/* 2. [ ▶ ] "Demo Hesabı" (Mavi vurgulu kart - şifresiz doğrudan açık test yayınlarına girer) */}
        <div
          onClick={handleDemo}
          onMouseEnter={playHoverSound}
          className="w-72 h-80 rounded-2xl p-6 bg-[#13131A]/70 hover:bg-[#181824] border border-[#262638] hover:border-blue-500 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center group shadow-xl hover:shadow-[0_12px_35px_-8px_rgba(59,130,246,0.35)] transform hover:-translate-y-2"
        >
          <div className="w-20 h-20 rounded-full bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 mb-5 shadow-glow-sm">
            <Play size={32} className="fill-current ml-1" />
          </div>
          <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
            {t('profiles.demo')}
          </h2>
          <p className="text-xs text-blue-300 font-semibold mt-1">
            {t('profiles.demoSubtitle')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 px-3 leading-relaxed">
            {t('profiles.demoDesc')}
          </p>
          <span className="mt-4 px-3 py-1 rounded-full text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {t('profiles.directWatch')}
          </span>
        </div>
      </div>
    </div>
  );
}
