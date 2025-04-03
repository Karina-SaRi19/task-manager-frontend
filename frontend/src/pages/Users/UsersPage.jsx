import React, { useEffect, useState } from "react";
import { Table, Button, Typography, Space, Modal, Form, Input, Select } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import MainLayout from "../../layouts/MainLayout";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [userToDelete, setUserToDelete] = useState(null);
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);

  useEffect(() => {
    axios.get("https://task-manager-backend-sge9.onrender.com/users")
      .then(response => setUsers(response.data))
      .catch(error => console.error("Error al obtener usuarios:", error));
  }, []);

  const handleDeleteUser = async (userId) => {
    console.log("Intentando eliminar el usuario con ID:", userId);

    try {
        const response = await fetch(`https://task-manager-backend-sge9.onrender.com/users/${userId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar el usuario: ${response.statusText}`);
        }

        console.log("Usuario eliminado correctamente");

        // Filtrar el usuario eliminado de la lista
        setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
        console.error("Error eliminando el usuario:", error);
    }
};

  const handleDeleteConfirmed = () => {
    if (userToDelete) {
      handleDeleteUser(userToDelete);
      setIsConfirmDeleteVisible(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      rol: user.rol === 1 ? "Admin" : user.rol === 3 ? "Master" : "Usuario",
    });
  };

  const handleCancel = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = () => {
    form.validateFields().then((values) => {
      const updatedUser = { ...selectedUser, ...values, rol: values.rol === "Admin" ? 1 : values.rol === "Master" ? 3 : 2 };
      axios.put(`https://task-manager-backend-sge9.onrender.com/users/${selectedUser.uid}`, updatedUser)
        .then(() => {
          setUsers(prevUsers => prevUsers.map(user => user.uid === updatedUser.uid ? updatedUser : user));
          handleCancel();
        })
        .catch(error => console.error("Error al actualizar usuario:", error));
    });
  };

  const columns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Rol",
      dataIndex: "rol",
      key: "rol",
      render: (rol) => rol === 1 ? "Admin" : rol === 3 ? "Master" : "Usuario"
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => {
            setUserToDelete(record.uid);
            setIsConfirmDeleteVisible(true);
          }} />
        </Space>
      ),
    }
  ];

  return (
    <MainLayout>
      <div style={{ padding: "20px", minHeight: "100vh" }}>
        <Title level={2}>Gestión de Usuarios</Title>

        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="uid" 
          bordered
          pagination={{ pageSize: 5, showSizeChanger: false }}
          style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}
        />

        {/* Modal para editar usuario */}
        <Modal
          title="Editar Usuario"
          visible={modalVisible}
          onCancel={handleCancel}
          onOk={handleUpdateUser}
          okText="Guardar"
          cancelText="Cancelar"
        >
          <Form form={form} layout="vertical">
            <Form.Item name="username" label="Nombre de Usuario" rules={[{ required: true, message: "Por favor ingresa un nombre de usuario" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Correo Electrónico" rules={[{ required: true, message: "Por favor ingresa un correo electrónico" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="rol" label="Rol" rules={[{ required: true, message: "Por favor selecciona un rol" }]}>
              <Select>
                <Option value="Admin">Admin</Option>
                <Option value="Master">Master</Option>
                <Option value="Usuario">Usuario</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal de confirmación para eliminar */}
        <Modal
          title="Confirmar Eliminación"
          visible={isConfirmDeleteVisible}
          onOk={handleDeleteConfirmed}
          onCancel={() => setIsConfirmDeleteVisible(false)}
          okText="Sí, eliminar"
          cancelText="Cancelar"
        >
          <p>¿Estás seguro de que deseas eliminar este usuario?</p>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default UsersPage;
