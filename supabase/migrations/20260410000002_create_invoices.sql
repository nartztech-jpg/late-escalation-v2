-- Create invoices table
CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  clientName VARCHAR(255) NOT NULL,
  clientFirstName VARCHAR(255) NOT NULL,
  clientEmail VARCHAR(320) NOT NULL,
  invoiceNumber VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  dueDate DATE NOT NULL,
  services TEXT NOT NULL,
  tone ENUM('warm-professional', 'strictly-professional', 'direct') DEFAULT 'warm-professional' NOT NULL,
  status ENUM('draft', 'active', 'paid', 'cancelled') DEFAULT 'draft' NOT NULL,
  sequenceActivatedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_invoices_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_invoices_userId ON invoices(userId);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_dueDate ON invoices(dueDate);
