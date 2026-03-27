USE aorax_data_vault;

CREATE TABLE IF NOT EXISTS goals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    duration_months INT NOT NULL,
    monthly_goal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT chk_goals_target_amount_non_negative CHECK (target_amount >= 0),
    CONSTRAINT chk_goals_duration_positive CHECK (duration_months > 0),
    CONSTRAINT chk_goals_monthly_goal_non_negative CHECK (monthly_goal >= 0),
    CONSTRAINT uq_goals_user UNIQUE (user_id)
) ENGINE=InnoDB;
