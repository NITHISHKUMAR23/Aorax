USE aorax_data_vault;

CREATE OR REPLACE VIEW vw_user_bucket_totals AS
SELECT
    l.user_id,
    l.bucket,
    SUM(CASE WHEN l.entry_type = 'credit' THEN l.amount ELSE 0 END) AS total_credit,
    SUM(CASE WHEN l.entry_type = 'debit' THEN l.amount ELSE 0 END) AS total_debit,
    SUM(CASE WHEN l.entry_type = 'credit' THEN l.amount ELSE -l.amount END) AS net_amount
FROM ledger l
GROUP BY l.user_id, l.bucket;

CREATE OR REPLACE VIEW vw_user_current_balance AS
SELECT t.user_id, t.balance AS current_balance, t.transaction_date, t.created_at
FROM ledger t
INNER JOIN (
    SELECT user_id, MAX(id) AS max_ledger_id
    FROM ledger
    GROUP BY user_id
) latest ON latest.max_ledger_id = t.id;
