# prompts.md — Salon Queue Management System

Log every prompt in the order you actually used it, including the ones that failed.

Tool used: Google Antigravity

---

## 0. Docs written by me (before prompting)
- AGENTS.md, docs/01-brief.md, docs/02-screens.md, docs/03-flows-rules.md
- Reviewed by TA: no

## 1. Understand & set up
**Prompt:**
```
Read AGENTS.md and all of docs/. Summarise the app in 8 bullets and list questions. Then set up the project with empty pages for all 7 screens, the theme, and the EN/HI toggle.
```
**Result:** worked / partly / failed
**Notes:**

## 1b. Design change: Hindi instead of Gujarati + new colours
**Why:** I didn't like the colours and wanted Hindi instead of Gujarati. I updated the docs first, then prompted.
**Prompt:**
```
I changed the design in the docs. Read AGENTS.md and docs/ again. Replace Gujarati with Hindi everywhere (language file, toggle labels, EN/GU -> EN/HI). Change the theme to background #XXXXXX and accent #XXXXXX, using the new colours in the docs. Don't change any screen layouts or logic. List the files you changed and how to test.
```
**Result:**
**Notes:**

## 1c. Colour cleanup after my find-and-replace mistake
**Why:** I tried swapping colours with a project-wide find-and-replace (#4A1C2B to #F5E9DA). That turned every dark and light colour into the same cream and broke the theme, and one line in tailwind.config.js was corrupted. I fixed tailwind.config.js and the docs by hand, then asked the agent to clean up the rest.
**Prompt:**
```
The theme is now defined in tailwind.config.js (charcoal.* for backgrounds and cards, gold.* for accent and text). Search all files in src/ for hard-coded hex colours or leftover #F5E9DA / #4A1C2B and replace them with the Tailwind theme colours, deciding from context (background, card, border, text, button). Check text contrast on all 7 screens. Keep green for "Free" and amber for "Busy". Don't change layouts, logic or text. List the files you changed and what you fixed.
```
**Result:** worked
**Notes:** Home page now shows navy background, gold button, green Free and amber Busy. (Add what you checked on the other pages, and anything that still looked off.)

## 2. Home + Join Queue
**Prompt:**
```
Build Screen 1 (Home) and Screen 2 (Join Queue) from docs/02-screens.md with dummy services and 3 barbers (Ravi, Amit, Imran). Validate phone numbers and the 3-service limit. The live summary must update as I select services. Don't touch other screens. List the files you changed.
```
**Result:** worked
**Notes:** Home and Join Queue screens built with dummy services and the 3 barbers. Phone validation, the 3-service limit and the live summary (total time, price, wait) update as I select services. Tested in phone view (iPhone 16 size) and with the Hindi toggle.

## 2b. Deploy early (after step 2)
**Prompt:**
```
I want to host this app on Vercel (frontend) and, if we have a backend, Render. Check the project is ready for deployment: build command, environment variables, no localhost URLs left in the code. Then give me step-by-step deploy instructions for my exact setup.
```
**Result:** worked
**Notes:** Verified 0 localhost URLs in codebase, build command `npm run build` generates `dist/` cleanly, added `vercel.json` SPA rewrite rule to prevent 404s on deep links, created `.env.example`, and provided step-by-step Vercel and Render deployment instructions.

---

## Fix & iterate prompts

### Bug 1: Cancel my spot did nothing
**Prompt:**
```
Bug: On /status/:id, I tap [Cancel my spot], the confirmation pop-up appears, and when I click "Yes, cancel my spot" the pop-up closes but nothing changes on the screen. Expected (docs/02-screens.md, Screen 3, and docs/03-flows-rules.md, cancel rules): the spot's status becomes Cancelled, the screen shows the Cancelled final state with a "Join again" option, the customer is removed from the waiting list so everyone behind moves up, and the Reception list and the Home "people waiting" count update. Explain the cause first, then fix it. Don't change other screens.
```
**What was wrong:** The pop-up closed but the screen didn't change and the queue stayed the same.
**Expected:** Cancelled state shown, spot removed from the queue, Home waiting count goes down.
**Result:** worked. The agent explained the cause: the Cancel button only changed a local state inside the status screen and didn't update the shared queue. It added a cancel function to queueRules.js and updated the status screen. Tested by cancelling a spot and checking the Cancelled state and the Home count.