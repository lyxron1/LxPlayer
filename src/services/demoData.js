// Open Source & Creative Commons Test Streams for LxPlayer Demo Mode
// Verified reachable public test streams (HLS Live & Open VOD Samples)

export const DEMO_LIVE_CHANNELS = [
  {
    stream_id: 'test-hls-mux',
    name: 'HLS Canlı Test Yayını (Mux)',
    category_id: 'test',
    category_name: 'Test Yayınları',
    stream_icon: './logo.svg',
    epg_title: 'Mux HLS Çoklu Bit Hızı Canlı Test Akışı',
    epg_time: '24 Saat Kesintisiz Canlı Test',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  },
  {
    stream_id: 'test-hls-akamai',
    name: 'Akamai HLS Test Yayını',
    category_id: 'test',
    category_name: 'Test Yayınları',
    stream_icon: './logo.svg',
    epg_title: 'Akamai HLS Canlı Uyarlanabilir Test Akışı',
    epg_time: '24 Saat Kesintisiz Canlı Test',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
  },
];

export const DEMO_MOVIES = [
  {
    stream_id: 'vod-big-buck-bunny',
    name: 'Big Buck Bunny (Örnek VOD)',
    category_id: 'animasyon',
    category_name: 'Animasyon / Test',
    stream_icon: './logo1.png',
    backdrop: './logo2.jpg',
    container_extension: 'mp4',
    url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
    rating: '7.8',
    year: '2008',
    duration: '10 dk',
    genre: 'Animasyon, Komedi',
    description: 'Blender Foundation tarafından Creative Commons lisansıyla üretilmiş, video oynatıcı testlerinde dünya çapında kullanılan açık kaynak animasyon filmi.',
  },
  {
    stream_id: 'vod-sintel',
    name: 'Sintel (Açık Test Fragmanı)',
    category_id: 'animasyon',
    category_name: 'Animasyon / Test',
    stream_icon: './logo1.png',
    backdrop: './logo2.jpg',
    container_extension: 'mp4',
    url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    rating: '7.5',
    year: '2010',
    duration: '1 dk',
    genre: 'Animasyon, Fantastik',
    description: 'W3C HTML5 açık video standartları kütüphanesinde yer alan açık kaynak test videosu.',
  },
  {
    stream_id: 'vod-oceans',
    name: 'Oceans (Açık Doğa Klibi)',
    category_id: 'belgesel',
    category_name: 'Belgesel / Doğa',
    stream_icon: './logo1.png',
    backdrop: './logo2.jpg',
    container_extension: 'mp4',
    url: 'https://vjs.zencdn.net/v/oceans.mp4',
    rating: '8.0',
    year: '2010',
    duration: '1 dk',
    genre: 'Doğa, Belgesel',
    description: 'Video.js açık kaynak video oynatıcı ekibi tarafından sağlanan açık test videosu.',
  },
];

export const DEMO_CATEGORIES = [
  { category_id: 'test', category_name: 'Test Yayınları' },
];

export const DEMO_VOD_CATEGORIES = [
  { category_id: 'animasyon', category_name: 'Animasyon / Test' },
  { category_id: 'belgesel', category_name: 'Belgesel / Doğa' },
];

export const DEMO_SERIES = [];
export const INITIAL_PROFILES = [];
export const DEMO_CONTINUE_WATCHING = [];
