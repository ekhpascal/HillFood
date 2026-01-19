import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import * as groceryService from '@/services/groceryService'

const CATEGORIES = ['Mejeri', 'Brød', 'Kød', 'Frugt', 'Grønt', 'Frost', 'Tørvarer', 'Drikkevarer', 'Krydderier', 'diverse']

type GroceryList = groceryService.GroceryList & { items: groceryService.GroceryItem[] }

export default function Groceries() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [lists, setLists] = useState<GroceryList[]>([])
  const [selectedList, setSelectedList] = useState<GroceryList | null>(null)
  const [showNewListPrompt, setShowNewListPrompt] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [itemMemory, setItemMemory] = useState<{ [key: string]: string }>({})
  const [showCategoryPrompt, setShowCategoryPrompt] = useState(false)
  const [pendingItemName, setPendingItemName] = useState('')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadData = async () => {
    try {
      const [listsData, memoryData] = await Promise.all([
        groceryService.getGroceryLists(),
        groceryService.getItemMemory()
      ])
      setLists(listsData as GroceryList[])
      setItemMemory(memoryData)
    } catch (error) {
      console.error('Error loading groceries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim() || !user) return

    try {
      const newList = await groceryService.createGroceryList(newListName.trim())
      setLists([newList as GroceryList, ...lists])
      setNewListName('')
      setShowNewListPrompt(false)
    } catch (error) {
      console.error('Error creating list:', error)
      alert(t('common.error'))
    }
  }

  const handleAddItem = () => {
    if (!newItemName.trim()) return

    const itemNameLower = newItemName.trim().toLowerCase()
    
    // Check if we know the category for this item
    if (itemMemory[itemNameLower]) {
      // Use remembered category
      addItemWithCategory(itemMemory[itemNameLower])
    } else {
      // Prompt for category
      setPendingItemName(newItemName.trim())
      setShowCategoryPrompt(true)
    }
  }

  const addItemWithCategory = async (category: string) => {
    if (!selectedList) return
    const itemName = pendingItemName || newItemName.trim()

    try {
      const newItem = await groceryService.addGroceryItem(
        selectedList.id,
        itemName,
        category
      )

      // Remember the category
      const itemNameLower = itemName.toLowerCase()
      await groceryService.saveItemMemory(itemNameLower, category)
      setItemMemory({ ...itemMemory, [itemNameLower]: category })

      const updatedList = {
        ...selectedList,
        items: [...selectedList.items, newItem]
      }

      setLists(lists.map(list => list.id === selectedList.id ? updatedList : list))
      setSelectedList(updatedList)
      setNewItemName('')
      setPendingItemName('')
      setShowCategoryPrompt(false)
    } catch (error) {
      console.error('Error adding item:', error)
      alert(t('common.error'))
    }
  }

  const updateItemQuantity = async (itemId: string, delta: number) => {
    if (!selectedList) return

    const item = selectedList.items.find(i => i.id === itemId)
    if (!item) return

    const newQuantity = Math.max(1, item.quantity + delta)

    try {
      await groceryService.updateGroceryItem(itemId, { quantity: newQuantity })

      const updatedList = {
        ...selectedList,
        items: selectedList.items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      }

      setLists(lists.map(list => list.id === selectedList.id ? updatedList : list))
      setSelectedList(updatedList)
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const updateItemCategory = async (itemId: string, category: string) => {
    if (!selectedList) return

    const item = selectedList.items.find(i => i.id === itemId)
    if (!item) return

    try {
      await groceryService.updateGroceryItem(itemId, { category })
      
      // Update memory
      await groceryService.saveItemMemory(item.name.toLowerCase(), category)
      setItemMemory({ ...itemMemory, [item.name.toLowerCase()]: category })

      const updatedList = {
        ...selectedList,
        items: selectedList.items.map(item =>
          item.id === itemId ? { ...item, category } : item
        )
      }

      setLists(lists.map(list => list.id === selectedList.id ? updatedList : list))
      setSelectedList(updatedList)
      setEditingItem(null)
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const toggleItem = async (itemId: string) => {
    if (!selectedList) return

    const item = selectedList.items.find(i => i.id === itemId)
    if (!item) return

    try {
      await groceryService.updateGroceryItem(itemId, { checked: !item.checked })

      const updatedList = {
        ...selectedList,
        items: selectedList.items.map(item =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        )
      }

      setLists(lists.map(list => list.id === selectedList.id ? updatedList : list))
      setSelectedList(updatedList)
    } catch (error) {
      console.error('Error toggling item:', error)
    }
  }

  // const deleteItem = async (itemId: string) => {
  //   if (!selectedList) return

  //   try {
  //     await groceryService.deleteGroceryItem(itemId)

  //     const updatedList = {
  //       ...selectedList,
  //       items: selectedList.items.filter(item => item.id !== itemId)
  //     }

  //     setLists(lists.map(list => list.id === selectedList.id ? updatedList : list))
  //     setSelectedList(updatedList)
  //   } catch (error) {
  //     console.error('Error deleting item:', error)
  //   }
  // }

  const deleteList = async (listId: string) => {
    if (!confirm(t('groceries.deleteListConfirm'))) return
    
    try {
      await groceryService.deleteGroceryList(listId)
      setLists(lists.filter(list => list.id !== listId))
      if (selectedList?.id === listId) {
        setSelectedList(null)
      }
    } catch (error) {
      console.error('Error deleting list:', error)
      alert(t('common.error'))
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-lg text-gray-700">{t('auth.loginRequired')}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  // List view
  if (!selectedList) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('groceries.title')}
          </h1>
          <button
            onClick={() => setShowNewListPrompt(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
          >
            + {t('groceries.newList')}
          </button>
        </div>

        {showNewListPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t('groceries.createList')}
              </h2>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder={t('groceries.listNamePlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreateList}
                  disabled={!newListName.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {t('groceries.create')}
                </button>
                <button
                  onClick={() => {
                    setShowNewListPrompt(false)
                    setNewListName('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.length > 0 ? (
            lists.map((list) => (
              <div
                key={list.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedList(list)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {list.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {list.items.filter(item => !item.checked).length} {t('groceries.items')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteList(list.id)
                    }}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <p className="text-lg text-gray-600">{t('groceries.noLists')}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Detail view
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => setSelectedList(null)}
        className="mb-4 text-primary-600 hover:text-primary-700 flex items-center"
      >
        ← {t('groceries.backToLists')}
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b">
          {selectedList.name}
        </h1>

        {/* Category selection prompt */}
        {showCategoryPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t('groceries.selectCategory')}
              </h2>
              <p className="text-gray-600 mb-4">"{pendingItemName || newItemName}"</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => addItemWithCategory(cat)}
                    className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-primary-50 hover:border-primary-600 transition text-left"
                  >
                    {t(`groceries.category.${cat}`)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowCategoryPrompt(false)
                  setPendingItemName('')
                }}
                className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Active items grouped by category */}
        <div className="space-y-6 mb-6">
          {CATEGORIES.map(category => {
            const categoryItems = selectedList.items.filter(
              item => !item.checked && item.category === category
            )
            if (categoryItems.length === 0) return null

            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  {t(`groceries.category.${category}`)}
                </h3>
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition"
                    >
                      <div
                        onClick={() => toggleItem(item.id)}
                        className="flex-1 cursor-pointer"
                      >
                        <span className="text-gray-900">
                          {item.name}
                          {item.quantity > 1 && (
                            <span className="text-gray-500 ml-2">({item.quantity})</span>
                          )}
                        </span>
                      </div>
                      <button
                        onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                        className="text-gray-400 hover:text-primary-600 p-2"
                      >
                        ⚙️
                      </button>
                      
                      {/* Edit menu */}
                      {editingItem === item.id && (
                        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                            <span className="text-sm text-gray-600">{t('groceries.quantity')}:</span>
                            <button
                              onClick={() => updateItemQuantity(item.id, -1)}
                              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateItemQuantity(item.id, 1)}
                              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">{t('groceries.changeCategory')}:</div>
                          <div className="space-y-1">
                            {CATEGORIES.map(cat => (
                              <button
                                key={cat}
                                onClick={() => updateItemCategory(item.id, cat)}
                                className={`block w-full text-left px-3 py-1 text-sm rounded hover:bg-gray-100 ${
                                  item.category === cat ? 'bg-primary-50 text-primary-600' : ''
                                }`}
                              >
                                {t(`groceries.category.${cat}`)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add item field */}
        <div className="mb-6 pb-6 border-b">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={t('groceries.addItemPlaceholder')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <button
              onClick={handleAddItem}
              disabled={!newItemName.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {t('groceries.add')}
            </button>
          </div>
        </div>

        {/* Checked items (history) */}
        <div className="space-y-2">
          {selectedList.items.filter(item => item.checked).length > 0 && (
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              {t('groceries.completed')}
            </h3>
          )}
          {selectedList.items.filter(item => item.checked).map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
            >
              <span className="text-gray-400 line-through">{item.name}</span>
            </div>
          ))}
        </div>

        {selectedList.items.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            {t('groceries.noItems')}
          </p>
        )}
      </div>
    </div>
  )
}
