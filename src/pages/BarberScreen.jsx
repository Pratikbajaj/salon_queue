import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useTranslation } from '../i18n/LanguageContext';
import {
  STAFF_PIN,
  QUEUE_STATUS,
  getQueueState,
  startServiceForBarber,
  completeServiceForBarber,
  setBarberBreak,
  getBarberDisplayStatus,
} from '../rules/queueRules';
import { Play, CheckCircle, Coffee, Lock, Scissors, Clock, UserRound, Users } from 'lucide-react';

export default function BarberScreen() {
  const { name } = useParams();
  const { t } = useTranslation();
  const [queueState, setQueueState] = useState(() => getQueueState());
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [actionError, setActionError] = useState('');
  const [now, setNow] = useState(Date.now());

  const requestedName = name?.toLowerCase();
  const highlightedBarber = requestedName
    ? queueState.barbers.find((barber) =>
        barber.id.toLowerCase() === requestedName || barber.name.toLowerCase() === requestedName
      )
    : null;
  const onDutyBarbers = queueState.barbers.filter((barber) => barber.onDuty !== false);

  const getCurrentCustomer = (barber) => queueState.queue.find((spot) => {
    const assigned = String(spot.assignedBarber || spot.barber || '').toLowerCase();
    const belongsToBarber = assigned === barber.id.toLowerCase() || assigned === barber.name.toLowerCase();
    return belongsToBarber && [QUEUE_STATUS.CALLED, QUEUE_STATUS.IN_CHAIR].includes(spot.status);
  });

  const getNextCustomer = (barber) => queueState.queue.find((spot) => {
    if (spot.status !== QUEUE_STATUS.WAITING || barber.onDuty === false) return false;
    const preference = String(spot.barber || '').toLowerCase();
    const isPreferred = preference === barber.id.toLowerCase() || preference === barber.name.toLowerCase();
    return isPreferred || (preference === 'any' && !barber.onBreak);
  });

  useEffect(() => {
    const refresh = () => setQueueState(getQueueState());
    window.addEventListener('salon_queue_updated', refresh);
    window.addEventListener('storage', refresh);
    const refreshId = window.setInterval(refresh, 3000);
    const clockId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.removeEventListener('salon_queue_updated', refresh);
      window.removeEventListener('storage', refresh);
      window.clearInterval(refreshId);
      window.clearInterval(clockId);
    };
  }, []);

  const handlePinSubmit = (event) => {
    event.preventDefault();
    if (pin === STAFF_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const handleStart = (current, barber) => {
    if (!current || !startServiceForBarber(current.token, barber.id)) {
      setActionError(t('barber_action_error'));
      return;
    }
    setActionError('');
  };

  const handleDone = (current, barber) => {
    if (!current || !completeServiceForBarber(current.token, barber.id)) {
      setActionError(t('barber_action_error'));
      return;
    }
    setActionError('');
  };

  const handleBreakToggle = (barber) => {
    if (!setBarberBreak(barber.id, !barber.onBreak)) {
      setActionError(t('barber_break_error'));
      return;
    }
    setActionError('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-charcoal-dark flex flex-col">
        <Header title={t('barber_view_title')} showBack backTo="/" />
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

  return (
    <div className="min-h-screen bg-charcoal-dark flex flex-col">
      <Header title={t('barber_view_title')} showBack backTo="/" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 space-y-5">
        {requestedName && !highlightedBarber && (
          <div role="status" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {t('barber_not_found')}
          </div>
        )}

        {actionError && (
          <div role="status" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            {actionError}
          </div>
        )}

        {onDutyBarbers.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {onDutyBarbers.map((barber) => {
              const current = getCurrentCustomer(barber);
              const next = getNextCustomer(barber);
              const displayStatus = getBarberDisplayStatus(barber, queueState.queue);
              const displayStatusKey = {
                busy: 'status_busy',
                available: 'status_free',
                on_break: 'status_break',
              }[displayStatus];
              const statusColor = displayStatus === 'busy'
                ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                : displayStatus === 'available'
                ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                : 'text-gold-muted bg-charcoal border-charcoal-light';
              const services = (current?.serviceIds || []).map((serviceId) => {
                const service = queueState.services.find((item) => item.id === serviceId);
                return service ? (t(service.key) || service.name) : serviceId;
              });
              const elapsedSeconds = current?.status === QUEUE_STATUS.IN_CHAIR
                ? Math.max(0, Math.floor((now - (current.startedAt || current.updatedAt || current.createdAt || now)) / 1000))
                : 0;
              const elapsedLabel = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`;
              const isHighlighted = highlightedBarber?.id === barber.id;

              return (
                <section
                  key={barber.id}
                  className={`bg-charcoal-card border rounded-3xl p-4 sm:p-5 shadow-xl space-y-4 ${
                    isHighlighted ? 'border-gold ring-2 ring-gold/50' : 'border-charcoal-light'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-xl font-black text-gold-light break-words">{barber.name}</h2>
                      <span className={`inline-flex mt-2 px-2.5 py-1 rounded-full border text-xs font-bold ${statusColor}`}>
                        {t(displayStatusKey)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBreakToggle(barber)}
                      disabled={barber.onDuty === false || Boolean(current)}
                      aria-label={barber.onBreak ? t('toggle_resume_btn') : t('toggle_break_btn')}
                      className="shrink-0 min-h-[44px] px-3 rounded-xl text-xs font-bold border border-charcoal-light bg-charcoal text-gold-light hover:border-gold transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Coffee className="w-4 h-4 inline mr-1.5" />
                      {barber.onBreak ? t('toggle_resume_btn') : t('toggle_break_btn')}
                    </button>
                  </div>

                  {current ? (
                    <div className="bg-charcoal rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gold-muted">
                          {current.status === QUEUE_STATUS.CALLED ? t('label_called_at') : t('barber_current_customer')}
                        </span>
                        {current.status === QUEUE_STATUS.IN_CHAIR && (
                          <span className="flex items-center gap-1.5 text-xs font-mono text-gold-light bg-charcoal-card px-2.5 py-1.5 rounded-lg">
                            <Clock className="w-4 h-4 text-gold" /> {elapsedLabel}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-mono text-3xl font-black text-gold">{current.token}</div>
                        <div className="text-lg font-bold text-gold-light mt-1 break-words">{current.name}</div>
                        <div className="flex items-start gap-2 text-sm text-gold-muted mt-2 min-w-0">
                          <Scissors className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          <span className="break-words">{services.join(' + ')}</span>
                        </div>
                        <p className="text-xs text-gold-muted mt-1">{current.duration} {t('min')}</p>
                        {current.status === QUEUE_STATUS.IN_CHAIR && (
                          <p className="text-[11px] text-gold-muted mt-1">{t('barber_timer')}</p>
                        )}
                      </div>

                      {current.status === QUEUE_STATUS.CALLED ? (
                        <button type="button" onClick={() => handleStart(current, barber)} className="w-full min-h-[52px] rounded-xl bg-gold hover:bg-gold-dark text-charcoal-dark font-black flex items-center justify-center gap-2 transition active:scale-[0.99]">
                          <Play className="w-5 h-5 fill-current" /> {t('btn_start_service')}
                        </button>
                      ) : (
                        <button type="button" onClick={() => handleDone(current, barber)} className="w-full min-h-[52px] rounded-xl bg-gold hover:bg-gold-dark text-charcoal-dark font-black flex items-center justify-center gap-2 transition active:scale-[0.99]">
                          <CheckCircle className="w-5 h-5" /> {t('btn_done_service')}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-charcoal rounded-2xl p-5 text-center space-y-2">
                      <UserRound className="w-8 h-8 text-gold-muted mx-auto" />
                      <p className="text-sm font-semibold text-gold-light">{t('barber_no_customer')}</p>
                    </div>
                  )}

                  <div className="bg-charcoal-card/80 border border-charcoal-light rounded-2xl p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-gold-muted mb-3">
                      {t('barber_next_customer')}
                    </div>
                    {next ? (
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono font-black text-xl text-gold shrink-0">{next.token}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gold-light break-words">{next.name}</div>
                          <div className="text-xs text-gold-muted break-words">
                            {(next.serviceIds || []).map((serviceId) => {
                              const service = queueState.services.find((item) => item.id === serviceId);
                              return service ? (t(service.key) || service.name) : serviceId;
                            }).join(' + ')}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gold-muted">{t('barber_no_next')}</p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <section className="bg-charcoal-card border border-charcoal-light rounded-3xl p-8 shadow-xl text-center space-y-3">
            <Users className="w-10 h-10 text-gold-muted mx-auto" />
            <h2 className="text-lg font-bold text-gold-light">{t('barber_none_on_duty')}</h2>
          </section>
        )}
      </main>
    </div>
  );
}
