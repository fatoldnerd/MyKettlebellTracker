# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a Firebase-hosted vanilla JavaScript application with no build process. To develop:

1. **Local Development**: Use any static file server
   ```bash
   # Python 3 (macOS/Linux)
   cd public && python3 -m http.server 8000
   
   # Node.js
   cd public && npx http-server -p 8000
   
   # PHP (built into macOS)
   cd public && php -S localhost:8000
   
   # VS Code: Install "Live Server" extension
   ```

2. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

3. **Firebase Emulators** (if configured):
   ```bash
   firebase emulators:start
   ```

## Architecture Overview

### Tech Stack
- **Frontend**: Vanilla JavaScript ES6 modules, TailwindCSS (CDN), Chart.js
- **Backend**: Firebase (Authentication, Firestore)
- **Hosting**: Firebase Hosting
- **Audio**: Tone.js for timer sounds
- **UI Components**: SlimSelect for enhanced dropdowns

### Module Structure

The application uses ES6 modules with a clear separation of concerns:

- **app.js**: Main application orchestrator that initializes all modules
- **state-manager.js**: Centralized state management with pub/sub pattern
- **firebase-manager.js**: Firebase operations (auth, Firestore CRUD)
- **ui-manager.js**: DOM manipulation and UI updates
- **workout-manager.js**: Workout logic, validation, calculations
- **auth-manager.js**: Authentication flow and user management
- **error-handler.js**: Centralized error handling and user notifications
- **training-insights.js**: Analytics and progress tracking
- **workout-template.js**: Predefined workout templates
- **data-export.js**: Export functionality (JSON/CSV)
- **workout-sharing.js**: Share workouts between users
- **notifications.js**: Web notifications for timer events

### Key Patterns

1. **State Management**: Uses a centralized state with subscribers pattern. All state changes go through `appState.setState()`

2. **Error Handling**: All errors should be caught and passed to `errorHandler.handleError()`

3. **Firebase Integration**: All Firebase operations go through `firebaseManager` module

4. **UI Updates**: UI changes triggered by state subscriptions, not direct manipulation

## Important Development Notes

1. **Firebase Config**: The Firebase configuration is hardcoded in index.html. Check `public/Firebase_config.txt` for alternate configurations.

2. **No Build Process**: This is a pure client-side app - no webpack, no npm. All dependencies loaded via CDN.

3. **Authentication**: Supports anonymous auth and Google Sign-In. User data is stored per authenticated user.

4. **Data Structure**: Workouts stored in Firestore with user-specific collections (`users/{userId}/workouts`)

5. **Timer Feature**: Uses Web Audio API (Tone.js) for countdown sounds and notifications

## Working Guidelines

When making changes:
1. Follow the existing modular pattern - each module handles one concern
2. Use the state manager for any data that affects the UI
3. Ensure all async operations have proper error handling
4. Test with both authenticated and anonymous users
5. Keep UI updates reactive to state changes rather than imperative

## Previous Instructions

The following instructions were in the previous claude.md file:

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan
4. Then, begin working on the todo items, marking them as complete as you go
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY