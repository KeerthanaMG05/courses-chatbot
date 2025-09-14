import React from "react";
import ChatWidget from "./components/ChatWidget";

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>🎓 Courses Chat Agent Demo</h1>
      <ChatWidget apiBase="http://localhost:5000" />
    </div>
  );
}

export default App;
