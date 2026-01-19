export interface Ingredient {
  amount: string
  unit: string
  name: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: Ingredient[]
  instructions: string[]
  tips?: string
  prep_time: number
  cook_time: number
  servings: number
  category: string
  image_url?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface RecipeFormData {
  title: string
  description: string
  ingredients: Ingredient[]
  instructions: string[]
  tips?: string
  prep_time: number
  cook_time: number
  servings: number
  category: string
  image_url?: string
}
