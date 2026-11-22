# Salon Queue Management System

**Live demo:** https://salon-queue-cyan.vercel.app/
**Hosted on:** Vercel (frontend) + Render/Railway (backend, if used)
**Staff test PIN (reception / barber / admin):** 1234

## About
A queue app for a salon. Customers join from their phone, see their position and estimated wait, and get called. Reception and barbers manage the queue, and a waiting-area TV shows the live board. Labels are available in English and Hindi.

## Screens
| Screen | URL | Device |
|---|---|---|
| Home | `/` | Phone |
| Join Queue | `/join` | Phone |
| My Status | `/status/:id` | Phone |
| Reception Dashboard | `/reception` | Tablet |
| Barber View | `/barber/:name` | Phone |
| Waiting Area TV | `/display` | TV |
| Owner Settings | `/admin` | Tablet/desktop |

## Run locally
```
npm install
npm run dev
```

## Project docs
- `AGENTS.md`: instructions for the AI agent
- `docs/01-brief.md`, `docs/02-screens.md`, `docs/03-flows-rules.md`
- `prompts.md`: every prompt used, in order

## Tech
React + Vite + Tailwind CSS. Built with Google Antigravity(vibe coding lab, MSc IT).
