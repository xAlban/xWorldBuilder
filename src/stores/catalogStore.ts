import { create } from 'zustand'
import type { CatalogCategory } from '@/catalog/megakitRegistry'

interface CatalogState {
  searchQuery: string
  expandedCategories: Set<CatalogCategory>
  setSearchQuery: (query: string) => void
  toggleCategory: (category: CatalogCategory) => void
  expandAll: () => void
  collapseAll: () => void
}

// ---- All categories expanded by default ----
const ALL_CATEGORIES: CatalogCategory[] = [
  'trees',
  'bushes',
  'flowers',
  'grass',
  'plants',
  'mushrooms',
  'rocks',
  'paths',
  'pebbles',
  'petals',
]

export const useCatalogStore = create<CatalogState>((set) => ({
  searchQuery: '',
  expandedCategories: new Set<CatalogCategory>(ALL_CATEGORIES),

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleCategory: (category) =>
    set((s) => {
      const next = new Set(s.expandedCategories)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return { expandedCategories: next }
    }),

  expandAll: () =>
    set({ expandedCategories: new Set<CatalogCategory>(ALL_CATEGORIES) }),

  collapseAll: () =>
    set({ expandedCategories: new Set<CatalogCategory>() }),
}))
