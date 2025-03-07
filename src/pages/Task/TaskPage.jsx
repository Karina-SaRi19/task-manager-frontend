import React, { useState, useEffect } from "react";
import { Card, Typography, Modal, Button, Input, Form, FloatButton, Select } from "antd";
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
} from "@ant-design/icons";
import MainLayout from "../../layouts/MainLayout";

const { Title } = Typography;
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


  const handleDelete = async (task) => {
    const token = localStorage.getItem("token");
   
    if (!task) {
      alert("No se ha seleccionado una tarea.");
      return;
    }
  
    const taskId = task.id;
   
    if (!taskId) {
      alert("No se ha encontrado un ID válido para la tarea.");
      return;
    }
  
    console.log(`Eliminando tarea con ID: ${taskId}`);
  
    try {
      const response = await fetch(`https://task-manager-backend-sge9.onrender.com/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      console.log("Respuesta del servidor:", response.status, data);
  
      if (response.ok) {
        alert("Tarea eliminada exitosamente");
        setTaskList(taskList.filter(task => task.id !== taskId)); // Actualiza la lista de tareas
      } else {
        alert(`Error al eliminar la tarea: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Error al realizar la solicitud:", error);
      alert("Hubo un problema al eliminar la tarea.");
    }
  };
    

  const handleUpdateTask = async () => {
    const token = localStorage.getItem("token");
  
    // Verificar si se ha seleccionado una tarea válida
    console.log("Tarea seleccionada:", selectedTask);
    if (!selectedTask || !selectedTask.id) {
      alert("No se ha seleccionado una tarea válida.");
      return;
    }
      
    // Verificamos si al menos uno de los campos está siendo modificado
    if (!nameTask && !descripcion && !categoria && !timeValue && !estatus) {
      alert("Por favor completa al menos un campo para actualizar.");
      return;
    }
  
    try {
      const updatedData = {};
  
      // Solo actualizamos los campos que han cambiado
      if (nameTask) updatedData.nameTask = nameTask;
      if (descripcion) updatedData.descripcion = descripcion;
      if (categoria) updatedData.categoria = categoria;
      if (timeValue) updatedData.time = timeValue;
      if (timeUnit) updatedData.timeUnit = timeUnit;
      if (estatus) updatedData.estatus = estatus;
  
      // Enviamos la solicitud PUT al backend
      const response = await fetch(`https://task-manager-backend-sge9.onrender.com/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
              
      const data = await response.json();
  
      // Si la respuesta es exitosa, actualizamos el estado
      if (response.ok) {
        setTaskList(taskList.map(task => task.id === selectedTask.id ? { ...task, ...updatedData } : task));
        setModalVisible(false);
        setSelectedTask(null);
        setIsEditing(false);
      } else {
        alert(`Error al actualizar la tarea: ${data.error || "Hubo un problema al actualizar la tarea."}`);
      }
    } catch (error) {
      alert("Hubo un problema al actualizar la tarea.");
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

  return (
    <MainLayout>
      <Card style={{ width: "100%", maxWidth: 900, margin: "20px auto", padding: "20px" }}>
        <Title level={2}>Tasks</Title>

        {taskList.length === 0 ? (
          <p>No hay tareas aún. Agrega una nueva.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "15px" }}>
            {taskList.map((task, index) => (
                <Card
                  key={task.taskId}
                  style={{
                    padding: "20px",
                    borderRadius: "12px",
                    backgroundColor: categoryColors[task.categoria] || "#E2F0CB",
                    cursor: "pointer",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "270px",
                    transition: "transform 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {/* Encabezado con Icono y Nombre */}
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                    <div
                      style={{
                        marginRight: "10px",
                        fontSize: "20px",
                        color: "#555",
                      }}
                    >
                      {getIconForTask(task.nameTask)}
                    </div>
                    <Title level={4} style={{ margin: 0, flex: 1, fontWeight: "bold" }}>
                      {task.nameTask}
                    </Title>
                  </div>


                  {/* Detalles */}
                  <div style={{ fontSize: "14px", color: "#666" }}>
                  <p>
                      <strong>Descripción:</strong> {task.descripcion}
                    </p>
                    <p>
                      <strong>Categoría:</strong>{" "}
                      <span
                        style={{
                          backgroundColor: "#fff",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontWeight: "bold",
                        }}
                      >
                        {task.categoria}
                      </span>
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      <span
                        style={{
                          color: 
                            task.estatus === "Done" ? "green" :
                            task.estatus === "In Progress" ? "orange" :
                            task.estatus === "Paused" ? "#9C27B0" :
                            task.estatus === "Revision" ? "blue" :
                            "black", // Color por defecto
                          fontWeight: "bold",
                        }}
                      >
                        {task.estatus}
                      </span>
                    </p>
                    <p>
                      <strong>Tiempo de entrega:</strong> {task.time} {task.timeUnit}
                    </p>
                  </div>

            {/* Botones */}
            <div
              style={{
                marginTop: "40px", // Mueve los botones más abajo
                display: "flex",  
                gap: "10px", // Juntarlos más
                marginLeft: "70px", // Mover los botones a la derecha
              }}
            >
            <Button onClick={() => handleOpenModal(task)} type="primary" size="small">
              Editar
            </Button>
            <Button 
            onClick={() => {
              console.log("Botón de eliminar fuera del modal presionado");
              handleDelete(task);
            }} 
            danger 
            size="small">
            Eliminar
          </Button>
          </div>
          </Card>
        ))}
      </div>
    )}
  </Card>

{/* 📌 Botón Flotante para abrir el Modal */}
<FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{ right: 30, bottom: 30 }}
        onClick={() => setModalVisible(true)}  // Abre solo el modal de agregar tarea
      />

      {/* Modal de agregar tarea */}
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
