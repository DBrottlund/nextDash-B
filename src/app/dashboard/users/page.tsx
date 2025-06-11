'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

const { Title } = Typography;
const { Option } = Select;

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  emailVerified: boolean;
  isApproved: boolean;
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
  lastLogin?: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, searchText, roleFilter]);

  useEffect(() => {
    if (currentUser) {
      fetchRoles();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
      });

      if (searchText) params.append('search', searchText);
      if (roleFilter) params.append('role', roleFilter.toString());

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
        }));
      } else {
        message.error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Filter roles based on current user's permissions
        // Users can only assign roles with equal or lower permissions (higher or equal role_id)
        const allowedRoles = data.data.filter((role: Role) => 
          role.id >= (currentUser?.roleId || 999)
        );
        setRoles(allowedRoles);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setModalVisible(true);
    form.setFieldsValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      isActive: user.isActive,
    });
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        message.success('User deleted successfully');
        fetchUsers();
      } else {
        message.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const handleApproveUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        message.success('User approved successfully');
        fetchUsers();
      } else {
        message.error(data.message || 'Failed to approve user');
      }
    } catch (error) {
      message.error('Failed to approve user');
    }
  };

  const handleRevokeApproval = async (userId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/users/${userId}/approve`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        message.success('User approval revoked successfully');
        fetchUsers();
      } else {
        message.error(data.message || 'Failed to revoke approval');
      }
    } catch (error) {
      message.error('Failed to revoke approval');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('auth_token');

      if (editingUser) {
        // Update user
        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();
        if (data.success) {
          message.success('User updated successfully');
          setModalVisible(false);
          fetchUsers();
        } else {
          message.error(data.message || 'Failed to update user');
        }
      } else {
        // Create user
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();
        if (data.success) {
          message.success('User created successfully');
          setModalVisible(false);
          fetchUsers();
        } else {
          message.error(data.message || 'Failed to create user');
        }
      }
    } catch (error) {
      message.error('Validation failed');
    }
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (record: User) => (
        <Space>
          <UserOutlined />
          <span>{record.firstName} {record.lastName}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (roleName: string) => (
        <Tag color={
          roleName === 'Admin' ? 'red' :
          roleName === 'Manager' ? 'orange' :
          roleName === 'User' ? 'blue' : 'default'
        }>
          {roleName}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: User) => (
        <Space direction="vertical" size="small">
          <Tag color={record.isActive ? 'green' : 'red'}>
            {record.isActive ? 'Active' : 'Inactive'}
          </Tag>
          <Tag color={record.isApproved ? 'green' : 'orange'}>
            {record.isApproved ? 'Approved' : 'Pending'}
          </Tag>
          {record.emailVerified && (
            <Tag color="blue" style={{ fontSize: '10px' }}>Verified</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => {
        // Check if current user can manage this user (target user must have equal or lower permissions)
        const canManageUser = currentUser && record.roleId >= currentUser.roleId;
        // Only Admin can delete users
        const canDeleteUser = currentUser?.roleId === 1 && canManageUser;
        
        return (
          <Space>
            {canManageUser && (
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditUser(record)}
              >
                Edit
              </Button>
            )}
            
            {canManageUser && !record.isApproved && (
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => handleApproveUser(record.id)}
              >
                Approve
              </Button>
            )}
            
            {canManageUser && record.isApproved && (
              <Popconfirm
                title="Are you sure you want to revoke approval for this user?"
                onConfirm={() => handleRevokeApproval(record.id)}
                disabled={record.id === currentUser?.id}
              >
                <Button
                  type="primary"
                  size="small"
                  icon={<CloseOutlined />}
                  style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                  disabled={record.id === currentUser?.id}
                >
                  Revoke
                </Button>
              </Popconfirm>
            )}
            
            {canDeleteUser && (
              <Popconfirm
                title="Are you sure you want to delete this user?"
                onConfirm={() => handleDeleteUser(record.id)}
                disabled={record.id === currentUser?.id}
              >
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  disabled={record.id === currentUser?.id}
                >
                  Delete
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <ProtectedRoute requireRole={2}>
      <div className="p-6">
        <Card>
          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              <Title level={2}>Users Management</Title>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateUser}
                >
                  Add User
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchUsers}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>

          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search users..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by role"
                value={roleFilter}
                onChange={setRoleFilter}
                allowClear
                style={{ width: '100%' }}
              >
                {roles.map(role => (
                  <Option key={role.id} value={role.id}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} users`,
              onChange: (page, pageSize) => {
                setPagination(prev => ({
                  ...prev,
                  current: page,
                  pageSize: pageSize || prev.pageSize,
                }));
              },
            }}
          />
        </Card>

        <Modal
          title={editingUser ? 'Edit User' : 'Create User'}
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={() => setModalVisible(false)}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter valid email' }
              ]}
            >
              <Input />
            </Form.Item>

            {!editingUser && (
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter password' },
                  { min: 8, message: 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password />
              </Form.Item>
            )}

            <Form.Item
              name="roleId"
              label="Role"
              rules={[{ required: true, message: 'Please select role' }]}
            >
              <Select placeholder="Select role">
                {roles.map(role => (
                  <Option key={role.id} value={role.id}>
                    {role.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Active"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}