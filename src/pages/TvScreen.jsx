import React from 'react';
import Header from '../components/Header';
import { useTranslation } from '../i18n/LanguageContext';
import { Sparkles, BellRing } from 'lucide-react';

export default function TvScreen() {
  const { t } = useTranslation();

  const barbers = [
    { name: 'Ravi', token: 'S-12', customer: 'Aarav', status: 'Now: S-12', isBusy: true },
    { name: 'Amit', token: 'S-13', customer: 'Rohan', status: 'Now: S-13', isBusy: true, isNew: true },
    { name: 'Imran', token: null, customer: null, status: t('tv_free'), isBusy: false },
  ];

  const upNext = [
    { token: 'S-14', est: '5 min' },
    { token: 'S-15', est: '15 min' },
    { token: 'S-16', est: '25 min' },
    { token: 'S-17', est: '40 min' },
    { token: 'S-18', est: '55 min' },
  ];

  return (
    <div className="min-h-screen bg-charcoal-dark flex flex-col select-none">
      {/* TV Header with prominent brand & language toggle */}
      <Header title={t('tv_view_title')} showBack={false} />

      <main className="flex-1 p-6 lg:p-10 flex flex-col justify-between max-w-7xl mx-auto w-full gap-8">
        {/* Top TV Banner */}
        <div className="flex items-center justify-between border-b border-charcoal-light pb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold uppercase tracking-widest text-gold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {t('tv_view_title')}
            </span>
          </div>
          <span className="text-xs text-gold-muted font-mono">
            Screen 6 · 1080p Landscape View (Readable from 5m)
          </span>
        </div>

        {/* Main Grid: Barbers (Left) and Up Next Tokens (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          {/* Barbers Floor Section (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-gold-muted mb-2">
              {t('tv_now_serving')}
            </h2>

            <div className="space-y-4">
              {barbers.map((b) => (
                <div
                  key={b.name}
                  className={`p-6 rounded-3xl border transition-all flex items-center justify-between shadow-2xl ${
                    b.isNew
                      ? 'bg-gradient-to-r from-gold/20 via-gold/10 to-charcoal-card border-gold animate-pulse'
                      : 'bg-charcoal-card border-charcoal-light'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gold/15 border-2 border-gold/30 flex items-center justify-center text-gold font-black text-2xl">
                      {b.name[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gold-light">{b.name}</h3>
                      <p className="text-sm text-gold-muted">
                        {b.isBusy ? `In Chair: ${b.customer}` : t('tv_free')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {b.token ? (
                      <div className="font-mono text-4xl lg:text-5xl font-black text-gold">
                        {b.token}
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-emerald-400 uppercase tracking-wider">
                        {t('tv_free')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Up Next List (5 cols) */}
          <div className="lg:col-span-5 bg-charcoal-card border border-charcoal-light rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-charcoal-light">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-gold-muted">
                  {t('tv_up_next')} (5)
                </h2>
                <span className="text-xs text-gold-muted">{t('est_time')}</span>
              </div>

              <div className="divide-y divide-charcoal-light mt-2">
                {upNext.map((item, idx) => (
                  <div
                    key={item.token}
                    className="py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gold-muted w-5">#{idx + 1}</span>
                      <span className="font-mono text-3xl font-black text-gold-light">
                        {item.token}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gold">~{item.est}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert footer */}
            <div className="mt-4 pt-4 border-t border-charcoal-light flex items-center gap-2 text-xs text-gold">
              <BellRing className="w-4 h-4 animate-bounce" />
              <span>{t('tv_chime_alert', { token: 'S-13' })}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
