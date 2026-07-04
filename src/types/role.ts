export interface Role {
  id: number
  name: string
  slug: string
  description?: string | null
  permissions?: string[] | string | null
  created_at?: string
  updated_at?: string
}