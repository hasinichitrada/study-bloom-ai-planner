/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStudy } from "../context/StudyContext";
import { Note } from "../types";
import { Search, Pin, Heart, Plus, Save, Trash2, Edit3, Eye, FileText } from "lucide-react";

export const NotesEditor: React.FC = () => {
  const { notes, subjects, addNote, updateNote, removeNote, togglePinNote, toggleFavoriteNote } = useStudy();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [editContent, setEditContent] = useState("");

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleCreateNote = () => {
    const parentId = subjects[0]?.id || "sub-1";
    addNote("Untitled Note 🌸", parentId, "# Write your brilliant study notes here...\n\n- Organize your syllabus concepts.");
  };

  const handleSave = () => {
    if (activeNote) {
      updateNote(activeNote.id, editContent);
      setIsEditing(false);
    }
  };

  const parseMarkdown = (markdown: string) => {
    if (!markdown) return "";
    const lines = markdown.split("\n");
    return lines.map((line, idx) => {
      // Headings
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-xl font-bold font-sans text-pink-700 dark:text-pink-300 mt-4 mb-2 border-b pb-1">{line.substring(2)}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-lg font-bold font-sans text-purple-700 dark:text-purple-300 mt-4 mb-1.5">{line.substring(3)}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-sm font-bold font-sans text-indigo-700 dark:text-indigo-300 mt-2">{line.substring(4)}</h3>;
      }
      // Bullet points
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return <li key={idx} className="text-xs list-disc pl-2 ml-4 mb-1 text-gray-700 dark:text-gray-300">{line.trim().substring(2)}</li>;
      }
      // Blockquotes
      if (line.startsWith("> ")) {
        return (
          <blockquote key={idx} className="border-l-4 border-pink-200 dark:border-pink-900 pl-3 italic text-gray-500 py-1 font-sans my-2 bg-pink-50/20 rounded-r-md">
            {line.substring(2)}
          </blockquote>
        );
      }
      // Code blocks start check
      if (line.startsWith("```")) {
        return null; // Skip code wrappers in preview, simple parse
      }
      // Regular text with custom bold matches
      let textContent: any = line;
      if (line.includes("**")) {
        const parts = line.split("**");
        textContent = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold text-gray-900 dark:text-white">{part}</strong> : part);
      }

      return line.trim() === "" ? <div key={idx} className="h-2"></div> : <p key={idx} className="text-xs leading-relaxed text-gray-600 dark:text-gray-300 font-sans mb-1">{textContent}</p>;
    });
  };

  // Filter notebook
  const filteredNotes = notes.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "all" || n.subjectId === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  // Sort notes so pinned ones are at the top
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-3xl border border-pink-100 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
      {/* Sidebar List */}
      <div className="border-r border-gray-100 dark:border-gray-800 pr-4 flex flex-col h-full gap-3">
        <div className="flex items-center justify-between">
          <h4 className="font-sans font-bold text-gray-800 dark:text-gray-100 text-sm">
            My Study Notebook 🌸
          </h4>
          <button
            onClick={handleCreateNote}
            className="p-1.5 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-lg cursor-pointer"
            title="Create Note"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            id="notes-search-input"
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-150 rounded-xl outline-none"
          />
        </div>

        {/* Subject dropdown filter */}
        <select
          id="notes-subject-filter"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="text-xs px-3 py-1.5 bg-gray-50 dark:bg-gray-850 dark:text-white border border-gray-150 rounded-lg outline-none"
        >
          <option value="all">📁 All Folders</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              📁 {s.name}
            </option>
          ))}
        </select>

        {/* Note List Scrollable */}
        <div className="overflow-y-auto flex-1 space-y-2 pr-1 select-none">
          {sortedNotes.map((n) => {
            const isSelected = activeNote?.id === n.id;
            const noteSub = subjects.find((s) => s.id === n.subjectId);
            return (
              <div
                key={n.id}
                onClick={() => {
                  setSelectedNoteId(n.id);
                  setEditContent(n.content);
                  setIsEditing(false);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-pink-50/60 border-pink-200 shadow-sm"
                    : "bg-white dark:bg-gray-900 border-gray-100 hover:border-pink-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-sans font-bold text-xs text-gray-700 dark:text-gray-200 line-clamp-1 flex-1">
                    {n.title}
                  </h5>
                  <div className="flex items-center gap-1">
                    {n.isPinned && <Pin className="w-3 h-3 text-pink-400" />}
                    {n.isFavorite && <Heart className="w-3 h-3 text-rose-400 fill-rose-450" />}
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {noteSub ? noteSub.name.split(" ")[0] : "Academic"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor & Preview Pane */}
      <div className="col-span-2 flex flex-col h-full gap-3">
        {activeNote ? (
          <>
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <div>
                <h4 className="font-sans font-black text-gray-800 dark:text-white text-base">
                  {activeNote.title}
                </h4>
                <p className="text-[10px] text-gray-500 font-mono">
                  Saved: {new Date(activeNote.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePinNote(activeNote.id)}
                  className={`p-2 rounded-xl border cursor-pointer ${
                    activeNote.isPinned
                      ? "bg-pink-100 border-pink-200 text-pink-600"
                      : "border-gray-200 text-gray-400 hover:bg-gray-100"
                  }`}
                  title="Pin Note to Top"
                >
                  <Pin className="w-4 h-4" />
                </button>

                <button
                  onClick={() => toggleFavoriteNote(activeNote.id)}
                  className={`p-2 rounded-xl border cursor-pointer ${
                    activeNote.isFavorite
                      ? "bg-rose-100 border-rose-200 text-rose-600"
                      : "border-gray-200 text-gray-400 hover:bg-gray-100"
                  }`}
                  title="Favorite Note"
                >
                  <Heart className={`w-4 h-4 ${activeNote.isFavorite ? "fill-rose-550" : ""}`} />
                </button>

                <button
                  onClick={() => {
                    if (isEditing) {
                      handleSave();
                    } else {
                      setEditContent(activeNote.content);
                      setIsEditing(true);
                    }
                  }}
                  className="p-2 border border-pink-200 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 flex items-center gap-1.5 text-xs font-semibold select-none cursor-pointer"
                >
                  {isEditing ? (
                    <>
                      <Eye className="w-4 h-4" /> Preview
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" /> Edit Code
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    removeNote(activeNote.id);
                    setSelectedNoteId(notes[0]?.id || null);
                  }}
                  className="p-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 cursor-pointer"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Field split preview */}
            <div className="flex-1 overflow-y-auto">
              {isEditing ? (
                <div className="h-full flex flex-col gap-2">
                  <textarea
                    id="note-editor-contents"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full text-xs font-mono p-4 bg-gray-50 dark:bg-gray-850 dark:text-gray-100 border border-gray-200 rounded-2xl outline-none resize-none focus:ring-1 focus:ring-pink-300"
                    placeholder="# Write LaTeX or standard Markdown details here..."
                  />
                  <div className="flex justify-end pr-1">
                    <button
                      onClick={handleSave}
                      className="bg-emerald-400 hover:bg-emerald-500 text-white rounded-xl text-xs py-1.5 px-4 flex items-center gap-1.5 shadow-sm font-semibold cursor-pointer"
                    >
                      <Save className="w-4 h-4" /> Save Concepts
                    </button>
                  </div>
                </div>
              ) : (
                <div id="note-preview-pane" className="bg-white dark:bg-gray-900 border border-transparent p-4 h-full rounded-2xl overflow-y-auto leading-relaxed">
                  {parseMarkdown(activeNote.content)}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <FileText className="w-12 h-12 stroke-1 mb-2 text-pink-300" />
            <p className="text-xs">No active notes. Plant a note seeds to begin!</p>
          </div>
        )}
      </div>
    </div>
  );
};
