import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, X, Star, Clapperboard, Play, Heart, Plus, Tv, ChevronDown, Layers } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';
import { useApp } from '../context/AppContext';
import { fetchSeries, fetchSeriesCategories, sanitizeId } from '../services/xtreamService';
import CategoryPickerModal from '../components/CategoryPickerModal';
import ErrorBoundary from '../components/ErrorBoundary';

const PAGE_SIZE = 36;
const SEARCH_MAX_RESULTS = 40;

function SeriesScreenContent() {
  const { t, activeProfile, favorites, toggleFavorite, setActiveSeriesDetail, setCurrentScreen } = useApp();

  const [seriesList, setSeriesList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const observerTarget = useRef(null);
  const scrollContainerRef = useRef(null);

  // Fetch Series & Categories
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      const [s, cats] = await Promise.all([
        fetchSeries(activeProfile),
        fetchSeriesCategories(activeProfile),
      ]);

      if (!isMounted) return;

      const rawSeries = Array.isArray(s) ? s : (s && typeof s === 'object') ? Object.values(s) : [];
      const rawCats = Array.isArray(cats) ? cats : (cats && typeof cats === 'object') ? Object.values(cats) : [];

      setSeriesList(rawSeries);
      setCategories(rawCats);
      setIsLoading(false);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeProfile]);

  // Fast Category Name Map for badges
  const categoryNameMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      if (c && c.category_id !== undefined) {
        map[sanitizeId(c.category_id)] = c.category_name;
      }
    }
    return map;
  }, [categories]);

  // Count items per category for CategoryPickerModal
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (let i = 0; i < seriesList.length; i++) {
      const item = seriesList[i];
      if (!item) continue;
      const catId = sanitizeId(item.category_id);
      counts[catId] = (counts[catId] || 0) + 1;
    }
    return counts;
  }, [seriesList]);

  // Handle category selection with immediate scroll & pagination reset
  const handleSelectCategory = useCallback((catId) => {
    setSelectedCategory(catId);
    setVisibleCount(PAGE_SIZE);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  // Reset pagination & scroll when selectedCategory or searchQuery changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedCategory, searchQuery]);

  // Demo Mode Guard
  if (activeProfile?.isDemo && seriesList.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 select-none text-center bg-[#09090D]">
        <div className="w-20 h-20 rounded-3xl bg-theme-soft border border-theme-soft flex items-center justify-center text-theme mb-5 shadow-theme-glow">
          <Clapperboard size={36} />
        </div>
        <h2 className="text-2xl font-black text-white tracking-wide">
          {t('series.demoNotice')}
        </h2>
        <p className="text-sm text-gray-400 mt-2 max-w-lg leading-relaxed">
          {t('series.demoNoticeDesc')}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              playClickSound();
              setCurrentScreen('login');
            }}
            onMouseEnter={playHoverSound}
            className="py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg transition-transform hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>{t('common.addAccount')}</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setCurrentScreen('livetv');
            }}
            onMouseEnter={playHoverSound}
            className="py-3 px-6 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#262638] text-gray-200 hover:text-white font-bold text-xs flex items-center space-x-2 transition-colors"
          >
            <Tv size={16} className="text-theme" />
            <span>{t('series.backToLive')}</span>
          </button>
        </div>
      </div>
    );
  }

  // Strict Category Filter & Early-Exit Search
  const filteredSeries = useMemo(() => {
    const cleanCat = String(selectedCategory || '').replace(/\.0$/, '').trim();
    let baseList = [];

    if (selectedCategory === 'favorites') {
      baseList = seriesList.filter((s) => s && favorites.includes(sanitizeId(s.series_id || s.id)));
    } else if (selectedCategory === 'all') {
      baseList = seriesList;
    } else {
      baseList = seriesList.filter(
        (item) => String(item?.category_id || '').replace(/\.0$/, '').trim() === cleanCat
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const results = [];
      const len = baseList.length;

      for (let i = 0; i < len; i++) {
        const s = baseList[i];
        if (!s) continue;
        const nameMatch = (s.name && s.name.toLowerCase().includes(q)) || (s.title && s.title.toLowerCase().includes(q));
        const catName = categoryNameMap[sanitizeId(s.category_id)] || s.category_name;
        const catMatch = catName && catName.toLowerCase().includes(q);
        const genreMatch = s.genre && s.genre.toLowerCase().includes(q);

        if (nameMatch || catMatch || genreMatch) {
          results.push(s);
          if (results.length >= SEARCH_MAX_RESULTS) {
            break;
          }
        }
      }
      return results;
    }

    return baseList;
  }, [seriesList, selectedCategory, searchQuery, favorites, categoryNameMap]);

  // Current slice for DOM rendering (Pagination / Lazy render)
  const displayedSeries = useMemo(() => {
    if (searchQuery.trim()) return filteredSeries;
    return filteredSeries.slice(0, visibleCount);
  }, [filteredSeries, visibleCount, searchQuery]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(filteredSeries.length, prev + PAGE_SIZE));
  }, [filteredSeries.length]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !searchQuery.trim()) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '250px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [handleLoadMore, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none p-6 lg:p-8">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#262638]">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('series.searchPlaceholder')}
            className="w-full pl-10 pr-10 py-2.5 bg-[#13131A] border border-[#262638] focus:border-theme rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                playClickSound();
                setSearchQuery('');
              }}
              onMouseEnter={playHoverSound}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-400 bg-[#13131A] border border-[#262638] px-3.5 py-2 rounded-xl">
          <Clapperboard size={15} className="text-theme" />
          <span>
            {searchQuery.trim()
              ? `${displayedSeries.length} / ${filteredSeries.length}`
              : `${seriesList.length.toLocaleString()} ${t('dash.items')} (${displayedSeries.length})`}
          </span>
        </div>
      </div>

      {/* DYNAMIC Category Chips Bar with "Tüm Kategoriler" Modal Trigger */}
      <div className="py-3 flex items-center space-x-2 overflow-x-auto scrollbar-none flex-shrink-0">
        {/* EN BAŞ: "Tüm Kategoriler" Modal Açıcı Buton */}
        <button
          onClick={() => {
            playClickSound();
            setIsCategoryModalOpen(true);
          }}
          onMouseEnter={playHoverSound}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#181824] hover:bg-theme hover:text-white border border-[#262638] text-gray-200 transition-all duration-200 whitespace-nowrap shadow-sm flex-shrink-0 group"
          title={t('series.allCategories')}
        >
          <Layers size={13} className="text-theme group-hover:text-white transition-colors" />
          <span>{t('series.allCategories')} ({categories.length})</span>
        </button>

        {/* Sabit 1: Tüm Diziler */}
        <button
          onClick={() => {
            playClickSound();
            handleSelectCategory('all');
          }}
          onMouseEnter={playHoverSound}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
            selectedCategory === 'all'
              ? 'pill-theme-active'
              : 'bg-[#13131A] text-gray-400 hover:text-white hover:bg-[#181824] border border-[#262638]'
          }`}
        >
          {t('series.allSeries')} ({seriesList.length})
        </button>

        {/* Sabit 2: Favoriler */}
        <button
          onClick={() => {
            playClickSound();
            handleSelectCategory('favorites');
          }}
          onMouseEnter={playHoverSound}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
            selectedCategory === 'favorites'
              ? 'pill-theme-active'
              : 'bg-[#13131A] text-gray-400 hover:text-white hover:bg-[#181824] border border-[#262638]'
          }`}
        >
          <Heart size={13} className={selectedCategory === 'favorites' ? 'fill-white' : 'text-red-500'} />
          <span>{t('dash.favorites')} ({favorites.length})</span>
        </button>

        {/* Sunucudan Gelen Gerçek Dinamik Kategoriler */}
        {categories.map((cat) => {
          const isSelected =
            String(selectedCategory || '').replace(/\.0$/, '').trim() ===
            String(cat.category_id || '').replace(/\.0$/, '').trim();

          return (
            <button
              key={cat.category_id}
              onClick={() => {
                playClickSound();
                handleSelectCategory(cat.category_id);
              }}
              onMouseEnter={playHoverSound}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'pill-theme-active'
                  : 'bg-[#13131A] text-gray-400 hover:text-white hover:bg-[#181824] border border-[#262638]'
              }`}
            >
              {cat.category_name}
            </button>
          );
        })}
      </div>

      {/* Series Grid */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto mt-2 pr-1">
        {filteredSeries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Clapperboard size={40} className="text-gray-600 mb-3" />
            <h3 className="text-base font-bold text-white">{t('series.noSeries')}</h3>
            <p className="text-xs text-gray-400 mt-1">{t('series.noSeriesDesc')}</p>
          </div>
        ) : (
          <>
            <div
              key={`grid-${selectedCategory}-${searchQuery ? 'search' : 'cat'}`}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-6"
            >
              {displayedSeries.map((series) => {
                if (!series) return null;
                const safeSeriesId = sanitizeId(series.series_id || series.id);
                const isFav = favorites.includes(safeSeriesId);
                const safeTitle = series.name || series.title || 'İsimsiz Dizi';
                const safeCover = series.stream_icon || series.cover || './logo.svg';
                const displayCategory =
                  categoryNameMap[sanitizeId(series.category_id)] ||
                  series.category_name ||
                  series.genre ||
                  'Dizi';

                return (
                  <div
                    key={safeSeriesId || Math.random()}
                    onClick={() => {
                      playClickSound();
                      setActiveSeriesDetail(series);
                    }}
                    onMouseEnter={playHoverSound}
                    className="group relative rounded-2xl overflow-hidden bg-[#13131A] border border-[#262638] hover:border-theme cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-theme-glow aspect-[2/3] flex flex-col justify-end"
                  >
                    <img
                      src={safeCover}
                      alt={safeTitle}
                      onError={(e) => {
                        e.currentTarget.src = './logo.svg';
                      }}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                    {/* Top Right Badges */}
                    <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          toggleFavorite(safeSeriesId);
                        }}
                        onMouseEnter={playHoverSound}
                        className={`w-7 h-7 rounded-lg backdrop-blur-md flex items-center justify-center border transition-colors ${
                          isFav
                            ? 'bg-red-500/80 border-red-500 text-white'
                            : 'bg-black/60 border-white/20 text-gray-300 hover:text-white'
                        }`}
                      >
                        <Heart size={13} className={isFav ? 'fill-white' : ''} />
                      </button>

                      {series.rating && (
                        <div className="bg-black/75 backdrop-blur-md border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center space-x-1 shadow-md">
                          <Star size={11} className="fill-amber-400" />
                          <span>{series.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Hover Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      <div className="w-12 h-12 rounded-2xl bg-theme text-white flex items-center justify-center shadow-theme-glow transform scale-75 group-hover:scale-100 transition-transform">
                        <Play size={20} className="fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="relative p-3 z-10">
                      <h3 className="text-xs sm:text-sm font-extrabold text-white line-clamp-1 group-hover:text-theme transition-colors drop-shadow">
                        {safeTitle}
                      </h3>
                      <div className="text-[10px] text-gray-400 flex items-center justify-between mt-1">
                        <span className="truncate max-w-[120px]" title={displayCategory}>
                          {displayCategory}
                        </span>
                        {series.year && <span>{series.year}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Load More */}
            {!searchQuery.trim() && visibleCount < filteredSeries.length && (
              <div ref={observerTarget} className="py-6 flex flex-col items-center justify-center">
                <button
                  onClick={handleLoadMore}
                  onMouseEnter={playHoverSound}
                  className="px-6 py-2.5 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#262638] hover:border-theme text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-2"
                >
                  <ChevronDown size={16} />
                  <span>{t('series.moreSeries')} ({filteredSeries.length - visibleCount} {t('series.remainingSeries')})</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Global Category Picker Modal */}
      <CategoryPickerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        title="Dizi Kategorileri"
        totalItemsCount={seriesList.length}
        favoritesCount={favorites.length}
        categoryCounts={categoryCounts}
      />
    </div>
  );
}

// Wrap with ErrorBoundary to prevent black screen crashes
export default function SeriesScreen() {
  const { setCurrentScreen } = useApp();

  return (
    <ErrorBoundary
      fallbackTitle="Diziler Yüklenirken Bir Sorun Oluştu"
      fallbackMessage="Sunucudan dizi verileri alınırken veya işlenirken bir hata oluştu. Lütfen bağlantınızı kontrol edip yeniden deneyin."
      onNavigateHome={() => setCurrentScreen('dashboard')}
    >
      <SeriesScreenContent />
    </ErrorBoundary>
  );
}
