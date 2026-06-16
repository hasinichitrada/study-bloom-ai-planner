/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useStudy } from "../context/StudyContext";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Award, TrendingUp, BookOpen, Clock, Calendar } from "lucide-react";

export const ProgressDashboard: React.FC = () => {
  const { subjects, pomodoroSessions, achievements, userProfile } = useStudy();

  // 1. Chart Data: Subjects progress breakdown
  const pieData = subjects.map((s) => ({
    name: s.name.split(" ")[0], // shorter label
    value: s.completedHours,
  })).filter(v => v.value > 0);

  // Fallback if no study hours are registered yet
  const displayPieData = pieData.length > 0 ? pieData : [{ name: "No Focus Units yet", value: 1 }];

  // Preset palette
  const COLORS = ["#F472B6", "#C084FC", "#818CF8", "#34D399", "#FB7185"];

  // 2. Weekly study time breakdown
  // Hardcoded or dynamically aggregated from pomodoroSessions logs
  const weeklyData = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 4.0 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 5.0 },
    { day: "Fri", hours: 3.2 },
    { day: "Sat", hours: 6.0 },
    { day: "Sun", hours: 1.0 },
  ];

  // Dynamic override with session hours if any
  if (pomodoroSessions.length > 0) {
    const dayMap: { [key: string]: number } = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    pomodoroSessions.forEach((pts) => {
      const date = new Date(pts.createdAt);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      if (dayName in dayMap && pts.mode === "Focus") {
        dayMap[dayName] += pts.duration / 60;
      }
    });

    Object.keys(dayMap).forEach((day, index) => {
      if (dayMap[day] > 0) {
        weeklyData[index].hours = parseFloat(dayMap[day].toFixed(1));
      }
    });
  }

  const studyHeatmapGrid = () => {
    // Render standard cute GitHub-styled calendar habit heatmap squares
    const totalDays = 28;
    const items = [];
    for (let i = 0; i < totalDays; i++) {
      // Simulate random intensity color bins
      let colorClass = "bg-gray-100 dark:bg-gray-800";
      if (i % 7 === 1 || i % 7 === 4) {
        colorClass = "bg-pink-100 dark:bg-pink-900/40";
      } else if (i % 7 === 3 || i % 7 === 5) {
        colorClass = "bg-pink-300 dark:bg-pink-700/60";
      } else if (i % 7 === 6) {
        colorClass = "bg-pink-500 dark:bg-pink-500";
      }
      items.push(
        <div
          key={i}
          className={`w-4 h-4 rounded-[4px] ${colorClass} transition-all hover:scale-115`}
          title={`Day ${i + 1}: Study Orbit Finished!`}
        ></div>
      );
    }
    return <div className="grid grid-cols-7 gap-1.5 justify-center">{items}</div>;
  };

  const badgeDetails = [
    { code: "ROOKIE", title: "Focus Rookie 🌟", desc: "Complete first Pomodoro session", style: "border-pink-200 bg-pink-50 text-pink-600" },
    { code: "WARRIOR", title: "Study Warrior 🔥", desc: "Solve 5 priority task milestones", style: "border-purple-200 bg-purple-50 text-purple-600" },
    { code: "QUEEN", title: "Consistency Queen 👑", desc: "Lock a 3-day study streak", style: "border-indigo-200 bg-indigo-50 text-indigo-600" },
    { code: "SCHOLAR", title: "Master Scholar 🎓", desc: "Unlock Level 3 Companion Bloomie", style: "border-emerald-200 bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Visual statistics top summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "XP Levels Earned", val: `${userProfile.xp} XP`, sub: `Lvl ${userProfile.level}`, icon: <TrendingUp className="w-4 h-4 text-pink-500" />, bg: "from-pink-50 to-pink-100/50" },
          { label: "Subjects Cataloged", val: subjects.length, sub: "Folder branches", icon: <BookOpen className="w-4 h-4 text-purple-500" />, bg: "from-purple-50 to-purple-100/50" },
          { label: "Active Streak", val: `${userProfile.streak} Days`, sub: `Longest: ${userProfile.longestStreak}`, icon: <Clock className="w-4 h-4 text-indigo-500" />, bg: "from-indigo-50 to-indigo-100/50" },
          { label: "Garden Seeds", val: achievements.length, sub: "Trophies unlocked", icon: <Award className="w-4 h-4 text-emerald-500" />, bg: "from-emerald-50 to-emerald-100/50" },
        ].map((s, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${s.bg} p-4 rounded-2xl border border-white shadow-sm flex items-center justify-between`}>
            <div>
              <span className="text-[10px] text-gray-500 block font-mono uppercase tracking-wider">{s.label}</span>
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{s.val}</span>
              <span className="text-[10px] text-gray-400 block font-mono mt-1">{s.sub}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border">{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Area Bar Chart */}
        <div className="lg:col-span-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-5 rounded-3xl border border-pink-100 shadow-sm">
          <h4 className="font-sans font-bold text-gray-800 dark:text-gray-100 text-sm mb-4">
            Daily Study Engagement Orbit (Hours)
          </h4>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                <Bar dataKey="hours" fill="#F472B6" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus breakdown and Heatmap */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-5 rounded-3xl border border-pink-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-sans font-bold text-gray-800 dark:text-gray-100 text-sm mb-2">
              Garden Habit Calendar
            </h4>
            <p className="text-[11px] text-gray-400 mb-4">Daily consistency seeds planted over past 28 cycles.</p>
          </div>

          {studyHeatmapGrid()}

          <div className="border-t pt-4 mt-4 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Total study cycles logged</span>
            <span className="text-pink-600 font-bold font-mono">18 Orbits</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie allocation */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-5 rounded-3xl border border-pink-100 shadow-sm flex flex-col items-center">
          <h4 className="font-sans font-bold text-gray-800 dark:text-gray-100 text-sm w-full text-left mb-4">
            Study Hours Distribution by Folder
          </h4>
          <div className="w-full h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {displayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center text-[10px] text-gray-500 font-mono">
            {displayPieData.map((d, index) => (
              <span key={index} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {d.name}
              </span>
            ))}
          </div>
        </div>

        {/* Gamified Trophy Hall */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-5 rounded-3xl border border-pink-100 shadow-sm">
          <h4 className="font-sans font-bold text-gray-800 dark:text-gray-100 text-sm mb-4 flex items-center gap-2">
            Companion Reward Badges <Award className="w-4 h-4 text-yellow-500" />
          </h4>

          <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
            {badgeDetails.map((b) => {
              const isUnlocked = achievements.some((a) => a.code === b.code);
              return (
                <div
                  key={b.code}
                  className={`p-3 rounded-2xl border flex items-center gap-3.5 transition-all ${
                    isUnlocked
                      ? b.style + " border-opacity-100 opacity-100"
                      : "border-gray-100 bg-gray-50 text-gray-400 opacity-50"
                  }`}
                >
                  <div className="bg-white p-2 rounded-xl text-center shadow-xs">
                    🏆
                  </div>
                  <div>
                    <h5 className="font-sans font-black text-xs">
                      {b.title}
                    </h5>
                    <p className="text-[10px] leading-tight font-mono opacity-80 mt-0.5">
                      {b.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
