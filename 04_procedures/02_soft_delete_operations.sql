USE aorax_data_vault;

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_soft_delete_daily_expense$$
CREATE PROCEDURE sp_soft_delete_daily_expense(
    IN p_daily_expense_id BIGINT UNSIGNED
)
BEGIN
    UPDATE daily_expenses
       SET is_deleted = 1,
           deleted_at = CURRENT_TIMESTAMP
     WHERE id = p_daily_expense_id
       AND is_deleted = 0;
END$$

DROP PROCEDURE IF EXISTS sp_soft_delete_fixed_expense$$
CREATE PROCEDURE sp_soft_delete_fixed_expense(
    IN p_fixed_expense_id BIGINT UNSIGNED
)
BEGIN
    UPDATE fixed_expenses
       SET is_deleted = 1,
           deleted_at = CURRENT_TIMESTAMP
     WHERE id = p_fixed_expense_id
       AND is_deleted = 0;
END$$

DELIMITER ;
