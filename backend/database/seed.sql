-- KVR Tata Tracker - Seed Data

-- Initial Admin User
INSERT INTO users (username, password, role, name, branch, email)
VALUES ('admin', 'admin123', 'ADMIN', 'System Administrator', 'Head Office', 'admin@kvrgroup.com')
ON DUPLICATE KEY UPDATE 
  password = VALUES(password),
  role = VALUES(role),
  name = VALUES(name),
  email = VALUES(email);
