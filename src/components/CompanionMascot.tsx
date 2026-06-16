/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import { Sparkles, MessageCircle, Send, Heart, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const CompanionMascot: React.FC = () => {
  const { companion, triggerBloomieChat, userProfile } = useStudy();
  const [inputText, setInputText] = useState("");
  const [isTalking, setIsTalking] = useState(false);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setIsTalking(true);
    const textToSubmit = inputText;
    setInputText("");
    await triggerBloomieChat(textToSubmit);
    setIsTalking(false);
  };

  const getEmotionColors = () => {
    switch (companion.emotion) {
      case "excited":
        return "bg-rose-150 border-rose-300 shadow-rose-200/50";
      case "thinking":
        return "bg-amber-50 border-amber-300 shadow-amber-200/50";
      case "asleep":
        return "bg-indigo-50 border-indigo-200 shadow-indigo-100/50";
      case "cheering":
        return "bg-emerald-50 border-emerald-300 shadow-emerald-200/50";
      case "worried":
        return "bg-sky-50 border-sky-300 shadow-sky-200/50";
      default:
        return "bg-purple-50 border-purple-200 shadow-purple-100/30";
    }
  };

  // Render highly customized CSS vector animation layers for Bloomie 🌸
  const renderMascotSVG = () => {
    const isWiggling = companion.emotion === "excited" || companion.emotion === "cheering";
    const isBlushing = companion.emotion === "happy" || companion.emotion === "excited";
    const isFloating = companion.emotion !== "asleep";

    return (
      <div className={`relative w-44 h-44 mx-auto flex items-center justify-center ${isWiggling ? "animate-bounce" : ""} ${isFloating ? "animate-pulse" : ""}`}>
        {/* Glow behind companion */}
        <div className={`absolute w-32 h-32 rounded-full blur-xl opacity-60 transition-colors duration-500 bg-pink-300`}></div>

        <svg viewBox="0 0 200 200" className="w-full h-full z-10 drop-shadow-lg">
          {/* Petal hair ring (Mascot Flower Companion concept) */}
          <g>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
              <circle
                key={idx}
                cx={100 + 48 * Math.cos((angle * Math.PI) / 180)}
                cy={100 + 48 * Math.sin((angle * Math.PI) / 180)}
                r="30"
                fill="#FEE2E2"
                stroke="#F9A8D4"
                strokeWidth="3"
                className="transition-transform duration-500 hover:scale-110"
              />
            ))}
          </g>

          {/* Floppy Bunny Ears */}
          <g className="transition-transform duration-500">
            {/* Left Ear */}
            <path
              d="M 65,85 C 45,20 20,40 55,90 Z"
              fill="#FFF0F5"
              stroke="#F9A8D4"
              strokeWidth="4"
              className={companion.emotion === "excited" ? "animate-spin" : ""}
            />
            <path d="M 60,80 C 48,35 32,48 53,83 Z" fill="#FFC0CB" />

            {/* Right Ear */}
            <path
              d="M 135,85 C 155,20 180,40 145,90 Z"
              fill="#FFF0F5"
              stroke="#F9A8D4"
              strokeWidth="4"
            />
            <path d="M 140,80 C 152,35 168,48 147,83 Z" fill="#FFC0CB" />
          </g>

          {/* Hamster / Bunny Body */}
          <circle cx="100" cy="115" r="50" fill="#FFF5f7" stroke="#F472B6" strokeWidth="4" />

          {/* Inner Light tummy patch */}
          <ellipse cx="100" cy="125" rx="30" ry="22" fill="#FFFFFF" />

          {/* Cheek Blushes */}
          {isBlushing && (
            <>
              <ellipse cx="70" cy="120" rx="10" ry="6" fill="#F43F5E" opacity="0.4" />
              <ellipse cx="130" cy="120" rx="10" ry="6" fill="#F43F5E" opacity="0.4" />
            </>
          )}

          {/* Facial features depending on active emotion */}
          {(() => {
            switch (companion.emotion) {
              case "asleep":
                return (
                  <g stroke="#F472B6" strokeWidth="3" fill="none" strokeLinecap="round">
                    <path d="M 75,110 Q 85,115 88,110" />
                    <path d="M 125,110 Q 115,115 112,110" />
                    <path d="M 96,118 Q 100,122 104,118" />
                    {/* Sleepy bubbles */}
                    <g className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                      <text x="140" y="80" fill="#E879F9" fontSize="20" fontWeight="bold" fontFamily="monospace">z</text>
                      <text x="155" y="65" fill="#C084FC" fontSize="14" fontWeight="bold" fontFamily="monospace">z</text>
                    </g>
                  </g>
                );
              case "excited":
              case "cheering":
                return (
                  <g stroke="#9D174D" strokeWidth="4" fill="none" strokeLinecap="round">
                    {/* Big Stars or Arc eyes */}
                    <path d="M 70,112 Q 80,102 90,112" />
                    <path d="M 110,112 Q 120,102 130,112" />
                    {/* Big happy mouth */}
                    <path d="M 92,122 Q 100,135 108,122 Z" fill="#F43F5E" />
                  </g>
                );
              case "thinking":
                return (
                  <g stroke="#9D174D" strokeWidth="4" fill="none" strokeLinecap="round">
                    <path d="M 72,114 C 75,110 85,110 88,114" />
                    <circle cx="120" cy="112" r="3" fill="#9D174D" />
                    {/* Thinking swirl mouth */}
                    <path d="M 95,124 Q 100,121 105,124" />
                  </g>
                );
              case "worried":
                return (
                  <g stroke="#0369A1" strokeWidth="3" fill="none" strokeLinecap="round">
                    <path d="M 72,116 Q 80,108 88,116" />
                    <path d="M 112,116 Q 120,108 128,116" />
                    {/* Drooping sweat droplet */}
                    <path d="M 60,100 Q 56,110 60,114 C 64,110" fill="#38BDF8" />
                    <path d="M 94,126 Q 100,120 106,126" strokeWidth="4" />
                  </g>
                );
              default:
                // Happy / Normal regular state
                return (
                  <g stroke="#9D174D" strokeWidth="4" fill="none" strokeLinecap="round">
                    <circle cx="80" cy="112" r="4" fill="#9D174D" />
                    <circle cx="120" cy="112" r="4" fill="#9D174D" />
                    {/* Cute hamster mouth */}
                    <path d="M 94,122 Q 98,125 100,122 Q 102,125 106,122" />
                  </g>
                );
            }
          })()}

          {/* Little green sprout on top of Bloomie */}
          <path d="M 100,60 C 90,40 100,30 100,35 C 100,30 110,40 100,60" fill="#4ADE80" stroke="#22C55E" strokeWidth="2" />
        </svg>
      </div>
    );
  };

  return (
    <div className={`rounded-3xl border p-6 shadow-sm transition-all duration-300 ${getEmotionColors()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-pink-100 p-2 rounded-xl text-pink-600">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 id="companion-header" className="font-sans font-semibold text-gray-800 dark:text-gray-200">
              Bloomie 🌸
            </h4>
            <p className="text-xs text-gray-500 font-mono">My Cozy Companion</p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Flame className="w-3.5 h-3.5" />
            <span>{userProfile.streak} Days Stream</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 font-mono">Lvl {userProfile.level} • {userProfile.xp}/{(userProfile.level * 100)} XP</span>
        </div>
      </div>

      {renderMascotSVG()}

      {/* Speech Chat Bubble */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 border border-pink-100 shadow-sm relative mt-4">
        {/* Pointer bubble tail */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/80 dark:bg-gray-900/80 border-t border-l border-pink-100 rotate-45"></div>

        <p className="text-xs font-sans text-pink-700 dark:text-pink-300 font-medium leading-relaxed mb-2 text-center">
          "{companion.status}"
        </p>

        {companion.tip && (
          <div className="border-t border-pink-100/60 pt-2 text-[11px] text-gray-500 font-sans italic text-center">
            💡 {companion.tip}
          </div>
        )}
      </div>

      {/* Custom Assistant message input form */}
      <form onSubmit={handleChat} className="mt-4 flex gap-2">
        <input
          id="bloomie-chat-input"
          type="text"
          placeholder="Ask Bloomie for schedules, study tips or support..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTalking}
          className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-pink-150 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:text-white"
        />
        <button
          id="bloomie-chat-submit"
          type="submit"
          disabled={isTalking}
          className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl py-2 px-3 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
        >
          {isTalking ? (
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};
