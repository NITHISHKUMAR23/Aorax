USE aorax_data_vault;

DELIMITER $$

DROP TRIGGER IF EXISTS trg_ledger_prevent_update$$
CREATE TRIGGER trg_ledger_prevent_update
BEFORE UPDATE ON ledger
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ledger is immutable: UPDATE is not allowed.';
END$$

DROP TRIGGER IF EXISTS trg_ledger_prevent_delete$$
CREATE TRIGGER trg_ledger_prevent_delete
BEFORE DELETE ON ledger
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ledger is immutable: DELETE is not allowed.';
END$$

DELIMITER ;
