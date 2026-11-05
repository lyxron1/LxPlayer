import React from 'react';
import { useApp } from './context/AppContext';
import Titlebar from './components/Titlebar';
import DesktopNavbar from './components/DesktopNavbar';
import SidebarDrawer from './components/SidebarDrawer';
import SpeedTestModal from './components/SpeedTestModal';
import ParentalPinModal from './components/ParentalPinModal';
import UpdateCheckModal from './components/UpdateCheckModal';
import AboutModal from './components/AboutModal';
import MovieDetailModal from './components/MovieDetailModal';
import SeriesDetailModal from './components/SeriesDetailModal';
import ErrorBoundary from './components/ErrorBoundary';

// Screens
import ProfileSelectionScreen from './pages/ProfileSelectionScreen';
import LoginScreen from './pages/LoginScreen';
import SplashScreen from './pages/SplashScreen';
import DashboardScreen from './pages/DashboardScreen';
import LiveTvScreen from './pages/LiveTvScreen';
import MoviesScreen from './pages/MoviesScreen';
import SeriesScreen from './pages/SeriesScreen';
import SettingsScreen from './pages/SettingsScreen';
import PlayerScreen from './pages/PlayerScreen';

export default function App() {
  const {
    currentScreen,
    isSpeedTestOpen,
    setIsSpeedTestOpen,
    isPinModalOpen,
    setIsPinModalOpen,
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    isAboutModalOpen,
    setIsAboutModalOpen,
    activeMovieDetail,
    setActiveMovieDetail,
    activeSeriesDetail,
    setActiveSeriesDetail,
    setCurrentScreen,
  } = useApp();

  // Desktop top navbar is displayed on main browsing screens
  const showDesktopNavbar = [
    'dashboard',
    'livetv',
    'movies',
    'series',
    'settings',
  ].includes(currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'profiles':
        return <ProfileSelectionScreen />;
      case 'login':
        return <LoginScreen />;
      case 'splash':
        return <SplashScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'livetv':
        return <LiveTvScreen />;
      case 'movies':
        return <MoviesScreen />;
      case 'series':
        return <SeriesScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'player':
        return <PlayerScreen />;
      default:
        return <ProfileSelectionScreen />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#09090D] text-white overflow-hidden select-none relative font-sans">
      {/* 34px Custom Frameless Titlebar */}
      <Titlebar />

      {/* Steam / Netflix Style Desktop Top Navbar */}
      {showDesktopNavbar && <DesktopNavbar />}

      {/* Main Workspace Screen Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <ErrorBoundary onNavigateHome={() => setCurrentScreen('dashboard')}>
          {renderScreen()}
        </ErrorBoundary>
      </main>

      {/* Slide-In Left Navigation Drawer */}
      <SidebarDrawer />

      {/* Interactive Global Modals */}
      <SpeedTestModal
        isOpen={isSpeedTestOpen}
        onClose={() => setIsSpeedTestOpen(false)}
      />

      <ParentalPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          alert('Ebeveyn kontrolü PIN kodu doğrulandı.');
        }}
      />

      <UpdateCheckModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Detail Modals for Movies and Series */}
      {activeMovieDetail && (
        <MovieDetailModal
          movie={activeMovieDetail}
          onClose={() => setActiveMovieDetail(null)}
        />
      )}

      {activeSeriesDetail && (
        <SeriesDetailModal
          series={activeSeriesDetail}
          onClose={() => setActiveSeriesDetail(null)}
        />
      )}
    </div>
  );
}
