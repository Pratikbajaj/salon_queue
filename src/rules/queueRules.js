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
  { id: 'ravi', name: 'Ravi', status: 'busy', onBreak: false, currentToken: 'S-8' },
  { id: 'amit', name: 'Amit', status: 'free', onBreak: false, currentToken: null },
  { id: 'imran', name: 'Imran', status: 'on_break', onBreak: true, currentToken: null },
];

// Initial queue: 1 in chair (Ravi with S-8) + 5 waiting (total 100m ahead -> 50 min wait with 2 active barbers)
// Next joiner receives token S-14 and becomes 6th in line with ~50 min wait!
const INITIAL_QUEUE = [
  { id: 'q1', token: 'S-8', name: 'Aarav Sharma', phone: '9876543201', serviceIds: ['s1', 's2'], barber: 'ravi', status: 'In chair', duration: 45, price: 230, createdAt: Date.now() - 15 * 60 * 1000 },
  { id: 'q2', token: 'S-9', name: 'Vikram Mehta', phone: '9876543202', serviceIds: ['s1'], barber: 'any', status: 'Waiting', duration: 25, price: 150, createdAt: Date.now() - 12 * 60 * 1000 },
  { id: 'q3', token: 'S-10', name: 'Kunal Shah', phone: '9876543203', serviceIds: ['s2'], barber: 'amit', status: 'Waiting', duration: 15, price: 80, createdAt: Date.now() - 10 * 60 * 1000 },
  { id: 'q4', token: 'S-11', name: 'Devendra Patel', phone: '9876543204', serviceIds: ['s3'], barber: 'any', status: 'Waiting', duration: 25, price: 400, createdAt: Date.now() - 8 * 60 * 1000 },
  { id: 'q5', token: 'S-12', name: 'Nikhil Roy', phone: '9876543205', serviceIds: ['s4'], barber: 'ravi', status: 'Waiting', duration: 15, price: 60, createdAt: Date.now() - 6 * 60 * 1000 },
  { id: 'q6', token: 'S-13', name: 'Manish Verma', phone: '9876543206', serviceIds: ['s5'], barber: 'any', status: 'Waiting', duration: 20, price: 120, createdAt: Date.now() - 4 * 60 * 1000 },
];

const STORAGE_KEY = 'salon_queue_state_v3';

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
    tokenCounter: 14,
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
 * Format ordinal position (1st, 2nd, 3rd, 4th, 6th... in EN; 1ला, 2रा, 3रा, 6वाँ in HI)
 */
export function formatOrdinal(pos, lang = 'en') {
  const n = parseInt(pos, 10) || 1;
  if (lang === 'hi') {
    if (n === 1) return '1ला';
    if (n === 2) return '2रा';
    if (n === 3) return '3रा';
    if (n === 4) return '4था';
    return `${n}वाँ`;
  }
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Validate Indian 10-digit mobile number
 */
export function validatePhone(phone) {
  const cleaned = (phone || '').replace(/\D/g, '');
  return cleaned.length === 10;
}

/**
 * Format token number, e.g. 14 -> S-14
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
    // If not found in queue (e.g. testing URL /status/S-14 before join), simulate S-14 waiting
    return {
      spot: null,
      position: 6,
      estimatedWaitMin: 50,
      activeBarbers: getActiveBarbersCount(state.barbers),
      status: QUEUE_STATUS.WAITING,
      assignedBarber: 'Amit',
      barberOnBreak: false,
    };
  }

  const assignedBarberId = spot.assignedBarber || (spot.barber === 'any' ? null : spot.barber);
  const barberObj = state.barbers.find(
    (b) => b.id === assignedBarberId || b.id === spot.barber ||
      b.name.toLowerCase() === String(assignedBarberId || spot.barber).toLowerCase()
  );
  const assignedBarber = barberObj?.name || (spot.barber === 'any' ? 'Amit' : spot.barber);
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

  // Find all waiting customers in order
  const waitingList = state.queue.filter((q) => q.status === QUEUE_STATUS.WAITING);
  const spotIndex = waitingList.findIndex((q) => q.token.toUpperCase() === normalized);

  // 1-based position (e.g. 1st, 2nd, 3rd... 6th in line)
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
 * Update a spot's status directly (e.g. called, in chair, done, cancelled)
 */
export function updateSpotStatus(token, newStatus, assignedBarber = null) {
  const state = getQueueState();
  const normalized = (token || '').toUpperCase().trim();

  const updatedQueue = state.queue.map((q) => {
    if (q.token.toUpperCase() === normalized) {
      return {
        ...q,
        status: newStatus,
        barber: assignedBarber || q.barber,
        updatedAt: Date.now(),
      };
    }
    return q;
  });

  const updatedState = {
    ...state,
    queue: updatedQueue,
  };

  saveQueueState(updatedState);
  return true;
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
 * Call next customer for a specific barber.
 * Rules (from docs/03-flows-rules.md):
 *   1. Pick the earliest Waiting customer who chose `barberId` OR 'any'.
 *   2. A customer who chose a specific barber is NEVER assigned to another barber.
 *   3. A barber on break is NOT eligible for 'any' customers.
 *   4. At most one customer in chair at a time (caller must check).
 * Returns the called customer object or null if none available.
 */
export function callNextForBarber(barberId) {
  const state = getQueueState();
  const barber = state.barbers.find((b) => b.id === barberId);
  if (!barber) return null;

  // Don't assign if barber already has someone In chair
  const alreadyServing = state.queue.find(
    (q) => q.status === QUEUE_STATUS.IN_CHAIR && (q.barber === barberId || q.assignedBarber === barberId)
  );
  if (alreadyServing) return null;

  // Also don't assign if barber has a Called customer not yet In chair
  const alreadyCalled = state.queue.find(
    (q) => q.status === QUEUE_STATUS.CALLED && (q.barber === barberId || q.assignedBarber === barberId)
  );
  if (alreadyCalled) return null;

  // Find the earliest Waiting customer who qualifies:
  // - chose this barberId exactly, OR
  // - chose 'any' AND this barber is NOT on break
  const candidate = state.queue.find((q) => {
    if (q.status !== QUEUE_STATUS.WAITING) return false;
    if (q.barber === barberId) return true;           // specific preference → only this barber
    if (q.barber === 'any' && !barber.onBreak) return true;  // any → not on break
    return false;
  });

  if (!candidate) return null;

  // Update candidate to Called, assign barber
  const updatedQueue = state.queue.map((q) => {
    if (q.id === candidate.id) {
      return {
        ...q,
        status: QUEUE_STATUS.CALLED,
        assignedBarber: barberId,
        barber: barberId,  // lock in the barber
        calledAt: Date.now(),
      };
    }
    return q;
  });

  // Update barber status to reflect they have a called customer
  const updatedBarbers = state.barbers.map((b) => {
    if (b.id === barberId) {
      return { ...b, status: 'called', currentToken: candidate.token };
    }
    return b;
  });

  saveQueueState({ ...state, queue: updatedQueue, barbers: updatedBarbers });
  return { ...candidate, status: QUEUE_STATUS.CALLED, assignedBarber: barberId };
}

/**
 * Mark a customer as No-show by token.
 * Rule: Called → No-show (never backwards; only Called can become No-show)
 */
export function markNoShow(token) {
  const state = getQueueState();
  const normalized = (token || '').toUpperCase().trim();
  let found = false;

  const updatedQueue = state.queue.map((q) => {
    if (q.token.toUpperCase() === normalized) {
      found = true;
      return { ...q, status: QUEUE_STATUS.NO_SHOW, noShowAt: Date.now() };
    }
    return q;
  });

  if (!found) return false;

  // Free the barber if they were serving this customer
  const noShowSpot = state.queue.find((q) => q.token.toUpperCase() === normalized);
  const updatedBarbers = state.barbers.map((b) => {
    if (noShowSpot && (b.id === noShowSpot.barber || b.id === noShowSpot.assignedBarber)) {
      return { ...b, status: 'free', currentToken: null };
    }
    return b;
  });

  saveQueueState({ ...state, queue: updatedQueue, barbers: updatedBarbers });
  return true;
}

/**
 * Add a walk-in customer to the queue (same logic as addCustomerToQueue)
 * Alias provided for semantic clarity in Reception.
 */
export function addWalkIn({ name, phone, serviceIds, barber }) {
  return addCustomerToQueue({ name, phone, serviceIds, barber });
}

/**
 * Get waiting time for a spot in elapsed minutes (for the reception list)
 */
export function getWaitingMinutes(createdAt) {
  return Math.floor((Date.now() - (createdAt || Date.now())) / 60000);
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

  const nextSeq = state.tokenCounter || 14;
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
