// Lightweight TR / EN Localization Module for LxPlayer

export const translations = {
  tr: {
    // Navigation
    'nav.dashboard': 'Ana Sayfa',
    'nav.livetv': 'Canlı TV',
    'nav.movies': 'Filmler',
    'nav.series': 'Diziler',
    'nav.settings': 'Ayarlar',
    'nav.profiles': 'Profiller',
    'nav.speedtest': 'Hız Testi',
    'nav.parental': 'Ebeveyn Kilidi',
    'nav.about': 'Hakkımızda',

    // Dashboard
    'dash.statsLive': 'Canlı TV',
    'dash.statsMovies': 'VOD Sinema',
    'dash.statsSeries': 'Dizi Dizini',
    'dash.continueWatching': 'Kaldığım Yerden Devam Et',
    'dash.favorites': 'Favorilerim',
    'dash.recentHistory': 'Son İzlenenler',
    'dash.noHistory': 'Henüz bir yayın izlemediniz',
    'dash.noHistoryDesc': 'İzlediğiniz canlı kanallar, film ve diziler burada listelenir.',
    'dash.noFavs': 'Favori İçerik Yok',
    'dash.noFavsDesc': 'Beğendiğiniz yayınları kalp simgesine basarak buraya ekleyebilirsiniz.',
    'dash.items': 'İçerik',
    'dash.channels': 'Kanal',

    // Profiles Screen
    'profiles.title': 'IPTV Hesabınızı Seçin',
    'profiles.desc': 'İzlemeye başlamak ve içerikleri eşitlemek için bir hesap seçin',
    'profiles.addNew': 'Yeni Hesap Ekle',
    'profiles.addNewDesc': 'Kendi Xtream Codes veya M3U Oynatma Listenizi tanımlayın',
    'profiles.xtreamM3u': 'Xtream / M3U Girişi',
    'profiles.demo': 'Demo Hesabı',
    'profiles.demoSubtitle': 'Açık Kaynak Test Yayınları',
    'profiles.demoDesc': 'Giriş yapmadan HLS ve VOD açık test medyalarını hemen izleyin',
    'profiles.directWatch': 'Şifresiz Doğrudan İzle',
    'profiles.activeSub': 'Aktif Abonelik',
    'profiles.deleteConfirm': 'Bu hesabı silmek istediğinize emin misiniz?',

    // Live TV
    'live.searchPlaceholder': 'Kanal veya kategori ara...',
    'live.allChannels': 'Tüm Kanallar',
    'live.allCategories': 'Tüm Kategoriler',
    'live.favorites': 'Favoriler',
    'live.noChannels': 'Kanal Bulunamadı',
    'live.noChannelsDesc': 'Arama terimlerinizi veya seçili kategoriyi kontrol edin',
    'live.liveBadge': 'CANLI',
    'live.moreChannels': 'Daha Fazla Göster',
    'live.remainingChannels': 'kanal kaldı',

    // Movies
    'movies.searchPlaceholder': 'Film veya tür ara (ilk 40 sonuç listelenir)...',
    'movies.allMovies': 'Tüm Filmler',
    'movies.allCategories': 'Tüm Kategoriler',
    'movies.noMovies': 'Film Bulunamadı',
    'movies.noMoviesDesc': 'Arama terimlerinizi veya seçili kategoriyi kontrol edin',
    'movies.moreMovies': 'Daha Fazla Göster',
    'movies.remainingMovies': 'film kaldı',
    'movies.demoNotice': 'Demo Modunda Yalnızca Örnek Test Yayınları Aktiftir',
    'movies.demoNoticeDesc': 'Geniş Seç-İzle (VOD) film kütüphanenizi izlemek için lütfen kendi IPTV hesabınızı ekleyin.',
    'movies.backToLive': 'Canlı Test Yayınlarına Dön',
    'movies.backToTrt': 'Canlı Test Yayınlarına Dön',

    // Series
    'series.searchPlaceholder': 'Dizi adı veya tür ara (ilk 40 sonuç listelenir)...',
    'series.allSeries': 'Tüm Diziler',
    'series.allCategories': 'Tüm Kategoriler',
    'series.noSeries': 'Dizi Bulunamadı',
    'series.noSeriesDesc': 'Arama terimlerinizi veya seçili kategoriyi kontrol edin',
    'series.seasons': 'Sezonlar',
    'series.episodes': 'Bölümler',
    'series.playFirst': 'İlk Bölümü Oynat',
    'series.moreSeries': 'Daha Fazla Göster',
    'series.remainingSeries': 'dizi kaldı',
    'series.demoNotice': 'Demo Modunda Dizi Yayını Bulunmamaktadır',
    'series.demoNoticeDesc': 'Dizi arşivinizi ve bölümleri izlemek için lütfen kendi IPTV hesabınızı ekleyin.',
    'series.backToLive': 'Canlı Test Yayınlarına Dön',
    'series.backToTrt': 'Canlı Test Yayınlarına Dön',

    // Player
    'player.audioSubs': 'Ses & Altyazı',
    'player.quickChannels': 'Kanallar',
    'player.quickEpisodes': 'Bölümler',
    'player.allCategoriesBack': '← Tüm Kategoriler',
    'player.nextEp': 'Sonraki Bölüm',
    'player.prevEp': 'Önceki Bölüm',
    'player.lockScreen': 'Ekranı Kilitle',
    'player.unlockScreen': 'Ekran Kilidini Aç',
    'player.speed': 'Oynatma Hızı',
    'player.autoNext': 'Sonraki bölüme geçiliyor',
    'player.liveBadge': 'CANLI YAYIN',
    'player.audioTracks': 'Ses Dilleri',
    'player.subtitleTracks': 'Altyazılar',
    'player.subOff': 'Altyazı Kapalı',
    'player.subStyle': 'Stil & Boyut',
    'player.play': 'Oynat',
    'player.pause': 'Duraklat',
    'player.fullscreen': 'Tam Ekran',
    'player.exitFullscreen': 'Tam Ekrandan Çık',
    'player.pip': 'Resim İçinde Resim (PiP)',
    'player.aspectRatio': 'Ekran Oranı',
    'player.defaultAudio': 'Varsayılan Orijinal Ses',
    'player.noSubtitles': 'Bu yayında gömülü altyazı bulunmuyor',

    // Settings
    'settings.title': 'Uygulama Ayarları',
    'settings.desc': 'Görünüm teması, ses motoru, oynatıcı parametreleri ve IPTV hesap yönetimi',
    'settings.theme': 'Görünüm & Tema Stilleri (6 Renk)',
    'settings.themeDesc': 'Seçtiğiniz tema anında tüm arayüz butonlarını, parıltı efektlerini, navigasyon çiplerini ve ambiyans ışıklandırmasını günceller.',
    'settings.language': 'Uygulama Dili (Language)',
    'settings.sound': 'Gezinme ve Açılış Sesleri (Ta-Dum & Tick)',
    'settings.soundDesc': 'Web Audio API ile sentezlenen sinematik açılış bas darbesi ve menü mikro tıklamaları',
    'settings.playerParams': 'Oynatıcı ve Akış Parametreleri',
    'settings.streamExt': 'Canlı Yayın Akış Uzantısı',
    'settings.faster': 'Daha Hızlı',
    'settings.hlsStream': 'HLS Akışı',
    'settings.userAgent': 'İstemci Kimliği (User-Agent)',
    'settings.gpuAccel': 'Donanım Hızlandırma (GPU)',
    'settings.gpuAccelDesc': 'Daha akıcı 4K 60FPS video oynatma için ekran kartı çözümlemesini kullanır',
    'settings.cacheTitle': '12 Saatlik Akıllı Önbellek & Veri Yönetimi',
    'settings.cacheDesc': 'IPTV kütüphanesi 12 saat boyunca yerel diskten anında yüklenir. Sunucudan taze veri çekmek için kütüphaneyi yenileyebilirsiniz.',
    'settings.refreshNow': 'Kütüphaneyi Şimdi Yenile',
    'settings.clearCache': 'Önbelleği Temizle',
    'settings.accountMgmt': 'Hesap & Profil Yönetimi',
    'settings.switchAccount': 'Hesap Değiştir',
    'settings.addNewAccount': 'Yeni IPTV Hesabı Ekle',
    'settings.deleteProfile': 'Profili Sil',
    'settings.cacheCleared': 'Tüm 12 saatlik önbellek ve geçici medya listeleri temizlendi.',
    'settings.libraryRefreshed': 'Kütüphane dizinleri başarıyla sıfırlandı.',
    'settings.demoDeleteError': 'Demo hesabı silinemez. Kendi hesabınızı ekleyebilir veya değiştirebilirsiniz.',
    'settings.deleteProfileConfirm': 'profilini silmek istediğinize emin misiniz?',

    // Common
    'common.close': 'Kapat',
    'common.cancel': 'İptal',
    'common.save': 'Kaydet',
    'common.search': 'Ara',
    'common.retry': 'Yeniden Dene',
    'common.back': 'Geri Dön',
    'common.login': 'Giriş Yap',
    'common.addAccount': 'Hesap Ekle',
  },

  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.livetv': 'Live TV',
    'nav.movies': 'Movies',
    'nav.series': 'Series',
    'nav.settings': 'Settings',
    'nav.profiles': 'Profiles',
    'nav.speedtest': 'Speed Test',
    'nav.parental': 'Parental Lock',
    'nav.about': 'About',

    // Dashboard
    'dash.statsLive': 'Live TV',
    'dash.statsMovies': 'VOD Movies',
    'dash.statsSeries': 'Series Library',
    'dash.continueWatching': 'Continue Watching',
    'dash.favorites': 'Favorites',
    'dash.recentHistory': 'Recent History',
    'dash.noHistory': 'No watched content yet',
    'dash.noHistoryDesc': 'Live channels, movies and series you watch will appear here.',
    'dash.noFavs': 'No Favorite Items',
    'dash.noFavsDesc': 'You can add broadcasts you love here by clicking the heart icon.',
    'dash.items': 'Items',
    'dash.channels': 'Channels',

    // Profiles Screen
    'profiles.title': 'Select Your IPTV Account',
    'profiles.desc': 'Select an account to sync content and start watching',
    'profiles.addNew': 'Add New Account',
    'profiles.addNewDesc': 'Define your own Xtream Codes or M3U Playlist',
    'profiles.xtreamM3u': 'Xtream / M3U Login',
    'profiles.demo': 'Demo Account',
    'profiles.demoSubtitle': 'Open Source Test Streams',
    'profiles.demoDesc': 'Watch open source HLS and VOD test media immediately without signing in',
    'profiles.directWatch': 'Direct Free Watch',
    'profiles.activeSub': 'Active Subscription',
    'profiles.deleteConfirm': 'Are you sure you want to delete this account?',

    // Live TV
    'live.searchPlaceholder': 'Search channel or category...',
    'live.allChannels': 'All Channels',
    'live.allCategories': 'All Categories',
    'live.favorites': 'Favorites',
    'live.noChannels': 'No Channels Found',
    'live.noChannelsDesc': 'Check your search keywords or chosen category',
    'live.liveBadge': 'LIVE',
    'live.moreChannels': 'Show More',
    'live.remainingChannels': 'channels left',

    // Movies
    'movies.searchPlaceholder': 'Search movies or genres (top 40 results)...',
    'movies.allMovies': 'All Movies',
    'movies.allCategories': 'All Categories',
    'movies.noMovies': 'No Movies Found',
    'movies.noMoviesDesc': 'Check your search keywords or chosen category',
    'movies.moreMovies': 'Show More',
    'movies.remainingMovies': 'movies left',
    'movies.demoNotice': 'Only Sample Test Streams Available in Demo Mode',
    'movies.demoNoticeDesc': 'Please connect your own IPTV account to access your full VOD movie library.',
    'movies.backToLive': 'Back to Live Test Streams',
    'movies.backToTrt': 'Back to Live Test Streams',

    // Series
    'series.searchPlaceholder': 'Search series or genres (top 40 results)...',
    'series.allSeries': 'All Series',
    'series.allCategories': 'All Categories',
    'series.noSeries': 'No Series Found',
    'series.noSeriesDesc': 'Check your search keywords or chosen category',
    'series.seasons': 'Seasons',
    'series.episodes': 'Episodes',
    'series.playFirst': 'Play First Episode',
    'series.moreSeries': 'Show More',
    'series.remainingSeries': 'series left',
    'series.demoNotice': 'No Series Available in Demo Mode',
    'series.demoNoticeDesc': 'Please connect your own IPTV account to access your series and episodes archive.',
    'series.backToLive': 'Back to Live Test Streams',
    'series.backToTrt': 'Back to Live Test Streams',

    // Player
    'player.audioSubs': 'Audio & Subs',
    'player.quickChannels': 'Channels',
    'player.quickEpisodes': 'Episodes',
    'player.allCategoriesBack': '← All Categories',
    'player.nextEp': 'Next Episode',
    'player.prevEp': 'Previous Episode',
    'player.lockScreen': 'Lock Screen',
    'player.unlockScreen': 'Unlock Screen',
    'player.speed': 'Speed',
    'player.autoNext': 'Playing next episode in',
    'player.liveBadge': 'LIVE STREAM',
    'player.audioTracks': 'Audio Tracks',
    'player.subtitleTracks': 'Subtitles',
    'player.subOff': 'Subtitles Off',
    'player.subStyle': 'Style & Size',
    'player.play': 'Play',
    'player.pause': 'Pause',
    'player.fullscreen': 'Fullscreen',
    'player.exitFullscreen': 'Exit Fullscreen',
    'player.pip': 'Picture-in-Picture (PiP)',
    'player.aspectRatio': 'Aspect Ratio',
    'player.defaultAudio': 'Default Original Audio',
    'player.noSubtitles': 'No embedded subtitles found in this stream',

    // Settings
    'settings.title': 'Application Settings',
    'settings.desc': 'Appearance themes, sound engine, player parameters, and IPTV account management',
    'settings.theme': 'Appearance & Theme Styles (6 Colors)',
    'settings.themeDesc': 'Selected theme immediately updates all UI buttons, glow effects, navigation chips, and ambient lighting.',
    'settings.language': 'Application Language',
    'settings.sound': 'Navigation & Startup Sounds (Ta-Dum & Tick)',
    'settings.soundDesc': 'Web Audio API synthesized cinematic startup bass hit and micro UI clicks',
    'settings.playerParams': 'Player & Streaming Parameters',
    'settings.streamExt': 'Live Stream Extension',
    'settings.faster': 'Faster',
    'settings.hlsStream': 'HLS Stream',
    'settings.userAgent': 'Client Identifier (User-Agent)',
    'settings.gpuAccel': 'Hardware Acceleration (GPU)',
    'settings.gpuAccelDesc': 'Uses graphics card hardware decoding for smoother 4K 60FPS video playback',
    'settings.cacheTitle': '12-Hour Smart Cache & Data Management',
    'settings.cacheDesc': 'IPTV library loads instantly from local storage for 12 hours. Refresh to fetch fresh server data.',
    'settings.refreshNow': 'Refresh Library Now',
    'settings.clearCache': 'Clear Cache',
    'settings.accountMgmt': 'Account & Profile Management',
    'settings.switchAccount': 'Switch Account',
    'settings.addNewAccount': 'Add New IPTV Account',
    'settings.deleteProfile': 'Delete Profile',
    'settings.cacheCleared': 'All 12-hour cache and temporary media lists cleared.',
    'settings.libraryRefreshed': 'Library indexes successfully refreshed.',
    'settings.demoDeleteError': 'Demo account cannot be deleted. You can add or switch your own account.',
    'settings.deleteProfileConfirm': 'Are you sure you want to delete profile:',

    // Common
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.search': 'Search',
    'common.retry': 'Retry',
    'common.back': 'Back',
    'common.login': 'Log In',
    'common.addAccount': 'Add Account',
  },
};

/**
 * Helper function to retrieve localized string by key
 */
export function t(key, lang = 'tr') {
  const selectedLang = lang === 'en' ? 'en' : 'tr';
  return translations[selectedLang]?.[key] || translations['tr']?.[key] || key;
}

/**
 * Friendly language name formatter for audio and subtitle tracks
 */
export function formatTrackName(track, index, type = 'audio') {
  if (!track) return `${type === 'audio' ? 'Ses' : 'Altyazı'} ${index + 1}`;

  const langCode = (track.lang || track.language || '').toLowerCase().trim();
  const rawName = (track.name || track.label || '').trim();

  const langMap = {
    tr: 'Türkçe',
    tur: 'Türkçe',
    en: 'English',
    eng: 'English',
    de: 'Deutsch',
    deu: 'Deutsch',
    ger: 'Deutsch',
    fr: 'Français',
    fra: 'Français',
    fre: 'Français',
    es: 'Español',
    spa: 'Español',
    it: 'Italiano',
    ita: 'Italiano',
    ru: 'Русский',
    rus: 'Русский',
    ar: 'العربية (Arabic)',
    ara: 'العربية (Arabic)',
    pt: 'Português',
    por: 'Português',
    nl: 'Nederlands',
    nld: 'Nederlands',
    dut: 'Nederlands',
    und: 'Orijinal / Belirtilmemiş',
  };

  let resolved = langMap[langCode];
  if (!resolved && rawName) {
    const lower = rawName.toLowerCase();
    for (const [code, label] of Object.entries(langMap)) {
      if (lower.includes(code)) {
        resolved = label;
        break;
      }
    }
  }

  if (resolved) {
    if (rawName && (rawName.includes('5.1') || rawName.includes('7.1') || rawName.includes('Dolby'))) {
      return `${resolved} (${rawName})`;
    }
    return resolved;
  }

  return rawName || `${type === 'audio' ? 'Ses Kanalı' : 'Altyazı'} ${index + 1}`;
}
