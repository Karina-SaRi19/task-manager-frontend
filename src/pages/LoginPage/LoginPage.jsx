import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, Space } from "antd";
import axios from "axios"; // Para enviar solicitudes HTTP


const { Title } = Typography;

const LoginPage = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    console.log("UserName:", values.username);
    console.log("Password:", values.password);

    try {
        // Enviar los datos con encabezado Content-Type: application/json
        const response = await axios.post(
            "http://localhost:3000/login", 
            {
                username: values.username,  // Asegúrate de que sea el nombre de usuario
                password: values.password
            },
            {
                headers: {
                    'Content-Type': 'application/json'  // Asegúrate de que se envíe como JSON
                }
            }
        );

        // Si el login es exitoso, guarda el token y el userId
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.userId);

        navigate("/dashboard");  // Redirige al dashboard
    } catch (error) {
        console.error('Error en login:', error.response ? error.response.data : error.message);  // Log de error completo
        setError("Credenciales incorrectas");
    }
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
      <Card style={{ width: 380, padding: 25, textAlign: "center", borderRadius: 12 }}>
        <Title level={2} style={{ color: "#872341", marginTop: "-10px" }}>Iniciar Sesión</Title>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <Form onFinish={handleLogin} layout="vertical">
          <Form.Item 
            label={<span style={{ fontSize: "16px", fontWeight: "bold", color: "#500073" }}>Usuario:</span>} 
            name="username" 
            rules={[{ required: true, message: "Ingrese usuario" }]}
          >
            <Input
              placeholder="Ingrese su usuario"
              style={{
                height: 40,
                fontSize: "16px",
                borderRadius: 8,
                backgroundColor: "#F5F5F5",
                borderColor: "#500073",
              }}
            />
          </Form.Item>

          <Form.Item 
            label={<span style={{ fontSize: "16px", fontWeight: "bold", color: "#500073" }}>Contraseña:</span>} 
            name="password" 
            rules={[{ required: true, message: "Ingrese contraseña" }]}
          >
            <Input.Password
              placeholder="Ingrese su contraseña"
              style={{
                height: 40,
                fontSize: "16px",
                borderRadius: 8,
                backgroundColor: "#F5F5F5",
                borderColor: "#500073",
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: "30px" }}>
            <Button
              htmlType="submit"
              block
              style={{
                backgroundColor: "#A19AD3",
                borderColor: "#500073",
                color: "black",
                height: 35,
                fontSize: "16px",
                borderRadius: 8,
              }}
            >
              Entrar
            </Button>
          </Form.Item>

          <Form.Item>
            <Space>
            <p>
              ¿No tienes una cuenta?{" "}
              <button onClick={() => navigate("/registro")} style={{ border: "none", background: "none", color: "blue", cursor: "pointer" }}>
                  Registrate aqui
              </button>
            </p>
            </Space>
          </Form.Item>        
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
