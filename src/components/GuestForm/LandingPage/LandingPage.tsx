import React, { useState } from 'react';
import { Layout, Typography, Row, Col, Card, Modal, Input, message, Table, Button } from 'antd';
import { CalendarOutlined, PlusOutlined, EditOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
  const [isReservationListModalVisible, setIsReservationListModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCreateReservation = async () => {
     sessionStorage.setItem('isAdminSession', 'true');
     navigate('/reservations/create');
  };

  const handleUpdateReservation = () => {
    setIsPhoneModalVisible(true);
  };

  const handlePhoneModalOk = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      message.warning('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    try {
      // First, get customer by phone number
      const customerResponse = await fetch(`http://localhost:8080/api/customers/phone/${encodeURIComponent(phoneNumber)}`);
      
      if (!customerResponse.ok) {
        if (customerResponse.status === 404) {
          message.info('No customer found with this phone number');
        } else {
          message.error('Failed to fetch customer information');
        }
        setLoading(false);
        return;
      }

      const customer = await customerResponse.json();
      
      // Then get reservations for this customer
      const reservationsResponse = await fetch(`http://localhost:8080/api/reservations/customer/${customer.id}`);
      
      if (!reservationsResponse.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data = await reservationsResponse.json();
      
      if (!data || data.length === 0) {
        message.info('No reservations found for this customer');
        setLoading(false);
        return;
      }

      // Add phone number to each reservation for display
      const reservationsWithPhone = data.map((res: any) => ({
        ...res,
        phoneNumber: customer.phoneNumber
      }));

      setReservations(reservationsWithPhone);
      setIsPhoneModalVisible(false);
      setIsReservationListModalVisible(true);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      message.error('Failed to fetch reservations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneModalCancel = () => {
    setIsPhoneModalVisible(false);
    setPhoneNumber('');
  };

  const handleReservationListModalCancel = () => {
    setIsReservationListModalVisible(false);
    setReservations([]);
    setPhoneNumber('');
  };

  const handleSelectReservation = (reservationId: string) => {
    // Store admin flag in sessionStorage (cleared when browser closes)
    sessionStorage.setItem('isAdminSession', 'true');
    navigate(`/guest-form/${reservationId}`);
    setIsReservationListModalVisible(false);
    setReservations([]);
    setPhoneNumber('');
  };

  const columns = [
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Reservation Number',
      dataIndex: 'reservationNumber',
      key: 'reservationNumber',
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Reservation Date',
      dataIndex: 'bookedDate',
      key: 'bookedDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          type="primary" 
          onClick={() => handleSelectReservation(record.reservationNumber)}
          style={{ backgroundColor: '#52a49a', borderColor: '#52a49a' }}
        >
          Select
        </Button>
      ),
    },
  ];

  return (
    <Layout className="landing-layout">
      <Header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-text">Reservation Admin Panel</span>
          </div>
        </div>
      </Header>

      <Content className="landing-content">
        <div className="hero-section">
          <div className="hero-text">
            <Title level={1} className="hero-title">
              Welcome!
            </Title>
            <Title level={2} className="hero-subtitle">
              Manage your Reservation
            </Title>
            <Text className="hero-description">
              Create new reservations or update existing ones with ease
            </Text>
          </div>
        </div>

        <Row gutter={[48, 48]} className="cards-section">
          <Col xs={24} sm={24} md={12} lg={12}>
            <Card 
              className="action-card new-reservation-card"
              onClick={handleCreateReservation}
              hoverable
            >
              <div className="card-icon new-icon">
                <CalendarOutlined className="calendar-icon" />
                <PlusOutlined className="plus-icon" />
              </div>
              <Title level={3} className="card-title">New Reservation</Title>
            </Card>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12}>
            <Card 
              className="action-card existing-reservation-card"
              onClick={handleUpdateReservation}
              hoverable
            >
              <div className="card-icon existing-icon">
                <CalendarOutlined className="calendar-icon" />
                <EditOutlined className="edit-icon" />
              </div>
              <Title level={3} className="card-title">Existing Reservation</Title>
            </Card>
          </Col>
        </Row>
      </Content>

      <Footer className="landing-footer">
        <div className="footer-content">
          <a href="#faq">FAQ</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </div>
      </Footer>

      {/* Phone Number Modal */}
      <Modal
        title={
          <span>
            <PhoneOutlined style={{ marginRight: 8, color: '#52a49a' }} />
            Enter Phone Number
          </span>
        }
        open={isPhoneModalVisible}
        onOk={handlePhoneModalOk}
        onCancel={handlePhoneModalCancel}
        okText="Search"
        cancelText="Cancel"
        confirmLoading={loading}
        okButtonProps={{
          style: { backgroundColor: '#52a49a', borderColor: '#52a49a' }
        }}
      >
        <Input
          prefix={<PhoneOutlined />}
          placeholder="Enter customer phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
          onPressEnter={handlePhoneModalOk}
          maxLength={10}
          inputMode="numeric"
          size="large"
          style={{ marginTop: 16 }}
        />
      </Modal>

      {/* Reservations List Modal */}
      <Modal
        title="Select a Reservation"
        open={isReservationListModalVisible}
        onCancel={handleReservationListModalCancel}
        footer={null}
        width={900}
      >
        <Table
          columns={columns}
          dataSource={reservations}
          rowKey="reservationNumber"
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </Layout>
  );
};

export default LandingPage;