import { useState, useRef, useEffect } from "react";
import axios from "axios";

export function useChatAgent({ apiBase }) {
  const [messages, setMessages] = useState([]);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  async function send(message, { stream = false } = {}) {
    setMessages(m => [...m, { role: "user", text: message }]);

    if (!stream) {
      try {
        const res = await axios.post(`${apiBase}/chat`, { message });
        const answer = res.data?.answer || "No response received.";
        setMessages(m => [...m, { role: "bot", text: answer }]);
        return res.data;
      } catch (err) {
        console.error("Chat error:", err.message);
        setMessages(m => [...m, { role: "bot", text: "Something went wrong." }]);
      }
    } else {
      setMessages(m => [...m, { role: "bot", text: "Streaming not available." }]);
    }
  }

  return { messages, send };
}
