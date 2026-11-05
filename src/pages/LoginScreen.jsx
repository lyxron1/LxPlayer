import React, { useState } from 'react';
import { Eye, EyeOff, Server, User, KeyRound, Tag, ArrowLeft, Play, Sparkles, Trash2, Pencil } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';
import { useApp } from '../context/AppContext';
import { authenticateXtream } from '../services/xtreamService';

export default function LoginScreen() {
  const { setCurrentScreen, saveProfile, selectProfile, selectDemoProfile, profiles, deleteProfile } = useApp();

  const [authMode, setAuthMode] = useState('xtream'); // 'xtream' | 'm3u'
  const [profileName, setProfileName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [m3uUrl, setM3uUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClickSound();
    setErrorMsg('');

    if (!profileName.trim()) {
      setErrorMsg('Lütfen bir profil adı belirleyin');
      return;
    }

    if (authMode === 'xtream') {
      if (!username.trim() || !password.trim() || !serverUrl.trim()) {
        setErrorMsg('Lütfen tüm Xtream alanlarını doldurun');
        return;
      }

      setIsLoading(true);
      try {
        try {
          await authenticateXtream(serverUrl, username, password);
        } catch (authErr) {
          console.warn('Direct auth check notice (saving profile for playback):', authErr);
        }

        const newProf = {
          id: `prof-${Date.now()}`,
          name: profileName.trim(),
          username: username.trim(),
          password: password.trim(),
          serverUrl: serverUrl.trim(),
          type: 'xtream',
          expiryDate: 'Aktif Abonelik',
        };

        saveProfile(newProf);
        selectProfile(newProf);
      } catch (err) {
        setErrorMsg(err.message || 'Giriş yapılamadı!');
      } finally {
        setIsLoading(false);
      }
    } else {
      // M3U Playlist Mode
      if (!m3uUrl.trim()) {
        setErrorMsg('Lütfen M3U URL bağlantısını girin');
        return;
      }
      const newProf = {
        id: `prof-${Date.now()}`,
        name: profileName.trim(),
        username: 'm3u_user',
        serverUrl: m3uUrl.trim(),
        type: 'm3u',
        expiryDate: 'M3U Playlist',
      };
      saveProfile(newProf);
      selectProfile(newProf);
    }
  };

  const handleDemo = () => {
    playClickSound();
    selectDemoProfile();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center relative select-none bg-[#09090D]">
      {/* Symmetrical Centered Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-radial-ambient pointer-events-none" />

      {/* Back button */}
      <button
        onClick={() => {
          playClickSound();
          setCurrentScreen('profiles');
        }}
        onMouseEnter={playHoverSound}
        className="absolute top-6 left-6 z-20 flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-white bg-[#13131A] border border-[#262638] px-3.5 py-2 rounded-xl transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Geri Dön</span>
      </button>

      {/* Login Card */}
      <div className="w-full max-w-lg bg-[#13131A]/95 border border-[#262638] rounded-3xl p-8 z-10 shadow-2xl backdrop-blur-xl relative my-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2.5 mb-2">
            <img
              src="./logo1.png"
              alt="Logo"
              className="w-9 h-9 object-contain drop-shadow-[0_0_12px_var(--lx-accent-glow)]"
              onError={(e) => {
                e.currentTarget.src = './logo.svg';
              }}
            />
            <h1 className="text-2xl font-black text-white tracking-wide">Hesap Tanımla</h1>
          </div>
          <p className="text-xs text-gray-400">
            IPTV sağlayıcınızdan aldığınız bilgileri girerek içeriklerinizi eşitleyin
          </p>
        </div>

        {/* Segmented Control */}
        <div className="grid grid-cols-2 p-1 bg-[#09090D] border border-[#262638] rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setAuthMode('xtream');
            }}
            onMouseEnter={playHoverSound}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              authMode === 'xtream'
                ? 'pill-theme-active'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Xtream Codes API
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setAuthMode('m3u');
            }}
            onMouseEnter={playHoverSound}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              authMode === 'm3u'
                ? 'pill-theme-active'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            M3U Playlist
          </button>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Profil Adı (Takma Ad)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Tag size={16} />
              </div>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Örn: Evim, Kişisel Hesap"
                className="w-full pl-10 pr-4 py-3 bg-[#14141C] border border-[#262638] focus:border-theme rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {authMode === 'xtream' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Kullanıcı Adı (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Kullanıcı adınızı girin"
                    className="w-full pl-10 pr-4 py-3 bg-[#14141C] border border-[#262638] focus:border-theme rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Şifre (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifrenizi girin"
                    className="w-full pl-10 pr-11 py-3 bg-[#14141C] border border-[#262638] focus:border-theme rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Sunucu URL Adresi (Server URL)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Server size={16} />
                  </div>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="http://sunucuadresi.com:8080"
                    className="w-full pl-10 pr-4 py-3 bg-[#14141C] border border-[#262638] focus:border-theme rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                M3U / M3U8 URL Bağlantısı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Server size={16} />
                </div>
                <input
                  type="text"
                  value={m3uUrl}
                  onChange={(e) => setM3uUrl(e.target.value)}
                  placeholder="http://sunucu.com/get.php?username=...&type=m3u_plus"
                  className="w-full pl-10 pr-4 py-3 bg-[#14141C] border border-[#262638] focus:border-theme rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            onMouseEnter={playHoverSound}
            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-theme hover:bg-theme-hover text-white font-bold text-sm tracking-wide shadow-theme-glow flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Eşitleniyor...</span>
              </span>
            ) : (
              <span>Giriş Yap ve Eşitle</span>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleDemo}
            onMouseEnter={playHoverSound}
            className="text-xs text-theme hover:underline font-semibold inline-flex items-center space-x-1.5"
          >
            <Play size={12} className="fill-current" />
            <span>Giriş yapmadan Açık Test Yayınlarını İzle</span>
          </button>
        </div>

        {profiles.length > 0 && (
          <div className="mt-6 pt-5 border-t border-[#262638]">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
              Kayıtlı Profiller ({profiles.length})
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  onClick={() => selectProfile(p)}
                  onMouseEnter={playHoverSound}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#262638] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-theme flex items-center justify-center text-white font-bold text-xs">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-theme">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-gray-400">@{p.username}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setProfileName(p.name);
                        setUsername(p.username || '');
                        setServerUrl(p.serverUrl || '');
                      }}
                      className="p-1 text-gray-400 hover:text-white rounded"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => deleteProfile(p.id)}
                      className="p-1 text-gray-400 hover:text-red-400 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
