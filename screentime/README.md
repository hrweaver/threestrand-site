# Screen time poll

A live, anonymous poll for talks. Built for the St Peters Smart Families talk (October 2026).
People answer on their phones, and the room's totals build on the big screen.

| Page | URL | Who sees it |
|---|---|---|
| `index.html` | getthreestrand.com/screentime | Phones, via the QR code |
| `live/index.html` | getthreestrand.com/screentime/live | The projector |
| `qr.svg` | | QR code for the phone page, shown on the live page |

## How it works

The phone page asks two questions, one per screen:

1. "How much phone time a day feels healthy to you?" Then Next. There is no way back, so this answer can't be adjusted after seeing the real number.
2. "Now look it up." It gives iPhone and Android directions, then asks for the real daily number.

Nothing is saved until the second answer is sent, so only complete pairs are counted.

The live page is one screen per idea. Scroll, or use Page Down on a clicker:

1. QR code plus a live "N people so far" count
2. What we said is healthy (average)
3. What our phones say (average) and the gap
4. The gap as a movie, with a movie ticket: "The extra 2h 24m we spend each day? That's Forrest Gump." (picks the closest runtime from `MOVIES` in live/index.html; skipped if the gap is under 45 min)
5. "X of N" of us are over our own number
6. Hour histogram, healthy next to actual
7. Days a year, per person
8. Years of phone time, the whole room
9. Ecclesiastes 4:12 (NIV)
10. "Less phone, more people.", "Find me at the table in the back.", and a "Get the app" QR code (`qr-get.svg`, points at getthreestrand.com/get)

## Choices made on purpose (don't undo without a reason)

- **Healthy vs actual, not guess vs actual.** People guess high when they can tell what the exercise is. Nobody can game "what feels healthy," and nearly everyone ends up over their own number.
- **No per-person marks.** The chart is counts per hour. Everything 7h and up shares one "7h+" bar, and there are no count labels, so one heavy user never stands out. It's meant to feel like "we," not "you."
- **The verse comes after the data.** The numbers show the problem and the verse turns to the answer. Opening with it makes the numbers feel like a sermon.
- **No movie posters.** They're copyrighted and this is a public company page; the ticket card is drawn in CSS.
- **No Claude or other vendor branding.** It's a plain page on our own domain.

## Bad input

- Answers are dropdowns only. Hours go to 16 (15 for the healthy answer), minutes in steps of 5.
- Anything over 12 hours a day asks for a double-check before sending.
- The Firestore rules reject anything outside 5 min to 16 h for the actual number and 0 to 16 h for healthy, so a bypassed page still can't store junk.
- Entries are add-only: no edits, no deletes from the web. Each phone counts once, tracked in localStorage.

## Events

Both pages read `?e=<name>`, with a default of `stpeters`. Any other event shows a small "Practice run" tag.

- `?e=test`: a few rehearsal entries
- `?e=demo`: 62 made-up entries, to see what a full room looks like
- For a new talk, pick a new name, for example `?e=lakeway`, and put it on both links. The QR code points at the default, so make a new code for a different event, or make that event the default.

`?reset` on the phone page clears that phone's "already answered" flag, for example `/screentime?reset` or `/screentime?e=demo&reset`.

## Backend

Its own Firebase project, **`threestrand-poll`**, isolated from every app project. The rules and notes are in `~/threestrand-poll` (see its README). The web config in the pages is public by design, and the rules are the guard.

Data: `polls/{event}/entries/{auto}` = `{healthy, actual}` in minutes, plus server time `at`.

Wipe an event (admin, from your Mac):

```
firebase firestore:delete polls/stpeters/entries --recursive --project threestrand-poll -f
```

## Preview locally

From the site root: `python3 -m http.server 8090`, then open http://localhost:8090/screentime/live/?e=demo
