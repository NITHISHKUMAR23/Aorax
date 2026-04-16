-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('user', 'admin', 'manager') DEFAULT 'user',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_email CHECK (email REGEXP '^[^@]+@[^@]+\\.[^@]+$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better query performance
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_is_active ON users(is_active);
CREATE INDEX idx_role ON users(role);
CREATE INDEX idx_created_at ON users(created_at);

-- Insert default admin user (password: admin123)
-- Password hash generated using bcrypt with 10 salt rounds
INSERT INTO users (email, password, first_name, last_name, role, is_active) 
VALUES (
    'admin@aoraniti.com', 
    '$2b$10$rQYN0YjYhZFj7qGLQqJysuF1Eo3P7HZVmO6Qqr3D.XjqvYqZqNzE6',
    'Admin',
    'User',
    'admin',
    1
) ON DUPLICATE KEY UPDATE email=email;
