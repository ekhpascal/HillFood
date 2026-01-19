import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import * as menuService from '@/services/menuService'
import { recipeService } from '@/services/recipeService'
import type { Menu, Recipe, CourseType } from '@/types'

const COURSE_TYPES: CourseType[] = ['starter', 'main', 'dessert']

export default function Menus() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [menus, setMenus] = useState<Menu[]>([])
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [showNewMenuPrompt, setShowNewMenuPrompt] = useState(false)
  const [newMenuName, setNewMenuName] = useState('')
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false)
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([])
  const [selectedCourse, setSelectedCourse] = useState<CourseType>('main')
  const [loading, setLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadData = async () => {
    try {
      const [menusData, recipesData] = await Promise.all([
        menuService.getMenus(),
        recipeService.getAllRecipes()
      ])
      console.log('Loaded menus:', menusData)
      setMenus(menusData)
      setAvailableRecipes(recipesData)
    } catch (error) {
      console.error('Error loading menus:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMenu = async () => {
    if (!newMenuName.trim() || !user) return

    try {
      const newMenu = await menuService.createMenu(newMenuName.trim(), 4)
      setMenus([newMenu, ...menus])
      setNewMenuName('')
      setShowNewMenuPrompt(false)
    } catch (error) {
      console.error('Error creating menu:', error)
      alert(t('common.error'))
    }
  }

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm(t('menus.deleteConfirm'))) return

    try {
      await menuService.deleteMenu(menuId)
      setMenus(menus.filter(m => m.id !== menuId))
      if (selectedMenu?.id === menuId) {
        setSelectedMenu(null)
      }
    } catch (error) {
      console.error('Error deleting menu:', error)
      alert(t('common.error'))
    }
  }

  const handleUpdateServings = async (delta: number) => {
    if (!selectedMenu) return

    const newServings = Math.max(1, selectedMenu.servings + delta)
    try {
      await menuService.updateMenu(selectedMenu.id, { servings: newServings })
      const updatedMenu = { ...selectedMenu, servings: newServings }
      setSelectedMenu(updatedMenu)
      setMenus(menus.map(m => m.id === selectedMenu.id ? updatedMenu : m))
    } catch (error) {
      console.error('Error updating servings:', error)
    }
  }

  const handleAddRecipe = async (recipeId: string) => {
    if (!selectedMenu) return

    console.log('Adding recipe:', recipeId, 'to course:', selectedCourse)
    try {
      const menuRecipe = await menuService.addRecipeToMenu(
        selectedMenu.id,
        recipeId,
        selectedCourse
      )
      
      console.log('Menu recipe added:', menuRecipe)

      const updatedMenu = {
        ...selectedMenu,
        menu_recipes: [...(selectedMenu.menu_recipes || []), menuRecipe]
      }

      setSelectedMenu(updatedMenu)
      setMenus(menus.map(m => m.id === selectedMenu.id ? updatedMenu : m))
      setShowAddRecipeModal(false)
    } catch (error) {
      console.error('Error adding recipe:', error)
      alert(t('common.error'))
    }
  }

  const handleRemoveRecipe = async (menuRecipeId: string) => {
    if (!selectedMenu) return

    try {
      await menuService.removeRecipeFromMenu(menuRecipeId)

      const updatedMenu = {
        ...selectedMenu,
        menu_recipes: selectedMenu.menu_recipes?.filter(mr => mr.id !== menuRecipeId)
      }

      setSelectedMenu(updatedMenu)
      setMenus(menus.map(m => m.id === selectedMenu.id ? updatedMenu : m))
    } catch (error) {
      console.error('Error removing recipe:', error)
    }
  }

  const handleDragStart = (menuRecipeId: string) => {
    setDraggedItem(menuRecipeId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetId: string, courseType: CourseType) => {
    if (!draggedItem || !selectedMenu || draggedItem === targetId) {
      setDraggedItem(null)
      return
    }

    try {
      const courseRecipes = selectedMenu.menu_recipes?.filter(mr => mr.course_type === courseType) || []
      const draggedIndex = courseRecipes.findIndex(mr => mr.id === draggedItem)
      const targetIndex = courseRecipes.findIndex(mr => mr.id === targetId)

      if (draggedIndex === -1 || targetIndex === -1) return

      // Reorder
      const reordered = [...courseRecipes]
      const [removed] = reordered.splice(draggedIndex, 1)
      reordered.splice(targetIndex, 0, removed)

      // Update positions in database
      await menuService.reorderMenuRecipes(
        selectedMenu.id,
        courseType,
        reordered.map(mr => mr.id)
      )

      // Update local state
      const updatedMenuRecipes = selectedMenu.menu_recipes?.map(mr => {
        if (mr.course_type !== courseType) return mr
        const newIndex = reordered.findIndex(r => r.id === mr.id)
        return { ...mr, position: newIndex }
      }).sort((a, b) => a.position - b.position)

      const updatedMenu = { ...selectedMenu, menu_recipes: updatedMenuRecipes }
      setSelectedMenu(updatedMenu)
      setMenus(menus.map(m => m.id === selectedMenu.id ? updatedMenu : m))
    } catch (error) {
      console.error('Error reordering recipes:', error)
    } finally {
      setDraggedItem(null)
    }
  }

  const handleGenerateShoppingList = async () => {
    if (!selectedMenu) return

    try {
      const groceryList = await menuService.generateShoppingList(selectedMenu.id)
      alert(`${t('menus.shoppingListCreated')}: ${groceryList.name}`)
      navigate('/groceries')
    } catch (error) {
      console.error('Error generating shopping list:', error)
      alert(t('common.error'))
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-lg text-gray-700">{t('auth.loginRequired')}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  // List view
  if (!selectedMenu) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('menus.title')}</h1>
          <button
            onClick={() => setShowNewMenuPrompt(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
          >
            + {t('menus.createMenu')}
          </button>
        </div>

        {showNewMenuPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t('menus.createMenu')}
              </h2>
              <input
                type="text"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                placeholder={t('menus.menuNamePlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateMenu()}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreateMenu}
                  disabled={!newMenuName.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {t('menus.create')}
                </button>
                <button
                  onClick={() => {
                    setShowNewMenuPrompt(false)
                    setNewMenuName('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.length > 0 ? (
            menus.map((menu) => (
              <div
                key={menu.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedMenu(menu)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {menu.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {menu.menu_recipes?.length || 0} {t('menus.recipes')} • {menu.servings} {t('menus.servings')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteMenu(menu.id)
                    }}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <p className="text-lg text-gray-600">{t('menus.noMenus')}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Detail view
  const getRecipesByCourse = (course: CourseType) => {
    return selectedMenu.menu_recipes
      ?.filter(mr => mr.course_type === course)
      .sort((a, b) => a.position - b.position) || []
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => setSelectedMenu(null)}
        className="mb-4 text-primary-600 hover:text-primary-700 flex items-center"
      >
        ← {t('menus.backToMenus')}
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{selectedMenu.name}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('menus.servings')}:</span>
              <button
                onClick={() => handleUpdateServings(-1)}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                -
              </button>
              <span className="text-lg font-semibold">{selectedMenu.servings}</span>
              <button
                onClick={() => handleUpdateServings(1)}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Add recipe modal */}
        {showAddRecipeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t('menus.addRecipe')}
              </h2>
              
              <div className="mb-4">
                <div className="flex gap-2">
                  {COURSE_TYPES.map(course => (
                    <button
                      key={course}
                      onClick={() => setSelectedCourse(course)}
                      className={`px-4 py-2 rounded-lg transition ${
                        selectedCourse === course
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(`menus.course.${course}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {availableRecipes
                  .filter(recipe => {
                    // Filter recipes based on selected course
                    const categoryLower = recipe.category.toLowerCase()
                    if (selectedCourse === 'starter') {
                      return categoryLower.includes('forret') || categoryLower.includes('starter')
                    } else if (selectedCourse === 'main') {
                      return categoryLower.includes('hovedret') || categoryLower.includes('main')
                    } else if (selectedCourse === 'dessert') {
                      return categoryLower.includes('dessert')
                    }
                    return true
                  })
                  .map(recipe => (
                    <div
                      key={recipe.id}
                      onClick={() => handleAddRecipe(recipe.id)}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >
                      <h3 className="font-semibold text-gray-900">{recipe.title}</h3>
                      <p className="text-sm text-gray-500">{recipe.category}</p>
                    </div>
                  ))}
              </div>

              <button
                onClick={() => setShowAddRecipeModal(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Course sections */}
        <div className="space-y-8">
          {COURSE_TYPES.map(course => {
            const recipes = getRecipesByCourse(course)
            return (
              <div key={course}>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  {t(`menus.course.${course}`)}
                </h2>
                <div className="space-y-2">
                  {recipes.map(menuRecipe => (
                    <div
                      key={menuRecipe.id}
                      draggable
                      onDragStart={() => handleDragStart(menuRecipe.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(menuRecipe.id, course)}
                      className={`p-4 bg-gray-50 rounded-lg border-2 transition cursor-move ${
                        draggedItem === menuRecipe.id
                          ? 'border-primary-400 opacity-50'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {menuRecipe.recipe?.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {menuRecipe.recipe?.servings} {t('menus.servings')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveRecipe(menuRecipe.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  {recipes.length === 0 && (
                    <p className="text-gray-400 text-center py-4">
                      {t('menus.noRecipesInCourse')}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => {
              setSelectedCourse('main')
              setShowAddRecipeModal(true)
            }}
            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
          >
            + {t('menus.addRecipe')}
          </button>
          {selectedMenu.menu_recipes && selectedMenu.menu_recipes.length > 0 && (
            <button
              onClick={handleGenerateShoppingList}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              🛒 {t('menus.generateShoppingList')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
