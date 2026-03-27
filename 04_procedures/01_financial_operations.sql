USE aorax_data_vault;

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_record_ledger_entry$$
CREATE PROCEDURE sp_record_ledger_entry(
    IN p_user_id BIGINT UNSIGNED,
    IN p_transaction_date DATE,
    IN p_entry_type VARCHAR(20),
    IN p_bucket VARCHAR(30),
    IN p_category VARCHAR(100),
    IN p_amount DECIMAL(15,2),
    IN p_source_table VARCHAR(50),
    IN p_source_id BIGINT UNSIGNED,
    IN p_notes VARCHAR(255)
)
BEGIN
    DECLARE v_last_balance DECIMAL(15,2) DEFAULT 0.00;
    DECLARE v_new_balance DECIMAL(15,2) DEFAULT 0.00;

    IF p_amount < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Amount cannot be negative.';
    END IF;

    IF p_entry_type NOT IN ('credit', 'debit') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid entry_type. Allowed: credit, debit.';
    END IF;

    IF p_bucket NOT IN ('fixed_vault', 'goal_vault', 'emergency_vault', 'spending_bucket') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid bucket.';
    END IF;

    SELECT COALESCE(balance, 0.00)
      INTO v_last_balance
      FROM ledger
     WHERE user_id = p_user_id
     ORDER BY id DESC
     LIMIT 1
     FOR UPDATE;

    IF p_entry_type = 'credit' THEN
        SET v_new_balance = v_last_balance + p_amount;
    ELSE
        SET v_new_balance = v_last_balance - p_amount;
    END IF;

    INSERT INTO ledger (
        user_id,
        transaction_date,
        entry_type,
        bucket,
        category,
        amount,
        balance,
        source_table,
        source_id,
        notes
    ) VALUES (
        p_user_id,
        p_transaction_date,
        p_entry_type,
        p_bucket,
        p_category,
        p_amount,
        v_new_balance,
        p_source_table,
        p_source_id,
        p_notes
    );
END$$

DROP PROCEDURE IF EXISTS sp_add_income$$
CREATE PROCEDURE sp_add_income(
    IN p_user_id BIGINT UNSIGNED,
    IN p_amount DECIMAL(15,2),
    IN p_income_month DATE
)
BEGIN
    DECLARE v_income_id BIGINT UNSIGNED;

    START TRANSACTION;

    INSERT INTO income (user_id, amount, income_month)
    VALUES (p_user_id, p_amount, p_income_month);

    SET v_income_id = LAST_INSERT_ID();

    CALL sp_record_ledger_entry(
        p_user_id,
        p_income_month,
        'credit',
        'spending_bucket',
        'income',
        p_amount,
        'income',
        v_income_id,
        'Monthly income credited'
    );

    COMMIT;
END$$

DROP PROCEDURE IF EXISTS sp_add_fixed_expense$$
CREATE PROCEDURE sp_add_fixed_expense(
    IN p_user_id BIGINT UNSIGNED,
    IN p_category VARCHAR(100),
    IN p_amount DECIMAL(15,2)
)
BEGIN
    DECLARE v_fixed_expense_id BIGINT UNSIGNED;

    START TRANSACTION;

    INSERT INTO fixed_expenses (user_id, category, amount)
    VALUES (p_user_id, p_category, p_amount);

    SET v_fixed_expense_id = LAST_INSERT_ID();

    CALL sp_record_ledger_entry(
        p_user_id,
        CURRENT_DATE(),
        'debit',
        'fixed_vault',
        p_category,
        p_amount,
        'fixed_expenses',
        v_fixed_expense_id,
        'Fixed expense allocated to locked vault'
    );

    COMMIT;
END$$

DROP PROCEDURE IF EXISTS sp_upsert_goal$$
CREATE PROCEDURE sp_upsert_goal(
    IN p_user_id BIGINT UNSIGNED,
    IN p_target_amount DECIMAL(15,2),
    IN p_duration_months INT
)
BEGIN
    DECLARE v_existing_goal_id BIGINT UNSIGNED;
    DECLARE v_monthly_goal DECIMAL(15,2);

    SET v_monthly_goal = ROUND(p_target_amount / p_duration_months, 2);

    START TRANSACTION;

    SELECT id
      INTO v_existing_goal_id
      FROM goals
     WHERE user_id = p_user_id
       AND is_deleted = 0
     LIMIT 1;

    IF v_existing_goal_id IS NULL THEN
        INSERT INTO goals (user_id, target_amount, duration_months, monthly_goal)
        VALUES (p_user_id, p_target_amount, p_duration_months, v_monthly_goal);
    ELSE
        UPDATE goals
           SET target_amount = p_target_amount,
               duration_months = p_duration_months
         WHERE id = v_existing_goal_id;
    END IF;

    COMMIT;
END$$

DROP PROCEDURE IF EXISTS sp_set_emergency_fund$$
CREATE PROCEDURE sp_set_emergency_fund(
    IN p_user_id BIGINT UNSIGNED,
    IN p_amount DECIMAL(15,2)
)
BEGIN
    DECLARE v_existing_emergency_id BIGINT UNSIGNED;

    START TRANSACTION;

    SELECT id
      INTO v_existing_emergency_id
      FROM emergency_funds
     WHERE user_id = p_user_id
       AND is_deleted = 0
     LIMIT 1;

    IF v_existing_emergency_id IS NULL THEN
        INSERT INTO emergency_funds (user_id, amount)
        VALUES (p_user_id, p_amount);
        SET v_existing_emergency_id = LAST_INSERT_ID();
    ELSE
        UPDATE emergency_funds
           SET amount = p_amount
         WHERE id = v_existing_emergency_id;
    END IF;

    CALL sp_record_ledger_entry(
        p_user_id,
        CURRENT_DATE(),
        'debit',
        'emergency_vault',
        'emergency_fund',
        p_amount,
        'emergency_funds',
        v_existing_emergency_id,
        'Emergency allocation to locked vault'
    );

    COMMIT;
END$$

DROP PROCEDURE IF EXISTS sp_add_daily_expense$$
CREATE PROCEDURE sp_add_daily_expense(
    IN p_user_id BIGINT UNSIGNED,
    IN p_expense_date DATE,
    IN p_category VARCHAR(100),
    IN p_amount DECIMAL(15,2)
)
BEGIN
    DECLARE v_daily_expense_id BIGINT UNSIGNED;

    START TRANSACTION;

    INSERT INTO daily_expenses (user_id, expense_date, category, amount)
    VALUES (p_user_id, p_expense_date, p_category, p_amount);

    SET v_daily_expense_id = LAST_INSERT_ID();

    CALL sp_record_ledger_entry(
        p_user_id,
        p_expense_date,
        'debit',
        'spending_bucket',
        p_category,
        p_amount,
        'daily_expenses',
        v_daily_expense_id,
        'Daily expense debited from spending bucket'
    );

    COMMIT;
END$$

DELIMITER ;
