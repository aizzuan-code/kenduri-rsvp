# Kenduri RSVP 🎉

A single-file web app for collecting kenduri (Malay wedding feast) RSVPs — no backend, no login, no database. Built for the AI Smart Nation 2026 Build-a-thon.

## Features

- **Guest flow**: welcome screen with countdown + QR card → 4-step RSVP (details → members → menu with dish art → arrival slot & extras) → e-badge with unique code & confetti
- **Menu selection**: 7 Malaysian dishes with hand-drawn SVG art, one plate per person, dietary flags
- **Time slots**: live seats-left per arrival slot
- **Update RSVP**: guests change their reply with their code — no duplicates
- **Host dashboard**: stat cards, slot-fill and menu-tally charts, attendee table, ucapan & song wall, entrance check-in with arrived counter, copy-summary export

## Run it

Just open `index.html` in any browser. Or host it free:

1. Push this repo to GitHub
2. Settings → Pages → Deploy from branch → `main` / `(root)`
3. Share your `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/` link — the QR becomes scannable once hosted

## Notes

- Everything is stored in `localStorage` only (demo data included so the app is never empty)
- Multi-page variant of the same app is kept in `multipage/` for reference
