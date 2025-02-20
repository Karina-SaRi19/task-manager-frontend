import React, { useState, useEffect } from "react";
import { Card, Typography, Modal, Form, Input, Select, FloatButton, Collapse } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import MainLayout from "../../layouts/MainLayout";

const { Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse; // Componente Collapse de Ant Design

const TaskPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [form] = Form.useForm();
  const [selectedTask, setSelectedTask] = useState(null); // Estado para mostrar los detalles de la tarea seleccionada

  // Estados del formulario de tarea
  const [nameTask, setNameTask] = useState("");
  const [estatus, setEstatus] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [timeValue, setTimeValue] = useState(""); // Campo de cantidad de tiempo
  const [timeUnit, setTimeUnit] = useState("days"); // Unidad de tiempo (por defecto 'días')

  // Función para cargar las tareas del usuario
  const loadTasks = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("Token no encontrado. El usuario no está autenticado.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/tasks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTaskList(data); // Cargar las tareas en el estado
      } else {
        console.error("Error al obtener las tareas:", response.status);
        alert("Error al cargar las tareas.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Hubo un problema al conectar con el servidor");
    }
  };

  // Llamar a loadTasks cuando el componente se monte
  useEffect(() => {
    loadTasks();
  }, []);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  // Función para agregar una tarea
  const handleAddTask = async () => {
    const token = localStorage.getItem("token");
    console.log("Token obtenido del localStorage:", token);

    // Verificar que se haya ingresado un valor válido de tiempo
    if (!timeValue || isNaN(timeValue) || timeValue <= 0) {
      alert("Por favor, ingresa una cantidad válida de tiempo.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Envía el token en los headers
        },
        body: JSON.stringify({
          nameTask,
          descripcion,
          categoria,
          estatus,
          time: timeValue, // tiempo en número
          timeUnit, // unidad de tiempo: 'days', 'hours', 'minutes', 'weeks'
        }),
      });

      const data = await response.json();

      if (response.status === 403) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        localStorage.removeItem("token"); // Eliminar el token expirado
        window.location.href = "/login"; // Redirigir a login
        return;
      }

      if (response.ok) {
        setTaskList([...taskList, { taskId: data.taskId, nameTask, descripcion, categoria, estatus, time: timeValue, timeUnit }]); // Agregar la nueva tarea a la lista
        setModalVisible(false);
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

  const handleTaskClick = (task) => {
    console.log("Tarea seleccionada:", task); // Añadir esto para depurar
    setSelectedTask(task); // Guarda la tarea seleccionada en el estado
  };

  
  return (
    <MainLayout>
      {/* 📌 Contenedor de Tareas */}
      <Card style={{ width: "100%", maxWidth: 800, margin: "20px auto", padding: "20px" }}>
        <Title level={2}>Tasks</Title>

        {taskList.length === 0 ? (
          <p>No hay tareas aún. Agrega una nueva.</p>
        ) : (
          // Aquí agregamos el Collapse para las tareas
          <Collapse accordion>
            {taskList.map((task, index) => (
              <Panel
                header={task.nameTask} // El título que aparece en el panel
                key={task.taskId} // Usamos el taskId como clave
                extra={<span>{task.estatus}</span>} // Mostrar el estado de la tarea al lado del título
                onClick={() => handleTaskClick(task)}  // Llamar a handleTaskClick cuando se hace clic
              >
                <div>
                  <p><strong>Descripción:</strong> {task.descripcion}</p>
                  <p><strong>Categoría:</strong> {task.categoria}</p>
                  <p><strong>Fecha límite:</strong> {task.time} {task.timeUnit}</p>
                </div>
              </Panel>
            ))}
          </Collapse>
        )}
      </Card>

      {/* 📌 Botón Flotante para abrir el Modal */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{ right: 30, bottom: 30 }}
        onClick={handleOpenModal}
      />

      {/* 📌 Modal con Formulario */}
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

          <Form.Item name="categoria" label="Categoría">
            <Input
              placeholder="Ejemplo: Desarrollo"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 📌 Modal de detalles de la tarea seleccionada */}
      {selectedTask && (
  <Modal
    title="Detalles de la tarea"
    open={true}
    onCancel={() => setSelectedTask(null)}  // Cerrar el modal al hacer clic en cancelar
    footer={null}
  >
    <p><strong>Descripción:</strong> {selectedTask.descripcion}</p>
    <p><strong>Categoría:</strong> {selectedTask.categoria ? selectedTask.categoria : "No especificada"}</p>
    <p><strong>Fecha límite:</strong> {selectedTask.time} {selectedTask.timeUnit}</p>
    <p><strong>Estatus:</strong> {selectedTask.estatus}</p>
  </Modal>
)}
    </MainLayout>
  );
};

export default TaskPage;
