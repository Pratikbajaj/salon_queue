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

---

## Fix & iterate prompts (add each one you use)
**Prompt:**
```

```
**What was wrong / Expected / Result:**
