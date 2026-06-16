/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  name: string;
  course: string;
  year: string;
  targetExam: string;
  dailyStudyGoal: number; // in hours
  preferredStudyHours: number; // target hours
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export type Priority = "🌸 Easy" | "⭐ Important" | "🔥 Urgent";

export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string; // Tailwind color class or hex
  targetStudyHours: number;
  completedHours: number;
  createdAt: string;
}

export interface Topic {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  priority: Priority;
  isCompleted: boolean;
  syllabusProgress: number; // 0 to 100
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  subjectId: string;
  topicId?: string;
  title: string;
  priority: Priority;
  deadline: string; // YYYY-MM-DD
  targetHours: number;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export type GoalStage = "Seed" | "Plant" | "Flower" | "Tree";

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  stage: GoalStage;
  progress: number; // 0 to 100
  targetDays: number;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  content: string; // Markdown content
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Revision {
  id: string;
  userId: string;
  subjectId: string;
  topicId: string;
  intervalDays: number; // 1, 3, 7, 15, 30
  scheduledDate: string; // YYYY-MM-DD
  isCompleted: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  code: string; // key matching internal badges
  unlockedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning";
  isRead: boolean;
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  subjectId: string;
  duration: number; // minutes focused
  mode: "Focus" | "Break" | "Long Break";
  createdAt: string;
}
