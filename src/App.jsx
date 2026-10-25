import WorkoutApp from './family/WorkoutApp';
import {adapter} from './family/adapter';
import './family/base.css';
import './family/workout.css';
export default function App(){return <WorkoutApp kind="tracker" adapter={adapter}/>;}
