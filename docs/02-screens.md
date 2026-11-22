# Salon Queue — Screens & Features

Global: every label comes from the EN/HI language file. Language toggle (EN | हिं) sits top-right on every screen. Tap targets are at least 44px. Theme: charcoal #1F2937 + gold #D4A017.

## Screen 1: Home (`/`) — phone
- Salon name + logo, badge "Open · Closes 9 PM" (red "Queue closed" when closed).
- Live card: "6 people waiting · about 50 min".
- Barber chips with status: Ravi (busy), Amit (free), Imran (on break).
- Big gold button **[ Join Queue ]**; disabled with message when online joining is closed.
- Empty state: "No one waiting — walk right in!"

## Screen 2: Join Queue (`/join`) — phone
- Fields: Name, Phone (10 digits, validated inline).
- Service cards, multi-select, max 3 (e.g. Haircut 30 min ₹150, Beard trim 15 min ₹80, Hair spa 45 min ₹400, Shave 15 min ₹60, Head massage 20 min ₹120). Selecting a 4th shows "Maximum 3 services".
- Barber picker: "Any barber (fastest)" or a barber photo card; barbers on break are marked and still selectable with a warning.
- Live summary bar: "Total 45 min · ₹230 · Expected wait ~35 min", updates as selections change.
- **[ Confirm ]** goes to My Status. If the phone already has an active spot, show that spot instead of creating a new one.
- Errors: invalid phone, no service selected, queue closed.

## Screen 3: My Status (`/status/:id`) — phone
- Large token (e.g. "S-14") and position ("4th in line").
- Circular countdown "about 35 min"; refreshes automatically.
- When 2nd in line: gold banner "Start coming to the salon".
- When called: full-screen gold "It's your turn! Go to Ravi", gentle pulse, phone vibration.
- If the chosen barber is on break: notice "Ravi is on break".
- **[ Cancel my spot ]** with a confirmation pop-up.
- Final states: Done ("Thank you!"), Cancelled, No-show (with "Join again" button).

## Screen 4: Reception Dashboard (`/reception`) — tablet landscape, PIN-protected
- Left: barber cards in a 3-column row: current customer, time-left progress bar, **[Call next]**.
- Right: waiting list in order: token, name, services, preferred barber, waiting time, **[No-show]** **[Cancel]**.
- Top: **[ + Add walk-in ]** opens a quick form (name, phone, services, barber).
- Waiting > 60 min highlighted amber. "Called" customers show a 10-minute no-show countdown.
- Empty state: "Queue is empty."

## Screen 5: Barber View (`/barber/:name`) — phone, PIN-protected
- Current customer: name, services, timer since start.
- Big buttons **[ Start ]** then **[ Done ]**.
- "Next for you: S-15 Kunal (Haircut)".
- Toggle: On break / Available.
- Empty state: "No customer yet — enjoy the break."

## Screen 6: Waiting Area TV (`/display`) — 1080p landscape
- One row per barber: photo, name, "Now: S-12" (or "Free").
- "Up next" list of 5 tokens with estimated times.
- Newly called token flashes gold with a chime.
- Text readable from 5 metres; no buttons.

## Screen 7: Owner Settings (`/admin`) — tablet/desktop, PIN-protected
- Services list: name EN/HI, minutes, price, on/off toggle.
- Barbers on duty today (toggle each).
- Queue switch: Open / Closed for online joining.
- Today's stats cards: customers served, average wait, no-shows, cancellations.
