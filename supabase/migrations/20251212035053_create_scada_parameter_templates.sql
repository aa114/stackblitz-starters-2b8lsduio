/*
  # SCADA Parameter Mapping Templates Schema

  1. New Tables
    - `scada_templates`
      - `id` (uuid, primary key) - Unique identifier for template
      - `name` (text) - Template name
      - `description` (text) - Template description
      - `category` (text) - Template category (tank, valve, pump, sensor, etc.)
      - `mapping_config` (jsonb) - Parameter mapping configuration
      - `preview_svg` (text) - Preview SVG for template
      - `created_by` (uuid) - User who created the template
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `is_public` (boolean) - Whether template is publicly accessible

  2. Security
    - Enable RLS on `scada_templates` table
    - Add policy for users to read public templates
    - Add policy for users to read their own templates
    - Add policy for users to create their own templates
    - Add policy for users to update their own templates
    - Add policy for users to delete their own templates
*/

-- Create scada_templates table
CREATE TABLE IF NOT EXISTS scada_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'custom',
  mapping_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_svg text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_public boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE scada_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read public templates
CREATE POLICY "Users can read public templates"
  ON scada_templates
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Policy: Users can read their own templates
CREATE POLICY "Users can read own templates"
  ON scada_templates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Policy: Users can create their own templates
CREATE POLICY "Users can create own templates"
  ON scada_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON scada_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON scada_templates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_scada_templates_category ON scada_templates(category);
CREATE INDEX IF NOT EXISTS idx_scada_templates_created_by ON scada_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_scada_templates_is_public ON scada_templates(is_public);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_scada_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scada_templates_timestamp
  BEFORE UPDATE ON scada_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_scada_templates_updated_at();
