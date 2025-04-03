import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Typography, Tag, Button, Spin, Empty, Form, Select, 
  Row, Col, Divider, message, Statistic, Avatar, Tooltip, Badge
} from 'antd';
import { 
  ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  ExclamationCircleOutlined, UserOutlined, CalendarOutlined,
  FileTextOutlined, TeamOutlined
} from '@ant-design/icons';
import MainLayout from '../../layouts/MainLayout';

const { Title, Text, Paragraph } = Typography;

const GroupTaskIndividual = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0
  });

  // Add console logs to debug
  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      console.log("GroupTaskIndividual - groupId:", groupId); // Debug log
      
      if (!token || !groupId) {
        message.error("No se pudo obtener la información necesaria");
        navigate('/groups');
        return;
      }
  
      try {
        setLoading(true);
        
        // Fetch group info
        console.log("Fetching group info for groupId:", groupId); // Debug log
        const groupResponse = await fetch(`https://task-manager-backend-sge9.onrender.com/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!groupResponse.ok) {
          throw new Error("Error al obtener información del grupo");
        }
        
        const groupData = await groupResponse.json();
        setGroupInfo(groupData);
        
        // Fetch tasks
        const tasksResponse = await fetch(`https://task-manager-backend-sge9.onrender.com/groups/${groupId}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!tasksResponse.ok) {
          throw new Error("Error al obtener las tareas");
        }

        const tasksData = await tasksResponse.json();
        
        // Format tasks with proper date formatting
        const formattedTasks = tasksData.map(task => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate._seconds * 1000).toLocaleDateString() : "No definida",
          groupId: groupId
        }));
        
        setTasks(formattedTasks);
        
        // Calculate task statistics
        const stats = {
          total: formattedTasks.length,
          completed: formattedTasks.filter(task => task.status === 'completada').length,
          inProgress: formattedTasks.filter(task => task.status === 'en progreso').length,
          pending: formattedTasks.filter(task => task.status === 'pendiente').length
        };
        
        setTaskStats(stats);
      } catch (error) {
        console.error("Error al obtener las tareas:", error);
        message.error("No se pudieron obtener las tareas del grupo");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [groupId, navigate]);

  // Handle updating the task status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const token = localStorage.getItem("token");
    
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const updatedBy = decodedToken.username;
      
      const response = await fetch(`https://task-manager-backend-sge9.onrender.com/groups/${groupId}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          updatedBy,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar el estado de la tarea: ${response.status}`);
      }

      // Update the task in the UI
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus, updatedBy } 
            : task
        )
      );
      
      // Update statistics
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      
      const stats = {
        total: updatedTasks.length,
        completed: updatedTasks.filter(task => task.status === 'completada').length,
        inProgress: updatedTasks.filter(task => task.status === 'en progreso').length,
        pending: updatedTasks.filter(task => task.status === 'pendiente').length
      };
      
      setTaskStats(stats);
      
      message.success("Estado de la tarea actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el estado de la tarea:", error);
      message.error("No se pudo actualizar el estado de la tarea");
    }
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch(status) {
      case 'completada':
        return { 
          icon: <CheckCircleOutlined />, 
          color: 'success',
          text: 'Completada'
        };
      case 'en progreso':
        return { 
          icon: <ClockCircleOutlined />, 
          color: 'processing',
          text: 'En Progreso'
        };
      case 'pendiente':
      default:
        return { 
          icon: <ExclamationCircleOutlined />, 
          color: 'warning',
          text: 'Pendiente'
        };
    }
  };

  // Add this at the top of your component, outside any useEffect
  console.log("Component rendering with params:", useParams());
  
  // And modify your return statement to show debugging info
  return (
    <MainLayout>
      <div style={{ padding: '20px' }}>
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/groups')}
          style={{ marginBottom: 20 }}
        >
          Volver a Grupos
        </Button>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p>Cargando tareas...</p>
          </div>
        ) : (
          <>
            {/* Group Header */}
            <Card 
              style={{ 
                marginBottom: 24, 
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              <Row gutter={24} align="middle">
                <Col xs={24} md={16}>
                  <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    {groupInfo?.name || 'Grupo'}
                  </Title>
                  <Tag color={groupInfo?.status === 'activo' ? 'green' : 'red'} style={{ margin: '8px 0' }}>
                    {groupInfo?.status === 'activo' ? 'Activo' : 'Inactivo'}
                  </Tag>
                  <Paragraph>
                    <TeamOutlined /> {groupInfo?.members?.length || 0} miembros
                  </Paragraph>
                </Col>
                <Col xs={24} md={8}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic 
                        title="Total" 
                        value={taskStats.total} 
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic 
                        title="Completadas" 
                        value={taskStats.completed} 
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic 
                        title="Pendientes" 
                        value={taskStats.pending + taskStats.inProgress} 
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>

            {/* Tasks List */}
            {tasks.length > 0 ? (
              <Row gutter={[16, 16]}>
                {tasks.map(task => {
                  const statusInfo = getStatusInfo(task.status);
                  
                  return (
                    <Col xs={24} sm={12} lg={8} key={task.id}>
                      <Badge.Ribbon text={statusInfo.text} color={statusInfo.color === 'success' ? 'green' : statusInfo.color === 'processing' ? 'blue' : 'orange'}>
                        <Card
                          hoverable
                          style={{ 
                            height: '100%',
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                        >
                          <div style={{ flex: 1 }}>
                            <Title level={4} style={{ color: '#1890ff', marginTop: 0 }}>
                              {task.title}
                            </Title>
                            
                            <Paragraph ellipsis={{ rows: 3 }} style={{ marginBottom: 16 }}>
                              <FileTextOutlined style={{ marginRight: 8 }} />
                              {task.description}
                            </Paragraph>
                            
                            <div style={{ marginBottom: 8 }}>
                              <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                              <Text type="secondary">Fecha límite: {task.dueDate}</Text>
                            </div>
                            
                            <div style={{ marginBottom: 16 }}>
                              <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                              <Text type="secondary">Asignado a: {task.assignedTo}</Text>
                            </div>
                            
                            {task.updatedBy && (
                              <div style={{ marginBottom: 16 }}>
                                <Tooltip title="Última actualización por">
                                  <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8, backgroundColor: '#1890ff' }} />
                                  <Text type="secondary">{task.updatedBy}</Text>
                                </Tooltip>
                              </div>
                            )}
                          </div>
                          
                          <Divider style={{ margin: '12px 0' }} />
                          
                          <Form layout="vertical" style={{ marginBottom: 0 }}>
                            <Form.Item label="Cambiar estado:" style={{ marginBottom: 0 }}>
                              <Select
                                defaultValue={task.status}
                                style={{ width: '100%' }}
                                onChange={(value) => handleUpdateTaskStatus(task.id, value)}
                              >
                                <Select.Option value="pendiente">Pendiente</Select.Option>
                                <Select.Option value="en progreso">En Progreso</Select.Option>
                                <Select.Option value="completada">Completada</Select.Option>
                              </Select>
                            </Form.Item>
                          </Form>
                        </Card>
                      </Badge.Ribbon>
                    </Col>
                  );
                })}
              </Row>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>No hay tareas asignadas a este grupo</span>
                }
              >
                <Button type="primary" onClick={() => navigate('/groups')}>
                  Volver a Grupos
                </Button>
              </Empty>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default GroupTaskIndividual;