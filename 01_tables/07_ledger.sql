USE aorax_data_vault;

CREATE TABLE IF NOT EXISTS ledger (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    transaction_date DATE NOT NULL,
    entry_type ENUM('credit', 'debit') NOT NULL,
    bucket ENUM('fixed_vault', 'goal_vault', 'emergency_vault', 'spending_bucket') NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance DECIMAL(15,2) NOT NULL,
    source_table VARCHAR(50) NULL,
    source_id BIGINT UNSIGNED NULL,
    notes VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ledger_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_ledger_amount_non_negative CHECK (amount >= 0)
) ENGINE=InnoDB;
