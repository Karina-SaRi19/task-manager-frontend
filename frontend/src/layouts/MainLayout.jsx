import React from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Header, Content, Sider } = Layout;

const MainLayout = ({ children }) => {
  const location = useLocation(); // 📌 Obtiene la ruta actual
  const userRole = localStorage.getItem("userRole"); // 📌 Obtiene el rol del usuario

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={250}
        style={{
          background: "linear-gradient(90deg, rgba(135,35,65,1) 19%, rgba(225,149,171,1) 100%)",
        }}
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]} // 📌 Hace que la selección cambie dinámicamente
          style={{
            background: "linear-gradient(90deg, rgba(135,35,65,1) 19%, rgba(225,149,171,1) 100%)",
          }}
        >
          {/* 📌 Dashboard como un solo item */}
          <Menu.Item key="/dashboard" style={{ marginBottom: "10px" }}>
            <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>
              Dashboard
            </Link>
          </Menu.Item>

          {/* 📌 Opciones específicas según el rol */}
          {(userRole === "2" || userRole === "1") && (
            <>
              <Menu.Item key="/Task" style={{ marginBottom: "10px" }}>
                <Link to="/Task">Tasks</Link>
              </Menu.Item>
              <Menu.Item key="/groups" style={{ marginBottom: "10px" }}>
                <Link to="/groups">Groups</Link>
              </Menu.Item>
            </>
          )}

          {userRole === "3" && (
            <Menu.Item key="/users" style={{ marginBottom: "10px" }}>
              <Link to="/users">Users</Link>
            </Menu.Item>
          )}

          <Menu.Item key="/login" style={{ marginBottom: "10px" }}>
            <Link to="/login">Cerrar Sesión</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: "#A35C7A", padding: 0 }} />
        <Content style={{ margin: "16px" }}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
