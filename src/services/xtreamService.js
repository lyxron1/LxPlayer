// Xtream Codes & Dynamic IPTV Categories Service with 12-Hour Cache

import {
  DEMO_LIVE_CHANNELS,
  DEMO_MOVIES,
  DEMO_CATEGORIES,
  DEMO_VOD_CATEGORIES,
} from './demoData.js';
import {
  getCachedData,
  setCachedData,
  clearAllCache,
  getLastSyncTime,
  setLastSyncTime,
  isCacheValid,
} from './storageService.js';

export { clearAllCache };

/**
 * Requirement: Xtream API ID sanitize rule
 * Strips trailing '.0' from any ID (e.g. 102.0 -> 102)
 */
export function sanitizeId(id) {
  if (id === null || id === undefined) return '';
  return id.toString().replace(/\.0$/, '').trim();
}

/**
 * Normalizes any API response to a safe JavaScript Array.
 * Handles objects, associative maps ({ "0": ..., "1": ... }), and null/undefined.
 */
export function toSafeArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') {
    // Check for error responses
    if (data.status === 'error' || data.error || data.message) return [];
    return Object.values(data);
  }
  return [];
}

/**
 * Clean & normalize base URL
 */
export function normalizeServerUrl(url) {
  if (!url) return '';
  let clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'http://' + clean;
  }
  return clean.replace(/\/+$/, '');
}

/**
 * Builds playable stream URL with fallback extension support
 */
export function buildStreamUrl(profile, streamId, type = 'live', extension = 'ts') {
  if (!profile || !profile.serverUrl || profile.isDemo) {
    return null;
  }
  const cleanId = sanitizeId(streamId);
  const server = normalizeServerUrl(profile.serverUrl);
  const u = encodeURIComponent(profile.username || '');
  const p = encodeURIComponent(profile.password || '');

  if (type === 'live') {
    return extension ? `${server}/live/${u}/${p}/${cleanId}.${extension}` : `${server}/live/${u}/${p}/${cleanId}`;
  } else if (type === 'movie') {
    return `${server}/movie/${u}/${p}/${cleanId}.${extension || 'mp4'}`;
  } else if (type === 'series') {
    return `${server}/series/${u}/${p}/${cleanId}.${extension || 'mp4'}`;
  }
  return `${server}/${u}/${p}/${cleanId}`;
}

/**
 * Authenticate with Xtream Server
 */
export async function authenticateXtream(serverUrl, username, password) {
  const server = normalizeServerUrl(serverUrl);
  const apiUrl = `${server}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

  const response = await fetch(apiUrl, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Sunucu yanıt vermedi: ${response.status}`);
  }
  const data = await response.json();
  if (data && data.user_info && data.user_info.auth === 1) {
    return data;
  } else {
    throw new Error('Kullanıcı adı veya şifre hatalı!');
  }
}

/**
 * Fetch DYNAMIC Live Categories from Xtream Server
 */
export async function fetchLiveCategories(profile, forceRefresh = false) {
  if (!profile || profile.isDemo || !profile.serverUrl) {
    return DEMO_CATEGORIES;
  }

  const cacheKey = `cat_live_${profile.id}`;
  if (!forceRefresh && isCacheValid(profile.id)) {
    const cached = await getCachedData(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  }

  try {
    const server = normalizeServerUrl(profile.serverUrl);
    const url = `${server}/player_api.php?username=${encodeURIComponent(profile.username)}&password=${encodeURIComponent(profile.password)}&action=get_live_categories`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const list = toSafeArray(data);
      if (list.length > 0) {
        const sanitized = list
          .filter((c) => c && (c.category_id !== undefined || c.id !== undefined))
          .map((c) => ({
            category_id: sanitizeId(c.category_id || c.id),
            category_name: c.category_name || c.name || 'Kategori',
          }));
        await setCachedData(cacheKey, sanitized);
        return sanitized;
      }
    }
  } catch (err) {
    console.warn('Fetch live categories error:', err);
  }

  const cached = await getCachedData(cacheKey);
  return Array.isArray(cached) ? cached : [];
}

/**
 * Fetch DYNAMIC VOD Movie Categories from Xtream Server
 */
export async function fetchVodCategories(profile, forceRefresh = false) {
  if (!profile || profile.isDemo || !profile.serverUrl) {
    return DEMO_VOD_CATEGORIES;
  }

  const cacheKey = `cat_vod_${profile.id}`;
  if (!forceRefresh && isCacheValid(profile.id)) {
    const cached = await getCachedData(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  }

  try {
    const server = normalizeServerUrl(profile.serverUrl);
    const url = `${server}/player_api.php?username=${encodeURIComponent(profile.username)}&password=${encodeURIComponent(profile.password)}&action=get_vod_categories`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const list = toSafeArray(data);
      if (list.length > 0) {
        const sanitized = list
          .filter((c) => c && (c.category_id !== undefined || c.id !== undefined))
          .map((c) => ({
            category_id: sanitizeId(c.category_id || c.id),
            category_name: c.category_name || c.name || 'Kategori',
          }));
        await setCachedData(cacheKey, sanitized);
        return sanitized;
      }
    }
  } catch (err) {
    console.warn('Fetch VOD categories error:', err);
  }

  const cached = await getCachedData(cacheKey);
  return Array.isArray(cached) ? cached : [];
}

/**
 * Fetch DYNAMIC Series Categories from Xtream Server
 */
export async function fetchSeriesCategories(profile, forceRefresh = false) {
  if (!profile || profile.isDemo || !profile.serverUrl) {
    return [];
  }

  const cacheKey = `cat_series_${profile.id}`;
  if (!forceRefresh && isCacheValid(profile.id)) {
    const cached = await getCachedData(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  }

  try {
    const server = normalizeServerUrl(profile.serverUrl);
    const url = `${server}/player_api.php?username=${encodeURIComponent(profile.username)}&password=${encodeURIComponent(profile.password)}&action=get_series_categories`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const list = toSafeArray(data);
      if (list.length > 0) {
        const sanitized = list
          .filter((c) => c && (c.category_id !== undefined || c.id !== undefined))
          .map((c) => ({
            category_id: sanitizeId(c.category_id || c.id),
            category_name: c.category_name || c.name || 'Kategori',
          }));
        await setCachedData(cacheKey, sanitized);
        return sanitized;
      }
    }
  } catch (err) {
    console.warn('Fetch series categories error:', err);
  }

  const cached = await getCachedData(cacheKey);
  return Array.isArray(cached) ? cached : [];
}

/**
 * Fetch Live Channels with 12-Hour Cache
 */
export async function fetchLiveStreams(profile, forceRefresh = false) {
  if (!profile || profile.isDemo || !profile.serverUrl) {
    return DEMO_LIVE_CHANNELS;
  }

  const cacheKey = `streams_live_${profile.id}`;
  if (!forceRefresh && isCacheValid(profile.id)) {
    const cached = await getCachedData(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  }

  try {
    const server = normalizeServerUrl(profile.serverUrl);
    const url = `${server}/player_api.php?username=${encodeURIComponent(profile.username)}&password=${encodeURIComponent(profile.password)}&action=get_live_streams`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const list = toSafeArray(data);
      if (list.length > 0) {
        const sanitized = list
          .filter((item) => item && (item.stream_id || item.id))
          .map((item) => ({
            ...item,
            stream_id: sanitizeId(item.stream_id || item.id),
            category_id: sanitizeId(item.category_id),
            name: item.name || item.title || 'Kanal',
            stream_icon: item.stream_icon || item.icon || './logo.svg',
          }));
        await setCachedData(cacheKey, sanitized);
        return sanitized;
      }
    }
  } catch (err) {
    console.warn('Live channels fetch failed:', err);
  }

  const cached = await getCachedData(cacheKey);
  return Array.isArray(cached) && cached.length > 0 ? cached : DEMO_LIVE_CHANNELS;
}

/**
 * Fetch VOD Movies with 12-Hour Cache
 */
export async function fetchMovies(profile, forceRefresh = false) {
  if (!profile || profile.isDemo || !profile.serverUrl) {
    return DEMO_MOVIES;
  }

  const cacheKey = `streams_vod_${profile.id}`;
  if (!forceRefresh && isCacheValid(profile.id)) {
    const cached = await getCachedData(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  }

  try {
    const server = normalizeServerUrl(profile.serverUrl);
    const url = `${server}/player_api.php?username=${encodeURIComponent(profile.username)}&password=${encodeURIComponent(profile.password)}&action=get_vod_streams`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const list = toSafeArray(data);
      if (list.length > 0) {
        const sanitized = list
          .filter((item) => item && (item.stream_id || item.id))
          .map((item) => ({
            ...item,
            stream_id: sanitizeId(item.stream_id || item.id),
            category_id: sanitizeId(item.category_id),
            name: item.name || item.title || 'Film',
            stream_icon: item.stream_icon || item.cover || './logo.svg',
          }));
        await setCachedData(cacheKey, sanitized);
        return sanitized;
      }
    }
  } catch (err) {
    console.warn('VOD fetch failed:', err);
  }

  const cached = await getCachedData(cacheKey);
  return Array.isArray(cached) ? cached : [];
}

/**
 * Fetch Detailed VOD Movie Info (including audio and subtitle metadata)
 */
export async function fetchVodInfo(profile, vodId) {
  if (!profile || profile.isDemo || !profile.serverUrl || !vodId) {
    return null;
  }
  const cleanId = sanitizeId(vodId);
  const cacheKey = `vod_info_${profile.id}_${cleanId}`;
  const cached = await getCachedData(cacheKey);
  if (cached && typeof cached === 'object') return cached;

  try {
    const server = normalizeServerUrl(profile.serverUrl);
    const url = `${server}/player_api.php?username=${encodeURIComponent(profile.username)}&password=${encodeURIComponent(profile.password)}&action=get_vod_info&vod_id=${cleanId}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        await setCachedData(cacheKey, data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Fetch VOD info failed:', err);
  }
  return null;
}

/**
 * Fetch Series with 12-Hour Cache
 */
export async function fetchSeries(profile, forceRefresh = false) {
  if (!profile || profile.isDemo || !profile.serverUrl) {
    return [];
  }

  const cacheKey = `streams_series_${profile.id}`;
  if (!forceRefresh && isCacheValid(profile.id)) {
    const cached = await getCachedData(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  }

  try {
    const server = normalizeServerUrl(profile.serverUrl);
    const url = `${server}/player_api.php?username=${encodeURIComponent(profile.username)}&password=${encodeURIComponent(profile.password)}&action=get_series`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const list = toSafeArray(data);
      if (list.length > 0) {
        const sanitized = list
          .filter((item) => item && (item.series_id || item.id))
          .map((item) => ({
            ...item,
            series_id: sanitizeId(item.series_id || item.id),
            category_id: sanitizeId(item.category_id),
            name: item.name || item.title || 'İsimsiz Dizi',
            stream_icon: item.stream_icon || item.cover || './logo.svg',
          }));
        await setCachedData(cacheKey, sanitized);
        return sanitized;
      }
    }
  } catch (err) {
    console.warn('Series fetch failed:', err);
  }

  const cached = await getCachedData(cacheKey);
  return Array.isArray(cached) ? cached : [];
}

/**
 * Fetch Detailed Series Info (Seasons & Episodes)
 */
export async function fetchSeriesInfo(profile, seriesId) {
  if (!profile || profile.isDemo || !profile.serverUrl || !seriesId) {
    return null;
  }
  const cleanId = sanitizeId(seriesId);
  try {
    const server = normalizeServerUrl(profile.serverUrl);
    const url = `${server}/player_api.php?username=${encodeURIComponent(profile.username)}&password=${encodeURIComponent(profile.password)}&action=get_series_info&series_id=${cleanId}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        return data;
      }
    }
  } catch (err) {
    console.warn('Fetch series info failed:', err);
  }
  return null;
}

/**
 * Full Sync Helper for Splash Screen
 * Enforces 12-Hour Smart Sync logic
 */
export async function syncProfileLibrary(profile, onProgress) {
  if (!profile || profile.isDemo) {
    onProgress?.(50, 'Açık kaynak test yayınları doğrulanıyor...');
    await new Promise((r) => setTimeout(r, 200));
    onProgress?.(100, 'Test kütüphanesi hazır.');
    return { liveCount: DEMO_LIVE_CHANNELS.length, vodCount: DEMO_MOVIES.length, seriesCount: 0 };
  }

  const profileId = profile.id;
  const isFresh = isCacheValid(profileId);

  if (isFresh) {
    onProgress?.(40, '12 saatlik yerel önbellek doğrulanıyor...');
    const [live, vod, series] = await Promise.all([
      getCachedData(`streams_live_${profileId}`),
      getCachedData(`streams_vod_${profileId}`),
      getCachedData(`streams_series_${profileId}`),
    ]);

    if (live && Array.isArray(live) && live.length > 0) {
      onProgress?.(80, 'Önbellek hazır. Başlatılıyor...');
      await new Promise((r) => setTimeout(r, 250));
      onProgress?.(100, 'Tamamlandı.');
      return {
        liveCount: live.length,
        vodCount: Array.isArray(vod) ? vod.length : 0,
        seriesCount: Array.isArray(series) ? series.length : 0,
      };
    }
  }

  // Not fresh or missing data: Full 12-Hour Sync
  onProgress?.(20, 'Xtream sunucusuna bağlanılıyor...');
  await Promise.all([
    fetchLiveCategories(profile, true),
    fetchVodCategories(profile, true),
    fetchSeriesCategories(profile, true),
  ]);

  onProgress?.(45, 'Canlı yayınlar eşitleniyor...');
  const live = await fetchLiveStreams(profile, true);

  onProgress?.(70, 'Filmler ve diziler eşitleniyor...');
  const [vod, series] = await Promise.all([
    fetchMovies(profile, true),
    fetchSeries(profile, true),
  ]);

  setLastSyncTime(profileId);
  onProgress?.(100, 'Kütüphane başarıyla senkronize edildi.');

  return {
    liveCount: Array.isArray(live) ? live.length : 0,
    vodCount: Array.isArray(vod) ? vod.length : 0,
    seriesCount: Array.isArray(series) ? series.length : 0,
  };
}
