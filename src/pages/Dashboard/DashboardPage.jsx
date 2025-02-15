import React from "react";
import { Card, Typography, Space } from "antd";
import MainLayout from "../../layouts/MainLayout";

const { Title, Paragraph } = Typography;

const DashboardPage = () => {
  return (
    <MainLayout>
      <Card style={{ width: "100%", maxWidth: 800, margin: "20px auto", padding: "20px" }}>
        <Typography>
          <Title level={2}>Dashboard</Title>
          <Paragraph>
            Bienvenido al panel de control.
          </Paragraph>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          </Space>
        </Typography>
      </Card>
    </MainLayout>
  );
};

export default DashboardPage;
