import React from 'react';
import { X, Play, Star, Calendar, Clock, Film, Heart } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';
import { useApp } from '../context/AppContext';

export default function MovieDetailModal({ movie, onClose }) {
  const { playContent, favorites, toggleFavorite } = useApp();

  if (!movie) return null;

  const isFav = favorites.includes(movie.stream_id);

  const handlePlay = () => {
    playClickSound();
    onClose();
    playContent(movie, 'movie');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in select-none">
      <div className="bg-[#13131A] border border-[#262638] rounded-2xl w-full max-w-3xl overflow-hidden relative shadow-theme-glow max-h-[90vh] flex flex-col">
        {/* Backdrop Banner */}
        <div className="relative h-60 w-full overflow-hidden flex-shrink-0">
          <img
            src={movie.backdrop || movie.stream_icon}
            alt={movie.name}
            className="w-full h-full object-cover filter brightness-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-[#13131A]/60 to-transparent" />
          
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            onMouseEnter={playHoverSound}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center space-x-2 text-xs font-semibold text-theme uppercase tracking-widest mb-1">
              <Film size={14} />
              <span>{movie.category_name || 'Film'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide drop-shadow-md">
              {movie.name}
            </h1>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {movie.rating && (
              <div className="flex items-center space-x-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold">
                <Star size={14} className="fill-amber-400" />
                <span>IMDb {movie.rating}</span>
              </div>
            )}
            {movie.year && (
              <div className="flex items-center space-x-1 bg-[#181824] text-gray-300 border border-[#262638] px-2.5 py-1 rounded-lg">
                <Calendar size={13} className="text-gray-400" />
                <span>{movie.year}</span>
              </div>
            )}
            {movie.duration && (
              <div className="flex items-center space-x-1 bg-[#181824] text-gray-300 border border-[#262638] px-2.5 py-1 rounded-lg">
                <Clock size={13} className="text-gray-400" />
                <span>{movie.duration}</span>
              </div>
            )}
            {movie.genre && (
              <div className="bg-theme-soft text-theme border border-theme-soft px-2.5 py-1 rounded-lg">
                {movie.genre}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Konu Özeti</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {movie.description || 'Bu film için detaylı açıklama bulunmamaktadır.'}
            </p>
          </div>

          <div className="pt-3 border-t border-[#262638] flex items-center space-x-4">
            <button
              onClick={handlePlay}
              onMouseEnter={playHoverSound}
              className="flex-1 py-3 px-6 rounded-xl bg-theme hover:bg-theme-hover text-white font-bold flex items-center justify-center space-x-2.5 shadow-theme-glow transition-all transform hover:scale-[1.01]"
            >
              <Play size={18} className="fill-white" />
              <span>Hemen Oynat</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                toggleFavorite(movie.stream_id);
              }}
              onMouseEnter={playHoverSound}
              className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${
                isFav
                  ? 'bg-red-500/15 border-red-500/40 text-red-500'
                  : 'bg-[#181824] border-[#262638] text-gray-300 hover:text-white hover:border-gray-500'
              }`}
              title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            >
              <Heart size={20} className={isFav ? 'fill-red-500' : ''} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
