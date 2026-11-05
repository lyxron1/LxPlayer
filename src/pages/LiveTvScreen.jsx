import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, X, Heart, Tv, Play, Radio, Plus, ChevronDown, Layers } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';
import { useApp } from '../context/AppContext';
import { fetchLiveStreams, fetchLiveCategories, sanitizeId } from '../services/xtreamService';
import CategoryPickerModal from '../components/CategoryPickerModal';

const PAGE_SIZE = 36;
const SEARCH_MAX_RESULTS = 40;

export default function LiveTvScreen() {
  const { t, activeProfile, playContent, favorites, toggleFavorite, setCurrentScreen } = useApp();

  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'favorites' | category_id
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const observerTarget = useRef(null);
  const scrollContainerRef = useRef(null);

  // Fetch real channels & dynamic categories
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      const [streams, cats] = await Promise.all([
        fetchLiveStreams(activeProfile),
        fetchLiveCategories(activeProfile),
      ]);

      if (!isMounted) return;
      setChannels(Array.isArray(streams) ? streams : []);
      setCategories(Array.isArray(cats) ? cats : []);
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

  // Count channels per category for CategoryPickerModal
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (let i = 0; i < channels.length; i++) {
      const catId = sanitizeId(channels[i].category_id);
      counts[catId] = (counts[catId] || 0) + 1;
    }
    return counts;
  }, [channels]);

  // Handle category change with strict scroll & count reset
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

  // Perform background filtering with STRICT ID MATCHING to avoid channel leaks
  const filteredChannels = useMemo(() => {
    const cleanCat = String(selectedCategory || '').replace(/\.0$/, '').trim();
    let result = [];

    // Strict Category Filter
    if (selectedCategory === 'favorites') {
      result = channels.filter((ch) => favorites.includes(sanitizeId(ch.stream_id || ch.id)));
    } else if (selectedCategory === 'all') {
      result = channels;
    } else {
      result = channels.filter(
        (item) => String(item.category_id || '').replace(/\.0$/, '').trim() === cleanCat
      );
    }

    // Search Filter with early exit
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matched = [];
      for (let i = 0; i < result.length; i++) {
        const ch = result[i];
        const nameMatch = ch.name && ch.name.toLowerCase().includes(q);
        const catName = categoryNameMap[sanitizeId(ch.category_id)] || ch.category_name;
        const catMatch = catName && catName.toLowerCase().includes(q);
        const epgMatch = ch.epg_title && ch.epg_title.toLowerCase().includes(q);
        if (nameMatch || catMatch || epgMatch) {
          matched.push(ch);
          if (matched.length >= SEARCH_MAX_RESULTS) break;
        }
      }
      return matched;
    }

    return result;
  }, [channels, selectedCategory, searchQuery, favorites, categoryNameMap]);

  // Current slice for DOM rendering (Pagination / Lazy render)
  const displayedChannels = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredChannels;
    }
    return filteredChannels.slice(0, visibleCount);
  }, [filteredChannels, visibleCount, searchQuery]);

  // Infinite Scroll Trigger
  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(filteredChannels.length, prev + PAGE_SIZE));
  }, [filteredChannels.length]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !searchQuery.trim()) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [handleLoadMore, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none p-6 lg:p-8">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#262638]">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('live.searchPlaceholder')}
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

        <div className="flex items-center space-x-3">
          {activeProfile?.isDemo && (
            <button
              onClick={() => {
                playClickSound();
                setCurrentScreen('login');
              }}
              onMouseEnter={playHoverSound}
              className="px-3.5 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>{t('common.addAccount')}</span>
            </button>
          )}

          <div className="flex items-center space-x-2 text-xs text-gray-400 bg-[#13131A] border border-[#262638] px-3.5 py-2 rounded-xl">
            <Tv size={15} className="text-theme" />
            <span>
              {searchQuery.trim()
                ? `${displayedChannels.length} / ${filteredChannels.length}`
                : `${channels.length.toLocaleString()} ${t('dash.channels')} (${displayedChannels.length})`}
            </span>
          </div>
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
          title={t('live.allCategories')}
        >
          <Layers size={13} className="text-theme group-hover:text-white transition-colors" />
          <span>{t('live.allCategories')} ({categories.length})</span>
        </button>

        {/* Sabit 1: Tüm Kanallar */}
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
          {t('live.allChannels')} ({channels.length})
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
          <span>{t('live.favorites')} ({favorites.length})</span>
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

      {/* Channel Grid (Lazy Rendered / Paginated for Super Performance) */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto mt-2 pr-1">
        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Radio size={40} className="text-gray-600 mb-3" />
            <h3 className="text-base font-bold text-white">{t('live.noChannels')}</h3>
            <p className="text-xs text-gray-400 mt-1">{t('live.noChannelsDesc')}</p>
          </div>
        ) : (
          <>
            <div
              key={`grid-${selectedCategory}-${searchQuery ? 'search' : 'cat'}`}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-6"
            >
              {displayedChannels.map((channel) => {
                const isFav = favorites.includes(sanitizeId(channel.stream_id || channel.id));
                const displayCategory =
                  categoryNameMap[sanitizeId(channel.category_id)] ||
                  channel.category_name ||
                  'Canlı TV';

                return (
                  <div
                    key={channel.stream_id || channel.id}
                    onClick={() => {
                      playClickSound();
                      playContent(channel, 'live');
                    }}
                    onMouseEnter={playHoverSound}
                    className="bg-[#13131A] hover:bg-[#181824] border border-[#262638] hover:border-theme rounded-2xl p-4 cursor-pointer transition-all duration-200 group flex items-center justify-between shadow-md hover:shadow-theme-glow"
                  >
                    {/* Left: Channel Logo & Titles */}
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-[#09090D] border border-[#262638] p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden group-hover:border-theme-soft transition-colors">
                        <img
                          src={channel.stream_icon}
                          alt={channel.name}
                          onError={(e) => {
                            e.currentTarget.src = channel.backup_icon || './logo.svg';
                          }}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center space-x-1 text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>CANLI</span>
                          </span>
                          <span className="text-[10px] text-gray-400 truncate max-w-[140px]" title={displayCategory}>
                            {displayCategory}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-white truncate group-hover:text-theme transition-colors mt-1">
                          {channel.name}
                        </h3>

                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {channel.epg_title || 'Canlı Yayın Akışı'}
                        </p>
                      </div>
                    </div>

                    {/* Right: Play Hover & Favorite Button */}
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playClickSound();
                          toggleFavorite(sanitizeId(channel.stream_id || channel.id));
                        }}
                        onMouseEnter={playHoverSound}
                        className={`p-2 rounded-xl transition-colors ${
                          isFav
                            ? 'text-red-500 hover:bg-red-500/15'
                            : 'text-gray-500 hover:text-white hover:bg-[#262638]'
                        }`}
                        title={isFav ? 'Favorilerden Kaldır' : 'Favorilere Ekle'}
                      >
                        <Heart size={16} className={isFav ? 'fill-red-500' : ''} />
                      </button>

                      <div className="w-9 h-9 rounded-xl bg-theme hover:bg-theme-hover text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-theme-glow">
                        <Play size={15} className="fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination / Infinite Scroll Loading Trigger */}
            {!searchQuery.trim() && visibleCount < filteredChannels.length && (
              <div ref={observerTarget} className="py-6 flex flex-col items-center justify-center">
                <button
                  onClick={handleLoadMore}
                  onMouseEnter={playHoverSound}
                  className="px-6 py-2.5 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#262638] hover:border-theme text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-2 shadow-sm"
                >
                  <ChevronDown size={16} />
                  <span>{t('live.moreChannels')} ({filteredChannels.length - visibleCount} {t('live.remainingChannels')})</span>
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
        title="Canlı TV Kategorileri"
        totalItemsCount={channels.length}
        favoritesCount={favorites.length}
        categoryCounts={categoryCounts}
      />
    </div>
  );
}
