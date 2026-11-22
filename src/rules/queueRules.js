/**
 * Queue rules module
 * Centralizes all queue-related calculations, state management, and validations
 * per docs/02-screens.md & docs/03-flows-rules.md
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

export const SERVICES_LIST = [
  { id: 's1', key: 'service_haircut', name: 'Haircut', duration: 30, price: 150, active: true },
  { id: 's2', key: 'service_beard_trim', name: 'Beard trim', duration: 15, price: 80, active: true },
  { id: 's3', key: 'service_hair_spa', name: 'Hair spa', duration: 45, price: 400, active: true },
  { id: 's4', key: 'service_shave', name: 'Shave', duration: 15, price: 60, active: true },
  { id: 's5', key: 'service_head_massage', name: 'Head massage', duration: 20, price: 120, active: true },
];

export const INITIAL_BARBERS = [
  { id: 'ravi', name: 'Ravi', status: 'busy', onBreak: false, currentToken: 'S-12' },
  { id: 'amit', name: 'Amit', status: 'free', onBreak: false, currentToken: null },
  { id: 'imran', name: 'Imran', status: 'on_break', onBreak: true, currentToken: null },
];

// Initial realistic dummy queue representing 6 people waiting (~50 min wait)
const INITIAL_QUEUE = [
  { id: 'q1', token: 'S-8', name: 'Aarav Sharma', phone: '9876543201', serviceIds: ['s1', 's2'], barber: 'ravi', status: 'In chair', duration: 45, price: 230, createdAt: Date.now() - 15 * 60 * 1000 },
  { id: 'q2', token: 'S-9', name: 'Vikram Mehta', phone: '9876543202', serviceIds: ['s1'], barber: 'any', status: 'Waiting', duration: 30, price: 150, createdAt: Date.now() - 12 * 60 * 1000 },
  { id: 'q3', token: 'S-10', name: 'Kunal Shah', phone: '9876543203', serviceIds: ['s2'], barber: 'amit', status: 'Waiting', duration: 15, price: 80, createdAt: Date.now() - 10 * 60 * 1000 },
  { id: 'q4', token: 'S-11', name: 'Devendra Patel', phone: '9876543204', serviceIds: ['s3'], barber: 'any', status: 'Waiting', duration: 45, price: 400, createdAt: Date.now() - 8 * 60 * 1000 },
  { id: 'q5', token: 'S-12', name: 'Nikhil Roy', phone: '9876543205', serviceIds: ['s4'], barber: 'ravi', status: 'Waiting', duration: 15, price: 60, createdAt: Date.now() - 6 * 60 * 1000 },
  { id: 'q6', token: 'S-13', name: 'Manish Verma', phone: '9876543206', serviceIds: ['s5'], barber: 'any', status: 'Waiting', duration: 20, price: 120, createdAt: Date.now() - 4 * 60 * 1000 },
  { id: 'q7', token: 'S-14', name: 'Arjun Das', phone: '9876543207', serviceIds: ['s1'], barber: 'amit', status: 'Waiting', duration: 30, price: 150, createdAt: Date.now() - 2 * 60 * 1000 },
];

const STORAGE_KEY = 'salon_queue_state_v2';

/**
 * Get whole state from localStorage or initialize default
 */
export function getQueueState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read queue state', e);
  }

  const initial = {
    isOnlineQueueOpen: true,
    barbers: INITIAL_BARBERS,
    services: SERVICES_LIST,
    queue: INITIAL_QUEUE,
    tokenCounter: 15,
  };
  saveQueueState(initial);
  return initial;
}

/**
 * Save state to localStorage and notify window
 */
export function saveQueueState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('salon_queue_updated'));
  } catch (e) {
    console.error('Failed to save queue state', e);
  }
}

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
 * Format token number, e.g. 15 -> S-15
 */
export function formatToken(seqNumber) {
  return `S-${seqNumber}`;
}

/**
 * Check if a phone number already has an active spot in queue
 */
export function findActiveSpotByPhone(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return null;

  const state = getQueueState();
  const activeStatuses = [QUEUE_STATUS.WAITING, QUEUE_STATUS.CALLED, QUEUE_STATUS.IN_CHAIR];
  return state.queue.find(
    (item) => item.phone.replace(/\D/g, '') === cleaned && activeStatuses.includes(item.status)
  ) || null;
}

/**
 * Get active barbers count (on floor and not on break)
 */
export function getActiveBarbersCount(barbers = INITIAL_BARBERS) {
  return barbers.filter((b) => !b.onBreak).length || 1;
}

/**
 * Get summary stats for Home screen
 */
export function getHomeQueueSummary() {
  const state = getQueueState();
  const waitingCustomers = state.queue.filter((item) => item.status === QUEUE_STATUS.WAITING);
  const totalMinutesAhead = waitingCustomers.reduce((acc, c) => acc + (c.duration || 30), 0);
  const activeBarbers = getActiveBarbersCount(state.barbers);

  return {
    waitingCount: waitingCustomers.length,
    estimatedWaitMin: calculateWaitTime(totalMinutesAhead, activeBarbers),
    isOpen: state.isOnlineQueueOpen,
    barbers: state.barbers,
  };
}

/**
 * Get position and wait time for a spot in queue
 */
export function getSpotQueuePosition(token) {
  const state = getQueueState();
  const normalized = (token || '').toUpperCase().trim();
  const spot = state.queue.find((q) => q.token.toUpperCase() === normalized);

  if (!spot) {
    // If not found in queue, return default demo state
    return {
      spot: null,
      position: 4,
      estimatedWaitMin: 35,
      activeBarbers: getActiveBarbersCount(state.barbers),
      status: QUEUE_STATUS.WAITING,
      assignedBarber: 'Ravi',
      barberOnBreak: false,
    };
  }

  const assignedBarber = spot.barber === 'any' ? 'Ravi' : spot.barber;
  const barberObj = state.barbers.find((b) => b.id === spot.barber || b.name.toLowerCase() === spot.barber.toLowerCase());
  const barberOnBreak = barberObj ? barberObj.onBreak : false;

  // If in a non-waiting status (Cancelled, Done, No-show, Called, In chair)
  if (spot.status !== QUEUE_STATUS.WAITING) {
    return {
      spot,
      position: spot.status === QUEUE_STATUS.IN_CHAIR ? 0 : (spot.status === QUEUE_STATUS.CALLED ? 1 : 0),
      estimatedWaitMin: 0,
      activeBarbers: getActiveBarbersCount(state.barbers),
      status: spot.status,
      assignedBarber,
      barberOnBreak,
    };
  }

  // Find all waiting customers
  const waitingList = state.queue.filter((q) => q.status === QUEUE_STATUS.WAITING);
  const spotIndex = waitingList.findIndex((q) => q.token.toUpperCase() === normalized);

  // 1-based position (e.g. 1st, 2nd, 3rd)
  const position = spotIndex >= 0 ? spotIndex + 1 : 1;

  // Sum durations of all waiting customers ahead
  const customersAhead = spotIndex >= 0 ? waitingList.slice(0, spotIndex) : [];
  const minutesAhead = customersAhead.reduce((acc, c) => acc + (c.duration || 30), 0);

  const activeBarbers = getActiveBarbersCount(state.barbers);
  const estimatedWaitMin = calculateWaitTime(minutesAhead, activeBarbers);

  return {
    spot,
    position,
    estimatedWaitMin,
    activeBarbers,
    status: spot.status,
    assignedBarber,
    barberOnBreak,
  };
}

/**
 * Cancel a spot by token
 * Rule: status becomes Cancelled; queue gap closes for everyone behind; emits update event
 */
export function cancelCustomerSpot(token) {
  const state = getQueueState();
  const normalized = (token || '').toUpperCase().trim();
  let found = false;

  const updatedQueue = state.queue.map((q) => {
    if (q.token.toUpperCase() === normalized) {
      found = true;
      return {
        ...q,
        status: QUEUE_STATUS.CANCELLED,
        cancelledAt: Date.now(),
      };
    }
    return q;
  });

  if (!found) {
    // If the token wasn't in state (e.g. ad-hoc S-14), add it as cancelled
    updatedQueue.push({
      id: 'q_' + Date.now(),
      token: normalized,
      name: 'Customer',
      phone: '',
      serviceIds: ['s1'],
      barber: 'any',
      status: QUEUE_STATUS.CANCELLED,
      duration: 30,
      price: 150,
      createdAt: Date.now(),
      cancelledAt: Date.now(),
    });
  }

  const updatedState = {
    ...state,
    queue: updatedQueue,
  };

  saveQueueState(updatedState);
  return true;
}

/**
 * Add a customer to queue
 */
export function addCustomerToQueue({ name, phone, serviceIds, barber }) {
  const state = getQueueState();

  // Guard against duplicate active phone number
  const existing = findActiveSpotByPhone(phone);
  if (existing) {
    return { success: true, spot: existing, isExisting: true };
  }

  const selectedServices = state.services.filter((s) => serviceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((acc, s) => acc + s.duration, 0);
  const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);

  const nextSeq = state.tokenCounter || 15;
  const token = formatToken(nextSeq);

  const newSpot = {
    id: 'q_' + Date.now(),
    token,
    name: name.trim(),
    phone: phone.replace(/\D/g, ''),
    serviceIds,
    barber: barber || 'any',
    status: QUEUE_STATUS.WAITING,
    duration: totalDuration,
    price: totalPrice,
    createdAt: Date.now(),
  };

  const updatedQueue = [...state.queue, newSpot];
  const updatedState = {
    ...state,
    queue: updatedQueue,
    tokenCounter: nextSeq + 1,
  };

  saveQueueState(updatedState);
  return { success: true, spot: newSpot, isExisting: false };
}
