import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useTranslation } from '../i18n/LanguageContext';
import { Users, Clock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { getHomeQueueSummary } from '../rules/queueRules';

export default function HomeScreen() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(() => getHomeQueueSummary());

  useEffect(() => {
    const handleUpdate = () => {
      setSummary(getHomeQueueSummary());
    };

    window.addEventListener('salon_queue_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('salon_queue_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const { waitingCount, estimatedWaitMin, isOpen, barbers } = summary;

  // Status chip badge colors: free = emerald, busy = amber, break = muted
  const getBarberChipClass = (status) => {
    switch (status) {
      case 'busy':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'free':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'on_break':
      default:
        return 'text-gold-muted border-charcoal-light bg-charcoal';
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-dark flex flex-col">
      <Header />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isOpen
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              ></span>
              {isOpen ? t('home_badge_open') : t('home_badge_closed')}
            </span>
            <span className="text-xs text-gold-muted font-mono">Screen 1 · Phone</span>
          </div>

          {/* Live Queue Status Card */}
          <div className="bg-charcoal-card border border-charcoal-light rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Live Queue Status</span>
            </div>

            {waitingCount > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-gold-light mb-2">
                  {t('home_waiting_summary', { count: waitingCount, min: estimatedWaitMin })}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gold-light mt-4 pt-4 border-t border-charcoal-light">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold" />
                    <span>{waitingCount} {t('position_suffix')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold" />
                    <span>~{estimatedWaitMin} {t('min')} wait</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-lg font-semibold text-emerald-400">
                  {t('home_empty')}
                </p>
              </div>
            )}
          </div>

          {/* Barbers on Duty */}
          <div className="bg-charcoal-card border border-charcoal-light rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-muted mb-3">
              {t('home_barbers_title')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {barbers.map((b) => (
                <div
                  key={b.id || b.name}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition ${getBarberChipClass(
                    b.status
                  )}`}
                >
                  <span className="text-sm font-bold text-gold-light">{b.name}</span>
                  <span className="text-[11px] capitalize mt-0.5">
                    {b.onDuty === false && t('status_off_duty')}
                    {b.onDuty !== false && b.status === 'busy' && t('status_busy')}
                    {b.onDuty !== false && b.status === 'free' && t('status_free')}
                    {b.onDuty !== false && b.status === 'on_break' && t('status_break')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Big Gold Button [ Join Queue ] */}
        <div className="mt-8 pt-4">
          {isOpen ? (
            <Link
              to="/join"
              className="w-full min-h-[52px] px-6 py-3.5 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-base rounded-2xl shadow-lg hover:brightness-105 active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              <span>{t('home_join_button')}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </Link>
          ) : (
            <div className="p-4 rounded-2xl bg-charcoal-card border border-charcoal-light text-center text-sm text-gold-muted">
              {t('home_join_closed_notice')}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
