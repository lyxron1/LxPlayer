import React, { useState, useEffect } from 'react';
import { X, Play, Star, Calendar, Tv, Heart, Clock, Loader2 } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';
import { useApp } from '../context/AppContext';
import { fetchSeriesInfo, sanitizeId } from '../services/xtreamService';

export default function SeriesDetailModal({ series, onClose }) {
  const { activeProfile, playContent, favorites, toggleFavorite } = useApp();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailedSeries, setDetailedSeries] = useState(null);

  const seriesId = sanitizeId(series?.series_id || series?.id);
  const isFav = favorites.includes(seriesId);

  // Safely extract series basic properties with fallbacks
  const seriesName = series?.name || series?.title || 'İsimsiz Dizi';
  const seriesCover = series?.stream_icon || series?.cover || './logo.svg';
  const seriesBackdrop = series?.backdrop || series?.backdrop_path?.[0] || seriesCover;
  const seriesRating = series?.rating || series?.rating_5based;
  const seriesYear = series?.year || series?.releaseDate?.split?.('-')?.[0];
  const seriesGenre = series?.genre || series?.category_name;
  const seriesPlot = series?.description || series?.plot || 'Bu dizi için detaylı konu özeti bulunmamaktadır.';

  // If seasons & episodes are not loaded, fetch them from Xtream API
  useEffect(() => {
    let isMounted = true;
    async function loadSeriesInfo() {
      if (!series || (series.seasons && series.seasons.length > 0)) {
        return;
      }
      setIsLoadingDetails(true);
      const data = await fetchSeriesInfo(activeProfile, seriesId);
      if (isMounted && data) {
        // Parse and structure seasons with episodes
        const rawEpisodes = data.episodes || {};
        let seasonsList = Array.isArray(data.seasons) ? data.seasons : Object.values(data.seasons || {});

        // If no seasons array returned by API, infer from episode keys
        if (seasonsList.length === 0) {
          const keys = Object.keys(rawEpisodes);
          seasonsList = keys.map((k) => ({
            season_number: parseInt(k, 10) || 1,
            name: `Sezon ${k}`,
          }));
        }

        const normalizedSeasons = seasonsList.map((s) => {
          const sNum = s.season_number;
          const epListRaw = rawEpisodes[String(sNum)] || rawEpisodes[sNum] || [];
          const epList = Array.isArray(epListRaw) ? epListRaw : Object.values(epListRaw || {});
          return {
            ...s,
            season_number: sNum,
            name: s.name || `Sezon ${sNum}`,
            episodes: epList.map((ep) => ({
              ...ep,
              id: ep.id || ep.stream_id,
              episode_num: ep.episode_num || ep.episode_number || 1,
              title: ep.title || `Bölüm ${ep.episode_num || 1}`,
              duration: ep.info?.duration || ep.duration || '45 dk',
              overview: ep.info?.plot || ep.overview || '',
            })),
          };
        });

        setDetailedSeries({
          ...series,
          ...data.info,
          seasons: normalizedSeasons,
        });

        if (normalizedSeasons.length > 0) {
          setSelectedSeason(normalizedSeasons[0].season_number);
        }
      }
      if (isMounted) {
        setIsLoadingDetails(false);
      }
    }

    loadSeriesInfo();
    return () => {
      isMounted = false;
    };
  }, [series, seriesId, activeProfile]);

  if (!series) return null;

  const currentData = detailedSeries || series;
  const seasons = currentData.seasons || [];
  const currentSeason =
    seasons.find((s) => s.season_number === selectedSeason) || seasons[0];

  const handlePlayEpisode = (episode) => {
    playClickSound();
    onClose();
    playContent(
      {
        ...episode,
        seriesName: seriesName,
        stream_id: episode.id || episode.stream_id,
        name: `${seriesName} - S${selectedSeason}:B${episode.episode_num} ${episode.title}`,
        backdrop: seriesBackdrop,
      },
      'series',
      {
        series: currentData,
        currentSeason: selectedSeason,
        currentEpisode: episode.episode_num,
      }
    );
  };

  const handlePlayFirst = () => {
    if (currentSeason?.episodes?.[0]) {
      handlePlayEpisode(currentSeason.episodes[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in select-none">
      <div className="bg-[#13131A] border border-[#262638] rounded-2xl w-full max-w-4xl overflow-hidden relative shadow-theme-glow max-h-[90vh] flex flex-col">
        {/* Backdrop Banner */}
        <div className="relative h-60 w-full overflow-hidden flex-shrink-0 bg-[#09090D]">
          <img
            src={seriesBackdrop}
            alt={seriesName}
            onError={(e) => {
              e.currentTarget.src = seriesCover;
            }}
            className="w-full h-full object-cover filter brightness-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-[#13131A]/60 to-transparent" />

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            onMouseEnter={playHoverSound}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center space-x-2 text-xs font-semibold text-theme uppercase tracking-widest mb-1">
              <Tv size={14} />
              <span>Dizi Dizini</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide drop-shadow-md">
              {seriesName}
            </h1>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {seriesRating && (
                <div className="flex items-center space-x-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold">
                  <Star size={14} className="fill-amber-400" />
                  <span>IMDb {seriesRating}</span>
                </div>
              )}
              {seriesYear && (
                <div className="flex items-center space-x-1 bg-[#181824] text-gray-300 border border-[#262638] px-2.5 py-1 rounded-lg">
                  <Calendar size={13} className="text-gray-400" />
                  <span>{seriesYear}</span>
                </div>
              )}
              {seriesGenre && (
                <div className="bg-theme-soft text-theme border border-theme-soft px-2.5 py-1 rounded-lg">
                  {seriesGenre}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  playClickSound();
                  toggleFavorite(seriesId);
                }}
                onMouseEnter={playHoverSound}
                className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
                  isFav
                    ? 'bg-red-500/15 border-red-500/40 text-red-500'
                    : 'bg-[#181824] border-[#262638] text-gray-300 hover:text-white'
                }`}
                title="Favori"
              >
                <Heart size={18} className={isFav ? 'fill-red-500' : ''} />
              </button>

              {currentSeason?.episodes?.length > 0 && (
                <button
                  onClick={handlePlayFirst}
                  onMouseEnter={playHoverSound}
                  className="py-2 px-5 rounded-xl bg-theme hover:bg-theme-hover text-white font-bold text-xs flex items-center space-x-2 shadow-theme-glow transition-transform hover:scale-[1.02]"
                >
                  <Play size={14} className="fill-white" />
                  <span>İlk Bölümü Oynat</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {currentData.plot || seriesPlot}
            </p>
          </div>

          {/* Loading Seasons Spinner */}
          {isLoadingDetails && (
            <div className="py-8 flex flex-col items-center justify-center text-gray-400 space-y-2">
              <Loader2 size={24} className="animate-spin text-theme" />
              <span className="text-xs">Sezonlar ve bölümler alınıyor...</span>
            </div>
          )}

          {/* Seasons Selector Tabs */}
          {!isLoadingDetails && seasons.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sezonlar</div>
              <div className="flex items-center space-x-2 border-b border-[#262638] pb-2 overflow-x-auto">
                {seasons.map((s) => (
                  <button
                    key={s.season_number}
                    onClick={() => {
                      playClickSound();
                      setSelectedSeason(s.season_number);
                    }}
                    onMouseEnter={playHoverSound}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedSeason === s.season_number
                        ? 'pill-theme-active'
                        : 'bg-[#181824] text-gray-400 hover:text-white border border-[#262638]'
                    }`}
                  >
                    {s.name || `Sezon ${s.season_number}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Episodes List */}
          {!isLoadingDetails && currentSeason?.episodes && currentSeason.episodes.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {currentSeason.name} Bölümleri ({currentSeason.episodes.length})
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {currentSeason.episodes.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => handlePlayEpisode(ep)}
                    onMouseEnter={playHoverSound}
                    className="p-3.5 rounded-xl bg-[#181824] hover:bg-[#1f1f2e] border border-[#262638] hover:border-theme transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-theme group-hover:bg-theme group-hover:text-white transition-all flex-shrink-0">
                        <Play size={16} className="fill-current ml-0.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white group-hover:text-theme transition-colors truncate">
                          {ep.title}
                        </div>
                        {ep.overview && (
                          <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                            {ep.overview}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-gray-400 flex-shrink-0 ml-4">
                      <Clock size={13} />
                      <span>{ep.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoadingDetails && seasons.length === 0 && (
            <div className="p-6 text-center text-gray-500 text-xs bg-[#0E0E14] border border-[#262638] rounded-xl">
              Bu dizi için henüz bölüm bilgisi girilmemiş veya sunucu bölümleri listelemiyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
