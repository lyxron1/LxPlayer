# LxPlayer PC – Desktop IPTV & Media Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-33.2.0-blue.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)

**LxPlayer PC**, masaüstü sistemler için özel olarak geliştirilmiş modern, yüksek performanslı ve **Cyber-Dark Glassmorphism** tasarım diline sahip açık kaynaklı bir IPTV ve medya oynatıcı merkezidir.

---

## ✨ Temel Özellikler

- 🖥️ **Özel Çerçevesiz Pencere (Custom Frameless Window):** Sürüklenebilir özel 34px başlık çubuğu, büyütme/küçültme ve pencere kontrolleri.
- 💬 **Gelişmiş Altyazı Motoru:**
  - **Format Desteği:** SubRip (`.srt`), WebVTT (`.vtt`), TTML / XML (`.ttml`, `.xml`) ve HLS Gömülü Altyazı izleri.
  - **Akıllı Karakter Kodlaması:** UTF-8 ve Türkçe karakterler için otomatik `Windows-1254` / `ISO-8859-9` kod çözme desteği (ş, ğ, ı, ö, ç, ü).
  - **Xtream Sağlayıcı Entegrasyonu:** Xtream Codes sunucularından VOD film ve dizi altyazılarını otomatik algılama ve yükleme.
  - **Harici Altyazı Yükleme:** Bilgisayarınızdaki yerel `.srt` veya `.vtt` dosyalarını doğrudan oynatıcıya sürükleyip veya seçerek ekleme.
  - **Stil Özelleştirme:** Altyazı yazı boyutu (Küçük, Normal, Büyük, Çok Büyük) ve rengi (Beyaz, Sarı, Camgöbeği, Yeşil).
  - **Teknik Teşhis Raporu:** Altyazı durumunu, algılanan iz sayısını ve sunucu yanıtını anlık olarak analiz eden teşhis paneli.
- 🔊 **Çoklu Ses İzi Desteği:** Canlı yayınlarda ve filmlerde sunucudan gelen ses dillerini listeleme, seçme ve diller arası geçiş yapma.
- 📺 **Geniş İçerik Kapsamı:** Canlı TV (Live TV), Seç-İzle Sinema (VOD Movies) ve Dizi Arşivi (Series) için ayrı ayrı optimize edilmiş oynatma deneyimi.
- ⚡ **Hızlı Çekmece Menüsü:** Oynatıcıdan çıkmadan kanal değiştirme, kategori filtreleme veya dizi bölümleri arasında gezinme.
- 🎨 **Dinamik Tema Motoru:** Mor (Purple), Okyanus Mavisi (Ocean Blue), Zümrüt Yeşili (Emerald), Kızıl (Crimson), Gece Yarısı (Midnight) ve Gün Batımı (Sunset).
- 🔒 **Güvenlik & Gizlilik:** 4 haneli PIN ile korunan Ebeveyn Denetimi ve yerel önbellek koruması.
- 🧪 **Dahili Ağ Hız Testi:** Gerçek zamanlı ping, indirme ve jitter ölçümü yapabilen hız testi aracı.

---

## 🛠️ Kullanılan Teknolojiler

| Bileşen | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Masaüstü Motoru** | Electron 33.2.0 | Çapraz platform masaüstü pencere ve donanım hızlandırma yönetimi |
| **Ön Yüz Çerçevesi** | React 18.3.1 & Vite | Yüksek hızlı reaktif bileşen mimarisi ve anlık HMR |
| **Tasarım & Stil** | Tailwind CSS 3.4 | Koyu camgöbeği & siber-karanlık tema, dinamik CSS değişkenleri |
| **Video Oynatıcı** | HTML5 Video & Hls.js 1.5 | GPU donanım hızlandırmalı video ve ses işleme |
| **Dahili Ses Motoru** | Web Audio API | Dış ses dosyası gerektirmeyen düşük gecikmeli UI ses efektleri |
| **İkon Seti** | Lucide React | Modern vektörel arayüz simgeleri |

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- [Node.js](https://nodejs.org/) (v18 veya üzeri önerilir)
- npm veya yarn / pnpm

### 1. Bağımlılıkları Yükleme
```bash
npm install
```

### 2. Geliştirici Modunda Başlatma
```bash
npm start
```
Bu komut `vite` geliştirici sunucusunu ve `electron` masaüstü penceresini eşzamanlı olarak başlatır.

### 3. Üretim Derlemesi (Build)
```bash
npm run build
```

### 4. Kurulum ve Taşınabilir Paketleme (Setup & Portable EXE)
Hem NSIS Kurulum Sihirbazı (`Setup.exe`) hem de Taşınabilir (`Portable.exe`) sürümlerini derlemek için:
```bash
# Kurulum Sihirbazı (Setup) ve Taşınabilir (Portable) paketlerini üretir:
npm run dist

# Yalnızca Taşınabilir (Portable) sürümü üretir:
npm run dist:portable
```
Derlenen dosyalar `dist-electron/` klasörü içerisine otomatik olarak aktarılır.

---

## 📂 Proje Dizin Yapısı

```text
LxPlayer/
├── electron/                 # Electron ana süreç (Main Process & Preload)
│   ├── main.js               # Pencere yönetimi, IPC ve oturum ayarları
│   └── preload.js            # Güvenli contextBridge API köprüsü
├── public/                   # Statik medya varlıkları, logolar ve ikonlar
├── src/
│   ├── assets/               # SVG ve görsel varlıklar
│   ├── components/           # UI Modalları ve genel bileşenler
│   │   ├── AudioSubtitleModal.jsx # Ses ve Altyazı seçim / teşhis modali
│   │   ├── Titlebar.jsx           # Özel sürüklenebilir başlık çubuğu
│   │   └── ...
│   ├── context/              # Uygulama durum yönetimi (AppContext)
│   ├── pages/                # Uygulama sayfaları
│   │   ├── PlayerScreen.jsx  # Çok fonksiyonlu gelişmiş video oynatıcı
│   │   ├── LiveTvScreen.jsx  # Canlı TV listesi ve EPG
│   │   ├── MoviesScreen.jsx  # VOD Film kütüphanesi
│   │   ├── SeriesScreen.jsx  # Dizi ve bölüm kataloğu
│   │   └── ...
│   ├── services/             # Veri ve arka plan servisleri
│   │   ├── xtreamService.js   # Xtream Codes & M3U API entegrasyonu
│   │   ├── subtitleService.js # SRT, WebVTT, TTML ve altyazı motoru
│   │   └── storageService.js  # IndexedDB ve yerel önbellek servisi
│   └── utils/                # Yardımcı araçlar, ses motoru ve i18n
├── .env.example              # Örnek yapılandırma şablonu
├── .gitignore                # Git dışlama kuralları
├── package.json              # Bağımlılıklar ve derleme betikleri
└── README.md                 # Proje dokümantasyonu
```

---

## ⌨️ Oynatıcı Kısayolları

| Tuş | İşlev |
| :--- | :--- |
| `Space` | Oynat / Duraklat |
| `Sol Ok` (`←`) | 10 saniye geri sar |
| `Sağ Ok` (`→`) | 10 saniye ileri sar |
| `Yukarı Ok` (`↑`) | Sesi %10 artır |
| `Aşağı Ok` (`↓`) | Sesi %10 azalt |
| `F` | Tam Ekran Aç / Kapat |
| `M` | Sesi Aç / Kapat (Mute) |
| `Esc` | Açık panelleri kapat / Oynatıcıdan çık |

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) kapsamında lisanslanmıştır. Detaylar için `LICENSE` dosyasına göz atabilirsiniz.
