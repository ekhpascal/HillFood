import { supabase } from './supabase'

export const storageService = {
  async uploadRecipeImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `recipe-images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('recipes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('recipes')
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  async deleteRecipeImage(imageUrl: string): Promise<void> {
    // Extract the file path from the URL
    const urlParts = imageUrl.split('/recipes/')
    if (urlParts.length < 2) return

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('recipes')
      .remove([filePath])

    if (error) throw error
  }
}
