// workout-templates.js
export class WorkoutTemplates {
    constructor() {
        this.templates = {
            'beginner-swing': {
                name: 'Beginner Swings',
                format: 'single',
                exercises: [{
                    name: 'Kettlebell Swings',
                    weight: 16,
                    reps: 10,
                    sets: 10,
                    notes: 'Focus on hip hinge movement'
                }],
                targetReps: 100,
                notes: 'Rest 30-60 seconds between sets'
            },
            'snatch-test': {
                name: 'Snatch Test',
                format: 'single',
                exercises: [{
                    name: 'Kettlebell Snatches',
                    weight: 16,
                    reps: 50,
                    sets: 1,
                    notes: 'Switch hands halfway through'
                }],
                targetReps: 100,
                notes: '5 minutes maximum, switch hands once'
            },
            'simple-sinister': {
                name: 'Simple & Sinister',
                format: 'superset',
                exercises: [
                    {
                        name: 'Kettlebell Swings',
                        weight: 32,
                        reps: 10,
                        notes: 'Two-handed swings'
                    },
                    {
                        name: 'Turkish Get-ups',
                        weight: 32,
                        reps: 1,
                        notes: 'Each side alternating'
                    }
                ],
                rounds: 10,
                notes: 'Rest as needed between rounds'
            },
            '10k-swing-challenge': {
                name: '10,000 Swing Challenge',
                format: 'single',
                exercises: [{
                    name: 'Kettlebell Swings',
                    weight: 24,
                    reps: 500,
                    sets: 1,
                    notes: 'Break into manageable sets - suggested 50 sets of 10 or 25 sets of 20'
                }],
                targetReps: 500,
                notes: 'Daily session toward 10,000 swing goal. Track weekly progress!'
            },
            'heavy-swings-grinds': {
                name: 'Heavy Swings & Grinds',
                format: 'superset',
                exercises: [
                    {
                        name: 'Kettlebell Swings',
                        weight: 32,
                        reps: 8,
                        notes: 'Heavy two-hand swings - focus on explosive power'
                    },
                    {
                        name: 'Goblet Squats',
                        weight: 24,
                        reps: 5,
                        notes: 'Controlled descent, pause at bottom'
                    },
                    {
                        name: 'Military Press',
                        weight: 20,
                        reps: 3,
                        notes: 'Single arm press each side - strict form'
                    }
                ],
                rounds: 4,
                notes: 'Rest 90-120 seconds between rounds. Focus on strength and power over speed.'
            },
            'flow-active-recovery': {
                name: 'Kettlebell Flow & Active Recovery',
                format: 'amrap',
                exercises: [
                    {
                        name: 'Kettlebell Swings',
                        weight: 12,
                        reps: 10,
                        notes: 'Light swings - smooth rhythm'
                    },
                    {
                        name: 'Goblet Squats',
                        weight: 12,
                        reps: 8,
                        notes: 'Focus on depth and mobility'
                    },
                    {
                        name: 'Kettlebell Press',
                        weight: 8,
                        reps: 6,
                        notes: 'Alternating arms - controlled movement'
                    }
                ],
                durationMinutes: 15,
                roundsCompleted: 'Focus on movement quality',
                notes: 'Continuous flow with minimal rest. Perfect for active recovery days.'
            }
        };
    }

    getTemplate(templateId) {
        return this.templates[templateId] || null;
    }

    getAllTemplates() {
        return Object.keys(this.templates).map(id => ({
            id,
            name: this.templates[id].name,
            format: this.templates[id].format
        }));
    }
}