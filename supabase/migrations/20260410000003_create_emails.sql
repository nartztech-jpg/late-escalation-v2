-- Create emails table for escalation sequences
CREATE TABLE emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceId INT NOT NULL,
  stage INT NOT NULL COMMENT '1=polite reminder, 2=firm notice, 3=final warning, 4=legal notice',
  sendDay INT NOT NULL COMMENT 'Days after due date to send',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduledFor DATE NOT NULL,
  sentAt TIMESTAMP NULL,
  status ENUM('pending', 'sent', 'cancelled') DEFAULT 'pending' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_emails_invoiceId FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_emails_invoiceId ON emails(invoiceId);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_scheduledFor ON emails(scheduledFor);
