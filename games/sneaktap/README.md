# SNEAKTAP

A silent, one-thumbed odd-one-out game sized for the gaps in a teaching day.
One tile in the grid is a slightly different shade — tap it before the clock
runs out. The grid grows, the shade gap narrows, and the whole thing disguises
itself as a page of lecture notes in one tap.

Self-contained: a single HTML file, no build step, no dependencies, no network
calls. It is completely separate from the app in this repo — nothing imports it
and it imports nothing.

## Play it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server --directory games/sneaktap 8080   # then visit localhost:8080
```

For phone play, the file works offline once loaded — "Add to Home Screen" gives
you a launcher with no address bar.

## Modes

| Mode | Shape | For |
| --- | --- | --- |
| **Lecture** | 30 seconds on the clock; correct taps add 0.45s, misses cost 2.5s | Playing under a desk |
| **Pregame** | No clock, three misses | The ten minutes before it starts |

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

## Notes on the build

- Difference between tiles is **lightness only**, never hue, so the game is
  playable with any form of colour vision deficiency.
- No audio at all. Feedback is haptic (`navigator.vibrate`, where supported —
  Android Chrome yes, iOS Safari no) and visual.
- Honours `prefers-reduced-motion`: shake and particles drop out, gameplay doesn't.
- Deliberately dark-only. A light theme would defeat the point of the hide screen —
  which is itself the one bright surface, on purpose.
- Best scores, top combo, run count and day streak persist in `localStorage`
  under `sneaktap.v1`.
