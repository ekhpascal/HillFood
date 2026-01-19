import { supabase } from './supabase'

export interface GroceryItem {
  id: string
  list_id: string
  name: string
  category: string
  quantity: number
  checked: boolean
  created_at: string
}

export interface GroceryList {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
  items?: GroceryItem[]
}

export interface ItemMemory {
  id: string
  user_id: string
  item_name: string
  category: string
}

// Grocery Lists
export async function getGroceryLists() {
  const { data, error } = await supabase
    .from('grocery_lists')
    .select(`
      *,
      items:grocery_items(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as GroceryList[]
}

export async function createGroceryList(name: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('grocery_lists')
    .insert({ name, user_id: user.id })
    .select(`
      *,
      items:grocery_items(*)
    `)
    .single()

  if (error) throw error
  return data as GroceryList
}

export async function updateGroceryList(id: string, name: string) {
  const { data, error } = await supabase
    .from('grocery_lists')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteGroceryList(id: string) {
  const { error } = await supabase
    .from('grocery_lists')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Grocery Items
export async function addGroceryItem(
  listId: string,
  name: string,
  category: string,
  quantity: number = 1
) {
  const { data, error } = await supabase
    .from('grocery_items')
    .insert({
      list_id: listId,
      name,
      category,
      quantity,
      checked: false
    })
    .select()
    .single()

  if (error) throw error
  return data as GroceryItem
}

export async function updateGroceryItem(
  id: string,
  updates: Partial<Pick<GroceryItem, 'name' | 'category' | 'quantity' | 'checked'>>
) {
  const { data, error } = await supabase
    .from('grocery_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as GroceryItem
}

export async function deleteGroceryItem(id: string) {
  const { error } = await supabase
    .from('grocery_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Item Memory (category preferences)
export async function getItemMemory() {
  const { data, error } = await supabase
    .from('item_memory')
    .select('*')

  if (error) throw error
  
  // Convert to object format
  const memory: { [itemName: string]: string } = {}
  data?.forEach((item) => {
    memory[item.item_name] = item.category
  })
  
  return memory
}

export async function saveItemMemory(itemName: string, category: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('item_memory')
    .upsert({
      user_id: user.id,
      item_name: itemName.toLowerCase(),
      category
    }, {
      onConflict: 'user_id,item_name'
    })

  if (error) throw error
}
