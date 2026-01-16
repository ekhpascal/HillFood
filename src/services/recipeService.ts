import { supabase } from './supabase'
import { Recipe, RecipeFormData } from '@/types'
import { storageService } from './storageService'

export const recipeService = {
  async getAllRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Parse ingredients if they're stored as strings
    const recipes = (data || []).map(recipe => {
      if (recipe.ingredients) {
        recipe.ingredients = recipe.ingredients.map((ing: any) => 
          typeof ing === 'string' ? JSON.parse(ing) : ing
        )
      }
      return recipe
    })
    
    return recipes
  },

  async getRecipeById(id: string): Promise<Recipe | null> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    
    // Parse ingredients if they're stored as strings
    if (data && data.ingredients) {
      data.ingredients = data.ingredients.map((ing: any) => 
        typeof ing === 'string' ? JSON.parse(ing) : ing
      )
    }
    
    return data
  },

  async createRecipe(recipe: RecipeFormData): Promise<Recipe> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('recipes')
      .insert([{ ...recipe, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateRecipe(id: string, recipe: Partial<RecipeFormData>): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .update(recipe)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteRecipe(id: string): Promise<void> {
    // First, get the recipe to check if it has an image
    const { data: recipe } = await supabase
      .from('recipes')
      .select('image_url')
      .eq('id', id)
      .single()

    // Delete the recipe from database
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Delete the image from storage if it exists
    if (recipe?.image_url) {
      try {
        await storageService.deleteRecipeImage(recipe.image_url)
      } catch (err) {
        console.error('Failed to delete image:', err)
        // Don't throw - recipe is already deleted
      }
    }
  },

  async searchRecipes(query: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}
