// Sync Manager Module
// Handles synchronization between offline and online states

import { offlineStorage } from './offline-storage.js';
import { firebaseManager } from './firebase-manager.js';
import { appState } from './state-manager.js';
import { errorHandler } from './error-handler.js';

export class SyncManager {
    constructor() {
        this.isSyncing = false;
        this.syncInterval = null;
        
        // Listen for online/offline events
        window.addEventListener('offline-sync-needed', () => this.syncPendingChanges());
        window.addEventListener('offline-mode-activated', () => this.showOfflineNotification());
        
        console.log('🔄 Sync Manager initialized');
    }

    // Initialize sync manager
    initialize() {
        // Check online status periodically
        this.syncInterval = setInterval(() => {
            if (navigator.onLine && !this.isSyncing) {
                this.checkAndSync();
            }
        }, 30000); // Check every 30 seconds
        
        // Initial sync check
        if (navigator.onLine) {
            this.checkAndSync();
        }
    }

    // Check if sync is needed and perform it
    async checkAndSync() {
        const userId = appState.getUserId();
        if (!userId) return;
        
        try {
            const syncStatus = await offlineStorage.getSyncStatus(userId);
            
            if (syncStatus.totalPending > 0) {
                console.log(`🔄 Found ${syncStatus.totalPending} pending items to sync`);
                await this.syncPendingChanges();
            }
        } catch (error) {
            console.error('Sync check failed:', error);
        }
    }

    // Sync all pending changes
    async syncPendingChanges() {
        if (this.isSyncing || !navigator.onLine) return;
        
        const userId = appState.getUserId();
        if (!userId) return;
        
        this.isSyncing = true;
        
        try {
            console.log('🔄 Starting sync process...');
            
            // Trigger sync started event
            window.dispatchEvent(new CustomEvent('sync-started'));
            
            // Show sync notification
            this.showSyncNotification('Syncing your workouts...');
            
            // Get pending changes
            const pendingChanges = await offlineStorage.getPendingChanges(userId);
            const workouts = await offlineStorage.getWorkouts(userId);
            const pendingWorkouts = workouts.filter(w => w.syncStatus === 'pending');
            
            // Sync pending workouts
            for (const workout of pendingWorkouts) {
                if (workout.id.startsWith('offline_')) {
                    // This is a new workout created offline
                    const { id, syncStatus, lastModified, ...workoutData } = workout;
                    
                    try {
                        // Add to Firebase
                        const docRef = await firebaseManager.addWorkoutDirect(workoutData);
                        
                        // Update local storage with new ID
                        await offlineStorage.deleteWorkout(id);
                        await offlineStorage.saveWorkout({
                            ...workout,
                            id: docRef.id,
                            syncStatus: 'synced'
                        });
                        
                        console.log(`✅ Synced workout ${id} -> ${docRef.id}`);
                    } catch (error) {
                        console.error(`Failed to sync workout ${id}:`, error);
                    }
                }
            }
            
            // Process pending changes (deletions, etc.)
            for (const change of pendingChanges) {
                try {
                    if (change.type === 'delete' && change.collection === 'workouts') {
                        await firebaseManager.deleteWorkoutDirect(change.documentId, change.userId);
                        console.log(`✅ Synced deletion of workout ${change.documentId}`);
                    }
                } catch (error) {
                    console.error(`Failed to process change ${change.id}:`, error);
                }
            }
            
            // Clear pending changes
            await offlineStorage.clearPendingChanges(userId);
            
            // Reload workouts to ensure consistency
            await firebaseManager.loadWorkouts(userId);
            
            // Trigger sync completed event
            window.dispatchEvent(new CustomEvent('sync-completed', { 
                detail: 'All changes synced!' 
            }));
            
            this.showSyncNotification('All changes synced successfully!', 'success');
            console.log('✅ Sync completed successfully');
            
        } catch (error) {
            errorHandler.handleError(error, 'Sync Error');
            
            // Trigger sync failed event
            window.dispatchEvent(new CustomEvent('sync-failed'));
            
            this.showSyncNotification('Sync failed. Will retry later.', 'error');
        } finally {
            this.isSyncing = false;
        }
    }

    // Show offline notification
    showOfflineNotification() {
        const notification = this.createNotification(
            '📵 You are offline',
            'Your workouts will be saved locally and synced when you reconnect.',
            'warning'
        );
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Show sync notification
    showSyncNotification(message, type = 'info') {
        const existingNotification = document.getElementById('sync-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = this.createNotification('🔄 Sync Status', message, type);
        notification.id = 'sync-notification';
        
        document.body.appendChild(notification);
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }

    // Create notification element
    createNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 max-w-sm w-full bg-slate-800 rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-out translate-x-0 z-50`;
        
        const typeStyles = {
            info: 'border-l-4 border-blue-500',
            success: 'border-l-4 border-green-500',
            warning: 'border-l-4 border-yellow-500',
            error: 'border-l-4 border-red-500'
        };
        
        notification.classList.add(typeStyles[type]);
        
        notification.innerHTML = `
            <div class="flex items-start">
                <div class="flex-1">
                    <p class="text-sm font-medium text-white">${title}</p>
                    <p class="text-sm text-gray-300 mt-1">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-white">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('translate-x-0');
        });
        
        return notification;
    }

    // Cleanup
    cleanup() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }
}

// Export singleton instance
export const syncManager = new SyncManager();