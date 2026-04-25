-- Create stored procedure for sending due emails
-- This will be called by pg_cron every day at 8:00 AM UTC
DELIMITER $$

CREATE PROCEDURE send_due_emails()
BEGIN
  DECLARE email_id INT;
  DECLARE invoice_id INT;
  DECLARE user_id INT;
  DECLARE client_email VARCHAR(320);
  DECLARE subject_text TEXT;
  DECLARE body_text TEXT;
  DECLARE gmail_token TEXT;
  DECLARE done INT DEFAULT FALSE;
  
  DECLARE email_cursor CURSOR FOR
    SELECT e.id, e.invoiceId, i.userId, i.clientEmail, e.subject, e.body, u.gmailAccessToken
    FROM emails e
    JOIN invoices i ON e.invoiceId = i.id
    JOIN users u ON i.userId = u.id
    WHERE e.status = 'pending' 
      AND e.scheduledFor <= CURDATE()
      AND u.gmailConnected = TRUE
    ORDER BY e.scheduledFor ASC;
  
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  OPEN email_cursor;
  
  read_loop: LOOP
    FETCH email_cursor INTO email_id, invoice_id, user_id, client_email, subject_text, body_text, gmail_token;
    
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    -- Update email status to sent
    UPDATE emails 
    SET status = 'sent', sentAt = NOW() 
    WHERE id = email_id;
    
    -- Log the email send
    INSERT INTO emailLogs (emailId, deliveryStatus, sentAt)
    VALUES (email_id, 'success', NOW());
    
    -- Update escalation sequence current stage
    UPDATE escalationSequences
    SET currentStage = (SELECT stage FROM emails WHERE id = email_id),
        lastSentAt = NOW()
    WHERE invoiceId = invoice_id;
    
  END LOOP;
  
  CLOSE email_cursor;
END$$

DELIMITER ;

-- Note: To schedule this procedure in Supabase, use:
-- SELECT cron.schedule('send-due-emails', '0 8 * * *', 'CALL send_due_emails()');
-- This schedules the procedure to run daily at 8:00 AM UTC
