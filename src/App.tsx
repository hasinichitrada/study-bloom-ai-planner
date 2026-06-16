/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { StudyProvider, useStudy } from "./context/StudyContext";
import { CompanionMascot } from "./components/CompanionMascot";
import { StudyGarden } from "./components/StudyGarden";
import { TimerPomodoro } from "./components/TimerPomodoro";
import { NotesEditor } from "./components/NotesEditor";
import { ProgressDashboard } from "./components/ProgressDashboard";
import { StudyPlanner } from "./components/StudyPlanner";
import { CalendarView } from "./components/CalendarView";
import { ExamCountdown, SpacedRevisionWidget, UserProfilePanel, SmartNotificationsHeader } from "./components/AestheticWidgets";
import { Sparkles, Sun, Moon, Compass, BookOpen, Clock, Calendar, LayoutDashboard, BarChart } from "lucide-react";

type PrimaryTab = "Dashboard" | "Planner" | "Timer" | "Calendar" | "Notebook" | "Insights";

function MainDashboardAppContent() {
  const [activeTab, setActiveTab] = useState<PrimaryTab>("Dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [rightDrawerMode, setRightDrawerMode] = useState<"mascot" | "widgets" | "none">("mascot");
  const { userProfile, companion, triggerSyncing } = useStudy();

  // Handle CSS Dark mode toggle using tailwind standards if requested
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "Planner":
        return <StudyPlanner />;
      case "Timer":
        return <TimerPomodoro />;
      case "Calendar":
        return <CalendarView />;
      case "Notebook":
        return <NotesEditor />;
      case "Insights":
        return <ProgressDashboard />;
      default:
        // Dashboard home
        return (
          <div className="space-y-6">
            <StudyGarden />
          </div>
        );
    }
  };

  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: <Compass className="w-4 h-4" />, emoji: "🌱" },
    { id: "Planner", label: "Planner", icon: <BookOpen className="w-4 h-4" />, emoji: "📅" },
    { id: "Timer", label: "Focus Timer", icon: <Clock className="w-4 h-4" />, emoji: "🍅" },
    { id: "Calendar", label: "Almanac Grid", icon: <Calendar className="w-4 h-4" />, emoji: "📆" },
    { id: "Notebook", label: "Study Notes", icon: <LayoutDashboard className="w-4 h-4" />, emoji: "📝" },
    { id: "Insights", label: "Analytics", icon: <BarChart className="w-4 h-4" />, emoji: "📊" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8F7FF] dark:bg-gray-950 font-sans text-[#4A4E69] dark:text-gray-150 transition-colors duration-500 overflow-hidden">
      
      {/* 1. Left Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex w-64 bg-[#EBE8FF] dark:bg-gray-900 border-r border-[#DCD6FF] dark:border-gray-800 h-screen sticky top-0 flex-col p-6 shrink-0 justify-between select-none">
        <div className="space-y-8">
          {/* Title Logo Group */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-[#B8A9FF] rounded-2xl flex items-center justify-center shadow-xs">
              <span className="text-2xl">🌸</span>
            </div>
            <div>
              <h1 id="app-logo-text" className="text-lg font-bold tracking-tight text-[#5E548E] dark:text-pink-300">
                Study Bloom
              </h1>
              <p className="text-[9px] text-[#9A8C98] dark:text-gray-400 font-medium">Cosy learning orbit</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as PrimaryTab)}
                  className={`w-full rounded-xl px-4 py-3 flex items-center gap-3 text-xs font-semibold select-none transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white dark:bg-gray-800 text-[#5E548E] dark:text-white shadow-xs transform translate-x-1"
                      : "text-[#4A4E69] dark:text-gray-300 hover:bg-white/40 dark:hover:bg-gray-800/40 hover:text-[#5E548E] dark:hover:text-white"
                  }`}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mascot Level Card in sidebar */}
        <div className="bg-white/60 dark:bg-gray-800/30 p-4 rounded-2xl border border-white/80 dark:border-gray-800">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 bg-[#FFD6E0] rounded-full flex items-center justify-center text-xs shadow-xs">🐰</div>
            <div>
              <div className="text-[11px] font-bold text-[#5E548E] dark:text-pink-300">
                Bloomie (Lv. {userProfile.level})
              </div>
              <p className="text-[9px] text-[#9A8C98] leading-none">XP: {userProfile.xp}/{(userProfile.level * 100)}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
            <div
              className="bg-[#B8A9FF] h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (userProfile.xp / (userProfile.level * 100)) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[9px] mt-2 opacity-70 italic line-clamp-2">"{companion.status}"</p>
        </div>
      </aside>

      {/* Mobile Top Header (replaces sidebar on small screens) */}
      <div className="md:hidden sticky top-0 z-40 bg-[#EBE8FF]/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-3 border-b border-[#DCD6FF] dark:border-gray-850 flex items-center justify-between shadow-xs select-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#B8A9FF] rounded-lg flex items-center justify-center text-xs">🌸</div>
          <span className="font-bold text-sm text-[#5E548E] dark:text-white">Study Bloom</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as PrimaryTab)}
            className="text-xs px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-[#DCD6FF] dark:border-gray-750 text-[#5E548E] dark:text-white rounded-xl outline-none"
          >
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.emoji} {item.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1 px-2 text-xs border bg-white dark:bg-gray-800 rounded-lg"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* 2. Main Content Frame */}
      <main className="flex-1 flex flex-col p-4 md:p-8 gap-6 overflow-y-auto h-screen max-w-full">
        {/* Header Section with User Greeting + Streak Badge */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#5E548E] dark:text-pink-300">
              Hi, {userProfile.name.split(" ")[0]}! 👋
            </h2>
            <p className="text-xs md:text-sm text-[#9A8C98] dark:text-gray-400">
              {userProfile.tagline || "Grow your knowledge one study session at a time."}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="bg-[#FFF0F3] dark:bg-pink-900/10 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 border border-[#FFD1DC] dark:border-pink-950/40 shadow-xs">
              <span className="text-orange-400">🔥</span>
              <span className="font-bold text-xs text-[#FF85A1]">{userProfile.streak} Day Streak</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerSyncing()}
                className="hidden sm:flex text-[10px] bg-white border border-[#DCD6FF] hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-[#5E548E] dark:text-pink-300 font-extrabold px-3 py-1.5 rounded-full items-center gap-1 transition-colors cursor-pointer"
              >
                ⛅ Synced
              </button>

              <SmartNotificationsHeader />
            </div>
          </div>
        </header>

        {/* Render Tab Contents */}
        <div className="flex-1 min-w-0">
          {renderActiveTabContent()}
        </div>
      </main>

      {/* 3. Right Action Dock Panel (The visual drawer toggles) */}
      <div className="flex flex-row md:flex-row h-auto md:h-screen sticky bottom-0 md:top-0 shrink-0 select-none z-30">
        
        {/* Helper drawer slide-out */}
        {rightDrawerMode !== "none" && (
          <div className="hidden lg:block w-80 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-l border-[#DCD6FF] dark:border-gray-800 h-screen overflow-y-auto p-6 transition-all duration-300">
            {rightDrawerMode === "mascot" ? (
              <div className="space-y-4">
                <CompanionMascot />
              </div>
            ) : (
              <div className="space-y-4">
                <UserProfilePanel />
                <SpacedRevisionWidget />
                <ExamCountdown />
              </div>
            )}
          </div>
        )}

        {/* Minimal Right Rail Dock */}
        <div className="w-full md:w-16 bg-white dark:bg-gray-900 border-t md:border-t-0 md:border-l border-[#F0F0F0] dark:border-gray-800 flex md:flex-col items-center justify-around md:justify-start py-3 md:py-6 gap-3 md:gap-6 shrink-0 shadow-xs">
          {/* Quick interactive action triggers */}
          <button
            onClick={() => {
              alert("Planted seed guide: Hit 'Add Seed' inside the Study Goal Garden on the dashboard home screen!");
            }}
            className="w-10 h-10 rounded-2xl bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#B8A9FF] flex items-center justify-center text-xl shadow-xs transition-colors cursor-pointer"
            title="Sow New Seed Tips"
          >
            +
          </button>

          <div className="hidden md:block h-[1px] w-8 bg-gray-100 dark:bg-gray-800"></div>

          <div className="flex md:flex-col gap-4">
            {/* Click to open Bloomie Mascot drawer */}
            <div
              onClick={() => setRightDrawerMode(rightDrawerMode === "mascot" ? "none" : "mascot")}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all ${
                rightDrawerMode === "mascot" ? "bg-[#FFF0F3] scale-108 ring-2 ring-[#FFD1DC]" : "bg-gray-50 dark:bg-gray-800 grayscale hover:grayscale-0 shadow-xs"
              }`}
              title="Speak with Bloomie Mascot"
            >
              🌸
            </div>

            {/* Click to open Student Settings / Revisions drawer */}
            <div
              onClick={() => setRightDrawerMode(rightDrawerMode === "widgets" ? "none" : "widgets")}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg cursor-pointer transition-all ${
                rightDrawerMode === "widgets" ? "bg-[#F0FDF4] scale-108 ring-2 ring-emerald-200" : "bg-gray-50 dark:bg-gray-800 grayscale hover:grayscale-0 shadow-xs"
              }`}
              title="Dashboard Statistics & Profile"
            >
              🍃
            </div>

            {/* Light / Dark Mode fast toggle */}
            <div
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-lg cursor-pointer grayscale hover:grayscale-0 shadow-xs"
              title="Switch Color Mode"
            >
              {darkMode ? "☀️" : "☁️"}
            </div>
          </div>

          <div className="md:mt-auto">
            <div
              onClick={() => triggerSyncing()}
              className="w-10 h-10 rounded-2xl bg-[#5E548E]/10 dark:bg-gray-800/60 flex items-center justify-center text-xl cursor-pointer hover:bg-[#5E548E]/20 transition-colors"
              title="Manual Sync Databases"
            >
              ⚙️
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <StudyProvider>
      <MainDashboardAppContent />
    </StudyProvider>
  );
}

