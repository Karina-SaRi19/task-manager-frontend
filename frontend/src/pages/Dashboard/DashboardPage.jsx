import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, Typography, Space, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

const { Title, Paragraph } = Typography;

const DashboardPage = () => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState(""); // Estado para almacenar el nombre de usuario
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  const SESSION_DURATION = 60 * 1000; // 1 minuto
  const WARNING_TIME = SESSION_DURATION - 10 * 1000; // 10 segundos antes

  // Función para cerrar sesión
  const handleLogout = useCallback(() => {
    // Limpiar credenciales antes de la redirección
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    navigate("/login");
  }, [navigate]);

  // Función para iniciar los temporizadores de sesión
  const startSessionTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    warningTimerRef.current = setTimeout(() => {
      setModalVisible(true);

      logoutTimerRef.current = setTimeout(() => {
        handleLogout();
      }, 10 * 1000);
    }, WARNING_TIME);
  }, [handleLogout, WARNING_TIME]);  // Agregar WARNING_TIME como dependencia

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username"); // Obtener el nombre de usuario guardado

    if (!token) {
      navigate("/login");  // Redirige al login si no hay token
      return;
    }

    if (storedUsername) {
      setUsername(storedUsername); // Establecer el nombre de usuario si está disponible
    }

    startSessionTimers();

    // Bloquear la navegación hacia atrás
    const blockNavigation = () => {
      window.history.pushState(null, null, window.location.pathname);
    };

    blockNavigation();
    window.addEventListener("popstate", blockNavigation);

    return () => {
      window.removeEventListener("popstate", blockNavigation);
      clearTimeout(warningTimerRef.current);
      clearTimeout(logoutTimerRef.current);
    };
  }, [navigate, startSessionTimers]);

  const handleContinueSession = () => {
    setModalVisible(false);
    startSessionTimers(); // Reiniciar temporizadores
  };

  return (
    <MainLayout>
      <Card style={{ width: "100%", maxWidth: 800, margin: "20px auto", padding: "20px" }}>
        <Typography>
          <Title level={2}>
            Dashboard {username && `de ${username}`} {/* Mostrar "de [usuario]" si el username existe */}
          </Title>
          <Paragraph>Bienvenido al panel de control.</Paragraph>
          <Space direction="vertical" size="middle" style={{ width: "100%" }} />
        </Typography>
      </Card>

      <Modal
        title="Sesión a punto de expirar"
        open={modalVisible}
        onOk={handleContinueSession}
        onCancel={handleLogout}
        okText="Seguir aquí"
        cancelText="Cerrar sesión"
      >
        <p>Tu sesión está por expirar en 10 segundos. ¿Deseas continuar?</p>
      </Modal>
    </MainLayout>
  );
};

export default DashboardPage;
