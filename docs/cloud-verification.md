> Production update (26 October 2026): the apps are now deployed to Firebase and the live-domain checks pass. See [firebase-production-release.md](firebase-production-release.md). The prelaunch report below is retained as historical evidence.

# Sign-in and cloud-history verification

Verified 25–26 October 2026. The original public website deployments have not been replaced, and no PR has been merged.

## Result

The four trackers pass Google sign-in, account-backed workout saving, server-confirmed restoration in an independent storage session, reload persistence, sign-out, and re-login. Command Center is an account-free launcher and does not store shared workout history.

| App | Google sign-in | Cloud save and independent restore | Reload persistence | Sign-out and re-login |
| --- | --- | --- | --- | --- |
| Armor Builder | PASS | PASS | PASS | PASS |
| Snatch Tracker | PASS | PASS | PASS | PASS |
| 10K Swing Challenge | PASS | PASS | PASS | PASS |
| My Kettlebell Tracker | PASS | PASS | PASS | PASS |

## Browser and server evidence

Real Google sign-in was completed through the hosted review apps in Chrome. A second copy of each exact production build was served at a distinct localhost origin, with separate browser storage and Firebase authentication. That independent client signed in normally and received a server-confirmed history snapshot containing the workout created through the hosted app. This verifies independent-client cloud restoration; it is not a physical-device test.

- Armor: one round with two 16 kg bells; 192 kg volume; notes and duration restored.
- Snatch: seven left and five right reps; 12 total; 192 kg volume. Both per-hand fields were independently checked in Firestore.
- Swings: six actual swings with 24 kg; 144 kg volume; `completed` remained false. The partial workout did not become 500 swings.
- My Kettlebell: five actual reps with 16 kg; 80 kg volume. Existing legacy history remained readable alongside the new record.

Each hosted app retained sign-in and its server-backed history after a full reload. Each independent client cleared visible workout rows on sign-out, remained signed out after reload, and restored the cloud connection after a fresh Google sign-in. Temporary localhost clients were signed out and their servers stopped afterward.

The tagged records were also queried directly in Firestore. All expected metrics matched. Five exact test documents, including the extra Armor connection-loss fixture, were removed with ownership/path/content guards. Every deletion was confirmed by a 404 response. The hosted history subscriptions reflected the deletion: zero remaining test rows in Armor, Snatch, and Swing; the existing legacy workout remained in My Kettlebell Tracker. No user accounts or real workouts were removed.

Local screenshots and machine-readable checks are retained in the originating verification workspace.

## Fixes already applied

- Authorized the exact four review domains and missing public-domain aliases in Firebase with Brad's explicit approval, preserving existing authorized domains.
- Corrected Armor's Firebase project ID to `armor-building-complex` using tracked public web configuration from the existing production Firebase Hosting project.
- Replaced My Kettlebell Tracker's any-authenticated-user database access with owner-only access on its existing workout and profile paths.
- Prevented Swing workout ownership changes and round-parent reassignment.
- Added honest server/cache/error history status, excluded unacknowledged Armor writes from cloud history, and reset account-specific settings correctly when switching accounts.

Snatch previously passed real client-SDK signup/login, adapter writes, independent server reads/queries/subscriptions, token refresh, signed-out/cross-user denial, and disposable-fixture cleanup. Swing passed all 13 corresponding checks after the ownership fix. My Kettlebell's 19 ownership-rule cases and Swing's 57 cases passed before deployment. The deployed My Kettlebell and Swing rules were read again on 26 October and exactly match the tested source files.

## Scope and remaining limits

- Completed workouts sync within each tracker's existing Firebase project. Each tracker retains its own account history; cross-app single sign-on and combined history have not been implemented.
- Active drafts, preferences, and templates are device-local by design. Device-preview sessions do not automatically become cloud sessions.
- The optional offline-save/reconnect UI test is UNVERIFIED. Scoped browser network emulation did not produce a disconnected Firebase save. The extra workout saved normally and was removed; network emulation was reset. No offline retry or duplicate-prevention pass is claimed.
- Physical phones, Safari, and behavior after replacing the public-domain deployments were not tested in this run. The embedded preview browser did not open the Google popup; the completed browser tests used Chrome.

## Tested application source

The tests used these deployed review build revisions, before this report-only update:

- Command Center: `3ede64cc0b32eabf29ad37f4a872570459285f17`
- Armor: `32a128e5089419b8d0b160407394c2bd9c045863`
- Snatch: `c2f1ba1748cb3132ef964242864753e3f5196d98`
- Swings: `0c4e03a001ec5d2ad0cd27905183c9d52c052730`
- My Kettlebell: `969a180fe9227c84e5b2ba0c883a4e53dcbe2651`
