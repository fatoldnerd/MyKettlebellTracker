// UI Manager Module
// Handles all DOM manipulation and user interface updates

import { appState } from './state-manager.js';
import { errorHandler } from './error-handler.js';
import { trainingInsights } from './training-insights.js';
import { workoutManager } from './workout-manager.js';

export class UIManager {
    constructor() {
        this.dom = {};
        this.chartInstances = {
            volume: null,
            reps: null,
            time: null
        };
        this.exerciseFilterSlimSelect = null;
        
        console.log('🎨 UI Manager initialized');
    }

    // Initialize DOM references
    initializeDOMReferences() {
        this.dom = {
            // Views
            landingPage: document.getElementById('landingPage'),
            appContainer: document.getElementById('appContainer'),
            formView: document.getElementById('formView'),
            progressView: document.getElementById('progressView'),
            profileView: document.getElementById('profileView'),
            
            // Navigation
            getStartedButton: document.getElementById('getStartedButton'),
            backToHomeButton: document.getElementById('backToHomeButton'),
            viewToggleButtons: document.querySelectorAll('.view-toggle-btn'),
            
            // Auth
            authContainer: document.getElementById('authContainer'),
            signInWithGoogleButton: document.getElementById('signInWithGoogleButton'),
            signOutButton: document.getElementById('signOutButton'),
            userInfoDisplay: document.getElementById('userInfoDisplay'),
            authStatus: document.getElementById('authStatus'),
            
            // Loading
            loadingIndicator: document.getElementById('loadingIndicator'),
            
            // Workout Form
            workoutForm: document.getElementById('workoutForm'),
            workoutDateInput: document.getElementById('workoutDate'),
            overallWorkoutNameInput: document.getElementById('overallWorkoutName'),
            timeCompletedInput: document.getElementById('timeCompleted'),
            workoutFormatSelect: document.getElementById('workoutFormat'),
            dynamicFieldsContainer: document.getElementById('dynamicFieldsContainer'),
            
            // Workouts List
            workoutsList: document.getElementById('workoutsList'),
            noWorkoutsMessage: document.getElementById('noWorkoutsMessage'),
            
            // Progress Elements
            workoutsThisWeekEl: document.getElementById('workoutsThisWeek'),
            workoutsThisMonthEl: document.getElementById('workoutsThisMonth'),
            streakCount: document.getElementById('streakCount'),
            avgVolume: document.getElementById('avgVolume'),
            bestWeek: document.getElementById('bestWeek'),
            totalSessions: document.getElementById('totalSessions'),
            
            // Charts
            volumeChartCtx: document.getElementById('volumeOverTimeChart')?.getContext('2d'),
            repsChartCtx: document.getElementById('repsOverTimeChart')?.getContext('2d'),
            timeChartCtx: document.getElementById('timeOverTimeChart')?.getContext('2d'),
            
            // PR Tables
            repPrTableBody: document.getElementById('repPrTableBody'),
            weightPrTableBody: document.getElementById('weightPrTableBody'),
            
            // Filters
            exerciseFilterSelect: document.getElementById('exerciseFilterSelect'),
            yearFilterSelect: document.getElementById('yearFilterSelect'),
            monthFilterSelect: document.getElementById('monthFilterSelect'),
            
            // Profile
            profileDisplaySection: document.getElementById('profileDisplaySection'),
            profileEditSection: document.getElementById('profileEditSection'),
            profilePhotoDisplay: document.getElementById('profilePhotoDisplay'),
            profileNameDisplay: document.getElementById('profileNameDisplay'),
            profileAgeDisplay: document.getElementById('profileAgeDisplay'),
            profileExperienceDisplay: document.getElementById('profileExperienceDisplay'),
            profileGoalsDisplay: document.getElementById('profileGoalsDisplay'),
            profileActivitiesDisplay: document.getElementById('profileActivitiesDisplay'),
            profileBioDisplay: document.getElementById('profileBioDisplay'),
            editProfileButton: document.getElementById('editProfileButton'),
            profileForm: document.getElementById('profileForm'),
            
            // Timer
            timerModal: document.getElementById('timerModal'),
            openTimerButton: document.getElementById('openTimerButton'),
            closeTimerButton: document.getElementById('closeTimerButton'),
            timerDisplay: document.getElementById('timerDisplay'),
            startPauseTimerButton: document.getElementById('startPauseTimerButton'),
            resetTimerButton: document.getElementById('resetTimerButton'),
            setCountdownInput: document.getElementById('setCountdownInput'),
            setCountdownButton: document.getElementById('setCountdownButton')
        };
        
        console.log('🎯 DOM references initialized');
    }

    // Show/hide loading indicator
    setLoading(isLoading) {
        if (this.dom.loadingIndicator) {
            if (isLoading) {
                this.dom.loadingIndicator.classList.remove('hidden');
            } else {
                this.dom.loadingIndicator.classList.add('hidden');
            }
        }
    }

    // Update authentication UI
    updateAuthUI(user) {
        if (!this.dom.signInWithGoogleButton || !this.dom.signOutButton || !this.dom.userInfoDisplay) return;
        
        if (user && !user.isAnonymous) {
            this.dom.signInWithGoogleButton.classList.add('hidden');
            this.dom.signOutButton.classList.remove('hidden');
            this.dom.userInfoDisplay.textContent = `Signed in as: ${user.displayName || user.email || 'Google User'}`;
            this.dom.userInfoDisplay.classList.remove('hidden');
        } else {
            this.dom.signInWithGoogleButton.classList.remove('hidden');
            this.dom.signOutButton.classList.add('hidden');
            this.dom.userInfoDisplay.classList.add('hidden');
            this.dom.userInfoDisplay.textContent = '';
        }
    }

    // Update auth status message
    updateAuthStatus(message) {
        if (this.dom.authStatus) {
            this.dom.authStatus.textContent = message;
        }
    }

    // Navigation methods
    showApp() {
        if (this.dom.landingPage && this.dom.appContainer) {
            this.dom.landingPage.classList.add('hidden');
            this.dom.appContainer.classList.remove('hidden');
            this.switchView('formView');
        }
    }

    showLandingPage() {
        if (this.dom.landingPage && this.dom.appContainer) {
            this.dom.appContainer.classList.add('hidden');
            this.dom.landingPage.classList.remove('hidden');
        }
    }

    // Switch between views
    switchView(viewId) {
        appState.setCurrentView(viewId);
        this.updateViewDisplay(viewId);
    }

    // Update view display
    updateViewDisplay(currentView) {
        // Hide all views
        ['formView', 'progressView', 'profileView'].forEach(viewId => {
            const view = this.dom[viewId];
            if (view) {
                view.classList.toggle('hidden', viewId !== currentView);
            }
        });

        // Update toggle buttons
        if (this.dom.viewToggleButtons) {
            this.dom.viewToggleButtons.forEach(btn => {
                const isActive = btn.dataset.view === currentView;
                btn.classList.toggle('bg-blue-600', isActive);
                btn.classList.toggle('text-white', isActive);
                btn.classList.toggle('bg-slate-600', !isActive);
                btn.classList.toggle('text-slate-300', !isActive);
            });
        }

        // View-specific updates
        if (currentView === 'progressView') {
            this.updateProgressView();
        } else if (currentView === 'profileView') {
            this.updateProfileView();
        }
    }

    // Update progress view
    updateProgressView() {
        const workouts = appState.getWorkouts();
        
        // Update training insights
        trainingInsights.updateInsightsDisplay(workouts);
        
        // Update frequency stats
        this.updateFrequencyStats(workouts);
        
        // Update filters
        this.populateDateFilters(workouts);
        this.populateExerciseFilter(workouts);
        
        // Update charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            this.updateCharts(workouts);
        }
        
        // Update PR tables
        this.updatePRTables(workouts);
    }

    // Update frequency statistics
    updateFrequencyStats(workouts) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Calculate start of week (Monday)
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() + diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Calculate start of month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        let countThisWeek = 0;
        let countThisMonth = 0;
        
        workouts.forEach(workout => {
            const workoutDate = new Date(workout.date);
            workoutDate.setHours(0, 0, 0, 0);
            
            if (workoutDate >= startOfWeek) countThisWeek++;
            if (workoutDate >= startOfMonth) countThisMonth++;
        });
        
        if (this.dom.workoutsThisWeekEl) {
            this.dom.workoutsThisWeekEl.textContent = countThisWeek;
        }
        if (this.dom.workoutsThisMonthEl) {
            this.dom.workoutsThisMonthEl.textContent = countThisMonth;
        }
    }

    // Populate date filters
    populateDateFilters(workouts) {
        if (!this.dom.yearFilterSelect || !this.dom.monthFilterSelect) return;

        // Get unique years from workouts
        const workoutYears = [...new Set(workouts.map(w => new Date(w.date).getFullYear()))];
        workoutYears.sort((a, b) => b - a);
        
        const currentYearSelection = this.dom.yearFilterSelect.value;
        this.dom.yearFilterSelect.innerHTML = '<option value="ALL_TIME">All Time</option>';
        
        workoutYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            this.dom.yearFilterSelect.appendChild(option);
        });
        
        // Restore selection if still valid
        if (workoutYears.includes(parseInt(currentYearSelection))) {
            this.dom.yearFilterSelect.value = currentYearSelection;
        }

        // Populate months
        const currentMonthSelection = this.dom.monthFilterSelect.value;
        this.dom.monthFilterSelect.innerHTML = '<option value="ALL_MONTHS">All Months</option>';
        
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        
        monthNames.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month;
            this.dom.monthFilterSelect.appendChild(option);
        });
        
        // Restore selection if valid
        if (currentMonthSelection && currentMonthSelection !== 'ALL_MONTHS') {
            this.dom.monthFilterSelect.value = currentMonthSelection;
        }
    }

    // Populate exercise filter
    populateExerciseFilter(workouts) {
        if (!this.dom.exerciseFilterSelect) return;

        try {
            const uniqueExercises = workoutManager.getUniqueExercises(workouts);
            
            const data = [
                { text: 'All Exercises', value: 'ALL_EXERCISES', selected: true, placeholder: true }
            ];
            
            uniqueExercises.forEach(exercise => {
                data.push({ text: exercise, value: exercise });
            });

            // Clean up existing SlimSelect if it exists
            if (this.exerciseFilterSlimSelect) {
                this.exerciseFilterSlimSelect.destroy();
            }

            // Initialize SlimSelect if available
            if (typeof SlimSelect !== 'undefined') {
                this.exerciseFilterSlimSelect = new SlimSelect({
                    select: '#exerciseFilterSelect',
                    data: data,
                    settings: {
                        placeholderText: 'Filter by Exercises (All)',
                        allowDeselect: true,
                        closeOnSelect: false,
                        selectByGroup: true
                    },
                    events: {
                        afterChange: (newVal) => {
                            console.log('Exercise filter changed:', newVal.map(item => item.value));
                            this.updateProgressView();
                        }
                    }
                });
            }
        } catch (error) {
            errorHandler.handleError(error, 'Exercise Filter Error');
        }
    }

    // Update charts (placeholder for Chart.js integration)
    updateCharts(workouts) {
        // This would contain your existing chart code
        console.log('📊 Charts update would happen here with', workouts.length, 'workouts');
    }

    // Update PR tables
    updatePRTables(workouts) {
        const { repPRs, weightPRs } = workoutManager.getPersonalRecords(workouts);
        
        // Update Rep PRs table
        if (this.dom.repPrTableBody) {
            this.dom.repPrTableBody.innerHTML = '';
            let hasRepPRs = false;
            
            for (const exerciseName in repPRs) {
                for (const weight in repPRs[exerciseName]) {
                    hasRepPRs = true;
                    const prData = repPRs[exerciseName][weight];
                    const row = this.dom.repPrTableBody.insertRow();
                    row.className = 'text-slate-300 hover:bg-slate-600';
                    row.innerHTML = `
                        <td class="py-2 px-3 border-b border-slate-600">${exerciseName}</td>
                        <td class="py-2 px-3 border-b border-slate-600">${weight} kg</td>
                        <td class="py-2 px-3 border-b border-slate-600">${prData.reps} reps ${prData.isPerArm ? "(each arm)" : ""}</td>
                        <td class="py-2 px-3 border-b border-slate-600 text-xs">${new Date(prData.date).toLocaleDateString()}</td>
                    `;
                }
            }
            
            if (!hasRepPRs) {
                this.dom.repPrTableBody.innerHTML = `
                    <tr><td colspan="4" class="text-center py-4 text-slate-500">No Rep PRs found</td></tr>
                `;
            }
        }
        
        // Update Weight PRs table
        if (this.dom.weightPrTableBody) {
            this.dom.weightPrTableBody.innerHTML = '';
            let hasWeightPRs = false;
            
            for (const exerciseName in weightPRs) {
                for (const reps in weightPRs[exerciseName]) {
                    hasWeightPRs = true;
                    const prData = weightPRs[exerciseName][reps];
                    const row = this.dom.weightPrTableBody.insertRow();
                    row.className = 'text-slate-300 hover:bg-slate-600';
                    row.innerHTML = `
                        <td class="py-2 px-3 border-b border-slate-600">${exerciseName}</td>
                        <td class="py-2 px-3 border-b border-slate-600">${reps} reps ${prData.isPerArm ? "(each arm)" : ""}</td>
                        <td class="py-2 px-3 border-b border-slate-600">${prData.weight} kg</td>
                        <td class="py-2 px-3 border-b border-slate-600 text-xs">${new Date(prData.date).toLocaleDateString()}</td>
                    `;
                }
            }
            
            if (!hasWeightPRs) {
                this.dom.weightPrTableBody.innerHTML = `
                    <tr><td colspan="4" class="text-center py-4 text-slate-500">No Weight PRs found</td></tr>
                `;
            }
        }
    }

    // Update profile view
    updateProfileView() {
        const profile = appState.getState().userProfile;
        const user = appState.getState().user;
        
        if (this.dom.profilePhotoDisplay) {
            this.dom.profilePhotoDisplay.src = profile?.photoURL || user?.photoURL || 'https://via.placeholder.com/150?text=No+Image';
        }
        
        if (this.dom.profileNameDisplay) {
            this.dom.profileNameDisplay.textContent = profile?.displayName || user?.displayName || 'User Name';
        }
        
        if (this.dom.profileAgeDisplay) {
            this.dom.profileAgeDisplay.textContent = profile?.age ? `Age: ${profile.age}` : 'Age: Not Specified';
        }
        
        if (this.dom.profileExperienceDisplay) {
            this.dom.profileExperienceDisplay.textContent = profile?.experienceLevel ? `Experience: ${profile.experienceLevel}` : 'Experience: Not Specified';
        }
        
        if (this.dom.profileGoalsDisplay) {
            this.dom.profileGoalsDisplay.innerHTML = profile?.goals ? profile.goals.replace(/\n/g, '<br>') : '<em>No goals set yet.</em>';
        }
        
        if (this.dom.profileActivitiesDisplay) {
            this.dom.profileActivitiesDisplay.innerHTML = profile?.activities ? profile.activities.replace(/\n/g, '<br>') : '<em>No activities listed.</em>';
        }
        
        if (this.dom.profileBioDisplay) {
            this.dom.profileBioDisplay.innerHTML = profile?.customBio ? profile.customBio.replace(/\n/g, '<br>') : '<em>No bio yet.</em>';
        }
        // Setup export button if it exists
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn && !exportBtn.hasAttribute('data-listener-added')) {
        exportBtn.addEventListener('click', async () => {
        const module = await import('./data-export.js');
        const exporter = new module.DataExporter();
        exporter.exportAsJSON();
    });
    exportBtn.setAttribute('data-listener-added', 'true');
    console.log('📦 Export button listener added');
}
    }

    // Render workouts list
    renderWorkouts(workouts) {
        if (!this.dom.workoutsList || !this.dom.noWorkoutsMessage) return;

        this.dom.workoutsList.innerHTML = '';
        
        if (workouts.length === 0) {
            this.dom.noWorkoutsMessage.classList.remove('hidden');
        } else {
            this.dom.noWorkoutsMessage.classList.add('hidden');
            
            workouts.forEach(workout => {
                const workoutElement = this.createWorkoutElement(workout);
                this.dom.workoutsList.appendChild(workoutElement);
            });
        }
    }

    // Create workout element
    createWorkoutElement(workout) {
        const item = document.createElement('div');
        item.className = 'bg-slate-700 p-5 rounded-lg shadow-md mb-4 text-slate-300';
        
        // Create exercises HTML
        const exercisesHtml = workout.exercises.map(ex => {
            let repInfo = `Reps: ${ex.reps}`;
            if (ex.sets && workout.format === 'single') repInfo += ` (x${ex.sets} sets)`;
            if (ex.isPerArm) repInfo += ` (each arm)`;
            
            return `
                <div class="ml-4 mt-2 pb-2 ${workout.exercises.length > 1 ? 'border-b border-slate-600 last:border-b-0' : ''}">
                    <p class="text-lg font-medium text-pink-400">${ex.name}</p>
                    ${ex.weight ? `<p class="text-sm text-slate-400">Weight: ${ex.weight} kg</p>` : ''}
                    <p class="text-sm text-slate-400">${repInfo}</p>
                    ${ex.notes ? `<p class="text-xs text-slate-500 mt-1 italic">Note: ${ex.notes}</p>` : ''}
                </div>
            `;
        }).join('');
        
        // Create details HTML based on format
        let detailsHtml = '';
        if (workout.format === 'superset') {
            detailsHtml = `<p class="text-sm text-slate-400">Rounds: ${workout.details.rounds}</p>`;
        } else if (workout.format === 'amrap') {
            detailsHtml = `<p class="text-sm text-slate-400">Duration: ${workout.details.durationMinutes} min | Completed: ${workout.details.roundsCompleted}</p>`;
        } else if (workout.format === 'emom') {
            detailsHtml = `<p class="text-sm text-slate-400">Duration: ${workout.details.durationMinutes} min (Every ${workout.details.intervalMinutes} min)</p>`;
        }
        
        // Target vs actual reps
        let targetComparisonHtml = '';
        if (workout.targetRepsOverall != null && workout.calculatedTotalReps != null) {
            const diff = workout.calculatedTotalReps - workout.targetRepsOverall;
            const diffClass = diff >= 0 ? 'text-green-400' : 'text-red-400';
            const diffText = diff >= 0 ? `(+${diff})` : `(${diff})`;
            targetComparisonHtml = `<p class="text-sm font-medium">Achieved: ${workout.calculatedTotalReps} / Target: ${workout.targetRepsOverall} <span class="${diffClass}">${diffText}</span></p>`;
        } else if (workout.calculatedTotalReps != null) {
            targetComparisonHtml = `<p class="text-sm font-medium">Total Reps: ${workout.calculatedTotalReps}</p>`;
        }
        
        // Time completed
        let timeCompletedHtml = '';
        if (workout.timeCompletedSeconds != null) {
            timeCompletedHtml = `<p class="text-sm font-medium text-blue-400">Time: ${workoutManager.formatSecondsToTime(workout.timeCompletedSeconds)}</p>`;
        }
        
        item.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-semibold text-slate-100">${workout.name}</h3>
                    <p class="text-xs text-slate-500">${new Date(workout.date).toLocaleDateString()} - ${workout.format.toUpperCase()}</p>
               </div>
            <div class="flex gap-2">
            <button data-workout='${JSON.stringify(workout)}' class="share-workout-btn bg-slate-600 hover:bg-blue-600 text-blue-400 hover:text-slate-100 text-xs font-bold py-1 px-2 rounded" title="Share workout">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
            </svg>
            </button>
            <button data-id="${workout.id}" class="delete-workout-btn bg-slate-600 hover:bg-red-600 text-red-400 hover:text-slate-100 text-xs font-bold py-1 px-2 rounded">
            Del
            </button>
            </div>
            </div>
            <div class="mt-3">
                ${detailsHtml}
                <p class="text-sm text-slate-400 mt-1"><strong>Exercises:</strong></p>
                ${exercisesHtml}
            </div>
            <div class="mt-2">${targetComparisonHtml}</div>
            <div class="mt-1">${timeCompletedHtml}</div>
            ${workout.notes ? `<p class="text-sm text-slate-500 mt-3 italic">Overall Notes: ${workout.notes}</p>` : ''}
            <p class="text-sm font-semibold text-slate-200 mt-2">Calculated Volume: ${workout.totalVolume != null ? workout.totalVolume.toFixed(1) : 'N/A'} kg</p>
        `;
        
        return item;
    }

    // Set up template event listeners
    setupTemplateEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.template-btn')) {
                const templateId = e.target.closest('.template-btn').dataset.template;
                this.loadWorkoutTemplate(templateId);
            }
        });
        
        console.log('🎯 Template event listeners configured');
    }

   // Load workout template into form
loadWorkoutTemplate(templateId) {
    // Get the app instance to access workout templates
    const app = window.kettlebellApp;
    if (!app || !app.modules || !app.modules.workoutTemplates) {
        console.error('❌ Cannot access workout templates');
        return;
    }

    const template = app.modules.workoutTemplates.getTemplate(templateId);
    if (!template) {
        console.error('❌ Template not found:', templateId);
        return;
    }

    // Get form fields directly by ID (more reliable)
    const workoutNameField = document.getElementById('overallWorkoutName');
    const workoutFormatField = document.getElementById('workoutFormat');
    
    // Set basic workout info
    if (workoutNameField) {
        workoutNameField.value = template.name;
        console.log('✅ Set workout name:', template.name);
    } else {
        console.error('❌ Could not find workout name field');
    }
    
    if (workoutFormatField) {
        workoutFormatField.value = template.format;
        console.log('✅ Set workout format:', template.format);
        
        // Trigger multiple events to ensure form updates
        workoutFormatField.dispatchEvent(new Event('change', { bubbles: true }));
        workoutFormatField.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
            // Use the manual approach that we know works
            const dom = window.kettlebellApp.modules.ui.dom;
            if (dom.workoutFormatSelect && dom.dynamicFieldsContainer) {
                // Clear and rebuild the form
                dom.dynamicFieldsContainer.innerHTML = '';
                
                const format = dom.workoutFormatSelect.value;
                let newHTML = '';
                
                if (format === 'single') {
                    newHTML = window.kettlebellApp.createSingleExerciseHTML();
                } else if (format === 'superset') {
                    newHTML = window.kettlebellApp.createSupersetHTML();
                } else if (format === 'amrap') {
                    newHTML = window.kettlebellApp.createAmrapHTML();
                } else if (format === 'emom') {
                    newHTML = window.kettlebellApp.createEmomHTML();
                }
                
                dom.dynamicFieldsContainer.innerHTML = newHTML;
                console.log('🔄 Form updated with manual approach');
            }
        }, 100);
    } else {
        console.error('❌ Could not find workout format field');
    }

    // Show success notification
    this.showNotification(`${template.name} template loaded!`);
    
    console.log('🎯 Template loaded:', template.name);
}

    // Show notification/alert
    showNotification(message, type = 'info') {
        // Simple alert for now - could be enhanced with custom notifications
        alert(message);
    }

    // Cleanup
    destroy() {
        // Clean up SlimSelect
        if (this.exerciseFilterSlimSelect) {
            this.exerciseFilterSlimSelect.destroy();
            this.exerciseFilterSlimSelect = null;
        }
        
        // Clean up chart instances
        Object.values(this.chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        
        console.log('🧹 UI Manager cleaned up');
    }
}

// Export singleton instance
export const uiManager = new UIManager();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.uiManager = uiManager;
}