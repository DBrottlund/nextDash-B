-- Default menu structure

INSERT INTO menu_items (name, path, icon, parent_id, order_index, enabled, required_role_id) VALUES 
-- Main menu items
('Dashboard', '/dashboard', 'DashboardOutlined', NULL, 1, TRUE, 4),
('Users', '/dashboard/users', 'UserOutlined', NULL, 2, TRUE, 2),
('Roles', '/dashboard/roles', 'TeamOutlined', NULL, 3, TRUE, 1),
('Settings', '/dashboard/settings', 'SettingOutlined', NULL, 4, TRUE, 3),
('Admin', NULL, 'ToolOutlined', NULL, 5, TRUE, 1),

-- Admin submenu items
('App Settings', '/dashboard/admin/app-settings', 'AppstoreOutlined', 5, 1, TRUE, 1),
('Menu Config', '/dashboard/admin/menu-config', 'MenuOutlined', 5, 2, TRUE, 1);