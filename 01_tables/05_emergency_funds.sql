USE aorax_data_vault;

CREATE TABLE IF NOT EXISTS emergency_funds (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_emergency_funds_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_emergency_funds_amount_non_negative CHECK (amount >= 0),
    CONSTRAINT uq_emergency_funds_user UNIQUE (user_id)
) ENGINE=InnoDB;
