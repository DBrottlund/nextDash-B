-- Create default admin user
-- Password: admin123 (hashed with bcrypt, 12 rounds)

INSERT INTO users (email, password_hash, role_id, first_name, last_name, is_active, email_verified) VALUES 
('admin@nextdash.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2lFUrmV5WW', 1, 'Admin', 'User', TRUE, TRUE);