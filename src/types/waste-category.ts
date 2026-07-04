export type WasteNature = 'ibibora' | 'ibitabora'
export type WasteCategoryStatus = 'active' | 'inactive'

export interface WasteCategory {
  id: number
  name: string
  slug: string
  description?: string | null
  waste_nature: WasteNature
  is_e_waste: boolean
  is_hazardous: boolean
  average_weight_kg?: string | number | null
  min_weight_kg?: string | number | null
  max_weight_kg?: string | number | null
  price_per_kg?: string | number | null
  price_per_item?: string | number | null
  currency: string
  status: WasteCategoryStatus
  created_at?: string
  updated_at?: string
}

export interface CreateWasteCategoryPayload {
  name: string
  slug: string
  description?: string
  waste_nature: WasteNature
  is_e_waste: boolean
  is_hazardous: boolean
  average_weight_kg?: number
  min_weight_kg?: number
  max_weight_kg?: number
  price_per_kg?: number
  price_per_item?: number
  currency: string
  status: WasteCategoryStatus
}
