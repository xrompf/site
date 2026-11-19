import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./x8r/x8r.css";
import "./app/styles.css";
import "./app/mornye.css";
import App from "./app/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
