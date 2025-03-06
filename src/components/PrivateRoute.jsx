// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const token = localStorage.getItem("token");

  // Si no hay token, redirigir a la página de login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, mostrar el contenido de la ruta protegida
  return <Outlet />;
};

export default PrivateRoute;
