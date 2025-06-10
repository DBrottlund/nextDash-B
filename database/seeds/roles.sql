-- Seed data for roles table

INSERT INTO roles (id, name, description, permissions) VALUES 
(1, 'Admin', 'Full system access with all permissions', JSON_OBJECT(
    'users', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'roles', JSON_ARRAY('create', 'read', 'update', 'delete'),
    'settings', JSON_ARRAY('read', 'update'),
    'menu', JSON_ARRAY('read', 'update'),
    'dashboard', JSON_ARRAY('read'),
    'admin', JSON_ARRAY('access')
)),
(2, 'Manager', 'Management level access with user management', JSON_OBJECT(
    'users', JSON_ARRAY('create', 'read', 'update'),
    'roles', JSON_ARRAY('read'),
    'settings', JSON_ARRAY('read'),
    'menu', JSON_ARRAY('read'),
    'dashboard', JSON_ARRAY('read')
)),
(3, 'User', 'Standard user access', JSON_OBJECT(
    'users', JSON_ARRAY('read'),
    'dashboard', JSON_ARRAY('read'),
    'settings', JSON_ARRAY('read')
)),
(4, 'Guest', 'Limited guest access', JSON_OBJECT(
    'dashboard', JSON_ARRAY('read')
));