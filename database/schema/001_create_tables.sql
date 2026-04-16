-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    first_name VARBINARY(255) NOT NULL,
    last_name VARBINARY(255) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,

    mobile VARBINARY(255),
    address VARBINARY(500),
    state VARBINARY(255),
    pincode VARBINARY(50),

    is_active BIT DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL
);
--Updated Table 
Alter TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    first_name VARBINARY(255) NOT NULL,
    last_name VARBINARY(255) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,

    mobile VARBINARY(255),
    address VARBINARY(500),
    state VARBINARY(255),
    pincode VARBINARY(50),

    is_active BIT DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL
);

-- Test Table
CREATE TABLE test_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

