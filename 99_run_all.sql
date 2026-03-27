-- Execute this file from repository root:
-- source db/mysql/99_run_all.sql;

source db/mysql/00_schema/00_create_database.sql;
source db/mysql/01_tables/01_users.sql;
source db/mysql/01_tables/02_income.sql;
source db/mysql/01_tables/03_fixed_expenses.sql;
source db/mysql/01_tables/04_goals.sql;
source db/mysql/01_tables/05_emergency_funds.sql;
source db/mysql/01_tables/06_daily_expenses.sql;
source db/mysql/01_tables/07_ledger.sql;
source db/mysql/02_indexes/01_indexes.sql;
source db/mysql/03_triggers/01_ledger_immutability.sql;
source db/mysql/03_triggers/02_goal_monthly_goal_calc.sql;
source db/mysql/04_procedures/01_financial_operations.sql;
source db/mysql/04_procedures/02_soft_delete_operations.sql;
source db/mysql/05_views/01_reporting_views.sql;
