import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import RegistroPage from "./pages/Registro/RegistroPage";
import TaskPage from "./pages/Task/TaskPage";
import GroupsPage from "./pages/Groups/GroupsPage.jsx";
import UsersPage from "./pages/Users/UsersPage.jsx";
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
        <Route path="/Groups" element={<GroupsPage />} />
        <Route path="/Users" element={<UsersPage />} />      
      </Routes>
    </Router>
  </React.StrictMode>
);
