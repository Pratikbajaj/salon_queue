import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Scissors, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header({ title, showBack = false, backTo = '/' }) {
  const { language, toggleLanguage, t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 bg-charcoal-card/95 backdrop-blur border-b border-charcoal-light px-4 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <Link
              to={backTo}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] text-gold-muted hover:text-gold transition-colors p-2 -ml-2 rounded-lg"
              aria-label={t('back')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}

          <Link to="/" className="flex items-center gap-2 min-w-0 group">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold/20 transition">
              <Scissors className="w-5 h-5 rotate-45" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-gold-light flex items-center gap-2 break-words">
                {t('salon_name')}
              </h1>
              {title ? (
                <span className="text-xs font-semibold text-gold">{title}</span>
              ) : (
                <span className="text-xs text-gold-muted break-words">{t('salon_tagline')}</span>
              )}
            </div>
          </Link>
        </div>

        {/* Top-Right Language Toggle: EN | हिं (at least 44px tap target) */}
        <div className="flex items-center shrink-0">
          <button
            onClick={toggleLanguage}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] min-w-[44px] rounded-full bg-charcoal border border-charcoal-light text-sm font-semibold shadow-inner hover:border-gold transition-all cursor-pointer active:scale-95"
            aria-label={t('language_toggle')}
          >
            <Globe className="w-4 h-4 text-gold" />
            <span className={language === 'en' ? 'text-gold font-bold' : 'text-gold-muted'}>
              EN
            </span>
            <span className="text-charcoal-light">|</span>
            <span className={language === 'hi' ? 'text-gold font-bold' : 'text-gold-muted'}>
              हिं
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
