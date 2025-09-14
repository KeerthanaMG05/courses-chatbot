import process from "node:process";
process.loadEnvFile(".env");

import express from "express";
import cors from "cors";
import axios from "axios";
import { askLLM } from "./llmProviders.js";

const app = express();
app.use(cors());
app.use(express.json());

const CONTENTSTACK_API = "https://cdn.contentstack.io/v3/content_types/courses/entries";

app.get("/", (req, res) => res.send("✅ Chat Agent Backend running"));

app.get("/api/courses", async (req, res) => {
  try {
    const resCourses = await axios.get(CONTENTSTACK_API, {
      headers: {
        api_key: process.env.CONTENTSTACK_API_KEY,
        access_token: process.env.CONTENTSTACK_DELIVERY_TOKEN,
      },
      params: {
        environment: process.env.CONTENTSTACK_ENVIRONMENT || "development",
        limit: 100
      },
    });
    res.json(resCourses.data.entries || []);
  } catch (err) {
    console.error("Courses fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Missing message" });

  try {
    const resCourses = await axios.get(CONTENTSTACK_API, {
      headers: {
        api_key: process.env.CONTENTSTACK_API_KEY,
        access_token: process.env.CONTENTSTACK_DELIVERY_TOKEN,
      },
      params: {
        environment: process.env.CONTENTSTACK_ENVIRONMENT || "development",
        limit: 100
      },
    });

    const courses = resCourses.data.entries || [];

    const keywords = message.toLowerCase().split(" ");
    const candidates = courses.filter(c =>
      keywords.some(k => `${c.title} ${c.description}`.toLowerCase().includes(k))
    ).slice(0, 5);

    const snippets = candidates.map((c, i) =>
      `${i + 1}. ${c.title} — ${c.level} — ${c.duration} — ₹${c.price}\n${c.description || ""}`
    ).join("\n\n");

    const prompt = `You are a helpful course advisor. Use these courses when answering.\n\n${snippets}\n\nUser Query:\n${message}`;

    const answer = await askLLM(prompt);

    res.json({
      answer,
      courses: candidates.map(c => ({
        uid: c.uid,
        title: c.title,
        category: c.category,
        level: c.level,
        duration: c.duration,
        price: c.price
      }))
    });

  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Chat failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Chat Agent Backend running on http://localhost:${PORT}`));
