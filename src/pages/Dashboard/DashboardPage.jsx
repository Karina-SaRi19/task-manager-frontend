import React, { useEffect, useState, useRef } from "react";
import { Card, Typography, Space, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

const { Title, Paragraph } = Typography;

const DashboardPage = () => {
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  const SESSION_DURATION = 60 * 1000; // 1 minuto
  const WARNING_TIME = SESSION_DURATION - 10 * 1000; // 10 segundos antes

  const startSessionTimers = () => {
    // Limpiar temporizadores anteriores
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    // Configurar nuevo temporizador para la alerta
    warningTimerRef.current = setTimeout(() => {
      setModalVisible(true);

      // Si no responde en 10 segundos, cerrar sesión
      logoutTimerRef.current = setTimeout(() => {
        handleLogout();
      }, 10 * 1000);
    }, WARNING_TIME);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    startSessionTimers();

    return () => {
      clearTimeout(warningTimerRef.current);
      clearTimeout(logoutTimerRef.current);
    };
  }, []);

  const handleContinueSession = () => {
    setModalVisible(false);
    startSessionTimers(); // Reiniciar temporizadores
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <MainLayout>
      <Card style={{ width: "100%", maxWidth: 800, margin: "20px auto", padding: "20px" }}>
        <Typography>
          <Title level={2}>Dashboard</Title>
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
