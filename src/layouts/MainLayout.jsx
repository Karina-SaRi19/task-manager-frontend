import React from "react";
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu; 

const MainLayout = ({ children }) => {
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
          defaultSelectedKeys={["1"]}
          style={{
            background: "linear-gradient(90deg, rgba(135,35,65,1) 19%, rgba(225,149,171,1) 100%)",
          }}
        >
          <SubMenu key="sub1" title="Dashboard" style={{ marginBottom: "10px" }}>
            <Menu.Item key="1">
              <Link to="/menu">Menu</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/option1">Opción 1</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/option2">Opción 2</Link>
            </Menu.Item>
          </SubMenu>

          <Menu.Item key="4" style={{ marginBottom: "10px" }}>
            <Link to="/tasks">Tasks</Link>
          </Menu.Item>
          <Menu.Item key="5" style={{ marginBottom: "10px" }}>
            <Link to="/profile">Profile</Link>
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
