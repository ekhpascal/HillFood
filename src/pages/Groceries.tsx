import { useLanguage } from '@/contexts/LanguageContext'

export default function Groceries() {
  const { t } = useLanguage()
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {t('nav.groceries')}
      </h1>
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <p className="text-lg text-gray-600">Coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">
          Manage your grocery lists here
        </p>
      </div>
    </div>
  )
}
