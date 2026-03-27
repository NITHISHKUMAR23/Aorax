USE aorax_data_vault;

-- 1) Create a user
INSERT INTO users (username, password_hash)
VALUES ('demo_user', '$2b$12$replace_with_bcrypt_hash');

-- 2) Add monthly income
CALL sp_add_income(1, 100000.00, '2026-03-01');

-- 3) Add fixed expenses (locked)
CALL sp_add_fixed_expense(1, 'rent', 20000.00);
CALL sp_add_fixed_expense(1, 'emi', 12000.00);

-- 4) Set savings goal
CALL sp_upsert_goal(1, 100000.00, 12);

-- 5) Set emergency fund (locked)
CALL sp_set_emergency_fund(1, 15000.00);

-- 6) Track daily expense (spending bucket)
CALL sp_add_daily_expense(1, CURRENT_DATE(), 'food', 350.00);

-- 7) Check latest balance
SELECT * FROM vw_user_current_balance WHERE user_id = 1;
