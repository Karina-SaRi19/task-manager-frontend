import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegistroPage from './pages/Registro/RegistroPage';
import TaskPage from './pages/Task/TaskPage';
import GroupsPage from './pages/Groups/GroupsPage.jsx';
import UsersPage from './pages/Users/UsersPage.jsx';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        
        {/* Ruta privada protegida */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
          <Route path="/task" element={<TaskPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
