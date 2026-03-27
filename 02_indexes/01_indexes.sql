USE aorax_data_vault;

CREATE INDEX idx_income_user_id ON income(user_id);
CREATE INDEX idx_fixed_expenses_user_id ON fixed_expenses(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_emergency_funds_user_id ON emergency_funds(user_id);
CREATE INDEX idx_daily_expenses_user_id ON daily_expenses(user_id);
CREATE INDEX idx_daily_expenses_date ON daily_expenses(expense_date);
CREATE INDEX idx_ledger_user_id ON ledger(user_id);
CREATE INDEX idx_ledger_date ON ledger(transaction_date);
CREATE INDEX idx_ledger_user_date ON ledger(user_id, transaction_date);
