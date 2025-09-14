import React, { useState, useEffect } from "react";
import { useChatAgent } from "../sdk/useChatAgent";
import "./ChatWidget.css";

export default function ChatWidget({ apiBase }) {
  const { messages, send } = useChatAgent({ apiBase });
  const [input, setInput] = useState("");
  const [streamMode, setStreamMode] = useState(false);
  const [courses, setCourses] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const onSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const res = await send(input.trim(), { stream: streamMode });
    setInput("");
    if (res?.courses) setCourses(res.courses);
  };

  useEffect(() => {
    const el = document.getElementById("chat-window");
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "";
  }, [darkMode]);

  return (
    <div className={`chat-widget ${darkMode ? "dark" : ""}`}>
      <div className="chat-header">
        <h3>🎓 AI Course Advisor</h3>
        <div className="toggles">
          <label>
            <input
              type="checkbox"
              checked={streamMode}
              onChange={(e) => setStreamMode(e.target.checked)}
            />
            Stream
          </label>
          <label>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            Dark Mode
          </label>
        </div>
      </div>

      <div className="chat-window" id="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            <div className="avatar">{m.role === "user" ? "🧑" : "🤖"}</div>
            <div className="text">{m.text}</div>
          </div>
        ))}
      </div>

      {courses.length > 0 && (
        <div className="course-results">
          <h4>📚 Recommended Courses</h4>
          <div className="course-list">
            {courses.map((course) => (
              <div className="course-card" key={course.uid}>
                <h5>{course.title}</h5>
                <p>{course.level} • {course.duration}</p>
                <p>₹{course.price}</p>
                <button>Learn More</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form className="chat-input" onSubmit={onSend}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask e.g., 'Show beginner Python courses'"
        />
        <button type="submit">Send</button>
      </form>

      <div className="suggestions">
        <button onClick={() => send("Show advanced courses")}>Advanced Courses</button>
        <button onClick={() => send("Filter by price")}>Filter by Price</button>
        <button onClick={() => send("Show design courses")}>Design Courses</button>
      </div>
    </div>
  );
}
