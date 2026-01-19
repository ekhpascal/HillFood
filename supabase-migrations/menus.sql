-- Create menus table
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  servings INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_recipes table (junction table with ordering)
CREATE TABLE IF NOT EXISTS menu_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  course_type TEXT NOT NULL, -- 'starter', 'main', 'dessert'
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menus
CREATE POLICY "Users can view own menus"
  ON menus FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own menus"
  ON menus FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own menus"
  ON menus FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own menus"
  ON menus FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for menu_recipes
CREATE POLICY "Users can view recipes in own menus"
  ON menu_recipes FOR SELECT
  USING (menu_id IN (SELECT id FROM menus WHERE user_id = auth.uid()));

CREATE POLICY "Users can add recipes to own menus"
  ON menu_recipes FOR INSERT
  WITH CHECK (menu_id IN (SELECT id FROM menus WHERE user_id = auth.uid()));

CREATE POLICY "Users can update recipes in own menus"
  ON menu_recipes FOR UPDATE
  USING (menu_id IN (SELECT id FROM menus WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete recipes from own menus"
  ON menu_recipes FOR DELETE
  USING (menu_id IN (SELECT id FROM menus WHERE user_id = auth.uid()));

-- Create indexes
CREATE INDEX idx_menus_user_id ON menus(user_id);
CREATE INDEX idx_menu_recipes_menu_id ON menu_recipes(menu_id);
CREATE INDEX idx_menu_recipes_recipe_id ON menu_recipes(recipe_id);
CREATE INDEX idx_menu_recipes_position ON menu_recipes(menu_id, course_type, position);
