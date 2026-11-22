/**
 * Queue rules module
 * Centralizes all queue-related calculations, status transitions, and validations
 * per docs/03-flows-rules.md
 */

export const QUEUE_STATUS = {
  WAITING: 'Waiting',
  CALLED: 'Called',
  IN_CHAIR: 'In chair',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
};

export const STAFF_PIN = '1234';

/**
 * Calculate estimated wait time in minutes
 * Rule: total service minutes of customers ahead ÷ number of barbers working (round up to 5 min).
 * Never show 0 while people are ahead.
 */
export function calculateWaitTime(totalMinutesAhead, activeBarbersCount) {
  if (totalMinutesAhead <= 0) return 0;
  const barbers = Math.max(1, activeBarbersCount);
  const rawWait = totalMinutesAhead / barbers;
  const roundedWait = Math.ceil(rawWait / 5) * 5;
  return Math.max(5, roundedWait);
}

/**
 * Validate Indian 10-digit mobile number
 */
export function validatePhone(phone) {
  const cleaned = (phone || '').replace(/\D/g, '');
  return cleaned.length === 10;
}

/**
 * Format token number, e.g. 1 -> S-1
 */
export function formatToken(seqNumber) {
  return `S-${seqNumber}`;
}

/**
 * Check if a barber can take customer based on preference
 */
export function canBarberServe(customerPreferredBarber, barberName) {
  if (!customerPreferredBarber || customerPreferredBarber.toLowerCase() === 'any') {
    return true;
  }
  return customerPreferredBarber.toLowerCase() === barberName.toLowerCase();
}
