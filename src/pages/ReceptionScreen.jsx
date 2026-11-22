import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../components/Header';
import { useTranslation } from '../i18n/LanguageContext';
import {
  STAFF_PIN,
  QUEUE_STATUS,
  SERVICES_LIST,
  getQueueState,
  callNextForBarber,
  markNoShow,
  cancelCustomerSpot,
  addWalkIn,
  getWaitingMinutes,
  validatePhone,
} from '../rules/queueRules';
import { Plus, Lock, Clock, AlertTriangle, User, X, ChevronDown } from 'lucide-react';

// ─── PIN Gate ──────────────────────────────────────────────────────────────────
function PinGate({ onAuth }) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === STAFF_PIN) {
      onAuth();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-dark flex flex-col">
      <Header title={t('reception_title')} showBack backTo="/" />
      <main className="flex-1 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="bg-charcoal-card border border-charcoal-light rounded-3xl p-8 max-w-sm w-full space-y-5 text-center shadow-2xl"
        >
          <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gold-light">{t('pin_required')}</h2>
            <p className="text-xs text-gold-muted mt-1">{t('demo_pin_hint')}</p>
          </div>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false); }}
            placeholder="••••"
            autoFocus
            className="w-full min-h-[52px] px-4 py-2 text-center text-3xl tracking-[0.5em] bg-charcoal border border-charcoal-light rounded-xl text-gold focus:outline-none focus:border-gold font-mono"
          />
          {error && <p className="text-xs text-red-400">{t('invalid_pin')}</p>}
          <button
            type="submit"
            className="w-full min-h-[48px] bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-sm rounded-xl transition cursor-pointer"
          >
            {t('submit')}
          </button>
        </form>
      </main>
    </div>
  );
}

// ─── Walk-in Modal ──────────────────────────────────────────────────────────────
function WalkInModal({ onClose, onAdd }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [barber, setBarber] = useState('any');
  const [errors, setErrors] = useState({});
  const [adding, setAdding] = useState(false);
  const state = getQueueState();
  const activeServices = state.services.filter((s) => s.active);
  const barbers = state.barbers;

  const toggleService = (id) => {
    setSelectedServices((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = t('err_name_required');
    if (!validatePhone(phone)) errs.phone = t('err_phone_digits');
    if (selectedServices.length === 0) errs.services = t('err_no_service');
    return errs;
  };

  const handleAdd = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setAdding(true);
    const result = addWalkIn({ name: name.trim(), phone, serviceIds: selectedServices, barber });
    setAdding(false);
    onAdd(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-black/80 backdrop-blur-sm">
      <div className="bg-charcoal-card border border-charcoal-light rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gold-light">{t('walkin_title')}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-charcoal-light text-gold-muted hover:text-gold transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gold-muted uppercase tracking-wider">{t('walkin_name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: null })); }}
            placeholder={t('field_name_placeholder')}
            className="w-full min-h-[44px] px-4 py-2 bg-charcoal border border-charcoal-light rounded-xl text-gold-light placeholder-gold-muted/50 focus:outline-none focus:border-gold text-sm"
          />
          {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gold-muted uppercase tracking-wider">{t('walkin_phone')}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors((p) => ({ ...p, phone: null })); }}
            placeholder={t('field_phone_placeholder')}
            className="w-full min-h-[44px] px-4 py-2 bg-charcoal border border-charcoal-light rounded-xl text-gold-light placeholder-gold-muted/50 focus:outline-none focus:border-gold text-sm font-mono"
          />
          {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
        </div>

        {/* Services */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gold-muted uppercase tracking-wider">
            {t('walkin_services')} <span className="text-gold-muted/60">({selectedServices.length}/3)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {activeServices.map((svc) => {
              const sel = selectedServices.includes(svc.id);
              const disabled = !sel && selectedServices.length >= 3;
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => !disabled && toggleService(svc.id)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-left text-xs font-semibold transition border ${
                    sel
                      ? 'bg-gold/15 border-gold text-gold'
                      : disabled
                      ? 'bg-charcoal border-charcoal-light text-gold-muted/40 cursor-not-allowed'
                      : 'bg-charcoal border-charcoal-light text-gold-muted hover:border-gold/50 hover:text-gold-light'
                  }`}
                >
                  <span className="block">{t(svc.key) || svc.name}</span>
                  <span className="text-[10px] opacity-70">{svc.duration}m · ₹{svc.price}</span>
                </button>
              );
            })}
          </div>
          {errors.services && <p className="text-xs text-red-400">{errors.services}</p>}
        </div>

        {/* Barber */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gold-muted uppercase tracking-wider">{t('walkin_barber')}</label>
          <div className="relative">
            <select
              value={barber}
              onChange={(e) => setBarber(e.target.value)}
              className="w-full min-h-[44px] px-4 py-2 pr-8 bg-charcoal border border-charcoal-light rounded-xl text-gold-light focus:outline-none focus:border-gold text-sm appearance-none"
            >
              <option value="any">{t('any_barber')}</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}{b.onBreak ? ` (${t('label_on_break')})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-muted pointer-events-none" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[48px] bg-charcoal border border-charcoal-light hover:border-gold text-gold-muted hover:text-gold font-semibold text-sm rounded-xl transition"
          >
            {t('walkin_btn_cancel')}
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            className="flex-1 min-h-[48px] bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-sm rounded-xl transition"
          >
            {t('walkin_btn_add')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ─────────────────────────────────────────────────────────────
function ConfirmDialog({ title, desc, onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-black/80 backdrop-blur-sm">
      <div className="bg-charcoal-card border border-charcoal-light rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gold-light">{title}</h3>
        <p className="text-sm text-gold-muted">{desc}</p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 min-h-[48px] bg-charcoal border border-charcoal-light hover:border-gold text-gold-muted hover:text-gold font-semibold text-sm rounded-xl transition"
          >
            {t('btn_no_back')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 min-h-[48px] bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-xl transition"
          >
            {t('btn_yes_confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Barber Card ────────────────────────────────────────────────────────────────
function BarberCard({ barber, queue, onCallNext, t }) {
  // Find this barber's current in-chair or called customer
  const inChair = queue.find(
    (q) =>
      (q.barber === barber.id || q.assignedBarber === barber.id) &&
      q.status === QUEUE_STATUS.IN_CHAIR
  );
  const called = queue.find(
    (q) =>
      (q.barber === barber.id || q.assignedBarber === barber.id) &&
      q.status === QUEUE_STATUS.CALLED
  );
  const current = inChair || called;

  // Next customer for this barber
  const next = queue.find(
    (q) =>
      q.status === QUEUE_STATUS.WAITING &&
      barber.onDuty !== false &&
      (q.barber === barber.id || (q.barber === 'any' && !barber.onBreak))
  );

  // No-show countdown (10 min from calledAt)
  const [countdown, setCountdown] = useState(null);
  useEffect(() => {
    if (!called) { setCountdown(null); return; }
    const tick = () => {
      const elapsed = Math.floor((Date.now() - (called.calledAt || Date.now())) / 1000);
      const remaining = 600 - elapsed;
      setCountdown(remaining > 0 ? remaining : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [called]);

  const fmtCountdown = (s) => {
    if (s === null) return '';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  // Can call next?
  const canCallNext = barber.onDuty !== false && !barber.onBreak && !inChair && !called;

  // Status label
  let statusLabel = t('label_free');
  let statusColor = 'text-emerald-400';
  if (barber.onDuty === false) { statusLabel = t('admin_off_duty'); statusColor = 'text-gold-muted'; }
  else if (barber.onBreak) { statusLabel = t('label_on_break'); statusColor = 'text-gold-muted'; }
  else if (inChair) { statusLabel = t('label_serving'); statusColor = 'text-amber-400'; }
  else if (called) { statusLabel = t('label_called_at'); statusColor = 'text-sky-400'; }

  return (
    <div className={`bg-charcoal-card border rounded-2xl p-4 space-y-3 shadow-md transition ${
      barber.onBreak ? 'border-charcoal-light opacity-70' : 'border-charcoal-light'
    }`}>
      {/* Barber header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 text-gold flex items-center justify-center font-bold text-sm flex-shrink-0">
            {barber.name[0]}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gold-light leading-tight">{barber.name}</h4>
            <span className={`text-[11px] font-medium ${statusColor}`}>{statusLabel}</span>
          </div>
        </div>
        <button
          type="button"
          disabled={!canCallNext}
          onClick={() => onCallNext(barber.id)}
          className={`min-h-[44px] px-4 py-1.5 text-xs font-bold rounded-xl transition border ${
            canCallNext
              ? 'bg-gold/15 hover:bg-gold/25 text-gold border-gold/40 cursor-pointer active:scale-95'
              : 'bg-charcoal-light/20 text-gold-muted/40 border-charcoal-light/30 cursor-not-allowed'
          }`}
        >
          {t('btn_call_next')}
        </button>
      </div>

      {/* Current customer */}
      {current && (
        <div className="bg-charcoal rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-gold text-sm">{current.token}</span>
              <span className="ml-2 text-sm text-gold-light font-medium">{current.name}</span>
            </div>
            {called && countdown !== null && (
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                countdown < 120 ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
              }`}>
                {fmtCountdown(countdown)}
              </span>
            )}
          </div>
          {/* Services */}
          <p className="text-xs text-gold-muted">
            {current.serviceIds?.map((id) => {
              const svc = SERVICES_LIST.find((s) => s.id === id);
              return svc ? (t(svc.key) || svc.name) : id;
            }).join(' + ')}
            <span className="ml-1">· {current.duration}m</span>
          </p>
          {/* Called notice */}
          {called && (
            <p className="text-[10px] text-sky-400 font-medium">
              {t('label_called_at')} · {t('call_countdown_noshow').replace('{timer}', fmtCountdown(countdown))}
            </p>
          )}
        </div>
      )}

      {/* Next customer preview */}
      {!barber.onBreak && next && !current && (
        <div className="bg-charcoal/50 rounded-xl p-2.5 flex items-center gap-2">
          <span className="font-mono text-xs text-gold-muted font-bold">{next.token}</span>
          <span className="text-xs text-gold-muted">{next.name}</span>
        </div>
      )}

      {/* Empty / no customer */}
      {!current && !barber.onBreak && !next && (
        <p className="text-xs text-gold-muted/50 italic text-center py-1">{t('barber_no_next')}</p>
      )}
    </div>
  );
}

// ─── Waiting List Row ───────────────────────────────────────────────────────────
function WaitingRow({ item, barbers, onNoShow, onCancel, t }) {
  const waitMin = getWaitingMinutes(item.createdAt);
  const isLongWait = waitMin >= 60;
  const barberPref = barbers.find((b) => b.id === item.barber);
  const prefLabel = barberPref ? barberPref.name : t('any_barber');
  const isCalledStatus = item.status === QUEUE_STATUS.CALLED;

  // No-show countdown for called row
  const [countdown, setCountdown] = useState(null);
  useEffect(() => {
    if (!isCalledStatus) { setCountdown(null); return; }
    const tick = () => {
      const elapsed = Math.floor((Date.now() - (item.calledAt || Date.now())) / 1000);
      const remaining = 600 - elapsed;
      setCountdown(remaining > 0 ? remaining : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isCalledStatus, item.calledAt]);

  const fmtCountdown = (s) => {
    if (s === null) return '';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className={`py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 ${
      isLongWait ? 'bg-amber-500/5 -mx-4 px-4 rounded-xl' : ''
    }`}>
      {/* Left: token + info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 text-center">
          <span className="font-mono font-bold text-gold text-base block leading-tight">{item.token}</span>
          {isCalledStatus && (
            <span className="text-[9px] font-bold text-sky-400 uppercase tracking-wide">{t('label_called_at')}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-gold-light truncate">{item.name}</span>
            {isLongWait && (
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded whitespace-nowrap">
                {t('long_wait_badge')}
              </span>
            )}
          </div>
          <div className="text-xs text-gold-muted truncate">
            {item.serviceIds?.map((id) => {
              const svc = SERVICES_LIST.find((s) => s.id === id);
              return svc ? (t(svc.key) || svc.name) : id;
            }).join(' + ')}
            {' · '}
            {t('pref_barber').replace('{barber}', prefLabel)}
            {' · '}
            <span className={isLongWait ? 'text-amber-400' : ''}>{waitMin}m</span>
          </div>
          {isCalledStatus && countdown !== null && (
            <div className={`text-[11px] font-mono font-bold mt-0.5 ${countdown < 120 ? 'text-red-400' : 'text-sky-400'}`}>
              ⏱ {fmtCountdown(countdown)} {countdown < 120 ? t('countdown_act_soon') : ''}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isCalledStatus && (
          <button
            type="button"
            onClick={() => onNoShow(item)}
            className="min-h-[44px] px-3 py-1.5 bg-charcoal hover:bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-semibold rounded-lg transition whitespace-nowrap"
          >
            {t('btn_noshow')}
          </button>
        )}
        {item.status === QUEUE_STATUS.WAITING && (
          <>
            <button
              type="button"
              onClick={() => onCancel(item)}
              className="min-h-[44px] px-3 py-1.5 bg-charcoal hover:border-gold text-gold-muted hover:text-gold border border-charcoal-light text-xs font-semibold rounded-lg transition"
            >
              {t('btn_cancel')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
function ReceptionDashboard() {
  const { t } = useTranslation();
  const [queueState, setQueueState] = useState(() => getQueueState());
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'noshow'|'cancel', item }
  const [callFlash, setCallFlash] = useState(null); // token that was just called

  // Reload on queue updates (cross-window + same-window)
  const reload = useCallback(() => setQueueState(getQueueState()), []);
  useEffect(() => {
    window.addEventListener('salon_queue_updated', reload);
    window.addEventListener('storage', reload);
    const id = setInterval(reload, 4000); // 4 s fallback
    return () => {
      window.removeEventListener('salon_queue_updated', reload);
      window.removeEventListener('storage', reload);
      clearInterval(id);
    };
  }, [reload]);

  const { queue, barbers } = queueState;

  // Active list = Waiting + Called (In chair shown only in barber card)
  const activeList = queue.filter(
    (q) => q.status === QUEUE_STATUS.WAITING || q.status === QUEUE_STATUS.CALLED
  );
  const waitingOnly = activeList.filter((q) => q.status === QUEUE_STATUS.WAITING);

  // ── Call next handler ─────────────────────────────────────────────────────────
  const handleCallNext = (barberId) => {
    const result = callNextForBarber(barberId);
    if (result) {
      setCallFlash(result.token);
      setTimeout(() => setCallFlash(null), 3000);
    }
    reload();
  };

  // ── No-show / Cancel confirm handlers ─────────────────────────────────────────
  const handleNoShowConfirm = () => {
    if (!confirmAction) return;
    markNoShow(confirmAction.item.token);
    setConfirmAction(null);
    reload();
  };
  const handleCancelConfirm = () => {
    if (!confirmAction) return;
    cancelCustomerSpot(confirmAction.item.token);
    setConfirmAction(null);
    reload();
  };

  // ── Summary counts ────────────────────────────────────────────────────────────
  const waitingCount = waitingOnly.length;
  const inChairCount = queue.filter((q) => q.status === QUEUE_STATUS.IN_CHAIR).length;

  return (
    <div className="min-h-screen bg-charcoal-dark flex flex-col">
      <Header title={t('reception_title')} showBack backTo="/" />

      {/* Call flash banner */}
      {callFlash && (
        <div className="fixed top-16 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
          <div className="bg-gold text-charcoal-dark font-bold text-sm px-6 py-3 rounded-2xl shadow-xl animate-pulse">
            {t('call_flash_notice', { token: callFlash })}
          </div>
        </div>
      )}

      <main className="flex-1 max-w-screen-xl w-full mx-auto p-3 sm:p-5 space-y-4">

        {/* Top bar: summary + walk-in */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-charcoal-card border border-charcoal-light rounded-2xl p-3 sm:p-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <span className="text-2xl font-bold text-gold font-mono leading-none">{waitingCount}</span>
              <p className="text-[10px] text-gold-muted uppercase tracking-wider mt-0.5">{t('col_waiting_queue')}</p>
            </div>
            <div className="w-px h-8 bg-charcoal-light" />
            <div className="text-center">
              <span className="text-2xl font-bold text-amber-400 font-mono leading-none">{inChairCount}</span>
              <p className="text-[10px] text-gold-muted uppercase tracking-wider mt-0.5">{t('label_in_chair')}</p>
            </div>
            <div className="w-px h-8 bg-charcoal-light" />
            <div className="text-center">
              <span className="text-2xl font-bold text-emerald-400 font-mono leading-none">
                {barbers.filter((b) => b.onDuty !== false && !b.onBreak).length}
              </span>
              <p className="text-[10px] text-gold-muted uppercase tracking-wider mt-0.5">{t('col_barbers')}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowWalkIn(true)}
            className="flex items-center gap-2 min-h-[44px] px-5 py-2 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-sm rounded-xl active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            {t('btn_add_walkin')}
          </button>
        </div>

        {/* 2-column grid: Barbers (5 cols) | Waiting list (7 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

          {/* ── Left: Barber cards ─────────────────────────────────────────────── */}
          <div className="xl:col-span-7 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-muted px-1">
              {t('col_barbers')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {barbers.map((b) => (
                <BarberCard
                  key={b.id}
                  barber={b}
                  queue={queue}
                  onCallNext={handleCallNext}
                  t={t}
                />
              ))}
            </div>
          </div>

          {/* ── Right: Waiting list ────────────────────────────────────────────── */}
          <div className="xl:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-muted px-1">
              {t('col_waiting_queue')}
              <span className="ml-2 text-gold/70 font-mono normal-case text-[11px]">
                ({activeList.length})
              </span>
            </h3>

            <div className="bg-charcoal-card border border-charcoal-light rounded-2xl p-4 shadow-md">
              {activeList.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <User className="w-10 h-10 text-gold-muted/30 mx-auto" />
                  <p className="text-gold-muted text-sm">{t('waiting_empty')}</p>
                </div>
              ) : (
                <div className="divide-y divide-charcoal-light/60">
                  {activeList.map((item) => (
                    <WaitingRow
                      key={item.id}
                      item={item}
                      barbers={barbers}
                      onNoShow={(i) => setConfirmAction({ type: 'noshow', item: i })}
                      onCancel={(i) => setConfirmAction({ type: 'cancel', item: i })}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* In-chair section (read-only overview) */}
            {queue.filter((q) => q.status === QUEUE_STATUS.IN_CHAIR).length > 0 && (
              <div className="bg-charcoal-card border border-amber-500/20 rounded-2xl p-4 shadow-md">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                  {t('label_in_chair')}
                </h4>
                <div className="divide-y divide-charcoal-light/60">
                  {queue.filter((q) => q.status === QUEUE_STATUS.IN_CHAIR).map((item) => {
                    const assignedBarber = barbers.find((b) => b.id === (item.assignedBarber || item.barber));
                    return (
                      <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-center gap-3">
                        <span className="font-mono font-bold text-gold text-sm">{item.token}</span>
                        <span className="text-sm text-gold-light">{item.name}</span>
                        {assignedBarber && (
                          <span className="text-xs text-amber-400 ml-auto">{assignedBarber.name}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Walk-in modal */}
      {showWalkIn && (
        <WalkInModal
          onClose={() => setShowWalkIn(false)}
          onAdd={() => { reload(); }}
        />
      )}

      {/* Confirm dialog */}
      {confirmAction && (
        <ConfirmDialog
          title={
            confirmAction.type === 'noshow'
              ? t('confirm_noshow_title')
              : t('confirm_cancel_title')
          }
          desc={
            confirmAction.type === 'noshow'
              ? t('confirm_noshow_desc')
                  .replace('{name}', confirmAction.item.name)
                  .replace('{token}', confirmAction.item.token)
              : t('confirm_cancel_desc')
                  .replace('{name}', confirmAction.item.name)
                  .replace('{token}', confirmAction.item.token)
          }
          onConfirm={confirmAction.type === 'noshow' ? handleNoShowConfirm : handleCancelConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

// ─── Export: PIN Gate wrapping Dashboard ───────────────────────────────────────
export default function ReceptionScreen() {
  const [authed, setAuthed] = useState(false);
  if (!authed) return <PinGate onAuth={() => setAuthed(true)} />;
  return <ReceptionDashboard />;
}
