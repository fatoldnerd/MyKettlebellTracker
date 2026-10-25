# Kettlebell family refresh

Approved: carry the reviewed Armor Builder look and feel across Command Center, then Snatch Tracker, 10K Swing Tracker, and My Kettlebell Tracker. Reuse the existing images, especially those supplied in the Command Center repository. Accounts remain in their existing Firebase projects; no silent identity or data migration.

Design: graphite and olive surfaces, warm orange, Bebas Neue display type and IBM Plex Sans interface type. Keep active workout controls large and the phone screen free of photography. Use the existing snatch, swing, kettlebell, and get-up photography in the hub, program introduction, and contextual panels.

Command Center: image-led introduction, four clear launch choices, saved default launcher, comparison and program information. Never display fictional aggregate workout statistics or imply cross-project sync.

Snatch: custom and program-tagged sessions, explicit left/right counts, sets and rest timer, user-scoped draft recovery, history, progress, export, existing email/Google authentication.

10K: actual swing-set progression, 10/15/25/50 repeated five times for a 500-swing target, optional strength movement, timer and rest, partial-workout saving, challenge progress from actual reps, history and export.

General tracker: reusable workout templates and a configurable exercise list, explicit unilateral counting, set logging, timed formats, history, progress and export, existing Google/Firebase identity and collection paths.

## Checklist
- [x] Review approved design, source repositories, and imagery.
- [x] Implement the modern interface with existing identity and data adapters.
- [x] Run build and meaningful calculation/state checks.
- [x] Verify phone and desktop flows in the browser.
- [ ] Publish a private review version and create a draft PR.

## Release boundaries
Existing live domains remain unchanged. Signed-in Firebase behavior and physical-phone audio/wake lock require separate verification. Device preview is clearly labeled and cannot imply cloud saving. Shared identity across separate Firebase projects remains a later migration task.

## Review evidence

PASS: Verified custom setup survives entering device preview, five reps per side yields ten total reps and 160 kg with a 16 kg bell, target completion, review, device saving, history after refresh, saving/reloading a template, and EMOM waiting until the next minute. The previous /tracker/ entry redirects to the modern app. The old service worker retires only its own shell caches; local workout records are untouched.

All three trackers use the same five calculation/state tests. The shared source is copied into each repository so each app remains independently buildable; it is not a deployed shared identity service. New schema records are stored alongside legacy history using the existing user-owned collection paths.

Imagery is reused unchanged from the existing Command Center repository: KettlebellSnatch.png, KettlebellSwing.png, TurkishGetUp1.png, and New_Kettlebell.png. Typography and color tokens derive from the approved Armor Builder version. Active phone training screens hide photographs to keep controls readable.

UNVERIFIED: live Google/email authentication, signed-in Firestore read/write and cross-device synchronization, physical iOS audio/haptics/wake lock. New hostnames may need Firebase authorized-domain configuration. Existing live domains and deployed Firestore rules were not changed. Private review sites contain no seeded workout history.
