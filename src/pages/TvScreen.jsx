import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import { useTranslation } from '../i18n/LanguageContext';
import { QUEUE_STATUS, getQueueState, getSpotQueuePosition } from '../rules/queueRules';
import { BellRing, Scissors, Sparkles } from 'lucide-react';

function playCallChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    [740, 988].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.16;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.3);
    });
    window.setTimeout(() => context.close(), 800);
  } catch {
    // The visual call alert still works when browser audio is blocked.
  }
}

export default function TvScreen() {
  const { t } = useTranslation();
  const [queueState, setQueueState] = useState(() => getQueueState());
  const [calledFlash, setCalledFlash] = useState(null);
  const calledTokensRef = useRef(new Set(
    queueState.queue.filter((item) => item.status === QUEUE_STATUS.CALLED).map((item) => item.token)
  ));
  const flashTimeoutRef = useRef(null);

  useEffect(() => {
    const refresh = () => {
      const nextState = getQueueState();
      const calledSpots = nextState.queue.filter((item) => item.status === QUEUE_STATUS.CALLED);
      const newlyCalled = calledSpots.find((item) => !calledTokensRef.current.has(item.token));
      calledTokensRef.current = new Set(calledSpots.map((item) => item.token));
      setQueueState(nextState);

      if (newlyCalled) {
        setCalledFlash(newlyCalled.token);
        playCallChime();
        window.clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = window.setTimeout(() => setCalledFlash(null), 5000);
      }
    };

    window.addEventListener('salon_queue_updated', refresh);
    window.addEventListener('storage', refresh);
    const intervalId = window.setInterval(refresh, 3000);
    return () => {
      window.removeEventListener('salon_queue_updated', refresh);
      window.removeEventListener('storage', refresh);
      window.clearInterval(intervalId);
      window.clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  const activeBarbers = queueState.barbers;
  const currentByBarber = activeBarbers.map((barber) => ({
    barber,
    spot: queueState.queue.find((item) =>
      item.status === QUEUE_STATUS.IN_CHAIR &&
      (item.assignedBarber === barber.id || item.barber === barber.id)
    ),
  }));
  const waiting = queueState.queue
    .filter((item) => item.status === QUEUE_STATUS.WAITING)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(0, 5)
    .map((item) => ({ ...item, wait: getSpotQueuePosition(item.token).estimatedWaitMin }));

  return (
    <div className="min-h-screen bg-charcoal-dark text-gold-light flex flex-col select-none overflow-hidden">
      <Header title={t('tv_view_title')} showBack={false} />
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-5 sm:p-8 lg:p-10 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-charcoal-light pb-4">
          <div className="flex items-center gap-3 text-gold">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-[0.14em]">{t('tv_now_serving')}</h1>
          </div>
          <div className="text-xs sm:text-sm text-gold-muted flex items-center gap-2">
            <Scissors className="w-4 h-4" /> {t('salon_name')}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
          <section className="xl:col-span-7 flex flex-col gap-4">
            {currentByBarber.map(({ barber, spot }) => (
              <article
                key={barber.id}
                className={`flex-1 min-h-[130px] rounded-3xl border p-5 sm:p-7 flex items-center justify-between gap-4 shadow-xl transition-colors ${
                  calledFlash && spot?.token === calledFlash
                    ? 'bg-gold/20 border-gold animate-pulse'
                    : 'bg-charcoal-card border-charcoal-light'
                }`}
              >
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-gold/15 border-2 border-gold/30 flex items-center justify-center text-gold font-black text-2xl sm:text-4xl">
                    {barber.name[0]}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gold-light truncate">{barber.name}</h2>
                    {spot ? (
                      <p className="text-sm sm:text-lg text-gold-muted mt-1 truncate">{t('tv_with_customer', { name: spot.name })}</p>
                    ) : (
                      <p className={`text-sm sm:text-lg mt-1 ${barber.onBreak ? 'text-amber-300' : 'text-emerald-300'}`}>
                        {barber.onBreak ? t('label_on_break') : t('tv_free')}
                      </p>
                    )}
                  </div>
                </div>
                {spot ? (
                  <div className={`font-mono text-4xl sm:text-6xl lg:text-7xl font-black shrink-0 ${calledFlash === spot.token ? 'text-gold' : 'text-gold-light'}`}>
                    {t('tv_now_token', { token: spot.token })}
                  </div>
                ) : (
                  <div className={`text-xl sm:text-2xl font-bold uppercase tracking-wider ${barber.onBreak ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {barber.onBreak ? t('label_on_break') : t('tv_free')}
                  </div>
                )}
              </article>
            ))}
          </section>

          <section className="xl:col-span-5 bg-charcoal-card border border-charcoal-light rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col min-h-[320px]">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-light">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-gold-muted">{t('tv_up_next')}</h2>
              <span className="text-xs sm:text-sm text-gold-muted">{t('approx_wait_time')}</span>
            </div>
            {waiting.length ? (
              <div className="divide-y divide-charcoal-light mt-2 flex-1">
                {waiting.map((item, index) => (
                  <div key={item.token} className="py-4 sm:py-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-sm font-bold text-gold-muted w-6 shrink-0">#{index + 1}</span>
                      <div className="min-w-0">
                        <span className="font-mono text-2xl sm:text-3xl font-black text-gold-light">{item.token}</span>
                        <span className="ml-3 text-sm sm:text-base text-gold-muted truncate">{item.name}</span>
                      </div>
                    </div>
                    <span className="text-sm sm:text-lg font-bold text-gold whitespace-nowrap">~{item.wait} {t('min')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gold-muted text-lg">{t('tv_no_waiting')}</div>
            )}
          </section>
        </div>

        {calledFlash && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gold text-charcoal-dark font-black text-lg sm:text-2xl px-6 sm:px-10 py-4 rounded-2xl shadow-2xl animate-pulse flex items-center gap-3">
            <BellRing className="w-6 h-6" /> {t('tv_chime_alert', { token: calledFlash })}
          </div>
        )}
      </main>
    </div>
  );
}
