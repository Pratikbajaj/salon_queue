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
} from 'lucide-react';
import {
  getSpotQueuePosition,
  cancelCustomerSpot,
  QUEUE_STATUS,
} from '../rules/queueRules';

export default function StatusScreen() {
  const { id } = useParams();
  const token = (id || 'S-14').toUpperCase();
  const { t } = useTranslation();

  const [spotInfo, setSpotInfo] = useState(() => getSpotQueuePosition(token));
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Sync with queue updates across windows/tabs
  useEffect(() => {
    const handleUpdate = () => {
      setSpotInfo(getSpotQueuePosition(token));
    };

    window.addEventListener('salon_queue_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('salon_queue_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [token]);

  const {
    position,
    estimatedWaitMin,
    status,
    assignedBarber,
    barberOnBreak,
  } = spotInfo;

  // Handle spot cancellation
  const handleConfirmCancel = () => {
    cancelCustomerSpot(token);
    setSpotInfo(getSpotQueuePosition(token));
    setShowCancelModal(false);
  };

  return (
    <div className="min-h-screen bg-charcoal-dark flex flex-col">
      <Header title={t('status_screen_title')} showBack={true} backTo="/" />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gold-light">{t('status_screen_title')}</h2>
          <span className="text-xs text-gold-muted font-mono">Screen 3 · Phone</span>
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
                className="w-full min-h-[48px] px-5 py-3 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
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
                className="w-full min-h-[48px] px-5 py-3 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
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
                className="w-full min-h-[48px] px-5 py-3 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('btn_join_again')}</span>
              </Link>
            </div>
          </div>
        )}

        {/* ================= ACTIVE STATE: WAITING OR CALLED ================= */}
        {(status === QUEUE_STATUS.WAITING || status === QUEUE_STATUS.CALLED || status === QUEUE_STATUS.IN_CHAIR) && (
          <>
            {/* 2nd in line Alert Banner */}
            {position === 2 && status === QUEUE_STATUS.WAITING && (
              <div className="bg-gold/10 border border-gold/40 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                <UserCheck className="w-6 h-6 text-gold shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gold">{t('banner_start_coming')}</p>
                  <p className="text-xs text-gold-light">You are next after the current customer.</p>
                </div>
              </div>
            )}

            {/* When Called: Alert card */}
            {status === QUEUE_STATUS.CALLED && (
              <div className="bg-gold text-charcoal-dark p-6 rounded-3xl shadow-2xl text-center space-y-2 animate-bounce">
                <h3 className="text-2xl font-black">{t('turn_alert_title')}</h3>
                <p className="text-base font-semibold">{t('turn_alert_desc', { barber: assignedBarber })}</p>
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

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-charcoal border border-charcoal-light text-sm font-semibold text-gold-light">
                <span>{position}</span>
                <span>{t('position_suffix')}</span>
              </div>

              {/* Circular/Countdown representation */}
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
                  <span className="text-emerald-400 font-semibold">Currently In Chair with {assignedBarber}</span>
                ) : (
                  <span>Refreshes automatically as customers move forward</span>
                )}
              </div>
            </div>

            {/* Actions: Cancel my spot */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setShowCancelModal(true)}
                type="button"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 active:scale-[0.99] transition text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>{t('btn_cancel_spot')}</span>
              </button>
            </div>
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
      </main>
    </div>
  );
}
