-- Create email logs table for tracking delivery
CREATE TABLE emailLogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emailId INT NOT NULL,
  sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  deliveryStatus ENUM('success', 'failed', 'bounced') DEFAULT 'success' NOT NULL,
  errorMessage TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_emailLogs_emailId FOREIGN KEY (emailId) REFERENCES emails(id) ON DELETE CASCADE
);

CREATE INDEX idx_emailLogs_emailId ON emailLogs(emailId);
CREATE INDEX idx_emailLogs_deliveryStatus ON emailLogs(deliveryStatus);
CREATE INDEX idx_emailLogs_createdAt ON emailLogs(createdAt);
