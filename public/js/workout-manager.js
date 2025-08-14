// Workout Manager Module
// Handles workout creation, validation, and business logic

import { appState } from './state-manager.js';
import { errorHandler } from './error-handler.js';
import { firebaseManager } from './firebase-manager.js';

export class WorkoutManager {
    constructor() {
        this.predefinedExercises = [
            "Kettlebell Snatches", "Kettlebell Swings", "Kettlebell Cleans", 
            "Turkish Get-ups", "Kettlebell Press", "Push-ups", "Military Press",
            "Pull-ups", "Dips", "Goblet Squats", "Bent-Over Rows", "Other"
        ];
        
        console.log('💪 Workout Manager initialized');
    }

    // Validate workout data
    validateWorkout(workoutData) {
        const errors = [];
        
        if (!workoutData.date) {
            errors.push('Date is required');
        }
        
        if (!workoutData.exercises || workoutData.exercises.length === 0) {
            errors.push('At least one exercise is required');
        }
        
        if (workoutData.exercises) {
            workoutData.exercises.forEach((exercise, index) => {
                if (!exercise.name) {
                    errors.push(`Exercise ${index + 1} name is required`);
                }
                if (exercise.weight < 0) {
                    errors.push(`Exercise ${index + 1} weight cannot be negative`);
                }
                if (exercise.reps <= 0) {
                    errors.push(`Exercise ${index + 1} reps must be positive`);
                }
            });
        }
        
        return errors;
    }

    // Parse time string (MM:SS) to seconds
    parseTimeToSeconds(timeString) {
        if (!timeString || timeString.trim() === '') return null;
        
        const timeParts = timeString.split(':');
        if (timeParts.length === 2) {
            const minutes = parseInt(timeParts[0]);
            const seconds = parseInt(timeParts[1]);
            
            if (!isNaN(minutes) && !isNaN(seconds) && 
                seconds >= 0 && seconds < 60 && minutes >= 0) {
                return (minutes * 60) + seconds;
            }
        }
        
        throw new Error('Invalid time format. Please use MM:SS or leave blank.');
    }

    // Format seconds to MM:SS
    formatSecondsToTime(totalSeconds) {
        if (totalSeconds == null) return '';
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Create workout data from form
    createWorkoutFromForm(formData) {
        try {
            // Parse time if provided
            let timeCompletedSeconds = null;
            if (formData.timeCompleted) {
                timeCompletedSeconds = this.parseTimeToSeconds(formData.timeCompleted);
            }

            const workoutData = {
                date: formData.date,
                name: formData.name || "Unnamed Workout",
                format: formData.format,
                exercises: [],
                details: {},
                notes: formData.notes || "",
                totalVolume: 0,
                calculatedTotalReps: 0,
                targetRepsOverall: null,
                timeCompletedSeconds: timeCompletedSeconds
            };

            // Process based on format
            if (formData.format === 'single') {
                this.processSingleExercise(workoutData, formData);
            } else if (formData.format === 'superset') {
                this.processSuperset(workoutData, formData);
            } else if (formData.format === 'amrap') {
                this.processAmrap(workoutData, formData);
            } else if (formData.format === 'emom') {
                this.processEmom(workoutData, formData);
            }

            // Validate the workout
            const validationErrors = this.validateWorkout(workoutData);
            if (validationErrors.length > 0) {
                console.log('Validation errors:', validationErrors, workoutData);
                throw new Error(validationErrors.join(', '));
            }

            return workoutData;

        } catch (error) {
            errorHandler.handleError(error, 'Workout Creation Error');
            throw error;
        }
    }

    // Process single exercise format
    processSingleExercise(workoutData, formData) {
        const exercise = formData.singleExercise;
        if (!exercise) {
            throw new Error('Single exercise data is missing.');
        }
        const weight = parseFloat(exercise.weight) || 0;
        const repsPerSet = parseInt(exercise.reps) || 0;
        const sets = parseInt(exercise.sets) || 0;
        
        workoutData.targetRepsOverall = exercise.targetReps ? 
            parseInt(exercise.targetReps) : null;

        let isPerArm = false;
        if (exercise.name === "Kettlebell Snatches") {
            workoutData.calculatedTotalReps = (repsPerSet * 2) * sets;
            isPerArm = true;
        } else {
            workoutData.calculatedTotalReps = repsPerSet * sets;
        }

        workoutData.exercises.push({
            name: exercise.name,
            weight: weight,
            reps: repsPerSet,
            sets: sets,
            isPerArm: isPerArm,
            notes: exercise.notes || ""
        });

        workoutData.totalVolume = weight * workoutData.calculatedTotalReps;
    }

    // Process superset format
    processSuperset(workoutData, formData) {
        if (!Array.isArray(formData.supersetExercises) || formData.supersetExercises.length === 0) {
            throw new Error('Superset exercises data is missing.');
        }
        const rounds = parseInt(formData.supersetRounds) || 0;
        if (rounds <= 0) {
            throw new Error('Superset rounds must be greater than 0');
        }

        let sessionTotalReps = 0;
        let sessionTotalVolume = 0;

        formData.supersetExercises.forEach(exercise => {
            const weight = parseFloat(exercise.weight) || 0;
            const reps = parseInt(exercise.reps) || 0;
            const totalReps = reps * rounds;

            sessionTotalReps += totalReps;
            sessionTotalVolume += weight * totalReps;

            workoutData.exercises.push({
                name: exercise.name,
                weight: weight,
                reps: reps,
                notes: exercise.notes || ""
            });
        });

        workoutData.calculatedTotalReps = sessionTotalReps;
        workoutData.totalVolume = sessionTotalVolume;
        workoutData.details = { rounds: rounds };
    }

    // Process AMRAP format
    processAmrap(workoutData, formData) {
        if (!Array.isArray(formData.amrapExercises) || formData.amrapExercises.length === 0) {
            throw new Error('AMRAP exercises data is missing.');
        }
        const duration = parseInt(formData.amrapDuration) || 0;
        if (duration <= 0) {
            throw new Error('AMRAP duration must be greater than 0');
        }

        let sessionTotalReps = 0;
        let sessionTotalVolume = 0;

        formData.amrapExercises.forEach(exercise => {
            const weight = parseFloat(exercise.weight) || 0;
            const reps = parseInt(exercise.reps) || 0;

            sessionTotalReps += reps;
            sessionTotalVolume += weight * reps;

            workoutData.exercises.push({
                name: exercise.name,
                weight: weight,
                reps: reps,
                notes: exercise.notes || ""
            });
        });

        workoutData.calculatedTotalReps = sessionTotalReps;
        workoutData.totalVolume = sessionTotalVolume;
        workoutData.details = {
            durationMinutes: duration,
            roundsCompleted: formData.amrapRoundsCompleted || "N/A"
        };
    }

    // Process EMOM format
    processEmom(workoutData, formData) {
        if (!Array.isArray(formData.emomExercises) || formData.emomExercises.length === 0) {
            throw new Error('EMOM exercises data is missing.');
        }
        const duration = parseInt(formData.emomDuration) || 0;
        const interval = parseInt(formData.emomInterval) || 1;
        
        if (duration <= 0) {
            throw new Error('EMOM duration must be greater than 0');
        }

        const numIntervals = interval > 0 ? duration / interval : 0;
        let sessionTotalReps = 0;
        let sessionTotalVolume = 0;

        formData.emomExercises.forEach(exercise => {
            const weight = parseFloat(exercise.weight) || 0;
            const reps = parseInt(exercise.reps) || 0;
            const totalReps = reps * numIntervals;

            sessionTotalReps += totalReps;
            sessionTotalVolume += weight * totalReps;

            workoutData.exercises.push({
                name: exercise.name,
                weight: weight,
                reps: reps,
                notes: exercise.notes || ""
            });
        });

        workoutData.calculatedTotalReps = sessionTotalReps;
        workoutData.totalVolume = sessionTotalVolume;
        workoutData.details = {
            durationMinutes: duration,
            intervalMinutes: interval
        };
    }

    // Add workout (delegates to Firebase Manager)
    async addWorkout(workoutData) {
        try {
            await firebaseManager.addWorkout(workoutData);
            console.log('💪 Workout added successfully');
            return true;
        } catch (error) {
            errorHandler.handleError(error, 'Add Workout Error');
            throw error;
        }
    }

    // Delete workout (delegates to Firebase Manager)
    async deleteWorkout(workoutId) {
        try {
            await firebaseManager.deleteWorkout(workoutId);
            console.log('🗑️ Workout deleted successfully');
            return true;
        } catch (error) {
            errorHandler.handleError(error, 'Delete Workout Error');
            throw error;
        }
    }

    // Get workout statistics
    getWorkoutStats(workouts = null) {
        const data = workouts || appState.getWorkouts();
        
        if (!data || data.length === 0) {
            return {
                totalWorkouts: 0,
                totalVolume: 0,
                totalReps: 0,
                averageVolume: 0,
                averageReps: 0,
                exerciseCount: 0
            };
        }

        const totalVolume = data.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
        const totalReps = data.reduce((sum, w) => sum + (w.calculatedTotalReps || 0), 0);
        
        // Count unique exercises
        const exercises = new Set();
        data.forEach(workout => {
            if (workout.exercises) {
                workout.exercises.forEach(ex => {
                    if (ex.name) exercises.add(ex.name);
                });
            }
        });

        return {
            totalWorkouts: data.length,
            totalVolume: totalVolume,
            totalReps: totalReps,
            averageVolume: Math.round(totalVolume / data.length),
            averageReps: Math.round(totalReps / data.length),
            exerciseCount: exercises.size
        };
    }

    // Get workouts by date range
    getWorkoutsByDateRange(startDate, endDate, workouts = null) {
        const data = workouts || appState.getWorkouts();
        
        return data.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate >= new Date(startDate) && workoutDate <= new Date(endDate);
        });
    }

    // Get workouts by exercise
    getWorkoutsByExercise(exerciseName, workouts = null) {
        const data = workouts || appState.getWorkouts();
        
        return data.filter(workout => {
            return workout.exercises && workout.exercises.some(ex => ex.name === exerciseName);
        });
    }

    // Get personal records
    getPersonalRecords(workouts = null) {
        const data = workouts || appState.getWorkouts();
        const repPRs = {};
        const weightPRs = {};

        data.forEach(session => {
            if (session.exercises) {
                session.exercises.forEach(ex => {
                    if (ex.name && ex.weight != null && ex.reps != null && 
                        session.format === 'single' && ex.sets != null) {
                        
                        // Rep PRs (max reps at each weight)
                        if (!repPRs[ex.name]) repPRs[ex.name] = {};
                        if (!repPRs[ex.name][ex.weight] || 
                            ex.reps > repPRs[ex.name][ex.weight].reps) {
                            repPRs[ex.name][ex.weight] = {
                                reps: ex.reps,
                                date: session.date,
                                isPerArm: ex.isPerArm
                            };
                        }

                        // Weight PRs (max weight at each rep count)
                        if (!weightPRs[ex.name]) weightPRs[ex.name] = {};
                        if (!weightPRs[ex.name][ex.reps] || 
                            ex.weight > weightPRs[ex.name][ex.reps].weight) {
                            weightPRs[ex.name][ex.reps] = {
                                weight: ex.weight,
                                date: session.date,
                                isPerArm: ex.isPerArm
                            };
                        }
                    }
                });
            }
        });

        return { repPRs, weightPRs };
    }

    // Get predefined exercises list
    getPredefinedExercises() {
        return [...this.predefinedExercises];
    }

    // Get all unique exercises from workout history
    getUniqueExercises(workouts = null) {
        const data = workouts || appState.getWorkouts();
        const exercises = new Set();
        
        data.forEach(workout => {
            if (workout.exercises) {
                workout.exercises.forEach(ex => {
                    if (ex.name && ex.name.trim() !== "" && ex.name !== "Other") {
                        exercises.add(ex.name.trim());
                    }
                });
            }
        });

        // Combine with predefined exercises
        this.predefinedExercises.forEach(ex => {
            if (ex !== "Other") exercises.add(ex);
        });

        return Array.from(exercises).sort();
    }
}

// Export singleton instance
export const workoutManager = new WorkoutManager();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.workoutManager = workoutManager;
}