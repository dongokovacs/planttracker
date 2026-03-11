CREATE TABLE IF NOT EXISTS plants (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  variety VARCHAR(255) NULL,
  planted_date DATETIME(3) NOT NULL,
  location VARCHAR(255) NULL,
  notes TEXT NULL,
  image_url TEXT NULL,
  ai_data JSON NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  INDEX idx_name (name),
  INDEX idx_location (location),
  INDEX idx_planted_date (planted_date),
  INDEX idx_updated_at (updated_at)
);

