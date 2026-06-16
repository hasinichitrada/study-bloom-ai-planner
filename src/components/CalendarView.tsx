/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import { ChevronLeft, ChevronRight, Plus, Sparkles, Check } from "lucide-react";
import { Priority } from "../types";

export const CalendarView: React.FC = () => {
  const { tasks, revisions, addTask, subjects, completeTask } = useStudy();
  const [currentDate, setCurrentDate] = useState(new Date());

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newSubId, setNewSubId] = useState(subjects[0]?.id || "");
  const [newPriority, setNewPriority] = useState<Priority>("⭐ Important");
  const [newHours, setNewHours] = useState(2);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleDayClick = (dayNum: number) => {
    const formattedDate = `${year}-${(month + 1).toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`;
    setSelectedDateStr(formattedDate);
    setNewSubId(subjects[0]?.id || "");
    setShowAddModal(true);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle, newSubId || "sub-1", newPriority, selectedDateStr, newHours);
    setNewTitle("");
    setShowAddModal(false);
  };

  // Compile calendar rows
  const calendarCells = [];
  const totalSlots = daysInMonth + firstDayIndex;
  const rowsCount = Math.ceil(totalSlots / 7);

  for (let i = 0; i < rowsCount * 7; i++) {
    const dayIndex = i - firstDayIndex + 1;
    const isValidDay = dayIndex > 0 && dayIndex <= daysInMonth;

    if (isValidDay) {
      const formattedDate = `${year}-${(month + 1).toString().padStart(2, "0")}-${dayIndex.toString().padStart(2, "0")}`;

      // Retrieve items falling on this date YYYY-MM-DD
      const dayTasks = tasks.filter((t) => t.deadline === formattedDate);
      const dayRevisions = revisions.filter((r) => r.scheduledDate === formattedDate);

      calendarCells.push({
        dayNumber: dayIndex,
        dateStr: formattedDate,
        tasks: dayTasks,
        revisions: dayRevisions,
        isToday: new Date().toDateString() === new Date(year, month, dayIndex).toDateString(),
      });
    } else {
      calendarCells.push(null);
    }
  }

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-3xl border border-pink-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 id="calendar-header" className="font-sans font-bold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-1.5">
            Interactive Study Almanac <Sparkles className="w-4 h-4 text-pink-400" />
          </h3>
          <p className="text-xs text-gray-500">Click on any date to map out target exams, revision deadlines, or focus slots!</p>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-850 p-1 rounded-xl">
          <button
            onClick={prevMonth}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-sans font-extrabold text-sm text-gray-700 dark:text-gray-200">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Color code reference guide bar */}
      <div className="flex flex-wrap gap-4 text-[10px] text-gray-400 font-mono mb-4 border-b pb-3 items-center">
        <span>Color Orbits:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-300"></span> Study Session
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-300"></span> Spaced Revision
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-300"></span> Flagged Exams
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300"></span> Completed Orbits
        </span>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 font-mono">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar grid boxes */}
      <div className="grid grid-cols-7 gap-2">
        {calendarCells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="h-20 bg-gray-50/40 rounded-xl"></div>;
          }

          return (
            <div
              key={`day-${cell.dayNumber}`}
              onClick={() => handleDayClick(cell.dayNumber)}
              className={`h-20 p-1.5 border border-gray-100 hover:border-pink-300 rounded-xl transition-all select-none cursor-pointer text-left relative flex flex-col justify-between ${
                cell.isToday
                  ? "bg-pink-50/50 border-pink-200"
                  : "bg-white dark:bg-gray-900"
              }`}
            >
              <span className={`text-[10px] font-bold font-mono ${cell.isToday ? "text-pink-600" : "text-gray-600 dark:text-gray-300"}`}>
                {cell.dayNumber}
              </span>

              {/* Stack matching events visual badges inline */}
              <div className="space-y-1 overflow-hidden flex-1 flex flex-col justify-end mt-1 max-h-[50px]">
                {cell.tasks.map((t) => (
                  <div
                    key={t.id}
                    title={t.title}
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid triggering parent folder click
                      completeTask(t.id);
                    }}
                    className={`text-[8px] leading-snug px-1.5 py-0.5 rounded-[4px] truncate transition-transform hover:scale-101 min-h-[14px] flex items-center justify-between ${
                      t.isCompleted
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium"
                        : t.priority === "🔥 Urgent"
                        ? "bg-indigo-150 text-indigo-800 dark:bg-indigo-950/40"
                        : "bg-pink-100 text-pink-850 dark:bg-pink-950/40"
                    }`}
                  >
                    <span>{t.title}</span>
                    {t.isCompleted && <Check className="w-2 h-2 text-emerald-600 shrink-0 ml-0.5" />}
                  </div>
                ))}

                {cell.revisions.map((r) => (
                  <div
                    key={r.id}
                    title="Spaced Review"
                    className="text-[8px] leading-snug bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300 px-1.5 py-0.5 rounded-[4px] truncate min-h-[14px]"
                  >
                    🔁 Spaced Rev
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50">
          <form
            onSubmit={handleAddTask}
            className="bg-white dark:bg-gray-900 border border-pink-100 rounded-3xl p-6 shadow-xl max-w-sm w-full mx-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-sans font-bold text-gray-800 dark:text-white text-sm">
                Schedule study: {selectedDateStr}
              </h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xs py-1 px-2 border rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Task Title:</label>
                <input
                  id="calendar-add-title"
                  type="text"
                  placeholder="e.g. Master tree structures"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Subject Folder:</label>
                  <select
                    id="calendar-add-subject"
                    value={newSubId}
                    onChange={(e) => setNewSubId(e.target.value)}
                    className="w-full text-xs p-2 border rounded-xl outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        📁 {s.name.split(" ")[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Target Hours:</label>
                  <input
                    id="calendar-add-hours"
                    type="number"
                    value={newHours}
                    onChange={(e) => setNewHours(parseFloat(e.target.value) || 2)}
                    className="w-full text-xs p-2 border rounded-xl outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">Urgency:</label>
                <select
                  id="calendar-add-priority"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Priority)}
                  className="w-full text-xs p-2 border rounded-xl outline-none bg-gray-50 dark:bg-gray-800 dark:text-white"
                >
                  <option value="🌸 Easy">🌸 Easy</option>
                  <option value="⭐ Important">⭐ Important</option>
                  <option value="🔥 Urgent">🔥 Urgent</option>
                </select>
              </div>
            </div>

            <button
              id="calendar-add-submit"
              type="submit"
              className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-xl py-2 px-4 shadow-md text-xs font-bold cursor-pointer transition-transform hover:scale-101"
            >
              Add to Calendar 🌸
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
