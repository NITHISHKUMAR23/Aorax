USE aorax_data_vault;

DELIMITER $$

DROP TRIGGER IF EXISTS trg_goals_set_monthly_goal_before_insert$$
CREATE TRIGGER trg_goals_set_monthly_goal_before_insert
BEFORE INSERT ON goals
FOR EACH ROW
BEGIN
    SET NEW.monthly_goal = ROUND(NEW.target_amount / NEW.duration_months, 2);
END$$

DROP TRIGGER IF EXISTS trg_goals_set_monthly_goal_before_update$$
CREATE TRIGGER trg_goals_set_monthly_goal_before_update
BEFORE UPDATE ON goals
FOR EACH ROW
BEGIN
    SET NEW.monthly_goal = ROUND(NEW.target_amount / NEW.duration_months, 2);
END$$

DELIMITER ;
