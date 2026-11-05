import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEngine';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    playClickSound();
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || 'İçerik Yüklenirken Bir Sorun Oluştu';
      const message =
        this.props.fallbackMessage ||
        'Sunucudan gelen veriler işlenirken beklenmeyen bir hata meydana geldi. Lütfen yeniden deneyin veya kütüphaneyi yenileyin.';

      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 select-none text-center bg-[#09090D] min-h-[360px]">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-5 shadow-lg shadow-red-500/5">
            <AlertTriangle size={36} className="text-red-400" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-wide">{title}</h2>
          <p className="text-sm text-gray-400 mt-2 max-w-lg leading-relaxed">{message}</p>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="mt-4 p-3 bg-[#13131A] border border-[#262638] rounded-xl text-left max-w-xl w-full overflow-x-auto text-[11px] text-red-300 font-mono">
              {this.state.error.toString()}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              onMouseEnter={playHoverSound}
              className="py-3 px-6 rounded-xl bg-theme hover:bg-theme-hover text-white font-bold text-xs flex items-center space-x-2 shadow-theme-glow transition-transform hover:scale-[1.02]"
            >
              <RefreshCw size={15} />
              <span>Yeniden Dene</span>
            </button>

            {this.props.onNavigateHome && (
              <button
                onClick={() => {
                  playClickSound();
                  this.props.onNavigateHome();
                }}
                onMouseEnter={playHoverSound}
                className="py-3 px-6 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#262638] text-gray-300 hover:text-white font-bold text-xs flex items-center space-x-2 transition-colors"
              >
                <Home size={15} />
                <span>Ana Sayfaya Dön</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
