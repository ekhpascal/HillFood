import { useLanguage } from '@/contexts/LanguageContext'

export default function Menus() {
  const { t } = useLanguage()
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {t('nav.menus')}
      </h1>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <p className="text-lg text-gray-600">Coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">
          Plan your weekly menus here
        </p>
      </div>
    </div>
  )
}
