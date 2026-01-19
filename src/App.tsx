import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import AddRecipe from './pages/AddRecipe'
import EditRecipe from './pages/EditRecipe'
import RecipeDetail from './pages/RecipeDetail'
import Auth from './pages/Auth'
import Menus from './pages/Menus'
import Groceries from './pages/Groceries'
import Settings from './pages/Settings'

function App() {
  return (
    <LanguageProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route
            path="/add"
            element={
              <ProtectedRoute>
                <AddRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes/:id/edit"
            element={
              <ProtectedRoute>
                <EditRecipe />
              </ProtectedRoute>
            }
          />
          <Route path="/menus" element={<Menus />} />
          <Route path="/groceries" element={<Groceries />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </LanguageProvider>
  )
}

export default App
