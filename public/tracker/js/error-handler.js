// Error Handler Module
// Centralized error handling and logging

export class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50; // Keep last 50 errors
        this.setupGlobalErrorHandling();
        console.log('🛡️ Error Handler initialized');
    }

    // Setup global error catching
    setupGlobalErrorHandling() {
        // Catch JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'JavaScript Error', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Promise Rejection', {
                promise: event.promise
            });
        });
    }

    // Main error handling method
    handleError(error, type = 'Unknown Error', context = {}) {
        const errorInfo = {
            id: this.generateErrorId(),
            message: this.extractErrorMessage(error),
            type: type,
            timestamp: new Date().toISOString(),
            context: context,
            stack: error?.stack || 'No stack trace available',
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Add to error log
        this.errors.push(errorInfo);
        
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Log to console
        console.error(`🚨 ${type}:`, error);
        console.error('Error Context:', context);

        // Notify other parts of the app if needed
        this.notifyErrorListeners(errorInfo);

        return errorInfo;
    }

    // Extract meaningful error message
    extractErrorMessage(error) {
        if (typeof error === 'string') return error;
        if (error?.message) return error.message;
        if (error?.toString) return error.toString();
        return 'Unknown error occurred';
    }

    // Generate unique error ID
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get all errors
    getErrors() {
        return [...this.errors];
    }

    // Get recent errors
    getRecentErrors(count = 10) {
        return this.errors.slice(-count);
    }

    // Get errors by type
    getErrorsByType(type) {
        return this.errors.filter(error => error.type === type);
    }

    // Clear all errors
    clearErrors() {
        this.errors = [];
        console.log('🧹 Error log cleared');
    }

    // Clear old errors (older than specified hours)
    clearOldErrors(hoursOld = 24) {
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - hoursOld);
        
        const initialCount = this.errors.length;
        this.errors = this.errors.filter(error => 
            new Date(error.timestamp) > cutoffTime
        );
        
        const clearedCount = initialCount - this.errors.length;
        if (clearedCount > 0) {
            console.log(`🧹 Cleared ${clearedCount} old errors`);
        }
    }

    // Log custom error
    logError(message, type = 'Custom Error', context = {}) {
        const error = new Error(message);
        return this.handleError(error, type, context);
    }

    // Log warning (non-breaking)
    logWarning(message, context = {}) {
        const warning = {
            id: this.generateErrorId(),
            message: message,
            type: 'Warning',
            timestamp: new Date().toISOString(),
            context: context,
            severity: 'warning'
        };
        
        this.errors.push(warning);
        console.warn('⚠️ Warning:', message, context);
        
        return warning;
    }

    // Error listener system
    errorListeners = [];

    addErrorListener(callback) {
        this.errorListeners.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.errorListeners.indexOf(callback);
            if (index > -1) {
                this.errorListeners.splice(index, 1);
            }
        };
    }

    notifyErrorListeners(errorInfo) {
        this.errorListeners.forEach(listener => {
            try {
                listener(errorInfo);
            } catch (error) {
                console.error('Error in error listener:', error);
            }
        });
    }

    // Get error statistics
    getErrorStats() {
        const stats = {
            total: this.errors.length,
            byType: {},
            recentCount: 0,
            oldestError: null,
            newestError: null
        };

        // Count by type
        this.errors.forEach(error => {
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
        });

        // Recent errors (last hour)
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        stats.recentCount = this.errors.filter(error => 
            new Date(error.timestamp) > oneHourAgo
        ).length;

        // Oldest and newest
        if (this.errors.length > 0) {
            stats.oldestError = this.errors[0].timestamp;
            stats.newestError = this.errors[this.errors.length - 1].timestamp;
        }

        return stats;
    }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.errorHandler = errorHandler;
}