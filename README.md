# Kettlebell Tracker Pro

A Progressive Web App (PWA) for tracking kettlebell workouts with offline support, real-time sync, and detailed analytics.

## Features

- 📱 **Progressive Web App** - Install on any device
- 📵 **Offline Support** - Works without internet connection
- 🔄 **Automatic Sync** - Syncs when back online
- 📊 **Training Analytics** - Track progress over time
- 🏋️ **Workout Templates** - Pre-built workout programs
- 📤 **Export Data** - Download as JSON or CSV
- 🔐 **Secure** - Firebase Authentication
- 📱 **Responsive** - Works on all devices

## Tech Stack

- Vanilla JavaScript (ES6 modules)
- Firebase (Authentication, Firestore, Hosting)
- TailwindCSS (via CDN)
- Chart.js for analytics
- Service Worker for offline support
- IndexedDB for local storage

## Development

### Prerequisites

- Node.js (for Firebase CLI)
- Firebase account
- Any static file server (Python, Node.js, PHP)

### Local Development

```bash
# Clone the repository
git clone [your-repo-url]
cd KettlebellTracker

# Serve locally (choose one):
cd public && python3 -m http.server 8000
cd public && npx http-server -p 8000
cd public && php -S localhost:8000

# Or use Firebase emulators
firebase emulators:start
```

### Deployment

```bash
# Deploy to Firebase Hosting
firebase deploy

# Deploy only hosting
firebase deploy --only hosting
```

## Project Structure

```
KettlebellTracker/
├── public/                 # All app files
│   ├── index.html         # Main app
│   ├── manifest.json      # PWA manifest
│   ├── sw.js             # Service Worker
│   ├── styles.css        # Custom styles
│   ├── js/               # JavaScript modules
│   │   ├── app.js        # Main app orchestrator
│   │   ├── firebase-manager.js
│   │   ├── offline-storage.js
│   │   ├── sync-manager.js
│   │   └── ...
│   └── icons/            # App icons
├── firebase.json         # Firebase configuration
├── CLAUDE.md            # AI assistant guide
├── TESTING-GUIDE.md     # Testing instructions
└── README.md            # This file
```

## Configuration

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Anonymous & Google)
3. Enable Firestore Database
4. Update Firebase config in `index.html`

### Environment Variables

The app uses Firebase configuration directly in `index.html`. For production, consider using environment variables or a build process.

## Testing

See [TESTING-GUIDE.md](TESTING-GUIDE.md) for comprehensive testing instructions.

### Quick Test

1. Open Chrome DevTools
2. Application tab → Service Workers
3. Network tab → Toggle "Offline"
4. Create/edit workouts while offline
5. Go online and watch sync happen

## Security

- Content Security Policy headers configured
- Firebase Security Rules required (not included)
- API keys are client-side (normal for Firebase)
- No sensitive data in repository

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test offline functionality
5. Submit a pull request

## License

[Your chosen license]

## Support

For issues or questions, please open an issue on GitHub.