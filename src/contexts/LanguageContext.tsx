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
    'nav.menus': 'Menuer',
    'nav.groceries': 'Indkøb',
    'nav.settings': 'Indstillinger',
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
    'detail.edit': 'Rediger',
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
    'detail.tips': 'Tips & Tricks',
    'detail.clearChecks': 'Ryd alle afkrydsninger',
    'detail.notes': 'Noter',
    'detail.notesPlaceholder': 'Skriv dine noter, erfaringer eller justeringer til opskriften...',
    'detail.addNote': 'Tilføj Note',
    'detail.savingNote': 'Gemmer...',
    'detail.deleteNote': 'Slet observation',
    'detail.deleteNoteConfirm': 'Er du sikker på, at du vil slette denne observation?',
    'detail.noNotes': 'Ingen noter endnu. Tilføj dine erfaringer med opskriften!',
    'detail.image': 'Billede',
    
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
    'add.tips': 'Tips & Tricks (valgfri)',
    'add.tipsPlaceholder': 'Tilføj nyttige tips, tricks eller variationer til opskriften...',
    
    // Edit recipe
    'edit.title': 'Rediger Opskrift',
    'edit.save': 'Gem Ændringer',
    
    // Groceries
    'groceries.title': 'Indkøbslister',
    'groceries.newList': 'Ny Liste',
    'groceries.createList': 'Opret Ny Indkøbsliste',
    'groceries.listNamePlaceholder': 'F.eks. Weekendindkøb',
    'groceries.create': 'Opret',
    'groceries.items': 'varer',
    'groceries.noLists': 'Ingen indkøbslister endnu. Opret din første!',
    'groceries.backToLists': 'Tilbage til lister',
    'groceries.addItemPlaceholder': 'Tilføj vare...',
    'groceries.add': 'Tilføj',
    'groceries.noItems': 'Ingen varer på listen endnu',
    'groceries.deleteListConfirm': 'Er du sikker på, at du vil slette denne liste?',
    'groceries.completed': 'Udført',
    'groceries.selectCategory': 'Vælg Kategori',
    'groceries.quantity': 'Antal',
    'groceries.changeCategory': 'Skift kategori',
    'groceries.category.Mejeri': 'Mejeri',
    'groceries.category.Brød': 'Brød',
    'groceries.category.Kød': 'Kød',
    'groceries.category.Frugt': 'Frugt',
    'groceries.category.Grønt': 'Grønt',
    'groceries.category.Frost': 'Frost',
    'groceries.category.Tørvarer': 'Tørvarer',
    'groceries.category.Drikkevarer': 'Drikkevarer',
    'groceries.category.Krydderier': 'Krydderier',
    'groceries.category.diverse': 'Diverse',
    
    // Categories
    'category.mainCourse': 'Hovedret',
    'category.sideDish': 'Tilbehør',
    'category.dessert': 'Dessert',
    'category.appetizer': 'Forret',
    'category.bread': 'Brød',
    'category.snack': 'Snack',
    'category.beverage': 'Drik',
    
    // Menus
    'menus.title': 'Mine Menuer',
    'menus.createMenu': 'Opret Menu',
    'menus.menuNamePlaceholder': 'Fx: Ugens Menu, Søndag Middag...',
    'menus.create': 'Opret',
    'menus.deleteConfirm': 'Er du sikker på, at du vil slette denne menu?',
    'menus.recipes': 'opskrifter',
    'menus.servings': 'personer',
    'menus.noMenus': 'Ingen menuer endnu. Opret en menu for at komme i gang!',
    'menus.backToMenus': 'Tilbage til Menuer',
    'menus.addRecipe': 'Tilføj Opskrift',
    'menus.courseType': 'Rettype',
    'menus.course.starter': 'Forret',
    'menus.course.main': 'Hovedret',
    'menus.course.dessert': 'Dessert',
    'menus.noRecipesInCourse': 'Ingen opskrifter i denne kategori',
    'menus.generateShoppingList': 'Opret Indkøbsliste',
    'menus.shoppingListCreated': 'Indkøbsliste oprettet',
    
    // Common
    'common.loading': 'Indlæser...',
    'common.error': 'Fejl',
    'common.required': '*',
    'common.cancel': 'Annuller',
    'auth.loginRequired': 'Du skal være logget ind for at bruge denne funktion',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.recipes': 'Recipes',
    'nav.add': 'Add',
    'nav.menus': 'Menus',
    'nav.groceries': 'Groceries',
    'nav.settings': 'Settings',
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
    'detail.backToRecipes': '← Back to Recipes',    'detail.edit': 'Edit',    'detail.delete': 'Delete',
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
    'detail.tips': 'Tips & Tricks',
    'detail.clearChecks': 'Clear all checkmarks',
    'detail.notes': 'Observations & Experiences',
    'detail.notesPlaceholder': 'Write your observations, experiences, or adjustments to the recipe...',
    'detail.addNote': 'Add Note',
    'detail.savingNote': 'Saving...',
    'detail.deleteNote': 'Delete observation',
    'detail.deleteNoteConfirm': 'Are you sure you want to delete this observation?',
    'detail.noNotes': 'No observations yet. Add your experiences with this recipe!',
    'detail.image': 'Image',
    
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
    'add.tips': 'Tips & Tricks (optional)',
    'add.tipsPlaceholder': 'Add useful tips, tricks, or variations for this recipe...',
    'add.cancel': 'Cancel',
    
    // Edit recipe
    'edit.title': 'Edit Recipe',
    'edit.save': 'Save Changes',
    
    // Groceries
    'groceries.title': 'Grocery Lists',
    'groceries.newList': 'New List',
    'groceries.createList': 'Create New Grocery List',
    'groceries.listNamePlaceholder': 'E.g. Weekend Shopping',
    'groceries.create': 'Create',
    'groceries.items': 'items',
    'groceries.noLists': 'No grocery lists yet. Create your first one!',
    'groceries.backToLists': 'Back to lists',
    'groceries.addItemPlaceholder': 'Add item...',
    'groceries.add': 'Add',
    'groceries.noItems': 'No items on this list yet',
    'groceries.completed': 'Completed',
    'groceries.deleteListConfirm': 'Are you sure you want to delete this list?',
    'groceries.selectCategory': 'Select Category',
    'groceries.quantity': 'Quantity',
    'groceries.changeCategory': 'Change category',
    'groceries.category.Mejeri': 'Dairy',
    'groceries.category.Brød': 'Bread',
    'groceries.category.Kød': 'Meat',
    'groceries.category.Frugt': 'Fruit',
    'groceries.category.Grønt': 'Vegetables',
    'groceries.category.Frost': 'Frozen',
    'groceries.category.Tørvarer': 'Dry Goods',
    'groceries.category.Drikkevarer': 'Beverages',
    'groceries.category.Krydderier': 'Spices',
    'groceries.category.diverse': 'Misc',
    
    // Menus
    'menus.title': 'My Menus',
    'menus.createMenu': 'Create Menu',
    'menus.menuNamePlaceholder': 'E.g.: Weekly Menu, Sunday Dinner...',
    'menus.create': 'Create',
    'menus.deleteConfirm': 'Are you sure you want to delete this menu?',
    'menus.recipes': 'recipes',
    'menus.servings': 'servings',
    'menus.noMenus': 'No menus yet. Create a menu to get started!',
    'menus.backToMenus': 'Back to Menus',
    'menus.addRecipe': 'Add Recipe',
    'menus.courseType': 'Course Type',
    'menus.course.starter': 'Starter',
    'menus.course.main': 'Main Course',
    'menus.course.dessert': 'Dessert',
    'menus.noRecipesInCourse': 'No recipes in this course',
    'menus.generateShoppingList': 'Generate Shopping List',
    'menus.shoppingListCreated': 'Shopping list created',
    
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
    'common.cancel': 'Cancel',    'auth.loginRequired': 'You need to be logged in to use this feature',  }
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
