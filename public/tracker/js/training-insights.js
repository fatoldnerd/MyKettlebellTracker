// Training Insights Module
// Advanced analytics and calculations for workout data

export class TrainingInsights {
    constructor() {
        console.log('🏆 Training Insights Calculator initialized');
    }

    // Calculate consecutive workout days streak
    calculateStreak(workouts) {
        if (!workouts || workouts.length === 0) return 0;
        
        const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = 0;
        let currentDate = new Date(today);
        
        // Check last 60 days for streak
        for (let i = 0; i < 60; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const hasWorkout = sortedWorkouts.some(w => w.date === dateStr);
            
            if (hasWorkout) {
                streak++;
            } else if (streak > 0) {
                break; // Streak is broken
            }
            
            currentDate.setDate(currentDate.getDate() - 1);
        }
        
        return streak;
    }

    // Calculate average volume per workout
    calculateAverageVolume(workouts) {
        if (!workouts || workouts.length === 0) return 0;
        
        const totalVolume = workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
        return Math.round(totalVolume / workouts.length);
    }

    // Find the best week (most workouts in a 7-day period)
    calculateBestWeek(workouts) {
        if (!workouts || workouts.length === 0) return 0;
        
        const weeklyWorkouts = {};
        
        workouts.forEach(workout => {
            const date = new Date(workout.date);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
            const weekKey = weekStart.toISOString().split('T')[0];
            
            weeklyWorkouts[weekKey] = (weeklyWorkouts[weekKey] || 0) + 1;
        });
        
        return Math.max(...Object.values(weeklyWorkouts), 0);
    }

    // Total number of workout sessions
    calculateTotalSessions(workouts) {
        return workouts ? workouts.length : 0;
    }

    // Calculate workout frequency by day of week
    calculateWeeklyFrequency(workouts) {
        if (!workouts || workouts.length === 0) return {};
        
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const frequency = {};
        
        // Initialize all days to 0
        dayNames.forEach(day => frequency[day] = 0);
        
        workouts.forEach(workout => {
            const date = new Date(workout.date);
            const dayName = dayNames[date.getDay()];
            frequency[dayName]++;
        });
        
        return frequency;
    }

    // Calculate monthly workout totals
    calculateMonthlyTotals(workouts) {
        if (!workouts || workouts.length === 0) return {};
        
        const monthlyTotals = {};
        
        workouts.forEach(workout => {
            const date = new Date(workout.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = {
                    workouts: 0,
                    totalVolume: 0,
                    totalReps: 0
                };
            }
            
            monthlyTotals[monthKey].workouts++;
            monthlyTotals[monthKey].totalVolume += workout.totalVolume || 0;
            monthlyTotals[monthKey].totalReps += workout.calculatedTotalReps || 0;
        });
        
        return monthlyTotals;
    }

    // Calculate exercise popularity
    calculateExerciseFrequency(workouts) {
        if (!workouts || workouts.length === 0) return {};
        
        const exerciseFreq = {};
        
        workouts.forEach(workout => {
            if (workout.exercises) {
                workout.exercises.forEach(exercise => {
                    if (exercise.name) {
                        exerciseFreq[exercise.name] = (exerciseFreq[exercise.name] || 0) + 1;
                    }
                });
            }
        });
        
        return exerciseFreq;
    }

    // Calculate volume progression over time
    calculateVolumeProgression(workouts, days = 30) {
        if (!workouts || workouts.length === 0) return [];
        
        const sortedWorkouts = [...workouts]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-days);
        
        return sortedWorkouts.map(workout => ({
            date: workout.date,
            volume: workout.totalVolume || 0,
            reps: workout.calculatedTotalReps || 0
        }));
    }

    // Calculate personal records
    calculatePersonalRecords(workouts) {
        if (!workouts || workouts.length === 0) return { volume: null, reps: null, streak: 0 };
        
        const maxVolume = Math.max(...workouts.map(w => w.totalVolume || 0));
        const maxReps = Math.max(...workouts.map(w => w.calculatedTotalReps || 0));
        const currentStreak = this.calculateStreak(workouts);
        
        return {
            volume: maxVolume > 0 ? maxVolume : null,
            reps: maxReps > 0 ? maxReps : null,
            streak: currentStreak
        };
    }

    // Calculate all insights at once
    calculateAllInsights(workouts) {
        const insights = {
            // Basic metrics
            streak: this.calculateStreak(workouts),
            avgVolume: this.calculateAverageVolume(workouts),
            bestWeek: this.calculateBestWeek(workouts),
            totalSessions: this.calculateTotalSessions(workouts),
            
            // Advanced metrics
            weeklyFrequency: this.calculateWeeklyFrequency(workouts),
            monthlyTotals: this.calculateMonthlyTotals(workouts),
            exerciseFrequency: this.calculateExerciseFrequency(workouts),
            volumeProgression: this.calculateVolumeProgression(workouts),
            personalRecords: this.calculatePersonalRecords(workouts)
        };
        
        return insights;
    }

    // Update DOM elements with insights
    updateInsightsDisplay(workouts) {
        const insights = this.calculateAllInsights(workouts);
        
        // Update basic insight cards
        this.updateElement('streakCount', insights.streak);
        this.updateElement('avgVolume', insights.avgVolume + 'kg');
        this.updateElement('bestWeek', insights.bestWeek);
        this.updateElement('totalSessions', insights.totalSessions);
        
        console.log('🏆 Training insights updated:', {
            streak: insights.streak,
            avgVolume: insights.avgVolume,
            bestWeek: insights.bestWeek,
            totalSessions: insights.totalSessions
        });
        
        return insights;
    }

    // Helper method to update DOM elements safely
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    // Get insights for a specific time period
    getInsightsForPeriod(workouts, startDate, endDate) {
        if (!workouts || workouts.length === 0) return this.calculateAllInsights([]);
        
        const filteredWorkouts = workouts.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate >= new Date(startDate) && workoutDate <= new Date(endDate);
        });
        
        return this.calculateAllInsights(filteredWorkouts);
    }

    // Compare two time periods
    comparePerformance(workouts, period1Start, period1End, period2Start, period2End) {
        const period1Insights = this.getInsightsForPeriod(workouts, period1Start, period1End);
        const period2Insights = this.getInsightsForPeriod(workouts, period2Start, period2End);
        
        return {
            period1: period1Insights,
            period2: period2Insights,
            changes: {
                avgVolume: period2Insights.avgVolume - period1Insights.avgVolume,
                totalSessions: period2Insights.totalSessions - period1Insights.totalSessions,
                streak: period2Insights.streak - period1Insights.streak
            }
        };
    }
}

// Export singleton instance
export const trainingInsights = new TrainingInsights();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.trainingInsights = trainingInsights;
}