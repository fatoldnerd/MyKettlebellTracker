# Kettlebell Tracker - Offline & PWA Testing Guide

## Prerequisites
- Chrome, Edge, or another PWA-compatible browser
- Python (for local server) or any static file server

## Starting the App Locally

Choose one of these options:

### Option 1: Python 3 (macOS/Linux)
```bash
cd public
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

### Option 2: Node.js
```bash
cd public
npx http-server -p 8000
# Or: npm install -g http-server && http-server -p 8000
```

### Option 3: PHP (built into macOS)
```bash
cd public
php -S localhost:8000
```

### Option 4: Firebase CLI
```bash
# From project root (not public folder)
firebase serve --only hosting
```

### Option 5: VS Code Live Server
- Install "Live Server" extension
- Right-click on index.html → "Open with Live Server"

## Testing Checklist

### 1. PWA Installation Test
- [ ] Open the app in Chrome/Edge
- [ ] Look for install icon in address bar (or menu → "Install Kettlebell Tracker Pro")
- [ ] Click install and verify app opens in its own window
- [ ] Check that app icon appears in dock/taskbar
- [ ] Verify app can be launched from icon

### 2. Service Worker Test
1. Open Chrome DevTools (F12)
2. Go to Application tab → Service Workers
3. Verify:
   - [ ] Service worker is registered and active
   - [ ] Scope shows your domain
   - [ ] No errors in console

### 3. Offline Mode Test
1. In DevTools → Network tab
2. Check "Offline" checkbox (or turn off WiFi)
3. Test these actions:
   - [ ] Reload page - should still work
   - [ ] Navigate between views
   - [ ] View existing workouts
   - [ ] Create new workout (will save locally)
   - [ ] Delete a workout (will track deletion)

### 4. Data Sync Test
1. While offline, create 2-3 test workouts
2. Go back online (uncheck offline mode)
3. Watch for:
   - [ ] "Syncing your workouts..." notification
   - [ ] "All changes synced successfully!" message
   - [ ] Workouts appear in Firebase (check Network tab)

### 5. IndexedDB Verification
1. DevTools → Application → IndexedDB
2. Expand "KettlebellTrackerDB"
3. Check these stores:
   - [ ] `workouts` - Contains your workout data
   - [ ] `pendingChanges` - Shows pending sync operations
   - [ ] `userProfile` - Has user profile data

### 6. Cache Storage Test
1. DevTools → Application → Cache Storage
2. Verify "kettlebell-tracker-v1" cache exists
3. Check cached files include:
   - [ ] index.html
   - [ ] All JS modules
   - [ ] styles.css
   - [ ] External dependencies

## Common Issues & Solutions

### Service Worker Not Updating
- Hard refresh: Cmd/Ctrl + Shift + R
- DevTools → Application → Service Workers → "Update"
- Clear storage and re-register

### PWA Install Not Showing
- Must be served over HTTPS (localhost is exception)
- Check manifest.json is loading correctly
- Clear site data and try again

### Sync Not Working
- Check console for errors
- Verify Firebase connection when online
- Check IndexedDB for pending changes

### Testing Different Scenarios

1. **New User Offline Journey**
   - Clear all site data
   - Go offline immediately
   - Sign in anonymously
   - Create workouts
   - Go online and verify sync

2. **Intermittent Connection**
   - Toggle offline/online while using app
   - Verify no data loss
   - Check sync notifications appear

3. **Long Offline Period**
   - Create many workouts offline
   - Go online after extended period
   - Verify all data syncs correctly

## Debug Commands (Console)

```javascript
// Check offline storage status
await offlineStorage.getSyncStatus(appState.getUserId())

// Manual sync trigger
await syncManager.syncPendingChanges()

// View cached workouts
await offlineStorage.getWorkouts(appState.getUserId())

// Check service worker
navigator.serviceWorker.controller

// Force update check
registration.update()
```

## Firebase Emulator Testing

If using Firebase emulators:
```bash
firebase emulators:start
# App will auto-detect localhost and use emulators
```

## Deployment Testing

After deploying to Firebase Hosting:
1. Test PWA install from production URL
2. Verify HTTPS and manifest work correctly
3. Test offline/online on mobile devices
4. Check sync across multiple devices