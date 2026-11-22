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
} from '../rules/queueRules';
import { Play, CheckCircle, Coffee, Lock, Scissors, Clock, UserRound } from 'lucide-react';

export default function BarberScreen() {
  const { name } = useParams();
  const requestedName = decodeURIComponent(name || 'Ravi');
  const { t } = useTranslation();
  const [queueState, setQueueState] = useState(() => getQueueState());
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [actionError, setActionError] = useState('');
  const [now, setNow] = useState(Date.now());

  const barber = queueState.barbers.find((b) =>
    b.id.toLowerCase() === requestedName.toLowerCase() ||
    b.name.toLowerCase() === requestedName.toLowerCase()
  );
  const barberId = barber?.id;
  const belongsToBarber = (spot) =>
    (spot.assignedBarber || spot.barber) === barberId;
  const current = queueState.queue.find((spot) =>
    belongsToBarber(spot) &&
    [QUEUE_STATUS.CALLED, QUEUE_STATUS.IN_CHAIR].includes(spot.status)
  );
  const next = queueState.queue.find((spot) =>
    spot.status === QUEUE_STATUS.WAITING &&
    (spot.barber === barberId || (spot.barber === 'any' && !barber?.onBreak))
  );
  const services = (current?.serviceIds || []).map((serviceId) => {
    const service = queueState.services.find((item) => item.id === serviceId);
    return service ? (t(service.key) || service.name) : serviceId;
  });
  const elapsedSeconds = current?.status === QUEUE_STATUS.IN_CHAIR
    ? Math.max(0, Math.floor((now - (current.startedAt || current.updatedAt || current.createdAt || now)) / 1000))
    : 0;
  const elapsedLabel = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

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

  const handleStart = () => {
    if (!current || !startServiceForBarber(current.token, barberId)) {
      setActionError(t('barber_action_error'));
      return;
    }
    setActionError('');
  };

  const handleDone = () => {
    if (!current || !completeServiceForBarber(current.token, barberId)) {
      setActionError(t('barber_action_error'));
      return;
    }
    setActionError('');
  };

  const handleBreakToggle = () => {
    if (!barber || !setBarberBreak(barber.id, !barber.onBreak)) {
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
              <p className="text-sm text-gold-muted mt-1">{requestedName} · {t('demo_pin_hint')}</p>
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
      <Header title={`${t('barber_view_title')} · ${barber?.name || requestedName}`} showBack backTo="/" />
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 sm:py-8 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gold-muted">{t('barber_current_customer')}</p>
            <h2 className="text-2xl font-black text-gold-light mt-1">{barber?.name || requestedName}</h2>
          </div>
          <button
            type="button"
            onClick={handleBreakToggle}
            disabled={!barber || Boolean(current)}
            className={`min-h-[48px] px-4 rounded-xl text-sm font-bold border flex items-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed ${
              barber?.onBreak
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <Coffee className="w-4 h-4" />
            {barber?.onBreak ? t('toggle_resume_btn') : t('toggle_break_btn')}
          </button>
        </div>

        {!barber && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {t('barber_not_found')}
          </div>
        )}

        {actionError && (
          <div role="status" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            {actionError}
          </div>
        )}

        {current ? (
          <section className="bg-charcoal-card border border-gold/25 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-muted">
                {current.status === QUEUE_STATUS.CALLED ? t('label_called_at') : t('barber_current_customer')}
              </span>
              {current.status === QUEUE_STATUS.IN_CHAIR && (
                <span className="flex items-center gap-1.5 text-sm font-mono text-gold-light bg-charcoal px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-gold" /> {elapsedLabel}
                </span>
              )}
            </div>

            <div className="text-center py-2">
              <div className="text-5xl sm:text-6xl font-black text-gold font-mono">{current.token}</div>
              <div className="text-2xl font-bold text-gold-light mt-2">{current.name}</div>
              <div className="flex items-center justify-center gap-2 text-sm text-gold-muted mt-3">
                <Scissors className="w-4 h-4 text-gold" />
                <span>{services.join(' + ')}</span>
              </div>
              <p className="text-xs text-gold-muted mt-1">{current.duration} {t('min')}</p>
            </div>

            {current.status === QUEUE_STATUS.CALLED ? (
              <button type="button" onClick={handleStart} className="w-full min-h-[56px] rounded-2xl bg-gold hover:bg-gold-dark text-charcoal-dark font-black text-base flex items-center justify-center gap-2 transition active:scale-[0.99]">
                <Play className="w-5 h-5 fill-current" /> {t('btn_start_service')}
              </button>
            ) : (
              <button type="button" onClick={handleDone} className="w-full min-h-[56px] rounded-2xl bg-gold hover:bg-gold-dark text-charcoal-dark font-black text-base flex items-center justify-center gap-2 transition active:scale-[0.99]">
                <CheckCircle className="w-5 h-5" /> {t('btn_done_service')}
              </button>
            )}
          </section>
        ) : (
          <section className="bg-charcoal-card border border-charcoal-light rounded-3xl p-8 shadow-xl text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gold/10 border border-gold/20 text-gold flex items-center justify-center">
              <UserRound className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gold-light">{t('barber_no_customer')}</h3>
            {barber?.onBreak && <span className="inline-flex px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold">{t('barber_status_badge_break')}</span>}
          </section>
        )}

        <section className="bg-charcoal-card/80 border border-charcoal-light rounded-2xl p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gold-muted mb-3">{t('barber_next_customer')}</div>
          {next ? (
            <div className="flex items-center gap-3">
              <span className="font-mono font-black text-xl text-gold">{next.token}</span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gold-light truncate">{next.name}</div>
                <div className="text-xs text-gold-muted truncate">
                  {next.serviceIds.map((serviceId) => {
                    const service = queueState.services.find((item) => item.id === serviceId);
                    return service ? (t(service.key) || service.name) : serviceId;
                  }).join(' + ')}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gold-muted">{t('barber_no_next')}</p>
          )}
        </section>
      </main>
    </div>
  );
}
