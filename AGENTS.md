# AGENTS.md — Salon Queue Management

Queue app for a salon: customers join from their phone, see wait time and get called; reception and barbers manage the queue; a TV shows the live board.

## Read first
- docs/01-brief.md: features and what NOT to build
- docs/02-screens.md: every screen's layout and behaviour
- docs/03-flows-rules.md: flows, queue rules, test checklist

## Stack
React + Vite + Tailwind CSS. Run with `npm run dev`.
Choose the simplest storage that keeps phone, tablet and TV in sync, and explain the choice in 3 lines before using it.
Hosting: Vercel (frontend); Render or Railway only if a backend is needed. No localhost URLs in code.
The live link must be the first line after the title in README.md, with the staff test PIN right below it.

## How to work
- One screen or one feature per task. Don't touch other screens.
- Theme: charcoal #1F2937 + gold #D4A017, rounded cards, mobile-first.
- All labels go through the EN/GU language file; no hard-coded text.
- Queue rules live in ONE module in the code; reuse it everywhere.
- Never add features from the "Don't build" list.
- Use realistic dummy data (Indian names, ₹ prices) until storage is connected.
- After each task: list changed files and how to test the change.
