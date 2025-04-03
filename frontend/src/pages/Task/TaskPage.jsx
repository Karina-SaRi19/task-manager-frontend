import React, { useState, useEffect } from "react";
import { Card, Typography, Modal, Button, Input, Form, FloatButton, Select, notification, Row, Col, Badge } from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  ReadOutlined,
  ShoppingOutlined,
  BellOutlined,
  DeleteOutlined,
  EditOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import MainLayout from "../../layouts/MainLayout";

const { Title, Text } = Typography;
const { Option } = Select;

const TaskPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [form] = Form.useForm();

  const [nameTask, setNameTask] = useState("");
  const [estatus, setEstatus] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState(""); // Ahora es un Select
  const [timeValue, setTimeValue] = useState("");
  const [timeUnit, setTimeUnit] = useState("days");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Token no encontrado.");
      return;
    }

    try {
      const response = await fetch("https://task-manager-backend-sge9.onrender.com/tasks", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTaskList(data);
      } else {
        alert("Error al cargar las tareas.");
      }
    } catch (error) {
      alert("Hubo un problema al conectar con el servidor.");
    }
  };

  const handleOpenModal = (task = null) => {
    setSelectedTask(task);
    setModalVisible(true);
    setIsEditing(true);  // Cambié esto a true para que ya pueda editar al abrir el modal
  };
  
  const handleCancel = () => {
    setModalVisible(false);
    setSelectedTask(null);
    setIsEditing(false);
  };


  // Group tasks by status for Kanban view
  const getTasksByStatus = () => {
    const statusGroups = {
      "In Progress": [],
      "Done": [],
      "Paused": [],
      "Revision": []
    };
    
    taskList.forEach(task => {
      if (statusGroups[task.estatus]) {
        statusGroups[task.estatus].push(task);
      } else {
        // If status doesn't match any column, default to In Progress
        statusGroups["In Progress"].push(task);
      }
    });
    
    return statusGroups;
  };

  const handleDelete = async (task) => {
    const token = localStorage.getItem("token");
   
    if (!task) {
      notification.error({
        message: "Error",
        description: "No se ha seleccionado una tarea.",
      });
      return;
    }
  
    const taskId = task.id;
   
    if (!taskId) {
      notification.error({
        message: "Error",
        description: "No se ha encontrado un ID válido para la tarea.",
      });
      return;
    }
  
    Modal.confirm({
      title: "¿Estás seguro de eliminar esta tarea?",
      content: "Esta acción no se puede deshacer.",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          const response = await fetch(`https://task-manager-backend-sge9.onrender.com/tasks/${taskId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
      
          const data = await response.json();
      
          if (response.ok) {
            notification.success({
              message: "Tarea eliminada",
              description: "La tarea ha sido eliminada exitosamente.",
              icon: <DeleteOutlined style={{ color: '#52c41a' }} />
            });
            setTaskList(taskList.filter(t => t.id !== taskId));
          } else {
            notification.error({
              message: "Error",
              description: `Error al eliminar la tarea: ${data.error}`,
            });
          }
        } catch (error) {
          console.error("❌ Error al realizar la solicitud:", error);
          notification.error({
            message: "Error",
            description: "Hubo un problema al eliminar la tarea.",
          });
        }
      }
    });
  };
    
  const handleUpdateTask = async () => {
    const token = localStorage.getItem("token");
  
    if (!selectedTask || !selectedTask.id) {
      notification.error({
        message: "Error",
        description: "No se ha seleccionado una tarea válida."
      });
      return;
    }
      
    if (!nameTask && !descripcion && !categoria && !timeValue && !estatus) {
      notification.warning({
        message: "Advertencia",
        description: "Por favor completa al menos un campo para actualizar."
      });
      return;
    }
  
    try {
      const updatedData = {};
  
      if (nameTask) updatedData.nameTask = nameTask;
      if (descripcion) updatedData.descripcion = descripcion;
      if (categoria) updatedData.categoria = categoria;
      if (timeValue) updatedData.time = timeValue;
      if (timeUnit) updatedData.timeUnit = timeUnit;
      if (estatus) updatedData.estatus = estatus;
  
      const response = await fetch(`https://task-manager-backend-sge9.onrender.com/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
              
      const data = await response.json();
  
      if (response.ok) {
        setTaskList(taskList.map(task => task.id === selectedTask.id ? { ...task, ...updatedData } : task));
        setModalVisible(false);
        setSelectedTask(null);
        setIsEditing(false);
        
        notification.success({
          message: "Tarea actualizada",
          description: "La tarea ha sido actualizada exitosamente.",
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });
      } else {
        notification.error({
          message: "Error",
          description: `Error al actualizar la tarea: ${data.error || "Hubo un problema al actualizar la tarea."}`
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Hubo un problema al actualizar la tarea."
      });
    }
  };
    
  // Función para agregar una tarea
  const handleAddTask = async () => {
    const token = localStorage.getItem("token");

    // Verificar que se haya ingresado un valor válido de tiempo
    if (!timeValue || isNaN(timeValue) || timeValue <= 0) {
      alert("Por favor, ingresa una cantidad válida de tiempo.");
      return;
    }

    try {
      const response = await fetch("https://task-manager-backend-sge9.onrender.com/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nameTask,
          descripcion,
          categoria,
          estatus,
          time: timeValue,
          timeUnit,
        }),
      });

      const data = await response.json();

      if (response.status === 403) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (response.ok) {
        setTaskList([...taskList, { taskId: data.taskId, nameTask, descripcion, categoria, estatus, time: timeValue, timeUnit }]);
        setModalVisible(false); // Cerrar el modal de agregar tarea
        form.resetFields();
      } else {
        console.error("Error al agregar tarea:", data.error);
        alert("Error al agregar la tarea: " + data.error);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Hubo un problema al conectar con el servidor");
    }
  };

  const getIconForTask = (taskName) => {
    if (taskName.toLowerCase().includes("reunión")) return <CalendarOutlined />;
    if (taskName.toLowerCase().includes("documento")) return <FileTextOutlined />;
    if (taskName.toLowerCase().includes("usuario")) return <UserOutlined />;
    if (taskName.toLowerCase().includes("completado")) return <CheckCircleOutlined />;
    if (taskName.toLowerCase().includes("configuración")) return <ToolOutlined />;
    if (taskName.toLowerCase().includes("educación")) return <ReadOutlined />;
    if (taskName.toLowerCase().includes("compra")) return <ShoppingOutlined />;
    if (taskName.toLowerCase().includes("notificación")) return <BellOutlined />;
    return <UserOutlined />;
  };

  const categoryColors = {
    Desarrollo: "#FFDDC1",
    Reunión: "#FFD1DC",
    Documentación: "#C1E1C1",
    Soporte: "#D4A5A5",
    Diseño: "#D1C1E1",
    Investigación: "#B5EAD7",
  };

  // Status column configuration
  const statusConfig = {
    "In Progress": {
      title: "En Progreso",
      color: "#faad14",
      icon: <ClockCircleOutlined />
    },
    "Done": {
      title: "Completado",
      color: "#52c41a",
      icon: <CheckCircleOutlined />
    },
    "Paused": {
      title: "Pausado",
      color: "#9C27B0",
      icon: <PauseCircleOutlined />
    },
    "Revision": {
      title: "Revisión",
      color: "#1890ff",
      icon: <EyeOutlined />
    }
  };

  return (
    <MainLayout>
      <Card style={{ width: "100%", margin: "20px auto", padding: "20px" }}>
        <Title level={2}>Tablero de Tareas</Title>

        {taskList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Title level={4}>No hay tareas aún. Agrega una nueva.</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setModalVisible(true)}
              style={{ marginTop: '20px' }}
            >
              Agregar Tarea
            </Button>
          </div>
        ) : (
          <Row gutter={16} style={{ marginTop: 20 }}>
            {Object.entries(getTasksByStatus()).map(([status, tasks]) => (
              <Col span={6} key={status}>
                <Card
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {statusConfig[status]?.icon}
                      <span style={{ marginLeft: 8 }}>
                        {statusConfig[status]?.title || status}
                      </span>
                      <Badge 
                        count={tasks.length} 
                        style={{ 
                          backgroundColor: statusConfig[status]?.color || '#999',
                          marginLeft: 8
                        }} 
                      />
                    </div>
                  }
                  headStyle={{ 
                    backgroundColor: statusConfig[status]?.color || '#999',
                    color: 'white'
                  }}
                  bodyStyle={{ 
                    maxHeight: 'calc(100vh - 250px)', 
                    overflow: 'auto',
                    padding: '8px'
                  }}
                  style={{ marginBottom: 16 }}
                >
                  {tasks.length === 0 ? (
                    <div style={{ 
                      padding: '20px 0', 
                      textAlign: 'center', 
                      color: '#999',
                      border: '1px dashed #d9d9d9',
                      borderRadius: '4px'
                    }}>
                      <Text type="secondary">No hay tareas</Text>
                    </div>
                  ) : (
                    tasks.map(task => (
                      <Card
                        key={task.id || task.taskId}
                        size="small"
                        style={{
                          marginBottom: 8,
                          backgroundColor: categoryColors[task.categoria] || "#E2F0CB",
                          borderRadius: "8px",
                          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
                        }}
                        actions={[
                          <Button 
                            type="text" 
                            icon={<EditOutlined />} 
                            onClick={() => handleOpenModal(task)}
                          />
                        ]}
                      >
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                          <div style={{ marginRight: "8px", fontSize: "16px" }}>
                            {getIconForTask(task.nameTask)}
                          </div>
                          <Title level={5} style={{ margin: 0 }}>
                            {task.nameTask}
                          </Title>
                        </div>
                        
                        <p style={{ fontSize: "12px", color: "#666", margin: "4px 0" }}>
                          <strong>Categoría:</strong>{" "}
                          <span style={{
                            backgroundColor: "#fff",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "11px"
                          }}>
                            {task.categoria}
                          </span>
                        </p>
                        
                        <p style={{ fontSize: "12px", color: "#666", margin: "4px 0" }}>
                          <strong>Tiempo:</strong> {task.time} {task.timeUnit}
                        </p>
                        
                        {task.descripcion && (
                          <p style={{ 
                            fontSize: "12px", 
                            color: "#666", 
                            margin: "4px 0",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical"
                          }}>
                            <strong>Descripción:</strong> {task.descripcion}
                          </p>
                        )}
                      </Card>
                    ))
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* 📌 Botón Flotante para abrir el Modal */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{ right: 30, bottom: 30 }}
        onClick={() => {
          setModalVisible(true);
          setSelectedTask(null);
          setNameTask("");
          setDescripcion("");
          setCategoria("");
          setEstatus("");
          setTimeValue("");
          setTimeUnit("days");
          form.resetFields();
        }}
      />

      {/* Modal for adding/editing tasks - keep existing code */}
      <Modal
        title="Nueva Tarea"
        open={modalVisible}
        onCancel={handleCancel}
        onOk={handleAddTask}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleAddTask}>
          <Form.Item
            name="name"
            label="Name Task"
            rules={[{ required: true, message: "Por favor ingresa un nombre para la tarea" }]}
          >
            <Input
              placeholder="Ejemplo: Completar reporte"
              value={nameTask}
              onChange={(e) => setNameTask(e.target.value)}
            />
          </Form.Item>

          <Form.Item name="descripcion" label="Descripcion">
            <Input.TextArea
              placeholder="Describe la tarea..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </Form.Item>

          <Form.Item name="time" label="Tiempo de entrega" rules={[{ required: true, message: "Por favor, ingresa el tiempo de entrega" }]}>
            <div style={{ display: "flex", gap: "10px" }}>
              <Input
                placeholder="Cantidad"
                type="number"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                style={{ width: "100px" }}
              />
              <Select
                value={timeUnit}
                onChange={(value) => setTimeUnit(value)}
                style={{ width: "150px" }}
              >
                <Option value="days">Días</Option>
                <Option value="hours">Horas</Option>
                <Option value="minutes">Minutos</Option>
                <Option value="weeks">Semanas</Option>
                <Option value="seconds">Segundos</Option>
              </Select>
            </div>
          </Form.Item>

          <Form.Item name="estatus" label="Estatus" rules={[{ required: true, message: "Selecciona un estado" }]}>
            <Select
              placeholder="Selecciona un estado"
              value={estatus}
              onChange={(value) => setEstatus(value)}
            >
              <Option value="In Progress">In Progress</Option>
              <Option value="Done">Done</Option>
              <Option value="Paused">Paused</Option>
              <Option value="Revision">Revision</Option>
            </Select>
          </Form.Item>

          {/* Selector de categoría */}
          <Form.Item name="categoria" label="Categoría" rules={[{ required: true, message: "Selecciona una categoría" }]}>
            <Select
              placeholder="Selecciona una categoría"
              value={categoria}
              onChange={(value) => setCategoria(value)}
            >
              <Option value="Desarrollo">Desarrollo</Option>
              <Option value="Reunión">Reunión</Option>
              <Option value="Documentación">Documentación</Option>
              <Option value="Soporte">Soporte</Option>
              <Option value="Diseño">Diseño</Option>
              <Option value="Investigación">Investigación</Option>

            </Select>
          </Form.Item>
        </Form>
      </Modal>


      {selectedTask && (
        <Modal
        title="Detalles de la tarea"
        open={modalVisible}
        onCancel={handleCancel}
        footer={[
          isEditing && (
            <Button key="save" onClick={handleUpdateTask} type="primary">
              Guardar Cambios
            </Button>
          ),
        ]}

        >
          <Form form={form} layout="vertical">
            <Form.Item label="Nombre de la tarea">
              <Input
                value={nameTask || selectedTask.nameTask}
                onChange={(e) => setNameTask(e.target.value)}
                disabled={!isEditing}
              />
            </Form.Item>
            <Form.Item label="Descripción">
              <Input.TextArea
                value={descripcion || selectedTask.descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={!isEditing}
              />
            </Form.Item>
            <Form.Item label="Tiempo de entrega">
              <div style={{ display: "flex", gap: "10px" }}>
                <Input
                  placeholder="Cantidad"
                  type="number"
                  value={timeValue || selectedTask.time}
                  onChange={(e) => setTimeValue(e.target.value)}
                  disabled={!isEditing}
                  style={{ width: "80px" }}
                />
                <Select
                  value={timeUnit}
                  onChange={setTimeUnit}
                  disabled={!isEditing}
                  style={{ width: "100px" }}
                >
                  <Option value="days">Días</Option>
                  <Option value="hours">Horas</Option>
                </Select>
              </div>
            </Form.Item>
            <Form.Item label="Categoría">
              <Select
                value={categoria || selectedTask.categoria}
                onChange={setCategoria}
                disabled={!isEditing}
              >
                <Option value="Desarrollo">Desarrollo</Option>
                <Option value="Reunión">Reunión</Option>
                <Option value="Documentación">Documentación</Option>
                <Option value="Soporte">Soporte</Option>
                <Option value="Diseño">Diseño</Option>
                <Option value="Investigación">Investigación</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Estado">
            <Select
              value={estatus || selectedTask.estatus}
              onChange={setEstatus}
              disabled={!isEditing}
              className={`status-${estatus.toLowerCase().replace(" ", "-")}`}
            >
              <Option value="In Progress">In Progress</Option>
              <Option value="Done">Done</Option>
              <Option value="Paused">Paused</Option>
              <Option value="Revision">Revision</Option>
            </Select>
          </Form.Item>
          </Form>
        </Modal>
      )}
    </MainLayout>
  );
};

export default TaskPage;
