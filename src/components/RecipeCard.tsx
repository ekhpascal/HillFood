import { Link } from 'react-router-dom'
import { Recipe } from '@/types'

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      {recipe.image_url && (
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="px-2 py-1 bg-grass-100 text-grass-700 rounded font-medium">
            {recipe.category}
          </span>
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1 text-sun-700">
              <span>⏱️</span>
              {recipe.prep_time + recipe.cook_time}m
            </span>
            <span className="flex items-center gap-1 text-sun-700">
              <span>🍽️</span>
              {recipe.servings}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
