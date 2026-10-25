import {initializeApp} from 'firebase/app';
import {getAuth,GoogleAuthProvider} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {firebaseConfig} from './firebase-config';
const app=initializeApp(firebaseConfig);
export const adapter={emailSupported:false,auth:getAuth(app),db:getFirestore(app),googleProvider:new GoogleAuthProvider(),path:uid=>['artifacts','my-kettlebell-app-v11-prod','users',uid,'kettlebellWorkouts_v11'],encode:(r,uid)=>({userId:uid,date:r.date,name:r.name,format:r.config.format,notes:r.notes,totalVolume:r.volume,calculatedTotalReps:r.totalReps,timeCompletedSeconds:r.duration,createdAt:new Date().toISOString(),details:{sets:r.entries.length},exercises:r.config.exercises.map(e=>({...e,isPerArm:e.perSide})),targetRepsOverall:null})};
