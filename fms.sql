CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  image_photo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select*from users