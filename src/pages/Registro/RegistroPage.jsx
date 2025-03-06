import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message } from "antd";
import axios from "axios"; // Para enviar solicitudes HTTP

const { Title } = Typography;

const RegistroPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/register", values); // Ya no se asigna a `response`
      message.success("Registro exitoso, ahora inicia sesión.");
      navigate("/login"); // Redirigir al login después del registro
    } catch (error) {
      message.error(error.response?.data?.error || "Error en el registro");
    }
    setLoading(false);
  };
  
  return (
    <div
      style={{
        background: "radial-gradient(circle, rgba(135,35,65,1) 19%, rgba(225,149,171,1) 100%)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card style={{ width: 400, padding: 25, textAlign: "center", borderRadius: 12 }}>
        <Title level={2} style={{ color: "#872341" }}>Registro</Title>

        <Form onFinish={handleRegister} layout="vertical">
          <Form.Item 
            label="Correo Electrónico" 
            name="email" 
            rules={[{ required: true, type: "email", message: "Ingrese un correo válido" }]}
          >
            <Input placeholder="Ingrese su correo" />
          </Form.Item>

          <Form.Item 
            label="Nombre de Usuario" 
            name="username" 
            rules={[
              { required: true, message: "Ingrese un nombre de usuario" },
              { pattern: /^[^\s].*[^\s]$/, message: "El nombre de usuario no puede tener espacios al inicio o al final" }
            ]}
          >
            <Input placeholder="Ingrese su usuario" />
          </Form.Item>

          <Form.Item 
            label="Contraseña" 
            name="password" 
            rules={[
              { required: true, message: "Ingrese una contraseña" },
              { max: 8, message: "La contraseña solo debe contener 8 caracteres" },
              { pattern: /^\S*$/, message: "La contraseña no puede contener espacios" }
            ]}
          >
            <Input.Password placeholder="Ingrese su contraseña" />
          </Form.Item>

          <Form.Item>
          <Form.Item style={{ marginTop: "30px" }}>
            <Button
              htmlType="submit"
              block loading={loading}              
              style={{
                backgroundColor: "#A19AD3",
                borderColor: "#500073",
                color: "black",
                height: 35,
                fontSize: "16px",
                borderRadius: 8,
              }}
            >
              Registrarse
            </Button>
          </Form.Item>

          </Form.Item>
        <p>
        ¿Ya tienes una cuenta?{" "}
        <button onClick={() => navigate("/login")} style={{ border: "none", background: "none", color: "blue", cursor: "pointer" }}>
            Inicia sesión
        </button>
        </p>
        </Form>
      </Card>
    </div>
  );
};

export default RegistroPage;
