import axios from "axios";

// Load API key and model from environment
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct";

// Main function to query OpenRouter
export async function askLLM(message) {
  if (!OPENROUTER_API_KEY) {
    console.error("❌ Missing OpenRouter API key");
    return "OpenRouter API key not set.";
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: OPENROUTER_MODEL,
        max_tokens: 1000, // ✅ Safe limit for free-tier users
        messages: [
          { role: "system", content: "You are a helpful course advisor." },
          { role: "user", content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const output = response.data?.choices?.[0]?.message?.content;
    return output || "Sorry, I couldn’t generate a response.";
  } catch (err) {
    console.error("❌ OpenRouter error:", err.response?.data || err.message);
    return "Error: Failed to generate a response.";
  }
}
