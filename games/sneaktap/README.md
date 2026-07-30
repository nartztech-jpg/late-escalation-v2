# SNEAKTAP

A silent, one-thumbed odd-one-out game sized for the gaps in a teaching day.
One tile in the grid is a slightly different shade — tap it before the clock
runs out. The grid grows, the shade gap narrows, and the whole thing disguises
itself as a page of lecture notes in one tap.

`index.html` is self-contained: no build step, no dependencies, no network
calls. It is completely separate from the app in this repo — nothing imports it
and it imports nothing.

## Play it

Open `index.html` in a browser. That's the whole game; everything below is
optional.

To install it on a phone, serve the folder instead:

```sh
python3 -m http.server --directory games/sneaktap 8080   # then visit localhost:8080
```

Served that way it picks up three extra files and becomes an installable,
fully offline PWA — "Add to Home Screen" gives a standalone launcher with no
address bar:

| File | Purpose |
| --- | --- |
| `manifest.webmanifest` | Name, standalone display, theme colours, icons |
| `icon.svg` | Favicon — the game in miniature, four tiles with one a shade lighter |
| `icon-180.png` | iOS home screen. **Must be PNG**: iOS ignores an SVG `apple-touch-icon` and falls back to a screenshot of the page |
| `icon-192.png`, `icon-512.png` | Android install and splash, declared `any` and `maskable` |
| `sw.js` | Caches the shell so the game runs with no network |

None of them are required. Opened as a plain file the links resolve to nothing,
the service worker registration is skipped after an explicit reachability
check, and the game plays identically — both paths are covered by tests.

The PNGs are rendered from the same artwork as `icon.svg`, laid out full-bleed
with the tiles inside the inscribed square of the maskable safe circle
(111–401 of 512) so no corner is cropped away. Bump `CACHE` in `sw.js` whenever
any of these change, or installed clients keep serving the old shell.

### What this is not

This is a progressive web app, not a native build. It installs to the home
screen, runs offline and standalone with no address bar, and needs no store
review — which is the whole distribution story for a game people share by
link. Getting it into the App Store or Play Store means wrapping it with
something like Capacitor or PWABuilder, which needs Xcode and the Android SDK
and a signing identity, none of which are verifiable from here.

## Modes

| Mode | Shape | For |
| --- | --- | --- |
| **Lecture** | 30 seconds on the clock; correct taps add 0.45s, misses cost 2.5s | Playing under a desk |
| **Pregame** | No clock, three misses | The ten minutes before it starts |
| **Daily** | Lecture rules, but the tile sequence is seeded from the date | Comparing scores with people who played the same board |

## Daily runs

The daily board is dealt by a `mulberry32` generator seeded from a hash of
today's date, so everyone playing on the same day gets an identical sequence and
a retry reproduces it exactly. Every gameplay decision — which tile is odd, and
whether it's the lighter or darker one — draws from `S.rng`; only cosmetics
(particle directions) stay unseeded. Retries are unlimited and your best for the
date is what's kept, so the number is comparable rather than a one-shot verdict.
Daily bests are scoped to their date and clear at midnight.

## Missing tells you something

A miss doesn't just say "wrong". The odd tile is repainted with an exaggerated
version of its own gap — five times the real difference — so your eye learns the
signature it was supposed to catch, and a label at that tile says how fine the
gap actually was (`gap was 2.3%`). Tap a tile orthogonally next to the right one
and it says `one tile off` instead. There's also a live shade-gap readout in the
instrument strip, so you always know how hard the current round really is.

## Sharing

`Share card` renders a 1080×1080 summary on a canvas — score, level, best combo,
average reaction, and which board sizes the run reached — then hands it to the
Web Share sheet where that exists, and falls back to downloading the PNG where it
doesn't. `Copy` puts a compact text version on the clipboard for group chats:

```
SNEAKTAP · Daily 29 Jul
6,383 — level 31, 0.42s avg
▰▰▰▰▱ grids cleared, best combo ×24
```

## Boot sequence

There is nothing to download — one file, no assets, no fonts, no network — so
the boot screen doesn't fake a progress bar. It reports three real readiness
steps: `document.fonts.ready`, reading your saved runs out of `localStorage`,
and building a throwaway first board so the opening round doesn't pay for
layout. The steps typically complete in under 200ms; a short hold after them
makes the handover read as deliberate rather than as a flicker, and the start
screen then rises into place in sequence.

Two properties it must have, both covered by tests:

- **It cannot trap you.** A 2.5s failsafe releases the screen and completes
  initialisation even if a step hangs forever, and a step that throws is caught
  and handed over regardless. Verified by stubbing `document.fonts` to hang and
  to throw.
- **It shows once per load, never on a restart.** A splash between attempts
  would defeat the whole "one more go" loop.

The screen is plain markup with inline styles, present before any script runs,
so it covers the first paint rather than appearing after it.

## Sound

Off by default, because silence is the entire premise, and entirely synthesised
with WebAudio oscillators — no audio files, so the single-file promise holds.
Nothing is constructed until you turn it on: with sound off no `AudioContext`
exists at all, which is asserted in the tests. The context is built inside the
toggle's own click handler, so browsers don't block it.

**Two buses under one master.** Music is separable from effects because the hide
screen has to silence it *instantly* — menu music still playing while the screen
shows lecture notes would give the game away far more surely than the board ever
did. `stopMusic(panic)` cuts in 80ms for hiding and for switching apps, versus a
350ms fade for ordinary transitions.

**Menu music** is a slow generative pad on a G minor pentatonic, scheduled with a
lookahead rather than a timer per note so it doesn't drift or stutter under load.
It runs on the start and game-over screens only, fading in 1.2s late on game over
so the closing motif lands first. A single `syncMusic()` decides whether it
should be running, so no caller has to reason about which state it came from.
The knobs are all at the top of that section: `M_STEP` for tempo, `M_RHYTHM`
for density, `M_SCALE` and `M_ROOT` for key.

**Each mode has a voice.** Selecting one answers with a motif that also sets the
key and timbre for the whole run, so modes stay distinguishable by ear while
you're playing:

| Mode | Motif | Character |
| --- | --- | --- |
| Lecture | C5 → G5, triangle | A bare rising fifth, over before you've registered it |
| Pregame | G4 → B4 → D5, sine | A warm major triad with room to breathe |
| Daily | A4 → C♯5 → E5 → A5, sine | Four bell tones climbing an octave, once a day |

Correct taps then walk up a pentatonic scale from that mode's tonic — the first
hit is the tonic itself — so a combo builds into a phrase rather than a rising
siren, in a different key per mode.

**Buttons** answer with a soft 1180Hz tick. Tiles and mode buttons are excluded
from it, since they already have their own sounds and layering the tick on top
muddied both.

## The hide screen

`hide`, the `Esc` key, or switching apps swaps the board for a plausible page of
economics notes and pauses the clock. Tap the page number at the bottom to
resume — the combo window is reset on the way back, so hiding never costs you a
streak. Because switching apps arms it automatically, returning to the tab never
puts a live board or a fresh score on screen.

## Difficulty

Three curves, all driven by level (one level per correct tap):

- **Grid** steps 2×2 → 6×6 at levels 3, 7, 13 and 21, so growth is a visible event.
- **Shade gap** decays from 22% lightness toward a 1.6% floor. The asymptote sits
  *below* the floor deliberately: the floor binds around level 40, which is what
  gives every run an end instead of an infinite plateau.
- **Combo window** tightens from 2.6s to 0.95s. Let it lapse and the multiplier
  resets, but you keep your time and lives.

Scoring rewards speed as well as accuracy: points scale with level, the combo
multiplier (up to ×7), and how much of the combo window was left when you tapped.

Simulated across skill levels, runs land around 40 seconds and end at level
29–47 — skill shows up in the score, not in how long you sit there.

## Layout

Portrait stacks vertically with the board as the hero. Landscape and other
short viewports switch to a two-column grid — instruments left, board right —
because stacked vertically the board starved down to its 140px minimum. The
board column is sized from the viewport rather than from its contents, since an
`auto` column would make the board's own `100%` circular and therefore zero.
Type scales use `vmin` rather than `vw` so nothing inflates when the viewport
turns wide and short.

The board itself is a **size container**, so the grid is simply the largest
square that fits the space actually available (`min(100cqw, 100cqh, 560px)`)
rather than the viewport minus a guess at the chrome. That guess was costing
real estate on small phones — a 320×568 handset went from a 248px board with
38px tiles to a 292px board with 45px tiles, crossing back over the 44px touch
target minimum. The old viewport arithmetic is kept above it as a fallback for
browsers without container queries. The 560px ceiling stops tablets from
getting comically large tiles.

## Mobile

Tested across a device matrix — iPhone SE through 15 Pro Max, Galaxy S8,
Pixel 7, an open Galaxy Fold, an iPad and a 320px legacy handset — in both
orientations. Every one fits with zero overflow, and every control outside the
board is at least 44px.

- **Safe areas** are honoured on all four edges. Horizontal insets matter more
  than they look: in landscape the notch sits directly beside the board.
- **`touch-action`** is set per control, not on `body` — it doesn't inherit, so
  a body-level rule left every tile at `auto` and double-tap zoom stayed live on
  the board, which is exactly where taps come fastest.
- **Long-press** over the board is suppressed, along with the iOS text callout.
- **Overscroll** is pinned so pull-to-refresh can't reload a live run, and the
  scrollable overlays contain their own bounce.
- **`100dvh` has a `100vh` fallback** for iOS 15.3 and earlier.
- **Haptics are reported honestly.** iOS Safari has no Vibration API at all, so
  rather than showing "buzz: on" and doing nothing, the toggle reads `n/a` and
  disables itself where the API is missing.
- **Performance** on a 6× CPU throttle: a full 6×6 rebuild takes 1.4ms median
  (3ms worst), frame pacing holds at 16.2ms median, and tap-to-score is 160ms.

One deliberate compromise: at 6×6 on a 320px-wide phone the tiles are 45px,
just over the minimum. Shrinking the grid on small screens would have been
easy but would break Daily — everyone has to get the same board for the score
to mean anything.

Pinch-zoom is intentionally left enabled. Blocking it would suit a game, but it
is the accessibility cost that isn't worth paying, and the layout is fluid
enough to survive it.

## Keyboard

The grid is playable without a pointer: arrow keys walk tile to tile, clamping
at the edges rather than wrapping, and Enter or Space commits. Focus is carried
across the round rebuild, so a run doesn't drop you back out of the grid every
tap. Opening the hide screen or the game-over sheet marks everything underneath
`inert` and moves focus to the control you'd want next — the resume affordance,
or Again.

## Notes on the build

- Difference between tiles is **lightness only**, never hue, so the game is
  playable with any form of colour vision deficiency.
- Silent unless you opt in. Feedback is haptic (`navigator.vibrate`, where
  supported — Android Chrome yes, iOS Safari no) and visual.
- Honours `prefers-reduced-motion`: shake and particles drop out, gameplay doesn't.
- Deliberately dark-only. A light theme would defeat the point of the hide screen —
  which is itself the one bright surface, on purpose.
- Best scores, top combo, run count, day streak, today's daily result and both
  toggles persist in `localStorage` under `sneaktap.v1`. Loading merges over
  defaults, so a save written by an earlier version still opens.
