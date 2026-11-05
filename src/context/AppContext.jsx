import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSoundEnabled, setSoundEnabled as saveSoundSetting } from '../utils/soundEngine';
import { t as translate } from '../utils/i18n';
import { fetchSeriesInfo, sanitizeId } from '../services/xtreamService';

export const THEMES = {
  purple: {
    id: 'purple',
    name: 'Purple (Mor)',
    accent: '#8B5CF6',
    hover: '#7C3AED',
    rgb: '139, 92, 246',
    glow: 'rgba(139, 92, 246, 0.45)',
    from: '#8B5CF6',
    to: '#6D28D9',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue (Mavi)',
    accent: '#3B82F6',
    hover: '#2563EB',
    rgb: '59, 130, 246',
    glow: 'rgba(59, 130, 246, 0.45)',
    from: '#3B82F6',
    to: '#1D4ED8',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald (Yeşil)',
    accent: '#10B981',
    hover: '#059669',
    rgb: '16, 185, 129',
    glow: 'rgba(16, 185, 129, 0.45)',
    from: '#10B981',
    to: '#047857',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson (Kırmızı)',
    accent: '#EF4444',
    hover: '#DC2626',
    rgb: '239, 68, 68',
    glow: 'rgba(239, 68, 68, 0.45)',
    from: '#EF4444',
    to: '#B91C1C',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight (Platin Gri)',
    accent: '#94A3B8',
    hover: '#64748B',
    rgb: '148, 163, 184',
    glow: 'rgba(148, 163, 184, 0.45)',
    from: '#94A3B8',
    to: '#475569',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset (Turuncu)',
    accent: '#F97316',
    hover: '#EA580C',
    rgb: '249, 115, 22',
    glow: 'rgba(249, 115, 22, 0.45)',
    from: '#F97316',
    to: '#C2410C',
  },
};

const AppContext = createContext();

export function AppProvider({ children }) {
  // Theme state
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('lx_theme') || 'purple';
  });

  // Initial Screen: ALWAYS 'profiles'
  const [currentScreen, setCurrentScreen] = useState('profiles');
  const [previousScreen, setPreviousScreen] = useState('dashboard');

  // Profiles: Clean initial state, no hardcoded profiles
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('lx_profiles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Profile: null initially until user selects or adds
  const [activeProfile, setActiveProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('lx_active_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Settings
  const [soundEnabled, setSoundEnabledState] = useState(isSoundEnabled);
  const [language, setLanguageState] = useState(() => localStorage.getItem('app_language') || localStorage.getItem('lx_lang') || 'tr');
  const [liveExtension, setLiveExtension] = useState(() => localStorage.getItem('lx_live_ext') || 'ts');
  const [userAgent, setUserAgent] = useState(() => localStorage.getItem('lx_user_agent') || 'IPTVSmarters');
  const [hardwareAccel, setHardwareAccel] = useState(() => localStorage.getItem('lx_hw_accel') !== 'false');
  const [showSubtitles, setShowSubtitles] = useState(() => localStorage.getItem('lx_show_subs') !== 'false');
  const [subSize, setSubSize] = useState(() => localStorage.getItem('lx_sub_size') || 'normal');
  const [subColor, setSubColor] = useState(() => localStorage.getItem('lx_sub_color') || 'white');
  const [autoRefreshOnStart, setAutoRefreshOnStart] = useState(() => localStorage.getItem('lx_auto_refresh') !== 'false');
  const [parentalPin, setParentalPin] = useState(() => localStorage.getItem('lx_parental_pin') || '0000');

  // Player State
  const [currentStream, setCurrentStream] = useState(null);
  const [streamType, setStreamType] = useState('live'); // 'live' | 'movie' | 'series'
  const [activeSeriesContext, setActiveSeriesContext] = useState(null);

  // Favorites, History, Continue Watching
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('lx_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [watchHistory, setWatchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('lx_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [continueWatching, setContinueWatching] = useState(() => {
    try {
      const saved = localStorage.getItem('lx_continue_watching');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Drawer & Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSpeedTestOpen, setIsSpeedTestOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [activeMovieDetail, setActiveMovieDetail] = useState(null);
  const [activeSeriesDetail, setActiveSeriesDetail] = useState(null);

  // Dynamic Theme CSS Variables Injection
  const applyTheme = (themeId) => {
    const t = THEMES[themeId] || THEMES.purple;
    const root = document.documentElement;

    root.style.setProperty('--lx-accent', t.accent);
    root.style.setProperty('--lx-accent-hover', t.hover);
    root.style.setProperty('--lx-accent-rgb', t.rgb);
    root.style.setProperty('--lx-accent-glow', t.glow);
    root.style.setProperty('--lx-gradient-from', t.from);
    root.style.setProperty('--lx-gradient-to', t.to);

    // Backward compatibility
    root.style.setProperty('--color-accent', t.accent);
    root.style.setProperty('--color-accent-hover', t.hover);
    root.style.setProperty('--color-glow', t.glow);
    root.style.setProperty('--color-gradient-from', t.from);
    root.style.setProperty('--color-gradient-to', t.to);
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('lx_theme', theme);
  }, [theme]);

  const setTheme = (themeId) => {
    if (THEMES[themeId]) {
      setThemeState(themeId);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    saveSoundSetting(next);
  };

  // Profile Management
  const saveProfile = (newProfile) => {
    setProfiles((prev) => {
      const existsIndex = prev.findIndex((p) => p.id === newProfile.id);
      let updated;
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = newProfile;
      } else {
        updated = [...prev, newProfile];
      }
      localStorage.setItem('lx_profiles', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteProfile = (profileId) => {
    setProfiles((prev) => {
      const updated = prev.filter((p) => p.id !== profileId);
      localStorage.setItem('lx_profiles', JSON.stringify(updated));
      return updated;
    });
    if (activeProfile?.id === profileId) {
      setActiveProfile(null);
      localStorage.removeItem('lx_active_profile');
      setCurrentScreen('profiles');
    }
  };

  const selectProfile = (profile) => {
    setActiveProfile(profile);
    localStorage.setItem('lx_active_profile', JSON.stringify(profile));
    setCurrentScreen('splash');
  };

  const selectDemoProfile = () => {
    const demo = {
      id: 'demo-profile',
      name: 'Açık Test Hesabı',
      username: 'demo_user',
      isDemo: true,
      expiryDate: 'Süresiz (Açık Test Yayınları)',
    };
    setActiveProfile(demo);
    localStorage.setItem('lx_active_profile', JSON.stringify(demo));
    setCurrentScreen('splash');
  };

  // Favorites Toggle
  const toggleFavorite = (streamId) => {
    setFavorites((prev) => {
      const exists = prev.includes(streamId);
      const updated = exists ? prev.filter((id) => id !== streamId) : [...prev, streamId];
      localStorage.setItem('lx_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Launch Player
  const playContent = (content, type = 'live', seriesContext = null) => {
    setPreviousScreen(currentScreen === 'player' ? 'dashboard' : currentScreen);
    const resolvedContext = seriesContext || content.seriesContext || null;
    const seriesId = sanitizeId(
      content.series_id ||
      content.parent_id ||
      content.seriesId ||
      resolvedContext?.series?.series_id ||
      resolvedContext?.series?.id
    );

    const episodesList = content.episodesList || resolvedContext?.episodesList || null;
    const sTitle = content.seriesTitle || content.series_title || resolvedContext?.series?.name || content.name;

    setCurrentStream({
      ...content,
      series_id: seriesId,
      seriesContext: resolvedContext,
      episodesList,
      seriesTitle: sTitle,
    });
    setStreamType(type);
    setActiveSeriesContext(resolvedContext);
    setCurrentScreen('player');

    // Add to history with series_id and seriesContext
    setWatchHistory((prev) => {
      const id = content.stream_id || content.id;
      const filtered = prev.filter((item) => (item.stream_id || item.id) !== id);
      const updated = [
        {
          stream_id: id,
          name: content.name || content.title,
          type,
          icon: content.stream_icon || content.image,
          timestamp: Date.now(),
          series_id: seriesId,
          parent_id: seriesId,
          seriesContext: resolvedContext,
          episodesList: episodesList,
        },
        ...filtered,
      ].slice(0, 30);
      localStorage.setItem('lx_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Open Player with explicit currentMedia, episodesList and seriesTitle
  const openPlayer = ({ currentMedia, episodesList = [], seriesTitle = '' }) => {
    if (!currentMedia) return;
    const isSeries = Boolean(
      currentMedia.type === 'series' ||
      currentMedia.series_id ||
      currentMedia.parent_id ||
      (episodesList && episodesList.length > 0)
    );
    const type = isSeries ? 'series' : (currentMedia.type || 'movie');
    const seriesId = sanitizeId(
      currentMedia.series_id ||
      currentMedia.parent_id ||
      currentMedia.seriesId ||
      currentMedia.id
    );

    const sTitle = seriesTitle || currentMedia.series_title || currentMedia.seriesName || currentMedia.name || 'Dizi';

    const seriesContext = isSeries
      ? {
          series: {
            name: sTitle,
            series_id: seriesId,
            id: seriesId,
            seasons: currentMedia.seriesContext?.series?.seasons || [],
          },
          episodesList: episodesList || [],
          currentEpisode: currentMedia.episode_num || currentMedia.episode_number,
          currentSeason: currentMedia.seasonNumber || currentMedia.season_number || 1,
        }
      : null;

    playContent(
      {
        ...currentMedia,
        series_id: isSeries ? seriesId : undefined,
        parent_id: isSeries ? seriesId : undefined,
        seriesTitle: sTitle,
        episodesList: episodesList || [],
      },
      type,
      seriesContext
    );
  };

  // Son İzlenenler veya Kaldığım Yerden Devam Et'ten dizi/içerik açıldığında tüm bölümleri getirme
  const handlePlayFromHistory = async (item) => {
    if (!item) return;

    const isSeries = item.type === 'series' || Boolean(item.series_id || item.parent_id);

    if (isSeries) {
      const cleanSeriesId = sanitizeId(item.series_id || item.parent_id || item.seriesId || item.id);
      let allEpisodes = [];
      let seriesTitle = item.series_title || item.seriesName || item.title || item.name || 'Dizi';

      // 1. Önce yerel önbellek / item içindeki hazır listelere bak
      if (item.episodesList && Array.isArray(item.episodesList) && item.episodesList.length > 0) {
        allEpisodes = item.episodesList;
      } else if (item.seriesContext?.episodesList && Array.isArray(item.seriesContext.episodesList) && item.seriesContext.episodesList.length > 0) {
        allEpisodes = item.seriesContext.episodesList;
      } else if (item.seriesContext?.series?.seasons) {
        const seasons = Array.isArray(item.seriesContext.series.seasons)
          ? item.seriesContext.series.seasons
          : Object.values(item.seriesContext.series.seasons);
        for (let sIdx = 0; sIdx < seasons.length; sIdx++) {
          const s = seasons[sIdx];
          const sNum = s.season_number || sIdx + 1;
          const eps = Array.isArray(s.episodes) ? s.episodes : Object.values(s.episodes || {});
          for (let eIdx = 0; eIdx < eps.length; eIdx++) {
            const ep = eps[eIdx];
            allEpisodes.push({
              ...ep,
              id: ep.id || ep.stream_id,
              seasonNumber: sNum,
              seasonName: s.name || `Sezon ${sNum}`,
              episode_num: ep.episode_num || ep.episode_number || (eIdx + 1),
              title: ep.title || `Bölüm ${ep.episode_num || (eIdx + 1)}`,
            });
          }
        }
      }

      // 2. Yoksa sunucudan serinin tüm sezon/bölümlerini çek
      if (allEpisodes.length === 0 && cleanSeriesId && activeProfile && !activeProfile.isDemo) {
        try {
          const data = await fetchSeriesInfo(activeProfile, cleanSeriesId);
          if (data) {
            seriesTitle = data.info?.name || seriesTitle;
            const rawEpisodes = data.episodes || {};
            let seasonsList = Array.isArray(data.seasons)
              ? data.seasons
              : Object.values(data.seasons || {});

            if (seasonsList.length === 0) {
              seasonsList = Object.keys(rawEpisodes).map((k) => ({
                season_number: parseInt(k, 10) || 1,
                name: `Sezon ${k}`,
              }));
            }

            for (let sIdx = 0; sIdx < seasonsList.length; sIdx++) {
              const s = seasonsList[sIdx];
              const sNum = s.season_number || sIdx + 1;
              const epListRaw = rawEpisodes[String(sNum)] || rawEpisodes[sNum] || [];
              const epList = Array.isArray(epListRaw) ? epListRaw : Object.values(epListRaw || {});
              for (let i = 0; i < epList.length; i++) {
                const ep = epList[i];
                allEpisodes.push({
                  ...ep,
                  id: ep.id || ep.stream_id,
                  seasonNumber: sNum,
                  seasonName: s.name || `Sezon ${sNum}`,
                  episode_num: ep.episode_num || ep.episode_number || (i + 1),
                  title: ep.title || `Bölüm ${ep.episode_num || (i + 1)}`,
                });
              }
            }
          }
        } catch (err) {
          console.warn('Error fetching series info in handlePlayFromHistory:', err);
        }
      }

      // 3. Oynatıcıyı allEpisodes listesi ile aç
      openPlayer({
        currentMedia: {
          ...item,
          type: 'series',
          series_id: cleanSeriesId,
          parent_id: cleanSeriesId,
          name: item.title || item.name,
        },
        episodesList: allEpisodes,
        seriesTitle: seriesTitle,
      });
    } else {
      playContent(item, item.type || 'movie');
    }
  };

  // Continue watching progress
  const updateContinueProgress = (content, currentSec, totalSec) => {
    if (!content || totalSec <= 0) return;
    const percent = Math.min(100, Math.round((currentSec / totalSec) * 100));
    const formatTime = (sec) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };
    const durationLabel = `${formatTime(currentSec)} / ${formatTime(totalSec)}`;
    const seriesId = sanitizeId(
      content.series_id ||
      content.parent_id ||
      content.seriesId ||
      activeSeriesContext?.series?.series_id ||
      activeSeriesContext?.series?.id
    );

    setContinueWatching((prev) => {
      const id = content.stream_id || content.id;
      const filtered = prev.filter((item) => (item.stream_id || item.id) !== id);
      const updated = [
        {
          id: `cw-${id}`,
          stream_id: id,
          type: streamType,
          title: content.name || content.title,
          durationLabel,
          percent,
          image: content.stream_icon || content.image || content.backdrop,
          url: content.url,
          rating: content.rating,
          year: content.year,
          series_id: seriesId,
          parent_id: seriesId,
          seriesContext: activeSeriesContext,
          episodesList: content.episodesList || activeSeriesContext?.episodesList || null,
        },
        ...filtered,
      ].slice(0, 10);
      localStorage.setItem('lx_continue_watching', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setWatchHistory([]);
    localStorage.removeItem('lx_history');
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        currentScreen,
        setCurrentScreen,
        previousScreen,
        profiles,
        activeProfile,
        saveProfile,
        deleteProfile,
        selectProfile,
        selectDemoProfile,
        soundEnabled,
        toggleSound,
        language,
        setLanguage: (lang) => {
          setLanguageState(lang);
          localStorage.setItem('app_language', lang);
          localStorage.setItem('lx_lang', lang);
        },
        t: (key) => translate(key, language),
        liveExtension,
        setLiveExtension: (ext) => {
          setLiveExtension(ext);
          localStorage.setItem('lx_live_ext', ext);
        },
        userAgent,
        setUserAgent: (ua) => {
          setUserAgent(ua);
          localStorage.setItem('lx_user_agent', ua);
        },
        hardwareAccel,
        setHardwareAccel: (hw) => {
          setHardwareAccel(hw);
          localStorage.setItem('lx_hw_accel', hw ? 'true' : 'false');
        },
        showSubtitles,
        setShowSubtitles: (sub) => {
          setShowSubtitles(sub);
          localStorage.setItem('lx_show_subs', sub ? 'true' : 'false');
        },
        subSize,
        setSubSize: (sz) => {
          setSubSize(sz);
          localStorage.setItem('lx_sub_size', sz);
        },
        subColor,
        setSubColor: (col) => {
          setSubColor(col);
          localStorage.setItem('lx_sub_color', col);
        },
        autoRefreshOnStart,
        setAutoRefreshOnStart: (ar) => {
          setAutoRefreshOnStart(ar);
          localStorage.setItem('lx_auto_refresh', ar ? 'true' : 'false');
        },
        parentalPin,
        setParentalPin: (pin) => {
          setParentalPin(pin);
          localStorage.setItem('lx_parental_pin', pin);
        },
        currentStream,
        streamType,
        activeSeriesContext,
        playContent,
        openPlayer,
        handlePlayFromHistory,
        updateContinueProgress,
        favorites,
        toggleFavorite,
        watchHistory,
        clearHistory,
        continueWatching,
        isDrawerOpen,
        setIsDrawerOpen,
        isSpeedTestOpen,
        setIsSpeedTestOpen,
        isPinModalOpen,
        setIsPinModalOpen,
        isUpdateModalOpen,
        setIsUpdateModalOpen,
        isAboutModalOpen,
        setIsAboutModalOpen,
        activeMovieDetail,
        setActiveMovieDetail,
        activeSeriesDetail,
        setActiveSeriesDetail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
