import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import HomeScreen from './pages/HomeScreen';
import JoinScreen from './pages/JoinScreen';
import StatusScreen from './pages/StatusScreen';
import ReceptionScreen from './pages/ReceptionScreen';
import BarberScreen from './pages/BarberScreen';
import TvScreen from './pages/TvScreen';
import AdminScreen from './pages/AdminScreen';
import DevNav from './components/DevNav';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-charcoal-dark text-gray-100 flex flex-col font-sans">
          <Routes>
            {/* Screen 1: Home */}
            <Route path="/" element={<HomeScreen />} />

            {/* Screen 2: Join Queue */}
            <Route path="/join" element={<JoinScreen />} />

            {/* Screen 3: My Status */}
            <Route path="/status/:id" element={<StatusScreen />} />
            <Route path="/status" element={<StatusScreen />} />

            {/* Screen 4: Reception Dashboard */}
            <Route path="/reception" element={<ReceptionScreen />} />

            {/* Screen 5: Barber View */}
            <Route path="/barber/:name" element={<BarberScreen />} />
            <Route path="/barber" element={<Navigate to="/barber/Ravi" replace />} />

            {/* Screen 6: Waiting Area TV */}
            <Route path="/display" element={<TvScreen />} />

            {/* Screen 7: Owner Settings */}
            <Route path="/admin" element={<AdminScreen />} />

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Quick switcher to easily view and test all 7 screens */}
          <DevNav />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
