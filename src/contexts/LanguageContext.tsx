import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'da' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  da: {
    // Navigation
    'nav.home': 'Hjem',
    'nav.recipes': 'Opskrifter',
    'nav.add': 'Tilføj',
    'nav.signOut': 'Log ud',
    
    // Home page
    'home.title': 'Velkommen til HillFood',
    'home.subtitle': 'Din personlige opskriftsdatabase',
    'home.getStarted': 'Kom i gang',
    
    // Auth
    'auth.signIn': 'Log ind',
    'auth.signUp': 'Opret konto',
    'auth.email': 'Email',
    'auth.password': 'Adgangskode',
    'auth.hasAccount': 'Har du allerede en konto?',
    'auth.noAccount': 'Har du ikke en konto?',
    
    // Recipe list
    'recipes.title': 'Mine Opskrifter',
    'recipes.search': 'Søg opskrifter...',
    'recipes.noRecipes': 'Ingen opskrifter fundet',
    'recipes.addFirst': 'Tilføj din første opskrift!',
    
    // Recipe card
    'recipe.prep': 'Forberedelse',
    'recipe.cook': 'Tilberedning',
    'recipe.servings': 'Portioner',
    'recipe.minutes': 'min',
    
    // Recipe detail
    'detail.backToRecipes': '← Tilbage til Opskrifter',
    'detail.delete': 'Slet',
    'detail.deleteConfirm': 'Er du sikker på, at du vil slette denne opskrift?',
    'detail.preparationTime': 'Forberedelsestid:',
    'detail.cookingTime': 'Tilberedningstid:',
    'detail.totalTime': 'Samlet tid:',
    'detail.servings': 'Portioner:',
    'detail.minutes': 'minutter',
    'detail.person': 'person',
    'detail.people': 'personer',
    'detail.ingredients': 'Ingredienser',
    'detail.instructions': 'Fremgangsmåde',
    
    // Add recipe
    'add.title': 'Tilføj Ny Opskrift',
    'add.recipeTitle': 'Opskriftstitel',
    'add.description': 'Beskrivelse',
    'add.category': 'Kategori',
    'add.prepTime': 'Forberedelsestid (min)',
    'add.cookTime': 'Tilberedningstid (min)',
    'add.servings': 'Portioner',
    'add.imageUrl': 'Vælg Billede (valgfri)',
    'add.selectImage': 'Vælg Billede',
    'add.uploading': 'Uploader...',
    'add.ingredients': 'Ingredienser',
    'add.addIngredient': '+ Tilføj Ingrediens',
    'add.instructions': 'Fremgangsmåde',
    'add.addInstruction': '+ Tilføj Trin',
    'add.submit': 'Gem Opskrift',
    'add.submitting': 'Gemmer...',
    'add.cancel': 'Annuller',
    
    // Categories
    'category.mainCourse': 'Hovedret',
    'category.sideDish': 'Tilbehør',
    'category.dessert': 'Dessert',
    'category.appetizer': 'Forret',
    'category.bread': 'Brød',
    'category.snack': 'Snack',
    'category.beverage': 'Drik',
    
    // Common
    'common.loading': 'Indlæser...',
    'common.error': 'Fejl',
    'common.required': '*',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.recipes': 'Recipes',
    'nav.add': 'Add',
    'nav.signOut': 'Sign Out',
    
    // Home page
    'home.title': 'Welcome to HillFood',
    'home.subtitle': 'Your personal recipe database',
    'home.getStarted': 'Get Started',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.hasAccount': 'Already have an account?',
    'auth.noAccount': "Don't have an account?",
    
    // Recipe list
    'recipes.title': 'My Recipes',
    'recipes.search': 'Search recipes...',
    'recipes.noRecipes': 'No recipes found',
    'recipes.addFirst': 'Add your first recipe!',
    
    // Recipe card
    'recipe.prep': 'Prep',
    'recipe.cook': 'Cook',
    'recipe.servings': 'Servings',
    'recipe.minutes': 'min',
    
    // Recipe detail
    'detail.backToRecipes': '← Back to Recipes',
    'detail.delete': 'Delete',
    'detail.deleteConfirm': 'Are you sure you want to delete this recipe?',
    'detail.preparationTime': 'Preparation time:',
    'detail.cookingTime': 'Cooking time:',
    'detail.totalTime': 'Total time:',
    'detail.servings': 'Servings:',
    'detail.minutes': 'minutes',
    'detail.person': 'person',
    'detail.people': 'people',
    'detail.ingredients': 'Ingredients',
    'detail.instructions': 'Instructions',
    
    // Add recipe
    'add.title': 'Add New Recipe',
    'add.recipeTitle': 'Recipe Title',
    'add.description': 'Description',
    'add.category': 'Category',
    'add.prepTime': 'Prep Time (min)',
    'add.cookTime': 'Cook Time (min)',
    'add.selectImage': 'Select Image',
    'add.uploading': 'Uploading...',
    'add.servings': 'Servings',
    'add.imageUrl': 'Select Image (optional)',
    'add.ingredients': 'Ingredients',
    'add.addIngredient': '+ Add Ingredient',
    'add.instructions': 'Instructions',
    'add.addInstruction': '+ Add Step',
    'add.submit': 'Save Recipe',
    'add.submitting': 'Saving...',
    'add.cancel': 'Cancel',
    
    // Categories
    'category.mainCourse': 'Main Course',
    'category.sideDish': 'Side Dish',
    'category.dessert': 'Dessert',
    'category.appetizer': 'Appetizer',
    'category.bread': 'Bread',
    'category.snack': 'Snack',
    'category.beverage': 'Beverage',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.required': '*',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('da')

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.da] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
