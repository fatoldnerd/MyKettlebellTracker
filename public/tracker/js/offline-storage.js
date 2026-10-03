// Offline Storage Module
// Handles IndexedDB operations for offline data caching

export class OfflineStorage {
    constructor() {
        this.dbName = 'KettlebellTrackerDB';
        this.dbVersion = 1;
        this.db = null;
        this.isOnline = navigator.onLine;
        
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        console.log('🗄️ Offline Storage initialized');
    }

    // Initialize IndexedDB
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('Failed to open IndexedDB');
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB opened successfully');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create workouts store
                if (!db.objectStoreNames.contains('workouts')) {
                    const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
                    workoutStore.createIndex('userId', 'userId', { unique: false });
                    workoutStore.createIndex('date', 'date', { unique: false });
                    workoutStore.createIndex('syncStatus', 'syncStatus', { unique: false });
                }
                
                // Create pending changes store
                if (!db.objectStoreNames.contains('pendingChanges')) {
                    const pendingStore = db.createObjectStore('pendingChanges', { keyPath: 'id', autoIncrement: true });
                    pendingStore.createIndex('userId', 'userId', { unique: false });
                    pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Create user profile store
                if (!db.objectStoreNames.contains('userProfile')) {
                    const profileStore = db.createObjectStore('userProfile', { keyPath: 'userId' });
                }
                
                console.log('✅ IndexedDB schema created');
            };
        });
    }

    // Save workout locally
    async saveWorkout(workout) {
        if (!this.db) await this.initialize();
        
        const transaction = this.db.transaction(['workouts'], 'readwrite');
        const store = transaction.objectStore('workouts');
        
        // Mark workout as synced or pending based on online status
        workout.syncStatus = this.isOnline ? 'synced' : 'pending';
        workout.lastModified = new Date().toISOString();
        
        return new Promise((resolve, reject) => {
            const request = store.put(workout);
            request.onsuccess = () => resolve(workout);
            request.onerror = () => reject(request.error);
        });
    }

    // Get all workouts for a user
    async getWorkouts(userId) {
        if (!this.db) await this.initialize();
        
        const transaction = this.db.transaction(['workouts'], 'readonly');
        const store = transaction.objectStore('workouts');
        const index = store.index('userId');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(userId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Delete workout locally
    async deleteWorkout(workoutId) {
        if (!this.db) await this.initialize();
        
        const transaction = this.db.transaction(['workouts', 'pendingChanges'], 'readwrite');
        const workoutStore = transaction.objectStore('workouts');
        const pendingStore = transaction.objectStore('pendingChanges');
        
        // If offline, track deletion
        if (!this.isOnline) {
            await pendingStore.add({
                type: 'delete',
                collection: 'workouts',
                documentId: workoutId,
                timestamp: new Date().toISOString(),
                userId: (await this.getWorkoutById(workoutId))?.userId
            });
        }
        
        return new Promise((resolve, reject) => {
            const request = workoutStore.delete(workoutId);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Get workout by ID
    async getWorkoutById(workoutId) {
        if (!this.db) await this.initialize();
        
        const transaction = this.db.transaction(['workouts'], 'readonly');
        const store = transaction.objectStore('workouts');
        
        return new Promise((resolve, reject) => {
            const request = store.get(workoutId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Save user profile locally
    async saveUserProfile(profile) {
        if (!this.db) await this.initialize();
        
        const transaction = this.db.transaction(['userProfile'], 'readwrite');
        const store = transaction.objectStore('userProfile');
        
        return new Promise((resolve, reject) => {
            const request = store.put(profile);
            request.onsuccess = () => resolve(profile);
            request.onerror = () => reject(request.error);
        });
    }

    // Get user profile
    async getUserProfile(userId) {
        if (!this.db) await this.initialize();
        
        const transaction = this.db.transaction(['userProfile'], 'readonly');
        const store = transaction.objectStore('userProfile');
        
        return new Promise((resolve, reject) => {
            const request = store.get(userId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get pending changes
    async getPendingChanges(userId) {
        if (!this.db) await this.initialize();
        
        const transaction = this.db.transaction(['pendingChanges'], 'readonly');
        const store = transaction.objectStore('pendingChanges');
        const index = store.index('userId');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(userId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Clear pending changes after sync
    async clearPendingChanges(userId) {
        if (!this.db) await this.initialize();
        
        const pendingChanges = await this.getPendingChanges(userId);
        const transaction = this.db.transaction(['pendingChanges'], 'readwrite');
        const store = transaction.objectStore('pendingChanges');
        
        for (const change of pendingChanges) {
            store.delete(change.id);
        }
        
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    // Handle coming online
    async handleOnline() {
        this.isOnline = true;
        console.log('🌐 Back online - syncing pending changes');
        
        // Trigger sync event
        window.dispatchEvent(new CustomEvent('offline-sync-needed'));
    }

    // Handle going offline
    handleOffline() {
        this.isOnline = false;
        console.log('📵 Gone offline - using local storage');
        
        // Show offline notification
        window.dispatchEvent(new CustomEvent('offline-mode-activated'));
    }

    // Get sync status
    async getSyncStatus(userId) {
        if (!this.db) await this.initialize();
        
        const transaction = this.db.transaction(['workouts', 'pendingChanges'], 'readonly');
        const workoutStore = transaction.objectStore('workouts');
        const pendingStore = transaction.objectStore('pendingChanges');
        
        const workoutIndex = workoutStore.index('userId');
        const pendingIndex = pendingStore.index('userId');
        
        const [workouts, pending] = await Promise.all([
            new Promise((resolve, reject) => {
                const request = workoutIndex.getAll(userId);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            }),
            new Promise((resolve, reject) => {
                const request = pendingIndex.getAll(userId);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            })
        ]);
        
        const pendingWorkouts = workouts.filter(w => w.syncStatus === 'pending');
        
        return {
            pendingWorkouts: pendingWorkouts.length,
            pendingChanges: pending.length,
            totalPending: pendingWorkouts.length + pending.length,
            isOnline: this.isOnline
        };
    }

    // Clear all local data
    async clearAllData() {
        if (!this.db) await this.initialize();
        
        const transaction = this.db.transaction(['workouts', 'pendingChanges', 'userProfile'], 'readwrite');
        
        transaction.objectStore('workouts').clear();
        transaction.objectStore('pendingChanges').clear();
        transaction.objectStore('userProfile').clear();
        
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();