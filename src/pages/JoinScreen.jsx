import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import { useTranslation } from '../i18n/LanguageContext';
import { Sparkles, Check, AlertCircle, AlertTriangle, ArrowRight, User, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getQueueState,
  calculateWaitTime,
  validatePhone,
  findActiveSpotByPhone,
  addCustomerToQueue,
  getActiveBarbersCount,
} from '../rules/queueRules';

export default function JoinScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [queueState] = useState(() => getQueueState());
  const { services, barbers, isOnlineQueueOpen } = queueState;

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState(['s1']); // default Haircut selected
  const [selectedBarberId, setSelectedBarberId] = useState('any');

  // Validation & UI State
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [formError, setFormError] = useState('');
  const [serviceLimitWarning, setServiceLimitWarning] = useState('');
  const [activeSpotNotice, setActiveSpotNotice] = useState('');

  // Inline Phone Validation
  const isPhoneValid = useMemo(() => validatePhone(phone), [phone]);
  const phoneError = useMemo(() => {
    if (!phoneTouched && !phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 0) return t('err_invalid_phone');
    if (digits.length < 10) return t('err_phone_digits');
    if (digits.length > 10) return t('err_invalid_phone');
    return '';
  }, [phone, phoneTouched, t]);

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    if (!phoneTouched) setPhoneTouched(true);
    setFormError('');
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (!nameTouched) setNameTouched(true);
    setFormError('');
  };

  // Toggle Services with strict 3-service limit
  const handleToggleService = (serviceId) => {
    setFormError('');
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
      setServiceLimitWarning('');
    } else {
      if (selectedServiceIds.length >= 3) {
        setServiceLimitWarning(t('max_services_error'));
        return;
      }
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
      setServiceLimitWarning('');
    }
  };

  // Selected Services calculations
  const selectedServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.includes(s.id));
  }, [services, selectedServiceIds]);

  const totalDuration = useMemo(() => {
    return selectedServices.reduce((acc, s) => acc + s.duration, 0);
  }, [selectedServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((acc, s) => acc + s.price, 0);
  }, [selectedServices]);

  // Dynamic Expected Wait Time calculation
  const expectedWait = useMemo(() => {
    if (selectedServices.length === 0) return 0;
    const waitingAhead = queueState.queue.filter((q) => q.status === 'Waiting');
    const totalMinutesAhead = waitingAhead.reduce((acc, c) => acc + (c.duration || 30), 0);
    const activeBarbers = getActiveBarbersCount(barbers);
    const calculated = calculateWaitTime(totalMinutesAhead, activeBarbers);

    // If customer picks a barber currently on break, add estimated extra wait
    const chosenBarber = barbers.find((b) => b.id === selectedBarberId);
    if (chosenBarber && chosenBarber.onBreak) {
      return calculated + 20;
    }
    return calculated;
  }, [selectedServices, queueState.queue, barbers, selectedBarberId]);

  const selectedBarberObj = barbers.find((b) => b.id === selectedBarberId);

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setServiceLimitWarning('');
    setActiveSpotNotice('');

    if (!isOnlineQueueOpen) {
      setFormError(t('err_queue_closed'));
      return;
    }

    if (!name.trim()) {
      setNameTouched(true);
      setFormError(t('err_name_required'));
      return;
    }

    if (!isPhoneValid) {
      setPhoneTouched(true);
      setFormError(t('err_invalid_phone'));
      return;
    }

    if (selectedServiceIds.length === 0) {
      setFormError(t('err_no_service'));
      return;
    }

    // Check if phone number already has an active spot in queue
    const existingSpot = findActiveSpotByPhone(phone);
    if (existingSpot) {
      setActiveSpotNotice(t('active_spot_redirect', { token: existingSpot.token }));
      setTimeout(() => {
        navigate(`/status/${existingSpot.token}`);
      }, 1200);
      return;
    }

    // Add new customer to queue
    const result = addCustomerToQueue({
      name,
      phone,
      serviceIds: selectedServiceIds,
      barber: selectedBarberId,
    });

    if (result.success) {
      navigate(`/status/${result.spot.token}`);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-dark flex flex-col">
      <Header title={t('join_title')} showBack={true} backTo="/" />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 pb-36 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gold-light">{t('join_title')}</h2>
          <span className="text-xs text-gold-muted font-mono">Screen 2 · Phone</span>
        </div>

        {/* Global Error Banner */}
        {formError && (
          <div className="bg-red-500/10 border border-red-500/40 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Existing Spot Redirect Notice */}
        {activeSpotNotice && (
          <div className="bg-gold/15 border border-gold p-4 rounded-2xl flex items-center gap-3 text-xs text-gold-light font-semibold animate-pulse">
            <Sparkles className="w-5 h-5 text-gold shrink-0" />
            <span>{activeSpotNotice}</span>
          </div>
        )}

        {/* Form Fields: Name & Phone */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gold-muted mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gold" />
              <span>{t('field_name')}</span>
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder={t('field_name_placeholder')}
              className={`w-full min-h-[44px] px-4 py-2.5 bg-charcoal border rounded-xl text-gold-light placeholder-gold-muted/50 focus:outline-none transition ${
                nameTouched && !name.trim()
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-charcoal-light focus:border-gold'
              }`}
            />
            {nameTouched && !name.trim() && (
              <p className="text-[11px] text-red-400 mt-1">{t('err_name_required')}</p>
            )}
          </div>

          {/* Phone (Inline Validation) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gold-muted mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gold" />
              <span>{t('field_phone')}</span>
              <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                onBlur={() => setPhoneTouched(true)}
                placeholder={t('field_phone_placeholder')}
                maxLength={10}
                className={`w-full min-h-[44px] px-4 py-2.5 bg-charcoal border rounded-xl text-gold-light placeholder-gold-muted/50 focus:outline-none transition font-mono ${
                  phoneError
                    ? 'border-red-400 focus:border-red-400'
                    : isPhoneValid
                    ? 'border-emerald-500/50 focus:border-emerald-500'
                    : 'border-charcoal-light focus:border-gold'
                }`}
              />
              {isPhoneValid && (
                <div className="absolute right-3 top-3 text-emerald-400">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </div>
            {phoneError && (
              <p className="text-[11px] text-red-400 mt-1">{phoneError}</p>
            )}
          </div>
        </div>

        {/* Services Selection (Multi-select, Max 3) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gold-muted">
              {t('select_services')}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <span
              className={`text-xs font-semibold ${
                selectedServiceIds.length === 3 ? 'text-amber-400' : 'text-gold'
              }`}
            >
              {selectedServiceIds.length}/3 {t('max_services_hint')}
            </span>
          </div>

          {/* 4th Service Limit Warning */}
          {serviceLimitWarning && (
            <div className="mb-2 p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{serviceLimitWarning}</span>
            </div>
          )}

          <div className="space-y-2">
            {services.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              const displayName = t(service.key) || service.name;

              return (
                <button
                  type="button"
                  key={service.id}
                  onClick={() => handleToggleService(service.id)}
                  className={`w-full min-h-[48px] p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? 'bg-gold/15 border-gold text-gold-light shadow-sm'
                      : 'bg-charcoal-card border-charcoal-light text-gold-light hover:border-gold/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-gold border-gold text-charcoal-dark'
                          : 'border-charcoal-light'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gold-light block">
                        {displayName}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-gold-muted mr-2">
                      {service.duration} {t('min')}
                    </span>
                    <span className="text-gold font-bold text-sm">
                      ₹{service.price}
                    </span>
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
            {/* Any Barber (Fastest) */}
            <button
              type="button"
              onClick={() => setSelectedBarberId('any')}
              className={`min-h-[48px] p-3 rounded-xl border text-left transition cursor-pointer active:scale-[0.99] ${
                selectedBarberId === 'any'
                  ? 'bg-gold/15 border-gold text-gold-light shadow-sm'
                  : 'bg-charcoal-card border-charcoal-light text-gold-light hover:border-gold/50'
              }`}
            >
              <div className="text-sm font-semibold">{t('any_barber')}</div>
              <span className="text-[10px] text-emerald-400 font-medium">⚡ Fastest</span>
            </button>

            {/* Individual Barbers: Ravi, Amit, Imran */}
            {barbers.map((b) => {
              const isSelected = selectedBarberId === b.id;
              return (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setSelectedBarberId(b.id)}
                  className={`min-h-[48px] p-3 rounded-xl border text-left transition cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? 'bg-gold/15 border-gold text-gold-light shadow-sm'
                      : 'bg-charcoal-card border-charcoal-light text-gold-light hover:border-gold/50'
                  }`}
                >
                  <div className="text-sm font-semibold">{b.name}</div>
                  {b.onBreak ? (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      <span>{t('status_break')}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gold-muted mt-0.5 capitalize block">
                      {b.status === 'free' ? t('status_free') : t('status_busy')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Barber On Break Warning */}
          {selectedBarberObj && selectedBarberObj.onBreak && (
            <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('barber_break_warning', { name: selectedBarberObj.name })}</span>
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Summary Bar & Confirm Button */}
      <footer className="fixed bottom-0 left-0 right-0 bg-charcoal-card/95 border-t border-charcoal-light p-4 backdrop-blur-md shadow-2xl z-20">
        <div className="max-w-md mx-auto space-y-3">
          {/* Live Summary */}
          <div className="flex items-center justify-between text-xs text-gold-light px-1 font-medium">
            <span>
              {t('live_summary_bar', {
                duration: totalDuration,
                price: totalPrice,
                wait: expectedWait,
              })}
            </span>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleSubmit}
            type="button"
            disabled={!isOnlineQueueOpen}
            className={`w-full min-h-[48px] px-5 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-[0.99] ${
              isOnlineQueueOpen
                ? 'bg-gold hover:bg-gold-dark text-charcoal-dark cursor-pointer'
                : 'bg-charcoal text-gold-muted border border-charcoal-light cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('btn_confirm')}</span>
            <ArrowRight className="w-4 h-4 ml-1 stroke-[2.5]" />
          </button>
        </div>
      </footer>
    </div>
  );
}
