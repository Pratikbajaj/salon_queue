import React, { useState } from 'react';
import Header from '../components/Header';
import { useTranslation } from '../i18n/LanguageContext';
import { Sparkles, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function JoinScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState(['s1']);
  const [selectedBarber, setSelectedBarber] = useState('any');

  // Sample dummy services
  const services = [
    { id: 's1', name: 'Haircut', duration: 30, price: 150 },
    { id: 's2', name: 'Beard trim', duration: 15, price: 80 },
    { id: 's3', name: 'Hair spa', duration: 45, price: 400 },
    { id: 's4', name: 'Shave', duration: 15, price: 60 },
    { id: 's5', name: 'Head massage', duration: 20, price: 120 },
  ];

  const barbers = [
    { id: 'any', name: t('any_barber'), onBreak: false },
    { id: 'ravi', name: 'Ravi', onBreak: false },
    { id: 'amit', name: 'Amit', onBreak: false },
    { id: 'imran', name: 'Imran', onBreak: true },
  ];

  const handleToggleService = (id) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((s) => s !== id));
    } else {
      if (selectedServices.length >= 3) {
        alert(t('max_services_error'));
        return;
      }
      setSelectedServices([...selectedServices, id]);
    }
  };

  const totalMin = selectedServices.reduce((acc, id) => {
    const s = services.find((item) => item.id === id);
    return acc + (s ? s.duration : 0);
  }, 0);

  const totalPrice = selectedServices.reduce((acc, id) => {
    const s = services.find((item) => item.id === id);
    return acc + (s ? s.price : 0);
  }, 0);

  const expectedWait = totalMin > 0 ? 35 : 0;

  const handleConfirm = (e) => {
    e.preventDefault();
    navigate('/status/S-14');
  };

  return (
    <div className="min-h-screen bg-charcoal-dark flex flex-col">
      <Header title={t('join_title')} showBack={true} backTo="/" />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 pb-28 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gold-light">{t('join_title')}</h2>
          <span className="text-xs text-gold-muted font-mono">Screen 2 · Phone</span>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gold-muted mb-1.5">
              {t('field_name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('field_name_placeholder')}
              className="w-full min-h-[44px] px-4 py-2.5 bg-charcoal border border-charcoal-light rounded-xl text-gold-light placeholder-gold-muted/60 focus:outline-none focus:border-gold transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gold-muted mb-1.5">
              {t('field_phone')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('field_phone_placeholder')}
              maxLength={10}
              className="w-full min-h-[44px] px-4 py-2.5 bg-charcoal border border-charcoal-light rounded-xl text-gold-light placeholder-gold-muted/60 focus:outline-none focus:border-gold transition font-mono"
            />
          </div>
        </div>

        {/* Services Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gold-muted">
              {t('select_services')}
            </label>
            <span className="text-xs text-gold font-semibold">
              {selectedServices.length}/3 selected
            </span>
          </div>

          <div className="space-y-2">
            {services.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <button
                  type="button"
                  key={service.id}
                  onClick={() => handleToggleService(service.id)}
                  className={`w-full min-h-[44px] p-3 rounded-xl border text-left flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-gold/15 border-gold text-gold-light font-semibold shadow-sm'
                      : 'bg-charcoal-card border-charcoal-light text-gold-light hover:border-gold/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-gold border-gold text-charcoal-dark'
                          : 'border-charcoal-light'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-sm font-semibold text-gold-light">{service.name}</span>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-gold-muted mr-2">{service.duration} {t('min')}</span>
                    <span className="text-gold font-bold">₹{service.price}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Barber Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gold-muted mb-2">
            {t('select_barber')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {barbers.map((b) => {
              const isSelected = selectedBarber === b.id;
              return (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setSelectedBarber(b.id)}
                  className={`min-h-[44px] p-3 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-gold/15 border-gold text-gold-light font-semibold shadow-sm'
                      : 'bg-charcoal-card border-charcoal-light text-gold-light hover:border-gold/50'
                  }`}
                >
                  <div className="text-sm font-semibold">{b.name}</div>
                  {b.onBreak && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{t('status_break')}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Floating Bottom Summary Bar & Confirm */}
      <footer className="fixed bottom-0 left-0 right-0 bg-charcoal-card/95 border-t border-charcoal-light p-4 backdrop-blur-md">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-gold-light px-1">
            <span>
              {t('live_summary_bar', {
                duration: totalMin,
                price: totalPrice,
                wait: expectedWait,
              })}
            </span>
          </div>
          <button
            onClick={handleConfirm}
            type="button"
            className="w-full min-h-[48px] px-5 py-3 bg-gold hover:bg-gold-dark text-charcoal-dark font-bold text-sm rounded-xl shadow-lg active:scale-[0.99] transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('btn_confirm')}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
