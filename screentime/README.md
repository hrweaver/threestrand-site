# Screen time poll

A live, anonymous poll for talks. Built for the St Peters Smart Families talk (October 2026).
People answer on their phones, and the room's totals build on the big screen.

| Page | URL | Who sees it |
|---|---|---|
| `index.html` | getthreestrand.com/screentime | Phones, via the QR code |
| `live/index.html` | getthreestrand.com/screentime/live | The projector |
| `qr.svg` | | QR code for the phone page, shown on the live page |
| `qr-demo.svg`, `qr-test.svg`, `qr-livetest.svg` | | QR codes the live page swaps in on `?e=demo`, `?e=test` and `?e=livetest`, so practice scans stay out of the real night |

## How it works

The phone page asks two questions, one per screen:

1. "How much phone time a day would you be happy with?", with a one-line hint on what counts (screen time, not calls at your ear). Then Next. There is no way back, so this answer can't be adjusted after seeing the real number.
2. "Now look it up." It gives iPhone and Android directions, then asks for the real daily number. iPhone uses **last week's** average, because the current week's average counts today's partial day and reads low early in the week (seen on-device on a Monday 2026-10-26: 46m this week vs 1h 10m last week). `iphone-screen-time.mp4` (about 0.5 MB, Harry's own recording, trimmed, with the number circled) loops under the iPhone steps. `android-screen-time.mp4` (about 0.4 MB, recorded on the REVVL test phone, loading screen sped up, yesterday's total circled) loops under the Android steps; the 2026-10-26 cut shows 0 minutes because the phone sat unused that Sunday, so re-record it once yesterday has real use.

Nothing is saved until the second answer is sent, so only complete pairs are counted.

The live page is one screen per idea. The down/up arrows, Page Down/Up (a clicker) and space each move exactly one screen, with a slow 0.9 s glide (GLIDE_MS); scrolling works too:

0. The Threestrand logo, big and alone, so the room isn't scanning while you introduce yourself. As you scroll it shrinks into the corner wordmark of the next screen.
1. "Grab your phone." QR code and the anonymity promise, nothing else (showing every step up front made people balk)
2. Question 1 on its own, small QR in the corner for latecomers
3. Question 2 with iPhone/Android directions, the live "N people so far" count, small QR
4. Lead: "X of N of us are over the number we'd be happy with." as the headline (don't bury it), then under it what we'd be happy with, what our phones say (with the gap), and the gap as a movie ticket ("The extra 2h 24m a day? That's Forrest Gump.", closest runtime from `MOVIES` in live/index.html; the ticket hides if the gap is under 45 min), side by side
5. "This room, together": waking time a year each, as months and days ("3 months 14 days"), and waking time for the whole room, as years and months ("24 years 2 months"), both rounded. Both use a 16-hour waking day (8 hours of sleep, a round number, not a measured average), because sleep isn't what the phone takes; 24-hour days understated it by a third.
6. Ecclesiastes 4:12 (NIV), with "three strands" in blue and the threestrand wordmark under it
7. "Less phone, more people.", "Find me at the table in the back.", and a "Get the app" QR code (`qr-get.svg`, points at getthreestrand.com/get)

## Choices made on purpose (don't undo without a reason)

- **Happy-with vs actual, not guess vs actual.** People guess high when they can tell what the exercise is. Nobody can game "what would you be happy with," and nearly everyone ends up over their own number.
- **"Happy with," not "healthy."** Changed 2026-10-25. "Healthy" sounded like a right answer someone was grading, and pulled people toward an expert-sounding number. The stored field is still named `healthy`, so the rules and old data didn't change.
- **Averages and counts only, no distribution chart.** A histogram was cut (October 2026): in a small room the person at the far end can tell it's them. It's meant to feel like "we," not "you."
- **Two data screens, not seven.** The talk is 5 minutes, so the numbers sit together and the room watches them move as answers come in, instead of a reveal per number.
- **The verse comes after the data.** The numbers show the problem and the verse turns to the answer. Opening with it makes the numbers feel like a sermon.
- **No movie posters.** They're copyrighted and this is a public company page; the ticket card is drawn in CSS.
- **No Claude or other vendor branding.** It's a plain page on our own domain.

## Bad input

- Every average (and the gap, movie, days and years) is a 5% trimmed mean: the top and bottom 5% of each number are dropped, which is none until 20 answers and 2 each way at 40. The room's total years is that average × everyone. "X of N over our own number" counts every answer, untrimmed.

- Answers are dropdowns only. Hours go to 16 (15 for the healthy answer), minutes in steps of 5.
- Anything over 12 hours a day asks for a double-check before sending.
- The Firestore rules reject anything outside 5 min to 16 h for the actual number and 0 to 16 h for healthy, so a bypassed page still can't store junk.
- Entries are add-only: no edits, no deletes from the web. Each phone counts once, tracked in localStorage. Next also saves the first answer there, so refreshing or going back from Question 2 returns to Question 2 with the first answer locked.

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
