import React from 'react';
import { Form, Input, Checkbox, Select, Row, Col } from 'antd';

const { TextArea } = Input;

const ALLERGY_OPTIONS = ['Peanuts', 'Shellfish', 'Gluten', 'Dairy', 'Soy', 'Eggs', 'Other'];

interface AddGuestProps {
  index: number;
  isCreateMode?: boolean;
  guestData?: {
    guestId: number;
    guestName: string;
    allergies?: string[];
    allergiesOther?: string;
    extraNeeds?: string;
  };
}

export const AddGuest: React.FC<AddGuestProps> = ({ index, guestData, isCreateMode = false }) => {
  return (
    <>
      {/* Hidden field to store guestId */}
      <Form.Item
        name={['guests', index, 'guestId']}
        hidden
        initialValue={guestData?.guestId}
      >
        <Input type="hidden" />
      </Form.Item>

      {isCreateMode ? (
        <>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name={['guests', index, 'firstName']}
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input placeholder="First Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['guests', index, 'lastName']}
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name={['guests', index, 'gender']}
                label="Gender"
                rules={[{ required: true, message: 'Please select gender' }]}
              >
                <Select placeholder="Select gender">
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['guests', index, 'age']}
                label="Age"
                rules={[{ required: true, message: 'Please enter age' }]}
              >
                <Input type="number" min={0} placeholder="Age" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name={['guests', index, 'roomPreferences']}
            label="Room Preferences"
          >
            <Input placeholder="High floor, near elevator, etc." />
          </Form.Item>

          <Form.Item
            name={['guests', index, 'specialRequests']}
            label="Guest Special Requests"
          >
            <TextArea rows={2} placeholder="Guest-specific requests" />
          </Form.Item>

          <Form.Item
            name={['guests', index, 'allergiesOther']}
            label="Allergies (Other)"
          >
            <Input placeholder="None or additional allergy notes" />
          </Form.Item>

          <Form.Item
            name={['guests', index, 'roomId']}
            hidden
          >
            <Input type="hidden" />
          </Form.Item>
        </>
      ) : (
        <Form.Item
          name={['guests', index, 'guestName']}
          label="Guest Name"
          rules={[{ required: true, message: 'Please enter guest name' }]}
        >
          <Input placeholder="Guest Name" disabled={!!guestData?.guestName} />
        </Form.Item>
      )}

      <Form.Item
        name={['guests', index, 'allergies']}
        label="Allergies"
      >
        <Checkbox.Group>
          <Row>
            {ALLERGY_OPTIONS.map(option => (
              <Col span={8} key={option}>
                <Checkbox value={option} style={{ lineHeight: '32px' }}>
                  {option}
                </Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => {
          const prev = prevValues.guests?.[index]?.allergies;
          const curr = currentValues.guests?.[index]?.allergies;
          return prev !== curr;
        }}
      >
        {({ getFieldValue }) => {
          const allergies = getFieldValue(['guests', index, 'allergies']) || [];
          return allergies.includes('Other') ? (
            <Form.Item
              name={['guests', index, 'allergiesOther']}
              label="Please specify (Type and press Enter)"
              rules={[{ required: true, message: 'Please specify at least one' }]}
            >
              <Select mode="tags" placeholder="E.g., Strawberries" style={{ width: '100%' }} tokenSeparators={[',']} />
            </Form.Item>
          ) : null;
        }}
      </Form.Item>
      
      <Form.Item
        name={['guests', index, 'extraNeeds']}
        label="Extra Needs"
      >
        <TextArea rows={2} placeholder="Accessibility requirements, etc." />
      </Form.Item>
    </>
  );
};