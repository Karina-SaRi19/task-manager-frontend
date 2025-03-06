import { useEffect, useState } from "react";
import { List, Button, Card, Typography, Modal, Form, Input, DatePicker, Select, message, FloatButton } from "antd";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { DeleteOutlined } from '@ant-design/icons';
import {
    PlusOutlined,
  } from "@ant-design/icons";


const { Title, Paragraph } = Typography;

const GroupsPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [users, setUsers] = useState([]);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskForm] = Form.useForm();
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignTaskModalVisible, setAssignTaskModalVisible] = useState(false);
  const [viewTaskModalVisible, setViewTaskModalVisible] = useState(false);
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false); // Nuevo estado para el modal
  const [groupForm] = Form.useForm(); // Formulario para crear grupo
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  // Fetch user data, groups, and users
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Obtener grupos
        const groupsResponse = await fetch("http://localhost:3000/groups", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!groupsResponse.ok) throw new Error("Error al obtener grupos");
        setGroups(await groupsResponse.json());

        // Obtener información del usuario desde el token
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decodedToken.rol);

        // Obtener lista de usuarios
        const usersResponse = await fetch("http://localhost:3000/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (usersResponse.ok) setUsers(await usersResponse.json());
        else throw new Error("Error al obtener usuarios");
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        message.error("No se pudieron obtener los datos. Verifica que el servidor esté corriendo.");
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle assigning task to a group
  const handleAssignTask = async (values) => {
    const token = localStorage.getItem("token");

    // Validar que haya un grupo seleccionado
    if (!selectedGroupId) {
      message.error("Error: No hay un grupo seleccionado.");
      return;
    }

    // Formatear la fecha correctamente antes de enviarla
    const formattedValues = {
      ...values,
      dueDate: values.dueDate ? values.dueDate.format("YYYY-MM-DD") : null,
    };

    try {
      const response = await fetch(`http://localhost:3000/groups/${selectedGroupId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) {
        throw new Error("Error al asignar la tarea");
      }

      message.success("Tarea asignada exitosamente");
      setTaskModalVisible(false);
      taskForm.resetFields();
    } catch (error) {
      message.error("No se pudo asignar la tarea");
      console.error(error);
    }
  };

  const handleCreateGroup = async (values) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:3000/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el grupo");
      }
  
      const newGroup = await response.json();
      console.log("Nuevo grupo creado:", newGroup);
  
      // Actualizar el estado con el nuevo grupo
      setGroups(prevGroups => {
        // Verificar si el grupo ya existe en el estado
        return [...prevGroups, newGroup];
      });
  
      setCreateGroupModalVisible(false); // Cerrar el modal de creación
    } catch (error) {
      alert("Error al crear el grupo.");
      console.error(error);
    }
  };
    

  // Handle viewing tasks of a group
  const handleViewTasks = async (groupId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:3000/groups/${groupId}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const tasks = await response.json();
        if (tasks.length > 0) {
          // Asegúrate de incluir el groupId en las tareas
          const formattedTasks = tasks.map(task => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate._seconds * 1000).toLocaleDateString() : "No definida",
            groupId: groupId  // Aquí añadimos el groupId a cada tarea
          }));
          setSelectedTask(formattedTasks[0]); // Asignar la primera tarea
          setTaskModalVisible(true);
        } else {
          message.info("No hay tareas asignadas.");
        }
      } else {
        throw new Error("Error al obtener las tareas");
      }
    } catch (error) {
      console.error("Error al obtener las tareas:", error);
      message.error("No se pudieron obtener las tareas.");
    }
  };
  
  const fetchTasks = async () => {
    if (!selectedGroupId) return;
  
    const token = localStorage.getItem("token");
  
    try {
      const response = await fetch(`http://localhost:3000/groups/${selectedGroupId}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const tasks = await response.json();
        console.log(tasks);  // Solo para verificar las tareas obtenidas
      } else {
        throw new Error("Error al obtener las tareas");
      }
    } catch (error) {
      console.error("Error al obtener las tareas:", error);
      message.error("No se pudieron obtener las tareas.");
    }
  };
  
  
  // Handle updating the task status
  const handleUpdateTaskStatus = async (values) => {
    if (!selectedTask || !selectedTask.id || !selectedTask.groupId) {
      message.error("No se encontró la tarea o el grupo para actualizar.");
      return;
    }
  
    const token = localStorage.getItem("token");
    const groupId = selectedTask.groupId;
  
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const updatedBy = decodedToken.username;  
  
    try {
      const response = await fetch(`http://localhost:3000/groups/${groupId}/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: values.status,
          updatedBy,  // Aquí envías quién actualizó la tarea
        }),
      });
  
      if (response.ok) {
        message.success("Estado de la tarea actualizado correctamente");
        setSelectedTask((prevTask) => ({
          ...prevTask,
          status: values.status,
          updatedBy,  // Actualiza también el `updatedBy` en el frontend
        }));
  
        fetchTasks();
        setTaskModalVisible(false);
      } else {
        throw new Error("Error al actualizar el estado de la tarea");
      }
    } catch (error) {
      console.error("Error al actualizar el estado de la tarea:", error);
      message.error("No se pudo actualizar el estado de la tarea.");
    }
  };
    
  
  const handleDeleteGroup = async (groupId) => {
    console.log("Intentando eliminar el grupo con ID:", groupId);
  
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No hay token de autenticación");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3000/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Error al eliminar el grupo");
      }
  
      console.log("Grupo eliminado correctamente");
  
      // Actualizar el estado de los grupos después de la eliminación
      setGroups(groups.filter(group => group.id !== groupId));
      message.success("¡El grupo se eliminó exitosamente!"); // Mostrar mensaje de éxito
    } catch (error) {
      console.error("Error eliminando el grupo:", error);
      message.error("Hubo un error al eliminar el grupo. Intenta nuevamente.");
    }
  };

  
  const handleDeleteConfirmed = () => {
    // Llamar a la función para eliminar el grupo
    handleDeleteGroup(groupToDelete);
  
    // Cerrar el modal de confirmación
    setIsConfirmDeleteVisible(false);
  };
  
  
  return (
    <MainLayout>
      <Card style={{ width: "100%", maxWidth: 800, margin: "20px auto", padding: "20px" }}>
        <Title level={2}>Mis Grupos</Title>
        <Paragraph>
          {userRole === 1
            ? "Aquí puedes gestionar los grupos y asignar tareas a los miembros."
            : "Aquí puedes ver los grupos en los que estás y las tareas asignadas."}
        </Paragraph>
        <List
  key={groups.length}  // Usamos la longitud de los grupos para forzar un re-render
  bordered
  dataSource={groups}
  renderItem={(group) => (
    <List.Item>
      <div style={{ flex: 1 }}>
        <Title level={4}>{group.name}</Title>
        <Paragraph>Estado: {group.status}</Paragraph>
      </div>
      <Button
        type="primary"
        style={{ marginLeft: "10px" }}
        onClick={() => {
          setSelectedGroupId(group.id);
          handleViewTasks(group.id);
        }}
      >
        {userRole === 1 ? "Ver Tarea" : "Ver tareas"}
      </Button>

      {userRole === 1 && (
  <>
    <Button
      type="primary"
      style={{ marginLeft: "10px" }}
      onClick={() => {
        setSelectedGroupId(group.id);
        setAssignTaskModalVisible(true);
      }}
    >
      Asignar Tarea
    </Button>

    <Button
  type="danger"
  icon={<DeleteOutlined />}
  style={{ marginLeft: "10px" }}
  onClick={() => {
    // Guardamos el ID del grupo a eliminar
    setGroupToDelete(group.id);
    // Mostramos el modal de confirmación
    setIsConfirmDeleteVisible(true);
  }}
/>
  </>
      )}
    </List.Item>
  )}
/>

        {/* Modal para asignar tarea */}
        <Modal
            title="Asignar Tarea"
            open={assignTaskModalVisible}  // Usamos el nuevo estado
            onCancel={() => setAssignTaskModalVisible(false)}  // Cerrar el modal
            footer={null}
            >          
            <Form form={taskForm} onFinish={handleAssignTask}>
            <Form.Item name="title" label="Título" rules={[{ required: true, message: "Ingresa un título" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Descripción">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="dueDate" label="Fecha de Entrega" rules={[{ required: true, message: "Selecciona una fecha" }]}>
              <DatePicker format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item name="assignedTo" label="Asignar a" rules={[{ required: true, message: "Selecciona al menos un usuario" }]}>
              <Select
                mode="multiple"
                placeholder="Selecciona usuarios"
                options={users.map(user => ({ value: user.id, label: user.username }))}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Asignar
            </Button>
          </Form>
        </Modal>


{/* Modal para crear grupo */}  
                <Modal
                    title="Crear Nuevo Grupo"
                    visible={createGroupModalVisible}
                    onCancel={() => setCreateGroupModalVisible(false)}
                    footer={null}
                >
                    <Form form={groupForm} onFinish={handleCreateGroup}>
                        <Form.Item name="name" label="Nombre del Grupo" rules={[{ required: true, message: "Por favor ingresa el nombre del grupo" }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="status" label="Estado" rules={[{ required: true, message: "Por favor selecciona el estado" }]}>
                            <Select
                                placeholder="Selecciona el estado"
                                options={[
                                    { value: 'activo', label: 'Activo' },
                                    { value: 'inactivo', label: 'Inactivo' },
                                    { value: 'en_progreso', label: 'En Progreso' },
                                    { value: 'finalizado', label: 'Finalizado' },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item name="members" label="Miembros" rules={[{ required: true, message: "Por favor selecciona al menos un miembro" }]}>
                            <Select
                                mode="multiple"
                                placeholder="Selecciona miembros"
                                options={users.map(user => ({ value: user.id, label: user.username }))} // Cambié 'name' por 'username'
                            />
                        </Form.Item>

                        <Button type="primary" htmlType="submit">
                            Crear Grupo
                        </Button>
                    </Form>
                </Modal>

                {/* Botón flotante para crear grupo */}
                {userRole === 1 && (
                    <FloatButton 
                        type="primary" 
                        icon={<PlusOutlined />}
                        style={{ position: "fixed", bottom: 40, right: 40 }} 
                        onClick={() => setCreateGroupModalVisible(true)} 
                    />
                )}

{/* Modal para ver la tarea */}
<Modal
  title="Detalles de la Tarea"
  visible={taskModalVisible}
  onCancel={() => setTaskModalVisible(false)}
  footer={null}
>
  {selectedTask ? (
    <>
      <p><strong>Título:</strong> {selectedTask.title}</p>
      <p><strong>Descripción:</strong> {selectedTask.description}</p>
      <p><strong>Fecha de Entrega:</strong> {selectedTask.dueDate}</p>
      <p><strong>Estado:</strong> {selectedTask.status}</p>
      {selectedTask.updatedBy && (
        <p><strong>Última actualización realizada por:</strong> {selectedTask.updatedBy}</p>
      )}
      
      <Form
        form={taskForm}
        onFinish={handleUpdateTaskStatus}
        initialValues={{ status: selectedTask.status }}
      >
        <Form.Item name="status" label="Estado">
          <Select>
            <Select.Option value="pendiente">Pendiente</Select.Option>
            <Select.Option value="completada">Completada</Select.Option>
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Actualizar Estado
        </Button>
      </Form>
    </>
  ) : (
    <p>Cargando tarea...</p>
  )}
</Modal>

{/* Modal para eliminar grupo */}

<Modal
  title="Para confirmar..."
  visible={isConfirmDeleteVisible}
  onCancel={() => setIsConfirmDeleteVisible(false)} // Cerrar el modal si el usuario hace clic fuera
  footer={[
    <Button key="cancel" onClick={() => setIsConfirmDeleteVisible(false)}>
      Cancelar
    </Button>,
    <Button
      key="delete"
      type="primary"
      danger
      onClick={() => handleDeleteConfirmed()}
    >
      Eliminar
    </Button>,
  ]}
>
  <p>¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer.</p>
</Modal>

      </Card>
    </MainLayout>
  );
};

export default GroupsPage;
