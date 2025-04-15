-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS character_type TEXT DEFAULT 'scholar',
ADD COLUMN IF NOT EXISTS streak_protection_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS parental_control_settings JSONB,
ADD COLUMN IF NOT EXISTS is_parent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parent_of_user_id INTEGER,
ADD COLUMN IF NOT EXISTS wearable_device_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS wearable_device_token TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Create sleep_entries table
CREATE TABLE IF NOT EXISTS sleep_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL,
  quality REAL NOT NULL,
  deep_sleep_percentage REAL,
  rem_sleep_percentage REAL,
  light_sleep_percentage REAL,
  disturbances INTEGER DEFAULT 0,
  notes TEXT,
  tags TEXT[],
  source TEXT DEFAULT 'manual'
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  rarity TEXT NOT NULL DEFAULT 'common',
  experience_awarded INTEGER NOT NULL DEFAULT 10,
  is_hidden BOOLEAN DEFAULT false,
  is_secret BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false
);

-- Create achievement_definitions table
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  experience_awarded INTEGER NOT NULL DEFAULT 10,
  criteria JSONB NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  is_secret BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false
);

-- Create skill_trees table
CREATE TABLE IF NOT EXISTS skill_trees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create skill_nodes table
CREATE TABLE IF NOT EXISTS skill_nodes (
  id SERIAL PRIMARY KEY,
  skill_tree_id INTEGER NOT NULL REFERENCES skill_trees(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP,
  parent_node_ids INTEGER[],
  experience_to_unlock INTEGER NOT NULL DEFAULT 100,
  rewards JSONB
);

-- Create character_avatars table
CREATE TABLE IF NOT EXISTS character_avatars (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  attributes JSONB NOT NULL,
  outfits JSONB,
  accessories JSONB,
  evolution INTEGER DEFAULT 1,
  evolution_progress REAL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create parent_teen_reports table
CREATE TABLE IF NOT EXISTS parent_teen_reports (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER NOT NULL REFERENCES users(id),
  teen_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  period TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  data JSONB NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  shared_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create privacy_agreements table
CREATE TABLE IF NOT EXISTS privacy_agreements (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER NOT NULL REFERENCES users(id),
  teen_id INTEGER NOT NULL REFERENCES users(id),
  privacy_level INTEGER NOT NULL,
  data_shared JSONB NOT NULL,
  exceptions JSONB,
  negotiated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  notes TEXT
);

-- Create independence_progression table
CREATE TABLE IF NOT EXISTS independence_progression (
  id SERIAL PRIMARY KEY,
  teen_id INTEGER NOT NULL REFERENCES users(id),
  level INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  unlocked_features TEXT[],
  criteria JSONB NOT NULL,
  achieved_at TIMESTAMP NOT NULL DEFAULT NOW(),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP
);

-- Create wearable_data_sync table
CREATE TABLE IF NOT EXISTS wearable_data_sync (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  device_type TEXT NOT NULL,
  last_sync_at TIMESTAMP NOT NULL DEFAULT NOW(),
  data_type TEXT NOT NULL,
  data JSONB NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'synced',
  error_message TEXT
);

-- Create visualization_preferences table
CREATE TABLE IF NOT EXISTS visualization_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  category TEXT NOT NULL,
  visualization_type TEXT NOT NULL,
  color_scheme TEXT NOT NULL DEFAULT 'default',
  layout_options JSONB,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create export_logs table
CREATE TABLE IF NOT EXISTS export_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  filename TEXT NOT NULL,
  format TEXT NOT NULL,
  data_types TEXT[] NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending',
  url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT
);

-- Create habit_streak_logs table
CREATE TABLE IF NOT EXISTS habit_streak_logs (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER NOT NULL REFERENCES habits(id),
  date TIMESTAMP NOT NULL,
  is_completed BOOLEAN NOT NULL,
  streak_protection_used BOOLEAN DEFAULT false,
  notes TEXT
);