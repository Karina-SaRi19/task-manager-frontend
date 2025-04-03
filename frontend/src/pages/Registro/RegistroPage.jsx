import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message, Modal } from "antd";
import axios from "axios";

const { Title } = Typography;

const RegistroPage = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await axios.post("https://task-manager-backend-sge9.onrender.com/register", values);

      // Mostrar modal de éxito
      setModalMessage("¡Tu registro fue exitoso! Ahora puedes iniciar sesión.");
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error en la respuesta del backend:", error.response?.data);

      if (error.response?.data?.error && 
          (error.response.data.error === "El correo electrónico ya está en uso" || 
          error.response.data.error === "El nombre de usuario ya está en uso")) {
        
        setModalMessage(error.response.data.error); // Mensaje de error en el modal
        setIsModalVisible(true);
      } else {
        message.error("❌ Error en el registro", 3);
      }
    }
    setLoading(false);
  };

  const handleOk = () => {
    if (modalMessage.includes("exitoso")) {
      navigate("/login"); // Solo redirige si fue exitoso
    }
    setIsModalVisible(false); // Cierra el modal en cualquier caso
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
              { pattern: /^[^\s].*[^\s]$/, message: "El nombre de usuario no puede tener espacios al inicio o al final" },
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
              { pattern: /^\S*$/, message: "La contraseña no puede contener espacios" },
            ]}
          >
            <Input.Password placeholder="Ingrese su contraseña" />
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              block
              loading={loading}
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

          <p>
            ¿Ya tienes una cuenta?{" "}
            <button onClick={() => navigate("/login")} style={{ border: "none", background: "none", color: "blue", cursor: "pointer" }}>
              Inicia sesión
            </button>
          </p>
        </Form>
      </Card>

      {/* Modal de éxito o error */}
      <Modal
        title={modalMessage.includes("exitoso") ? "Registro Exitoso" : "Error en el Registro"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText="OK"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <p>{modalMessage}</p>
      </Modal>
    </div>
  );
};

export default RegistroPage;
