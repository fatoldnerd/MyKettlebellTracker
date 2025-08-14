// Offline UI Module
// Handles visual indicators for offline/online status and sync

export class OfflineUI {
    constructor() {
        this.offlineIndicator = null;
        this.syncStatus = null;
        this.syncStatusText = null;
        this.isOnline = navigator.onLine;
        
        console.log('📱 Offline UI initialized');
    }

    // Initialize UI elements
    initialize() {
        this.offlineIndicator = document.getElementById('offlineIndicator');
        this.syncStatus = document.getElementById('syncStatus');
        this.syncStatusText = document.getElementById('syncStatusText');
        
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Listen for sync events
        window.addEventListener('sync-started', () => this.showSyncStatus());
        window.addEventListener('sync-completed', (e) => this.hideSyncStatus(e.detail));
        window.addEventListener('sync-failed', () => this.showSyncError());
        
        // Check initial status
        if (!navigator.onLine) {
            this.showOfflineIndicator();
        }
    }

    // Show offline indicator
    showOfflineIndicator() {
        if (this.offlineIndicator) {
            this.offlineIndicator.classList.remove('hidden');
            // Add slide-down animation
            this.offlineIndicator.style.transform = 'translateY(-100%)';
            requestAnimationFrame(() => {
                this.offlineIndicator.style.transition = 'transform 0.3s ease-out';
                this.offlineIndicator.style.transform = 'translateY(0)';
            });
        }
    }

    // Hide offline indicator
    hideOfflineIndicator() {
        if (this.offlineIndicator) {
            this.offlineIndicator.style.transition = 'transform 0.3s ease-in';
            this.offlineIndicator.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                this.offlineIndicator.classList.add('hidden');
            }, 300);
        }
    }

    // Show sync status
    showSyncStatus() {
        if (this.syncStatus && this.syncStatusText) {
            this.syncStatus.classList.remove('hidden');
            this.syncStatusText.textContent = 'Syncing your workouts...';
            
            // Add fade-in animation
            this.syncStatus.style.opacity = '0';
            requestAnimationFrame(() => {
                this.syncStatus.style.transition = 'opacity 0.3s ease-out';
                this.syncStatus.style.opacity = '1';
            });
        }
    }

    // Hide sync status
    hideSyncStatus(message = null) {
        if (this.syncStatus && this.syncStatusText) {
            if (message) {
                this.syncStatusText.textContent = message;
                // Show success state
                const spinner = this.syncStatus.querySelector('.animate-spin');
                if (spinner) {
                    spinner.style.display = 'none';
                }
                
                // Hide after delay
                setTimeout(() => {
                    this.syncStatus.style.transition = 'opacity 0.3s ease-in';
                    this.syncStatus.style.opacity = '0';
                    setTimeout(() => {
                        this.syncStatus.classList.add('hidden');
                        if (spinner) {
                            spinner.style.display = 'block';
                        }
                    }, 300);
                }, 2000);
            } else {
                // Hide immediately
                this.syncStatus.classList.add('hidden');
            }
        }
    }

    // Show sync error
    showSyncError() {
        if (this.syncStatus && this.syncStatusText) {
            this.syncStatusText.textContent = 'Sync failed - will retry';
            const spinner = this.syncStatus.querySelector('.animate-spin');
            if (spinner) {
                spinner.style.display = 'none';
            }
            
            setTimeout(() => {
                this.hideSyncStatus();
            }, 3000);
        }
    }

    // Handle going online
    handleOnline() {
        this.isOnline = true;
        this.hideOfflineIndicator();
        
        // Show a brief "back online" message
        if (this.offlineIndicator) {
            this.offlineIndicator.querySelector('span').textContent = '✅ Back online - Syncing changes...';
            this.offlineIndicator.classList.remove('bg-yellow-600');
            this.offlineIndicator.classList.add('bg-green-600');
            this.showOfflineIndicator();
            
            setTimeout(() => {
                this.hideOfflineIndicator();
                // Reset styles
                setTimeout(() => {
                    this.offlineIndicator.classList.remove('bg-green-600');
                    this.offlineIndicator.classList.add('bg-yellow-600');
                    this.offlineIndicator.querySelector('span').textContent = '📵 You are offline - Changes will sync when reconnected';
                }, 300);
            }, 2000);
        }
    }

    // Handle going offline
    handleOffline() {
        this.isOnline = false;
        this.showOfflineIndicator();
    }

    // Get online status
    getOnlineStatus() {
        return this.isOnline;
    }
}

// Export singleton instance
export const offlineUI = new OfflineUI();