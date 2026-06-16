/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useStudy } from "../context/StudyContext";
import { Play, Pause, RotateCcw, Flame, CheckCircle, Volume2, Timer } from "lucide-react";
import { motion } from "motion/react";

type TimerMode = "Focus" | "Break" | "Long Break";

export const TimerPomodoro: React.FC = () => {
  const { subjects, logPomodoroSession } = useStudy();
  const [mode, setMode] = useState<TimerMode>("Focus");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  const incrementIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set default subject if subjects list is populated
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects]);

  const getModeDuration = (m: TimerMode) => {
    switch (m) {
      case "Break":
        return 5 * 60;
      case "Long Break":
        return 15 * 60;
      default:
        return 25 * 60;
    }
  };

  useEffect(() => {
    setTimeLeft(getModeDuration(mode));
    setIsActive(false);
  }, [mode]);

  useEffect(() => {
    if (isActive) {
      incrementIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (incrementIntervalRef.current) {
      clearInterval(incrementIntervalRef.current);
    }

    return () => {
      if (incrementIntervalRef.current) clearInterval(incrementIntervalRef.current);
    };
  }, [isActive]);

  const handleTimerComplete = () => {
    setIsActive(false);
    triggerAudioChime();
    const durationMins = Math.round(getModeDuration(mode) / 60);

    logPomodoroSession(selectedSubjectId || subjects[0]?.id || "sub-1", durationMins, mode);

    if (mode === "Focus") {
      setCompletedSessionsCount((c) => c + 1);
      // Auto transition to breaks
      setMode(completedSessionsCount >= 3 ? "Long Break" : "Break");
    } else {
      setMode("Focus");
    }
  };

  const toggleStart = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(getModeDuration(mode));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // HTML5 Web Audio API Custom synthesised soft chime so we don't rely on external URLs
  const triggerAudioChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 Note
      osc.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.3); // C6 Note

      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log("Audio contexts pending permissions:", e);
    }
  };

  const progressPercent = ((getModeDuration(mode) - timeLeft) / getModeDuration(mode)) * 100;

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-3xl border border-pink-100 p-6 shadow-sm flex flex-col md:flex-row items-center gap-8">
      {/* Visual Timer Progress dial */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Animated outer waves */}
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full bg-pink-100/30 dark:bg-pink-900/20 z-0"
          ></motion.div>
        )}

        <svg className="w-full h-full transform -rotate-90 z-10">
          {/* Track shadow */}
          <circle cx="112" cy="112" r="95" stroke="#FCE7F3" strokeWidth="8" fill="transparent" className="dark:stroke-gray-800" />
          {/* Progress fill */}
          <circle
            cx="112"
            cy="112"
            r="95"
            stroke="#F472B6"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 95}
            strokeDashoffset={2 * Math.PI * 95 * (1 - progressPercent / 100)}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>

        {/* Center Clock label */}
        <div className="absolute flex flex-col items-center justify-center z-20">
          <span className="text-[10px] uppercase tracking-widest text-pink-400 font-bold mb-1 font-mono">
            {mode} Mode
          </span>
          <span id="timer-countdown" className="text-4xl font-sans font-black text-gray-800 dark:text-white leading-none">
            {formatTime(timeLeft)}
          </span>
          <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-500 px-2.5 py-0.5 rounded-full mt-2.5 text-[10px] font-bold">
            <Flame className="w-3.5 h-3.5" />
            <span>{completedSessionsCount} Pomeranian</span>
          </div>
        </div>
      </div>

      {/* Control widgets panel */}
      <div className="flex-1 w-full">
        <div className="flex gap-2 mb-4 bg-gray-100/80 dark:bg-gray-800/80 p-1.5 rounded-2xl">
          {(["Focus", "Break", "Long Break"] as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold select-none transition-all cursor-pointer ${
                mode === m
                  ? "bg-pink-450 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Choose associated subject folder */}
        <div className="space-y-1.5 mb-5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-sans block">
            Bind Study Session To Folder:
          </label>
          <select
            id="timer-subject-select"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full text-xs px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-150 outline-none"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                📁 {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Control play buttons */}
        <div className="flex gap-3">
          <button
            id="timer-playback-btn"
            onClick={toggleStart}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 select-none cursor-pointer transition-transform hover:scale-102 ${
              isActive ? "bg-amber-450 hover:bg-amber-500" : "bg-pink-400 hover:bg-pink-500"
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-white" /> Pause Focus
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Start Focus
              </>
            )}
          </button>

          <button
            id="timer-reset-btn"
            onClick={handleReset}
            className="p-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-150/50 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>

          <button
            onClick={triggerAudioChime}
            className="p-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-150/50 rounded-xl transition-colors cursor-pointer"
            title="Test ChimeSound"
          >
            <Volume2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Actionable notification bubble */}
        <div className="border border-pink-100/60 dark:border-pink-950/40 bg-pink-50/50 dark:bg-pink-950/10 p-3.5 rounded-2xl flex items-start gap-2.5 mt-5">
          <CheckCircle className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
          <div className="text-[11px] leading-relaxed text-pink-700 dark:text-pink-300 font-sans">
            <strong>Study Tip:</strong> {mode === "Focus" ? "Quiet all social notifications! Put down your screen and focus on standard syllabus trees." : "Take deep breaths. Lean back, hydrate, and stretch your cute core muscle."}
          </div>
        </div>
      </div>
    </div>
  );
};
