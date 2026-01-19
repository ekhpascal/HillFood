import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { recipeService } from '@/services/recipeService'
import { storageService } from '@/services/storageService'
import { RecipeFormData } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

export default function EditRecipe() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [loadingRecipe, setLoadingRecipe] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [originalImageUrl, setOriginalImageUrl] = useState('')

  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    ingredients: [{ amount: '', unit: 'g', name: '' }],
    instructions: [''],
    tips: '',
    prep_time: 0,
    cook_time: 0,
    servings: 4,
    category: 'Main Course',
    image_url: ''
  })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    loadRecipe()
  }, [id])

  const loadRecipe = async () => {
    if (!id) return

    try {
      setLoadingRecipe(true)
      const recipe = await recipeService.getRecipeById(id)
      if (recipe) {
        setFormData({
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients?.length ? recipe.ingredients : [{ amount: '', unit: 'g', name: '' }],
          instructions: recipe.instructions?.length ? recipe.instructions : [''],
          tips: recipe.tips || '',
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          servings: recipe.servings,
          category: recipe.category,
          image_url: recipe.image_url || ''
        })
        setOriginalImageUrl(recipe.image_url || '')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load recipe')
    } finally {
      setLoadingRecipe(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    
    const filteredData = {
      ...formData,
      ingredients: formData.ingredients.filter(i => i.name.trim()),
      instructions: formData.instructions.filter(i => i.trim())
    }

    try {
      setLoading(true)
      await recipeService.updateRecipe(id, filteredData)
      navigate(`/recipes/${id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to update recipe')
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, { amount: '', unit: 'g', name: '' }] })
  }

  const updateIngredient = (index: number, field: 'amount' | 'unit' | 'name', value: string) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index][field] = value
    setFormData({ ...formData, ingredients: newIngredients })
  }

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    })
  }

  const addInstruction = () => {
    setFormData({ ...formData, instructions: [...formData.instructions, ''] })
  }

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...formData.instructions]
    newInstructions[index] = value
    setFormData({ ...formData, instructions: newInstructions })
  }

  const removeInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index)
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newInstructions = [...formData.instructions]
    const draggedItem = newInstructions[draggedIndex]
    newInstructions.splice(draggedIndex, 1)
    newInstructions.splice(index, 0, draggedItem)
    
    setFormData({ ...formData, instructions: newInstructions })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError(null)
      const imageUrl = await storageService.uploadRecipeImage(file)
      
      // Delete old image if it exists and is different
      if (formData.image_url && formData.image_url !== imageUrl) {
        try {
          await storageService.deleteRecipeImage(formData.image_url)
        } catch (err) {
          console.error('Failed to delete old image:', err)
        }
      }
      
      setFormData({ ...formData, image_url: imageUrl })
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (formData.image_url) {
      try {
        await storageService.deleteRecipeImage(formData.image_url)
        setFormData({ ...formData, image_url: '' })
      } catch (err) {
        console.error('Failed to delete image:', err)
      }
    }
  }

  if (loadingRecipe) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('edit.title')}</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('add.recipeTitle')} {t('common.required')}
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('add.description')} {t('common.required')}
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('add.category')}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option>{t('category.mainCourse')}</option>
              <option>{t('category.sideDish')}</option>
              <option>{t('category.dessert')}</option>
              <option>{t('category.appetizer')}</option>
              <option>{t('category.bread')}</option>
              <option>{t('category.snack')}</option>
              <option>{t('category.beverage')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('add.prepTime')}
            </label>
            <input
              type="number"
              min="0"
              value={formData.prep_time}
              onChange={(e) => setFormData({ ...formData, prep_time: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('add.cookTime')}
            </label>
            <input
              type="number"
              min="0"
              value={formData.cook_time}
              onChange={(e) => setFormData({ ...formData, cook_time: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('add.servings')}
          </label>
          <input
            type="number"
            min="1"
            value={formData.servings}
            onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('add.imageUrl')}
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`block w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition text-center cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? t('add.uploading') : t('add.selectImage')}
            </label>
          </div>
          {formData.image_url && (
            <div className="mt-4 relative inline-block">
              <img src={formData.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-600 text-white w-8 h-8 rounded-full hover:bg-red-700 transition shadow-lg flex items-center justify-center text-lg"
                title="Fjern billede"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('add.ingredients')} {t('common.required')}
            </label>
            <button
              type="button"
              onClick={addIngredient}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {t('add.addIngredient')}
            </button>
          </div>
          <div className="space-y-2">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-1 md:gap-2 items-start">
                <input
                  type="text"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                  placeholder="2"
                  className="w-12 md:w-16 px-1 md:px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-sm"
                />
                <select
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="w-14 md:w-20 px-1 md:px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs md:text-sm"
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="tsp">tsp</option>
                  <option value="tbsp">tbsp</option>
                  <option value="pcs">pcs</option>
                  <option value="">-</option>
                </select>
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  placeholder={t('add.ingredients')}
                  className="flex-1 px-2 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('add.instructions')} {t('common.required')}
            </label>
            <button
              type="button"
              onClick={addInstruction}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {t('add.addInstruction')}
            </button>
          </div>
          <div className="space-y-2">
            {formData.instructions.map((instruction, index) => (
              <div 
                key={index} 
                className="flex gap-2 items-start"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-center gap-2 mt-2 cursor-move">
                  <span className="text-gray-400">☰</span>
                  <span className="text-sm font-medium text-gray-500 min-w-[20px]">{index + 1}.</span>
                </div>
                <textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  placeholder={`${t('add.instructions')} ${index + 1}`}
                  rows={2}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {formData.instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('add.tips')}
          </label>
          <textarea
            value={formData.tips || ''}
            onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
            rows={3}
            placeholder={t('add.tipsPlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? t('add.submitting') : t('edit.save')}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/recipes/${id}`)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            {t('add.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
