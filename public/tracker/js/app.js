// Main App Module - Complete Integration
// Orchestrates all modules for full functionality

import { appState } from './state-manager.js';
import { errorHandler } from './error-handler.js';
import { trainingInsights } from './training-insights.js';
import { firebaseManager } from './firebase-manager.js';
import { workoutManager } from './workout-manager.js';
import { uiManager } from './ui-manager.js';
import { WorkoutTemplates } from './workout-template.js';
import { DataExporter } from './data-export.js';
import { workoutSharing } from './workout-sharing.js';
import { offlineStorage } from './offline-storage.js';
import { syncManager } from './sync-manager.js';
import { offlineUI } from './offline-ui.js';

export class KettlebellTrackerApp {
    constructor() {
        this.initialized = false;
        this.modules = {
            state: appState,
            errors: errorHandler,
            insights: trainingInsights,
            firebase: firebaseManager,
            workouts: workoutManager,
            ui: uiManager,
            workoutTemplates: new WorkoutTemplates(),
            dataExporter: new DataExporter(),
            workoutSharing: workoutSharing
        };
        
        console.log('🚀 Kettlebell Tracker App initializing...');
        console.log('🔧 Modules created successfully');
    }

    // Initialize the entire application
    async initialize() {
        try {
            console.log('📱 Starting complete app initialization...');
            
            // 1. Setup error handling first
            this.setupErrorHandling();
            
            // 2. Initialize DOM references
            uiManager.initializeDOMReferences();
            
            // 3. Initialize offline UI
            offlineUI.initialize();
            console.log('📱 Offline UI initialized');
            
            // 4. Setup event listeners
            this.setupEventListeners();
            
            // 5. Setup state subscriptions
            this.setupStateSubscriptions();
            
            // 6. Initialize Firebase
            await this.initializeFirebase();
            
            // 7. Initialize offline storage
            await offlineStorage.initialize();
            console.log('🗄️ Offline storage initialized');
            
            // 8. Initialize sync manager
            syncManager.initialize();
            console.log('🔄 Sync manager initialized');
            
            // 9. Initialize form components
            this.initializeFormComponents();
            
            // 10. Set initial state
            this.setInitialState();
            
            // 11. Mark as initialized
            this.initialized = true;
            
            console.log('✅ Complete app initialization successful!');
            
            // 12. Initial render
            this.render();
            
            // Make app available globally for templates
            window.kettlebellApp = this;
            console.log('🎯 App instance available globally');

            // Setup template event listeners now that app is available globally
            uiManager.setupTemplateEventListeners();
            console.log('🎯 Template event listeners configured');

            // Setup export button listeners
            setTimeout(() => {
                const exportBtn = document.getElementById('exportDataBtn');
                const csvBtn = document.getElementById('exportCSVBtn');
                
                if (exportBtn) {
                    exportBtn.addEventListener('click', async () => {
                        const module = await import('./data-export.js');
                        const exporter = new module.DataExporter();
                        exporter.exportAsJSON();
                    });
                    console.log('📦 JSON export button configured');
                }
                
                if (csvBtn) {
                    csvBtn.addEventListener('click', async () => {
                        const module = await import('./data-export.js');
                        const exporter = new module.DataExporter();
                        exporter.exportAsCSV();
                    });
                    console.log('📈 CSV export button configured');
                }
            }, 1000);
            
        } catch (error) {
            errorHandler.handleError(error, 'App Initialization Error');
            console.error('❌ App initialization failed:', error);
            uiManager.showNotification('App initialization failed. Please refresh the page.', 'error');
        }
    }

    // Setup enhanced error handling
    setupErrorHandling() {
        errorHandler.addErrorListener((error) => {
            console.log('📊 Error logged:', error.type);
            
            // Show user-friendly error messages for critical errors
            if (error.type === 'Firebase Initialization Error') {
                uiManager.showNotification('Connection error. Please check your internet connection.', 'error');
            }
        });
        
        console.log('🛡️ Error handling configured');
    }

    // Initialize Firebase
    async initializeFirebase() {
        try {
            console.log('🔥 Initializing Firebase...');
            await firebaseManager.initialize();
            console.log('✅ Firebase initialized successfully');
        } catch (error) {
            errorHandler.handleError(error, 'Firebase Setup Error');
            console.warn('⚠️ Firebase initialization failed, running in demo mode');
            
            // Load demo data as fallback
            await this.loadDemoData();
        }
    }

    // Load demo data as fallback
    async loadDemoData() {
        const demoWorkouts = [
            {
                id: 'demo-1',
                date: new Date().toISOString().split('T')[0],
                name: 'Morning Session',
                format: 'single',
                totalVolume: 1200,
                calculatedTotalReps: 150,
                exercises: [{
                    name: 'Kettlebell Swings',
                    weight: 16,
                    reps: 15,
                    sets: 10,
                    notes: 'Felt strong today'
                }],
                details: {},
                notes: 'Good morning workout',
                timeCompletedSeconds: 1800
            },
            {
                id: 'demo-2',
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                name: 'Evening Strength',
                format: 'single',
                totalVolume: 1500,
                calculatedTotalReps: 200,
                exercises: [{
                    name: 'Turkish Get-ups',
                    weight: 20,
                    reps: 5,
                    sets: 8,
                    notes: 'Focus on form'
                }],
                details: {},
                notes: 'Evening session',
                timeCompletedSeconds: 2100
            },
            {
                id: 'demo-3',
                date: new Date(Date.now() - 2*86400000).toISOString().split('T')[0],
                name: 'Quick Session',
                format: 'amrap',
                totalVolume: 900,
                calculatedTotalReps: 120,
                exercises: [{
                    name: 'Kettlebell Snatches',
                    weight: 12,
                    reps: 10,
                    notes: 'Each arm'
                }],
                details: { durationMinutes: 15, roundsCompleted: '12 rounds' },
                notes: 'Short but intense',
                timeCompletedSeconds: 900
            }
        ];
        
        appState.setWorkouts(demoWorkouts);
        console.log('📊 Demo data loaded');
    }

    // Setup all event listeners
    setupEventListeners() {
        const dom = uiManager.dom;
        
        // Navigation
        if (dom.getStartedButton) {
            dom.getStartedButton.addEventListener('click', () => uiManager.showApp());
        }
        
        if (dom.backToHomeButton) {
            dom.backToHomeButton.addEventListener('click', () => uiManager.showLandingPage());
        }
        
        // View toggles
        if (dom.viewToggleButtons) {
            dom.viewToggleButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const view = button.dataset.view;
                    uiManager.switchView(view);
                });
            });
        }
        
        // Authentication
        if (dom.signInWithGoogleButton) {
            dom.signInWithGoogleButton.addEventListener('click', async () => {
                try {
                    await firebaseManager.signInWithGoogle();
                } catch (error) {
                    uiManager.showNotification('Sign-in failed. Please try again.', 'error');
                }
            });
        }
        
        if (dom.signOutButton) {
            dom.signOutButton.addEventListener('click', async () => {
                try {
                    await firebaseManager.signOutUser();
                } catch (error) {
                    uiManager.showNotification('Sign-out failed. Please try again.', 'error');
                }
            });
        }
        
        // Workout form
        if (dom.workoutForm) {
            dom.workoutForm.addEventListener('submit', (e) => this.handleWorkoutSubmit(e));
        }
        
        // Workout format change
        if (dom.workoutFormatSelect) {
            dom.workoutFormatSelect.addEventListener('change', () => this.updateDynamicFields());
        }
        
        // Workouts list (for delete and share buttons)
        if (dom.workoutsList) {
            dom.workoutsList.addEventListener('click', (e) => {
                if (e.target && e.target.closest('.delete-workout-btn')) {
                    const workoutId = e.target.closest('.delete-workout-btn').getAttribute('data-id');
                    this.handleWorkoutDelete(workoutId);
                }
                
                if (e.target && e.target.closest('.share-workout-btn')) {
                    const shareBtn = e.target.closest('.share-workout-btn');
                    const workoutData = JSON.parse(shareBtn.getAttribute('data-workout'));
                    this.handleShareWorkout(workoutData);
                }
            });
        }
        
        // Filter changes
        if (dom.yearFilterSelect) {
            dom.yearFilterSelect.addEventListener('change', () => uiManager.updateProgressView());
        }
        
        if (dom.monthFilterSelect) {
            dom.monthFilterSelect.addEventListener('change', () => uiManager.updateProgressView());
        }
        
        // Timer controls
        this.setupTimerEventListeners();
        
        // Setup share modal listeners after a delay to ensure HTML is loaded
        setTimeout(() => {
            this.setupShareModalEventListeners();
        }, 1000);
        
        console.log('👂 All event listeners configured');
    }

    // Setup timer event listeners
    setupTimerEventListeners() {
        const dom = uiManager.dom;
        
        if (dom.openTimerButton) {
            dom.openTimerButton.addEventListener('click', () => {
                if (dom.timerModal) dom.timerModal.classList.remove('hidden');
            });
        }
        
        if (dom.closeTimerButton) {
            dom.closeTimerButton.addEventListener('click', () => {
                if (dom.timerModal) dom.timerModal.classList.add('hidden');
            });
        }
        
        // Timer functionality would be implemented here
        console.log('⏱️ Timer event listeners configured');
    }

    // Setup share modal event listeners
    setupShareModalEventListeners() {
        // Close modal button
        const closeShareModalBtn = document.getElementById('closeShareModal');
        if (closeShareModalBtn) {
            closeShareModalBtn.addEventListener('click', () => {
                const modal = document.getElementById('shareModal');
                if (modal) modal.classList.add('hidden');
            });
        }

        // Share via Web Share API button
        const shareViaWebShareBtn = document.getElementById('shareViaWebShare');
        if (shareViaWebShareBtn) {
            shareViaWebShareBtn.addEventListener('click', async () => {
                if (this.currentWorkoutToShare) {
                    const result = await this.modules.workoutSharing.shareWorkout(this.currentWorkoutToShare);
                    if (result.success) {
                        const message = result.method === 'clipboard' 
                            ? 'Workout copied to clipboard!' 
                            : 'Workout shared successfully!';
                        uiManager.showNotification(message, 'success');
                        document.getElementById('shareModal').classList.add('hidden');
                    }
                }
            });
        }

        // Copy to clipboard button
        const copyToClipboardBtn = document.getElementById('copyToClipboard');
        if (copyToClipboardBtn) {
            copyToClipboardBtn.addEventListener('click', async () => {
                if (this.currentWorkoutToShare) {
                    const shareData = this.modules.workoutSharing.formatWorkoutForSharing(this.currentWorkoutToShare);
                    const result = await this.modules.workoutSharing.copyToClipboard(shareData);
                    if (result.success) {
                        uiManager.showNotification('Workout copied to clipboard!', 'success');
                        document.getElementById('shareModal').classList.add('hidden');
                    }
                }
            });
        }

        // Share weekly summary button
        const shareWeeklySummaryBtn = document.getElementById('shareWeeklySummary');
        if (shareWeeklySummaryBtn) {
            shareWeeklySummaryBtn.addEventListener('click', async () => {
                const workouts = appState.getWorkouts();
                const result = await this.modules.workoutSharing.shareWeeklySummary(workouts);
                if (result.success) {
                    const message = result.method === 'clipboard' 
                        ? 'Weekly summary copied to clipboard!' 
                        : 'Weekly summary shared successfully!';
                    uiManager.showNotification(message, 'success');
                    document.getElementById('shareModal').classList.add('hidden');
                } else if (result.error) {
                    uiManager.showNotification(result.error, 'warning');
                }
            });
        }
        
        console.log('📤 Share modal event listeners configured');
    }

    // Setup state change subscriptions
    setupStateSubscriptions() {
        // Subscribe to workout data changes
        appState.subscribe('workouts', (newWorkouts) => {
            this.handleWorkoutsUpdate(newWorkouts);
        });
        
        // Subscribe to view changes
        appState.subscribe('currentView', (newView) => {
            uiManager.updateViewDisplay(newView);
        });
        
        // Subscribe to loading state
        appState.subscribe('isLoading', (isLoading) => {
            uiManager.setLoading(isLoading);
        });
        
        // Subscribe to user changes
        appState.subscribe('user', (user) => {
            uiManager.updateAuthUI(user);
        });
        
        console.log('📡 State subscriptions configured');
    }

    // Initialize form components
    initializeFormComponents() {
        // Set today's date as default
        if (uiManager.dom.workoutDateInput) {
            uiManager.dom.workoutDateInput.valueAsDate = new Date();
        }
        
        // Initialize dynamic fields
        this.updateDynamicFields();
        
        console.log('📝 Form components initialized');
    }

    // Set initial application state
    setInitialState() {
        appState.setState({
            currentView: 'formView',
            isLoading: false
        });
        
        // Update auth status
        uiManager.updateAuthStatus('Ready');
    }

    // Handle workouts data update
    handleWorkoutsUpdate(workouts) {
        console.log(`📈 Workouts updated: ${workouts.length} sessions`);
        
        // Update UI
        uiManager.renderWorkouts(workouts);
        
        // Update insights if on progress view
        if (appState.getCurrentView() === 'progressView') {
            uiManager.updateProgressView();
        }
    }

    // Handle workout form submission
    async handleWorkoutSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            // Collect form data
            const formData = this.collectWorkoutFormData();
            alert('FormData: ' + JSON.stringify(formData));
            console.log('Form data before createWorkoutFromForm:', formData);
            // Create workout data
            const workoutData = workoutManager.createWorkoutFromForm(formData);
            
            // Add workout
            await workoutManager.addWorkout(workoutData);
            
            // Success feedback
            uiManager.showNotification('Workout logged successfully!', 'success');
            
            // Reset form
            this.resetWorkoutForm();
            
            // Switch to progress view to see the new workout
            uiManager.switchView('progressView');
            
        } catch (error) {
            console.error('Workout submission error:', error);
            uiManager.showNotification(error.message || 'Failed to log workout. Please try again.', 'error');
        }
    }

    // Collect data from workout form
    collectWorkoutFormData() {
        const dom = uiManager.dom;
        const format = dom.workoutFormatSelect?.value;
        let formData = {
            date: dom.workoutDateInput?.value,
            name: dom.overallWorkoutNameInput?.value,
            timeCompleted: dom.timeCompletedInput?.value,
            format,
            notes: document.getElementById('overallNotes')?.value,
        };

        if (format === 'single') {
            formData.singleExercise = {
                name: document.getElementById('singleExerciseName')?.value,
                weight: document.getElementById('singleWeight')?.value,
                reps: document.getElementById('singleReps')?.value,
                sets: document.getElementById('singleSets')?.value,
                targetReps: document.getElementById('singleTargetReps')?.value,
                notes: document.getElementById('singleNotes')?.value,
            };
            if (!formData.singleExercise.name || formData.singleExercise.weight === undefined || formData.singleExercise.reps === undefined) {
                console.warn('Single exercise fields missing:', formData.singleExercise);
            }
        } else if (format === 'superset') {
            formData.supersetRounds = document.getElementById('supersetRounds')?.value;
            formData.supersetExercises = [
                {
                    name: document.getElementById('supersetEx1Name')?.value,
                    weight: document.getElementById('supersetEx1Weight')?.value,
                    reps: document.getElementById('supersetEx1Reps')?.value,
                    notes: '',
                },
                {
                    name: document.getElementById('supersetEx2Name')?.value,
                    weight: document.getElementById('supersetEx2Weight')?.value,
                    reps: document.getElementById('supersetEx2Reps')?.value,
                    notes: '',
                }
            ];
            formData.supersetExercises.forEach((ex, i) => {
                if (!ex.name || ex.weight === undefined || ex.reps === undefined) {
                    console.warn(`Superset exercise ${i+1} fields missing:`, ex);
                }
            });
        } else if (format === 'amrap') {
            formData.amrapDuration = document.getElementById('amrapDuration')?.value;
            formData.amrapRoundsCompleted = document.getElementById('amrapRoundsCompleted')?.value;
            formData.amrapExercises = [
                {
                    name: document.getElementById('amrapExName')?.value,
                    weight: document.getElementById('amrapExWeight')?.value,
                    reps: document.getElementById('amrapExReps')?.value,
                    notes: '',
                }
            ];
            formData.amrapExercises.forEach((ex, i) => {
                if (!ex.name || ex.weight === undefined || ex.reps === undefined) {
                    console.warn(`AMRAP exercise ${i+1} fields missing:`, ex);
                }
            });
        } else if (format === 'emom') {
            formData.emomDuration = document.getElementById('emomDuration')?.value;
            formData.emomInterval = document.getElementById('emomInterval')?.value;
            formData.emomExercises = [
                {
                    name: document.getElementById('emomExName')?.value,
                    weight: document.getElementById('emomExWeight')?.value,
                    reps: document.getElementById('emomExReps')?.value,
                    notes: '',
                }
            ];
            formData.emomExercises.forEach((ex, i) => {
                if (!ex.name || ex.weight === undefined || ex.reps === undefined) {
                    console.warn(`EMOM exercise ${i+1} fields missing:`, ex);
                }
            });
        }
        console.log('Collected workout form data:', formData);
        return formData;
    }

    // Reset workout form
    resetWorkoutForm() {
        const dom = uiManager.dom;
        
        if (dom.workoutForm) {
            dom.workoutForm.reset();
        }
        
        if (dom.workoutDateInput) {
            dom.workoutDateInput.valueAsDate = new Date();
        }
        
        if (dom.timeCompletedInput) {
            dom.timeCompletedInput.value = '';
        }
        
        this.updateDynamicFields();
    }

    // Handle workout deletion
    async handleWorkoutDelete(workoutId) {
        try {
            const confirmed = await this.showConfirmDialog('Are you sure you want to delete this workout?');
            if (!confirmed) return;
            
            await workoutManager.deleteWorkout(workoutId);
            uiManager.showNotification('Workout deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Workout deletion error:', error);
            uiManager.showNotification('Failed to delete workout. Please try again.', 'error');
        }
    }

    // Handle workout sharing
    async handleShareWorkout(workout) {
        try {
            // Store current workout for sharing
            this.currentWorkoutToShare = workout;
            
            // Format the workout for preview
            const shareData = this.modules.workoutSharing.formatWorkoutForSharing(workout);
            
            // Update preview text
            const previewText = document.getElementById('sharePreviewText');
            if (previewText) {
                previewText.textContent = shareData.text;
            }
            
            // Update stats
            const volumeEl = document.getElementById('shareTotalVolume');
            const repsEl = document.getElementById('shareTotalReps');
            const exerciseCountEl = document.getElementById('shareExerciseCount');
            
            if (volumeEl) volumeEl.textContent = workout.totalVolume ? workout.totalVolume.toFixed(1) : '0';
            if (repsEl) repsEl.textContent = workout.calculatedTotalReps || '0';
            if (exerciseCountEl) exerciseCountEl.textContent = workout.exercises ? workout.exercises.length : '0';
            
            // Show modal
            const modal = document.getElementById('shareModal');
            if (modal) {
                modal.classList.remove('hidden');
            }
            
        } catch (error) {
            errorHandler.handleError(error, 'Share Workout Error');
        }
    }

    // Show confirmation dialog
    async showConfirmDialog(message) {
        // Simple confirm for now - could be enhanced with custom modal
        return window.confirm(message);
    }

    // Update dynamic form fields based on workout format
    updateDynamicFields() {
        const dom = uiManager.dom;
        if (!dom.workoutFormatSelect || !dom.dynamicFieldsContainer) return;
        
        const format = dom.workoutFormatSelect.value;
        dom.dynamicFieldsContainer.innerHTML = '';
        
        if (format === 'single') {
            dom.dynamicFieldsContainer.innerHTML = this.createSingleExerciseHTML();
        } else if (format === 'superset') {
            dom.dynamicFieldsContainer.innerHTML = this.createSupersetHTML();
        } else if (format === 'amrap') {
            dom.dynamicFieldsContainer.innerHTML = this.createAmrapHTML();
        } else if (format === 'emom') {
            dom.dynamicFieldsContainer.innerHTML = this.createEmomHTML();
        }
        
        // Add overall notes section
        dom.dynamicFieldsContainer.innerHTML += `
            <div class="mt-4">
                <label for="overallNotes" class="block text-sm font-medium text-slate-300 mb-1">Overall Workout Notes</label>
                <textarea id="overallNotes" name="overallNotes" rows="3" class="input-field" placeholder="General notes..."></textarea>
            </div>`;
    }

    // Create single exercise form HTML
    createSingleExerciseHTML() {
        const exercises = workoutManager.getPredefinedExercises();
        const exerciseOptions = exercises.map(ex => `<option value="${ex}">${ex}</option>`).join('');
        
        return `
            <div class="exercise-block border border-slate-700 p-4 rounded-md mt-4 bg-slate-700/50">
                <h4 class="text-md font-semibold mb-2 text-slate-100">Exercise Details</h4>
                
                <div class="mb-4">
                    <label for="singleExerciseName" class="block text-sm font-medium text-slate-300 mb-1">Exercise</label>
                    <select id="singleExerciseName" name="singleExerciseName" class="input-field">
                        ${exerciseOptions}
                    </select>
                    <input type="text" id="singleOtherExerciseName" name="singleOtherExerciseName" 
                           class="input-field mt-2 hidden" placeholder="Enter other exercise name">
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div>
                        <label for="singleWeight" class="block text-sm font-medium text-slate-300 mb-1">Weight (kg)</label>
                        <input type="number" id="singleWeight" name="singleWeight" min="0" step="0.5" class="input-field">
                    </div>
                    <div>
                        <label for="singleReps" class="block text-sm font-medium text-slate-300 mb-1">Reps (per set)</label>
                        <input type="number" id="singleReps" name="singleReps" min="0" required class="input-field">
                    </div>
                    <div>
                        <label for="singleSets" class="block text-sm font-medium text-slate-300 mb-1">Sets</label>
                        <input type="number" id="singleSets" name="singleSets" min="0" class="input-field">
                    </div>
                </div>
                
                <div class="mt-2">
                    <label for="singleTargetReps" class="block text-sm font-medium text-slate-300 mb-1">Target Reps (Total)</label>
                    <input type="number" id="singleTargetReps" name="singleTargetReps" placeholder="100" min="0" class="input-field">
                </div>
                
                <div class="mt-2">
                    <label for="singleNotes" class="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                    <textarea id="singleNotes" name="singleNotes" rows="2" class="input-field" placeholder="e.g. form felt good"></textarea>
                </div>
            </div>`;
    }

    // Create superset form HTML
    createSupersetHTML() {
        const exercises = workoutManager.getPredefinedExercises();
        const exerciseOptions = exercises.map(ex => `<option value="${ex}">${ex}</option>`).join('');
        
        return `
            <div class="space-y-4">
                <div class="exercise-block border border-slate-700 p-4 rounded-md bg-slate-700/50">
                    <h4 class="text-md font-semibold mb-2 text-slate-100">Exercise 1</h4>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-slate-300 mb-1">Exercise</label>
                        <select id="supersetEx1Name" class="input-field">${exerciseOptions}</select>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Weight (kg)</label>
                            <input type="number" id="supersetEx1Weight" min="0" step="0.5" class="input-field">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Reps</label>
                            <input type="number" id="supersetEx1Reps" min="0" required class="input-field">
                        </div>
                    </div>
                </div>
                
                <div class="exercise-block border border-slate-700 p-4 rounded-md bg-slate-700/50">
                    <h4 class="text-md font-semibold mb-2 text-slate-100">Exercise 2</h4>
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-slate-300 mb-1">Exercise</label>
                        <select id="supersetEx2Name" class="input-field">${exerciseOptions}</select>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Weight (kg)</label>
                            <input type="number" id="supersetEx2Weight" min="0" step="0.5" class="input-field">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-300 mb-1">Reps</label>
                            <input type="number" id="supersetEx2Reps" min="0" required class="input-field">
                        </div>
                    </div>
                </div>
                
                <div class="mt-4">
                    <label for="supersetRounds" class="block text-sm font-medium text-slate-300 mb-1">Rounds Completed</label>
                    <input type="number" id="supersetRounds" name="supersetRounds" placeholder="e.g., 5" min="1" required class="input-field">
                </div>
            </div>`;
    }

    // Create AMRAP form HTML
    createAmrapHTML() {
        const exercises = workoutManager.getPredefinedExercises();
        const exerciseOptions = exercises.map(ex => `<option value="${ex}">${ex}</option>`).join('');
        
        return `
            <div class="exercise-block border border-slate-700 p-4 rounded-md bg-slate-700/50">
                <h4 class="text-md font-semibold mb-2 text-slate-100">AMRAP Exercise</h4>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-300 mb-1">Exercise</label>
                    <select id="amrapExName" class="input-field">${exerciseOptions}</select>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">Weight (kg)</label>
                        <input type="number" id="amrapExWeight" min="0" step="0.5" class="input-field">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">Reps</label>
                        <input type="number" id="amrapExReps" min="0" required class="input-field">
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <label for="amrapDuration" class="block text-sm font-medium text-slate-300 mb-1">Duration (minutes)</label>
                    <input type="number" id="amrapDuration" name="amrapDuration" placeholder="e.g., 20" min="1" required class="input-field">
                </div>
                <div>
                    <label for="amrapRoundsCompleted" class="block text-sm font-medium text-slate-300 mb-1">Rounds/Total Reps Completed</label>
                    <input type="text" id="amrapRoundsCompleted" name="amrapRoundsCompleted" placeholder="e.g., 15 rounds or 150 reps" required class="input-field">
                </div>
            </div>`;
    }

    // Create EMOM form HTML
    createEmomHTML() {
        const exercises = workoutManager.getPredefinedExercises();
        const exerciseOptions = exercises.map(ex => `<option value="${ex}">${ex}</option>`).join('');
        
        return `
            <div class="exercise-block border border-slate-700 p-4 rounded-md bg-slate-700/50">
                <h4 class="text-md font-semibold mb-2 text-slate-100">EMOM Exercise</h4>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-slate-300 mb-1">Exercise</label>
                    <select id="emomExName" class="input-field">${exerciseOptions}</select>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">Weight (kg)</label>
                        <input type="number" id="emomExWeight" min="0" step="0.5" class="input-field">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-1">Reps</label>
                        <input type="number" id="emomExReps" min="0" required class="input-field">
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <label for="emomDuration" class="block text-sm font-medium text-slate-300 mb-1">Total Duration (minutes)</label>
                    <input type="number" id="emomDuration" name="emomDuration" placeholder="e.g., 20" min="1" required class="input-field">
                </div>
                <div>
                    <label for="emomInterval" class="block text-sm font-medium text-slate-300 mb-1">EMOM Interval (minutes)</label>
                    <input type="number" id="emomInterval" name="emomInterval" value="1" min="1" required class="input-field">
                </div>
            </div>`;
    }

    // Main render method
    render() {
        if (!this.initialized) return;
        
        // Update current view
        const currentView = appState.getCurrentView();
        uiManager.updateViewDisplay(currentView);
        
        console.log('🎨 App rendered');
    }

    // Get app status for debugging
    getStatus() {
        return {
            initialized: this.initialized,
            currentView: appState.getCurrentView(),
            workoutCount: appState.getWorkouts().length,
            errorCount: errorHandler.getErrors().length,
            modules: Object.keys(this.modules),
            firebaseConnected: firebaseManager.initialized,
            userId: appState.getUserId()
        };
    }

    // Cleanup method
    destroy() {
        console.log('🧹 App cleanup started');
        
        // Cleanup all modules
        Object.values(this.modules).forEach(module => {
            if (module.destroy && typeof module.destroy === 'function') {
                module.destroy();
            }
        });
        
        this.initialized = false;
        console.log('✅ App cleanup completed');
    }
}

// Create and export app instance
export const app = new KettlebellTrackerApp();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.app = app;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎯 DOM loaded, initializing complete app...');
        app.initialize();
    });
} else {
    console.log('🎯 DOM already ready, initializing complete app...');
    app.initialize();
}