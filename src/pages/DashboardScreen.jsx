import React, { useState, useEffect } from 'react';
import {
  Tv,
  Film,
  Clapperboard,
  Play,
  Heart,
  Clock,
  Sparkles,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';
import { useApp } from '../context/AppContext';
import { fetchLiveStreams, fetchMovies, fetchSeries, sanitizeId } from '../services/xtreamService';

export default function DashboardScreen() {
  const {
    activeProfile,
    setCurrentScreen,
    continueWatching,
    watchHistory,
    playContent,
    handlePlayFromHistory,
    favorites,
    toggleFavorite,
    setActiveMovieDetail,
    setActiveSeriesDetail,
    t,
  } = useApp();

  const [liveCount, setLiveCount] = useState(0);
  const [vodCount, setVodCount] = useState(0);
  const [seriesCount, setSeriesCount] = useState(0);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStatsAndFavorites() {
      setIsLoading(true);
      const [l, m, s] = await Promise.all([
        fetchLiveStreams(activeProfile),
        fetchMovies(activeProfile),
        fetchSeries(activeProfile),
      ]);

      if (!isMounted) return;

      setLiveCount(l?.length || 0);
      setVodCount(m?.length || 0);
      setSeriesCount(s?.length || 0);

      // Collect favorite items across all types
      const favList = [];
      const favSet = new Set(favorites.map((f) => sanitizeId(f)));

      if (Array.isArray(l)) {
        l.forEach((item) => {
          if (favSet.has(sanitizeId(item.stream_id || item.id))) {
            favList.push({ ...item, type: 'live' });
          }
        });
      }
      if (Array.isArray(m)) {
        m.forEach((item) => {
          if (favSet.has(sanitizeId(item.stream_id || item.id))) {
            favList.push({ ...item, type: 'movie' });
          }
        });
      }
      if (Array.isArray(s)) {
        s.forEach((item) => {
          if (favSet.has(sanitizeId(item.series_id || item.id))) {
            favList.push({ ...item, type: 'series' });
          }
        });
      }
      setFavoriteItems(favList);
      setIsLoading(false);
    }

    loadStatsAndFavorites();

    return () => {
      isMounted = false;
    };
  }, [activeProfile, favorites]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto select-none p-6 lg:p-8 space-y-8">
      {/* 1. Bento İstatistik Sayaçları (Canlı TV, Filmler, Diziler) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Canlı TV Box */}
        <div
          onClick={() => {
            playClickSound();
            setCurrentScreen('livetv');
          }}
          onMouseEnter={playHoverSound}
          className="bg-[#13131A] hover:bg-[#181824] border border-[#262638] hover:border-theme rounded-2xl p-6 cursor-pointer transition-all duration-300 group shadow-lg hover:shadow-theme-glow transform hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-theme-soft border border-theme-soft flex items-center justify-center text-theme group-hover:bg-theme group-hover:text-white transition-colors">
              <Tv size={24} />
            </div>
            <span className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Yayınlar Aktif</span>
            </span>
          </div>
          <div className="text-3xl font-black text-white group-hover:text-theme transition-colors">
            {liveCount}
          </div>
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
            {t('dash.statsLive')}
          </div>
        </div>

        {/* Filmler Box */}
        <div
          onClick={() => {
            playClickSound();
            setCurrentScreen('movies');
          }}
          onMouseEnter={playHoverSound}
          className="bg-[#13131A] hover:bg-[#181824] border border-[#262638] hover:border-theme rounded-2xl p-6 cursor-pointer transition-all duration-300 group shadow-lg hover:shadow-theme-glow transform hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-theme-soft border border-theme-soft flex items-center justify-center text-theme group-hover:bg-theme group-hover:text-white transition-colors">
              <Film size={24} />
            </div>
            <span className="text-[11px] font-bold text-theme bg-theme-soft border border-theme-soft px-2.5 py-0.5 rounded-full">
              {activeProfile?.isDemo ? 'Demo Modu' : 'VOD'}
            </span>
          </div>
          <div className="text-3xl font-black text-white group-hover:text-theme transition-colors">
            {activeProfile?.isDemo ? '0' : vodCount}
          </div>
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
            {t('dash.statsMovies')}
          </div>
        </div>

        {/* Diziler Box */}
        <div
          onClick={() => {
            playClickSound();
            setCurrentScreen('series');
          }}
          onMouseEnter={playHoverSound}
          className="bg-[#13131A] hover:bg-[#181824] border border-[#262638] hover:border-theme rounded-2xl p-6 cursor-pointer transition-all duration-300 group shadow-lg hover:shadow-theme-glow transform hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-theme-soft border border-theme-soft flex items-center justify-center text-theme group-hover:bg-theme group-hover:text-white transition-colors">
              <Clapperboard size={24} />
            </div>
            <span className="text-[11px] font-bold text-theme bg-theme-soft border border-theme-soft px-2.5 py-0.5 rounded-full">
              {activeProfile?.isDemo ? 'Demo Modu' : 'SERIES'}
            </span>
          </div>
          <div className="text-3xl font-black text-white group-hover:text-theme transition-colors">
            {activeProfile?.isDemo ? '0' : seriesCount}
          </div>
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
            {t('dash.statsSeries')}
          </div>
        </div>
      </div>

      {/* 2. "Kaldığım Yerden Devam Et" (Yatay Kart Listesi) */}
      {continueWatching.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock size={18} className="text-theme" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                {t('dash.continueWatching')}
              </h2>
            </div>
            <span className="text-xs text-gray-500">{continueWatching.length} {t('dash.items')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {continueWatching.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  playClickSound();
                  handlePlayFromHistory(item);
                }}
                onMouseEnter={playHoverSound}
                className="bg-[#13131A] hover:bg-[#181824] border border-[#262638] hover:border-theme rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group shadow-md"
              >
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-theme text-white shadow-theme-glow flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <Play size={16} className="fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 text-[10px] font-semibold text-gray-300 bg-black/70 px-2 py-0.5 rounded">
                    {item.durationLabel}
                  </div>
                </div>

                <div className="w-full bg-[#181824] h-1">
                  <div
                    className="bg-theme h-full shadow-theme-glow"
                    style={{ width: `${item.percent || 30}%` }}
                  />
                </div>

                <div className="p-3">
                  <div className="text-xs font-bold text-white truncate group-hover:text-theme transition-colors">
                    {item.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2.5 "Son İzlenenler" (Recent Watch History) */}
      {watchHistory.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock size={18} className="text-theme" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                {t('dash.recentHistory')} ({watchHistory.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchHistory.slice(0, 12).map((item) => (
              <div
                key={item.stream_id || item.id || item.timestamp}
                onClick={() => {
                  playClickSound();
                  handlePlayFromHistory(item);
                }}
                onMouseEnter={playHoverSound}
                className="bg-[#13131A] hover:bg-[#181824] border border-[#262638] hover:border-theme rounded-2xl p-3 cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">
                    {item.type === 'live' ? 'CANLI' : item.type === 'series' ? 'DİZİ' : 'FİLM'}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-theme-soft text-theme flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={11} className="fill-current ml-0.5" />
                  </div>
                </div>

                <div className="h-16 flex items-center justify-center my-1 overflow-hidden">
                  <img
                    src={item.icon || item.image || item.stream_icon || './logo.svg'}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.src = './logo.svg';
                    }}
                    className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="mt-2 pt-2 border-t border-[#262638]">
                  <div className="text-xs font-bold text-white truncate group-hover:text-theme transition-colors">
                    {item.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. "Favorilerim" Listesi */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Heart size={18} className="text-red-500 fill-red-500" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Favorilerim ({favoriteItems.length})
            </h2>
          </div>
          {favoriteItems.length > 0 && (
            <button
              onClick={() => {
                playClickSound();
                setCurrentScreen('livetv');
              }}
              onMouseEnter={playHoverSound}
              className="text-xs text-theme hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Canlı TV'ye Git</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {favoriteItems.length === 0 ? (
          <div className="bg-[#13131A] border border-[#262638] rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#181824] border border-[#262638] flex items-center justify-center text-gray-500 mb-3">
              <Heart size={26} />
            </div>
            <h3 className="text-sm font-bold text-white">Henüz Favori Eklenmedi</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md leading-relaxed">
              Yayınları ve içerikleri izlerken veya listedeyken kalp ikonuna basarak bu listeye hızlı erişim ekleyebilirsiniz.
            </p>
            <button
              onClick={() => {
                playClickSound();
                setCurrentScreen('livetv');
              }}
              onMouseEnter={playHoverSound}
              className="mt-4 px-5 py-2.5 rounded-xl bg-theme hover:bg-theme-hover text-white text-xs font-bold shadow-theme-glow transition-all"
            >
              Canlı Yayınları Keşfet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {favoriteItems.map((item) => (
              <div
                key={item.stream_id || item.series_id}
                onClick={() => {
                  playClickSound();
                  if (item.type === 'live') {
                    playContent(item, 'live');
                  } else if (item.type === 'series') {
                    setActiveSeriesDetail(item);
                  } else {
                    setActiveMovieDetail(item);
                  }
                }}
                onMouseEnter={playHoverSound}
                className="bg-[#13131A] hover:bg-[#181824] border border-[#262638] hover:border-theme rounded-2xl p-3.5 cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">
                    {item.type === 'live' ? 'CANLI' : item.type === 'series' ? 'DİZİ' : 'FİLM'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playClickSound();
                      toggleFavorite(item.stream_id || item.series_id);
                    }}
                    className="text-red-500 hover:scale-110 transition-transform"
                    title="Favorilerden Çıkar"
                  >
                    <Heart size={15} className="fill-red-500" />
                  </button>
                </div>

                <div className="h-16 flex items-center justify-center my-1">
                  <img
                    src={item.stream_icon || item.backdrop}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="mt-2 pt-2 border-t border-[#262638]">
                  <div className="text-xs font-bold text-white truncate group-hover:text-theme transition-colors">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate mt-0.5">
                    {item.category_name || 'Favori İçerik'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
