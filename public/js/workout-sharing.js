// workout-sharing.js - Workout Sharing Module
// Handles sharing individual workouts and weekly summaries via Web Share API or clipboard

export class WorkoutSharing {
    constructor() {
        this.shareApiSupported = navigator.share !== undefined;
        console.log('WorkoutSharing initialized. Web Share API supported:', this.shareApiSupported);
    }

    // Format a single workout for sharing
    formatWorkoutForSharing(workout) {
        if (!workout) return null;

        const date = new Date(workout.date).toLocaleDateString();
        const exercises = workout.exercises.map(ex => {
            let exerciseText = `• ${ex.name}`;
            if (ex.weight) exerciseText += ` @ ${ex.weight}kg`;
            if (ex.reps) exerciseText += ` x ${ex.reps} reps`;
            if (ex.sets && workout.format === 'single') exerciseText += ` x ${ex.sets} sets`;
            if (ex.isPerArm) exerciseText += ` (each arm)`;
            return exerciseText;
        }).join('\n');

        let formatDetails = '';
        if (workout.format === 'superset') {
            formatDetails = `\nRounds: ${workout.details.rounds}`;
        } else if (workout.format === 'amrap') {
            formatDetails = `\nDuration: ${workout.details.durationMinutes} min | Completed: ${workout.details.roundsCompleted}`;
        } else if (workout.format === 'emom') {
            formatDetails = `\nDuration: ${workout.details.durationMinutes} min (Every ${workout.details.intervalMinutes} min)`;
        }

        const totalVolume = workout.totalVolume ? `\n\n💪 Total Volume: ${workout.totalVolume.toFixed(1)}kg` : '';
        const totalReps = workout.calculatedTotalReps ? `\n📊 Total Reps: ${workout.calculatedTotalReps}` : '';
        const timeCompleted = workout.timeCompletedSeconds ? `\n⏱️ Time: ${this.formatTime(workout.timeCompletedSeconds)}` : '';

        return {
            title: `Kettlebell Workout: ${workout.name || 'Session'}`,
            text: `🏋️ ${workout.name || 'Workout Session'} - ${date}\n` +
                  `📋 Format: ${workout.format.toUpperCase()}${formatDetails}\n\n` +
                  `Exercises:\n${exercises}` +
                  `${totalVolume}${totalReps}${timeCompleted}` +
                  `${workout.notes ? '\n\n📝 Notes: ' + workout.notes : ''}` +
                  `\n\n#KettlebellTraining #Fitness`,
            url: window.location.href
        };
    }

    // Helper function to format time
    formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Share via Web Share API or fallback to clipboard
    async shareContent(shareData) {
        if (this.shareApiSupported) {
            try {
                await navigator.share(shareData);
                return { success: true, method: 'share' };
            } catch (error) {
                if (error.name === 'AbortError') {
                    return { success: false, cancelled: true };
                }
                // Fall back to clipboard
                return await this.copyToClipboard(shareData);
            }
        } else {
            // No Web Share API support, use clipboard
            return await this.copyToClipboard(shareData);
        }
    }

    // Copy formatted text to clipboard
    async copyToClipboard(shareData) {
        const textContent = `${shareData.title}\n\n${shareData.text}`;
        
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textContent);
                return { success: true, method: 'clipboard' };
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = textContent;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                return { success, method: 'clipboard-fallback' };
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return { success: false, error };
        }
    }

    // Share individual workout
    async shareWorkout(workout) {
        const shareData = this.formatWorkoutForSharing(workout);
        if (!shareData) {
            return { success: false, error: 'Invalid workout data' };
        }
        return await this.shareContent(shareData);
    }

    // Share weekly summary
    async shareWeeklySummary(workouts) {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        startOfWeek.setHours(0, 0, 0, 0);
        
        const weeklyWorkouts = workouts.filter(w => 
            new Date(w.date) >= startOfWeek
        );
        
        if (weeklyWorkouts.length === 0) {
            return { success: false, error: 'No workouts this week to share' };
        }
        
        const shareData = this.formatWeeklySummaryForSharing(
            weeklyWorkouts, 
            startOfWeek, 
            now
        );
        return await this.shareContent(shareData);
    }

    // Format weekly summary for sharing
    formatWeeklySummaryForSharing(workouts, startDate, endDate) {
        const totalWorkouts = workouts.length;
        const totalVolume = workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
        const totalReps = workouts.reduce((sum, w) => sum + (w.calculatedTotalReps || 0), 0);
        const totalTime = workouts.reduce((sum, w) => sum + (w.timeCompletedSeconds || 0), 0);
        
        // Get unique exercises
        const exerciseCounts = {};
        workouts.forEach(workout => {
            workout.exercises.forEach(ex => {
                exerciseCounts[ex.name] = (exerciseCounts[ex.name] || 0) + 1;
            });
        });
        
        const topExercises = Object.entries(exerciseCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => `• ${name} (${count}x)`)
            .join('\n');

        const dateRange = `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;

        return {
            title: 'Weekly Kettlebell Training Summary',
            text: `🎯 Weekly Training Summary\n` +
                  `📅 ${dateRange}\n\n` +
                  `📊 Stats:\n` +
                  `• Workouts: ${totalWorkouts}\n` +
                  `• Total Volume: ${totalVolume.toFixed(1)}kg\n` +
                  `• Total Reps: ${totalReps}\n` +
                  `• Total Time: ${this.formatTime(totalTime)}\n\n` +
                  `🏋️ Top Exercises:\n${topExercises}\n\n` +
                  `#KettlebellTraining #WeeklyProgress #Fitness`,
            url: window.location.href
        };
    }
}

// Export singleton instance
export const workoutSharing = new WorkoutSharing();