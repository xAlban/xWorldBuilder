import { useMemo } from 'react'
import { Search, ChevronDown, ChevronRight } from 'lucide-react'
import { useCatalogStore } from '@/stores/catalogStore'
import {
  MEGAKIT_CATALOG,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  type CatalogCategory,
} from '@/catalog/megakitRegistry'
import CatalogItem from './CatalogItem'

function CatalogPanel() {
  const searchQuery = useCatalogStore((s) => s.searchQuery)
  const setSearchQuery = useCatalogStore((s) => s.setSearchQuery)
  const expandedCategories = useCatalogStore((s) => s.expandedCategories)
  const toggleCategory = useCatalogStore((s) => s.toggleCategory)

  // ---- Filter models by search query ----
  const filteredByCategory = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    const grouped: Record<CatalogCategory, typeof MEGAKIT_CATALOG> = {
      trees: [],
      bushes: [],
      flowers: [],
      grass: [],
      plants: [],
      mushrooms: [],
      rocks: [],
      paths: [],
      pebbles: [],
      petals: [],
    }

    for (const entry of MEGAKIT_CATALOG) {
      if (
        query &&
        !entry.label.toLowerCase().includes(query) &&
        !entry.modelId.toLowerCase().includes(query)
      ) {
        continue
      }
      grouped[entry.category].push(entry)
    }

    return grouped
  }, [searchQuery])

  return (
    <div className="flex flex-col gap-1">
      <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Models
      </h3>

      {/* ---- Search input ---- */}
      <div className="relative px-2">
        <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search models..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded bg-zinc-800 py-1.5 pl-8 pr-2 text-sm text-zinc-300 placeholder-zinc-500 outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* ---- Category sections ---- */}
      <div className="flex flex-col gap-0.5 overflow-y-auto">
        {CATEGORY_ORDER.map((category) => {
          const entries = filteredByCategory[category]
          if (entries.length === 0) return null

          const isExpanded = expandedCategories.has(category)

          return (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="flex w-full items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-200"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                {CATEGORY_LABELS[category]}
                <span className="ml-auto text-zinc-600">
                  {entries.length}
                </span>
              </button>

              {isExpanded && (
                <div className="flex flex-col gap-0.5 pl-2">
                  {entries.map((entry) => (
                    <CatalogItem key={entry.modelId} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CatalogPanel
