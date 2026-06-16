/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import { Priority } from "../types";
import { Plus, BookOpen, Trash2, CheckCircle, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const StudyPlanner: React.FC = () => {
  const { subjects, topics, addSubject, removeSubject, addTopic, updateTopicProgress, removeTopic, generateAISchedule, isSyncing } = useStudy();

  const [subjectName, setSubjectName] = useState("");
  const [subjectColor, setSubjectColor] = useState("from-pink-200 to-pink-300 text-pink-700");
  const [targetHours, setTargetHours] = useState(20);

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "");
  const [topicName, setTopicName] = useState("");
  const [topicPriority, setTopicPriority] = useState<Priority>("⭐ Important");

  const [aiHours, setAiHours] = useState(3);
  const [aiDays, setAiDays] = useState(5);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    addSubject(subjectName, subjectColor, targetHours);
    setSubjectName("");
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim() || !selectedSubjectId) return;
    addTopic(selectedSubjectId, topicName, topicPriority);
    setTopicName("");
  };

  const colorsList = [
    { class: "from-pink-200 to-pink-300 text-pink-700", name: "Pink Flower" },
    { class: "from-purple-200 to-purple-300 text-purple-700", name: "Lavender Petal" },
    { class: "from-indigo-200 to-indigo-300 text-indigo-700", name: "Sky Space" },
    { class: "from-emerald-200 to-emerald-300 text-emerald-700", name: "Mint Sprouts" },
    { class: "from-amber-200 to-amber-300 text-amber-700", name: "Cozy Cream" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Subjects folders panel */}
      <div className="space-y-6">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-3xl border border-pink-100 p-5 shadow-sm">
          <h4 className="font-sans font-bold text-gray-800 dark:text-gray-100 text-sm mb-4">
            Catalog Subject Folder
          </h4>

          <form onSubmit={handleCreateSubject} className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans block mb-1">
                Subject Name or Title:
              </label>
              <input
                id="subject-add-name"
                type="text"
                placeholder="e.g. Database Management (DBMS)"
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-150 outline-none focus:ring-1 focus:ring-pink-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans block mb-1">
                  Target Study Hours:
                </label>
                <input
                  id="subject-add-hours"
                  type="number"
                  value={targetHours}
                  onChange={(e) => setTargetHours(parseInt(e.target.value) || 20)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-150 outline-none focus:ring-1 focus:ring-pink-300"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans block mb-1">
                  Theme Preset:
                </label>
                <select
                  id="subject-add-color"
                  value={subjectColor}
                  onChange={(e) => setSubjectColor(e.target.value)}
                  className="w-full text-xs px-2 py-2 rounded-xl bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-150 outline-none"
                >
                  {colorsList.map((c) => (
                    <option key={c.class} value={c.class}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              id="subject-add-submit"
              type="submit"
              className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-xl py-2 px-4 shadow-sm text-xs font-semibold cursor-pointer select-none transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Save Subject
            </button>
          </form>

          {/* List existing subjects */}
          <div className="mt-5 border-t pt-4 space-y-2 max-h-[140px] overflow-y-auto">
            {subjects.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-850">
                <span className="text-xs font-sans font-medium text-gray-700 dark:text-gray-200 line-clamp-1 flex-1">
                  📁 {s.name}
                </span>
                <button
                  onClick={() => removeSubject(s.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI Scheduler triggers */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-3xl border border-pink-100 p-5 shadow-sm">
          <h4 className="font-sans font-bold text-pink-700 dark:text-pink-300 text-sm mb-1.5 flex items-center gap-1.5">
            Bloomie AI Power Plan <Sparkles className="w-4.5 h-4.5 text-pink-500 animate-pulse" />
          </h4>
          <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
            Create an engineered hourly schedule matching your exam. We automatically allocate dates for all remaining syllabus concepts!
          </p>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Study Hours Daily:</label>
                <input
                  id="ai-hours-input"
                  type="number"
                  value={aiHours}
                  onChange={(e) => setAiHours(parseInt(e.target.value) || 3)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 dark:text-white border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Target Total Days:</label>
                <input
                  id="ai-days-input"
                  type="number"
                  value={aiDays}
                  onChange={(e) => setAiDays(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 dark:text-white border rounded-xl outline-none"
                />
              </div>
            </div>

            <button
              id="ai-generate-schedule-btn"
              onClick={() => generateAISchedule(aiHours, aiDays)}
              disabled={isSyncing || topics.filter((t) => !t.isCompleted).length === 0}
              className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-xl py-2.5 px-4 text-xs font-bold shadow-md cursor-pointer select-none transition-transform hover:scale-101 flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> Generating Orbits...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Synthesize AI Plan ({topics.filter((t) => !t.isCompleted).length} pending topics)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chapters checklist syllabus panel */}
      <div className="lg:col-span-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-3xl border border-pink-100 p-5 shadow-sm flex flex-col h-full justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h4 className="font-sans font-bold text-gray-800 dark:text-gray-100 text-sm">
                Syllabus Topics & Target Chapters
              </h4>
              <p className="text-xs text-gray-400">Map your exam requirements before asking Bloomie to schedule.</p>
            </div>

            {/* Quick add topic form inline */}
            <form onSubmit={handleCreateTopic} className="hidden sm:flex col-span-2 gap-2 max-w-md items-center">
              <select
                id="topic-add-subject"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="text-[11px] px-2.5 py-1.5 bg-gray-50 border rounded-xl outline-none dark:bg-gray-850 dark:text-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    📁 {s.name.split(" ")[0]}
                  </option>
                ))}
              </select>

              <input
                id="topic-add-title"
                type="text"
                placeholder="concept/chapter..."
                required
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                className="text-[11px] px-3 py-1.5 border rounded-xl outline-none dark:bg-gray-850 dark:text-white"
              />

              <select
                id="topic-add-priority"
                value={topicPriority}
                onChange={(e) => setTopicPriority(e.target.value as Priority)}
                className="text-[11px] px-2.5 py-1.5 bg-gray-50 border rounded-xl outline-none dark:bg-gray-850 dark:text-white"
              >
                <option value="🌸 Easy">🌸 Easy</option>
                <option value="⭐ Important">⭐ Important</option>
                <option value="🔥 Urgent">🔥 Urgent</option>
              </select>

              <button
                type="submit"
                className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl py-1.5 px-3 shadow-xs text-[11px] cursor-pointer"
              >
                Add Topic
              </button>
            </form>
          </div>

          {/* List chapters checklist */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {topics.map((t) => {
              const matchedSub = subjects.find((s) => s.id === t.subjectId);
              return (
                <div key={t.id} className="p-3 bg-gray-50 dark:bg-gray-850 border border-gray-100 rounded-2xl flex items-center justify-between hover:shadow-xs transition-shadow">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateTopicProgress(t.id, t.isCompleted ? 0 : 100)}
                      className="text-gray-300 hover:text-pink-500 transition-colors cursor-pointer"
                    >
                      <CheckCircle className={`w-5 h-5 ${t.isCompleted ? "text-pink-400 fill-pink-50" : ""}`} />
                    </button>

                    <div>
                      <h5 className={`text-xs font-sans font-bold leading-relaxed ${t.isCompleted ? "line-through text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-200"}`}>
                        {t.title}
                      </h5>
                      <div className="flex gap-2.5 mt-0.5 text-[10px] items-center font-mono">
                        <span className="text-gray-400">📁 {matchedSub ? matchedSub.name.split(" ")[0] : "Academic"}</span>
                        <span className={`font-semibold ${t.priority === "🔥 Urgent" ? "text-rose-500" : t.priority === "⭐ Important" ? "text-amber-500" : "text-pink-500"}`}>{t.priority}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Range slider for syllabus chapter fraction completed */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={t.syllabusProgress}
                        onChange={(e) => updateTopicProgress(t.id, parseInt(e.target.value))}
                        className="w-16 h-1 bg-gray-250 rounded-lg appearance-none cursor-pointer accent-pink-400"
                      />
                      <span className="text-[10px] text-gray-400 font-mono w-7 text-right">{t.syllabusProgress}%</span>
                    </div>

                    <button
                      onClick={() => removeTopic(t.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning callout */}
        <div className="border border-amber-100 bg-amber-50/40 p-3.5 rounded-2xl flex items-start gap-2 max-w-xl">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed text-amber-700">
            <strong>Pro Tip:</strong> Place your most difficult syllabus items (e.g., Graphs or Normalization) under the ⭐ Important or 🔥 Urgent priority flag so the AI Scheduler pushes them forward to early dates!
          </p>
        </div>
      </div>
    </div>
  );
};
