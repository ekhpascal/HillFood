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
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const tabs = [
    { path: '/', label: t('nav.home') },
    { path: '/recipes', label: t('nav.recipes') },
    { path: '/add', label: t('nav.add') },
    { path: '/menus', label: t('nav.menus') },
    { path: '/groceries', label: t('nav.groceries') },
    { path: '/settings', label: t('nav.settings') },
  ]

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 max-w-full">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-xl md:text-2xl font-bold text-primary-600">
              HillFood
            </h1>
            
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setLanguage(language === 'da' ? 'en' : 'da')}
                className="px-2 md:px-3 py-1 text-xs md:text-sm font-medium text-gray-600 hover:text-primary-600 border border-gray-300 rounded-md transition"
              >
                {language === 'da' ? 'EN' : 'DA'}
              </button>
              
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="px-2 md:px-3 py-1 text-xs md:text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition"
                >
                  <span className="hidden sm:inline">{t('nav.signOut')}</span>
                  <span className="sm:inline md:hidden">Out</span>
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="px-2 md:px-4 py-1 text-xs md:text-sm bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition"
                >
                  <span className="hidden sm:inline">{t('auth.signIn')}</span>
                  <span className="sm:inline md:hidden">In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto max-w-full">
          <div className="flex overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`
                  flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition
                  ${isActive(tab.path)
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-primary-600 hover:border-b-2 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}
