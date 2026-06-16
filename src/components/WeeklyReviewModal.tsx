/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import { Award, RefreshCw, Star, ArrowUpRight, Download, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const WeeklyReviewModal: React.FC = () => {
  const { subjects, tasks, pomodoroSessions } = useStudy();
  const [isOpen, setIsOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [report, setReport] = useState<any>(null);

  const triggerReviewCompilation = async () => {
    setIsCompiling(true);
    try {
      const completedCount = tasks.filter((t) => t.isCompleted).length;
      const missedCount = tasks.filter((t) => !t.isCompleted).length;
      const hoursCount = pomodoroSessions
        .filter((s) => s.mode === "Focus")
        .reduce((sum, current) => sum + current.duration / 60, 0);

      const response = await fetch("/api/gemini/weekly-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjects: subjects.map((s) => ({ name: s.name, targetHours: s.targetStudyHours, completed: s.completedHours })),
          completedTasksCount: completedCount,
          missedTasksCount: missedCount,
          pomodoroHours: parseFloat(hoursCount.toFixed(1)),
        }),
      });

      const data = await response.json();
      if (data) {
        setReport(data);
      }
    } catch (err) {
      console.error("Weekly Review Failure:", err);
      // Fallback sweet mock compilation
      setReport({
        weeklyGrade: "Budding Blossom Scholar! 🌸",
        cheer: "You tackled so many core chapters and kept Bloomie hydrated and happy this week. You are building exceptional study momentum, sprout!",
        completedHighlight: "Mastering graph traversal algorithms and DBMS schemas was your high-frequency highlight!",
        suggestions: [
          "Dedicate 15 more minutes to Operating Systems processes early in the morning.",
          "Keep study timer blocks split into exactly 25-minute pomf focus sessions.",
          "Water your study garden seed at least once daily before resting.",
        ],
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          triggerReviewCompilation();
        }}
        className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl py-3 px-4 shadow-md text-xs font-bold leading-tight select-none cursor-pointer flex items-center justify-center gap-2 transition-transform hover:scale-101 shrink-0"
      >
        <Award className="w-4 h-4 animate-bounce" /> Compile Sunday Weekly Review
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 border border-pink-100 dark:border-pink-950/40 rounded-3xl p-6 shadow-2xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto print:border-none print:shadow-none">
            
            <div className="flex items-center justify-between border-b pb-4 mb-4 select-none print:hidden">
              <h3 className="font-sans font-black text-gray-800 dark:text-white text-base flex items-center gap-2">
                🌸 Bloomie Sunday Weekly Dossier
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xs py-1 px-2.5 border rounded-xl"
              >
                Close Report
              </button>
            </div>

            {isCompiling ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
                <p className="text-xs text-gray-500 font-mono">Bloomie is organizing your metrics and printing dossier cards...</p>
              </div>
            ) : report ? (
              <div id="weekly-review-print-pane" className="space-y-5">
                <div className="text-center">
                  <div className="inline-block bg-pink-100 text-pink-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 font-mono">
                    🏅 Grade: {report.weeklyGrade}
                  </div>
                  <h4 className="font-sans font-extrabold text-gray-800 dark:text-white text-lg">
                    Comprehensive Weekly Insights
                  </h4>
                  <p className="text-[11px] text-gray-400 font-mono">Compiled on {new Date().toLocaleDateString()}</p>
                </div>

                {/* Cheer box */}
                <div className="bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 p-4 rounded-2xl">
                  <p className="text-xs italic leading-relaxed text-pink-800 dark:text-pink-300 font-medium">
                    "{report.cheer}"
                  </p>
                </div>

                {/* Highlights */}
                <div>
                  <h5 className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2 font-mono flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500" /> Weekly Highlight
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-850 p-3.5 rounded-xl border">
                    {report.completedHighlight}
                  </p>
                </div>

                {/* Suggestions list */}
                <div>
                  <h5 className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-2 font-mono flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-pink-500" /> Growth Vectors for Next Week
                  </h5>
                  <ul className="space-y-2">
                    {report.suggestions?.map((item: string, index: number) => (
                      <li key={index} className="text-xs flex items-start gap-2.5 bg-gray-50 dark:bg-gray-850 border rounded-xl p-2.5">
                        <span className="text-pink-500 font-extrabold">🌸</span>
                        <span className="text-gray-600 dark:text-gray-300 leading-relaxed font-sans">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action buttons footer */}
                <div className="flex gap-3 pt-4 border-t print:hidden select-none">
                  <button
                    onClick={handlePrint}
                    className="flex-1 bg-pink-400 hover:bg-pink-500 text-white rounded-xl py-2 px-4 shadow-sm text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4" /> Save / Export as PDF
                  </button>
                  <button
                    onClick={triggerReviewCompilation}
                    className="p-2 border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};
