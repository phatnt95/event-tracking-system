/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    statusCode: number;
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    path: string;
  };
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum EventType {
  FEED = 'FEED',
  DIAPER = 'DIAPER',
  SLEEP = 'SLEEP',
  MEDICINE = 'MEDICINE',
  GROWTH = 'GROWTH',
  VACCINE = 'VACCINE',
}

export enum FeedType {
  BREASTFEEDING = 'BREASTFEEDING',
  BREAST_MILK_BOTTLE = 'BREAST_MILK_BOTTLE',
  FORMULA = 'FORMULA',
}

export enum DiaperStatus {
  PEE = 'PEE',
  POOP = 'POOP',
  BOTH = 'BOTH',
}

export enum PoopColor {
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
  BROWN = 'BROWN',
  BLACK = 'BLACK',
  WHITE = 'WHITE',
  RED = 'RED',
}

export enum PoopConsistency {
  WATERY = 'WATERY',
  SOFT = 'SOFT',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  SEED_LIKE = 'SEED_LIKE',
}

export enum PoopAmount {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface BabyResponse {
  id: string;
  ownerId: string;
  name: string;
  nickname?: string | null;
  gender: Gender;
  birthday: string;
  birthWeight?: number | null;
  birthHeight?: number | null;
  note?: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventResponse {
  id: string;
  babyId: string;
  type: EventType;
  occurredAt: string;
  note: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineFeedDetails {
  feedType: FeedType;
  leftDuration: number | null;
  rightDuration: number | null;
  preparedVolume: number | null;
  consumedVolume: number | null;
  brand: string | null;
  stage: string | null;
}

export interface TimelineDiaperDetails {
  status: DiaperStatus;
  poopColor: PoopColor | null;
  poopConsistency: PoopConsistency | null;
  poopAmount: PoopAmount | null;
  hasBlood: boolean;
  hasMucus: boolean;
}

export interface TimelineEventResponse extends EventResponse {
  feed?: TimelineFeedDetails;
  diaper?: TimelineDiaperDetails;
}

export interface EventTimelineResponse {
  items: TimelineEventResponse[];
  nextCursor: string | null;
}

export interface FeedResponse extends EventResponse {
  eventId: string;
  feedType: FeedType;
  leftDuration?: number | null;
  rightDuration?: number | null;
  preparedVolume?: number | null;
  consumedVolume?: number | null;
  brand?: string | null;
  stage?: string | null;
}

export interface DiaperResponse extends EventResponse {
  eventId: string;
  status: DiaperStatus;
  poopColor?: PoopColor | null;
  poopConsistency?: PoopConsistency | null;
  poopAmount?: PoopAmount | null;
  hasBlood: boolean;
  hasMucus: boolean;
}

export interface DashboardLastFeeding {
  occurredAt: string;
  feedType: FeedType;
  consumedVolume: number | null;
}

export interface DashboardLastDiaper {
  occurredAt: string;
  status: DiaperStatus;
}

export interface DashboardResponse {
  date: string;
  feedCount: number;
  milkIntakeMl: number;
  peeCount: number;
  poopCount: number;
  lastFeeding: DashboardLastFeeding | null;
  lastDiaper: DashboardLastDiaper | null;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
