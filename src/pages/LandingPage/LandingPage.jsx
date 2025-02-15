import React from "react";
import { Button, Typography } from "antd";
import { Link } from "react-router-dom";

const { Title } = Typography;

const LandingPage = () => {
  return (
    <div
      style={{
        background: "radial-gradient(circle, rgba(135,35,65,1) 19%, rgba(225,149,171,1) 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "50px",
        color: "#fff",
      }}
    >
      <Title level={1} style={{ color: "#fff" }}>¡Bienvenido a Task Manager!</Title>
      <Link to="/login">
        <Button
          size="large"
          style={{
            backgroundColor: "#A19AD3",
            borderColor: "#500073",
            color: "black",
          }}
        >
          Iniciar Sesión
        </Button>
      </Link>
    </div>
  );
};

export default LandingPage;
