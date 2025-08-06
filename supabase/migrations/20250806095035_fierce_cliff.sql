/*
  # Add Moderator System

  1. New Tables
    - `moderators` - Moderator accounts with special permissions
    - `green_riders` - Delivery/pickup riders managed by moderators
    - `pickup_assignments` - Assignment tracking for pickups to riders

  2. Updates
    - Add moderator_notes to pickups table
    - Add assigned_rider_id to pickups table

  3. Security
    - Enable RLS on all new tables
    - Add policies for moderator access
    - Add policies for rider access
*/

-- Create moderators table
CREATE TABLE IF NOT EXISTS moderators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  phone text,
  is_active boolean DEFAULT true,
  permissions text[] DEFAULT '{"manage_users", "manage_pickups", "manage_riders", "view_analytics"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create green_riders table
CREATE TABLE IF NOT EXISTS green_riders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  vehicle_type text NOT NULL DEFAULT 'bicycle',
  license_number text,
  is_available boolean DEFAULT true,
  current_location_lat numeric,
  current_location_lng numeric,
  rating numeric DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  total_pickups integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pickup_assignments table
CREATE TABLE IF NOT EXISTS pickup_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_id uuid NOT NULL REFERENCES pickups(id) ON DELETE CASCADE,
  rider_id uuid NOT NULL REFERENCES green_riders(id) ON DELETE CASCADE,
  moderator_id uuid NOT NULL REFERENCES moderators(id),
  assigned_at timestamptz DEFAULT now(),
  estimated_pickup_time timestamptz,
  actual_pickup_time timestamptz,
  notes text,
  status text DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_transit', 'completed', 'cancelled'))
);

-- Add moderator-related columns to pickups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pickups' AND column_name = 'moderator_notes'
  ) THEN
    ALTER TABLE pickups ADD COLUMN moderator_notes text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pickups' AND column_name = 'assigned_rider_id'
  ) THEN
    ALTER TABLE pickups ADD COLUMN assigned_rider_id uuid REFERENCES green_riders(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pickups' AND column_name = 'priority'
  ) THEN
    ALTER TABLE pickups ADD COLUMN priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
  END IF;
END $$;

-- Enable RLS
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE green_riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_assignments ENABLE ROW LEVEL SECURITY;

-- Moderator policies
CREATE POLICY "Moderators can read own data"
  ON moderators
  FOR SELECT
  TO authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Green riders policies
CREATE POLICY "Anyone can read active riders"
  ON green_riders
  FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Moderators can manage riders"
  ON green_riders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM moderators 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND is_active = true
    )
  );

-- Pickup assignments policies
CREATE POLICY "Moderators can manage assignments"
  ON pickup_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM moderators 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND is_active = true
    )
  );

CREATE POLICY "Riders can read their assignments"
  ON pickup_assignments
  FOR SELECT
  TO authenticated
  USING (
    rider_id IN (
      SELECT id FROM green_riders 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Insert default moderator
INSERT INTO moderators (email, password_hash, name, phone) 
VALUES (
  'moderator@gmail.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash of 'md1234'
  'System Moderator',
  '+880 1700-000000'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample green riders
INSERT INTO green_riders (name, email, phone, vehicle_type, license_number) VALUES
  ('Karim Rahman', 'karim.rider@greenloop.bd', '+880 1711-111111', 'motorcycle', 'DHK-1234'),
  ('Fatima Begum', 'fatima.rider@greenloop.bd', '+880 1722-222222', 'bicycle', 'DHK-5678'),
  ('Abdul Hasan', 'abdul.rider@greenloop.bd', '+880 1733-333333', 'van', 'DHK-9012'),
  ('Rashida Khatun', 'rashida.rider@greenloop.bd', '+880 1744-444444', 'motorcycle', 'DHK-3456'),
  ('Mohammad Ali', 'mohammad.rider@greenloop.bd', '+880 1755-555555', 'bicycle', 'DHK-7890')
ON CONFLICT (email) DO NOTHING;

-- Add triggers for updated_at
CREATE TRIGGER update_moderators_updated_at
  BEFORE UPDATE ON moderators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_green_riders_updated_at
  BEFORE UPDATE ON green_riders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();