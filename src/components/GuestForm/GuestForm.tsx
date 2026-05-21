import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Select, Button, Card, Typography, Collapse, Row, Col, message, Modal, Space } from 'antd';
import { ArrowUpOutlined, SaveOutlined, DeleteOutlined, MailOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { AddGuest } from './AddGuest';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

const ROOM_HIERARCHY = ['standard', 'family', 'deluxe', 'suite'];
const ROOM_PRICES = {
  standard: 100,
  family: 150,
  deluxe: 200,
  suite: 350
};

const ROOM_LABELS = {
  standard: 'Standard Room',
  family: 'Family Room',
  deluxe: 'Deluxe Room',
  suite: 'Suite'
};

const ROOM_TYPE_TO_ID = {
  standard: 3,
  family: 1,
  deluxe: 4,
  suite: 2
};

interface GuestFormProps {
  requestId: string;
  reservationData: any;
}

export const GuestForm = ({ requestId, reservationData }: GuestFormProps) => { 
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [guests, setGuests] = useState<{ id: number; key: string; data?: any }[]>([]);
  const [loading, setLoading] = useState(false);
  const [originalRoomType, setOriginalRoomType] = useState<string>('');
  const [roomId, setRoomId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const isCreateMode = !reservationData;
  
  useEffect(() => {
    const adminSession = sessionStorage.getItem('isAdminSession');
    setIsAdmin(adminSession === 'true');
    
    console.log('User type:', adminSession === 'true' ? 'Admin' : 'Customer');
  }, []);

  useEffect(() => {
    if (reservationData) {
      console.log('Populating form with reservation data:', reservationData);
      
      //original room type
      const roomType = reservationData.roomType?.toLowerCase() || '';
      setOriginalRoomType(roomType);
      
      if (reservationData.roomId) {
        setRoomId(reservationData.roomId);
        console.log('Room ID from reservation data:', reservationData.roomId);
      } else if (roomType && ROOM_TYPE_TO_ID[roomType as keyof typeof ROOM_TYPE_TO_ID]) {
        const derivedRoomId = ROOM_TYPE_TO_ID[roomType as keyof typeof ROOM_TYPE_TO_ID];
        setRoomId(derivedRoomId);
        console.log('Room ID derived from room type:', derivedRoomId, 'for type:', roomType);
      }

      const firstGuest = reservationData.guestDetails?.[0];
      form.setFieldsValue({
        arrivalTime: firstGuest?.expectedArrival ? dayjs(firstGuest.expectedArrival) : null,
        roomType: firstGuest?.roomPreferences || roomType,
        specialRequests: firstGuest?.specialRequests,
      });


      if (reservationData.guestDetails && reservationData.guestDetails.length > 0) {
        const guestsList = reservationData.guestDetails.map((guestDetail: any, index: number) => ({
          id: guestDetail.guestId,
          key: `guest-${guestDetail.guestId}`,
          data: guestDetail
        }));
        setGuests(guestsList);

       
        const guestsData = reservationData.guestDetails.map((guestDetail: any) => ({
          guestId: guestDetail.guestId,
          guestName: guestDetail.guestName,
          allergies: guestDetail.allergies || [],
          allergiesOther: guestDetail.allergiesOther ? guestDetail.allergiesOther.split(', ') : [],
          extraNeeds: guestDetail.extraNeeds || ''
        }));
        
        form.setFieldsValue({ guests: guestsData });
      }
    } else {
      setGuests([{ id: 1, key: 'guest-1' }]);
      form.setFieldsValue({
        guests: [{
          guestId: null,
          firstName: '',
          lastName: '',
          gender: null,
          age: null,
          roomPreferences: '',
          specialRequests: '',
          roomId: null,
          allergies: [],
          extraNeeds: ''
        }]
      });
    }
  }, [reservationData, form]);

  const canUpgrade = () => {
    const selectedRoomType = form.getFieldValue('roomType');
    if (!selectedRoomType || !originalRoomType) return false;
    
    const originalIndex = ROOM_HIERARCHY.indexOf(originalRoomType);
    const selectedIndex = ROOM_HIERARCHY.indexOf(selectedRoomType);
    
    return selectedIndex > originalIndex;
  };

  const handleUpgrade = () => {
    const selectedRoomType = form.getFieldValue('roomType');
    
    if (!selectedRoomType || !originalRoomType) {
      message.error('Please select a room type first!');
      return;
    }

    const originalIndex = ROOM_HIERARCHY.indexOf(originalRoomType);
    const selectedIndex = ROOM_HIERARCHY.indexOf(selectedRoomType);
    
    if (selectedIndex <= originalIndex) {
      message.warning('Please select a higher room type to upgrade!');
      return;
    }

    const originalPrice = ROOM_PRICES[originalRoomType as keyof typeof ROOM_PRICES];
    const selectedPrice = ROOM_PRICES[selectedRoomType as keyof typeof ROOM_PRICES];
    const extraCost = selectedPrice - originalPrice;

    Modal.confirm({
      title: 'Upgrade Room',
      content: (
        <div>
          <p>You are upgrading from <strong>{ROOM_LABELS[originalRoomType as keyof typeof ROOM_LABELS]}</strong> to <strong>{ROOM_LABELS[selectedRoomType as keyof typeof ROOM_LABELS]}</strong>.</p>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#d500f9', marginTop: '16px' }}>
            Extra Cost: ${extraCost}
          </p>
        </div>
      ),
      okText: 'Accept',
      cancelText: 'Decline',
      okButtonProps: {
        style: { backgroundColor: '#d500f9', borderColor: '#d500f9' }
      },      
            onOk: () => {
              const newRoomId = ROOM_TYPE_TO_ID[selectedRoomType as keyof typeof ROOM_TYPE_TO_ID];
              
              setOriginalRoomType(selectedRoomType);
              setRoomId(newRoomId);
              
              console.log(`Room upgraded! New room ID: ${newRoomId}, New room type: ${selectedRoomType}`);
              message.success(`Room upgraded to ${ROOM_LABELS[selectedRoomType as keyof typeof ROOM_LABELS]}! Click "Save All Preferences" to confirm.`);
            },
      
      onCancel: () => {
        // Reset to original room type if declined
        form.setFieldsValue({ roomType: originalRoomType });
        message.info('Room upgrade cancelled');
      }
    });
  };

  const removeGuest = (index: number) => {
    if (guests.length <= 1) {
      message.warning('At least one guest is required');
      return;
    }

    const currentGuests = form.getFieldValue('guests') || [];
    const updatedGuests = [...guests];
    updatedGuests.splice(index, 1);
    setGuests(updatedGuests);

    currentGuests.splice(index, 1);
    form.setFieldsValue({ guests: currentGuests });
    
    message.success('Guest removed');
  };

  const handleAddGuest = () => {
    const currentGuests = form.getFieldValue('guests') || [];
    const guestId = Date.now();

    setGuests((prevGuests) => [...prevGuests, { id: guestId, key: `guest-${guestId}` }]);
    form.setFieldsValue({
      guests: [
        ...currentGuests,
        {
          guestId: null,
          firstName: '',
          lastName: '',
          gender: null,
          age: null,
          roomPreferences: '',
          specialRequests: '',
          roomId: null,
          allergies: [],
          extraNeeds: ''
        }
      ]
    });
  };

  const handleSave = (sendEmail: boolean = true) => {
    form.validateFields().then(async (values) => {
      const createPayload = {
        email: values.email || null,
        firstName: values.firstName || null,
        lastName: values.lastName || null,
        phoneNumber: values.phoneNumber || null,
        arrivalDate: values.arrivalTime ? values.arrivalTime.format('YYYY-MM-DDTHH:mm:ss') : null,
        roomType: values.roomType ? values.roomType.toUpperCase() : null,
        specialRequests: values.specialRequests || null,
        guests: values.guests ? values.guests.map((g: any) => ({
          firstName: g.firstName || null,
          lastName: g.lastName || null,
          gender: g.gender || null,
          age: typeof g.age === 'number' ? g.age : (g.age ? Number(g.age) : null),
          roomId: g.roomId || roomId,
          expectedArrival: values.arrivalTime ? values.arrivalTime.format('YYYY-MM-DDTHH:mm') : null,
          allergies: g.allergies || [],
          allergiesOther: Array.isArray(g.allergiesOther) ? g.allergiesOther.join(', ') : (g.allergiesOther || null),
          roomPreferences: g.roomPreferences || null,
          extraNeeds: g.extraNeeds || null,
          specialRequests: g.specialRequests || values.specialRequests || null
        })) : [],
        sendEmail,
        isAdminUpdate: false
      };

      const updatePayload = {
        roomType: values.roomType ? values.roomType.toUpperCase() : null,
        specialRequests: values.specialRequests || null,
        expectedArrival: values.arrivalTime ? values.arrivalTime.format('YYYY-MM-DDTHH:mm:ss') : null,
        guests: values.guests ? values.guests.map((g: any) => ({
          guestId: g.guestId,
          expectedArrival: values.arrivalTime ? values.arrivalTime.format('YYYY-MM-DDTHH:mm:ss') : null,
          specialRequests: g.specialRequests || values.specialRequests || null,
          roomPreferences: g.roomPreferences || null,
          roomId: roomId,
          allergies: g.allergies || [],
          allergiesOther: Array.isArray(g.allergiesOther) ? g.allergiesOther.join(', ') : g.allergiesOther,
          extraNeeds: g.extraNeeds || null
        })) : [],
        sendEmail,
        isAdminUpdate: isAdmin
      };

      const formDataToSend = isCreateMode ? createPayload : updatePayload;
      const endpoint = isCreateMode ? 'http://localhost:8080/api/reservations' : 'http://localhost:8080/guest-detail';
      
      console.log('=== SAVING FORM DATA ===');
      console.log('User type:', isAdmin ? 'Admin' : 'Customer');
      console.log('Send email:', sendEmail);
      console.log('Is admin update:', isAdmin);
      console.log('Selected Room Type:', values.roomType);
      console.log('Room ID being sent:', roomId);
      console.log('Full payload:', formDataToSend);
      console.log('======================');
      
      try {
        setLoading(true);
        const response = await axios.post(endpoint, formDataToSend);
        
        console.log('Server response:', response.data);
        
        // Show appropriate success message
        if (isCreateMode) {
          const createdRequestId = typeof response.data === 'string' ? response.data : response.data?.requestId;
          message.success(createdRequestId ? `Reservation created: ${createdRequestId}` : 'Reservation created and customer notified!');
        } else if (isAdmin && sendEmail) {
          message.success('Reservation saved and customer notified!');
        } else if (isAdmin && !sendEmail) {
          message.success('Reservation saved successfully!');
        } else {
          message.success('Reservation saved! Check your email for confirmation.');
        }
        
        setTimeout(() => {
          if (isCreateMode || isAdmin) {
            navigate('/');
          } else {
            window.location.reload();
          }
        }, 1500);
      } catch (error: any) {
        console.error('Error saving reservation:', error);
        const backendMessage = error?.response?.data?.message || error?.response?.data || error?.message;
        message.error(backendMessage ? `Failed to save reservation: ${backendMessage}` : 'Failed to save reservation. Please try again.');
      } finally {
        setLoading(false);
      }
      
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const genExtra = (id: number, index: number) => (
    <DeleteOutlined 
      onClick={(event) => {
        event.stopPropagation();
        removeGuest(index);
      }}
      style={{ color: '#ff4d4f' }}
    />
  );

  const disablePastAndTodayDates = (current: dayjs.Dayjs) => {
    return current && current < dayjs().endOf('day');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f7f7f7',
        padding: '24px 16px'
      }}
    >
    <Card
      style={{ 
        maxWidth: 600, 
        margin: '0 auto', 
        borderRadius: 12, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#FFFFFF'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
          Grand Hotel
        </Text>
        <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
          {isCreateMode ? 'Create Reservation' : 'Welcome!'}
        </Title>
        <Text type="secondary">
          {isCreateMode ? 'Fill out reservation details' : 'Customize Your Upcoming Stay'}
        </Text>
      </div>

      {reservationData && (
        <Card 
          type="inner" 
          title="Reservation Details" 
          style={{ marginBottom: 24, backgroundColor: '#FFFFFF' }}
        >
          <Row gutter={[16, 12]}>
            <Col span={24}>
              <Text strong>Guest Name: </Text>
              <Text>{reservationData.guestName}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Reservation ID: </Text>
              <Text>{requestId}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Number of Guests: </Text>
              <Text>{reservationData.numberOfGuests}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Check-in Date: </Text>
              <Text>{reservationData.checkInDate}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Original Room Type: </Text>
              <Text>{ROOM_LABELS[originalRoomType as keyof typeof ROOM_LABELS] || originalRoomType}</Text>
            </Col>
          </Row>
        </Card>
      )}

      <Form
        form={form}
        layout="vertical"
        name="reservation_form"
      >
        {isCreateMode && (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: 'Please enter first name!' }]}
                >
                  <Input placeholder="Enter first name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please enter last name!' }]}
                >
                  <Input placeholder="Enter last name" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please enter phone number!' },
                { pattern: /^\d{10}$/, message: 'Phone number must be exactly 10 digits' }
              ]}
            >
              <Input
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                inputMode="numeric"
                onChange={(e) => form.setFieldValue('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email address!' },
                { type: 'email', message: 'Please enter a valid email address!' }
              ]}
            >
              <Input placeholder="Enter customer email" />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="arrivalTime"
          label="Estimated Arrival Time"
          rules={[
            { required: true, message: 'Please select your expected arrival time!' },
            {
              validator: (_, value) => {
                if (!value || value.isAfter(dayjs().endOf('day'))) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Please select a date after today'));
              }
            }
          ]}
        >
          <DatePicker
            showTime
            format="MM/DD/YYYY HH:mm"
            style={{ width: '100%' }}
            disabledDate={disablePastAndTodayDates}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={isCreateMode ? 24 : 16}>
            <Form.Item
              name="roomType"
              label="Room Type"
              rules={[{ required: true, message: 'Please select room type!' }]}
            >
              <Select 
                placeholder="Select room type to upgrade..."
                onChange={(value) => {
                  // Update room ID when room type changes
                  const newRoomId = ROOM_TYPE_TO_ID[value as keyof typeof ROOM_TYPE_TO_ID];
                  setRoomId(newRoomId);
                  console.log('Room type changed to:', value, 'Room ID updated to:', newRoomId);
                  // Trigger re-render to update button state
                  form.validateFields(['roomType']);
                }}
              >
                <Option value="standard">Standard Room ($100)</Option>
                <Option value="family">Family Room ($150)</Option>
                <Option value="deluxe">Deluxe Room ($200)</Option>
                <Option value="suite">Suite ($350)</Option>
              </Select>
            </Form.Item>
          </Col>
          {!isCreateMode && (
            <Col span={8}>
              <Form.Item 
                label=" "
                shouldUpdate={(prevValues, currentValues) => prevValues.roomType !== currentValues.roomType}
              >
                {() => (
                  <Button 
                    type="primary"
                    onClick={handleUpgrade}
                    block
                    style={{ 
                      height: 32,
                      backgroundColor: canUpgrade() ? '#f7f5f1' : undefined,
                      borderColor: canUpgrade() ? '#f3f1ed' : undefined
                    }}
                    icon={<ArrowUpOutlined />}
                    disabled={!canUpgrade()}
                  >
                    Upgrade
                  </Button>
                )}
              </Form.Item>
            </Col>
          )}
        </Row>

        <Form.Item
          name="specialRequests"
          label="Special Requests"
        >
          <TextArea rows={3} placeholder="Towels, pillows, etc." />
        </Form.Item>

        {isCreateMode && (
          <Form.Item>
            <Button
              type="dashed"
              onClick={handleAddGuest}
              block
              icon={<PlusOutlined />}
            >
              Add another guest
            </Button>
          </Form.Item>
        )}

        {guests.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Collapse accordion defaultActiveKey={['guest-1']}>
              {guests.map((guest, index) => (
                <Panel 
                  header={guest.data ? `${guest.data.guestName}` : `Guest ${index + 1}`} 
                  key={guest.key} 
                  extra={genExtra(guest.id, index)}
                >
                  <AddGuest index={index} guestData={guest.data} isCreateMode={isCreateMode} />
                </Panel>
              ))}
            </Collapse>
          </div>
        )}

        <Form.Item>
          {isCreateMode ? (
            <Button
              type="primary"
              onClick={() => handleSave(true)}
              loading={loading}
              block
              style={{
                backgroundColor: '#FF6F00',
                borderColor: '#FF6F00',
                height: 40,
                fontWeight: 600
              }}
              icon={<MailOutlined />}
            >
              Save & Notify
            </Button>
          ) : isAdmin ? (
            // ADMIN sees TWO buttons
            <Space direction="horizontal" size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button 
                type="default"
                onClick={() => handleSave(false)}
                loading={loading}
                block
                style={{ 
                  backgroundColor: '#26A69A', 
                  borderColor: '#26A69A',
                  color: 'white',
                  height: 40,
                  fontWeight: 600,
                  flex: 1
                }}
                icon={<SaveOutlined />}
              >
                Save
              </Button>
              <Button 
                type="primary"
                onClick={() => handleSave(true)}
                loading={loading}
                block
                style={{ 
                  backgroundColor: '#FF6F00', 
                  borderColor: '#FF6F00',
                  height: 40,
                  fontWeight: 600,
                  flex: 1
                }}
                icon={<MailOutlined />}
              >
                Save & Notify
              </Button>
            </Space>
          ) : (
            // CUSTOMER sees ONE button (always sends email)
            <Button 
              type="primary" 
              onClick={() => handleSave(true)}
              loading={loading}
              block
              style={{ 
                backgroundColor: '#FF9800', 
                borderColor: '#FF9800',
                height: 40,
                fontWeight: 600
              }}
              icon={<SaveOutlined />}
            >
              Save
            </Button>
          )}
        </Form.Item>
      </Form>
    </Card>
    </div>
  );
};