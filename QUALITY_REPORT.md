# QUALITY REPORT — FLUFFY SOUND LAB FSL-P01 “Ship or Sheep?”

Date: 2026-07-14 · Build target: GitHub Pages (static, `base: "./"`)

## Implemented screens (11 of 11)

1. **ModeSelection** — “Who is learning today?”, three mode cards (Kids Lab /
   Grown-ups Lab / Together Mode), selection enables Start, no route is
   described as easy/difficult, “Continue where I was” when progress exists.
2. **Diagnostic** — 4 unscored baseline listening items (ship/sheep,
   sit/seat), randomised answer position, IPA hidden until the answer,
   baseline stored locally, no “failed” state.
3. **VisualHook** — original ship ↔ sheep layered crossfade with motion,
   Hear /ɪ/, Hear /iː/, Compare, Continue; cards revealed after listening.
4. **EarLab** — cyan /ɪ/ (short wave) and emerald /iː/ (long wave) zones, six
   randomised cards, tap-select/tap-destination (no drag required), keyboard
   accessible, “Show me the difference” after two consecutive errors with
   resume at the same card.
5. **MouthLabScreen** — original animated SVG articulation schematics
   (labelled as educational schematics); kids see only simple cues; adults
   additionally get close/near-close, front/near-front, quality + duration
   and an interactive vowel chart; optional Mirror Mode
   (`getUserMedia({ video: { facingMode: "user" }, audio: false })`) with an
   on-device privacy notice and track shutdown on close/unmount.
6. **IpaTrace** — “Sound badges” (kids) / “British IPA symbols” (adults);
   tap plays a clearly labelled anchor word (no fake isolated phonemes);
   functional Pointer Events trace canvas with reset; symbol→word matching.
7. **SpellingBridge** — visible chain sound → spelling → word → picture;
   tile sorting (i → /ɪ/; ee, ea → /iː/) then word building with vowel gaps;
   explicit letter-name vs sound note.
8. **SpeakReplay** — real local MediaRecorder recording (MIME detected from
   MP4/AAC and WebM/Opus candidates), listen → mouth cue → record → replay →
   compare → repeat; object URLs revoked on replace/unmount; non-blocking
   listen-and-repeat route when the microphone is denied/unsupported; three
   self-check statements; no automatic pronunciation score.
9. **SpeechTransfer** — kids: original story scene with word-by-word
   highlighting; adults: role A/B dialogue with playable partner lines and
   turn marking; together: alternating Adult’s/Child’s turns with Fluffy
   moving to the active side.
10. **SoundBoss** — four stages Hear → Match → Build → Speak, final task
    “Put the sheep on the right ship.”, restrained gold completion tied to
    completed learning actions.
11. **Passport** — sound map with /ɪ/ ↔ /iː/ unlockable and future sounds
    marked “Coming next”; separate statuses for Listening / IPA / Words /
    Speaking / Sentence; Practise again / Play Together / Print summary /
    Next Sound (disabled); print-specific CSS.

## Build result

- `tsc -b` — passes, no errors.
- `oxlint` — passes, no warnings.
- `npm run build` (Vite 8 production) — succeeds:
  `dist/assets/index-*.js ≈ 296 kB (gzip ≈ 90 kB)`, CSS ≈ 27 kB.
- `npm run preview` serves the built app; landing screen loads (HTTP 200).

## Automated browser verification (what was actually tested)

Playwright drove the **production build** end-to-end.

**Chromium (headless Chrome 390×844, mobile emulation, fake mic/camera):
67/67 checks passed, zero page errors.** Highlights:

- full Kids Lab walkthrough across all 11 screens in order;
- Start disabled until a mode is selected;
- diagnostic hides IPA before the answer and reveals it after;
- vocabulary card order verified as word → IPA → Russian (`ship / /ʃɪp/ / корабль`);
- EarLab: two deliberate consecutive errors trigger “Show me the difference”,
  and the learner resumes at the same card;
- Mirror Mode: privacy notice before camera, live preview with a fake
  device, and **all camera tracks verified `readyState === "ended"` after
  closing** (via an instrumented `getUserMedia`);
- tracing both symbols on the canvas registers completion; reset works;
- spelling: all tiles sorted and all six kids words built;
- recording: a real take was produced, replayed and compared (model → me);
- SoundBoss: all four stages completed; final task text verified;
- Passport: all five skill statuses; no “Failed” anywhere in the app text;
  “Next Sound” present but disabled;
- progress resumes on the same screen after reload;
- corrupted localStorage (`{corrupted!!!`) safely resets to ModeSelection;
- Grown-ups mode: vowel chart + articulation detail, role dialogue with
  turn passing, adult extension (5 pairs), warning pair hidden until the
  explicit adult gate is enabled in Settings;
- Together mode: Adult’s/Child’s turn alternation and Fluffy side movement;
- Quiet Mode and Russian-support toggles apply; reset requires confirmation;
- print emulation: header/coach/action bar hidden, Parent/Teacher summary
  visible.

**WebKit (Playwright iPhone 14 profile): 7/7 checks passed, zero page
errors** — landing, no horizontal overflow, diagnostic flow, pointer
tracing, reload persistence. In this Linux WebKit build `MediaRecorder` is
unavailable: the app correctly showed the **non-blocking self-repeat route**
and allowed completion.

**Permission-denied simulation (Chromium):** `getUserMedia` forced to throw
`NotAllowedError` — microphone denial shows the supportive fallback and the
lesson stays completable; camera denial shows a friendly message and the
mouth diagram remains available.

## Responsive checks

`document.scrollWidth <= innerWidth` verified (no horizontal overflow) at:
**320×568, 375×667, 390×844, 430×932, 768×1024, 1440×900.**
Safe-area insets applied via `env(safe-area-inset-*)` with
`viewport-fit=cover`; layout uses `100dvh`; bottom action bar padded by the
safe-area inset. Desktop uses a centred stage (max ~1000 px) with the coach
beside the task.

## Accessibility checks

- Semantic buttons/headings throughout; tabs/radios use ARIA roles.
- Visible `:focus-visible` outline on all interactive elements.
- All actions keyboard reachable (tap-based interactions, no drag anywhere).
- ARIA labels on icon-only controls (back, settings, close, speaker, zones).
- Feedback is icon + text, never colour-only; retry uses supportive magenta,
  never red; a child never sees “Failed”.
- Captions/text equivalents: every playable item shows its word/sentence,
  IPA and Russian text on screen.
- `prefers-reduced-motion` respected (animations collapse to state changes);
  additional Quiet Mode setting; Russian support toggle; skip link.
- Touch targets ≥ 48 px (56 px primary buttons).
- Text scales with system font size (rem-based sizing).

## Media permission behaviour

| Scenario | Behaviour (tested) |
|---|---|
| Mic granted | Local-only recording, replay, compare; nothing uploaded/stored |
| Mic denied | Supportive message + listen-and-repeat route; completion possible |
| MediaRecorder unsupported | Same self-repeat route (verified in WebKit) |
| Camera granted | Local mirror preview, `playsInline`, tracks stopped on close (verified) |
| Camera denied/unsupported | Friendly message; mouth diagram remains available |
| Local audio files missing | Automatic en-GB TTS fallback; app fully functional |
| speechSynthesis silent/missing | Watchdog prevents hangs; text remains; self-practice possible |
| localStorage unavailable | Session-memory fallback in `progressService` |
| Corrupted stored progress | Safe reset to ModeSelection (tested) |

## Known limitations (honest)

- **No human-recorded audio yet** — all playback is currently synthetic
  en-GB TTS (declared in Settings and `AUDIO_REGISTER.md`). TTS quality and
  the /ɪ/–/iː/ contrast depend on the device’s installed voices.
- **Word-by-word highlighting** uses `SpeechSynthesisUtterance.onboundary`
  when the engine emits it (Chrome/Edge, most desktop Safari); otherwise an
  estimated timer runs. In the headless test environment no voices were
  installed, so playback resolved instantly and highlighting could not be
  observed end-to-end; the boundary and timer code paths are both
  implemented and unit-verifiable in a voiced browser.
- **Real iPhone hardware was not available** in this environment; iOS
  behaviour was approximated with Playwright WebKit + mobile viewports.
  Audio unlock on first gesture, `playsInline`, MP4/AAC recorder preference
  and safe-area handling are implemented but should get one on-device pass.
- Isolated-phoneme playback intentionally substitutes a labelled anchor word
  until human recordings exist (by design, per spec).
- The `warning pair` gate is a settings toggle, not an age-verification
  system (out of scope for a no-backend pilot).

## Exact next steps

1. Record and drop in the human British audio files listed in
   `AUDIO_REGISTER.md` (no code changes needed).
2. One manual QA pass on physical iPhone Safari (audio unlock, recording,
   mirror, safe areas) and on one Android Chrome device.
3. Enable GitHub Pages via the Actions workflow in `README_RU.md`.
4. Author the next sound block (`FSL-P02`) as a new content JSON + passport
   node, following the “next Sound Block” guide in `README_RU.md`.
