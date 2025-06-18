CREATE TABLE farmers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users(id),
  full_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),
  phone TEXT,
  email TEXT UNIQUE,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE farms (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  farmer_id BIGINT REFERENCES farmers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  size_acres NUMERIC(10,2),
  irrigation BOOLEAN DEFAULT FALSE,
  gps_coordinates TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crops (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  farm_id BIGINT REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variety TEXT,
  planting_date DATE,
  expected_harvest_date DATE,
  status TEXT CHECK (status IN ('planted', 'growing', 'harvested')) DEFAULT 'planted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  farm_id BIGINT REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purchase_date DATE,
  condition TEXT CHECK (condition IN ('new', 'good', 'fair', 'poor')),
  is_operational BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  farm_id BIGINT REFERENCES farms(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  product_name TEXT,
  quantity NUMERIC(10, 2),
  unit TEXT DEFAULT 'kg',
  price_per_unit NUMERIC(10,2),
  sale_date DATE,
  buyer_name TEXT,
  total_revenue NUMERIC(10,2) GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE fertilization (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  crop_id BIGINT REFERENCES crops(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT,
  quantity_kg NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



ALTER TABLE farmers ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE farms ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE crops ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN   phone TEXT;
ALTER TABLE users ADD COLUMN     address TEXT;
ALTER TABLE equipment ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;


select*from users
select*from farmers
select*from farms
select*from crops
select*from equipment


drop table 






