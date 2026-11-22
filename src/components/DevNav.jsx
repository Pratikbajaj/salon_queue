import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function DevNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const screens = [
    { name: t('home_title'), path: '/' },
    { name: t('join_title'), path: '/join' },
    { name: t('status_screen_title'), path: '/status/S-14' },
    { name: t('reception_title'), path: '/reception' },
    { name: t('barber_view_title'), path: '/barber/Ravi' },
    { name: t('tv_view_title'), path: '/display' },
    { name: t('admin_title'), path: '/admin' },
  ];

  return (
    <div className="fixed bottom-3 right-3 z-50">
      {isOpen && (
        <div className="mb-2 p-3 bg-charcoal-card border border-charcoal-light rounded-2xl shadow-2xl backdrop-blur-md w-72 max-w-[90vw] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-charcoal-light">
            <span className="text-xs font-bold uppercase tracking-wider text-gold">
              {t('nav_all_screens')} ({t('nav_screen_count', { count: 7 })})
            </span>
          </div>
          <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
            {screens.map(screen => (
              <NavLink
                key={screen.path}
                to={screen.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition min-h-[44px] ${
                    isActive
                      ? 'bg-gold text-charcoal-dark font-extrabold'
                      : 'text-gold-light hover:bg-charcoal hover:text-gold'
                  }`
                }
              >
                <span>{screen.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] min-w-[44px] rounded-full bg-charcoal-card border border-gold/50 text-gold shadow-lg hover:bg-gold hover:text-charcoal-dark transition active:scale-95 text-xs font-semibold ml-auto"
        title={t('nav_toggle')}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">{t('nav_all_screens')}</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
