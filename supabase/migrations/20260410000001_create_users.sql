-- Create users table with auth and subscription fields
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  gmailAccessToken TEXT,
  gmailRefreshToken TEXT,
  gmailConnected BOOLEAN DEFAULT FALSE NOT NULL,
  stripeCustomerId VARCHAR(255),
  stripeSubscriptionId VARCHAR(255),
  isSubscribed BOOLEAN DEFAULT FALSE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_openId ON users(openId);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripeCustomerId ON users(stripeCustomerId);
