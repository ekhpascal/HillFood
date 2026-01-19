import { useLanguage } from '@/contexts/LanguageContext'

export default function Settings() {
  const { t } = useLanguage()
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {t('nav.settings')}
      </h1>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 text-center">
        <p className="text-lg text-gray-600">Coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">
          Configure your app settings here
        </p>
      </div>
    </div>
  )
}
