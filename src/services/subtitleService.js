// Subtitle Service for LxPlayer PC
// Supports SRT, WebVTT, TTML formats, character encoding detection (UTF-8, Windows-1254/Turkish),
// Xtream provider subtitle resolution, and local external subtitle file loading.

import { normalizeServerUrl, sanitizeId } from './xtreamService.js';

export const SUPPORTED_SUBTITLE_FORMATS = [
  'SubRip (.srt)',
  'WebVTT (.vtt)',
  'TTML / XML (.ttml, .xml)',
  'HLS Gömülü Altyazı (CEA-608 / WebVTT)',
];

/**
 * Converts timestamp string (HH:MM:SS,mmm or HH:MM:SS.mmm or MM:SS.mmm) to seconds.
 */
export function parseTimestampToSeconds(timeStr) {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().replace(',', '.');
  const parts = cleaned.split(':');

  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  } else if (parts.length === 1) {
    return parseFloat(parts[0]) || 0;
  }
  return 0;
}

/**
 * Formats seconds into WebVTT timestamp (HH:MM:SS.mmm)
 */
export function formatSecondsToVttTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00:00.000';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const pad = (num, size = 2) => String(num).padStart(size, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
}

/**
 * Decodes array buffer with encoding fallback (UTF-8 -> Windows-1254 / ISO-8859-9 for Turkish)
 */
export function decodeSubtitleBuffer(buffer) {
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
    const utf8Text = utf8Decoder.decode(buffer);

    // If replacement characters (\uFFFD) appear, text likely has Windows-1254 / Turkish encoding
    if (utf8Text.includes('\uFFFD')) {
      try {
        const winDecoder = new TextDecoder('windows-1254', { fatal: false });
        const winText = winDecoder.decode(buffer);
        return winText;
      } catch {
        // Fallback to ISO-8859-9 or keep utf8Text
        try {
          const isoDecoder = new TextDecoder('iso-8859-9', { fatal: false });
          return isoDecoder.decode(buffer);
        } catch {
          return utf8Text;
        }
      }
    }
    return utf8Text;
  } catch (err) {
    console.warn('Subtitle decoding error:', err);
    return '';
  }
}

/**
 * Sanitizes cue text (cleans styling artifacts while keeping readable linebreaks)
 */
function cleanCueText(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/<font[^>]*>/gi, '')
    .replace(/<\/font>/gi, '')
    .replace(/<b[^>]*>/gi, '')
    .replace(/<\/b>/gi, '')
    .replace(/<i[^>]*>/gi, '')
    .replace(/<\/i>/gi, '')
    .replace(/<u[^>]*>/gi, '')
    .replace(/<\/u>/gi, '')
    .replace(/\{[^\}]+\}/g, '') // remove SSA/ASS override tags e.g. {\an8}
    .trim();
}

/**
 * Parses SRT (SubRip) text into cue objects
 */
export function parseSrt(srtText) {
  if (!srtText) return [];
  const normalized = srtText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);
  const cues = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    const lines = block.split('\n');
    let timeLineIndex = -1;

    for (let l = 0; l < lines.length; l++) {
      if (lines[l].includes('-->')) {
        timeLineIndex = l;
        break;
      }
    }

    if (timeLineIndex === -1) continue;

    const timeLine = lines[timeLineIndex];
    const timeParts = timeLine.split('-->');
    if (timeParts.length !== 2) continue;

    const start = parseTimestampToSeconds(timeParts[0]);
    // Extract end time up to space or newline (skip WebVTT settings if mixed)
    const endRaw = timeParts[1].trim().split(/\s+/)[0];
    const end = parseTimestampToSeconds(endRaw);

    if (isNaN(start) || isNaN(end) || end <= start) continue;

    const textLines = lines.slice(timeLineIndex + 1);
    const text = cleanCueText(textLines.join('\n'));

    if (text) {
      cues.push({
        id: cues.length + 1,
        start,
        end,
        text,
      });
    }
  }

  return cues;
}

/**
 * Parses WebVTT text into cue objects
 */
export function parseVtt(vttText) {
  if (!vttText) return [];
  const normalized = vttText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/^WEBVTT[^\n]*\n/, '');

  return parseSrt(normalized);
}

/**
 * Parses TTML / XML subtitles (<p begin="..." end="...">text</p>)
 */
export function parseTtml(xmlText) {
  if (!xmlText) return [];
  const cues = [];
  try {
    const pRegex = /<p[^>]*\bbegin=["']([^"']+)["'][^>]*\bend=["']([^"']+)["'][^>]*>([\s\S]*?)<\/p>/gi;
    let match;

    while ((match = pRegex.exec(xmlText)) !== null) {
      const start = parseTimestampToSeconds(match[1]);
      const end = parseTimestampToSeconds(match[2]);
      const rawText = match[3]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      const text = cleanCueText(rawText);
      if (text && end > start) {
        cues.push({
          id: cues.length + 1,
          start,
          end,
          text,
        });
      }
    }
  } catch (err) {
    console.warn('TTML parsing failed:', err);
  }
  return cues;
}

/**
 * Auto-detects format and parses subtitle content into normalized cues
 */
export function parseSubtitleContent(content) {
  if (!content || typeof content !== 'string') return [];
  const trimmed = content.trim();

  if (trimmed.startsWith('WEBVTT') || trimmed.includes('-->') && trimmed.includes('NOTE')) {
    return parseVtt(trimmed);
  }
  if (trimmed.includes('<tt') || (trimmed.includes('<p') && trimmed.includes('begin='))) {
    return parseTtml(trimmed);
  }
  return parseSrt(trimmed);
}

/**
 * Converts cues into a WebVTT string
 */
export function cuesToVttString(cues) {
  let vtt = 'WEBVTT\n\n';
  for (let i = 0; i < cues.length; i++) {
    const c = cues[i];
    vtt += `${i + 1}\n`;
    vtt += `${formatSecondsToVttTime(c.start)} --> ${formatSecondsToVttTime(c.end)}\n`;
    vtt += `${c.text}\n\n`;
  }
  return vtt;
}

/**
 * Converts cues into a browser Blob URL for <track src="...">
 */
export function createVttBlobUrl(cues) {
  const vttStr = cuesToVttString(cues);
  const blob = new Blob([vttStr], { type: 'text/vtt;charset=utf-8' });
  return URL.createObjectURL(blob);
}

/**
 * Resolves available subtitles from Xtream Codes API data (VOD info or Series episode info)
 */
export function resolveProviderSubtitles(profile, streamItem, streamType, vodOrSeriesInfo) {
  if (!profile || profile.isDemo || !streamItem) return [];

  const streamId = sanitizeId(streamItem.stream_id || streamItem.id);
  const server = normalizeServerUrl(profile.serverUrl);
  const u = encodeURIComponent(profile.username || '');
  const p = encodeURIComponent(profile.password || '');

  const rawCandidates = [];

  // 1. Check vodOrSeriesInfo structures
  if (vodOrSeriesInfo) {
    // VOD info structure
    if (vodOrSeriesInfo.info?.subtitles) {
      rawCandidates.push(vodOrSeriesInfo.info.subtitles);
    }
    if (vodOrSeriesInfo.movie_data?.subtitles) {
      rawCandidates.push(vodOrSeriesInfo.movie_data.subtitles);
    }
    // Series episode info structure
    if (vodOrSeriesInfo.subtitles) {
      rawCandidates.push(vodOrSeriesInfo.subtitles);
    }
  }

  // 2. Check streamItem directly
  if (streamItem.subtitles) {
    rawCandidates.push(streamItem.subtitles);
  }
  if (streamItem.info?.subtitles) {
    rawCandidates.push(streamItem.info.subtitles);
  }

  // Flatten candidates
  const subEntries = [];
  for (const item of rawCandidates) {
    if (Array.isArray(item)) {
      subEntries.push(...item);
    } else if (item && typeof item === 'object') {
      subEntries.push(...Object.values(item));
    } else if (typeof item === 'string') {
      subEntries.push(item);
    }
  }

  if (subEntries.length === 0) {
    return [];
  }

  const resolvedTracks = [];
  const seenKeys = new Set();

  for (let i = 0; i < subEntries.length; i++) {
    const entry = subEntries[i];
    if (!entry) continue;

    let lang = '';
    let name = '';
    let subUrl = '';
    let ext = 'srt';

    if (typeof entry === 'string') {
      const cleanStr = entry.trim();
      if (!cleanStr) continue;

      if (cleanStr.startsWith('http://') || cleanStr.startsWith('https://')) {
        subUrl = cleanStr;
        ext = cleanStr.split('.').pop()?.toLowerCase() || 'srt';
        name = `Altyazı (${ext.toUpperCase()})`;
      } else if (cleanStr.includes('.')) {
        // Filename or relative path e.g. "sub_1.srt" or "/subtitles/..."
        if (cleanStr.startsWith('/')) {
          subUrl = `${server}${cleanStr}`;
        } else {
          subUrl = `${server}/subtitles/${u}/${p}/${cleanStr}`;
        }
        ext = cleanStr.split('.').pop()?.toLowerCase() || 'srt';
        name = cleanStr;
      } else {
        // Language code like "tr", "tur", "en", "eng"
        lang = cleanStr.toLowerCase();
        name = cleanStr.toUpperCase();
        // Standard Xtream Codes subtitle route:
        subUrl = `${server}/subtitles/${u}/${p}/${streamId}.${cleanStr}.srt`;
      }
    } else if (typeof entry === 'object') {
      lang = (entry.language || entry.lang || entry.code || '').toLowerCase();
      name = entry.name || entry.title || entry.label || (lang ? lang.toUpperCase() : `Altyazı ${i + 1}`);
      ext = entry.extension || entry.ext || 'srt';

      if (entry.url) {
        subUrl = entry.url.startsWith('http') ? entry.url : `${server}${entry.url.startsWith('/') ? '' : '/'}${entry.url}`;
      } else if (entry.path) {
        subUrl = `${server}${entry.path.startsWith('/') ? '' : '/'}${entry.path}`;
      } else if (lang) {
        subUrl = `${server}/subtitles/${u}/${p}/${streamId}.${lang}.${ext}`;
      } else if (entry.id !== undefined) {
        subUrl = `${server}/subtitles/${u}/${p}/${streamId}_${entry.id}.${ext}`;
      }
    }

    if (!subUrl) continue;

    const dedupeKey = `${lang}_${subUrl}`;
    if (seenKeys.has(dedupeKey)) continue;
    seenKeys.add(dedupeKey);

    resolvedTracks.push({
      id: `provider_sub_${resolvedTracks.length}`,
      index: resolvedTracks.length,
      name: name || `Altyazı ${resolvedTracks.length + 1}`,
      lang: lang || 'und',
      language: lang || 'und',
      url: subUrl,
      ext: ext || 'srt',
      isProvider: true,
      source: 'provider',
    });
  }

  return resolvedTracks;
}

/**
 * Fetches and parses a provider subtitle track URL
 */
export async function loadProviderSubtitleCues(track) {
  if (!track || !track.url) return null;
  try {
    const res = await fetch(track.url);
    if (!res.ok) {
      // Try fallback URL without language extension (e.g. {streamId}.srt instead of {streamId}.tr.srt)
      if (track.url.includes(`.${track.lang}.`)) {
        const fallbackUrl = track.url.replace(`.${track.lang}.`, '.');
        const fallbackRes = await fetch(fallbackUrl);
        if (fallbackRes.ok) {
          const buffer = await fallbackRes.arrayBuffer();
          const text = decodeSubtitleBuffer(buffer);
          const cues = parseSubtitleContent(text);
          if (cues.length > 0) {
            return {
              cues,
              vttBlobUrl: createVttBlobUrl(cues),
            };
          }
        }
      }
      console.warn(`Provider subtitle fetch returned status ${res.status}:`, track.url);
      return null;
    }

    const buffer = await res.arrayBuffer();
    const text = decodeSubtitleBuffer(buffer);
    const cues = parseSubtitleContent(text);

    if (cues.length === 0) {
      console.warn('Provider subtitle file downloaded but contained 0 valid cues:', track.url);
      return null;
    }

    return {
      cues,
      vttBlobUrl: createVttBlobUrl(cues),
    };
  } catch (err) {
    console.warn('Failed to fetch provider subtitle track:', err);
    return null;
  }
}

/**
 * Reads and parses a local user-selected subtitle file (.srt, .vtt, .ttml)
 */
export async function loadSubtitleFromFile(file) {
  if (!file) throw new Error('Dosya seçilmedi');

  const buffer = await file.arrayBuffer();
  const text = decodeSubtitleBuffer(buffer);
  const cues = parseSubtitleContent(text);

  if (cues.length === 0) {
    throw new Error('Altyazı dosyası okundu fakat geçerli zaman damgası veya altyazı satırı bulunamadı.');
  }

  // Detect language hint from filename e.g. "film.tr.srt" -> "tr"
  const nameParts = file.name.split('.');
  let langHint = 'und';
  if (nameParts.length >= 3) {
    const possibleLang = nameParts[nameParts.length - 2].toLowerCase();
    if (possibleLang.length === 2 || possibleLang.length === 3) {
      langHint = possibleLang;
    }
  }

  const vttBlobUrl = createVttBlobUrl(cues);

  return {
    id: `local_sub_${Date.now()}`,
    name: file.name.replace(/\.[^.]+$/, ''),
    filename: file.name,
    lang: langHint,
    language: langHint,
    isLocal: true,
    source: 'local',
    cues,
    vttBlobUrl,
  };
}

/**
 * Builds Technical Diagnostic Report for subtitles (Requirement 5)
 */
export function generateSubtitleDiagnostic({
  streamType = 'movie',
  streamName = '',
  hlsTracks = [],
  nativeTracks = [],
  providerTracks = [],
  localTracks = [],
  hasProviderSubs = false,
  activeTrack = null,
}) {
  const total = hlsTracks.length + nativeTracks.length + providerTracks.length + localTracks.length;
  const embeddedCount = hlsTracks.length + nativeTracks.length;
  const providerCount = providerTracks.length;
  const localCount = localTracks.length;

  let reason = '';
  if (total === 0) {
    if (streamType === 'live') {
      reason = 'Canlı TV akışlarında altyazı yayıncı/sunucu tarafından sağlanmamaktadır (HLS altyazı akışı bulunamadı).';
    } else if (hasProviderSubs === false) {
      reason = 'IPTV sağlayıcısı (Xtream Codes) bu film/dizi içeriği için altyazı metadata veya harici altyazı kaydı tanımlamamıştır.';
    } else {
      reason = 'Sağlayıcı altyazı listesi bildirdi ancak altyazı dosyalarına sunucu üzerinden erişilemedi veya dosya boş döndü.';
    }
  } else {
    reason = `${total} adet altyazı izi başarıyla algılandı ve oynatıcıya bağlandı.`;
  }

  return {
    totalTracksDetected: total,
    embeddedCount,
    providerCount,
    localCount,
    streamType,
    streamName,
    reason,
    supportedFormats: SUPPORTED_SUBTITLE_FORMATS,
    activeTrackName: activeTrack?.name || 'Kapalı',
    hlsTracks: hlsTracks.map((t, idx) => ({ id: idx, name: t.name, lang: t.lang || t.language })),
    providerTracks: providerTracks.map((t) => ({ name: t.name, lang: t.lang, url: t.url })),
    localTracks: localTracks.map((t) => ({ name: t.name, lang: t.lang })),
    timestamp: new Date().toLocaleTimeString('tr-TR'),
  };
}
