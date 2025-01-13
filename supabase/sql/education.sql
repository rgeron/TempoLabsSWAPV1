-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS education_levels CASCADE;
DROP TABLE IF EXISTS education_systems CASCADE;

-- Create education_systems table
CREATE TABLE education_systems (
  country_code TEXT PRIMARY KEY,
  country_name TEXT NOT NULL,
  system_name TEXT NOT NULL
);

-- Create education_levels table
CREATE TABLE education_levels (
  id SERIAL PRIMARY KEY,
  country_code TEXT REFERENCES education_systems(country_code),
  level_name TEXT NOT NULL,
  level_name_localized TEXT NOT NULL,
  display_order INTEGER NOT NULL
);

-- Add education level to profiles if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS education_level_id INTEGER REFERENCES education_levels(id);

-- Insert education systems data
INSERT INTO education_systems (country_code, country_name, system_name) VALUES
('CA', 'Canada', 'Canadian Education System'),
('AU', 'Australia', 'Australian Education System'),
('DE', 'Germany', 'German Education System'),
('FR', 'France', 'French Education System'),
('JP', 'Japan', 'Japanese Education System'),
('CN', 'China', 'Chinese Education System'),
('BR', 'Brazil', 'Brazilian Education System'),
('IN', 'India', 'Indian Education System');

-- Insert education levels data
INSERT INTO education_levels (country_code, level_name, level_name_localized, display_order) VALUES
-- Canada
('CA', 'Elementary School', 'Elementary School', 1),
('CA', 'Secondary School', 'Secondary School', 2),
('CA', 'College', 'College', 3),
('CA', 'University', 'University', 4),
('CA', 'Other', 'Other', 5),

-- Australia
('AU', 'Primary School', 'Primary School', 1),
('AU', 'Secondary School', 'Secondary School', 2),
('AU', 'TAFE', 'TAFE', 3),
('AU', 'University', 'University', 4),
('AU', 'Other', 'Other', 5),

-- Germany
('DE', 'Primary School', 'Grundschule', 1),
('DE', 'Secondary School', 'Hauptschule/Realschule', 2),
('DE', 'High School', 'Gymnasium', 3),
('DE', 'University', 'Hochschule/Universität', 4),
('DE', 'Other', 'Andere', 5),

-- France
('FR', 'Primary School', 'École Primaire', 1),
('FR', 'Middle School', 'Collège', 2),
('FR', 'High School', 'Lycée', 3),
('FR', 'Higher Education', 'Études Supérieures', 4),
('FR', 'Other', 'Autre', 5),

-- Japan
('JP', 'Elementary School', '小学校', 1),
('JP', 'Junior High School', '中学校', 2),
('JP', 'High School', '高校', 3),
('JP', 'University', '大学', 4),
('JP', 'Other', 'その他', 5),

-- China
('CN', 'Primary School', '小学', 1),
('CN', 'Junior High School', '初中', 2),
('CN', 'High School', '高中', 3),
('CN', 'University', '大学', 4),
('CN', 'Other', '其他', 5),

-- Brazil
('BR', 'Elementary Education', 'Ensino Fundamental', 1),
('BR', 'High School', 'Ensino Médio', 2),
('BR', 'Technical Education', 'Ensino Técnico', 3),
('BR', 'Higher Education', 'Ensino Superior', 4),
('BR', 'Other', 'Outro', 5),

-- India
('IN', 'Primary School', 'Primary School', 1),
('IN', 'Secondary School', 'Secondary School', 2),
('IN', 'Higher Secondary School', 'Higher Secondary School', 3),
('IN', 'Undergraduate', 'Undergraduate', 4),
('IN', 'Postgraduate', 'Postgraduate', 5),
('IN', 'Other', 'Other', 6);

-- Create indexes
CREATE INDEX idx_education_levels_country ON education_levels(country_code);

-- Enable RLS
ALTER TABLE education_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_levels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Education systems are viewable by everyone."
  ON education_systems FOR SELECT
  USING (true);

CREATE POLICY "Education levels are viewable by everyone."
  ON education_levels FOR SELECT
  USING (true);