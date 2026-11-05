import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';
import { useApp } from '../context/AppContext';

export default function ParentalPinModal({ isOpen, onClose, onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { parentalPin } = useApp();

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    playClickSound();
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === parentalPin) {
          setTimeout(() => {
            setPin('');
            onSuccess?.();
            onClose();
          }, 200);
        } else {
          setTimeout(() => {
            setError(true);
            setPin('');
          }, 300);
        }
      }
    }
  };

  const handleBackspace = () => {
    playClickSound();
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#13131A] border border-[#262638] rounded-2xl w-full max-w-xs p-6 relative shadow-theme-glow">
        <button
          onClick={() => {
            playClickSound();
            setPin('');
            onClose();
          }}
          onMouseEnter={playHoverSound}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#181824]"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-theme-soft border border-theme-soft flex items-center justify-center text-theme mb-3">
            <Lock size={22} />
          </div>
          <h2 className="text-lg font-bold text-white">Ebeveyn Kontrolü</h2>
          <p className="text-xs text-gray-400 mt-1">Lütfen 4 haneli güvenlik PIN kodunu girin</p>
          <p className="text-[10px] text-gray-500 mt-0.5">(Varsayılan PIN: 0000)</p>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center space-x-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                error
                  ? 'bg-red-500 animate-bounce'
                  : pin.length > i
                  ? 'bg-theme shadow-theme-glow scale-110'
                  : 'bg-[#181824] border border-[#262638]'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="text-center text-xs text-red-400 font-medium mb-4 animate-pulse">
            Hatalı PIN kodu! Tekrar deneyin.
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num.toString())}
              onMouseEnter={playHoverSound}
              className="h-12 rounded-xl bg-[#181824] hover:bg-[#262638] text-white font-bold text-lg transition-colors flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => {
              playClickSound();
              setPin('');
            }}
            onMouseEnter={playHoverSound}
            className="h-12 rounded-xl bg-[#181824] hover:bg-[#262638] text-gray-400 font-semibold text-xs transition-colors flex items-center justify-center"
          >
            Sil
          </button>
          <button
            onClick={() => handleDigit('0')}
            onMouseEnter={playHoverSound}
            className="h-12 rounded-xl bg-[#181824] hover:bg-[#262638] text-white font-bold text-lg transition-colors flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            onMouseEnter={playHoverSound}
            className="h-12 rounded-xl bg-[#181824] hover:bg-[#262638] text-gray-400 font-semibold text-xs transition-colors flex items-center justify-center"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
