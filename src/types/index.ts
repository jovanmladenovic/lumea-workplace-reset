import { TutorialOptions } from '@/constants';
import { Timestamp } from 'firebase/firestore';

export interface TutorialStep {
  text: string;
  label?: string;
  gestureType: TutorialOptions;
  hints: string[];
  completeText?: string;
  gestures?: {
    type: string;
    label: string;
  }[];
}

export interface TaskData {
  name: string;
  startedAt: Timestamp;
  endedAt?: Timestamp;
  passed?: boolean;
}

export interface SessionData {
  startedAt: Timestamp;
  userId: string;
  startEnergyLevel?: number;
  selectedIntervention?: string;
  endEnergyLevel?: number;
  interventionIndex?: number;
  willingToRepeat?: boolean;
  endedAt?: Timestamp;
  tasks?: TaskData[];
}
