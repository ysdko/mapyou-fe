import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import "leaflet/dist/leaflet.css"; // ← 重要
import App from "./App.jsx";
import Signup from "./Signup.jsx";
import Signin from "./Signin.jsx";
import { LoadScript } from "@react-google-maps/api";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}>
      <BrowserRouter>
        <Routes>
          {/* トップページ（地図など） */}
          <Route path="/" element={<App />} />

          {/* 新規登録ページ */}
          <Route path="/signup" element={<Signup />} />

          {/* ログインページ */}
          <Route path="/signin" element={<Signin />} />
        </Routes>
      </BrowserRouter>
    </LoadScript>
  </StrictMode>
);
