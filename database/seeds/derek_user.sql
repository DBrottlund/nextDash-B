-- Create Derek's user account
-- Password: 117532Uiop!! (hashed with bcrypt, 12 rounds)

INSERT INTO users (email, password_hash, role_id, first_name, last_name, is_active, email_verified) VALUES 
('derek@usefulepton.com', '$2b$12$8YQqkzV7oQUGvGXaFKLsKeZYS9xzKwNhvXwrQcQjGZJhOhYXc9Hte', 1, 'Derek', 'Brottlund', TRUE, TRUE);