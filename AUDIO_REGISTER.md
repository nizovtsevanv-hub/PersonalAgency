# AUDIO REGISTER — FSL-P01 “Ship or Sheep?”

Registry of all audio the module can use. The app plays a local file from
`public/audio/` when present; otherwise it falls back to `speechSynthesis`
with a preferred **en-GB** voice (a subtle notice appears in Settings, never
in the learning flow). **No synthetic audio is ever presented as
human-recorded.**

## File naming

```
public/audio/en-gb-<voice>-<key>.mp3
```

- `voice`: `f1` (female voice 1) or `m1` (male voice 1)
- `key`: word id or sentence id from `src/content/FSL-P01.json`

Recording guidance: neutral Standard Southern British (SSB/RP-adjacent),
44.1 kHz, mono, −16 LUFS approx., ~250 ms silence head/tail, no music bed.

## Words

| Word / Sentence | IPA | Expected filename(s) | Voice | Status | QA notes |
|---|---|---|---|---|---|
| ship | /ʃɪp/ | `en-gb-f1-ship.mp3`, `en-gb-m1-ship.mp3` | f1, m1 | missing → synthetic fallback | Keep /ɪ/ short and relaxed; avoid /iː/ drift |
| sheep | /ʃiːp/ | `en-gb-f1-sheep.mp3`, `en-gb-m1-sheep.mp3` | f1, m1 | missing → synthetic fallback | Clear long /iː/; no diphthongisation |
| sit | /sɪt/ | `en-gb-f1-sit.mp3`, `en-gb-m1-sit.mp3` | f1, m1 | missing → synthetic fallback | Crisp final /t/ |
| seat | /siːt/ | `en-gb-f1-seat.mp3`, `en-gb-m1-seat.mp3` | f1, m1 | missing → synthetic fallback | Audible length contrast with “sit” |
| fill | /fɪl/ | `en-gb-f1-fill.mp3`, `en-gb-m1-fill.mp3` | f1, m1 | missing → synthetic fallback | Dark /l/ acceptable (SSB) |
| feel | /fiːl/ | `en-gb-f1-feel.mp3`, `en-gb-m1-feel.mp3` | f1, m1 | missing → synthetic fallback | Watch pre-/l/ breaking; keep /iː/ clear |
| live | /lɪv/ | `en-gb-f1-live.mp3`, `en-gb-m1-live.mp3` | f1, m1 | missing → synthetic fallback | Verb reading (not adjective /laɪv/) |
| leave | /liːv/ | `en-gb-f1-leave.mp3`, `en-gb-m1-leave.mp3` | f1, m1 | missing → synthetic fallback | Full /iː/ before voiced /v/ |
| bit | /bɪt/ | `en-gb-f1-bit.mp3`, `en-gb-m1-bit.mp3` | f1, m1 | missing → synthetic fallback | Short vowel before fortis /t/ |
| beat | /biːt/ | `en-gb-f1-beat.mp3`, `en-gb-m1-beat.mp3` | f1, m1 | missing → synthetic fallback | Clipped but clearly /iː/ |

## Isolated phonemes (required for future “pure sound” playback)

The app never fakes an isolated phoneme with TTS; until these exist it plays
a clearly labelled anchor word instead.

| Item | IPA | Expected filename(s) | Voice | Status | QA notes |
|---|---|---|---|---|---|
| isolated /ɪ/ | /ɪ/ | `en-gb-f1-phoneme-ih.mp3` | f1 | missing (no fallback used) | Sustained ~600 ms, no onset glide |
| isolated /iː/ | /iː/ | `en-gb-f1-phoneme-ee.mp3` | f1 | missing (no fallback used) | Sustained ~900 ms, steady quality |

## Sentences and dialogue

| Word / Sentence | IPA | Expected filename(s) | Voice | Status | QA notes |
|---|---|---|---|---|---|
| The sheep sits on the ship. | /ðə ʃiːp sɪts ɒn ðə ʃɪp/ | `en-gb-f1-kids-story.mp3` | f1 | missing → synthetic fallback | Slow, warm story voice; slight pause after “sheep” |
| Please leave the keys on this seat. | /pliːz liːv ðə kiːz ɒn ðɪs siːt/ | `en-gb-f1-adult-key.mp3` | f1 | missing → synthetic fallback | Natural connected speech, weak forms preserved |
| Can you see the sheep on the ship? | /kən juː siː ðə ʃiːp ɒn ðə ʃɪp/ | `en-gb-f1-together-key.mp3` | f1 | missing → synthetic fallback | Friendly question intonation (rise) |
| Adult dialogue (A/B, 3 lines) | — | `en-gb-m1-adult-dialogue.mp3` | m1 | missing → synthetic fallback | Two-voice recording preferred; per-line files also acceptable |

## Status legend

- **missing → synthetic fallback** — no file yet; en-GB TTS (or another
  English voice) is used and disclosed in Settings.
- **synthetic fallback** — file intentionally deferred.
- **human verified** — recorded by a British voice artist and QA-checked
  against the IPA target by a phonetics reviewer.

Currently **all items are “missing → synthetic fallback”**. The application
is fully functional in this state.
