export interface Ingredient {
  amount: string
  unit: string
  name: string
  category?: string
}

export interface Note {
  id: string
  content: string
  created_at: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: Ingredient[]
  instructions: string[]
  tips?: string
  notes?: Note[]
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
  notes?: Note[]
  prep_time: number
  cook_time: number
  servings: number
  category: string
  image_url?: string
}

export type CourseType = 'starter' | 'main' | 'dessert'

export interface MenuRecipe {
  id: string
  menu_id: string
  recipe_id: string
  course_type: CourseType
  position: number
  created_at: string
  recipe?: Recipe
}

export interface Menu {
  id: string
  user_id: string
  name: string
  servings: number
  created_at: string
  updated_at: string
  menu_recipes?: MenuRecipe[]
}
