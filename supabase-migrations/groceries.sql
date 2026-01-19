-- Create grocery lists table
CREATE TABLE IF NOT EXISTS grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create grocery items table
CREATE TABLE IF NOT EXISTS grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES grocery_lists(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create item memory table (stores category preferences per user)
CREATE TABLE IF NOT EXISTS item_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  UNIQUE(user_id, item_name)
);

-- Enable RLS
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grocery_lists
CREATE POLICY "Users can view own grocery lists"
  ON grocery_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own grocery lists"
  ON grocery_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grocery lists"
  ON grocery_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grocery lists"
  ON grocery_lists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for grocery_items
CREATE POLICY "Users can view items in own lists"
  ON grocery_items FOR SELECT
  USING (list_id IN (SELECT id FROM grocery_lists WHERE user_id = auth.uid()));

CREATE POLICY "Users can create items in own lists"
  ON grocery_items FOR INSERT
  WITH CHECK (list_id IN (SELECT id FROM grocery_lists WHERE user_id = auth.uid()));

CREATE POLICY "Users can update items in own lists"
  ON grocery_items FOR UPDATE
  USING (list_id IN (SELECT id FROM grocery_lists WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete items in own lists"
  ON grocery_items FOR DELETE
  USING (list_id IN (SELECT id FROM grocery_lists WHERE user_id = auth.uid()));

-- RLS Policies for item_memory
CREATE POLICY "Users can view own item memory"
  ON item_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own item memory"
  ON item_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own item memory"
  ON item_memory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own item memory"
  ON item_memory FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_grocery_lists_user_id ON grocery_lists(user_id);
CREATE INDEX idx_grocery_items_list_id ON grocery_items(list_id);
CREATE INDEX idx_item_memory_user_id ON item_memory(user_id);
