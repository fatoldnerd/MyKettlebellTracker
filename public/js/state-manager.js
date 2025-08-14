// State Manager Module
// Handles all application state management

export class StateManager {
    constructor() {
        this.state = {
            // User & Auth
            userId: null,
            user: null,
            userProfile: null,
            
            // Workouts
            workouts: [],
            isLoading: false,
            
            // UI State
            currentView: 'formView',
            
            // Filters
            filters: {
                year: 'ALL_TIME',
                month: 'ALL_MONTHS',
                exercises: ['ALL_EXERCISES']
            },
            
            // Timer
            timer: {
                current: 0,
                isRunning: false,
                isCountdown: false,
                duration: 0
            },
            
            // App State
            offline: false,
            lastUpdated: new Date().toISOString()
        };
        
        this.listeners = new Map();
        console.log('✅ State Manager initialized');
    }

    // Get current state
    getState() {
        return { ...this.state };
    }

    // Update state
    setState(updates) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...updates };
        this.state.lastUpdated = new Date().toISOString();
        
        // Notify listeners of changes
        this.notifyListeners(oldState, this.state);
        
        console.log('📊 State updated:', updates);
        return this.state;
    }

    // Subscribe to state changes
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(key);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    // Notify listeners of state changes
    notifyListeners(oldState, newState) {
        this.listeners.forEach((callbacks, key) => {
            if (oldState[key] !== newState[key]) {
                callbacks.forEach(callback => {
                    try {
                        callback(newState[key], oldState[key]);
                    } catch (error) {
                        console.error(`Error in listener for ${key}:`, error);
                    }
                });
            }
        });
    }

    // Convenience methods
    setUserId(userId) {
        this.setState({ userId });
    }

    setWorkouts(workouts) {
        this.setState({ workouts });
    }

    setLoading(isLoading) {
        this.setState({ isLoading });
    }

    setCurrentView(view) {
        this.setState({ currentView: view });
    }

    setFilters(filters) {
        this.setState({ filters: { ...this.state.filters, ...filters } });
    }

    // Get specific state values
    getUserId() {
        return this.state.userId;
    }

    getWorkouts() {
        return this.state.workouts;
    }

    getCurrentView() {
        return this.state.currentView;
    }

    getFilters() {
        return this.state.filters;
    }
}

// Export singleton instance
export const appState = new StateManager();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.appState = appState;
}