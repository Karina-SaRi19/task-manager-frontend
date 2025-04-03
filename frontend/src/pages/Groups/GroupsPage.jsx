import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, Typography, Tag, Button, Spin, Empty, Form, Select, 
  Row, Col, Divider, message, Statistic, Avatar, Tooltip, Badge, Input, DatePicker, Modal, List, FloatButton
} from 'antd';
import { 
  ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  ExclamationCircleOutlined, UserOutlined, CalendarOutlined,
  FileTextOutlined, TeamOutlined, DeleteOutlined, UserAddOutlined,
  UserDeleteOutlined, PlusOutlined, EyeOutlined
} from '@ant-design/icons';
import MainLayout from '../../layouts/MainLayout';

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
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [groupForm] = Form.useForm();
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshGroups, setRefreshGroups] = useState(false);
  const [viewMembersModalVisible, setViewMembersModalVisible] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  
  // Fetch user data, groups, and users
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Log token for debugging (remove in production)
        console.log("Using token:", token.substring(0, 15) + "...");

        // Obtener información del usuario desde el token
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decodedToken.rol);
        
        // Obtener grupos
        const groupsResponse = await fetch("https://task-manager-backend-sge9.onrender.com/groups", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        if (!groupsResponse.ok) {
          console.error("Groups response status:", groupsResponse.status);
          throw new Error(`Error al obtener grupos: ${groupsResponse.status}`);
        }
        
        const groupsData = await groupsResponse.json();
        console.log("Groups data received:", groupsData);
        setGroups(groupsData);

        // Obtener lista de usuarios
        const usersResponse = await fetch("https://task-manager-backend-sge9.onrender.com/users", {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        } else {
          console.error("Users response status:", usersResponse.status);
          throw new Error("Error al obtener usuarios");
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        
        // Check if token might be expired
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // Convert to milliseconds
            if (Date.now() > expiry) {
              console.error("Token expired at:", new Date(expiry).toLocaleString());
              message.error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
              localStorage.removeItem("token");
              navigate("/login");
              return;
            }
          } catch (e) {
            console.error("Error parsing token:", e);
          }
        }
        
        message.error("No se pudieron obtener los datos. Verifica que el servidor esté corriendo.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, refreshGroups]);

  // Modify state to handle multiple selected users
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Modificamos la función handleAddUserToGroup para actualizar los grupos después de agregar un usuario
  const handleAddUserToGroup = async () => {
    console.log("Adding users to group:", selectedUsers, "Group ID:", selectedGroupId);
    
    if (!selectedUsers.length || !selectedGroupId) {
      message.error("Selecciona al menos un usuario y un grupo.");
      return;
    }
  
    const token = localStorage.getItem("token");
    setLoading(true);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each selected user
    for (const userId of selectedUsers) {
      try {
        console.log("Attempting to add user:", userId, "to group:", selectedGroupId);
        
        // Usar el endpoint correcto que acabamos de implementar en el backend
        const response = await fetch(`https://task-manager-backend-sge9.onrender.com/groups/${selectedGroupId}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        });
        
        console.log("Response status:", response.status);
    
        if (!response.ok) {
          // Log more detailed error information
          const errorText = await response.text();
          console.error("Failed to add user:", errorText);
          console.error("Request details:", {
            groupId: selectedGroupId,
            userId: userId,
            endpoint: `https://task-manager-backend-sge9.onrender.com/groups/${selectedGroupId}/users`
          });
          errorCount++;
          continue;
        }
        
        successCount++;
      } catch (error) {
        console.error("Error al agregar usuario:", error);
        errorCount++;
      }
    }
    
    // Close modal and reset selection first
    setAddUserModalVisible(false);
    setSelectedUsers([]);
    setLoading(false);
    
    // Then show appropriate message based on results
    if (successCount > 0) {
      const successMessage = successCount === 1 
        ? "Usuario agregado al grupo exitosamente" 
        : `${successCount} usuarios agregados al grupo exitosamente`;
      
      // Force groups refresh
      setRefreshGroups(prev => !prev);
      
      // Crear una notificación personalizada que se inserta directamente en el DOM
      const notificationId = 'custom-success-notification';
      
      // Eliminar notificación anterior si existe
      const existingNotification = document.getElementById(notificationId);
      if (existingNotification) {
        document.body.removeChild(existingNotification);
      }
      
      // Crear el elemento de notificación
      const notification = document.createElement('div');
      notification.id = notificationId;
      notification.style.position = 'fixed';
      notification.style.top = '50%';
      notification.style.left = '50%';
      notification.style.transform = 'translate(-50%, -50%)';
      notification.style.backgroundColor = 'white';
      notification.style.padding = '30px';
      notification.style.borderRadius = '8px';
      notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      notification.style.zIndex = '9999';
      notification.style.minWidth = '400px';
      notification.style.textAlign = 'center';
      
      // Contenido de la notificación
      notification.innerHTML = `
        <div style="margin-bottom: 20px; color: #52c41a; font-size: 48px;">✓</div>
        <h2 style="margin-bottom: 15px; color: #52c41a; font-size: 24px;">¡OPERACIÓN EXITOSA!</h2>
        <p style="margin-bottom: 20px; font-size: 16px;">${successMessage}</p>
        <div style="background-color: #f6ffed; border: 1px solid #b7eb8f; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
          <p style="margin: 0; color: #52c41a;">Los usuarios ahora tienen acceso a este grupo y sus tareas</p>
        </div>
        <button id="close-notification" style="background-color: #52c41a; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">Entendido</button>
      `;
      
      // Agregar al DOM
      document.body.appendChild(notification);
      
      // Agregar overlay oscuro
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.zIndex = '9998';
      document.body.appendChild(overlay);
      
      // Configurar el botón para cerrar la notificación
      setTimeout(() => {
        const closeButton = document.getElementById('close-notification');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            document.body.removeChild(notification);
            document.body.removeChild(overlay);
          });
        }
      }, 100);
      
      // Auto-cerrar después de 8 segundos
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 8000);
    }
    
    if (errorCount > 0) {
      // Crear notificación de error personalizada
      const errorNotificationId = 'custom-error-notification';
      
      // Eliminar notificación anterior si existe
      const existingErrorNotification = document.getElementById(errorNotificationId);
      if (existingErrorNotification) {
        document.body.removeChild(existingErrorNotification);
      }
      
      // Crear el elemento de notificación de error
      const errorNotification = document.createElement('div');
      errorNotification.id = errorNotificationId;
      errorNotification.style.position = 'fixed';
      errorNotification.style.top = '50%';
      errorNotification.style.left = '50%';
      errorNotification.style.transform = 'translate(-50%, -50%)';
      errorNotification.style.backgroundColor = 'white';
      errorNotification.style.padding = '30px';
      errorNotification.style.borderRadius = '8px';
      errorNotification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      errorNotification.style.zIndex = '9999';
      errorNotification.style.minWidth = '400px';
      errorNotification.style.textAlign = 'center';
      
      // Contenido de la notificación de error
      errorNotification.innerHTML = `
        <div style="margin-bottom: 20px; color: #ff4d4f; font-size: 48px;">✗</div>
        <h2 style="margin-bottom: 15px; color: #ff4d4f; font-size: 24px;">ERROR</h2>
        <p style="margin-bottom: 20px; font-size: 16px;">No se pudieron agregar ${errorCount} usuario(s) al grupo.</p>
        <button id="close-error-notification" style="background-color: #ff4d4f; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">Entendido</button>
      `;
      
      // Agregar al DOM
      document.body.appendChild(errorNotification);
      
      // Agregar overlay oscuro
      const errorOverlay = document.createElement('div');
      errorOverlay.style.position = 'fixed';
      errorOverlay.style.top = '0';
      errorOverlay.style.left = '0';
      errorOverlay.style.width = '100%';
      errorOverlay.style.height = '100%';
      errorOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      errorOverlay.style.zIndex = '9998';
      document.body.appendChild(errorOverlay);
      
      // Configurar el botón para cerrar la notificación
      setTimeout(() => {
        const closeErrorButton = document.getElementById('close-error-notification');
        if (closeErrorButton) {
          closeErrorButton.addEventListener('click', () => {
            document.body.removeChild(errorNotification);
            document.body.removeChild(errorOverlay);
          });
        }
      }, 100);
      
      // Auto-cerrar después de 8 segundos
      setTimeout(() => {
        if (document.body.contains(errorNotification)) {
          document.body.removeChild(errorNotification);
        }
        if (document.body.contains(errorOverlay)) {
          document.body.removeChild(errorOverlay);
        }
      }, 8000);
    }
  };

// Handle assigning task to a group
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
    const response = await fetch(`https://task-manager-backend-sge9.onrender.com/groups/${selectedGroupId}/tasks`, {
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
    setAssignTaskModalVisible(false); // Close the assign task modal
    taskForm.resetFields();
  } catch (error) {
    message.error("No se pudo asignar la tarea");
    console.error(error);
  }
};


const handleCreateGroup = async (values) => {
  const token = localStorage.getItem("token");
  setLoading(true);
  
  try {
    console.log("Attempting to create group with values:", values);
    
    // Clean up the values to ensure no undefined values
    const cleanedValues = {
      name: values.name,
      status: values.status,
      members: values.members || []
    };
    
    console.log("Cleaned values for group creation:", cleanedValues);
    
    const response = await fetch("https://task-manager-backend-sge9.onrender.com/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleanedValues),
    });

    console.log("Create group response status:", response.status);
    
    // Try to parse the response as JSON
    let data;
    try {
      data = await response.json();
      console.log("Response data:", data);
    } catch (e) {
      console.error("Error parsing response:", e);
      const text = await response.text();
      console.error("Response text:", text);
      data = { error: "Error interno del servidor" };
    }
    
    if (!response.ok) {
      // Handle specific error for duplicate group name
      if (data.error === 'Ya existe un grupo con este nombre') {
        // Create a custom error notification for duplicate group name
        const errorNotificationId = 'duplicate-group-error';
        
        // Remove existing notification if present
        const existingErrorNotification = document.getElementById(errorNotificationId);
        if (existingErrorNotification) {
          document.body.removeChild(existingErrorNotification);
        }
        
        // Create error notification element
        const errorNotification = document.createElement('div');
        errorNotification.id = errorNotificationId;
        errorNotification.style.position = 'fixed';
        errorNotification.style.top = '50%';
        errorNotification.style.left = '50%';
        errorNotification.style.transform = 'translate(-50%, -50%)';
        errorNotification.style.backgroundColor = 'white';
        errorNotification.style.padding = '30px';
        errorNotification.style.borderRadius = '8px';
        errorNotification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        errorNotification.style.zIndex = '9999';
        errorNotification.style.minWidth = '400px';
        errorNotification.style.textAlign = 'center';
        
        // Content for error notification
        errorNotification.innerHTML = `
          <div style="margin-bottom: 20px; color: #ff4d4f; font-size: 48px;">✗</div>
          <h2 style="margin-bottom: 15px; color: #ff4d4f; font-size: 24px;">ERROR</h2>
          <p style="margin-bottom: 20px; font-size: 16px;">Ya existe un grupo con este nombre.</p>
          <div style="background-color: #fff2f0; border: 1px solid #ffccc7; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; color: #ff4d4f;">Por favor, usa un nombre diferente para tu grupo.</p>
          </div>
          <button id="close-duplicate-error" style="background-color: #ff4d4f; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">Entendido</button>
        `;
        
        // Add to DOM
        document.body.appendChild(errorNotification);
        
        // Add dark overlay
        const errorOverlay = document.createElement('div');
        errorOverlay.style.position = 'fixed';
        errorOverlay.style.top = '0';
        errorOverlay.style.left = '0';
        errorOverlay.style.width = '100%';
        errorOverlay.style.height = '100%';
        errorOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        errorOverlay.style.zIndex = '9998';
        document.body.appendChild(errorOverlay);
        
        // Configure close button
        setTimeout(() => {
          const closeErrorButton = document.getElementById('close-duplicate-error');
          if (closeErrorButton) {
            closeErrorButton.addEventListener('click', () => {
              document.body.removeChild(errorNotification);
              document.body.removeChild(errorOverlay);
            });
          }
        }, 100);
        
        // Auto-close after 8 seconds
        setTimeout(() => {
          if (document.body.contains(errorNotification)) {
            document.body.removeChild(errorNotification);
          }
          if (document.body.contains(errorOverlay)) {
            document.body.removeChild(errorOverlay);
          }
        }, 8000);
      } else {
        message.error(data.error || "Error al crear el grupo. Código: " + response.status);
      }
      return;
    }

    console.log("Nuevo grupo creado:", data);

    // Actualizar el estado con el nuevo grupo
    setGroups(prevGroups => [...prevGroups, data]);

    // Reset the form fields
    groupForm.resetFields();
    
    // Show success message
    message.success("¡Grupo creado exitosamente!");
    
    // Close the modal
    setCreateGroupModalVisible(false);
  } catch (error) {
    console.error("Error al crear el grupo:", error);
    message.error("Error al crear el grupo: " + error.message);
  } finally {
    setLoading(false);
  }
};

// Handle viewing tasks of a group
// Handle viewing tasks of a group
const handleViewTasks = async (groupId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`https://task-manager-backend-sge9.onrender.com/groups/${groupId}/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const tasks = await response.json();
      if (tasks.length > 0) {
        // Format tasks with proper date formatting
        const formattedTasks = tasks.map(task => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate._seconds * 1000).toLocaleDateString() : "No definida",
          groupId: groupId
        }));
        
        // Instead of just selecting the first task, store all tasks
        setTasks(formattedTasks);
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

// Add this state at the top with your other state variables
const [tasks, setTasks] = useState([]);



const fetchTasks = async () => {
  if (!selectedGroupId) return;

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`https://task-manager-backend-sge9.onrender.com/groups/${selectedGroupId}/tasks`, {
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
// Handle updating the task status
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
    console.log("Updating task status:", {
      taskId: selectedTask.id,
      groupId: groupId,
      newStatus: values.status,
      updatedBy: updatedBy
    });
    
    // Changed from PATCH to PUT method
    const response = await fetch(`https://task-manager-backend-sge9.onrender.com/groups/${groupId}/tasks/${selectedTask.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: values.status,
        updatedBy,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Error al actualizar el estado de la tarea: ${response.status}`);
    }
    
    // Rest of the function remains the same...    // Create a success notification
    const successNotificationId = 'task-update-success';
    
    // Remove existing notification if present
    const existingNotification = document.getElementById(successNotificationId);
    if (existingNotification) {
      document.body.removeChild(existingNotification);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = successNotificationId;
    notification.style.position = 'fixed';
    notification.style.top = '50%';
    notification.style.left = '50%';
    notification.style.transform = 'translate(-50%, -50%)';
    notification.style.backgroundColor = 'white';
    notification.style.padding = '30px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '400px';
    notification.style.textAlign = 'center';
    
    // Content for notification
    notification.innerHTML = `
      <div style="margin-bottom: 20px; color: #52c41a; font-size: 48px;">✓</div>
      <h2 style="margin-bottom: 15px; color: #52c41a; font-size: 24px;">¡TAREA ACTUALIZADA!</h2>
      <p style="margin-bottom: 20px; font-size: 16px;">El estado de la tarea ha sido actualizado correctamente.</p>
      <div style="background-color: #f6ffed; border: 1px solid #b7eb8f; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0; color: #52c41a;">Nuevo estado: ${values.status}</p>
      </div>
      <button id="close-success-notification" style="background-color: #52c41a; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">Entendido</button>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9998';
    document.body.appendChild(overlay);
    
    // Configure close button
    setTimeout(() => {
      const closeButton = document.getElementById('close-success-notification');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          document.body.removeChild(notification);
          document.body.removeChild(overlay);
        });
      }
    }, 100);
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 5000);

    // Update the task in the UI
    setSelectedTask((prevTask) => ({
      ...prevTask,
      status: values.status,
      updatedBy,
    }));

    // Refresh tasks and close modal
    fetchTasks();
    setTaskModalVisible(false);
    
    // Force refresh of groups to show updated task status
    setRefreshGroups(prev => !prev);
  } catch (error) {
    console.error("Error al actualizar el estado de la tarea:", error);
    message.error("No se pudo actualizar el estado de la tarea: " + error.message);
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
    const response = await fetch(`https://task-manager-backend-sge9.onrender.com/groups/${groupId}`, {
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

const handleDeleteTask = async (taskId, groupId) => {
  const token = localStorage.getItem("token");
  
  try {
    console.log("Deleting task:", taskId, "from group:", groupId);
    
    const response = await fetch(`https://task-manager-backend-sge9.onrender.com/groups/${groupId}/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al eliminar la tarea");
    }
    
    // Remove the task from the UI
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
    // Show success message
    message.success("Tarea eliminada correctamente");
    
    // Force refresh of groups to show updated task list
    setRefreshGroups(prev => !prev);
  } catch (error) {
    console.error("Error al eliminar la tarea:", error);
    message.error("No se pudo eliminar la tarea");
  }
};


const handleDeleteConfirmed = () => {
  // Llamar a la función para eliminar el grupo
  handleDeleteGroup(groupToDelete);

  // Cerrar el modal de confirmación
  setIsConfirmDeleteVisible(false);
};

// Nueva función para obtener los miembros de un grupo
const fetchGroupMembers = async (groupId, groupName) => {
  const token = localStorage.getItem("token");
  setLoading(true);
  
  try {
    console.log("Fetching members for group:", groupId, "with name:", groupName);
    
    const response = await fetch(`https://task-manager-backend-sge9.onrender.com/groups/${groupId}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });
    
    console.log("Group members response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch group members:", errorText);
      console.error("Request details:", {
        groupId: groupId,
        endpoint: `https://task-manager-backend-sge9.onrender.com/groups/${groupId}/users`
      });
      throw new Error(`Error al obtener los miembros del grupo: ${response.status}`);
    }
    
    const members = await response.json();
    console.log("Group members received:", members);
    
    // Make sure we're setting the state correctly
    setGroupMembers(members);
    setSelectedGroupName(groupName);
    setViewMembersModalVisible(true);
  } catch (error) {
    console.error("Error al obtener los miembros del grupo:", error);
    message.error("No se pudieron obtener los miembros del grupo");
  } finally {
    setLoading(false);
  }
};

// Update the handleRemoveUserFromGroup function
const handleRemoveUserFromGroup = async (userId) => {
  const token = localStorage.getItem("token");
  setLoading(true);
  
  try {
    console.log("Attempting to remove user:", userId, "from group:", selectedGroupId);
    
    const response = await fetch(`https://task-manager-backend-sge9.onrender.com/groups/${selectedGroupId}/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });
    
    console.log("Remove user response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to remove user:", errorText);
      throw new Error(`Error al eliminar el usuario del grupo: ${response.status}`);
    }
    
    // Show success message
    message.success({
      content: "Usuario eliminado del grupo exitosamente",
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    });
    
    // Update the members list
    setGroupMembers(prevMembers => prevMembers.filter(member => member.id !== userId));
    
    // Force groups refresh
    setRefreshGroups(prev => !prev);
  } catch (error) {
    console.error("Error al eliminar el usuario del grupo:", error);
    message.error("No se pudo eliminar el usuario del grupo");
  } finally {
    setLoading(false);
  }
};

// Función para obtener el color del estado
const getStatusColor = (status) => {
  const statusMap = {
    'activo': 'green',
    'inactivo': 'red',
    'en_progreso': 'blue',
    'finalizado': 'purple',
    'pendiente': 'orange',
    'completada': 'green'
  };
  return statusMap[status.toLowerCase()] || 'default';
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
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <p>Cargando grupos...</p>
          </div>
        ) : (
          <List
            key={groups.length}
            bordered
            dataSource={groups}
            renderItem={(group) => (
              <List.Item style={{ transition: 'all 0.3s ease' }}>
                <div style={{ flex: 1 }}>
                  <Title level={4}>{group.name}</Title>
                  <Tag color={getStatusColor(group.status)}>
                    {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                  </Tag>
                </div>
                <Button
                  type="primary"
                  style={{ marginLeft: "10px", transition: 'all 0.2s ease' }}
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
                      style={{ marginLeft: "10px", transition: 'all 0.2s ease' }}
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setAssignTaskModalVisible(true);
                      }}
                    >
                      Asignar Tarea
                    </Button>

                    <Button
                      type="default"
                      icon={<UserAddOutlined />}
                      style={{ marginLeft: "10px", transition: 'all 0.2s ease' }}
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setSelectedUsers([]); // Reset selected users
                        setAddUserModalVisible(true);
                      }}
                    >
                      Agregar Usuarios
                    </Button>

                    <Button
                      type="default"
                      icon={<TeamOutlined />}
                      style={{ marginLeft: "10px", transition: 'all 0.2s ease' }}
                      onClick={() => {
                        console.log("Miembros button clicked for group:", group.id, group.name);
                        setSelectedGroupId(group.id);
                        fetchGroupMembers(group.id, group.name);
                      }}
                    >
                      Miembros
                    </Button>

                    <Button
                      type="danger"
                      icon={<DeleteOutlined />}
                      style={{ marginLeft: "10px", transition: 'all 0.2s ease' }}
                      onClick={() => {
                        setGroupToDelete(group.id);
                        setIsConfirmDeleteVisible(true);
                      }}
                    />
                  </>
                )}
              </List.Item>
            )}
          />
        )}

        {/* Modal para asignar tarea */}
        <Modal
            title="Asignar Tarea"
            open={assignTaskModalVisible}
            onCancel={() => setAssignTaskModalVisible(false)}
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
            <Button type="primary" htmlType="submit" loading={loading}>
              Asignar
            </Button>
          </Form>
        </Modal>

        {/* Modal para agregar usuario */}
        <Modal
          title={<><UserAddOutlined /> Agregar Usuarios al Grupo</>}
          open={addUserModalVisible}
          onCancel={() => {
            setAddUserModalVisible(false);
            setSelectedUsers([]);
          }}
          footer={[
            <Button key="cancel" onClick={() => {
              setAddUserModalVisible(false);
              setSelectedUsers([]);
            }}>
              Cancelar
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              onClick={handleAddUserToGroup}
              loading={loading}
              disabled={selectedUsers.length === 0}
            >
              Agregar
            </Button>
          ]}
        >
          <Form layout="vertical">
            <Form.Item 
              label="Selecciona Usuarios" 
              required
              validateStatus={selectedUsers.length === 0 ? "error" : "success"}
              help={selectedUsers.length === 0 ? "Por favor selecciona al menos un usuario" : null}
            >
              <Select
                mode="multiple"
                placeholder="Selecciona uno o más usuarios"
                onChange={(values) => setSelectedUsers(values)}
                value={selectedUsers}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children?.toLowerCase() ?? '').includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
              >
                {users.map((user) => (
                  <Select.Option key={user.id} value={user.id}>
                    {user.name || user.username}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal para crear grupo */}  
        <Modal
            title="Crear Nuevo Grupo"
            open={createGroupModalVisible}
            onCancel={() => {
              setCreateGroupModalVisible(false);
              groupForm.resetFields(); // Reset form when modal is closed
            }}
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
                        options={users.map(user => ({ value: user.id, label: user.username }))}
                    />
                </Form.Item>

                <Button type="primary" htmlType="submit" loading={loading}>
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
{/* Modal para ver las tareas */}
<Modal
  title="Tareas del Grupo"
  open={taskModalVisible}
  onCancel={() => setTaskModalVisible(false)}
  footer={[
    <Button key="close" onClick={() => setTaskModalVisible(false)}>
      Cerrar
    </Button>
  ]}
  width={800}
>
  {tasks.length > 0 ? (
    <>
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>Total de tareas: {tasks.length}</Title>
      </div>
      <List
        dataSource={tasks}
        renderItem={(task) => (
          <List.Item>
            <Card 
              style={{ width: '100%' }}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{task.title}</span>
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleDeleteTask(task.id, task.groupId)}
                  />
                </div>
              }
              extra={
                <Tag color={getStatusColor(task.status)}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Tag>
              }
            >
              <p><strong>Descripción:</strong> {task.description}</p>
              <p><strong>Fecha de Entrega:</strong> {task.dueDate}</p>
              {task.updatedBy && (
                <p><strong>Última actualización por:</strong> {task.updatedBy}</p>
              )}
              
              <Form
                onFinish={(values) => {
                  setSelectedTask(task);
                  handleUpdateTaskStatus({...values, taskId: task.id});
                }}
                initialValues={{ status: task.status }}
              >
                <Form.Item name="status" label="Estado">
                  <Select>
                    <Select.Option value="pendiente">Pendiente</Select.Option>
                    <Select.Option value="en progreso">En Progreso</Select.Option>
                    <Select.Option value="completada">Completada</Select.Option>
                  </Select>
                </Form.Item>

                <Button type="primary" htmlType="submit" loading={loading}>
                  Actualizar Estado
                </Button>
              </Form>
            </Card>
          </List.Item>
        )}
      />
    </>
  ) : (
    <Empty description="No hay tareas para mostrar" />
  )}
</Modal>

        {/* Modal para eliminar grupo */}
        <Modal
          title="Para confirmar..."
          open={isConfirmDeleteVisible}
          onCancel={() => setIsConfirmDeleteVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsConfirmDeleteVisible(false)}>
              Cancelar
            </Button>,
            <Button
              key="delete"
              type="primary"
              danger
              onClick={() => handleDeleteConfirmed()}
              loading={loading}
            >
              Eliminar
            </Button>,
          ]}
        >
          <p>¿Estás seguro de que deseas eliminar este grupo? Esta acción no se puede deshacer.</p>
        </Modal>

        {/* Modal para ver miembros del grupo */}
        <Modal
          title={<><TeamOutlined /> Miembros del Grupo: {selectedGroupName}</>}
          open={viewMembersModalVisible}
          onCancel={() => setViewMembersModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setViewMembersModalVisible(false)}>
              Cerrar
            </Button>
          ]}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
              <p>Cargando miembros...</p>
            </div>
          ) : (
            <List
              dataSource={groupMembers}
              renderItem={(member) => (
                <List.Item
                  actions={[
                    <Button 
                      type="text" 
                      danger 
                      icon={<UserDeleteOutlined />} 
                      onClick={() => handleRemoveUserFromGroup(member.id)}
                    >
                      Eliminar
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={member.name || member.username}
                    description={member.email}
                  />
                </List.Item>
              )}
              locale={{ emptyText: "No hay miembros en este grupo" }}
            />
          )}
        </Modal>
      </Card>
    </MainLayout>
  );
};

export default GroupsPage;