// Data Export Module
// Handles exporting workout data in various formats

import { appState } from './state-manager.js';

export class DataExporter {
    constructor() {
        console.log('📦 Data Exporter initialized');
    }

    // Export all data as JSON
    exportAsJSON() {
        const data = this.prepareExportData();
        const jsonString = JSON.stringify(data, null, 2);
        this.downloadFile(jsonString, 'kettlebell-data.json', 'application/json');
    }
    // Export workouts as CSV
    exportAsCSV() {
    const workouts = appState.getWorkouts();
    const csvContent = this.convertWorkoutsToCSV(workouts);
    this.downloadFile(csvContent, 'kettlebell-workouts.csv', 'text/csv');
}

// Convert workouts to CSV format
convertWorkoutsToCSV(workouts) {
    if (workouts.length === 0) {
        return 'No workouts to export';
    }

    // CSV Headers
    const headers = [
        'Date', 'Workout Name', 'Format', 'Exercise Name', 'Weight (kg)', 
        'Reps', 'Sets', 'Total Volume (kg)', 'Time Completed', 'Notes'
    ];

    let csvRows = [headers.join(',')];

    // Convert each workout to CSV rows
    workouts.forEach(workout => {
        const baseData = {
            date: workout.date,
            name: workout.name,
            format: workout.format,
            totalVolume: workout.totalVolume || 0,
            timeCompleted: workout.timeCompletedSeconds ? this.formatTime(workout.timeCompletedSeconds) : '',
            overallNotes: workout.notes || ''
        };

        // Add a row for each exercise
        workout.exercises.forEach(exercise => {
            const row = [
                baseData.date,
                `"${baseData.name}"`,
                baseData.format,
                `"${exercise.name}"`,
                exercise.weight || 0,
                exercise.reps || 0,
                exercise.sets || '',
                baseData.totalVolume,
                baseData.timeCompleted,
                `"${exercise.notes || baseData.overallNotes}"`
            ];
            csvRows.push(row.join(','));
        });
    });

    return csvRows.join('\n');
}

// Helper method to format time
formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

    // Prepare data for export
    prepareExportData() {
        const workouts = appState.getWorkouts();
        const profile = appState.getState().userProfile;
        
        return {
            exportInfo: {
                appName: 'Kettlebell Tracker Pro',
                version: '2.0',
                exportDate: new Date().toISOString(),
                totalWorkouts: workouts.length
            },
            workouts: workouts,
            userProfile: profile,
            summary: {
                dateRange: this.getDateRange(workouts),
                totalVolume: this.calculateTotalVolume(workouts),
                uniqueExercises: this.getUniqueExercises(workouts)
            }
        };
    }

    // Helper methods
    getDateRange(workouts) {
        if (workouts.length === 0) return null;
        const dates = workouts.map(w => new Date(w.date)).sort();
        return {
            earliest: dates[0].toISOString(),
            latest: dates[dates.length - 1].toISOString()
        };
    }

    calculateTotalVolume(workouts) {
        return workouts.reduce((total, workout) => total + (workout.totalVolume || 0), 0);
    }

    getUniqueExercises(workouts) {
        const exercises = new Set();
        workouts.forEach(workout => {
            workout.exercises.forEach(ex => exercises.add(ex.name));
        });
        return Array.from(exercises);
    }

    // Download file helper
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        console.log('📁 File downloaded:', filename);
    }
}