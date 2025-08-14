// Firebase Manager Module
// Handles all Firebase operations including auth and Firestore

import { appState } from './state-manager.js';
import { errorHandler } from './error-handler.js';
import { offlineStorage } from './offline-storage.js';

// Firebase imports - these will be loaded from CDN
let initializeApp, getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, 
    GoogleAuthProvider, signInWithPopup, signOut, updateProfile, getFirestore, 
    collection, addDoc, onSnapshot, query, deleteDoc, doc, setDoc, getDoc, serverTimestamp, setLogLevel;

export class FirebaseManager {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.initialized = false;
        this.appId = 'my-kettlebell-app-v11-prod';
        this.unsubscribeWorkouts = null;
        
        console.log('🔥 Firebase Manager created');
    }

    // Initialize Firebase with your config
    async initialize() {
        try {
            // Wait for Firebase to be loaded from CDN
            await this.waitForFirebase();
            
            // Your Firebase configuration
            const firebaseConfig = {
                apiKey: "AIzaSyBfTiGJe44ShTccYGGKxEh1aRitgPP0F1Q",
                authDomain: "my-kettlebell-tracker.firebaseapp.com",
                projectId: "my-kettlebell-tracker",
                storageBucket: "my-kettlebell-tracker.firebasestorage.app",
                messagingSenderId: "571030898720",
                appId: "1:571030898720:web:84131ba0f94b478cf91445",
                measurementId: "G-JHLNMNMH5X"
            };

            // Initialize Firebase
            this.app = initializeApp(firebaseConfig);
            this.db = getFirestore(this.app);
            this.auth = getAuth(this.app);
            setLogLevel('debug');
            
            // Use emulators if running locally
            if (window.location.hostname === 'localhost') {
                // Ensure useEmulator is available from CDN
                const firestoreUseEmulator = window.firebaseFirestore?.connectFirestoreEmulator || window.firebaseFirestore?.useEmulator;
                const authUseEmulator = window.firebaseAuth?.connectAuthEmulator || window.firebaseAuth?.useEmulator;
                if (firestoreUseEmulator) {
                    firestoreUseEmulator(this.db, 'localhost', 8080);
                }
                if (authUseEmulator) {
                    authUseEmulator(this.auth, 'http://localhost:9099');
                }
                console.log('🔥 Using Firebase emulators for local development');
            }
            
            this.initialized = true;
            console.log('✅ Firebase initialized successfully');
            
            // Setup authentication
            this.setupAuth();
            
        } catch (error) {
            errorHandler.handleError(error, 'Firebase Initialization Error');
            throw error;
        }
    }

    // Wait for Firebase to be loaded from CDN
    async waitForFirebase() {
        return new Promise((resolve, reject) => {
            const checkFirebase = () => {
                if (typeof window.firebase !== 'undefined') {
                    // Firebase v9+ modular imports
                    const firebaseAuth = window.firebaseAuth;
                    const firebaseFirestore = window.firebaseFirestore;
                    const firebaseApp = window.firebaseApp;
                    
                    if (firebaseApp && firebaseAuth && firebaseFirestore) {
                        // Assign Firebase functions
                        initializeApp = firebaseApp.initializeApp;
                        getAuth = firebaseAuth.getAuth;
                        signInAnonymously = firebaseAuth.signInAnonymously;
                        signInWithCustomToken = firebaseAuth.signInWithCustomToken;
                        onAuthStateChanged = firebaseAuth.onAuthStateChanged;
                        GoogleAuthProvider = firebaseAuth.GoogleAuthProvider;
                        signInWithPopup = firebaseAuth.signInWithPopup;
                        signOut = firebaseAuth.signOut;
                        updateProfile = firebaseAuth.updateProfile;
                        
                        getFirestore = firebaseFirestore.getFirestore;
                        collection = firebaseFirestore.collection;
                        addDoc = firebaseFirestore.addDoc;
                        onSnapshot = firebaseFirestore.onSnapshot;
                        query = firebaseFirestore.query;
                        deleteDoc = firebaseFirestore.deleteDoc;
                        doc = firebaseFirestore.doc;
                        setDoc = firebaseFirestore.setDoc;
                        getDoc = firebaseFirestore.getDoc;
                        serverTimestamp = firebaseFirestore.serverTimestamp;
                        setLogLevel = firebaseApp.setLogLevel;
                        
                        resolve();
                    } else {
                        setTimeout(checkFirebase, 100);
                    }
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            
            checkFirebase();
            
            // Timeout after 10 seconds
            setTimeout(() => reject(new Error('Firebase loading timeout')), 10000);
        });
    }

    // Setup authentication flow
    setupAuth() {
        onAuthStateChanged(this.auth, async (user) => {
            console.log('🔐 Auth state changed:', user ? user.uid : 'null');
            
            try {
                if (user) {
                    appState.setState({ 
                        userId: user.uid,
                        user: user,
                        isLoading: false
                    });
                    
                    // Load user data
                    await this.loadUserData(user.uid);
                } else {
                    console.log('No user, attempting anonymous sign-in...');
                    appState.setState({ 
                        userId: null,
                        user: null,
                        workouts: [],
                        userProfile: null
                    });
                    
                    await this.signInAnonymouslyIfNeeded();
                }
            } catch (error) {
                errorHandler.handleError(error, 'Auth State Change Error');
            }
        });
    }

    // Anonymous sign-in fallback
    async signInAnonymouslyIfNeeded() {
        if (!this.auth.currentUser) {
            try {
                console.log('🔐 Attempting anonymous sign-in...');
                await signInAnonymously(this.auth);
            } catch (error) {
                errorHandler.handleError(error, 'Anonymous Sign-in Error');
                // Fallback to local mode
                const localUserId = `local-error-${crypto.randomUUID()}`;
                appState.setState({ userId: localUserId, workouts: [] });
            }
        }
    }

    // Google sign-in
    async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        try {
            appState.setLoading(true);
            await signInWithPopup(this.auth, provider);
        } catch (error) {
            errorHandler.handleError(error, 'Google Sign-in Error');
            if (error.code !== 'auth/popup-closed-by-user' && 
                error.code !== 'auth/cancelled-popup-request') {
                throw error;
            }
        } finally {
            appState.setLoading(false);
        }
    }

    // Sign out
    async signOutUser() {
        try {
            appState.setLoading(true);
            
            // Clean up subscriptions
            if (this.unsubscribeWorkouts) {
                this.unsubscribeWorkouts();
                this.unsubscribeWorkouts = null;
            }
            
            await signOut(this.auth);
            console.log('🔐 User signed out successfully');
        } catch (error) {
            errorHandler.handleError(error, 'Sign Out Error');
            throw error;
        } finally {
            appState.setLoading(false);
        }
    }

    // Load user data (workouts and profile)
    async loadUserData(userId) {
        try {
            // Load workouts
            await this.loadWorkouts(userId);
            
            // Load user profile
            await this.loadUserProfile(userId);
            
        } catch (error) {
            errorHandler.handleError(error, 'User Data Loading Error');
        }
    }

    // Load workouts with real-time updates
    async loadWorkouts(userId) {
        const workoutsPath = `artifacts/${this.appId}/users/${userId}/kettlebellWorkouts_v11`;
        
        try {
            appState.setLoading(true);
            
            // First, load from local storage for immediate display
            const localWorkouts = await offlineStorage.getWorkouts(userId);
            if (localWorkouts.length > 0) {
                appState.setWorkouts(localWorkouts);
            }
            
            // Clean up existing subscription
            if (this.unsubscribeWorkouts) {
                this.unsubscribeWorkouts();
            }
            
            // If online, set up real-time sync
            if (navigator.onLine) {
                const q = query(collection(this.db, workoutsPath));
                
                this.unsubscribeWorkouts = onSnapshot(q, async (querySnapshot) => {
                    const workouts = [];
                    querySnapshot.forEach((doc) => {
                        const workout = { id: doc.id, ...doc.data() };
                        workouts.push(workout);
                        // Save to local storage
                        offlineStorage.saveWorkout({ ...workout, userId });
                    });
                    
                    // Sort by date (newest first)
                    workouts.sort((a, b) => {
                        const dateA = new Date(b.date);
                        const dateB = new Date(a.date);
                        return dateA - dateB || new Date(b.createdAt) - new Date(a.createdAt);
                    });
                
                appState.setWorkouts(workouts);
                console.log(`📊 Loaded ${workouts.length} workouts`);
            }, (error) => {
                errorHandler.handleError(error, 'Workouts Loading Error');
                appState.setWorkouts([]);
            });
            
        } catch (error) {
            errorHandler.handleError(error, 'Workouts Setup Error');
            appState.setWorkouts([]);
        } finally {
            appState.setLoading(false);
        }
    }

    // Load user profile
    async loadUserProfile(userId) {
        try {
            const docRef = doc(this.db, "userProfiles", userId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const profile = docSnap.data();
                appState.setState({ userProfile: profile });
                console.log('👤 Profile loaded');
            } else {
                // Create default profile
                const defaultProfile = {
                    displayName: this.auth.currentUser?.displayName || '',
                    photoURL: this.auth.currentUser?.photoURL || '',
                    age: null,
                    experienceLevel: 'Not Specified',
                    goals: '',
                    activities: '',
                    customBio: ''
                };
                appState.setState({ userProfile: defaultProfile });
            }
        } catch (error) {
            errorHandler.handleError(error, 'Profile Loading Error');
        }
    }

    // Add workout
    async addWorkout(workoutData) {
        const userId = appState.getUserId();
        if (!userId) throw new Error('User not authenticated');
        
        const workoutsPath = `artifacts/${this.appId}/users/${userId}/kettlebellWorkouts_v11`;
        
        try {
            appState.setLoading(true);
            
            // Add timestamps
            const workoutWithTimestamp = {
                ...workoutData,
                userId,
                createdAt: new Date().toISOString(),
                serverCreatedAt: serverTimestamp()
            };
            
            // If online, save to Firebase
            if (navigator.onLine) {
                const docRef = await addDoc(collection(this.db, workoutsPath), workoutWithTimestamp);
                workoutWithTimestamp.id = docRef.id;
                console.log('💪 Workout added to Firebase');
            } else {
                // If offline, generate temporary ID
                workoutWithTimestamp.id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                console.log('📵 Workout saved locally (offline)');
            }
            
            // Always save to local storage
            await offlineStorage.saveWorkout(workoutWithTimestamp);
            
            // Refresh workouts list
            await this.loadWorkouts(userId);
            
        } catch (error) {
            errorHandler.handleError(error, 'Add Workout Error');
            throw error;
        } finally {
            appState.setLoading(false);
        }
    }

    // Delete workout
    async deleteWorkout(workoutId) {
        const userId = appState.getUserId();
        if (!userId) throw new Error('User not authenticated');
        
        const workoutsPath = `artifacts/${this.appId}/users/${userId}/kettlebellWorkouts_v11`;
        
        try {
            appState.setLoading(true);
            
            // Delete from local storage
            await offlineStorage.deleteWorkout(workoutId);
            
            // If online, delete from Firebase
            if (navigator.onLine && !workoutId.startsWith('offline_')) {
                await deleteDoc(doc(this.db, workoutsPath, workoutId));
                console.log('🗑️ Workout deleted from Firebase');
            } else {
                console.log('📵 Workout deletion tracked locally');
            }
            
            // Refresh workouts list
            await this.loadWorkouts(userId);
            
        } catch (error) {
            errorHandler.handleError(error, 'Delete Workout Error');
            throw error;
        } finally {
            appState.setLoading(false);
        }
    }

    // Save user profile
    async saveUserProfile(profileData) {
        const userId = appState.getUserId();
        if (!userId) throw new Error('User not authenticated');
        
        try {
            appState.setLoading(true);
            
            const docRef = doc(this.db, "userProfiles", userId);
            const profileWithTimestamp = {
                ...profileData,
                updatedAt: serverTimestamp()
            };
            
            // Add createdAt if new profile
            const currentProfile = appState.getState().userProfile;
            if (!currentProfile || !currentProfile.createdAt) {
                profileWithTimestamp.createdAt = serverTimestamp();
            }
            
            await setDoc(docRef, profileWithTimestamp, { merge: true });
            
            // Update Firebase Auth display name if changed
            if (this.auth.currentUser && 
                this.auth.currentUser.displayName !== profileData.displayName &&
                profileData.displayName) {
                await updateProfile(this.auth.currentUser, {
                    displayName: profileData.displayName
                });
            }
            
            // Update local state
            appState.setState({ 
                userProfile: { 
                    ...currentProfile, 
                    ...profileData,
                    updatedAt: new Date(),
                    createdAt: currentProfile?.createdAt || new Date()
                }
            });
            
            console.log('👤 Profile saved successfully');
            
        } catch (error) {
            errorHandler.handleError(error, 'Save Profile Error');
            throw error;
        } finally {
            appState.setLoading(false);
        }
    }

    // Get current user
    getCurrentUser() {
        return this.auth?.currentUser || null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.auth?.currentUser && !this.auth.currentUser.isAnonymous;
    }

    // Cleanup
    destroy() {
        if (this.unsubscribeWorkouts) {
            this.unsubscribeWorkouts();
            this.unsubscribeWorkouts = null;
        }
        console.log('🧹 Firebase Manager cleaned up');
    }

    // Direct Firebase methods for sync operations (bypasses state updates)
    async addWorkoutDirect(workoutData) {
        const userId = workoutData.userId;
        const workoutsPath = `artifacts/${this.appId}/users/${userId}/kettlebellWorkouts_v11`;
        
        const { userId: _, ...dataWithoutUserId } = workoutData;
        return await addDoc(collection(this.db, workoutsPath), dataWithoutUserId);
    }

    async deleteWorkoutDirect(workoutId, userId) {
        const workoutsPath = `artifacts/${this.appId}/users/${userId}/kettlebellWorkouts_v11`;
        await deleteDoc(doc(this.db, workoutsPath, workoutId));
    }
}

// Export singleton instance
export const firebaseManager = new FirebaseManager();

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.firebaseManager = firebaseManager;
}