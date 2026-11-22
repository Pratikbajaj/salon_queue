import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import { useTranslation } from '../i18n/LanguageContext';
import {
  STAFF_PIN,
  getQueueState,
  getTodayStats,
  setBarberOnDuty,
  setOnlineQueueOpen,
  setServiceActive,
} from '../rules/queueRules';
import { BarChart3, Check, Lock, Scissors, ToggleLeft, ToggleRight, Users } from 'lucide-react';

export default function AdminScreen() {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [queueState, setQueueState] = useState(() => getQueueState());
  const [stats, setStats] = useState(() => getTodayStats());
  const [actionError, setActionError] = useState('');

  const reload = useCallback(() => {
    setQueueState(getQueueState());
    setStats(getTodayStats());
  }, []);

  useEffect(() => {
    window.addEventListener('salon_queue_updated', reload);
    window.addEventListener('storage', reload);
    const intervalId = window.setInterval(reload, 3000);
    return () => {
      window.removeEventListener('salon_queue_updated', reload);
      window.removeEventListener('storage', reload);
      window.clearInterval(intervalId);
    };
  }, [reload]);

  const handlePinSubmit = (event) => {
    event.preventDefault();
    if (pin === STAFF_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
      setPin('');
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const toggleQueue = () => {
    setOnlineQueueOpen(!queueState.isOnlineQueueOpen);
    setActionError('');
    reload();
  };

  const toggleService = (service) => {
    if (!setServiceActive(service.id, !service.active)) {
      setActionError(t('admin_save_error'));
      return;
    }
    setActionError('');
    reload();
  };

  const toggleBarber = (barber) => {
    if (!setBarberOnDuty(barber.id, !barber.onDuty)) {
      setActionError(t('admin_barber_busy'));
      return;
    }
    setActionError('');
    reload();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-charcoal-dark flex flex-col">
        <Header title={t('admin_title')} showBack backTo="/" />
        <main className="flex-1 flex items-center justify-center p-4">
          <form onSubmit={handlePinSubmit} className="bg-charcoal-card border border-charcoal-light rounded-3xl p-7 max-w-sm w-full space-y-5 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gold-light">{t('pin_required')}</h2>
              <p className="text-sm text-gold-muted mt-1">{t('demo_pin_hint')}</p>
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(event) => { setPin(event.target.value.replace(/\D/g, '')); setPinError(false); }}
              placeholder="••••"
              aria-label={t('enter_pin')}
              className="w-full min-h-[52px] px-4 py-2 text-center text-3xl tracking-[0.5em] bg-charcoal border border-charcoal-light rounded-xl text-gold focus:outline-none focus:border-gold font-mono"
            />
            {pinError && <p className="text-sm text-red-400">{t('invalid_pin')}</p>}
            <button type="submit" className="w-full min-h-[48px] bg-gold hover:bg-gold-dark text-charcoal-dark font-bold rounded-xl transition">
              {t('submit')}
            </button>
          </form>
        </main>
      </div>
    );
  }

  const statCards = [
    { key: 'stat_customers_served', value: stats.customersServed, color: 'text-gold-light' },
    { key: 'stat_avg_wait', value: `${stats.averageWait} ${t('min')}`, color: 'text-gold' },
    { key: 'stat_no_shows', value: stats.noShows, color: 'text-amber-400' },
    { key: 'stat_cancellations', value: stats.cancellations, color: 'text-red-400' },
  ];

  return (
    <div className="min-h-screen bg-charcoal-dark flex flex-col">
      <Header title={t('admin_title')} showBack backTo="/" />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-gold-light">{t('admin_title')}</h2>
            <p className="text-sm text-gold-muted mt-1">{t('admin_settings_intro')}</p>
          </div>
          <span className="text-xs font-mono px-3 py-2 bg-gold/10 text-gold border border-gold/30 rounded-lg">{t('admin_screen_label')}</span>
        </div>

        {actionError && (
          <div role="status" className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
            {actionError}
          </div>
        )}

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold-muted flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gold" /> {t('admin_stats_title')}
          </h3>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {statCards.map((stat) => (
              <article key={stat.key} className="bg-charcoal-card border border-charcoal-light rounded-2xl p-4 sm:p-5 shadow">
                <p className="text-xs sm:text-sm text-gold-muted">{t(stat.key)}</p>
                <p className={`text-2xl sm:text-3xl font-black mt-2 ${stat.color}`}>{stat.value}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-charcoal-card border border-charcoal-light rounded-2xl p-4 sm:p-5 shadow space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gold-light">{t('admin_queue_control')}</h3>
              <p className="text-sm text-gold-muted mt-1">{t('admin_online_joining')}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={queueState.isOnlineQueueOpen}
              onClick={toggleQueue}
              className={`min-h-[48px] px-4 rounded-xl text-sm font-bold flex items-center gap-2 border transition ${
                queueState.isOnlineQueueOpen
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-300 border-red-500/30'
              }`}
            >
              {queueState.isOnlineQueueOpen ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              {queueState.isOnlineQueueOpen ? t('admin_queue_open') : t('admin_queue_closed')}
            </button>
          </div>
          <p className={`text-sm rounded-xl px-3 py-2 ${queueState.isOnlineQueueOpen ? 'bg-emerald-500/5 text-emerald-200' : 'bg-red-500/10 text-red-200'}`}>
            {queueState.isOnlineQueueOpen ? t('admin_queue_open_note') : t('admin_queue_closed_note')}
          </p>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <section className="bg-charcoal-card border border-charcoal-light rounded-2xl p-4 sm:p-5 shadow space-y-3">
            <h3 className="text-base font-bold text-gold-light flex items-center gap-2">
              <Users className="w-4 h-4 text-gold" /> {t('admin_barbers_duty')}
            </h3>
            <div className="space-y-2">
              {queueState.barbers.map((barber) => (
                <button
                  key={barber.id}
                  type="button"
                  role="switch"
                  aria-checked={barber.onDuty !== false}
                  onClick={() => toggleBarber(barber)}
                  className={`w-full min-h-[48px] p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                    barber.onDuty !== false
                      ? 'bg-gold/10 border-gold/30 text-gold-light'
                      : 'bg-charcoal border-charcoal-light text-gold-muted'
                  }`}
                >
                  <span className="font-semibold text-sm">{barber.name}</span>
                  <span className="flex items-center gap-2 text-xs">
                    {barber.onDuty !== false ? t('admin_on_duty') : t('admin_off_duty')}
                    {barber.onDuty !== false ? <Check className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-charcoal-card border border-charcoal-light rounded-2xl p-4 sm:p-5 shadow space-y-3">
            <h3 className="text-base font-bold text-gold-light flex items-center gap-2">
              <Scissors className="w-4 h-4 text-gold" /> {t('admin_services_mgmt')}
            </h3>
            <div className="divide-y divide-charcoal-light">
              {queueState.services.map((service) => (
                <div key={service.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gold-light truncate">{t(service.key) || service.name}</div>
                    <div className="text-xs text-gold-muted mt-1">{service.duration} {t('min')} · ₹{service.price}</div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={service.active !== false}
                    onClick={() => toggleService(service)}
                    className={`min-h-[44px] shrink-0 px-3.5 rounded-xl text-xs font-bold border transition ${
                      service.active !== false
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-charcoal text-gold-muted border-charcoal-light'
                    }`}
                  >
                    {service.active !== false ? t('admin_service_active') : t('admin_service_disabled')}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
