# Firebase production release — 26 October 2026

All five existing Firebase Hosting sites are live with the rebuilt applications. The code was integrated and pushed directly to each repository's default branch using Git; no PR merge operation was used. Hosting-only deployments preserved the already validated Firestore rules and user data.

| App | Live URL | Default branch | Tested application commit | Firebase live version |
| --- | --- | --- | --- | --- |
| Command Center | https://kettlebellcommandcenter.com/ | `main` | `17c71d9bcf5a5457aa5a92f86ed7da20f46f57c3` | `sites/kettlebell-command-center/versions/a14d07c644b2d6f0` |
| Armor Builder | https://armor-building-complex.web.app/ | `master` | `780e8e458e487aac5d7ffe5517a96cf7cd8c315c` | `sites/armor-building-complex/versions/0f19ec3019928ed2` |
| Snatch Tracker | https://www.kettlebellsnatchtracker.com/ | `main` | `5b36130e0fd7bcb514267d24047efbf7c7084320` | `sites/kettlebell-snatch-tracker/versions/62b3dd96c2f5ab50` |
| 10K Swing Challenge | https://www.10kswingchallenge.com/ | `main` | `681dbf7845c2ea7d29213049b5178b0f6061987f` | `sites/k-swing-challenge-tracker/versions/ae5a3db5e558441b` |
| My Kettlebell Tracker | https://www.mykettlebelltracker.com/ | `main` | `9bd12b46b4a763d8c926a2dff575cbf878ac2ae0` | `sites/my-kettlebell-tracker/versions/4d84acb401dd618d` |

## Completed production checks

- All five public domains returned HTTP 200 and exact copies of the local release HTML. All referenced JavaScript assets loaded, the shared black kettlebell favicons matched, and no private review-site URLs remained in application scripts.
- Command Center launchers point to the four public production addresses; tracker return links point to the public Command Center.
- All four trackers completed Google sign-in on their production domains and received a server-confirmed cloud-history snapshot.
- A tagged workout was saved through each production UI, restored after a full reload, and independently checked in Firestore: Armor one double-16 kg round / 192 kg; Snatch 7 left + 5 right / 192 kg; Swing 6 actual swings / 144 kg with incomplete status; My Kettlebell 5 reps / 80 kg.
- All four exact tagged production test documents were removed with owner/path/content guards and confirmed absent. Live subscriptions reflected cleanup; existing legacy history remained in My Kettlebell Tracker.
- Swing's exported `/history/` route and My Kettlebell's legacy `/tracker/` route returned HTTP 200. The retired worker script is served without caching.
- All production builds passed; Armor's four model tests and the shared tracker's five model tests passed. Next.js export/type checking passed.

## Production migration fixes

- Replaced private review links with production addresses throughout the active applications.
- Configured Swing as Firebase static Hosting from `out`, with tracked public Firebase web configuration so deployment no longer depends on the old ignored local environment file.
- Added explicit Firebase project IDs to deployment scripts. Snatch's default project mapping is included in its source checkout.
- Corrected account classification so cached anonymous/guest Firebase sessions do not appear as registered cloud accounts. The returning guest scenario was reproduced on the live My Kettlebell domain; the fixed app prompts for Google sign-in and then restores the registered account's legacy history.
- With the owner's explicit approval, allowed the Firebase Auth SDK's required `https://apis.google.com` script host in My Kettlebell's Content Security Policy. The browser's original CSP refusal was captured and Google sign-in passed afterward.
- Revalidated My Kettlebell's app shell and retired worker caching so returning users receive the corrected authentication policy.

## Operations and remaining limits

- The previous Firebase release versions are preserved locally in `verification/firebase-hosting-before.json`; current versions are in `verification/firebase-hosting-after.json`. Keep those records for rollback.
- HTTP results are in `verification/production-http-results.json`. Guarded data validation and cleanup results are in `verification/production-fixture-validation.json` and `verification/production-fixture-cleanup.json`. Production browser screenshots are retained in the same local verification directory.
- The canonical local Armor GitHub checkout is `armor-building-complex/`, with the application in its `armor-builder/` subdirectory. `existing-armor/` is the earlier review-source mirror, not the production GitHub checkout.
- Browser verification used desktop Chrome. Physical phones, Safari, and offline/reconnection behavior remain unverified.
- Each tracker retains its existing separate Firebase project and history. Active drafts, preferences, and templates remain device-local; the hub remains account-free.
- Documentation and ignored-cache cleanup commits may follow the tested application revisions above without changing their deployed assets.
