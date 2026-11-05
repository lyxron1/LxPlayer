import React from 'react';
import { X, Tv, Shield, Cpu, Sparkles, Scale } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#13131A] border border-[#262638] rounded-2xl w-full max-w-lg p-6 relative shadow-theme-glow max-h-[90vh] overflow-y-auto">
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

        <div className="flex flex-col items-center text-center pb-4 border-b border-[#262638]">
          <div className="relative mb-3">
            <img
              src="./logo1.png"
              alt="LxPlayer"
              className="w-16 h-16 object-contain drop-shadow-[0_0_15px_var(--lx-accent-glow)]"
              onError={(e) => {
                e.currentTarget.src = './logo.svg';
              }}
            />
          </div>
          <h2 className="text-xl font-black text-white tracking-wide">LxPlayer Desktop</h2>
          <div className="text-xs font-semibold text-theme mt-1">
            Cyber-Dark Glassmorphism IPTV & Media Suite v2.4.0
          </div>
        </div>

        {/* Technical specs */}
        <div className="py-4 space-y-2.5 text-xs text-gray-300">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#181824] border border-[#262638]">
            <span className="flex items-center gap-2 text-gray-400">
              <Cpu size={15} className="text-theme" /> Çekirdek Motor
            </span>
            <span className="font-semibold text-white">Electron + Vite + React 18</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#181824] border border-[#262638]">
            <span className="flex items-center gap-2 text-gray-400">
              <Tv size={15} className="text-blue-400" /> Akış ve Oynatıcı
            </span>
            <span className="font-semibold text-white">HLS.js + HTML5 Hardware Accel</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#181824] border border-[#262638]">
            <span className="flex items-center gap-2 text-gray-400">
              <Sparkles size={15} className="text-amber-400" /> Ses Mimarisi
            </span>
            <span className="font-semibold text-white">Synthesized Web Audio API ("Ta-Dum")</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#181824] border border-[#262638]">
            <span className="flex items-center gap-2 text-gray-400">
              <Shield size={15} className="text-emerald-400" /> Lisans & Durum
            </span>
            <span className="font-semibold text-emerald-400">PRO Lisans (Aktif)</span>
          </div>
        </div>

        {/* Yasal Oynatıcı Bilgilendirmesi ve Sorumluluk Reddi */}
        <div className="p-4 rounded-xl bg-[#181824]/80 border border-[#262638] space-y-2 text-left my-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
            <Scale size={16} />
            <span>Yasal Bilgilendirme ve Kullanım Beyanı</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            LxPlayer, kullanıcıların kendi mülkiyetindeki m3u çalma listelerini veya yasal Xtream Codes IPTV aboneliklerini oynatmalarını sağlayan bağımsız ve genel amaçlı bir medya oynatıcıdır. LxPlayer kendi sunucularında herhangi bir telifli yayın, kanal, ses, video veya IPTV içeriği barındırmaz, dağıtmaz ve satmaz. Oynatılan tüm içeriklerin telif hakları ve yasal sorumluluğu tamamen kullanıcıya ve kullanıcının bağlandığı servis sağlayıcıya aittir.
          </p>
        </div>

        <div className="text-center text-[11px] text-gray-500 pt-2">
          © 2026 LxPlayer Media Technologies. Tüm hakları saklıdır.
        </div>
      </div>
    </div>
  );
}
