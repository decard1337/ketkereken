import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./styles/globals.css";
import "./styles/map.css";
import "./styles/home.css";

import "leaflet/dist/leaflet.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);