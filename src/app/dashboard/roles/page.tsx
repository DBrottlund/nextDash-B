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
  Typography,
  Tooltip,
  Collapse,
  Checkbox
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  TeamOutlined,
  SearchOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  SettingOutlined
} from '@ant-design/icons';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PermissionGroup {
  [key: string]: {
    label: string;
    actions: string[];
  };
}

const availablePermissions: PermissionGroup = {
  users: {
    label: 'User Management',
    actions: ['read', 'create', 'update', 'delete']
  },
  roles: {
    label: 'Role Management',
    actions: ['read', 'create', 'update', 'delete']
  },
  admin: {
    label: 'Admin Access',
    actions: ['access']
  },
  settings: {
    label: 'Settings',
    actions: ['read', 'update']
  },
  dashboard: {
    label: 'Dashboard',
    actions: ['access']
  }
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchRoles();
  }, [pagination.current, pagination.pageSize, searchText, includeInactive]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        includeInactive: includeInactive.toString(),
      });

      if (searchText) params.append('search', searchText);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/roles?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
        }));
      } else {
        message.error(data.message || 'Failed to fetch roles');
      }
    } catch (error) {
      message.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      permissions: {}
    });
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setModalVisible(true);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      permissions: role.permissions || {}
    });
  };

  const handleDeleteRole = async (roleId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        message.success('Role deleted successfully');
        fetchRoles();
      } else {
        message.error(data.message || 'Failed to delete role');
      }
    } catch (error) {
      message.error('Failed to delete role');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('auth_token');

      if (editingRole) {
        // Update role
        const response = await fetch(`/api/roles/${editingRole.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();
        if (data.success) {
          message.success('Role updated successfully');
          setModalVisible(false);
          fetchRoles();
        } else {
          message.error(data.message || 'Failed to update role');
        }
      } else {
        // Create role
        const response = await fetch('/api/roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();
        if (data.success) {
          message.success('Role created successfully');
          setModalVisible(false);
          fetchRoles();
        } else {
          message.error(data.message || 'Failed to create role');
        }
      }
    } catch (error) {
      message.error('Validation failed');
    }
  };

  const renderPermissions = (permissions: Record<string, any>) => {
    if (!permissions || Object.keys(permissions).length === 0) {
      return <Tag color="default">No permissions</Tag>;
    }

    const permissionTags = Object.entries(permissions).map(([resource, actions]) => {
      if (actions && Object.keys(actions).length > 0) {
        return (
          <Tag key={resource} color="blue" style={{ marginBottom: 4 }}>
            {availablePermissions[resource]?.label || resource}
          </Tag>
        );
      }
      return null;
    }).filter(Boolean);

    return permissionTags.length > 0 ? permissionTags : <Tag color="default">No permissions</Tag>;
  };

  const PermissionSelector = ({ value = {}, onChange }: any) => {
    const handlePermissionChange = (resource: string, action: string, checked: boolean) => {
      const newPermissions = { ...value };
      
      if (!newPermissions[resource]) {
        newPermissions[resource] = {};
      }
      
      newPermissions[resource][action] = checked;
      
      // Clean up empty resources
      if (!checked && Object.values(newPermissions[resource]).every(v => !v)) {
        delete newPermissions[resource];
      }
      
      onChange?.(newPermissions);
    };

    return (
      <Collapse size="small">
        {Object.entries(availablePermissions).map(([resource, config]) => (
          <Panel 
            header={config.label} 
            key={resource}
            extra={
              <Tooltip title={`${resource} permissions`}>
                <InfoCircleOutlined />
              </Tooltip>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {config.actions.map(action => (
                <Checkbox
                  key={action}
                  checked={value[resource]?.[action] || false}
                  onChange={(e) => handlePermissionChange(resource, action, e.target.checked)}
                >
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </Checkbox>
              ))}
            </Space>
          </Panel>
        ))}
      </Collapse>
    );
  };

  const isSystemRole = (roleId: number) => roleId <= 3;

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Role) => (
        <Space>
          <TeamOutlined />
          <span>{name}</span>
          {isSystemRole(record.id) && (
            <Tooltip title="System role - cannot be modified">
              <Tag color="orange" style={{ fontSize: '10px' }}>System</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (record: Role) => renderPermissions(record.permissions),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: Role) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Role) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
            disabled={isSystemRole(record.id)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this role?"
            onConfirm={() => handleDeleteRole(record.id)}
            disabled={isSystemRole(record.id)}
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={isSystemRole(record.id)}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="p-6">
        <Card>
          <Row justify="space-between" align="middle" className="mb-4">
            <Col>
              <Title level={2}>Roles Management</Title>
              <Text type="secondary">Manage user roles and permissions</Text>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateRole}
                >
                  Add Role
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchRoles}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>

          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search roles..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Checkbox
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              >
                Include inactive roles
              </Checkbox>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={roles}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} roles`,
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
          title={editingRole ? 'Edit Role' : 'Create Role'}
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={() => setModalVisible(false)}
          width={800}
          okText={editingRole ? 'Update' : 'Create'}
        >
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="name"
              label="Role Name"
              rules={[
                { required: true, message: 'Please enter role name' },
                { min: 2, message: 'Role name must be at least 2 characters' }
              ]}
            >
              <Input placeholder="e.g. Moderator, Editor" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: 'Please enter description' },
                { min: 10, message: 'Description must be at least 10 characters' }
              ]}
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Describe the purpose and responsibilities of this role"
              />
            </Form.Item>

            <Form.Item
              name="permissions"
              label={
                <Space>
                  <SettingOutlined />
                  <span>Permissions</span>
                  <Tooltip title="Select which actions this role can perform">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
            >
              <PermissionSelector />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Active" 
                unCheckedChildren="Inactive"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}