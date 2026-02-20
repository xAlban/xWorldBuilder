import { useCallback } from 'react'
import { useBuilderStore } from '@/stores/builderStore'
import { CATEGORY_COLORS } from '@/catalog/megakitRegistry'
import type { CatalogEntry } from '@/catalog/megakitRegistry'

interface CatalogItemProps {
  entry: CatalogEntry
}

function CatalogItem({ entry }: CatalogItemProps) {
  const mode = useBuilderStore((s) => s.mode)
  const placingModelId = useBuilderStore((s) => s.placingModelId)
  const setMode = useBuilderStore((s) => s.setMode)
  const setPlacingModel = useBuilderStore((s) => s.setPlacingModel)

  const isActive =
    (mode === 'place' || mode === 'scatter') &&
    placingModelId === entry.modelId

  const handleClick = useCallback(() => {
    if (isActive) {
      // ---- Deselect ----
      setMode('select')
    } else if (mode === 'scatter') {
      // ---- Stay in scatter mode, just switch model ----
      setPlacingModel(entry.modelId)
    } else {
      setMode('place', entry.modelId)
    }
  }, [isActive, mode, setMode, setPlacingModel, entry.modelId])

  return (
    <button
      onClick={handleClick}
      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-zinc-300 hover:bg-zinc-700'
      }`}
    >
      {/* ---- Category color dot ---- */}
      <span
        className="inline-block h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: CATEGORY_COLORS[entry.category] }}
      />
      <span className="truncate">{entry.label}</span>
      {entry.alreadyInXTactics && (
        <span className="ml-auto shrink-0 text-[10px] text-zinc-500">
          xt
        </span>
      )}
    </button>
  )
}

export default CatalogItem
