/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import { Goal, GoalStage } from "../types";
import { Sprout, Sparkles, Plus, Calendar, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const StudyGarden: React.FC = () => {
  const { goals, addGoal, advanceGoalProgress, removeGoal } = useStudy();
  const [showAdd, setShowAdd] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDesc, setGoalDesc] = useState("");
  const [goalDays, setGoalDays] = useState(14);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    addGoal(goalTitle, goalDesc, goalDays);
    setGoalTitle("");
    setGoalDesc("");
    setShowAdd(false);
  };

  const getStageStyle = (stage: GoalStage) => {
    switch (stage) {
      case "Tree":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200",
          badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
        };
      case "Flower":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200",
          badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
        };
      case "Plant":
        return {
          bg: "bg-sky-50 dark:bg-sky-950/30 border-sky-200",
          badge: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
        };
      default:
        return {
          bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200",
          badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
        };
    }
  };

  const drawStageVector = (stage: GoalStage) => {
    switch (stage) {
      case "Tree":
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto animate-pulse">
            {/* Trunk */}
            <path d="M48 65 Q 50 85 52 85 Q 52 85 48 85 L 46 85 Q 46 65 48 65" fill="#78350F" />
            {/* Cherry blossom bundle */}
            <circle cx="50" cy="40" r="18" fill="#F472B6" opacity="0.9" />
            <circle cx="62" cy="48" r="14" fill="#F472B6" opacity="0.8" />
            <circle cx="38" cy="48" r="14" fill="#F472B6" opacity="0.8" />
            <circle cx="50" cy="52" r="12" fill="#F9A8D4" opacity="0.9" />
            {/* Sparkles */}
            <path d="M30 30 L 32 34 L 30 38 L 28 34 Z" fill="#FBBF24" />
            <path d="M70 34 L 72 38 L 70 42 L 68 38 Z" fill="#FBBF24" />
          </svg>
        );
      case "Flower":
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto animate-bounce">
            {/* Stem */}
            <path d="M50 45 L 50 85" stroke="#22C55E" strokeWidth="3" />
            <path d="M50 65 Q 40 60 42 55" stroke="#22C55E" strokeWidth="2.5" fill="none" />
            {/* Bud */}
            <path d="M50 35 C 38 35 40 50 50 55 C 60 50 62 35 50 35" fill="#E879F9" />
            <path d="M50 35 Q 46 45 50 55 Q 54 45 50 35" fill="#F472B6" />
          </svg>
        );
      case "Plant":
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto">
            {/* Stem */}
            <path d="M50 50 L 50 85" stroke="#4ADE80" strokeWidth="3" />
            {/* Left Leaf */}
            <path d="M50 70 Q 32 60 40 54 C 44 58 50 64 50 70" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" />
            {/* Right Leaf */}
            <path d="M50 60 Q 68 50 60 44 C 56 48 50 54 50 60" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" />
          </svg>
        );
      default:
        // Seed
        return (
          <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto">
            {/* Soil */}
            <ellipse cx="50" cy="80" rx="20" ry="6" fill="#78350F" />
            {/* Seed shell */}
            <ellipse cx="50" cy="74" rx="8" ry="10" fill="#D97706" />
            {/* Little tiny sprout head */}
            <path d="M 50,68 C 45,62 52,56 50,50 C 52,56 55,62 50,68" stroke="#4ADE80" strokeWidth="2" fill="#86EFAC" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-3xl border border-pink-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 id="garden-title" className="font-sans font-bold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2">
            Study Goal Garden <Sprout className="w-5 h-5 text-emerald-500 animate-pulse" />
          </h3>
          <p className="text-xs text-gray-500">Every task completed waters your beautiful garden!</p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 bg-emerald-400 hover:bg-emerald-500 text-white rounded-full py-1.5 px-4 text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Seed
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 p-4 rounded-2xl mb-6 flex flex-col gap-3"
          >
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 font-sans">
              Plant a New Academic Sprout 🌱
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                id="goal-title-input"
                type="text"
                placeholder="Sprout Title (e.g. Master GATE OS)"
                required
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-emerald-200 outline-none dark:text-white"
              />
              <input
                id="goal-days-input"
                type="number"
                placeholder="Target Days (e.g. 14)"
                value={goalDays}
                onChange={(e) => setGoalDays(parseInt(e.target.value) || 14)}
                className="text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-emerald-200 outline-none dark:text-white"
              />
            </div>

            <textarea
              id="goal-desc-input"
              placeholder="Description (e.g. Complete Process Scheduling tutorials)"
              value={goalDesc}
              onChange={(e) => setGoalDesc(e.target.value)}
              className="text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-emerald-200 outline-none h-16 dark:text-white resize-none"
            />

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-3.5 py-1.5 border border-emerald-200 text-emerald-800 rounded-xl hover:bg-emerald-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-400 text-white rounded-xl hover:bg-emerald-500 shadow-sm font-medium"
              >
                Plant Seed 🌸
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g) => {
          const style = getStageStyle(g.stage);
          return (
            <div
              key={g.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all hover:shadow-md ${style.bg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${style.badge}`}>
                  {g.stage}
                </span>

                <button
                  onClick={() => removeGoal(g.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {drawStageVector(g.stage)}

              <div className="text-center mt-3">
                <h4 className="font-sans font-bold text-gray-800 dark:text-gray-100 text-sm leading-snug">
                  {g.title}
                </h4>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 h-8">
                  {g.description || "Nurtured by standard study focus orbits!"}
                </p>
              </div>

              {/* Progress bar info */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mb-1">
                  <span>Progress: {g.progress}%</span>
                  <span className="flex items-center gap-0.5">
                    <Calendar className="w-3 h-3" /> {g.targetDays} Days
                  </span>
                </div>

                <div className="w-full h-2 bg-gray-250 dark:bg-gray-850 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${g.progress}%` }}
                  ></div>
                </div>

                {g.progress < 100 && (
                  <button
                    onClick={() => advanceGoalProgress(g.id, 20)}
                    className="w-full mt-3 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/40 rounded-xl py-1 px-3 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-500 animate-spin" /> Water Sprout (+20%)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
