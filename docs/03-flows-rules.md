# Salon Queue — Flows & Rules

## Flow: remote customer
1. Opens Home, taps Join, picks Haircut + "Any barber", gets token S-14, 6th in line.
2. Watches My Status from home. At 2nd in line, sees "Start coming to the salon".
3. Receptionist taps **Call next** on Amit's card, S-14 becomes Called.
4. Customer's phone shows "It's your turn! Go to Amit"; the TV flashes S-14.
5. Amit taps Start, then Done. S-14 leaves the queue and stats update.

## Flow: walk-in
Receptionist taps + Add walk-in, enters name, phone, services, barber. The customer joins the same queue at the end (first come, first served) and gets a token.

## Flow: cancel
Customer taps Cancel my spot, confirms in the pop-up, and the queue closes the gap for everyone behind.

## Rules
- **Statuses:** Waiting → Called → In chair → Done. Never backwards. Also Waiting → Cancelled and Called → No-show.
- First come, first served.
- **Call next for barber X** picks the earliest Waiting customer who chose X or "Any".
- A customer who chose Ravi is never assigned to another barber.
- A barber has at most one customer in the chair at a time.
- **Waiting time** ≈ total service minutes of customers ahead ÷ number of barbers working (round up to 5 min). Never show 0 while people are ahead.
- One active spot per phone number.
- Called but not arrived in 10 minutes: receptionist may mark No-show. If they come later, they are added again at the END with a new token.
- Online joining closes 30 minutes before closing time or when the owner switches it off; walk-ins are still allowed.
- Barber on break: customers who chose them see "Ravi is on break"; "Any" customers are not assigned to that barber.
- Disabled services are hidden from Join but remain on existing spots.
- Tokens run S-1, S-2, … and reset daily.
- Staff screens need a PIN (demo PIN: 1234).

## Test checklist
- [ ] Join with 2 services shows correct total time and price.
- [ ] Selecting a 4th service is blocked with a message.
- [ ] Invalid phone number (not 10 digits) shows an error.
- [ ] Same phone joins twice and is shown the existing spot, no duplicate.
- [ ] Call next for Amit skips a customer who chose Ravi.
- [ ] Call next shows "It's your turn" on the customer's phone within 5 s.
- [ ] Start/Done on Barber View updates Reception and TV within 5 s.
- [ ] No-show, then re-add: goes to the end with a new token.
- [ ] Cancel removes the customer and positions behind update.
- [ ] Barber on break shows the notice to customers who chose them.
- [ ] Close online queue: Join button disabled with message; walk-in still works.
- [ ] Turning a service off hides it from Join.
- [ ] Language toggle switches all labels to Gujarati with no overflow.
- [ ] Waiting time goes down as customers finish.
- [ ] Phone, tablet and TV windows all stay in sync.
- [ ] Staff screens reject a wrong PIN.
