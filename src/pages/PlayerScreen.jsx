import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Lock,
  Unlock,
  Subtitles,
  AlertCircle,
  PictureInPicture,
  ListVideo,
  X,
  Search,
  Check,
  Tv,
  Clapperboard,
  Sparkles,
  Layers,
  ArrowLeftCircle,
} from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';
import { useApp } from '../context/AppContext';
import {
  buildStreamUrl,
  sanitizeId,
  fetchVodInfo,
  fetchSeriesInfo,
  fetchLiveStreams,
  fetchLiveCategories,
} from '../services/xtreamService';
import {
  resolveProviderSubtitles,
  loadProviderSubtitleCues,
  loadSubtitleFromFile,
  generateSubtitleDiagnostic,
} from '../services/subtitleService';
import AudioSubtitleModal from '../components/AudioSubtitleModal';

const PLAYBACK_SPEEDS = [1.0, 1.25, 1.5, 2.0];

export default function PlayerScreen() {
  const {
    currentStream,
    streamType,
    activeProfile,
    activeSeriesContext,
    previousScreen,
    setCurrentScreen,
    playContent,
    updateContinueProgress,
    showSubtitles,
    setShowSubtitles,
    subSize,
    subColor,
    t,
  } = useApp();

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);
  const autoNextTimerRef = useRef(null);

  // Playback & Timing state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLocked, setIsLocked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('fit'); // 'fit' | 'fill' | 'stretch'
  const [videoQuality, setVideoQuality] = useState('FHD 1080p');

  // Modals & Panels
  const [isAudioSubModalOpen, setIsAudioSubModalOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [quickMenuSearch, setQuickMenuSearch] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fallbackAttempt, setFallbackAttempt] = useState(0);

  // Series Next Episode Countdown
  const [autoNextCountdown, setAutoNextCountdown] = useState(null);

  // Series Deep Data
  const [loadedSeriesData, setLoadedSeriesData] = useState(null);
  const [selectedQuickSeason, setSelectedQuickSeason] = useState(1);

  // Live TV Quick Drawer State (Categories & Channels Hierarchy)
  const [liveChannelsList, setLiveChannelsList] = useState([]);
  const [liveCategories, setLiveCategories] = useState([]);
  const [selectedLiveCategoryId, setSelectedLiveCategoryId] = useState(null);
  const [liveDrawerView, setLiveDrawerView] = useState('channels'); // 'channels' | 'categories'

  // Seekbar hover preview
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPos, setHoverPos] = useState(0);

  // Real Audio and Subtitle tracks
  const [audioTracks, setAudioTracks] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(-1);
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(-1);
  const [activeSubtitleText, setActiveSubtitleText] = useState('');
  const [subtitleDiagnostic, setSubtitleDiagnostic] = useState(null);
  const [hasProviderSubs, setHasProviderSubs] = useState(false);
  const activeCuesRef = useRef([]);
  const localTracksRef = useRef([]);

  // 1. Dizi Bölümleri Listesini Düzleştir (Flatten All Episodes in Series)
  const seriesSource = loadedSeriesData || activeSeriesContext?.series;
  const allEpisodes = useMemo(() => {
    // Önce aktarılan hazır episodesList listesine bak
    if (currentStream?.episodesList && Array.isArray(currentStream.episodesList) && currentStream.episodesList.length > 0) {
      return currentStream.episodesList;
    }
    if (activeSeriesContext?.episodesList && Array.isArray(activeSeriesContext.episodesList) && activeSeriesContext.episodesList.length > 0) {
      return activeSeriesContext.episodesList;
    }

    if (streamType !== 'series' || !seriesSource?.seasons) return [];
    const list = [];
    const seasons = Array.isArray(seriesSource.seasons)
      ? seriesSource.seasons
      : Object.values(seriesSource.seasons);

    for (let sIdx = 0; sIdx < seasons.length; sIdx++) {
      const season = seasons[sIdx];
      const sNum = season.season_number || sIdx + 1;
      const sName = season.name || `Sezon ${sNum}`;
      const eps = Array.isArray(season.episodes)
        ? season.episodes
        : Object.values(season.episodes || {});

      for (let eIdx = 0; eIdx < eps.length; eIdx++) {
        const ep = eps[eIdx];
        list.push({
          ...ep,
          id: ep.id || ep.stream_id,
          seasonNumber: sNum,
          seasonName: sName,
          episode_num: ep.episode_num || ep.episode_number || eIdx + 1,
          title: ep.title || `Bölüm ${ep.episode_num || eIdx + 1}`,
        });
      }
    }
    return list;
  }, [streamType, seriesSource, currentStream, activeSeriesContext]);

  // Current Episode Index in the series
  const currentEpisodeIndex = useMemo(() => {
    if (!allEpisodes.length || !currentStream) return -1;
    const currentEpId = sanitizeId(currentStream.stream_id || currentStream.id);
    const idx = allEpisodes.findIndex(
      (ep) => sanitizeId(ep.id || ep.stream_id) === currentEpId
    );
    if (idx !== -1) return idx;

    if (activeSeriesContext?.currentEpisode) {
      return allEpisodes.findIndex(
        (ep) =>
          ep.episode_num === activeSeriesContext.currentEpisode &&
          (!activeSeriesContext.currentSeason || ep.seasonNumber === activeSeriesContext.currentSeason)
      );
    }
    return -1;
  }, [allEpisodes, currentStream, activeSeriesContext]);

  const hasPrevEpisode = currentEpisodeIndex > 0;
  const hasNextEpisode = currentEpisodeIndex >= 0 && currentEpisodeIndex < allEpisodes.length - 1;
  const prevEpisode = hasPrevEpisode ? allEpisodes[currentEpisodeIndex - 1] : null;
  const nextEpisode = hasNextEpisode ? allEpisodes[currentEpisodeIndex + 1] : null;

  // SON İZLENENLERDEN AÇILDIĞINDA TÜM DİZİ SEZON VE BÖLÜMLERİNİ OTOMATİK ÇEKME
  useEffect(() => {
    let isMounted = true;
    if (streamType === 'series') {
      const sId = sanitizeId(
        currentStream?.series_id ||
        currentStream?.seriesId ||
        activeSeriesContext?.series?.series_id ||
        activeSeriesContext?.series?.id
      );

      const hasSeasons = (loadedSeriesData?.seasons && loadedSeriesData.seasons.length > 0) ||
                         (activeSeriesContext?.series?.seasons && activeSeriesContext.series.seasons.length > 0);

      if (sId && !hasSeasons) {
        fetchSeriesInfo(activeProfile, sId).then((data) => {
          if (!isMounted || !data) return;
          const rawEpisodes = data.episodes || {};
          let seasonsList = Array.isArray(data.seasons)
            ? data.seasons
            : Object.values(data.seasons || {});

          if (seasonsList.length === 0) {
            const keys = Object.keys(rawEpisodes);
            seasonsList = keys.map((k) => ({
              season_number: parseInt(k, 10) || 1,
              name: `Sezon ${k}`,
            }));
          }

          const parsedSeasons = seasonsList.map((s) => {
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
              })),
            };
          });

          setLoadedSeriesData({
            ...data.info,
            seasons: parsedSeasons,
          });

          // Oynatılan bölüme karşılık gelen sezonu seç
          const currentEpId = sanitizeId(currentStream?.stream_id || currentStream?.id);
          for (const s of parsedSeasons) {
            if (s.episodes.some((ep) => sanitizeId(ep.id || ep.stream_id) === currentEpId)) {
              setSelectedQuickSeason(s.season_number);
              break;
            }
          }
        });
      }
    } else if (streamType === 'live') {
      // Canlı TV kanalları ve kategorileri yükle
      Promise.all([
        fetchLiveStreams(activeProfile),
        fetchLiveCategories(activeProfile),
      ]).then(([channels, cats]) => {
        if (!isMounted) return;
        if (Array.isArray(channels)) setLiveChannelsList(channels);
        if (Array.isArray(cats)) setLiveCategories(cats);

        const currentCat = sanitizeId(currentStream?.category_id);
        if (currentCat) {
          setSelectedLiveCategoryId(currentCat);
        } else if (cats && cats.length > 0) {
          setSelectedLiveCategoryId(cats[0].category_id);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [streamType, currentStream, activeSeriesContext, activeProfile]);

  // Canlı TV Kategori Haritası & Kanal Sayacı
  const liveCategoryNameMap = useMemo(() => {
    const map = {};
    for (const c of liveCategories) {
      if (c && c.category_id !== undefined) {
        map[sanitizeId(c.category_id)] = c.category_name;
      }
    }
    return map;
  }, [liveCategories]);

  const liveCategoryCounts = useMemo(() => {
    const counts = {};
    for (const ch of liveChannelsList) {
      const catId = sanitizeId(ch.category_id);
      counts[catId] = (counts[catId] || 0) + 1;
    }
    return counts;
  }, [liveChannelsList]);

  // Bölüm Oynatıcı Fonksiyonu
  const playEpisodeItem = useCallback(
    (episode) => {
      if (!episode) return;
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
        autoNextTimerRef.current = null;
      }
      setAutoNextCountdown(null);

      const sName =
        currentStream?.seriesTitle ||
        activeSeriesContext?.series?.name ||
        currentStream?.seriesName ||
        'Dizi';
      const backdrop =
        activeSeriesContext?.series?.backdrop || currentStream?.backdrop;

      playContent(
        {
          ...episode,
          seriesName: sName,
          seriesTitle: sName,
          series_id: currentStream?.series_id || activeSeriesContext?.series?.series_id,
          parent_id: currentStream?.series_id || activeSeriesContext?.series?.series_id,
          stream_id: episode.id || episode.stream_id,
          name: `${sName} - S${episode.seasonNumber}:B${episode.episode_num} ${episode.title}`,
          backdrop,
          episodesList: allEpisodes,
        },
        'series',
        {
          series: seriesSource,
          episodesList: allEpisodes,
          currentSeason: episode.seasonNumber,
          currentEpisode: episode.episode_num,
        }
      );
    },
    [activeSeriesContext, currentStream, playContent, seriesSource, allEpisodes]
  );

  const handleNextEpisode = useCallback(() => {
    if (nextEpisode) {
      playClickSound();
      playEpisodeItem(nextEpisode);
    }
  }, [nextEpisode, playEpisodeItem]);

  const handlePrevEpisode = useCallback(() => {
    if (prevEpisode) {
      playClickSound();
      playEpisodeItem(prevEpisode);
    }
  }, [prevEpisode, playEpisodeItem]);

  // Stream URL oluşturucu (HLS .m3u8 öncelikli)
  const getStreamUrl = (attempt = 0) => {
    if (!currentStream) return '';
    if (currentStream.url) {
      // M3U canlı yayınlarında .ts uzantısı Hls.js'de takılmaya yol açtığı için ilk denemede .m3u8 denenir
      if (streamType === 'live' && currentStream.url.includes('.ts')) {
        if (attempt === 0) {
          return currentStream.url.replace(/\.ts(\?.*)?$/i, '.m3u8$1');
        }
      }
      return currentStream.url;
    }

    const streamId = currentStream.stream_id || currentStream.id;
    const prefExt = currentStream.container_extension || (streamType === 'live' ? 'm3u8' : 'mp4');

    if (streamType === 'live') {
      // Hls.js motoru .m3u8 oynatma listesi ile anında (0.5s) başlar; .ts ham akışında manifestParsingError verir
      if (attempt === 0) return buildStreamUrl(activeProfile, streamId, 'live', 'm3u8');
      if (attempt === 1) return buildStreamUrl(activeProfile, streamId, 'live', 'ts');
      return buildStreamUrl(activeProfile, streamId, 'live', '');
    } else if (streamType === 'movie') {
      if (attempt === 0) return buildStreamUrl(activeProfile, streamId, 'movie', prefExt);
      if (attempt === 1) return buildStreamUrl(activeProfile, streamId, 'movie', prefExt === 'mp4' ? 'mkv' : 'mp4');
      return buildStreamUrl(activeProfile, streamId, 'movie', 'm3u8');
    } else {
      if (attempt === 0) return buildStreamUrl(activeProfile, streamId, 'series', prefExt);
      if (attempt === 1) return buildStreamUrl(activeProfile, streamId, 'series', prefExt === 'mp4' ? 'mkv' : 'mp4');
      return buildStreamUrl(activeProfile, streamId, 'series', 'm3u8');
    }
  };

  // HTML5 Video Elementi Doğrudan Yerel İzleri Tara (Fallback / Native tracks)
  const scanNativeTracks = useCallback(() => {
    if (!videoRef.current) return;
    const vid = videoRef.current;

    // Yerel textTracks tara
    if (vid.textTracks && vid.textTracks.length > 0) {
      const subs = Array.from(vid.textTracks)
        .filter((t) => t.kind === 'subtitles' || t.kind === 'captions' || !t.kind)
        .map((t, idx) => ({
          id: `native_${idx}`,
          index: idx,
          name: t.label || t.language || `Gömülü Altyazı ${idx + 1}`,
          lang: t.language || 'und',
          isNative: true,
          track: t,
        }));
      if (subs.length) {
        setSubtitleTracks((prev) => {
          const hasHls = prev.some((t) => t.isHls);
          if (hasHls) return prev;
          const nonEmbedded = prev.filter((t) => !t.isNative);
          return [...subs, ...nonEmbedded];
        });
      }
    }

    // Yerel audioTracks tara
    if (vid.audioTracks && vid.audioTracks.length > 0) {
      const audios = Array.from(vid.audioTracks).map((t, idx) => ({
        id: idx,
        name: t.label || t.language || `Ses ${idx + 1}`,
        isNative: true,
      }));
      if (audios.length) setAudioTracks(audios);
    }
  }, []);

  // XTREAM SAĞLAYICISINDAN ALTYAZILARI ÇEKME (VOD Film & Dizi)
  useEffect(() => {
    let isMounted = true;
    if (!currentStream) return;

    async function fetchProviderSubtitles() {
      const streamId = sanitizeId(currentStream.stream_id || currentStream.id);
      let providerSubs = [];
      let vodOrSeriesData = null;

      try {
        if (streamType === 'movie') {
          console.log(`[LxPlayer Subtitle System] Fetching VOD info for movie stream_id=${streamId}...`);
          vodOrSeriesData = await fetchVodInfo(activeProfile, streamId);
          if (!isMounted) return;
          providerSubs = resolveProviderSubtitles(activeProfile, currentStream, 'movie', vodOrSeriesData);
        } else if (streamType === 'series') {
          console.log(`[LxPlayer Subtitle System] Resolving series episode subtitles for stream_id=${streamId}...`);
          vodOrSeriesData = loadedSeriesData || activeSeriesContext?.series;
          providerSubs = resolveProviderSubtitles(activeProfile, currentStream, 'series', vodOrSeriesData);
        }
      } catch (err) {
        console.warn('[LxPlayer Subtitle System] Error fetching provider subtitles:', err);
      }

      if (!isMounted) return;

      const hasSubs = providerSubs.length > 0;
      setHasProviderSubs(hasSubs);

      console.log(`[LxPlayer Subtitle System] Provider Subtitle Search Result:`, {
        streamName: currentStream.name || currentStream.title,
        streamType,
        hasProviderSubs: hasSubs,
        count: providerSubs.length,
        tracks: providerSubs.map((t) => `${t.name} (${t.lang}) -> ${t.url}`),
      });

      setSubtitleTracks((prev) => {
        const embedded = prev.filter((t) => t.isHls || t.isNative);
        const locals = prev.filter((t) => t.isLocal);
        return [...embedded, ...providerSubs, ...locals];
      });
    }

    fetchProviderSubtitles();

    return () => {
      isMounted = false;
    };
  }, [currentStream, streamType, activeProfile, loadedSeriesData, activeSeriesContext]);

  // Video akışını başlatma & HLS dinleyicileri (Gerçek Ses ve Altyazı Algılama)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentStream) return;

    setHasError(false);
    setErrorMsg('');
    setAudioTracks([]);
    setSubtitleTracks([]);
    setCurrentAudioIndex(-1);
    setCurrentSubtitleIndex(-1);
    setActiveSubtitleText('');
    activeCuesRef.current = [];
    setAutoNextCountdown(null);

    const targetUrl = getStreamUrl(fallbackAttempt);
    if (!targetUrl) return;

    const isHlsStream = targetUrl.includes('.m3u8') || streamType === 'live';

    if (Hls.isSupported() && isHlsStream) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false, // IPTV standart HLS akışlarında donma ve tampon yetersizliğini önler
        backBufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 10000,
        fragLoadingTimeOut: 15000,
        fragLoadingMaxRetry: 4,
        subtitleDisplay: true,
      });

      let networkErrorRetries = 0;
      let mediaErrorRetries = 0;

      hlsRef.current = hls;
      hls.loadSource(targetUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (hls.audioTracks?.length) {
          setAudioTracks(
            hls.audioTracks.map((t, idx) => ({
              id: idx,
              name: t.name || t.lang || `Ses ${idx + 1}`,
            }))
          );
          setCurrentAudioIndex(hls.audioTrack);
        }
        if (hls.subtitleTracks?.length) {
          const hlsSubs = hls.subtitleTracks.map((t, idx) => ({
            id: `hls_${idx}`,
            index: idx,
            name: t.name || t.lang || `Gömülü Altyazı ${idx + 1}`,
            lang: t.lang || 'und',
            isHls: true,
          }));
          setSubtitleTracks((prev) => {
            const nonHls = prev.filter((t) => !t.isHls);
            return [...hlsSubs, ...nonHls];
          });
          setCurrentSubtitleIndex(hls.subtitleTrack);
        }
        scanNativeTracks();
        video.play().catch(() => setIsPlaying(false));
      });

      // HLS ses izleri güncelleme olayı
      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => {
        if (data.audioTracks?.length) {
          setAudioTracks(
            data.audioTracks.map((t, idx) => ({
              id: idx,
              name: t.name || t.lang || `Ses ${idx + 1}`,
            }))
          );
          if (hls.audioTrack >= 0) {
            setCurrentAudioIndex(hls.audioTrack);
          }
        }
      });

      // HLS altyazı izleri güncelleme olayı
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_, data) => {
        if (data.subtitleTracks?.length) {
          const hlsSubs = data.subtitleTracks.map((t, idx) => ({
            id: `hls_${idx}`,
            index: idx,
            name: t.name || t.lang || `Gömülü Altyazı ${idx + 1}`,
            lang: t.lang || 'und',
            isHls: true,
          }));
          setSubtitleTracks((prev) => {
            const nonHls = prev.filter((t) => !t.isHls);
            return [...hlsSubs, ...nonHls];
          });
          if (hls.subtitleTrack >= 0) {
            setCurrentSubtitleIndex(hls.subtitleTrack);
          }
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        if (hls.levels && hls.levels[data.level]) {
          const lvl = hls.levels[data.level];
          if (lvl.height >= 2160) setVideoQuality('4K 2160p');
          else if (lvl.height >= 1080) setVideoQuality('FHD 1080p');
          else if (lvl.height >= 720) setVideoQuality('HD 720p');
          else if (lvl.height > 0) setVideoQuality(`${lvl.height}p`);
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('HLS Fatal Error:', data.type, data.details);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            if (networkErrorRetries < 2) {
              networkErrorRetries++;
              console.log(`[LxPlayer HLS] Recovering network error (attempt ${networkErrorRetries})...`);
              hls.startLoad();
              return;
            }
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            if (mediaErrorRetries < 2) {
              mediaErrorRetries++;
              console.log(`[LxPlayer HLS] Recovering media error (attempt ${mediaErrorRetries})...`);
              hls.recoverMediaError();
              return;
            }
          }

          if (fallbackAttempt < 2) {
            setFallbackAttempt((prev) => prev + 1);
          } else {
            setHasError(true);
            setErrorMsg('Yayın akışı yüklenemedi. Bağlantınızı veya IPTV sunucunuzu kontrol edin.');
          }
        }
      });
    } else {
      video.src = targetUrl;
      scanNativeTracks();
      video.play().catch(() => setIsPlaying(false));
    }

    video.onloadedmetadata = handleLoadedMetadata;
    if (video.textTracks) {
      video.textTracks.onaddtrack = scanNativeTracks;
    }
    if (video.audioTracks) {
      video.audioTracks.onaddtrack = scanNativeTracks;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
    };
  }, [currentStream, fallbackAttempt, scanNativeTracks]);

  // Handle Video Metadata Loaded (Detect Quality & Native tracks)
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Yerel textTracks tara
    if (video.textTracks && video.textTracks.length > 0) {
      const subs = Array.from(video.textTracks)
        .filter((t) => t.kind === 'subtitles' || t.kind === 'captions')
        .map((t, idx) => ({
          id: `native_${idx}`,
          index: idx,
          name: t.label || t.language || `Gömülü Altyazı ${idx + 1}`,
          lang: t.language || 'und',
          isNative: true,
          track: t,
        }));
      if (subs.length) {
        setSubtitleTracks((prev) => {
          const hasHls = prev.some((t) => t.isHls);
          if (hasHls) return prev;
          const nonEmbedded = prev.filter((t) => !t.isNative);
          return [...subs, ...nonEmbedded];
        });
      }
    }
    // Yerel audioTracks tara
    if (video.audioTracks && video.audioTracks.length > 0) {
      const audios = Array.from(video.audioTracks).map((t, idx) => ({
        id: idx,
        name: t.label || t.language || `Ses ${idx + 1}`,
        isNative: true,
      }));
      if (audios.length) setAudioTracks(audios);
    }

    const h = video.videoHeight;
    if (h >= 2160) setVideoQuality('4K 2160p');
    else if (h >= 1080) setVideoQuality('FHD 1080p');
    else if (h >= 720) setVideoQuality('HD 720p');
    else if (h > 0) setVideoQuality(`${h}p`);
    else setVideoQuality(streamType === 'live' ? 'CANLI HLS' : 'FHD 1080p');
  };

  // Video Bittiğinde Otomatik Sonraki Bölüm (1.8 saniye)
  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (streamType === 'series' && nextEpisode) {
      setAutoNextCountdown(1.8);
      autoNextTimerRef.current = setTimeout(() => {
        playEpisodeItem(nextEpisode);
      }, 1800);
    }
  };

  // Ses & Altyazı Kanal Değişimleri
  const handleSelectAudio = (selectedId) => {
    setCurrentAudioIndex(selectedId);
    if (hlsRef.current) {
      hlsRef.current.audioTrack = selectedId;
    }
    const vid = videoRef.current;
    if (vid?.audioTracks && vid.audioTracks.length > 0) {
      for (let i = 0; i < vid.audioTracks.length; i++) {
        vid.audioTracks[i].enabled = (i === selectedId);
      }
    }
  };

  // Altyazı Seçimi & Aktif Parça Yönetimi
  const handleSelectSubtitle = async (selectedId) => {
    setCurrentSubtitleIndex(selectedId);

    if (selectedId === -1) {
      activeCuesRef.current = [];
      setActiveSubtitleText('');
      if (hlsRef.current) {
        hlsRef.current.subtitleTrack = -1;
      }
      const vid = videoRef.current;
      if (vid?.textTracks) {
        for (let i = 0; i < vid.textTracks.length; i++) {
          vid.textTracks[i].mode = 'disabled';
        }
      }
      return;
    }

    const track = subtitleTracks[selectedId];
    if (!track) return;

    setShowSubtitles(true);

    if (track.isHls) {
      if (hlsRef.current) {
        hlsRef.current.subtitleTrack = track.index;
      }
      const vid = videoRef.current;
      if (vid?.textTracks && vid.textTracks.length > 0) {
        for (let i = 0; i < vid.textTracks.length; i++) {
          vid.textTracks[i].mode = (i === track.index ? 'hidden' : 'disabled');
        }
      }
    } else if (track.isNative) {
      const vid = videoRef.current;
      if (vid?.textTracks && vid.textTracks.length > 0) {
        for (let i = 0; i < vid.textTracks.length; i++) {
          vid.textTracks[i].mode = (i === track.index ? 'hidden' : 'disabled');
        }
      }
    } else if (track.isProvider || track.isLocal) {
      if (track.cues && track.cues.length > 0) {
        activeCuesRef.current = track.cues;
      } else if (track.url) {
        console.log(`[LxPlayer Subtitle System] Fetching cues for provider track: "${track.name}" (${track.url})`);
        const result = await loadProviderSubtitleCues(track);
        if (result && result.cues.length > 0) {
          track.cues = result.cues;
          track.vttBlobUrl = result.vttBlobUrl;
          activeCuesRef.current = result.cues;
          console.log(`[LxPlayer Subtitle System] Successfully parsed ${result.cues.length} cues for: ${track.name}`);
        } else {
          console.warn(`[LxPlayer Subtitle System] Failed to load cues from URL: ${track.url}`);
          activeCuesRef.current = [];
        }
      }
    }

    if (videoRef.current) {
      updateActiveCue(videoRef.current.currentTime);
    }
  };

  // Harici Altyazı Dosyası Yükleme (.srt, .vtt, .ttml)
  const handleLoadLocalSubtitle = async (file) => {
    try {
      console.log(`[LxPlayer Subtitle System] Loading local subtitle file: "${file.name}"...`);
      const localTrack = await loadSubtitleFromFile(file);
      setSubtitleTracks((prev) => {
        const next = [...prev, localTrack];
        const newIdx = next.length - 1;
        setTimeout(() => {
          handleSelectSubtitle(newIdx);
        }, 50);
        return next;
      });
      console.log(`[LxPlayer Subtitle System] Local subtitle ready: "${file.name}" (${localTrack.cues.length} cues).`);
    } catch (err) {
      console.error('[LxPlayer Subtitle System] Failed to load local subtitle file:', err);
      alert(err.message || 'Altyazı dosyası okunamadı!');
    }
  };

  // Altyazı Cuelarını Zaman Damgasına Göre Eşleştirme (Custom React Overlay)
  const updateActiveCue = (cur) => {
    if (!showSubtitles || currentSubtitleIndex === -1) {
      if (activeSubtitleText) setActiveSubtitleText('');
      return;
    }

    const currentTrack = subtitleTracks[currentSubtitleIndex];
    if (!currentTrack) {
      if (activeSubtitleText) setActiveSubtitleText('');
      return;
    }

    // 1. Sağlayıcı veya Yerel Ayrıştırılmış Cuelar
    if (activeCuesRef.current && activeCuesRef.current.length > 0) {
      const cue = activeCuesRef.current.find((c) => cur >= c.start && cur <= c.end);
      const text = cue ? cue.text : '';
      if (text !== activeSubtitleText) {
        setActiveSubtitleText(text);
      }
      return;
    }

    // 2. Gömülü HLS veya Yerel Video TextTrack Cueları
    const vid = videoRef.current;
    if (vid && vid.textTracks && vid.textTracks.length > 0) {
      for (let i = 0; i < vid.textTracks.length; i++) {
        const tt = vid.textTracks[i];
        if (tt.mode === 'hidden' || tt.mode === 'showing') {
          if (tt.activeCues && tt.activeCues.length > 0) {
            const cue = tt.activeCues[0];
            const text = cue ? cue.text : '';
            if (text !== activeSubtitleText) {
              setActiveSubtitleText(text);
            }
            return;
          }
        }
      }
    }

    if (activeSubtitleText) {
      setActiveSubtitleText('');
    }
  };

  // Teknik Altyazı Teşhis Raporu Senkronizasyonu (Requirement 5)
  useEffect(() => {
    const diag = generateSubtitleDiagnostic({
      streamType,
      streamName: currentStream?.name || currentStream?.title || '',
      hlsTracks: subtitleTracks.filter((t) => t.isHls),
      nativeTracks: subtitleTracks.filter((t) => t.isNative),
      providerTracks: subtitleTracks.filter((t) => t.isProvider),
      localTracks: subtitleTracks.filter((t) => t.isLocal),
      hasProviderSubs,
      activeTrack: currentSubtitleIndex >= 0 ? subtitleTracks[currentSubtitleIndex] : null,
    });
    setSubtitleDiagnostic(diag);
  }, [streamType, currentStream, subtitleTracks, hasProviderSubs, currentSubtitleIndex]);

  // Mouse Hareketi & 4 Saniye Sonra Otomatik Gizleme
  const handleMouseMove = () => {
    if (isLocked) return;
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (!isAudioSubModalOpen && !isQuickMenuOpen) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
  };

  useEffect(() => {
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (!isAudioSubModalOpen && !isQuickMenuOpen) {
        setShowControls(false);
      }
    }, 4000);
    return () => {
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    };
  }, [isAudioSubModalOpen, isQuickMenuOpen]);

  // Klavye Kısayolları
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLocked) {
        if (e.key === 'Escape') setIsLocked(false);
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (streamType !== 'live') seekRelative(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (streamType !== 'live') seekRelative(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          e.preventDefault();
          if (isQuickMenuOpen) {
            setIsQuickMenuOpen(false);
          } else if (isAudioSubModalOpen) {
            setIsAudioSubModalOpen(false);
          } else {
            handleExit();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlaying,
    isLocked,
    streamType,
    volume,
    isMuted,
    isFullscreen,
    isQuickMenuOpen,
    isAudioSubModalOpen,
  ]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(cur);
    setDuration(dur);

    updateActiveCue(cur);

    if (streamType !== 'live' && dur > 0 && Math.floor(cur) % 5 === 0) {
      updateContinueProgress(currentStream, Math.floor(cur), Math.floor(dur));
    }
  };

  const togglePlay = () => {
    playClickSound();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekRelative = (sec) => {
    playClickSound();
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + sec)
    );
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = pos * duration;
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleSeekMouseMove = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPos(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleSeekMouseLeave = () => {
    setHoverTime(null);
  };

  const adjustVolume = (delta) => {
    if (!videoRef.current) return;
    const newVol = Math.max(0, Math.min(1, volume + delta));
    videoRef.current.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };

  const toggleMute = () => {
    playClickSound();
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  const cyclePlaybackSpeed = () => {
    playClickSound();
    const nextIdx = (PLAYBACK_SPEEDS.indexOf(playbackSpeed) + 1) % PLAYBACK_SPEEDS.length;
    const nextSpeed = PLAYBACK_SPEEDS[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const togglePiP = async () => {
    playClickSound();
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP toggle failed:', err);
    }
  };

  const toggleFullscreen = () => {
    playClickSound();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const toggleAspectRatio = () => {
    playClickSound();
    if (aspectRatio === 'fit') setAspectRatio('fill');
    else if (aspectRatio === 'fill') setAspectRatio('stretch');
    else setAspectRatio('fit');
  };

  const handleExit = () => {
    playClickSound();
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    setCurrentScreen(previousScreen || 'dashboard');
  };

  const formatSeconds = (sec) => {
    if (isNaN(sec) || sec === Infinity) return '00:00';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Quick Menu Filtered items
  const quickSeasons = seriesSource?.seasons || [];
  const currentQuickSeason =
    quickSeasons.find((s) => s.season_number === selectedQuickSeason) || quickSeasons[0];

  // Canlı TV Filtreli Kanallar (Seçili kategoriye göre)
  const currentCategoryChannels = useMemo(() => {
    if (!selectedLiveCategoryId) return liveChannelsList;
    const cleanCat = sanitizeId(selectedLiveCategoryId);
    return liveChannelsList.filter((ch) => sanitizeId(ch.category_id) === cleanCat);
  }, [liveChannelsList, selectedLiveCategoryId]);

  const filteredChannelsInView = useMemo(() => {
    if (!quickMenuSearch.trim()) return currentCategoryChannels;
    const q = quickMenuSearch.toLowerCase().trim();
    return currentCategoryChannels.filter((ch) => ch.name && ch.name.toLowerCase().includes(q));
  }, [currentCategoryChannels, quickMenuSearch]);

  const filteredCategoriesInView = useMemo(() => {
    if (!quickMenuSearch.trim()) return liveCategories;
    const q = quickMenuSearch.toLowerCase().trim();
    return liveCategories.filter((cat) => cat.category_name && cat.category_name.toLowerCase().includes(q));
  }, [liveCategories, quickMenuSearch]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-40 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleVideoEnded}
        onClick={togglePlay}
        className={`w-full h-full cursor-pointer transition-all duration-200 ${
          aspectRatio === 'fit'
            ? 'object-contain'
            : aspectRatio === 'fill'
            ? 'object-cover'
            : 'object-fill'
        }`}
        playsInline
      />

      {/* Subtitle Display Overlay (Real-time Synced & Custom Styled) */}
      {showSubtitles && activeSubtitleText && (
        <div
          className={`absolute pointer-events-none z-30 text-center transition-all duration-150 select-none px-4 ${
            showControls ? 'bottom-28 sm:bottom-32' : 'bottom-12 sm:bottom-16'
          }`}
          style={{ left: '50%', transform: 'translateX(-50%)', maxWidth: '85vw' }}
        >
          <span
            className={`inline-block font-semibold px-4 py-1.5 rounded-xl bg-black/80 backdrop-blur-sm drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] leading-relaxed text-center ${
              subColor === 'yellow'
                ? 'text-yellow-400'
                : subColor === 'cyan'
                ? 'text-cyan-400'
                : subColor === 'green'
                ? 'text-emerald-400'
                : 'text-white'
            } ${
              subSize === 'small'
                ? 'text-sm sm:text-base'
                : subSize === 'large'
                ? 'text-xl sm:text-2xl'
                : subSize === 'xlarge'
                ? 'text-2xl sm:text-3xl'
                : 'text-base sm:text-lg'
            }`}
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.95)',
            }}
            dangerouslySetInnerHTML={{
              __html: activeSubtitleText.replace(/\n/g, '<br/>'),
            }}
          />
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-50">
          <AlertCircle size={44} className="text-red-500 mb-3 animate-pulse" />
          <h2 className="text-xl font-bold text-white">Yayın Başlatılamadı</h2>
          <p className="text-xs text-gray-400 max-w-sm mt-1">{errorMsg}</p>
          <div className="mt-5 flex items-center space-x-3">
            <button
              onClick={() => {
                setFallbackAttempt(0);
                setHasError(false);
              }}
              onMouseEnter={playHoverSound}
              className="px-5 py-2.5 rounded-xl bg-theme hover:bg-theme-hover text-white font-semibold text-xs transition-colors shadow-theme-glow"
            >
              {t('common.retry')}
            </button>
            <button
              onClick={handleExit}
              onMouseEnter={playHoverSound}
              className="px-5 py-2.5 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#262638] text-gray-300 text-xs font-semibold transition-colors"
            >
              {t('common.back')}
            </button>
          </div>
        </div>
      )}

      {/* Auto Next Episode Countdown Toast */}
      {autoNextCountdown !== null && nextEpisode && (
        <div className="absolute top-20 right-6 z-50 bg-[#13131A]/95 border border-theme/60 rounded-2xl p-4 shadow-theme-glow backdrop-blur-xl animate-fade-in flex items-center space-x-4 max-w-md">
          <div className="w-10 h-10 rounded-xl bg-theme flex items-center justify-center text-white flex-shrink-0 animate-pulse">
            <Sparkles size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-theme">
              {t('player.autoNext')} (1.8s)
            </div>
            <div className="text-xs font-semibold text-white truncate mt-0.5">
              S{nextEpisode.seasonNumber}:B{nextEpisode.episode_num} - {nextEpisode.title}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleNextEpisode}
              onMouseEnter={playHoverSound}
              className="px-3 py-1.5 rounded-lg bg-theme hover:bg-theme-hover text-white text-xs font-bold transition-all"
            >
              Hemen Başlat
            </button>
            <button
              onClick={() => {
                playClickSound();
                if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
                setAutoNextCountdown(null);
              }}
              onMouseEnter={playHoverSound}
              className="p-1.5 rounded-lg bg-[#181824] hover:bg-[#202030] border border-[#262638] text-gray-400 hover:text-white transition-colors"
              title={t('common.cancel')}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Player Overlays (Controls) */}
      <div
        className={`absolute inset-0 flex flex-col justify-between pointer-events-none transition-opacity duration-300 z-30 ${
          showControls && !isLocked ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 1. ÜST BAR (TITLEBAR ÇAKIŞMASI VE SIĞMAMA ÇÖZÜMÜ) */}
        <div className="bg-gradient-to-b from-black/90 via-black/50 to-transparent pt-11 pb-5 px-6 flex items-center justify-between pointer-events-auto">
          {/* Sol: Geri Dön Butonu + Kategori Rozeti + Başlık (Tek satır, max-w-[50vw], truncate) */}
          <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-4">
            <button
              onClick={handleExit}
              onMouseEnter={playHoverSound}
              className="w-9 h-9 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-colors flex-shrink-0 shadow-md"
              title="Çıkış (Esc)"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex items-center space-x-2.5 min-w-0">
              {streamType === 'live' ? (
                <span className="flex items-center space-x-1.5 text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t('player.liveBadge')}</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-theme bg-theme-soft border border-theme-soft px-2.5 py-0.5 rounded-full uppercase flex-shrink-0">
                  {streamType === 'series' ? 'DİZİ' : 'FİLM'}
                </span>
              )}

              <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[50vw] drop-shadow-md">
                {currentStream?.name || currentStream?.title || 'Yayın Akışı'}
              </h1>
            </div>
          </div>

          {/* Sağ: Sadece Ekran Kilitleme Butonu */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => {
                playClickSound();
                setIsLocked(true);
              }}
              onMouseEnter={playHoverSound}
              className="w-9 h-9 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-colors shadow-md"
              title={t('player.lockScreen')}
            >
              <Lock size={15} />
            </button>
          </div>
        </div>

        {/* 2. ORTA YÜZEN KONTROLLER */}
        <div className="flex-1 flex items-center justify-center pointer-events-none">
          <div className="flex items-center space-x-6 sm:space-x-8 pointer-events-auto">
            {streamType !== 'live' && (
              <button
                onClick={() => seekRelative(-10)}
                onMouseEnter={playHoverSound}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-transform hover:scale-110 active:scale-95"
                title="10s Geri"
              >
                <RotateCcw size={20} />
              </button>
            )}

            <button
              onClick={togglePlay}
              onMouseEnter={playHoverSound}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-theme hover:bg-theme-hover text-white flex items-center justify-center shadow-theme-glow transition-transform hover:scale-110 active:scale-95"
              title={isPlaying ? `${t('player.pause')} (Space)` : `${t('player.play')} (Space)`}
            >
              {isPlaying ? (
                <Pause size={28} className="fill-white" />
              ) : (
                <Play size={28} className="fill-white ml-1" />
              )}
            </button>

            {streamType !== 'live' && (
              <button
                onClick={() => seekRelative(10)}
                onMouseEnter={playHoverSound}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-transform hover:scale-110 active:scale-95"
                title="10s İleri"
              >
                <RotateCw size={20} />
              </button>
            )}
          </div>
        </div>

        {/* 3. ALT KONTROL BARI MİMARİSİ (SEEKBAR VE İKİ KANATLI DÜZEN) */}
        <div className="bg-gradient-to-t from-black/95 via-black/85 to-transparent px-6 pb-6 pt-4 pointer-events-auto space-y-3">
          {/* A) BOYADAN BOYA UZANAN SEEKBAR (Hover Süresi Balonu ile) */}
          {streamType !== 'live' && (
            <div className="relative group/seek py-1">
              {hoverTime !== null && (
                <div
                  className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/90 border border-white/25 text-[10px] font-mono font-bold text-white pointer-events-none shadow-xl z-20 whitespace-nowrap"
                  style={{ left: `${hoverPos}%` }}
                >
                  {formatSeconds(hoverTime)}
                </div>
              )}

              <div
                onClick={handleSeek}
                onMouseMove={handleSeekMouseMove}
                onMouseLeave={handleSeekMouseLeave}
                className="relative w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full cursor-pointer transition-all overflow-hidden flex items-center"
              >
                <div
                  className="h-full bg-theme rounded-full shadow-theme-glow transition-all duration-75 relative"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* B) İKİ KANATLI KONTROL DÜZENİ: SOL VE SAĞ KANATLAR */}
          <div className="flex items-center justify-between gap-4">
            {/* === SOL KANAT (Akış & Ses Kontrolleri) === */}
            <div className="flex items-center space-x-3.5 min-w-0">
              {/* Mini Oynat / Duraklat Butonu */}
              <button
                onClick={togglePlay}
                onMouseEnter={playHoverSound}
                className="w-9 h-9 rounded-xl bg-theme hover:bg-theme-hover text-white flex items-center justify-center shadow-theme-glow transition-transform active:scale-95 flex-shrink-0"
                title={isPlaying ? `${t('player.pause')} (Space)` : `${t('player.play')} (Space)`}
              >
                {isPlaying ? (
                  <Pause size={17} className="fill-white" />
                ) : (
                  <Play size={17} className="fill-white ml-0.5" />
                )}
              </button>

              {/* DİZİLER İÇİN ÖNCEKİ VE SONRAKİ BÖLÜM TUŞLARI (SADECE DİZİDE GÖRÜNÜR) */}
              {streamType === 'series' && (
                <div className="flex items-center space-x-1 border-l border-r border-white/10 px-2 flex-shrink-0">
                  <button
                    onClick={handlePrevEpisode}
                    disabled={!hasPrevEpisode}
                    onMouseEnter={playHoverSound}
                    className={`p-1.5 rounded-lg transition-colors ${
                      hasPrevEpisode
                        ? 'text-gray-300 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                    title={
                      prevEpisode
                        ? `${t('player.prevEp')}: S${prevEpisode.seasonNumber}:B${prevEpisode.episode_num}`
                        : t('player.prevEp')
                    }
                  >
                    <SkipBack size={17} />
                  </button>

                  <button
                    onClick={handleNextEpisode}
                    disabled={!hasNextEpisode}
                    onMouseEnter={playHoverSound}
                    className={`p-1.5 rounded-lg transition-colors ${
                      hasNextEpisode
                        ? 'text-gray-300 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                    title={
                      nextEpisode
                        ? `${t('player.nextEp')}: S${nextEpisode.seasonNumber}:B${nextEpisode.episode_num}`
                        : t('player.nextEp')
                    }
                  >
                    <SkipForward size={17} />
                  </button>
                </div>
              )}

              {/* Ses İkonu + Hover olunca açılan yatay ses kaydırıcısı + Ses yüzdesi (%80) */}
              <div className="flex items-center group/vol relative">
                <button
                  onClick={toggleMute}
                  onMouseEnter={playHoverSound}
                  className="text-gray-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 flex-shrink-0"
                  title="Sesi Aç/Kapat (M)"
                >
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                <div className="w-0 opacity-0 group-hover/vol:w-20 group-hover/vol:opacity-100 transition-all duration-200 overflow-hidden flex items-center ml-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      if (videoRef.current) {
                        videoRef.current.volume = v;
                        videoRef.current.muted = v === 0;
                      }
                      setIsMuted(v === 0);
                    }}
                    className="w-18 h-1.5 rounded-lg cursor-pointer"
                    style={{ accentColor: 'var(--lx-accent)' }}
                  />
                </div>

                <span className="text-[11px] font-mono text-gray-400 min-w-[32px] ml-1">
                  {isMuted ? '%0' : `%${Math.round(volume * 100)}`}
                </span>
              </div>

              {/* Geçen Süre / Toplam Süre göstergesi */}
              {streamType !== 'live' ? (
                <div className="text-xs font-semibold text-gray-300 flex items-center space-x-1 pl-1">
                  <span className="font-mono">{formatSeconds(currentTime)}</span>
                  <span className="text-gray-500">/</span>
                  <span className="font-mono">{formatSeconds(duration)}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t('player.liveBadge')}</span>
                </div>
              )}

              {/* Yayın Kalite Rozeti */}
              <div className="hidden sm:flex items-center px-2 py-0.5 rounded-md bg-black/60 border border-white/15 text-[10px] font-mono font-bold text-gray-300">
                {videoQuality}
              </div>
            </div>

            {/* === SAĞ KANAT (Masaüstü Araçları & Modlar) === */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 flex-shrink-0">
              {/* Oynatma Hızı Seçicisi (1.0x -> 1.25x -> 1.5x -> 2.0x) */}
              {streamType !== 'live' && (
                <button
                  onClick={cyclePlaybackSpeed}
                  onMouseEnter={playHoverSound}
                  className="px-2.5 py-1 rounded-lg bg-black/50 hover:bg-black/80 border border-white/20 text-xs font-mono font-bold text-gray-200 hover:text-white transition-colors"
                  title={t('player.speed')}
                >
                  {playbackSpeed === 1 ? '1.0x' : `${playbackSpeed}x`}
                </button>
              )}

              {/* Hızlı Bölüm / Kanal Menüsü Butonu */}
              {(streamType === 'series' || streamType === 'live') && (
                <button
                  onClick={() => {
                    playClickSound();
                    setIsQuickMenuOpen(!isQuickMenuOpen);
                  }}
                  onMouseEnter={playHoverSound}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    isQuickMenuOpen
                      ? 'bg-theme border-theme text-white shadow-theme-glow'
                      : 'bg-black/50 hover:bg-black/80 border-white/20 text-gray-200 hover:text-white'
                  }`}
                  title={streamType === 'series' ? t('player.quickEpisodes') : t('player.quickChannels')}
                >
                  <ListVideo size={15} />
                  <span className="hidden md:inline">
                    {streamType === 'series' ? t('player.quickEpisodes') : t('player.quickChannels')}
                  </span>
                </button>
              )}

              {/* Ses & Altyazı Butonu (Sağ Alt Barda) */}
              <button
                onClick={() => {
                  playClickSound();
                  setIsAudioSubModalOpen(true);
                }}
                onMouseEnter={playHoverSound}
                className="px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/80 border border-white/20 text-xs text-gray-200 hover:text-white font-semibold flex items-center space-x-1.5 transition-colors"
                title={t('player.audioSubs')}
              >
                <Subtitles size={15} className="text-theme" />
                <span className="hidden lg:inline">{t('player.audioSubs')}</span>
              </button>

              {/* Resim İçinde Resim (PiP) */}
              <button
                onClick={togglePiP}
                onMouseEnter={playHoverSound}
                className="p-2 rounded-xl bg-black/50 hover:bg-black/80 border border-white/20 text-gray-300 hover:text-white transition-colors"
                title={t('player.pip')}
              >
                <PictureInPicture size={16} />
              </button>

              {/* Ekran Oranı (FIT / FILL / ZOOM) */}
              <button
                onClick={toggleAspectRatio}
                onMouseEnter={playHoverSound}
                className="px-2.5 py-1 rounded-xl bg-black/50 hover:bg-black/80 border border-white/20 text-[11px] font-bold text-gray-300 uppercase transition-colors"
                title={t('player.aspectRatio')}
              >
                {aspectRatio === 'fit' ? 'FIT' : aspectRatio === 'fill' ? 'FILL' : 'ZOOM'}
              </button>

              {/* Tam Ekran Butonu */}
              <button
                onClick={toggleFullscreen}
                onMouseEnter={playHoverSound}
                className="p-2 rounded-xl bg-black/50 hover:bg-black/80 border border-white/20 text-gray-300 hover:text-white transition-colors"
                title={isFullscreen ? t('player.exitFullscreen') : t('player.fullscreen')}
              >
                {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. HIZLI BÖLÜM / KANAL MENÜSÜ ÇEKMECESİ (Hiyerarşik Kategori & Kanal Ağacı) */}
      {isQuickMenuOpen && (
        <div className="absolute top-0 right-0 h-full w-80 sm:w-96 bg-[#13131A]/95 backdrop-blur-2xl border-l border-[#262638] z-50 p-5 flex flex-col shadow-2xl animate-fade-in pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#262638]">
            <div className="flex items-center space-x-2.5 min-w-0">
              {streamType === 'series' ? (
                <>
                  <Clapperboard size={18} className="text-theme flex-shrink-0" />
                  <h2 className="text-sm font-bold text-white truncate">
                    {t('player.quickEpisodes')}
                  </h2>
                </>
              ) : (
                <>
                  <Tv size={18} className="text-theme flex-shrink-0" />
                  <h2 className="text-sm font-bold text-white truncate">
                    {liveDrawerView === 'categories'
                      ? t('live.allCategories')
                      : liveCategoryNameMap[selectedLiveCategoryId] || t('player.quickChannels')}
                  </h2>
                </>
              )}
            </div>

            <button
              onClick={() => {
                playClickSound();
                setIsQuickMenuOpen(false);
              }}
              onMouseEnter={playHoverSound}
              className="p-1.5 rounded-lg bg-[#181824] hover:bg-[#202030] border border-[#262638] text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2"
            >
              <X size={16} />
            </button>
          </div>

          {/* DİZİLER: Sezon Sekmeleri */}
          {streamType === 'series' && quickSeasons.length > 0 && (
            <div className="py-2.5 flex items-center space-x-2 border-b border-[#262638] overflow-x-auto scrollbar-none flex-shrink-0">
              {quickSeasons.map((s) => (
                <button
                  key={s.season_number}
                  onClick={() => {
                    playClickSound();
                    setSelectedQuickSeason(s.season_number);
                  }}
                  onMouseEnter={playHoverSound}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedQuickSeason === s.season_number
                      ? 'pill-theme-active'
                      : 'bg-[#181824] text-gray-400 hover:text-white border border-[#262638]'
                  }`}
                >
                  {s.name || `Sezon ${s.season_number}`}
                </button>
              ))}
            </div>
          )}

          {/* CANLI TV: Hiyerarşik Üst Bar & Geri Tuşu (1. ve 2. ve 3. Adım) */}
          {streamType === 'live' && (
            <div className="py-2.5 border-b border-[#262638] flex items-center justify-between flex-shrink-0">
              {liveDrawerView === 'channels' ? (
                <button
                  onClick={() => {
                    playClickSound();
                    setQuickMenuSearch('');
                    setLiveDrawerView('categories');
                  }}
                  onMouseEnter={playHoverSound}
                  className="flex items-center space-x-1.5 text-xs font-bold text-theme hover:underline group"
                >
                  <ArrowLeftCircle size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span>{t('player.allCategoriesBack')}</span>
                </button>
              ) : (
                <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-300">
                  <Layers size={14} className="text-theme" />
                  <span>Kategori Seçin</span>
                </div>
              )}

              {liveDrawerView === 'channels' && (
                <span className="text-[11px] font-semibold text-gray-400 truncate max-w-[140px]">
                  {liveCategoryNameMap[selectedLiveCategoryId] || 'Mevcut Kategori'}
                </span>
              )}
            </div>
          )}

          {/* Arama Kutusu */}
          <div className="py-3 border-b border-[#262638] flex-shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                value={quickMenuSearch}
                onChange={(e) => setQuickMenuSearch(e.target.value)}
                placeholder={
                  streamType === 'series'
                    ? 'Bölüm ara...'
                    : liveDrawerView === 'categories'
                    ? 'Kategori ara...'
                    : 'Kanal ara...'
                }
                className="w-full pl-9 pr-8 py-2 bg-[#181824] border border-[#262638] focus:border-theme rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-colors"
              />
              {quickMenuSearch && (
                <button
                  onClick={() => setQuickMenuSearch('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Liste İçeriği */}
          <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-2">
            {streamType === 'series' ? (
              // Dizi Bölümleri Listesi
              currentQuickSeason?.episodes && currentQuickSeason.episodes.length > 0 ? (
                currentQuickSeason.episodes.map((ep) => {
                  const isCurrent =
                    currentEpisodeIndex >= 0 &&
                    allEpisodes[currentEpisodeIndex]?.id === ep.id;

                  return (
                    <div
                      key={ep.id}
                      onClick={() => {
                        playClickSound();
                        playEpisodeItem({
                          ...ep,
                          seasonNumber: currentQuickSeason.season_number,
                        });
                        setIsQuickMenuOpen(false);
                      }}
                      onMouseEnter={playHoverSound}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-theme/20 border-theme text-white shadow-theme-glow ring-1 ring-theme'
                          : 'bg-[#181824] hover:bg-[#202030] border-[#262638] text-gray-300 hover:text-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold truncate">
                          {ep.episode_num}. {ep.title}
                        </div>
                        {ep.duration && (
                          <div className="text-[10px] text-gray-400 mt-0.5">{ep.duration}</div>
                        )}
                      </div>
                      {isCurrent && <Check size={16} className="text-theme flex-shrink-0" />}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  Bu sezon için bölüm bulunamadı.
                </div>
              )
            ) : liveDrawerView === 'categories' ? (
              // CANLI TV 3. ADIM: Tüm Kategoriler Listesi
              filteredCategoriesInView.map((cat) => {
                const isSelected = sanitizeId(cat.category_id) === sanitizeId(selectedLiveCategoryId);
                const count = liveCategoryCounts[sanitizeId(cat.category_id)] || 0;

                return (
                  <div
                    key={cat.category_id}
                    onClick={() => {
                      playClickSound();
                      setSelectedLiveCategoryId(cat.category_id);
                      setQuickMenuSearch('');
                      setLiveDrawerView('channels');
                    }}
                    onMouseEnter={playHoverSound}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-theme/20 border-theme text-white shadow-theme-glow ring-1 ring-theme'
                        : 'bg-[#181824] hover:bg-[#202030] border-[#262638] text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold truncate pr-2">
                      {cat.category_name}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#09090D] border border-[#262638] text-gray-400 flex-shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })
            ) : (
              // CANLI TV 1. ADIM: Doğrudan O An İzlenen Kategorinin Kanalları
              filteredChannelsInView.length > 0 ? (
                filteredChannelsInView.map((ch) => {
                  const isCurrent =
                    sanitizeId(ch.stream_id || ch.id) ===
                    sanitizeId(currentStream?.stream_id || currentStream?.id);

                  return (
                    <div
                      key={ch.stream_id || ch.id}
                      onClick={() => {
                        playClickSound();
                        playContent(ch, 'live');
                      }}
                      onMouseEnter={playHoverSound}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-theme/20 border-theme text-white shadow-theme-glow ring-1 ring-theme'
                          : 'bg-[#181824] hover:bg-[#202030] border-[#262638] text-gray-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-lg bg-black/40 border border-[#262638] p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={ch.stream_icon}
                            alt={ch.name}
                            onError={(e) => {
                              e.currentTarget.src = './logo.svg';
                            }}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="text-xs font-bold truncate">{ch.name}</div>
                      </div>
                      {isCurrent && <Check size={15} className="text-theme flex-shrink-0" />}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  {t('live.noChannels')}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* 5. KİLİTLİ EKRAN YÜZEN BİLDİRİMİ */}
      {isLocked && (
        <div className="absolute top-12 right-6 z-50 animate-fade-in">
          <button
            onClick={() => {
              playClickSound();
              setIsLocked(false);
            }}
            onMouseEnter={playHoverSound}
            className="px-4 py-2.5 rounded-xl bg-theme hover:bg-theme-hover text-white text-xs font-bold flex items-center space-x-2 shadow-theme-glow backdrop-blur-xl transition-all"
          >
            <Unlock size={16} />
            <span>{t('player.unlockScreen')}</span>
          </button>
        </div>
      )}

      {/* 6. GERÇEK SES & ALTYAZI MODALI */}
      <AudioSubtitleModal
        isOpen={isAudioSubModalOpen}
        onClose={() => setIsAudioSubModalOpen(false)}
        audioTracks={audioTracks}
        currentAudioIndex={currentAudioIndex}
        onSelectAudio={handleSelectAudio}
        subtitleTracks={subtitleTracks}
        currentSubtitleIndex={currentSubtitleIndex}
        onSelectSubtitle={handleSelectSubtitle}
        onLoadLocalSubtitle={handleLoadLocalSubtitle}
        diagnosticReport={subtitleDiagnostic}
      />
    </div>
  );
}
