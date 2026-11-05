import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Search, Grid, Check, Heart, Layers, Hash } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';

export default function CategoryPickerModal({
  isOpen,
  onClose,
  categories = [],
  selectedCategory,
  onSelectCategory,
  title = 'Tüm Kategoriler',
  totalItemsCount = 0,
  favoritesCount = 0,
  categoryCounts = {},
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter categories by query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter((cat) =>
      cat.category_name && cat.category_name.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (catId) => {
    playClickSound();
    onSelectCategory(catId);
    onClose();
  };

  const isAllSelected = selectedCategory === 'all';
  const isFavSelected = selectedCategory === 'favorites';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none animate-fade-in">
      <div
        className="bg-[#13131A] border border-[#262638] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-theme-glow overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#262638] flex items-center justify-between flex-shrink-0 bg-[#0E0E14]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-theme-soft border border-theme-soft flex items-center justify-center text-theme">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                {title}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Toplam {categories.length.toLocaleString('tr-TR')} kategori arasından seçim yapın
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            onMouseEnter={playHoverSound}
            className="w-9 h-9 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#262638] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#262638] bg-[#111118] flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <Search size={16} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kategori adı ara (örn: Spor, Sinema, Belgesel, TR...)"
              className="w-full pl-10 pr-10 py-2.5 bg-[#181824] border border-[#262638] focus:border-theme rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  playClickSound();
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                onMouseEnter={playHoverSound}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Body (Scrollable) */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Quick Primary Actions: "Tüm İçerikler" & "Favorilerim" */}
          {!searchQuery.trim() && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-[#262638]">
              <button
                onClick={() => handleSelect('all')}
                onMouseEnter={playHoverSound}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                  isAllSelected
                    ? 'bg-theme/20 border-theme text-white shadow-theme-glow ring-1 ring-theme'
                    : 'bg-[#181824] hover:bg-[#1f1f2e] border-[#262638] text-gray-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isAllSelected ? 'bg-theme text-white' : 'bg-[#09090D] text-gray-400 border border-[#262638]'
                    }`}
                  >
                    <Grid size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold truncate">Tüm İçerikler</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Kütüphanedeki her şey</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  {totalItemsCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#09090D] border border-[#262638] text-gray-400">
                      {totalItemsCount.toLocaleString('tr-TR')}
                    </span>
                  )}
                  {isAllSelected && <Check size={16} className="text-theme" />}
                </div>
              </button>

              <button
                onClick={() => handleSelect('favorites')}
                onMouseEnter={playHoverSound}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                  isFavSelected
                    ? 'bg-red-500/20 border-red-500/60 text-white shadow-lg ring-1 ring-red-500/50'
                    : 'bg-[#181824] hover:bg-[#1f1f2e] border-[#262638] text-gray-300 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isFavSelected
                        ? 'bg-red-500 text-white'
                        : 'bg-[#09090D] text-red-400 border border-[#262638]'
                    }`}
                  >
                    <Heart size={15} className={isFavSelected ? 'fill-white' : 'fill-red-500/20'} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold truncate">Favorilerim</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">Yıldızladığınız öğeler</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#09090D] border border-[#262638] text-gray-400">
                    {favoritesCount}
                  </span>
                  {isFavSelected && <Check size={16} className="text-red-400" />}
                </div>
              </button>
            </div>
          )}

          {/* Dynamic Categories Grid */}
          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Hash size={36} className="text-gray-600 mb-2" />
              <div className="text-sm font-bold text-white">Eşleşen Kategori Bulunamadı</div>
              <p className="text-xs text-gray-400 mt-1">
                "{searchQuery}" aramasıyla eşleşen bir kategori bulunamadı
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredCategories.map((cat) => {
                const isSelected =
                  String(selectedCategory || '').replace(/\.0$/, '').trim() ===
                  String(cat.category_id || '').replace(/\.0$/, '').trim();
                const count = categoryCounts[cat.category_id];

                return (
                  <button
                    key={cat.category_id}
                    onClick={() => handleSelect(cat.category_id)}
                    onMouseEnter={playHoverSound}
                    className={`p-3 rounded-xl border text-left transition-all duration-150 flex items-center justify-between group ${
                      isSelected
                        ? 'bg-theme/20 border-theme text-white shadow-theme-glow ring-1 ring-theme'
                        : 'bg-[#181824]/80 hover:bg-[#1f1f2e] border-[#262638] hover:border-theme/40 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold truncate group-hover:text-theme transition-colors">
                        {cat.category_name}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {typeof count === 'number' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#09090D] text-gray-400 border border-[#262638]">
                          {count}
                        </span>
                      )}
                      {isSelected && <Check size={14} className="text-theme flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#262638] bg-[#0E0E14] flex items-center justify-between text-xs text-gray-400 flex-shrink-0">
          <div>
            <span>Seçili Kategori: </span>
            <span className="text-white font-bold">
              {isAllSelected
                ? 'Tüm İçerikler'
                : isFavSelected
                ? 'Favorilerim'
                : categories.find(
                    (c) =>
                      String(c.category_id || '').replace(/\.0$/, '').trim() ===
                      String(selectedCategory || '').replace(/\.0$/, '').trim()
                  )?.category_name || selectedCategory}
            </span>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            onMouseEnter={playHoverSound}
            className="px-4 py-1.5 rounded-lg bg-[#181824] hover:bg-[#202030] border border-[#262638] text-gray-300 hover:text-white font-semibold text-xs transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
