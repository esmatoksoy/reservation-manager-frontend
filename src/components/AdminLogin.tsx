import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/admin/login', {
        username: values.username,
        password: values.password
      });

      // Status 200 means login succeeded
      // Store admin info securely
      sessionStorage.setItem('adminId', response.data.adminId);
      sessionStorage.setItem('adminRole', response.data.role);
      sessionStorage.setItem('isAdminSession', 'true');

      message.success('Login successful!');
      
      // Redirect to landing page (where admin can search reservations)
      navigate('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.response?.status === 401) {
        message.error('Invalid username or password');
      } else {
        message.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #fef5e7 0%, #fdebd0 50%, #fce4b6 100%)'
    }}>
      <Card style={{
        width: 400,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderRadius: 12
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>Admin Login</Title>
          <Typography.Text type="secondary">
            Enter your credentials to continue
          </Typography.Text>
        </div>

        <Form
          name="admin_login"
          onFinish={handleLogin}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                backgroundColor: '#079f62',
                borderColor: '#079f62',
                height: 48,
                fontWeight: 600
              }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminLogin;
