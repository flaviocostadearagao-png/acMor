import { Timestamp } from 'firebase/firestore';

export interface UserStats {
  totalDistance: number;
  totalRides: number;
  points: number;
  monthlyDistance: number;
  lastMonthUpdated?: string;
}

export interface UserRecords {
  longestRide: number;
}

export interface UserProfile {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  stats: UserStats;
  records: UserRecords;
  createdAt: Timestamp | Date;
}

export interface PathPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Workout {
  id: string;
  userId: string;
  distance: number;
  duration: number;
  avgSpeed: number;
  path: PathPoint[];
  createdAt: Timestamp | Date;
  name?: string;
  status?: 'synced' | 'pending_sync';
}

export interface Ride {
  id: string;
  title: string;
  description: string;
  level: string;
  distance: number;
  startTime: string;
  address: string;
  creatorId: string;
  creatorName: string;
  participantCount: number;
  createdAt: Timestamp | Date;
}
