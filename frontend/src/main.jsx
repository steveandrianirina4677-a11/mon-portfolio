
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import AdminPage from "./admin/AdminPage.jsx";

// ========================================
// ROUTES DU PORTFOLIO
// ========================================

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* Page publique du portfolio */}
        <Route path="/" element={<App />} />

        {/* Espace administrateur */}
        <Route path="/admin" element={<AdminPage />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
