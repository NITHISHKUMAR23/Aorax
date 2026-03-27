USE aorax_data_vault;

CREATE TABLE IF NOT EXISTS daily_expenses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    expense_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_daily_expenses_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_daily_expenses_amount_non_negative CHECK (amount >= 0)
) ENGINE=InnoDB;
