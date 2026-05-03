import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx"; // Default export
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App /> {/* App should NOT contain another HashRouter */}
    </HashRouter>
  </React.StrictMode>
);
