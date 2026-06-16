import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API endpoint for general health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// API endpoint to talk to Bloomie, the cute study companion mascot
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, userProfile } = req.body;

    const profileInstructions = userProfile
      ? `The user is studying ${userProfile.course || "college topics"} in year ${userProfile.year || "any"}. Their target exam is ${userProfile.targetExam || "exams"}. Their daily study goal is ${userProfile.dailyStudyGoal || 4} hours.`
      : "";

    const systemInstruction = `You are "Bloomie" 🌸, an adorable, enthusiastic, and highly motivating cute pink study companion (a magical pink flower-bunny).
Your goal is to help college students stay productive, happy, and consistent.
Tone is extremely sweet, cozy, encouraging, and positive. Use soft botanical and cute flower puns (like 'Keep blooming!', 'Rooting for you!', 'Petal power!'). Feel free to use cute text emotes (like 🌸, 🥺, (⑅•ᴗ•⑅),  (｡♥‿♥｡), ๑•‿•๑). Keep answers concise and direct so students don't spend too much time reading and can focus on studying.
${profileInstructions}

Always respond in a JSON structure containing:
1. "reply": Your sweet, motivational text reply (formatted as short sentences).
2. "companionState": The facial/mood expression of Bloomie. Choose ONE from: "happy" | "excited" | "thinking" | "asleep" | "cheering" | "worried".
3. "tip": A tiny, cute daily actionable productivity tip (e.g., "Remember to stretch your cute ears and drink some fresh water! 💧").`;

    // Map history to the Gemini content parts if provided
    const contents = history ? [...history, { role: "user", parts: [{ text: message }] }] : message;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: "Sweet text answer from Bloomie with cute emotes." },
            companionState: { type: Type.STRING, description: "Bloomie's mood: happy, excited, thinking, asleep, cheering, worried" },
            tip: { type: Type.STRING, description: "A highly concise, cute productivity micro-tip." }
          },
          required: ["reply", "companionState", "tip"]
        },
        temperature: 1.0,
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Bloomie Chat Error:", error);
    res.status(500).json({
      reply: "Ups. My petals got a bit tangled up! Let's take a deep breath and try again! 🌸🥺",
      companionState: "worried",
      tip: "If the connection gets sleepy, check your Wi-Fi or refresh your lovely page!",
      error: error.message
    });
  }
});

// API endpoint to auto-schedule remaining syllabus dynamically
app.post("/api/gemini/generate-schedule", async (req, res) => {
  try {
    const { syllabus, availableHoursDaily, daysCount, targetExam } = req.body;

    if (!syllabus || !Array.isArray(syllabus) || syllabus.length === 0) {
      return res.status(400).json({ error: "Syllabus topics array is required." });
    }

    const promptText = `
Generate a balanced, highly actionable study schedule.
- Syllabus to schedule: ${JSON.stringify(syllabus)}
- Study constraint: ${availableHoursDaily || 3} hours available daily for ${daysCount || 5} days.
- Target goal / Exam: ${targetExam || "Regular Semester Exam"}.

Allocate dates and target hours to each topic starting from today (${new Date().toLocaleDateString()}).
Make sure to distribute the workload logically so urgent/important things are tackled early.
Output should be a JSON containing a recommended list of specific tasks/topics to schedule.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: `You are Bloomie's AI Scheduler Planner. You specialize in taking a student syllabus, available hours, and deadlines, and organizing them into clean, scheduled chunks.
Generate a structured JSON schedule containing an array of 'tasks'. Each task item must STRICTLY contain:
- "title": Title of study slot (e.g. "Review Chapter 1 of DBMS")
- "subjectId": Subject ID match from input
- "topicId": Topic ID match from input
- "targetHours": Number of hours allocated (integer or half-hour, e.g., 1.5)
- "dayOffset": An integer day offset from today (0 for today, 1 for tomorrow, etc.)
- "priority": The mapped level: "🌸 Easy", "⭐ Important", or "🔥 Urgent"`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subjectId: { type: Type.STRING },
                  topicId: { type: Type.STRING },
                  targetHours: { type: Type.NUMBER },
                  dayOffset: { type: Type.INTEGER },
                  priority: { type: Type.STRING }
                },
                required: ["title", "subjectId", "topicId", "targetHours", "dayOffset", "priority"]
              }
            }
          },
          required: ["tasks"]
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Bloomie Scheduler Error:", error);
    res.status(500).json({ error: "Could not create schedule", message: error.message });
  }
});

// API endpoint for Weekly Review & Improvement Insights (Sunday Review)
app.post("/api/gemini/weekly-review", async (req, res) => {
  try {
    const { subjects, completedTasksCount, missedTasksCount, pomodoroHours } = req.body;

    const summaryText = `
Generate a weekly student report:
- Subjects tracked: ${JSON.stringify(subjects)}
- Tasks completed: ${completedTasksCount || 0}
- Tasks missed or pending: ${missedTasksCount || 0}
- Dedicated Pomodoro study time: ${pomodoroHours || 0} hours.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: summaryText,
      config: {
        systemInstruction: `You are Bloomie, the adorable Weekly Analyst companion.
Generate a cute, professional, yet warm student Sunday review.
Always output a JSON with:
1. "weeklyGrade": A fun, cute badge title (e.g. "Petal-Perfect Pioneer!", "Sprout of Success!").
2. "cheer": A sweet encouraging summary of their week.
3. "completedHighlight": A cute observation highlighting something they did well.
4. "suggestions": A list of 3 actionable, adorable tips for improvement (e.g. "Allocate 30 more minutes to your toughest subject").`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeklyGrade: { type: Type.STRING },
            cheer: { type: Type.STRING },
            completedHighlight: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["weeklyGrade", "cheer", "completedHighlight", "suggestions"]
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Weekly Review Error:", error);
    res.status(500).json({ error: "Could not compile review", message: error.message });
  }
});

// Mount Vite middleware in development or serve static build files in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌸 Study Bloom full-stack server running on http://localhost:${PORT} 🌸`);
  });
}

start();
