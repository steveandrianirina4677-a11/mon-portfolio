
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// App.css est déjà importé dans App.jsx.
// Nous ne chargeons donc plus style.css ici.

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
