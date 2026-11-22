import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Clock,
  UserCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import {
  getSpotQueuePosition,
  cancelCustomerSpot,
  updateSpotStatus,
  formatOrdinal,
  QUEUE_STATUS,
  getActiveSpotToken,
  clearActiveSpotToken,
} from '../rules/queueRules';

export default function StatusScreen() {
  const { id } = useParams();
  const token = (id || getActiveSpotToken() || '').toUpperCase();
  const { t, language } = useTranslation();

  const [spotInfo, setSpotInfo] = useState(() => getSpotQueuePosition(token));
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDevControls, setShowDevControls] = useState(false);
  const [simulatedState, setSimulatedState] = useState(null);

  // Sync with queue updates across windows/tabs + auto-refresh countdown
  useEffect(() => {
    const handleUpdate = () => {
      const nextInfo = getSpotQueuePosition(token);
      if (!nextInfo.spot || [QUEUE_STATUS.CANCELLED, QUEUE_STATUS.DONE, QUEUE_STATUS.NO_SHOW].includes(nextInfo.status)) {
        clearActiveSpotToken(token);
      }
      setSpotInfo(nextInfo);
    };

    handleUpdate();
    window.addEventListener('salon_queue_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Auto-refresh interval (every 4 seconds)
    const interval = setInterval(handleUpdate, 4000);

    return () => {
      window.removeEventListener('salon_queue_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, [token]);

  // Merge live spot info with any active simulation state
  const effectiveInfo = simulatedState ? { ...spotInfo, ...simulatedState } : spotInfo;

  const {
    position,
    estimatedWaitMin,
    status,
    assignedBarber,
    barberOnBreak,
  } = effectiveInfo;

  // Trigger phone vibration when Called
  useEffect(() => {
    if (status === QUEUE_STATUS.CALLED) {
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([300, 150, 300, 150, 400]);
        } catch (e) {
          // Vibration not supported or allowed
        }
      }
    }
  }, [status]);

  // Handle spot cancellation
  const handleConfirmCancel = () => {
    cancelCustomerSpot(token);
    clearActiveSpotToken(token);
    setSimulatedState(null);
    setSpotInfo(getSpotQueuePosition(token));
    setShowCancelModal(false);
  };

  // Simulation state helpers for manual test verification
  const handleSimulate = (stateOverrides) => {
    setSimulatedState(stateOverrides);
    if (stateOverrides && stateOverrides.status) {
      updateSpotStatus(token, stateOverrides.status, stateOverrides.assignedBarber || assignedBarber);
    }
  };

  if (!spotInfo?.spot) {
    return (
      <div className="min-h-screen bg-charcoal-dark flex flex-col">
        <Header title={t('status_screen_title')} showBack={true} backTo="/" />
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 flex items-center">
          <section className="w-full bg-charcoal-card border border-charcoal-light rounded-3xl p-6 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 text-gold flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gold-light">
              {token ? t('status_spot_not_found') : t('status_no_active_spot')}
            </h2>
            <Link
              to="/join"
              className="w-full min-h-[48px] px-5 py-3 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center cursor-pointer"
            >
              {t('home_join_button')}
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-dark flex flex-col">
      <Header title={t('status_screen_title')} showBack={true} backTo="/" />

      {/* ================= FULL-SCREEN GOLD "IT'S YOUR TURN" STATE ================= */}
      {status === QUEUE_STATUS.CALLED && (
        <div className="fixed inset-0 z-50 bg-gold text-charcoal-dark flex flex-col items-center justify-between p-6 sm:p-10 animate-pulse select-none">
          {/* Header */}
          <div className="w-full flex justify-between items-center text-charcoal-dark font-bold text-xs uppercase tracking-wider">
            <span>{t('salon_name')}</span>
            <span className="bg-charcoal-dark/15 px-3 py-1 rounded-full font-mono text-sm">
              {token}
            </span>
          </div>

          {/* Central Callout */}
          <div className="text-center space-y-6 my-auto max-w-sm">
            <div className="w-24 h-24 rounded-full bg-charcoal-dark/10 border-4 border-charcoal-dark/20 flex items-center justify-center mx-auto text-charcoal-dark shadow-2xl">
              <Sparkles className="w-12 h-12" />
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                {t('turn_alert_title')}
              </h1>
              <p className="text-xl sm:text-2xl font-extrabold text-charcoal-dark/95">
                {t('turn_alert_desc', { barber: assignedBarber || 'Ravi' })}
              </p>
            </div>

            <div className="p-4 bg-charcoal-dark/10 rounded-2xl text-sm font-semibold">
              <p>{t('turn_alert_instruction')}</p>
              <p className="text-xs text-charcoal-dark/70 mt-1">{t('turn_alert_ready')}</p>
            </div>
          </div>

          {/* Bottom Acknowledgment & Test Buttons */}
          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={() => handleSimulate({ status: QUEUE_STATUS.IN_CHAIR, position: 0 })}
              className="w-full min-h-[48px] px-6 py-3 bg-charcoal-dark text-gold font-bold text-sm rounded-xl hover:bg-charcoal transition shadow-xl cursor-pointer"
            >
              {t('status_here_button')}
            </button>
            <button
              onClick={() => handleSimulate(null)}
              className="w-full text-xs text-charcoal-dark/70 underline py-1 hover:text-charcoal-dark cursor-pointer"
            >
              {t('status_overview_button')}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 pb-28 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gold-light">{t('status_screen_title')}</h2>
        </div>

        {/* ================= FINAL STATE: CANCELLED ================= */}
        {status === QUEUE_STATUS.CANCELLED && (
          <div className="bg-charcoal-card border border-charcoal-light rounded-3xl p-6 shadow-xl text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-muted block mb-1">
                {t('your_token')}
              </span>
              <div className="text-4xl font-black tracking-tight text-gold-muted line-through font-mono">
                {token}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-red-400">
                {t('state_cancelled_title')}
              </h3>
              <p className="text-xs text-gold-muted">
                {t('state_cancelled_desc')}
              </p>
            </div>

            <div className="pt-3 border-t border-charcoal-light">
              <Link
                to="/join"
                className="w-full min-h-[48px] px-5 py-3 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('btn_join_again')}</span>
              </Link>
            </div>
          </div>
        )}

        {/* ================= FINAL STATE: DONE ================= */}
        {status === QUEUE_STATUS.DONE && (
          <div className="bg-charcoal-card border border-charcoal-light rounded-3xl p-6 shadow-xl text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-muted block mb-1">
                {t('your_token')}
              </span>
              <div className="text-4xl font-black tracking-tight text-emerald-400 font-mono">
                {token}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-emerald-400">
                {t('state_done_title')}
              </h3>
              <p className="text-xs text-gold-muted">
                {t('state_done_desc')}
              </p>
            </div>

            <div className="pt-3 border-t border-charcoal-light">
              <Link
                to="/join"
                className="w-full min-h-[48px] px-5 py-3 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('btn_join_again')}</span>
              </Link>
            </div>
          </div>
        )}

        {/* ================= FINAL STATE: NO-SHOW ================= */}
        {status === QUEUE_STATUS.NO_SHOW && (
          <div className="bg-charcoal-card border border-charcoal-light rounded-3xl p-6 shadow-xl text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-muted block mb-1">
                {t('your_token')}
              </span>
              <div className="text-4xl font-black tracking-tight text-amber-400 font-mono">
                {token}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-amber-400">
                {t('state_noshow_title')}
              </h3>
              <p className="text-xs text-gold-muted">
                {t('state_noshow_desc')}
              </p>
            </div>

            <div className="pt-3 border-t border-charcoal-light">
              <Link
                to="/join"
                className="w-full min-h-[48px] px-5 py-3 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('btn_join_again')}</span>
              </Link>
            </div>
          </div>
        )}

        {/* ================= ACTIVE STATE: WAITING OR IN CHAIR ================= */}
        {(status === QUEUE_STATUS.WAITING || status === QUEUE_STATUS.IN_CHAIR) && (
          <>
            {/* 2nd in line Alert Banner */}
            {position === 2 && status === QUEUE_STATUS.WAITING && (
              <div className="bg-gold/15 border-2 border-gold p-4 rounded-2xl flex items-center gap-3.5 shadow-lg animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gold text-charcoal-dark flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-gold">{t('banner_start_coming')}</p>
                  <p className="text-xs text-gold-light">{t('start_coming_desc')}</p>
                </div>
              </div>
            )}

            {/* Barber On Break Notice */}
            {barberOnBreak && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t('barber_on_break_alert', { barber: assignedBarber })}</span>
              </div>
            )}

            {/* Main Token & Position Card */}
            <div className="bg-charcoal-card border border-charcoal-light rounded-3xl p-6 shadow-xl text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-muted">
                {t('your_token')}
              </span>
              <div className="text-5xl font-black tracking-tight text-gold font-mono">
                {token}
              </div>

              {/* Position Pill with Ordinal Suffix */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-charcoal border border-charcoal-light text-sm font-semibold text-gold-light">
                <span>{formatOrdinal(position, language)}</span>
                <span>{t('position_suffix')}</span>
              </div>

              {/* Circular Countdown representation */}
              <div className="py-4 flex flex-col items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-gold/20 border-t-gold flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gold-light">{estimatedWaitMin}</span>
                  <span className="text-xs text-gold-muted uppercase tracking-wider">{t('min')}</span>
                </div>
                <span className="text-xs text-gold-muted mt-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  {t('approx_wait_time')}
                </span>
              </div>

              <div className="text-xs text-gold-muted pt-2 border-t border-charcoal-light">
                {status === QUEUE_STATUS.IN_CHAIR ? (
                  <span className="text-emerald-400 font-semibold">
                    {t('status_in_chair_with', { barber: assignedBarber })}
                  </span>
                ) : (
                  <span>{t('status_auto_refresh')}</span>
                )}
              </div>
            </div>

            {/* Actions: Cancel my spot */}
            {status === QUEUE_STATUS.WAITING && <div className="space-y-3 pt-2">
              <button
                onClick={() => setShowCancelModal(true)}
                type="button"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 active:scale-[0.99] transition text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>{t('btn_cancel_spot')}</span>
              </button>
            </div>}
          </>
        )}

        {/* Confirmation Modal for Cancel */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-charcoal-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-charcoal-card border border-charcoal-light rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gold-light">{t('modal_cancel_title')}</h3>
                <p className="text-xs text-gold-muted mt-1">{t('modal_cancel_desc')}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-charcoal border border-charcoal-light text-gold-light font-medium text-xs hover:border-gold transition cursor-pointer"
                >
                  {t('modal_keep_spot')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  {t('modal_confirm_cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Testing Toolbar (For manual verification) */}
        <div className="pt-4 border-t border-charcoal-light/50">
          <button
            onClick={() => setShowDevControls(!showDevControls)}
            className="flex items-center gap-1.5 text-[11px] text-gold-muted hover:text-gold transition mx-auto cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showDevControls ? t('status_test_toggle_hide') : t('status_test_toggle_show')}</span>
          </button>

          {showDevControls && (
            <div className="mt-3 p-3 bg-charcoal-card border border-charcoal-light rounded-2xl space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-gold-muted block">
                {t('status_test_trigger_label')}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleSimulate({ status: QUEUE_STATUS.WAITING, position: 6, estimatedWaitMin: 50 })}
                  className="p-2 bg-charcoal border border-charcoal-light rounded-lg hover:border-gold text-gold-light text-left"
                >
                  {t('status_test_sixth')}
                </button>
                <button
                  onClick={() => handleSimulate({ status: QUEUE_STATUS.WAITING, position: 2, estimatedWaitMin: 15 })}
                  className="p-2 bg-charcoal border border-charcoal-light rounded-lg hover:border-gold text-gold-light text-left"
                >
                  {t('status_test_second')}
                </button>
                <button
                  onClick={() => handleSimulate({ status: QUEUE_STATUS.CALLED, position: 1, estimatedWaitMin: 0, assignedBarber: 'Amit' })}
                  className="p-2 bg-charcoal border border-charcoal-light rounded-lg hover:border-gold text-gold font-bold text-left"
                >
                  {t('status_test_called')}
                </button>
                <button
                  onClick={() => handleSimulate({ status: QUEUE_STATUS.IN_CHAIR, position: 0, estimatedWaitMin: 0 })}
                  className="p-2 bg-charcoal border border-charcoal-light rounded-lg hover:border-gold text-emerald-400 text-left"
                >
                  {t('status_test_chair')}
                </button>
                <button
                  onClick={() => handleSimulate({ status: QUEUE_STATUS.DONE })}
                  className="p-2 bg-charcoal border border-charcoal-light rounded-lg hover:border-gold text-emerald-400 text-left"
                >
                  {t('status_test_done')}
                </button>
                <button
                  onClick={() => handleSimulate({ status: QUEUE_STATUS.CANCELLED })}
                  className="p-2 bg-charcoal border border-charcoal-light rounded-lg hover:border-gold text-red-400 text-left"
                >
                  {t('status_test_cancelled')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
