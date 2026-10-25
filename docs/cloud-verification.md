# Kettlebell suite account and cloud verification — 25 October 2026

The original public website deployments have not been replaced. Firebase authorized-domain settings and two deployed Firestore rulesets were corrected during this verification.

## Confirmed findings and fixes

- All four review-site domains were missing from Firebase's authorized domains. Exact domains were added with Brad's explicit approval, preserving every previous entry. Missing Snatch apex, Swing www, and My Kettlebell www aliases were also added.
- Armor Builder's local build configuration misspelled its Firebase project ID. The app now uses the public configuration retrieved from the existing production Firebase Hosting project, `armor-building-complex`, in tracked source so future builds cannot lose it through an absent or mistyped local environment file.
- My Kettlebell Tracker's deployed rules allowed any authenticated user to access any document. Replaced with ownership checks on the existing `artifacts/my-kettlebell-app-v11-prod/users/{uid}/kettlebellWorkouts_v11` and `userProfiles/{uid}` paths. Existing document paths and formats were preserved.
- Swing's deployed rules allowed workout ownership to be changed. Update rules now require existing and requested ownership to match. Round updates also retain their original workout parent.
- All four trackers distinguish a server-confirmed history snapshot from cached history and a failed cloud connection. Armor history excludes writes that have not been acknowledged by the server. Account changes in the three shared trackers reset configuration to that account's settings or defaults.

## Evidence

- Snatch: real Firebase client SDK signup, actual adapter payload write, independent-client password sign-in and server restore, actual history query and server subscription, token refresh, sign-out/relogin, unauthorized-account read/write denial, signed-out denial. All passed; disposable documents/accounts removed.
- Swing: same client workflow passed for actual partial reps (6 swings). Initial ownership-transfer probe reproduced a failure; rule fix was tested before deployment and the client workflow was rerun afterward: all 13 checks passed, including ownership-transfer denial and fixture cleanup.
- My Kettlebell rules: 19 synthetic allow/deny cases passed against the Firebase Rules API before deployment. Includes owner read/list/create/update/delete, other-user and unauthenticated denial, profile ownership, and unrelated-path denial.
- Swing rules: 57 synthetic cases passed before deployment, including owner read/create/update/delete and cross-account/unauthenticated denial, ownership-transfer denial, and round-parent restrictions.
- Existing model tests: Armor 4/4, shared trackers 5/5.
- Exact Firebase rule sources were read before changes; pre-change rules and test harnesses are retained alongside this report. No real workout documents were used in client test fixtures.

## Pending browser verification

Google sign-in reached Google's account chooser after the authorized-domain repair. Google requested the owner's password; the popup was handed to Brad. Successful Google completion and signed-in UI cloud restore for Armor and My Kettlebell remain UNVERIFIED until that handoff completes. Do not approve replacement of the public sites on the strength of source checks or successful builds alone.

The Command Center is an account-free launcher. Each tracker retains its existing separate Firebase project and account history. Completed sessions sync within that tracker. Active drafts, preferences, and templates are explicitly device-local. Cross-app single sign-on and combined history have not been implemented.
