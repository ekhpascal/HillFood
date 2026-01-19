import { supabase } from './supabase'
import * as groceryService from './groceryService'
import type { Menu, MenuRecipe, CourseType } from '@/types'

// Menu CRUD
export async function getMenus() {
  const { data, error } = await supabase
    .from('menus')
    .select(`
      *,
      menu_recipes:menu_recipes(
        *,
        recipe:recipes(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Menu[]
}

export async function getMenu(id: string) {
  const { data, error } = await supabase
    .from('menus')
    .select(`
      *,
      menu_recipes:menu_recipes(
        *,
        recipe:recipes(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Menu
}

export async function createMenu(name: string, servings: number = 4) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('menus')
    .insert({ name, servings, user_id: user.id })
    .select(`
      *,
      menu_recipes:menu_recipes(
        *,
        recipe:recipes(*)
      )
    `)
    .single()

  if (error) throw error
  return data as Menu
}

export async function updateMenu(id: string, updates: { name?: string; servings?: number }) {
  const { data, error } = await supabase
    .from('menus')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Menu
}

export async function deleteMenu(id: string) {
  const { error } = await supabase
    .from('menus')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Menu Recipe management
export async function addRecipeToMenu(
  menuId: string,
  recipeId: string,
  courseType: CourseType
) {
  // Get the next position for this course type
  const { data: existing } = await supabase
    .from('menu_recipes')
    .select('position')
    .eq('menu_id', menuId)
    .eq('course_type', courseType)
    .order('position', { ascending: false })
    .limit(1)

  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from('menu_recipes')
    .insert({
      menu_id: menuId,
      recipe_id: recipeId,
      course_type: courseType,
      position
    })
    .select(`
      *,
      recipe:recipes(*)
    `)
    .single()

  if (error) throw error
  return data as MenuRecipe
}

export async function removeRecipeFromMenu(menuRecipeId: string) {
  const { error } = await supabase
    .from('menu_recipes')
    .delete()
    .eq('id', menuRecipeId)

  if (error) throw error
}

export async function reorderMenuRecipes(
  menuId: string,
  courseType: CourseType,
  recipeIds: string[]
) {
  // Update positions for all recipes in this course
  const updates = recipeIds.map((id, index) => ({
    id,
    position: index
  }))

  for (const update of updates) {
    await supabase
      .from('menu_recipes')
      .update({ position: update.position })
      .eq('id', update.id)
      .eq('menu_id', menuId)
      .eq('course_type', courseType)
  }
}

// Shopping list generation
interface ScaledIngredient {
  name: string
  amount: string
  unit: string
  originalAmount: number
  scaledAmount: number
  category?: string
}

function parseAmount(amountStr: string | undefined | null): number {
  if (!amountStr || amountStr.trim() === '') return 0
  
  // Handle fractions like "1/2", "1 1/2"
  const fractionMatch = amountStr.match(/(\d+)?\s*(\d+)\/(\d+)/)
  if (fractionMatch) {
    const whole = fractionMatch[1] ? parseInt(fractionMatch[1]) : 0
    const numerator = parseInt(fractionMatch[2])
    const denominator = parseInt(fractionMatch[3])
    return whole + numerator / denominator
  }
  
  const num = parseFloat(amountStr)
  return isNaN(num) ? 0 : num
}

function formatAmount(amount: number): string {
  // Round to 2 decimal places
  const rounded = Math.round(amount * 100) / 100
  
  // If it's close to a common fraction, use that
  const fractions: [number, string][] = [
    [0.25, '1/4'],
    [0.33, '1/3'],
    [0.5, '1/2'],
    [0.67, '2/3'],
    [0.75, '3/4']
  ]
  
  for (const [value, fraction] of fractions) {
    if (Math.abs(rounded - value) < 0.05) return fraction
    if (Math.abs(rounded - Math.floor(rounded) - value) < 0.05) {
      return `${Math.floor(rounded)} ${fraction}`
    }
  }
  
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1)
}

export async function generateShoppingList(menuId: string, listName?: string) {
  // Get menu with all recipes
  const menu = await getMenu(menuId)
  console.log('Menu for shopping list:', menu)
  
  if (!menu.menu_recipes || menu.menu_recipes.length === 0) {
    throw new Error('No recipes in menu')
  }

  // Calculate scaling factor
  const scaledIngredients: Map<string, ScaledIngredient> = new Map()

  for (const menuRecipe of menu.menu_recipes) {
    const recipe = menuRecipe.recipe
    if (!recipe) {
      console.log('No recipe found for menu_recipe:', menuRecipe)
      continue
    }
    
    // Parse ingredients if they come as JSON strings
    let ingredients = recipe.ingredients
    if (ingredients.length > 0 && typeof ingredients[0] === 'string') {
      ingredients = ingredients.map((ing: any) => JSON.parse(ing))
    }
    
    console.log('Processing recipe:', recipe.title, 'with', ingredients.length, 'ingredients')

    const scaleFactor = menu.servings / recipe.servings
    console.log('Scale factor:', scaleFactor, '(menu:', menu.servings, 'recipe:', recipe.servings, ')')

    for (const ingredient of ingredients) {
      const originalAmount = parseAmount(ingredient.amount)
      console.log('Ingredient:', ingredient.name, 'Amount:', ingredient.amount, 'Parsed:', originalAmount)
      
      // Skip ingredients with no amount (like "salt to taste")
      if (originalAmount === 0) {
        console.log('Skipping ingredient with no amount:', ingredient.name)
        continue
      }
      
      const scaledAmount = originalAmount * scaleFactor
      const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`

      if (scaledIngredients.has(key)) {
        const existing = scaledIngredients.get(key)!
        existing.scaledAmount += scaledAmount
      } else {
        scaledIngredients.set(key, {
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          originalAmount,
          scaledAmount,
          category: ingredient.category
        })
      }
    }
  }
  
  console.log('Scaled ingredients map size:', scaledIngredients.size)

  // Create grocery list
  const groceryListName = listName || `${menu.name} - ${new Date().toLocaleDateString()}`
  const groceryList = await groceryService.createGroceryList(groceryListName)
  console.log('Created grocery list:', groceryList)

  // Add items to grocery list
  // Use ingredient category if set, otherwise try item memory, fallback to 'diverse'
  const itemMemory = await groceryService.getItemMemory()

  for (const [, ingredient] of scaledIngredients) {
    const formattedAmount = formatAmount(ingredient.scaledAmount)
    const itemName = `${formattedAmount}${ingredient.unit} ${ingredient.name}`
    const category = ingredient.category || itemMemory[ingredient.name.toLowerCase()] || 'diverse'
    
    console.log('Adding grocery item:', itemName, 'category:', category)

    await groceryService.addGroceryItem(
      groceryList.id,
      itemName,
      category,
      1
    )
  }
  
  console.log('Shopping list generation complete')

  return groceryList
}
