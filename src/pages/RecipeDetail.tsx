import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { recipeService } from '@/services/recipeService'
import { Recipe, Ingredient, Note } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adjustedServings, setAdjustedServings] = useState<number>(4)
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set())
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    loadRecipe()
  }, [id])

  useEffect(() => {
    if (recipe) {
      setAdjustedServings(recipe.servings)
    }
  }, [recipe])

  const loadRecipe = async () => {
    if (!id) return

    try {
      setLoading(true)
      const data = await recipeService.getRecipeById(id)
      console.log('Recipe data:', data)
      console.log('Ingredients:', data?.ingredients)
      setRecipe(data)
      setError(null)
    } catch (err) {
      console.error('Load recipe error:', err)
      setError(`Failed to load recipe: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const calculateAdjustedAmount = (ingredient: Ingredient): string => {
    if (!recipe || !ingredient.amount) return ''
    
    const originalAmount = parseFloat(ingredient.amount)
    if (isNaN(originalAmount)) return ingredient.amount
    
    const ratio = adjustedServings / recipe.servings
    const newAmount = originalAmount * ratio
    
    // Format nicely - if it's a whole number, show no decimals, otherwise show 1 decimal
    return newAmount % 1 === 0 ? newAmount.toString() : newAmount.toFixed(1)
  }

  const handleDelete = async () => {
    if (!id || !confirm(t('detail.deleteConfirm'))) return

    try {
      await recipeService.deleteRecipe(id)
      navigate('/recipes')
    } catch (err) {
      console.error('Delete error:', err)
      alert(`Failed to delete recipe: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const clearAllSteps = () => {
    setCheckedSteps(new Set())
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !recipe || !id) return

    try {
      setSavingNote(true)
      const note: Note = {
        id: crypto.randomUUID(),
        content: newNote.trim(),
        created_at: new Date().toISOString()
      }
      
      const updatedNotes = [...(recipe.notes || []), note]
      await recipeService.updateRecipe(id, { notes: updatedNotes })
      
      setRecipe({ ...recipe, notes: updatedNotes })
      setNewNote('')
    } catch (err) {
      console.error('Failed to add note:', err)
      alert('Failed to add note')
    } finally {
      setSavingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!recipe || !id || !confirm(t('detail.deleteNoteConfirm'))) return

    try {
      const updatedNotes = (recipe.notes || []).filter(n => n.id !== noteId)
      await recipeService.updateRecipe(id, { notes: updatedNotes })
      setRecipe({ ...recipe, notes: updatedNotes })
    } catch (err) {
      console.error('Failed to delete note:', err)
      alert('Failed to delete note')
    }
  }

  const formatNoteDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-red-600">{error || 'Recipe not found'}</p>
        <button
          onClick={() => navigate('/recipes')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          {t('detail.backToRecipes')}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/recipes')}
        className="mb-4 text-primary-600 hover:text-primary-700 flex items-center"
      >
        {t('detail.backToRecipes')}
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {recipe.title}
              </h1>
              <span className="inline-block px-3 py-1 bg-grass-100 text-grass-700 rounded-full text-sm font-medium">
                {recipe.category}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/recipes/${recipe.id}/edit`}
                className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
              >
                {t('detail.edit')}
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                {t('detail.delete')}
              </button>
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-6">{recipe.description}</p>

          <div className="mb-8 space-y-2 text-gray-700">
            <div className="flex items-start">
              <span className="font-medium min-w-[140px]">{t('detail.servings')}</span>
              <select
                value={adjustedServings}
                onChange={(e) => setAdjustedServings(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i + 1 === 1 ? t('detail.person') : t('detail.people')}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-start">
              <span className="font-medium min-w-[140px]">{t('detail.preparationTime')}</span>
              <span>{recipe.prep_time} {t('detail.minutes')}</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium min-w-[140px]">{t('detail.cookingTime')}</span>
              <span>{recipe.cook_time} {t('detail.minutes')}</span>
            </div>
            <div className="flex items-start">
              <span className="font-medium min-w-[140px]">{t('detail.totalTime')}</span>
              <span>{recipe.prep_time + recipe.cook_time} {t('detail.minutes')}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('detail.ingredients')}
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => {
                  const adjustedAmount = calculateAdjustedAmount(ingredient);
                  return (
                    <li key={`${index}-${adjustedServings}`} className="flex items-start">
                      <span className="text-grass-600 mr-2 font-bold">•</span>
                      <span className="text-gray-700 flex">
                        <span className="inline-block min-w-[80px] mr-2">
                          {adjustedAmount && `${adjustedAmount} `}
                          {ingredient.unit && `${ingredient.unit}`}
                        </span>
                        <span>{ingredient.name}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('detail.instructions')}
                </h2>
                {checkedSteps.size > 0 && (
                  <button
                    onClick={clearAllSteps}
                    className="text-sm text-gray-600 hover:text-primary-600 underline"
                  >
                    {t('detail.clearChecks')}
                  </button>
                )}
              </div>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => {
                  const isChecked = checkedSteps.has(index)
                  return (
                    <li 
                      key={index} 
                      className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                      onClick={() => toggleStep(index)}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 transition ${
                        isChecked 
                          ? 'bg-green-600 text-white' 
                          : 'bg-grass-600 text-white'
                      }`}>
                        {isChecked ? '✓' : index + 1}
                      </span>
                      <span className={`pt-1 transition ${
                        isChecked 
                          ? 'text-gray-400 line-through' 
                          : 'text-gray-700'
                      }`}>
                        {instruction}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>

            {recipe.tips && (
              <div className="mt-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  💡 {t('detail.tips')}
                </h2>
                <p className="text-gray-700 whitespace-pre-line">{recipe.tips}</p>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📝 {t('detail.notes')}
              </h2>
              
              <div className="mb-6">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={t('detail.notesPlaceholder')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || savingNote}
                  className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingNote ? t('detail.savingNote') : t('detail.addNote')}
                </button>
              </div>

              <div className="space-y-3">
                {recipe.notes && recipe.notes.length > 0 ? (
                  recipe.notes.map((note) => (
                    <div key={note.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="text-gray-800 whitespace-pre-line">{note.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatNoteDate(note.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="flex-shrink-0 text-red-600 hover:bg-red-100 p-2 rounded-lg transition"
                          title={t('detail.deleteNote')}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">{t('detail.noNotes')}</p>
                )}
              </div>
            </div>

            {recipe.image_url && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  📷 {t('detail.image')}
                </h2>
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
