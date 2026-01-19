import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { recipeService } from '@/services/recipeService'
import { storageService } from '@/services/storageService'
import { RecipeFormData } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AddRecipe() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const filteredData = {
      ...formData,
      ingredients: formData.ingredients.filter(i => i.name.trim()),
      instructions: formData.instructions.filter(i => i.trim())
    }

    try {
      setLoading(true)
      await recipeService.createRecipe(filteredData)
      navigate('/recipes')
    } catch (err: any) {
      setError(err.message || 'Failed to create recipe')
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, { amount: '', unit: 'g', name: '' }] })
  }

  const updateIngredient = (index: number, field: 'amount' | 'unit' | 'name' | 'category', value: string) => {
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

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('add.title')}</h1>

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
                  <option value="tsk">tsk</option>
                  <option value="spsk">spsk</option>
                  <option value="styk">styk</option>
                  <option value="">-</option>
                </select>
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  placeholder="flour"
                  className="flex-1 min-w-0 px-2 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                <select
                  value={ingredient.category || ''}
                  onChange={(e) => updateIngredient(index, 'category', e.target.value)}
                  className="w-24 md:w-32 px-1 md:px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs md:text-sm"
                  title="Kategori"
                >
                  <option value="">Diverse</option>
                  <option value="Kød">Kød</option>
                  <option value="Grønt">Grønt</option>
                  <option value="Frugt">Frugt</option>
                  <option value="Mejeri">Mejeri</option>
                  <option value="Brød">Brød</option>
                  <option value="Tørvarer">Tørvarer</option>
                  <option value="Frost">Frost</option>
                  <option value="Drikkevarer">Drikkevarer</option>
                  <option value="Krydderier">Krydderier</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  disabled={formData.ingredients.length === 1}
                  className="px-2 md:px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Remove ingredient"
                >
                  🗑️
                </button>
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
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex gap-2 items-start cursor-move ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-center w-6 h-10 text-gray-400 cursor-move">
                  ⋮⋮
                </div>
                <textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                  rows={1}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  disabled={formData.instructions.length === 1}
                  className="px-2 md:px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Remove step"
                >
                  🗑️
                </button>
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

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? t('add.submitting') : t('add.submit')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            {t('add.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
