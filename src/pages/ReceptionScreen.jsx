import React, { useState } from 'react';
import Header from '../components/Header';
import { useTranslation } from '../i18n/LanguageContext';
import { STAFF_PIN } from '../rules/queueRules';
import { Plus, Lock } from 'lucide-react';

export default function ReceptionScreen() {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

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
        <Header title={t('reception_title')} showBack={true} backTo="/" />
        <main className="flex-1 flex items-center justify-center p-4">
          <form
            onSubmit={handlePinSubmit}
            className="bg-charcoal-card border border-charcoal-light rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gold-light">{t('pin_required')}</h2>
            <p className="text-xs text-gold-muted">{t('demo_pin_hint')}</p>

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
      <Header title={t('reception_title')} showBack={true} backTo="/" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-charcoal-card p-4 rounded-2xl border border-charcoal-light">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gold-light">{t('reception_title')}</h2>
            <span className="text-xs px-2.5 py-1 rounded-md bg-gold/10 text-gold border border-gold/30 font-mono">
              Screen 4 · Tablet Landscape
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 min-h-[44px] px-4 py-2 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-xs rounded-xl active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('btn_add_walkin')}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Left = Barbers on floor, Right = Waiting List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Barbers (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-muted">
              {t('col_barbers')}
            </h3>

            {['Ravi', 'Amit', 'Imran'].map((barber) => (
              <div
                key={barber}
                className="bg-charcoal-card border border-charcoal-light rounded-2xl p-4 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 text-gold flex items-center justify-center font-bold text-xs">
                      {barber[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gold-light">{barber}</h4>
                      <span className="text-[10px] text-emerald-400">Serving S-12</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="min-h-[44px] px-3.5 py-1.5 bg-gold/15 hover:bg-gold/25 text-gold border border-gold/40 text-xs font-bold rounded-xl transition"
                  >
                    {t('btn_call_next')}
                  </button>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-gold-muted mb-1">
                    <span>{t('label_in_chair')}: Haircut (18 min)</span>
                    <span>12/18 min</span>
                  </div>
                  <div className="w-full bg-charcoal h-2 rounded-full overflow-hidden">
                    <div className="bg-gold h-full rounded-full w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Waiting List (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-muted">
              {t('col_waiting_queue')}
            </h3>

            <div className="bg-charcoal-card border border-charcoal-light rounded-2xl p-4 divide-y divide-charcoal-light">
              {[
                { token: 'S-14', name: 'Vikram Mehta', services: 'Haircut + Beard', barber: 'Any', wait: '25 min' },
                { token: 'S-15', name: 'Kunal Shah', services: 'Hair spa', barber: 'Ravi', wait: '45 min' },
                { token: 'S-16', name: 'Devendra Patel', services: 'Shave', barber: 'Amit', wait: '65 min', long: true },
              ].map((item) => (
                <div key={item.token} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gold text-base min-w-[48px]">
                      {item.token}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gold-light">{item.name}</span>
                        {item.long && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            {t('long_wait_badge')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gold-muted">
                        {item.services} · {t('pref_barber', { barber: item.barber })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="min-h-[44px] px-3 py-1.5 bg-charcoal hover:bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-semibold rounded-lg transition"
                    >
                      {t('btn_noshow')}
                    </button>
                    <button
                      type="button"
                      className="min-h-[44px] px-3 py-1.5 bg-charcoal hover:border-gold text-gold-muted hover:text-gold border border-charcoal-light text-xs font-semibold rounded-lg transition"
                    >
                      {t('btn_cancel')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
