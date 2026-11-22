import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useTranslation } from '../i18n/LanguageContext';
import { STAFF_PIN } from '../rules/queueRules';
import { Play, CheckCircle, Coffee, Lock } from 'lucide-react';

export default function BarberScreen() {
  const { name } = useParams();
  const barberName = name || 'Ravi';
  const { t } = useTranslation();

  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === STAFF_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-charcoal-dark flex flex-col">
        <Header title={t('barber_view_title')} showBack={true} backTo="/" />
        <main className="flex-1 flex items-center justify-center p-4">
          <form
            onSubmit={handlePinSubmit}
            className="bg-charcoal-card border border-charcoal-light rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gold-light">{t('pin_required')}</h2>
            <p className="text-xs text-gold-muted">{t('demo_pin_hint')} (Barber: {barberName})</p>

            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full min-h-[48px] px-4 py-2 text-center text-2xl tracking-widest bg-charcoal border border-charcoal-light rounded-xl text-gold focus:outline-none focus:border-gold font-mono"
            />
            {pinError && (
              <p className="text-xs text-red-400">{t('invalid_pin')}</p>
            )}

            <button
              type="submit"
              className="w-full min-h-[44px] bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-sm rounded-xl transition cursor-pointer"
            >
              {t('submit')}
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-dark flex flex-col">
      <Header title={`${t('barber_view_title')} · ${barberName}`} showBack={true} backTo="/" />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gold-light">{barberName}</h2>
            <span className="text-xs text-gold-muted font-mono">Screen 5 · Phone</span>
          </div>

          {/* Toggle Break */}
          <button
            type="button"
            onClick={() => setIsOnBreak(!isOnBreak)}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition ${
              isOnBreak
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>{isOnBreak ? t('barber_status_badge_break') : t('barber_status_badge_ready')}</span>
          </button>
        </div>

        {/* Current Customer Card */}
        <div className="bg-charcoal-card border border-charcoal-light rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gold">
              {t('barber_current_customer')}
            </span>
            <span className="text-xs font-mono text-gold-light bg-charcoal px-2.5 py-1 rounded-md border border-charcoal-light">
              {t('barber_timer')}: 14:22
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-gold font-mono">S-12</div>
            <div className="text-base font-semibold text-gold-light">Aarav Sharma</div>
            <div className="text-xs text-gold-muted">Haircut + Beard Trim (45 min)</div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-charcoal border border-gold/40 text-gold hover:bg-gold/10 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('btn_start_service')}</span>
            </button>
            <button
              type="button"
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t('btn_done_service')}</span>
            </button>
          </div>
        </div>

        {/* Next for You Card */}
        <div className="bg-charcoal-card border border-charcoal-light rounded-2xl p-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-gold-muted">
            {t('barber_next_customer')}
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-gold">S-15</span>
              <span className="text-gold-light font-medium">Kunal Shah</span>
            </div>
            <span className="text-xs text-gold-muted">Haircut (30 min)</span>
          </div>
        </div>
      </main>
    </div>
  );
}
