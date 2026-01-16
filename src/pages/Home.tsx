import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
          HillFood
        </h1>
      </div>

      <div className="mb-12">
        <img 
          src="/hero-image.png" 
          alt="HillFood" 
          className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
          onError={(e) => {
            // Fallback if image doesn't exist yet
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3EAdd hero-image.jpg to public folder%3C/text%3E%3C/svg%3E'
          }}
        />
      </div>

      <div className="mt-12 space-x-4">
        <Link
          to="/recipes"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
        >
          View Recipes
        </Link>
        <Link
          to="/add"
          className="inline-block bg-white text-primary-600 border-2 border-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition"
        >
          Add New Recipe
        </Link>
      </div>
    </div>
  )
}
