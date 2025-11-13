// CRITICAL: Import safe date handler FIRST to override Date.prototype globally
import "./lib/safeDateHandler";

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Import i18n configuration to initialize translations before app starts
import "./lib/i18n";

createRoot(document.getElementById("root")!).render(<App />);
