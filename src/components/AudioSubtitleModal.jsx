import React, { useState, useRef } from 'react';
import {
  X,
  Volume2,
  Subtitles,
  Palette,
  Check,
  AlertCircle,
  Upload,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';
import { useApp } from '../context/AppContext';
import { formatTrackName } from '../utils/i18n';

export default function AudioSubtitleModal({
  isOpen,
  onClose,
  audioTracks = [],
  currentAudioIndex = -1,
  onSelectAudio,
  subtitleTracks = [],
  currentSubtitleIndex = -1,
  onSelectSubtitle,
  onLoadLocalSubtitle,
  diagnosticReport = null,
}) {
  const [activeTab, setActiveTab] = useState('audio'); // 'audio', 'subtitle', 'style'
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const fileInputRef = useRef(null);

  const {
    showSubtitles,
    setShowSubtitles,
    subSize,
    setSubSize,
    subColor,
    setSubColor,
    t,
  } = useApp();

  if (!isOpen) return null;

  const fontSizes = [
    { id: 'small', label: 'Küçük' },
    { id: 'normal', label: 'Normal' },
    { id: 'large', label: 'Büyük' },
    { id: 'xlarge', label: 'Çok Büyük' },
  ];

  const fontColors = [
    { id: 'white', label: 'Beyaz', bg: 'bg-white' },
    { id: 'yellow', label: 'Sarı', bg: 'bg-yellow-400' },
    { id: 'cyan', label: 'Camgöbeği', bg: 'bg-cyan-400' },
    { id: 'green', label: 'Yeşil', bg: 'bg-emerald-400' },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && onLoadLocalSubtitle) {
      playClickSound();
      onLoadLocalSubtitle(file);
    }
    // Reset file input so user can choose the same file again if desired
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#13131A] border border-[#262638] rounded-2xl w-full max-w-lg p-6 relative shadow-theme-glow max-h-[90vh] flex flex-col">
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          onMouseEnter={playHoverSound}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#181824]"
        >
          <X size={18} />
        </button>

        <h2 className="text-base font-bold text-white mb-4">
          {t('player.audioSubs')}
        </h2>

        {/* Tab Header */}
        <div className="grid grid-cols-3 gap-1 bg-[#181824] p-1 rounded-xl mb-4 border border-[#262638] flex-shrink-0">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('audio');
            }}
            onMouseEnter={playHoverSound}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors ${
              activeTab === 'audio'
                ? 'pill-theme-active'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Volume2 size={14} />
            <span>{t('player.audioTracks')}</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('subtitle');
            }}
            onMouseEnter={playHoverSound}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors ${
              activeTab === 'subtitle'
                ? 'pill-theme-active'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Subtitles size={14} />
            <span>{t('player.subtitleTracks')}</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('style');
            }}
            onMouseEnter={playHoverSound}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors ${
              activeTab === 'style'
                ? 'pill-theme-active'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Palette size={14} />
            <span>{t('player.subStyle')}</span>
          </button>
        </div>

        {/* Tab 1: Ses Dilleri (Gerçek Algılanan Ses İzleri) */}
        {activeTab === 'audio' && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 flex-1">
            {audioTracks.length === 0 ? (
              <div
                onClick={() => {
                  playClickSound();
                  onSelectAudio?.(0);
                }}
                className="p-3.5 rounded-xl border border-theme bg-theme-soft text-white text-xs flex items-center justify-between"
              >
                <span>{t('player.defaultAudio')} (Stereo)</span>
                <Check size={16} className="text-theme" />
              </div>
            ) : (
              audioTracks.map((track, idx) => {
                const isSelected = currentAudioIndex === idx;
                const trackLabel = formatTrackName(track, idx, 'audio');

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      playClickSound();
                      onSelectAudio?.(idx);
                    }}
                    onMouseEnter={playHoverSound}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'bg-theme-soft border-theme text-white'
                        : 'bg-[#181824] border-[#262638] text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="font-medium">{trackLabel}</span>
                    {isSelected && <Check size={16} className="text-theme" />}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Altyazı Dilleri & Harici Altyazı Yükleme */}
        {activeTab === 'subtitle' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 flex-1">
            {/* 1. Altyazı Kapalı Seçeneği */}
            <div
              onClick={() => {
                playClickSound();
                onSelectSubtitle?.(-1);
                setShowSubtitles(false);
              }}
              onMouseEnter={playHoverSound}
              className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                currentSubtitleIndex === -1
                  ? 'bg-theme-soft border-theme text-white'
                  : 'bg-[#181824] border-[#262638] text-gray-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">{t('player.subOff')}</span>
              </div>
              {currentSubtitleIndex === -1 && <Check size={16} className="text-theme" />}
            </div>

            {/* 2. Mevcut Altyazı İzleri Listesi */}
            {subtitleTracks.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#181824] border border-[#262638] text-center my-1">
                <AlertCircle size={22} className="text-amber-500/80 mx-auto mb-1.5" />
                <div className="text-xs font-semibold text-gray-300">
                  {t('player.noSubtitles')}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Akış veya IPTV sağlayıcısı üzerinde bu içerik için tanımlı altyazı izi bulunamadı.
                </div>
              </div>
            ) : (
              subtitleTracks.map((sub, idx) => {
                const isSelected = currentSubtitleIndex === idx;
                const subLabel = formatTrackName(sub, idx, 'subtitle');

                const sourceLabel = sub.isLocal
                  ? 'Harici Dosya'
                  : sub.isProvider
                  ? 'Xtream Sağlayıcı'
                  : 'Gömülü Akış';

                return (
                  <div
                    key={sub.id || idx}
                    onClick={() => {
                      playClickSound();
                      onSelectSubtitle?.(idx);
                      setShowSubtitles(true);
                    }}
                    onMouseEnter={playHoverSound}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'bg-theme-soft border-theme text-white'
                        : 'bg-[#181824] border-[#262638] text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <span className="font-medium truncate">{subLabel}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0D0D14] text-gray-400 border border-[#262638] flex-shrink-0">
                        {sourceLabel}
                      </span>
                    </div>
                    {isSelected && <Check size={16} className="text-theme flex-shrink-0" />}
                  </div>
                );
              })
            )}

            {/* 3. Harici Altyazı Dosyası Yükleme Butonu (.srt, .vtt, .ttml) */}
            <div className="pt-2 border-t border-[#262638]">
              <input
                ref={fileInputRef}
                type="file"
                accept=".srt,.vtt,.ttml,.xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => {
                  playClickSound();
                  fileInputRef.current?.click();
                }}
                onMouseEnter={playHoverSound}
                className="w-full py-2.5 px-3 rounded-xl bg-[#181824] hover:bg-[#202030] border border-dashed border-[#3A3A50] hover:border-theme text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center space-x-2 transition-all"
              >
                <Upload size={14} className="text-theme" />
                <span>Harici Altyazı Dosyası Yükle (.srt, .vtt, .ttml)</span>
              </button>
            </div>

            {/* 4. Teknik Teşhis Raporu Butonu & Paneli (Requirement 5) */}
            <div className="pt-1">
              <button
                onClick={() => {
                  playClickSound();
                  setShowDiagnostic(!showDiagnostic);
                }}
                className="w-full text-left flex items-center justify-between text-[11px] font-semibold text-gray-400 hover:text-gray-200 py-1 transition-colors"
              >
                <div className="flex items-center space-x-1.5">
                  <Info size={13} className="text-theme" />
                  <span>Teknik Altyazı Teşhis Raporu</span>
                </div>
                {showDiagnostic ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showDiagnostic && (
                <div className="mt-2 p-3 rounded-xl bg-[#0D0D14] border border-[#262638] text-[11px] font-mono text-gray-300 space-y-1.5 animate-fade-in">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-500">Tespit Edilen İz Sayısı:</span>
                    <span className="font-bold text-white">
                      {diagnosticReport?.totalTracksDetected ?? subtitleTracks.length}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-500">Gömülü İzler:</span>
                    <span>{diagnosticReport?.embeddedCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-500">Sağlayıcı İzleri:</span>
                    <span>{diagnosticReport?.providerCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-500">Yerel Dosya İzleri:</span>
                    <span>{diagnosticReport?.localCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-gray-500">Aktif Altyazı:</span>
                    <span className="text-theme font-bold">
                      {currentSubtitleIndex >= 0 && subtitleTracks[currentSubtitleIndex]
                        ? subtitleTracks[currentSubtitleIndex].name
                        : 'Kapalı'}
                    </span>
                  </div>
                  <div className="pt-1 text-[10px] text-gray-400 leading-normal">
                    <span className="text-gray-500 block mb-0.5 font-bold">Durum Analizi:</span>
                    {diagnosticReport?.reason || 'Altyazı sistemi aktif olarak çalışıyor.'}
                  </div>
                  <div className="pt-1 text-[10px] text-gray-500">
                    <span className="font-bold block text-gray-400 mb-0.5">Desteklenen Formatlar:</span>
                    SubRip (.srt), WebVTT (.vtt), TTML (.ttml, .xml), HLS Embedded
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Stil & Boyut Ayarları */}
        {activeTab === 'style' && (
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1 flex-1">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                Yazı Boyutu (Font Size)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {fontSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => {
                      playClickSound();
                      setSubSize(size.id);
                    }}
                    onMouseEnter={playHoverSound}
                    className={`py-2 px-1 rounded-xl text-xs font-medium border transition-colors ${
                      subSize === size.id
                        ? 'pill-theme-active'
                        : 'bg-[#181824] border-[#262638] text-gray-400 hover:text-white'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                Yazı Rengi (Font Color)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {fontColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      playClickSound();
                      setSubColor(color.id);
                    }}
                    onMouseEnter={playHoverSound}
                    className={`py-2 px-1 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 transition-colors ${
                      subColor === color.id
                        ? 'pill-theme-active'
                        : 'bg-[#181824] border-[#262638] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                    <span>{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle Preview Box */}
            <div className="mt-4 p-4 rounded-xl bg-black/80 border border-[#262638] text-center">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                Altyazı Önizleme
              </span>
              <span
                className={`font-semibold px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
                  subColor === 'yellow'
                    ? 'text-yellow-400'
                    : subColor === 'cyan'
                    ? 'text-cyan-400'
                    : subColor === 'green'
                    ? 'text-emerald-400'
                    : 'text-white'
                } ${
                  subSize === 'small'
                    ? 'text-xs'
                    : subSize === 'large'
                    ? 'text-base'
                    : subSize === 'xlarge'
                    ? 'text-lg'
                    : 'text-sm'
                }`}
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)',
                }}
              >
                Örnek Altyazı Metni (Subtitle Preview)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}