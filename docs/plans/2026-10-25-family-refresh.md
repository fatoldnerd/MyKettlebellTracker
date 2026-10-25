# Kettlebell family refresh

Approved: carry the reviewed Armor Builder look and feel across Command Center, then Snatch Tracker, 10K Swing Tracker, and My Kettlebell Tracker. Reuse the existing images, especially those supplied in the Command Center repository. Accounts remain in their existing Firebase projects; no silent identity or data migration.

Design: graphite and olive surfaces, warm orange, Bebas Neue display type and IBM Plex Sans interface type. Keep active workout controls large and the phone screen free of photography. Use the existing snatch, swing, kettlebell, and get-up photography in the hub, program introduction, and contextual panels.

Command Center: image-led introduction, four clear launch choices, saved default launcher, comparison and program information. Never display fictional aggregate workout statistics or imply cross-project sync.

Snatch: custom and program-tagged sessions, explicit left/right counts, sets and rest timer, user-scoped draft recovery, history, progress, export, existing email/Google authentication.

10K: actual swing-set progression, 10/15/25/50 repeated five times for a 500-swing target, optional strength movement, timer and rest, partial-workout saving, challenge progress from actual reps, history and export.

General tracker: reusable workout templates and a configurable exercise list, explicit unilateral counting, set logging, timed formats, history, progress and export, existing Google/Firebase identity and collection paths.

## Checklist
- [x] Review approved design, source repositories, and imagery.
- [ ] Implement the modern interface with existing identity and data adapters.
- [ ] Run build and meaningful calculation/state checks.
- [ ] Verify phone and desktop flows in the browser.
- [ ] Publish a private review version and create a draft PR.

## Release boundaries
Existing live domains remain unchanged. Signed-in Firebase behavior and physical-phone audio/wake lock require separate verification. Device preview is clearly labeled and cannot imply cloud saving. Shared identity across separate Firebase projects remains a later migration task.
