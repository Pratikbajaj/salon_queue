import React, { useState } from 'react';
import Header from '../components/Header';
import { useTranslation } from '../i18n/LanguageContext';
import { STAFF_PIN } from '../rules/queueRules';
import { Settings, Users, Scissors, ToggleLeft, ToggleRight, Check, Lock, BarChart3 } from 'lucide-react';

export default function AdminScreen() {
  const { t, language } = useTranslation();
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Demo admin settings state
  const [onlineQueueOpen, setOnlineQueueOpen] = useState(true);
  const [barbersOnDuty, setBarbersOnDuty] = useState({
    Ravi: true,
    Amit: true,
    Imran: true,
  });

  const [services, setServices] = useState([
    { id: '1', nameEn: 'Haircut', nameHi: 'हेयरकट', min: 30, price: 150, active: true },
    { id: '2', nameEn: 'Beard trim', nameHi: 'दाढ़ी ट्रिम', min: 15, price: 80, active: true },
    { id: '3', nameEn: 'Hair spa', nameHi: 'हेयर स्पा', min: 45, price: 400, active: true },
    { id: '4', nameEn: 'Shave', nameHi: 'शेव', min: 15, price: 60, active: true },
    { id: '5', nameEn: 'Head massage', nameHi: 'हेड मसाज', min: 20, price: 120, active: true },
  ]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === STAFF_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const toggleBarber = (bName) => {
    setBarbersOnDuty(prev => ({ ...prev, [bName]: !prev[bName] }));
  };

  const toggleService = (id) => {
    setServices(prev =>
      prev.map(s => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-charcoal-dark flex flex-col">
        <Header title={t('admin_title')} showBack={true} backTo="/" />
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
      <Header title={t('admin_title')} showBack={true} backTo="/" />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gold-light">{t('admin_title')}</h2>
            <p className="text-xs text-gold-muted">Configure salon operations, services, and view metrics</p>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-gold/10 text-gold border border-gold/30 rounded-md">
            Screen 7 · Tablet/Desktop
          </span>
        </div>

        {/* Stats Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold-muted flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gold" />
            {t('admin_stats_title')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-charcoal-card border border-charcoal-light rounded-2xl p-4 shadow">
              <span className="text-xs text-gold-muted">{t('stat_customers_served')}</span>
              <div className="text-2xl font-black text-gold-light mt-1">28</div>
            </div>
            <div className="bg-charcoal-card border border-charcoal-light rounded-2xl p-4 shadow">
              <span className="text-xs text-gold-muted">{t('stat_avg_wait')}</span>
              <div className="text-2xl font-black text-gold mt-1">22 min</div>
            </div>
            <div className="bg-charcoal-card border border-charcoal-light rounded-2xl p-4 shadow">
              <span className="text-xs text-gold-muted">{t('stat_no_shows')}</span>
              <div className="text-2xl font-black text-amber-400 mt-1">2</div>
            </div>
            <div className="bg-charcoal-card border border-charcoal-light rounded-2xl p-4 shadow">
              <span className="text-xs text-gold-muted">{t('stat_cancellations')}</span>
              <div className="text-2xl font-black text-red-400 mt-1">1</div>
            </div>
          </div>
        </div>

        {/* Online Queue Control */}
        <div className="bg-charcoal-card border border-charcoal-light rounded-2xl p-5 shadow space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gold-light">{t('admin_queue_control')}</h3>
              <p className="text-xs text-gold-muted">{t('admin_online_joining')}</p>
            </div>
            <button
              type="button"
              onClick={() => setOnlineQueueOpen(!onlineQueueOpen)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                onlineQueueOpen
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}
            >
              {onlineQueueOpen ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-red-400" />}
              <span>{onlineQueueOpen ? 'Online Queue: OPEN' : 'Online Queue: CLOSED'}</span>
            </button>
          </div>
        </div>

        {/* Barbers on Duty */}
        <div className="bg-charcoal-card border border-charcoal-light rounded-2xl p-5 shadow space-y-3">
          <h3 className="text-sm font-bold text-gold-light flex items-center gap-2">
            <Users className="w-4 h-4 text-gold" />
            {t('admin_barbers_duty')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.keys(barbersOnDuty).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => toggleBarber(b)}
                className={`min-h-[44px] p-3 rounded-xl border flex items-center justify-between transition ${
                  barbersOnDuty[b]
                    ? 'bg-gold/15 border-gold text-gold-light font-semibold'
                    : 'bg-charcoal border-charcoal-light text-gold-muted'
                }`}
              >
                <span className="font-semibold text-sm">{b}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  barbersOnDuty[b] ? 'bg-emerald-500/10 text-emerald-400' : 'bg-charcoal text-gold-muted'
                }`}>
                  {barbersOnDuty[b] ? 'On Duty' : 'Off'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Services Management */}
        <div className="bg-charcoal-card border border-charcoal-light rounded-2xl p-5 shadow space-y-3">
          <h3 className="text-sm font-bold text-gold-light flex items-center gap-2">
            <Scissors className="w-4 h-4 text-gold" />
            {t('admin_services_mgmt')}
          </h3>
          <div className="divide-y divide-charcoal-light">
            {services.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-gold-light">
                    {language === 'hi' ? s.nameHi : s.nameEn}
                    <span className="text-xs text-gold-muted ml-2">({s.nameEn} / {s.nameHi})</span>
                  </div>
                  <div className="text-xs text-gold-muted">
                    {s.min} {t('min')} · ₹{s.price}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                    s.active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-charcoal text-gold-muted border-charcoal-light'
                  }`}
                >
                  {s.active ? 'Active' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
