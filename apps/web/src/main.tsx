import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main>
      <p className="eyebrow">Ledgebrook interview practice</p>
      <h1>End-to-end workspace ready</h1>
      <p>React, Node.js, Python, and PostgreSQL boilerplate are connected by one project structure.</p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
