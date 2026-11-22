# Salon Queue Management System

**Live demo:** https://salon-queue-cyan.vercel.app/
**Staff test PIN (reception / barber):** 1234

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

## Deployment

### Frontend on Vercel

This is a Vite single-page app. Import the repository into Vercel with these settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none required

`vercel.json` sends app routes such as `/join` and `/status/S-14` back to the SPA entry point.

### Backend on Render or Railway

There is no backend service in this version, so deploy only the frontend. Queue state is stored in each browser's `localStorage`; separate phones, tablets, and TVs will not share queue updates. Use dummy data only until a shared backend is connected. The staff PIN is a demo gate, not production authentication.

## Project docs
- `AGENTS.md`: instructions for the AI agent
- `docs/01-brief.md`, `docs/02-screens.md`, `docs/03-flows-rules.md`
- `prompts.md`: every prompt used, in order

## Tech
React + Vite + Tailwind CSS. Built with Google Antigravity(vibe coding lab, MSc IT).
