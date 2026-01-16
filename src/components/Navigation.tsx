import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'bg-primary-700'
      : 'bg-primary-600 hover:bg-primary-700'
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xl md:text-2xl font-bold text-primary-600">
              HillFood
            </Link>
            <Link
              to="/"
              className={`px-2 md:px-3 py-1 rounded-md text-xs font-medium text-white transition ${isActive('/')}`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/recipes"
              className={`px-2 md:px-3 py-1 rounded-md text-xs font-medium text-white transition ${isActive('/recipes')}`}
            >
              {t('nav.recipes')}
            </Link>
            <Link
              to="/add"
              className={`px-2 md:px-3 py-1 rounded-md text-xs font-medium text-white transition ${isActive('/add')}`}
            >
              {t('nav.add')}
            </Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setLanguage(language === 'da' ? 'en' : 'da')}
              className="ml-4 md:ml-8 px-2 py-1 text-xs md:text-sm font-medium text-gray-600 hover:text-primary-600 border border-gray-300 rounded-md"
            >
              {language === 'da' ? 'EN' : 'DA'}
            </button>
            
            {user ? (
              <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-4 pl-2 md:pl-4 border-l border-gray-300">
                <span className="hidden md:inline text-sm text-gray-600 max-w-[120px] lg:max-w-none truncate">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-2 md:px-3 py-2 text-xs md:text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition"
                >
                  {t('nav.signOut')}
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="ml-2 md:ml-4 px-3 md:px-4 py-2 bg-primary-600 text-white rounded-md text-xs md:text-sm font-medium hover:bg-primary-700 transition"
              >
                {t('auth.signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
