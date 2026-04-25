-- Create escalation sequences table to track progress
CREATE TABLE escalationSequences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceId INT NOT NULL UNIQUE,
  currentStage INT NOT NULL DEFAULT 0 COMMENT '0-4, tracks which stage was last sent',
  lastSentAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_escalationSequences_invoiceId FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_escalationSequences_invoiceId ON escalationSequences(invoiceId);
