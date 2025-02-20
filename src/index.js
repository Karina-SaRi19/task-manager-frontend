import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import RegistroPage from "./pages/Registro/RegistroPage";
import TaskPage from "./pages/Task/TaskPage";
import "antd/dist/reset.css"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/Registro" element={<RegistroPage />} />
        <Route path="/Task" element={<TaskPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
