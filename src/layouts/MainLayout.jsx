import React from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;

const MainLayout = ({ children }) => {
  const location = useLocation(); // 📌 Obtiene la ruta actual

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
          {/* 📌 Dashboard con menú desplegable */}
          <SubMenu
            key="sub1"
            title={
              <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>
                Dashboard
              </Link>
            }
            style={{ marginBottom: "10px" }}
          >
            <Menu.Item key="/menu">
              <Link to="/menu">Menu</Link>
            </Menu.Item>
            <Menu.Item key="/option1">
              <Link to="/option1">Opción 1</Link>
            </Menu.Item>
            <Menu.Item key="/option2">
              <Link to="/option2">Opción 2</Link>
            </Menu.Item>
          </SubMenu>

          <Menu.Item key="/Task" style={{ marginBottom: "10px" }}>
            <Link to="/Task">Tasks</Link>
          </Menu.Item>
          <Menu.Item key="/profile" style={{ marginBottom: "10px" }}>
            <Link to="/profile">Profile</Link>
          </Menu.Item>
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
