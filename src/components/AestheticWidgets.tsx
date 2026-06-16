/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import { Clock, RefreshCcw, User, Save, Bell, BellOff, Sparkles } from "lucide-react";
import { WeeklyReviewModal } from "./WeeklyReviewModal";

export const ExamCountdown: React.FC = () => {
  const { userProfile } = useStudy();

  const exams = [
    { title: "Semester Final Exams", days: 18, date: "July 4, 2026", color: "border-pink-200 bg-pink-50/50 text-pink-700" },
    { title: "GATE Prep Cycle", days: 45, date: "August 1, 2026", color: "border-purple-200 bg-purple-50/50 text-purple-700" },
    { title: "Coding Contest Orbits", days: 6, date: "June 22, 2026", color: "border-indigo-200 bg-indigo-50/50 text-indigo-700" },
  ];

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl border border-pink-100 p-5 shadow-sm space-y-4">
      <h4 className="font-sans font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5 select-none">
        Exam Countdowns ⏰
      </h4>

      <div className="space-y-3">
        {exams.map((ex, idx) => (
          <div key={idx} className={`p-3.5 rounded-2xl border flex items-center justify-between ${ex.color}`}>
            <div>
              <h5 className="font-sans font-extrabold text-xs leading-none mb-1.5">{ex.title}</h5>
              <span className="text-[10px] opacity-75 font-mono">{ex.date}</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black block font-mono">{ex.days}</span>
              <span className="text-[9px] uppercase tracking-wider font-bold">Days Left</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SpacedRevisionWidget: React.FC = () => {
  const { revisions, topics, completeRevision } = useStudy();

  // Filter incomplete revisions
  const pending = revisions.filter((r) => !r.isCompleted);

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl border border-pink-100 p-5 shadow-sm space-y-4">
      <h4 className="font-sans font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5 select-none">
        Spaced Revision Scheduler <RefreshCcw className="w-4 h-4 text-pink-500" />
      </h4>

      {pending.length > 0 ? (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {pending.map((r) => {
            const topic = topics.find((t) => t.id === r.topicId);
            return (
              <div key={r.id} className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl flex items-center justify-between transition-all hover:bg-purple-50">
                <div>
                  <h5 className="text-xs font-sans font-bold text-purple-950">
                    {topic ? topic.title : "Syllabus Recall Unit"}
                  </h5>
                  <p className="text-[9px] text-purple-400 font-mono mt-0.5">
                    Interval: Day {r.intervalDays} • Target Date: {r.scheduledDate}
                  </p>
                </div>

                <button
                  onClick={() => completeRevision(r.id)}
                  className="bg-purple-400 hover:bg-purple-500 text-white text-[10px] font-bold py-1 px-3 rounded-full cursor-pointer transition-colors"
                >
                  Recall ✓
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-gray-400 text-xs">
          💤 No pending revision tasks. Your spaced recall queue is perfectly balanced.
        </div>
      )}
    </div>
  );
};

export const UserProfilePanel: React.FC = () => {
  const { userProfile, updateProfile } = useStudy();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [course, setCourse] = useState(userProfile.course);
  const [year, setYear] = useState(userProfile.year);
  const [target, setTarget] = useState(userProfile.targetExam);
  const [goal, setGoal] = useState(userProfile.dailyStudyGoal);

  const handleUpdate = () => {
    updateProfile({
      name,
      course,
      year,
      targetExam: target,
      dailyStudyGoal: goal,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl border border-pink-100 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between select-none">
        <h4 className="font-sans font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5">
          Student Profile 🎓
        </h4>
        <button
          onClick={() => {
            if (isEditing) {
              handleUpdate();
            } else {
              setIsEditing(true);
            }
          }}
          className="text-[10px] font-bold text-pink-600 bg-pink-55 border border-pink-200 rounded-lg px-2.5 py-1"
        >
          {isEditing ? "Save" : "Change"}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-gray-400">Student Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] uppercase font-bold text-gray-400">Course / major:</label>
              <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl" />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-gray-400">Academic Year:</label>
              <input type="text" value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl" />
            </div>
          </div>

          <div>
            <label className="text-[9px] uppercase font-bold text-gray-400">Target Exam:</label>
            <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full px-3 py-1.5 border rounded-xl" />
          </div>

          <div>
            <label className="text-[9px] uppercase font-bold text-gray-400">Study Goal (Daily Hours):</label>
            <input type="number" value={goal} onChange={(e) => setGoal(parseFloat(e.target.value) || 4)} className="w-full px-3 py-1.5 border rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-850 p-3 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-700 text-sm select-none">
              {userProfile.name.split(" ").map((n) => n[0]).join("") || "S"}
            </div>
            <div>
              <h5 className="font-sans font-extrabold text-sm text-gray-700 dark:text-gray-100">{userProfile.name}</h5>
              <span className="text-[10px] text-gray-400 font-mono">{userProfile.course} • {userProfile.year}</span>
            </div>
          </div>

          <table className="w-full border-collapse text-left text-xs text-gray-500 font-sans">
            <tbody>
              <tr>
                <td className="py-1 font-semibold text-gray-400">Target Exam</td>
                <td className="py-1 font-bold text-gray-700 dark:text-gray-300">{userProfile.targetExam}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-gray-400">Goal Target</td>
                <td className="py-1 font-bold text-gray-700 dark:text-gray-300">{userProfile.dailyStudyGoal} Hours / Day</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-gray-400">Mascot Companion</td>
                <td className="py-1 font-bold text-pink-650">Bloomie Lvl {userProfile.level}</td>
              </tr>
            </tbody>
          </table>

          <WeeklyReviewModal />
        </div>
      )}
    </div>
  );
};

export const SmartNotificationsHeader: React.FC = () => {
  const { notifications } = useStudy();
  const [show, setShow] = useState(false);

  // List unread notifications
  const unread = notifications.filter((n) => !n.isRead);

  return (
    <div className="relative select-none">
      <button
        id="notifications-bell-btn"
        onClick={() => setShow(!show)}
        className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border hover:bg-gray-50 shadow-sm relative cursor-pointer"
      >
        {unread.length > 0 ? (
          <>
            <Bell className="w-5 h-5 text-pink-500 animate-swing" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          </>
        ) : (
          <Bell className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {show && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-gray-900 border rounded-2xl shadow-xl w-64 p-4 z-40 space-y-3">
          <h4 className="text-xs font-bold text-pink-700 border-b pb-1.5">Bloomie Alerts 🌸</h4>

          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="text-[10px] leading-relaxed p-2 bg-gray-50 dark:bg-gray-850 rounded-xl">
                  <strong>{n.title}</strong>
                  <p className="text-gray-500">{n.body}</p>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-gray-400 text-center py-4">Your alert list is clean of weeds.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
