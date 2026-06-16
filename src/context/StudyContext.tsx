/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserProfile,
  Subject,
  Topic,
  Task,
  Goal,
  Note,
  Revision,
  Achievement,
  NotificationItem,
  PomodoroSession,
  Priority,
  GoalStage,
} from "../types";
import { isFirebaseAvailable, db, auth, googleProvider, OperationType, handleFirestoreError } from "../firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

interface StudyContextType {
  user: any;
  userProfile: UserProfile;
  subjects: Subject[];
  topics: Topic[];
  tasks: Task[];
  goals: Goal[];
  notes: Note[];
  revisions: Revision[];
  achievements: Achievement[];
  notifications: NotificationItem[];
  pomodoroSessions: PomodoroSession[];
  activeTheme: "light" | "dark";
  companion: {
    status: string;
    emotion: "happy" | "excited" | "thinking" | "asleep" | "cheering" | "worried";
    tip: string;
    level: number;
    xp: number;
  };
  isLoading: boolean;
  isSyncing: boolean;

  // Actions
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  toggleTheme: () => void;
  gainXP: (amount: number) => Promise<void>;

  // Subjects & Topics
  addSubject: (name: string, color: string, targetHours: number) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;
  addTopic: (subjectId: string, title: string, priority: Priority) => Promise<void>;
  updateTopicProgress: (id: string, progress: number) => Promise<void>;
  removeTopic: (id: string) => Promise<void>;

  // Tasks
  addTask: (title: string, subjectId: string, priority: Priority, deadline: string, targetHours: number, topicId?: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;

  // Goals (Garden)
  addGoal: (title: string, description: string, targetDays: number) => Promise<void>;
  advanceGoalProgress: (id: string, increment: number) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;

  // Notes
  addNote: (title: string, subjectId: string, content: string) => Promise<void>;
  updateNote: (id: string, content: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  toggleFavoriteNote: (id: string) => Promise<void>;
  removeNote: (id: string) => Promise<void>;

  // Pomodoro
  logPomodoroSession: (subjectId: string, duration: number, mode: "Focus" | "Break" | "Long Break") => Promise<void>;

  // Revision
  scheduleRevision: (subjectId: string, topicId: string, intervalDays: number) => Promise<void>;
  completeRevision: (id: string) => Promise<void>;

  // Helpers
  addNotification: (title: string, body: string, type: "info" | "success" | "warning") => Promise<void>;
  triggerBloomieChat: (message: string) => Promise<any>;
  generateAISchedule: (availableHours: number, days: number) => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

// Initial local fallback values
const defaultProfile: UserProfile = {
  uid: "mock-user",
  name: "Study Sprout 🌱",
  course: "Computer Science",
  year: "3rd Year",
  targetExam: "GATE & Placements",
  dailyStudyGoal: 4,
  preferredStudyHours: 4,
  xp: 40,
  level: 1,
  streak: 3,
  longestStreak: 5,
  lastActiveDate: new Date().toISOString().split("T")[0],
};

const defaultSubjects: Subject[] = [
  { id: "sub-1", userId: "mock", name: "Database Management Systems (DBMS)", color: "from-pink-200 to-pink-300 text-pink-700", targetStudyHours: 20, completedHours: 12, createdAt: new Date().toISOString() },
  { id: "sub-2", userId: "mock", name: "Data Structures & Algos (DSA)", color: "from-purple-200 to-purple-300 text-purple-700", targetStudyHours: 40, completedHours: 28, createdAt: new Date().toISOString() },
  { id: "sub-3", userId: "mock", name: "Operating Systems (OS)", color: "from-indigo-200 to-indigo-300 text-indigo-700", targetStudyHours: 15, completedHours: 4, createdAt: new Date().toISOString() },
  { id: "sub-4", userId: "mock", name: "Web Engineering", color: "from-emerald-200 to-emerald-300 text-emerald-700", targetStudyHours: 25, completedHours: 18, createdAt: new Date().toISOString() },
];

const defaultTopics: Topic[] = [
  { id: "top-1", userId: "mock", subjectId: "sub-2", title: "Trees & Binary Search Trees", priority: "🔥 Urgent", isCompleted: true, syllabusProgress: 100, createdAt: new Date().toISOString() },
  { id: "top-2", userId: "mock", subjectId: "sub-2", title: "Graph Traversals (BFS/DFS)", priority: "⭐ Important", isCompleted: false, syllabusProgress: 60, createdAt: new Date().toISOString() },
  { id: "top-3", userId: "mock", subjectId: "sub-1", title: "Normalization & SQL Queries", priority: "🔥 Urgent", isCompleted: false, syllabusProgress: 40, createdAt: new Date().toISOString() },
];

const defaultTasks: Task[] = [
  { id: "task-1", userId: "mock", subjectId: "sub-2", title: "Solve BST Leaf Similar Leaves on LeetCode", priority: "🔥 Urgent", deadline: new Date().toISOString().split("T")[0], targetHours: 1.5, isCompleted: false, createdAt: new Date().toISOString() },
  { id: "task-2", userId: "mock", subjectId: "sub-1", title: "Design 3NF Relational Schema for University", priority: "⭐ Important", deadline: new Date(Date.now() + 86400000).toISOString().split("T")[0], targetHours: 2, isCompleted: false, createdAt: new Date().toISOString() },
  { id: "task-3", userId: "mock", subjectId: "sub-3", title: "Read Process Scheduling State Diagrams", priority: "🌸 Easy", deadline: new Date(Date.now() + 172800000).toISOString().split("T")[0], targetHours: 1, isCompleted: true, completedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
];

const defaultGoals: Goal[] = [
  { id: "go-1", userId: "mock", title: "Conquer DSA Trees & Graphs", description: "Master pathfinding and BST logic before mock coding rounds", stage: "Plant", progress: 60, targetDays: 14, createdAt: new Date().toISOString() },
  { id: "go-2", userId: "mock", title: "Perfect Normalization 4NF", description: "Learn 4NF and join dependencies for competitive exams", stage: "Seed", progress: 10, targetDays: 20, createdAt: new Date().toISOString() },
  { id: "go-3", userId: "mock", title: "Complete Web App Mockups", description: "Build cute responsive UI layouts using Tailwind CSS", stage: "Flower", progress: 90, targetDays: 5, createdAt: new Date().toISOString() },
];

const defaultNotes: Note[] = [
  {
    id: "not-1",
    userId: "mock",
    subjectId: "sub-2",
    title: "Graph DFS Template (Recursive)",
    content: "# DFS Graph Algorithm in TypeScript\n\n```typescript\nfunction dfs(node: number, visited: Set<number>) {\n  if (visited.has(node)) return;\n  visited.add(node);\n  console.log('Visiting:', node);\n  for (const neighbor of graph[node]) {\n    dfs(neighbor, visited);\n  }\n}\n```\n\n*Time Complexity*: $O(V + E)$ where $V$ is vertices and $E$ is edges.\n\n### Spaced Repetition Reminders\n1. Check leaf properties next.\n2. Handle cycles using stack.",
    isFavorite: true,
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "not-2",
    userId: "mock",
    subjectId: "sub-1",
    title: "SQL Join Types Cheat Sheet",
    content: "# SQL Join Types Explained 🌸\n\n- **INNER JOIN**: Returns only matching rows.\n- **LEFT JOIN (OUTER)**: Returns all rows from left table + matched rows from right table.\n- **RIGHT JOIN**: Returns all rows from right table + matched rows from left table.\n- **FULL JOIN**: Returns matches on either table.\n\n### Quick Normalization Check\n- **1NF**: Atomic values check.\n- **2NF**: No partial dependencies check.\n- **3NF**: No transitive dependencies check.",
    isFavorite: false,
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // States
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [subjects, setSubjects] = useState<Subject[]>(defaultSubjects);
  const [topics, setTopics] = useState<Topic[]>(defaultTopics);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
  const [activeTheme, setActiveTheme] = useState<"light" | "dark">("light");

  const [companion, setCompanion] = useState({
    status: "Perfect time to blossom!",
    emotion: "happy" as "happy" | "excited" | "thinking" | "asleep" | "cheering" | "worried",
    tip: "Drink a warm cup of herbal tea during your next mini-break! 🍵🌸",
    level: 1,
    xp: 40,
  });

  // Track Theme from standard storage on boot up
  useEffect(() => {
    const savedTheme = localStorage.getItem("study-bloom-theme") as "light" | "dark";
    if (savedTheme) {
      setActiveTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(activeTheme);
  }, [activeTheme]);

  const toggleTheme = () => {
    const nextTheme = activeTheme === "light" ? "dark" : "light";
    setActiveTheme(nextTheme);
    localStorage.setItem("study-bloom-theme", nextTheme);
  };

  // Sync Companion state from userProfile metrics
  useEffect(() => {
    setCompanion((prev) => ({
      ...prev,
      level: userProfile.level,
      xp: userProfile.xp,
    }));
  }, [userProfile.level, userProfile.xp]);

  // Auth changed hook
  useEffect(() => {
    if (isFirebaseAvailable && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setIsLoading(true);
        if (fbUser) {
          setUser(fbUser);
          await loadUserData(fbUser.uid);
        } else {
          setUser(null);
          loadLocalFallback();
        }
        setIsLoading(false);
      });
      return unsubscribe;
    } else {
      loadLocalFallback();
      setIsLoading(false);
    }
  }, []);

  const loadLocalFallback = () => {
    const localProfile = localStorage.getItem("sb-profile");
    const localSubjects = localStorage.getItem("sb-subjects");
    const localTopics = localStorage.getItem("sb-topics");
    const localTasks = localStorage.getItem("sb-tasks");
    const localGoals = localStorage.getItem("sb-goals");
    const localNotes = localStorage.getItem("sb-notes");
    const localRevisions = localStorage.getItem("sb-revisions");
    const localAchievements = localStorage.getItem("sb-achievements");
    const localNotifications = localStorage.getItem("sb-notifications");
    const localSessions = localStorage.getItem("sb-pomodoros");

    if (localProfile) setUserProfile(JSON.parse(localProfile));
    if (localSubjects) setSubjects(JSON.parse(localSubjects));
    if (localTopics) setTopics(JSON.parse(localTopics));
    if (localTasks) setTasks(JSON.parse(localTasks));
    if (localGoals) setGoals(JSON.parse(localGoals));
    if (localNotes) setNotes(JSON.parse(localNotes));
    if (localRevisions) setRevisions(JSON.parse(localRevisions));
    if (localAchievements) setAchievements(JSON.parse(localAchievements));
    if (localNotifications) setNotifications(JSON.parse(localNotifications));
    if (localSessions) setPomodoroSessions(JSON.parse(localSessions));
  };

  const saveLocalData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Cloud load helper
  const loadUserData = async (uid: string) => {
    setIsSyncing(true);
    try {
      // 1. User Profile
      const profRef = doc(db, "users", uid);
      const profSnap = await getDoc(profRef);
      if (profSnap.exists()) {
        setUserProfile(profSnap.data() as UserProfile);
      } else {
        const initProfile = { ...defaultProfile, uid };
        await setDoc(profRef, initProfile);
        setUserProfile(initProfile);
      }

      // 2. Load nested sub-collections
      const subsSnap = await getDocs(collection(db, "users", uid, "subjects"));
      const subs = subsSnap.docs.map((d) => d.data() as Subject);
      if (subs.length > 0) setSubjects(subs);

      const topicsSnap = await getDocs(collection(db, "users", uid, "topics"));
      const tops = topicsSnap.docs.map((d) => d.data() as Topic);
      if (tops.length > 0) setTopics(tops);

      const tasksSnap = await getDocs(collection(db, "users", uid, "tasks"));
      const tsk = tasksSnap.docs.map((d) => d.data() as Task);
      if (tsk.length > 0) setTasks(tsk);

      const goalsSnap = await getDocs(collection(db, "users", uid, "goals"));
      const gls = goalsSnap.docs.map((d) => d.data() as Goal);
      if (gls.length > 0) setGoals(gls);

      const notesSnap = await getDocs(collection(db, "users", uid, "notes"));
      const nts = notesSnap.docs.map((d) => d.data() as Note);
      if (nts.length > 0) setNotes(nts);

      const revsSnap = await getDocs(collection(db, "users", uid, "revisions"));
      setRevisions(revsSnap.docs.map((d) => d.data() as Revision));

      const achSnap = await getDocs(collection(db, "users", uid, "achievements"));
      setAchievements(achSnap.docs.map((d) => d.data() as Achievement));

      const remSnap = await getDocs(collection(db, "users", uid, "notifications"));
      setNotifications(remSnap.docs.map((d) => d.data() as NotificationItem));

      const pomoSnap = await getDocs(collection(db, "users", uid, "pomodoroSessions"));
      setPomodoroSessions(pomoSnap.docs.map((d) => d.data() as PomodoroSession));
    } catch (err) {
      console.warn("Could not sync complete load with cloud, using local fallback store");
      loadLocalFallback();
    } finally {
      setIsSyncing(false);
    }
  };

  const loginWithGoogle = async () => {
    if (isFirebaseAvailable && auth && googleProvider) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (err) {
        console.error("Sign-in failed", err);
      }
    } else {
      // Stub authentication toggle in pure sandbox container
      setUser({ uid: "mock-uid", displayName: "Happy Sprout", email: "sprout@bloom.org" });
      setUserProfile((prev) => ({ ...prev, name: "Happy Sprout" }));
    }
  };

  const logoutUser = async () => {
    if (isFirebaseAvailable && auth) {
      await signOut(auth);
    } else {
      setUser(null);
      setUserProfile(defaultProfile);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
    saveLocalData("sb-profile", updated);

    if (user && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, "users", user.uid), updates);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  // Gamification Loop
  const gainXP = async (amount: number) => {
    let currentXP = userProfile.xp + amount;
    let currentLevel = userProfile.level;
    const threshold = currentLevel * 100;

    let leveledUp = false;
    if (currentXP >= threshold) {
      currentXP -= threshold;
      currentLevel += 1;
      leveledUp = true;
    }

    const updates: Partial<UserProfile> = { xp: currentXP, level: currentLevel };
    await updateProfile(updates);

    if (leveledUp) {
      await addNotification("Level Up! 🌸🎉", `You promoted Bloomie to Level ${currentLevel}! Grow-on!`, "success");
      setCompanion((prev) => ({
        ...prev,
        emotion: "excited",
        status: `Hooray! Level Up! Current rank: flower master! 💕`,
      }));

      if (currentLevel >= 3) {
        await triggerAchievementUnlock("SCHOLAR");
      }
    }
  };

  // Subjects & Topics
  const addSubject = async (name: string, color: string, targetHours: number) => {
    const newSub: Subject = {
      id: "sub-" + Math.random().toString(36).substr(2, 9),
      userId: user?.uid || "mock-user",
      name,
      color,
      targetStudyHours: targetHours,
      completedHours: 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [newSub, ...subjects];
    setSubjects(updated);
    saveLocalData("sb-subjects", updated);

    if (user && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, "users", user.uid, "subjects", newSub.id), newSub);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/subjects/${newSub.id}`);
      }
    }
    await addNotification("New Subject Folded 🌱", `Added "${name}" with target of ${targetHours} hours!`, "info");
  };

  const removeSubject = async (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    saveLocalData("sb-subjects", updated);

    if (user && isFirebaseAvailable) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "subjects", id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/subjects/${id}`);
      }
    }
  };

  const addTopic = async (subjectId: string, title: string, priority: Priority) => {
    const newTopic: Topic = {
      id: "top-" + Math.random().toString(36).substr(2, 9),
      userId: user?.uid || "mock-user",
      subjectId,
      title,
      priority,
      isCompleted: false,
      syllabusProgress: 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTopic, ...topics];
    setTopics(updated);
    saveLocalData("sb-topics", updated);

    if (user && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, "users", user.uid, "topics", newTopic.id), newTopic);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/topics/${newTopic.id}`);
      }
    }
    await gainXP(10);
  };

  const updateTopicProgress = async (id: string, progress: number) => {
    const updated = topics.map((t) => {
      if (t.id === id) {
        return { ...t, syllabusProgress: progress, isCompleted: progress === 100 };
      }
      return t;
    });
    setTopics(updated);
    saveLocalData("sb-topics", updated);

    // If completed topic, give nice XP boost!
    if (progress === 100) {
      await gainXP(30);
      const matched = topics.find((t) => t.id === id);
      await addNotification("Chapter Mastered! 🎓", `You finished "${matched?.title}" topic.`, "success");
    }

    if (user && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, "users", user.uid, "topics", id), {
          syllabusProgress: progress,
          isCompleted: progress === 100,
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/topics/${id}`);
      }
    }
  };

  const removeTopic = async (id: string) => {
    const updated = topics.filter((t) => t.id !== id);
    setTopics(updated);
    saveLocalData("sb-topics", updated);

    if (user && isFirebaseAvailable) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "topics", id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/topics/${id}`);
      }
    }
  };

  // Add tasks
  const addTask = async (title: string, subjectId: string, priority: Priority, deadline: string, targetHours: number, topicId?: string) => {
    const newTask: Task = {
      id: "task-" + Math.random().toString(36).substr(2, 9),
      userId: user?.uid || "mock-user",
      subjectId,
      topicId,
      title,
      priority,
      deadline,
      targetHours,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveLocalData("sb-tasks", updated);

    if (user && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, "users", user.uid, "tasks", newTask.id), newTask);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/tasks/${newTask.id}`);
      }
    }
  };

  const completeTask = async (id: string) => {
    const taskMatch = tasks.find((t) => t.id === id);
    if (!taskMatch) return;

    const nextCompletedVal = !taskMatch.isCompleted;

    const updated = tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          isCompleted: nextCompletedVal,
          completedAt: nextCompletedVal ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    setTasks(updated);
    saveLocalData("sb-tasks", updated);

    if (nextCompletedVal) {
      await gainXP(20);
      setCompanion((prev) => ({
        ...prev,
        emotion: "cheering",
        status: `Fabulous work! You completed a priority task! 🎉🌱`,
      }));

      // Grow overall gardens!
      if (goals.length > 0) {
        // Automatically advance the first incomplete garden goal
        const firstGoal = goals.find((g) => g.stage !== "Tree");
        if (firstGoal) {
          await advanceGoalProgress(firstGoal.id, 15);
        }
      }

      // Check achievements
      const completedCount = updated.filter((t) => t.isCompleted).length;
      if (completedCount >= 5) {
        await triggerAchievementUnlock("WARRIOR");
      }
    }

    if (user && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, "users", user.uid, "tasks", id), {
          isCompleted: nextCompletedVal,
          completedAt: nextCompletedVal ? new Date().toISOString() : null,
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/tasks/${id}`);
      }
    }
  };

  const removeTask = async (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveLocalData("sb-tasks", updated);

    if (user && isFirebaseAvailable) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "tasks", id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/tasks/${id}`);
      }
    }
  };

  // Goals (Garden system)
  const addGoal = async (title: string, description: string, targetDays: number) => {
    const newGoal: Goal = {
      id: "go-" + Math.random().toString(36).substr(2, 9),
      userId: user?.uid || "mock-user",
      title,
      description,
      stage: "Seed",
      progress: 0,
      targetDays,
      createdAt: new Date().toISOString(),
    };

    const updated = [newGoal, ...goals];
    setGoals(updated);
    saveLocalData("sb-goals", updated);

    if (user && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, "users", user.uid, "goals", newGoal.id), newGoal);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/goals/${newGoal.id}`);
      }
    }
    await addNotification("Plant Seed 🌱", `You planted a seed in your Study Garden: "${title}"`, "success");
  };

  const advanceGoalProgress = async (id: string, increment: number) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextProgress = Math.min(100, g.progress + increment);
        let nextStage: GoalStage = g.stage;
        if (nextProgress >= 100) {
          nextStage = "Tree";
        } else if (nextProgress >= 70) {
          nextStage = "Flower";
        } else if (nextProgress >= 30) {
          nextStage = "Plant";
        }
        return { ...g, progress: nextProgress, stage: nextStage };
      }
      return g;
    });
    setGoals(updated);
    saveLocalData("sb-goals", updated);

    const matchG = goals.find((g) => g.id === id);
    if (matchG && matchG.progress + increment >= 100 && matchG.stage !== "Tree") {
      await gainXP(50);
      await addNotification("Flower fully Grown! 🌸🌲", `"${matchG.title}" has blossomed into a beautiful Study Tree!`, "success");
    }

    if (user && isFirebaseAvailable) {
      try {
        const item = updated.find((x) => x.id === id);
        if (item) {
          await updateDoc(doc(db, "users", user.uid, "goals", id), {
            progress: item.progress,
            stage: item.stage,
          });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/goals/${id}`);
      }
    }
  };

  const removeGoal = async (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    saveLocalData("sb-goals", updated);

    if (user && isFirebaseAvailable) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "goals", id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/goals/${id}`);
      }
    }
  };

  // Notes
  const addNote = async (title: string, subjectId: string, content: string) => {
    const newNote: Note = {
      id: "not-" + Math.random().toString(36).substr(2, 9),
      userId: user?.uid || "mock-user",
      subjectId,
      title,
      content,
      isFavorite: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    saveLocalData("sb-notes", updated);

    if (user && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, "users", user.uid, "notes", newNote.id), newNote);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/notes/${newNote.id}`);
      }
    }
    await gainXP(10);
  };

  const updateNote = async (id: string, content: string) => {
    const updated = notes.map((n) => {
      if (n.id === id) {
        return { ...n, content, updatedAt: new Date().toISOString() };
      }
      return n;
    });
    setNotes(updated);
    saveLocalData("sb-notes", updated);

    if (user && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, "users", user.uid, "notes", id), {
          content,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/notes/${id}`);
      }
    }
  };

  const togglePinNote = async (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    setNotes(updated);
    saveLocalData("sb-notes", updated);

    const mt = notes.find((n) => n.id === id);
    if (user && isFirebaseAvailable && mt) {
      try {
        await updateDoc(doc(db, "users", user.uid, "notes", id), { isPinned: !mt.isPinned });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/notes/${id}`);
      }
    }
  };

  const toggleFavoriteNote = async (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
    setNotes(updated);
    saveLocalData("sb-notes", updated);

    const mt = notes.find((n) => n.id === id);
    if (user && isFirebaseAvailable && mt) {
      try {
        await updateDoc(doc(db, "users", user.uid, "notes", id), { isFavorite: !mt.isFavorite });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/notes/${id}`);
      }
    }
  };

  const removeNote = async (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveLocalData("sb-notes", updated);

    if (user && isFirebaseAvailable) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "notes", id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/notes/${id}`);
      }
    }
  };

  // Pomodoro timer
  const logPomodoroSession = async (subjectId: string, duration: number, mode: "Focus" | "Break" | "Long Break") => {
    const newSession: PomodoroSession = {
      id: "pomo-" + Math.random().toString(36).substr(2, 9),
      userId: user?.uid || "mock-user",
      subjectId,
      duration,
      mode,
      createdAt: new Date().toISOString(),
    };

    const updated = [newSession, ...pomodoroSessions];
    setPomodoroSessions(updated);
    saveLocalData("sb-pomodoros", updated);

    if (mode === "Focus") {
      // 5 XP per min Focused
      await gainXP(duration * 5);

      // Increment subject completed hours
      const subUpdated = subjects.map((s) => {
        if (s.id === subjectId) {
          return { ...s, completedHours: s.completedHours + duration / 60 };
        }
        return s;
      });
      setSubjects(subUpdated);
      saveLocalData("sb-subjects", subUpdated);

      // Trigger Rookie reward check
      await triggerAchievementUnlock("ROOKIE");

      await addNotification("Splendid Focus! 🍅🌸", `Completed a ${duration}-min focusing orbit. +${duration * 5} XP!`, "success");
    }

    if (user && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, "users", user.uid, "pomodoroSessions", newSession.id), newSession);
        // Also update sub
        if (mode === "Focus") {
          const matchedSub = subjects.find((s) => s.id === subjectId);
          if (matchedSub) {
            await updateDoc(doc(db, "users", user.uid, "subjects", subjectId), {
              completedHours: matchedSub.completedHours + duration / 60,
            });
          }
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/pomodoroSessions/${newSession.id}`);
      }
    }
  };

  // Revisions
  const scheduleRevision = async (subjectId: string, topicId: string, intervalDays: number) => {
    const dateOffset = new Date();
    dateOffset.setDate(dateOffset.getDate() + intervalDays);

    const newRev: Revision = {
      id: "rev-" + Math.random().toString(36).substr(2, 9),
      userId: user?.uid || "mock-user",
      subjectId,
      topicId,
      intervalDays,
      scheduledDate: dateOffset.toISOString().split("T")[0],
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRev, ...revisions];
    setRevisions(updated);
    saveLocalData("sb-revisions", updated);

    if (user && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, "users", user.uid, "revisions", newRev.id), newRev);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/revisions/${newRev.id}`);
      }
    }
  };

  const completeRevision = async (id: string) => {
    const updated = revisions.map((r) => (r.id === id ? { ...r, isCompleted: true } : r));
    setRevisions(updated);
    saveLocalData("sb-revisions", updated);

    await gainXP(25);
    await addNotification("Revision Recalled! 🧠", "Nice review! Supercharged long-term index of topics.", "success");

    if (user && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, "users", user.uid, "revisions", id), { isCompleted: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/revisions/${id}`);
      }
    }
  };

  // Notifications helper
  const addNotification = async (title: string, body: string, type: "info" | "success" | "warning") => {
    const newItem: NotificationItem = {
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      userId: user?.uid || "mock-user",
      title,
      body,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...notifications];
    setNotifications(updated);
    saveLocalData("sb-notifications", updated);

    // Browser Notification compatibility
    if (Notification.permission === "granted") {
      new Notification(`🌸 Study Bloom 🌸`, { body });
    }

    if (user && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, "users", user.uid, "notifications", newItem.id), newItem);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/notifications/${newItem.id}`);
      }
    }
  };

  // Achievement unlock trigger
  const triggerAchievementUnlock = async (code: string) => {
    const isUnlocked = achievements.some((a) => a.code === code);
    if (isUnlocked) return;

    const newAch: Achievement = {
      id: "ach-" + Math.random().toString(36).substr(2, 9),
      userId: user?.uid || "mock-user",
      code,
      unlockedAt: new Date().toISOString(),
    };

    const updated = [newAch, ...achievements];
    setAchievements(updated);
    saveLocalData("sb-achievements", updated);

    await gainXP(75);
    let titleStr = "Consistency Queen 👑";
    if (code === "ROOKIE") titleStr = "Focus Rookie 🌟";
    if (code === "WARRIOR") titleStr = "Study Warrior 🔥";
    if (code === "SCHOLAR") titleStr = "Master Scholar 🎓";

    await addNotification("Unlocked Achievement! 🏆", `Awesome achievement: ${titleStr}! +75 XP`, "success");

    if (user && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, "users", user.uid, "achievements", newAch.id), newAch);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}/achievements/${newAch.id}`);
      }
    }
  };

  // Chat request with server-side AI Bloomie
  const triggerBloomieChat = async (message: string) => {
    setCompanion((prev) => ({ ...prev, emotion: "thinking", status: "Formulating a sweet blooming dynamic thought..." }));
    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, userProfile }),
      });
      const data = await response.json();
      if (data && data.reply) {
        setCompanion({
          status: data.reply,
          emotion: data.companionState || "happy",
          tip: data.tip || "Drink fresh water! 💧",
          level: userProfile.level,
          xp: userProfile.xp,
        });
        return data;
      }
    } catch (err) {
      console.error("AI Companion Chat Error:", err);
      setCompanion((prev) => ({
        ...prev,
        emotion: "worried",
        status: "Oh, it appears my petals got a little tangled up in the server web! Let's conquer stats manually! 🥺🌸",
      }));
    }
  };

  // Generate dynamic schedule from AI and auto create tasks
  const generateAISchedule = async (availableHours: number, days: number) => {
    setIsSyncing(true);
    await addNotification("AI Scheduler working... 🌸", "Bloomie is synthesizing a cute, optimized study plan for your topics!", "info");

    try {
      // Pass topics schema to prompt
      const topicsData = topics.filter((t) => !t.isCompleted).map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        subjectId: t.subjectId,
      }));

      const response = await fetch("/api/gemini/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syllabus: topicsData,
          availableHoursDaily: availableHours,
          daysCount: days,
          targetExam: userProfile.targetExam,
        }),
      });

      const data = await response.json();
      if (data && Array.isArray(data.tasks)) {
        for (const t of data.tasks) {
          const deadlineDate = new Date();
          deadlineDate.setDate(deadlineDate.getDate() + (t.dayOffset || 0));

          await addTask(
            t.title || "Study Slot",
            t.subjectId || subjects[0]?.id || "sub-1",
            (t.priority as Priority) || "⭐ Important",
            deadlineDate.toISOString().split("T")[0],
            t.targetHours || 1.5,
            t.topicId
          );
        }
        await addNotification("AI Schedule Generated! 🎉", `Created ${data.tasks.length} optimized sub-tasks successfully.`, "success");
        setCompanion((prev) => ({ ...prev, emotion: "excited", status: "I grew some gorgeous custom studying nodes for your active garden! Let's get reading! 🌸🎉" }));
      }
    } catch (e) {
      console.error("Failed to generate AI plan:", e);
      await addNotification("Scheduler Issue", "Bloomie was unable to compile the schedule. Adding standard plans instead.", "warning");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <StudyContext.Provider
      value={{
        user,
        userProfile,
        subjects,
        topics,
        tasks,
        goals,
        notes,
        revisions,
        achievements,
        notifications,
        pomodoroSessions,
        activeTheme,
        companion,
        isLoading,
        isSyncing,
        loginWithGoogle,
        logoutUser,
        updateProfile,
        toggleTheme,
        gainXP,
        addSubject,
        removeSubject,
        addTopic,
        updateTopicProgress,
        removeTopic,
        addTask,
        completeTask,
        removeTask,
        addGoal,
        advanceGoalProgress,
        removeGoal,
        addNote,
        updateNote,
        togglePinNote,
        toggleFavoriteNote,
        removeNote,
        logPomodoroSession,
        scheduleRevision,
        completeRevision,
        addNotification,
        triggerBloomieChat,
        generateAISchedule,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error("useStudy must be used within a StudyProvider");
  }
  return context;
};
