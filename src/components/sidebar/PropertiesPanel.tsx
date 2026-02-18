import { useCallback } from 'react'
import { Trash2 } from 'lucide-react'
import { useBuilderStore } from '@/stores/builderStore'
import { CATALOG_BY_ID } from '@/catalog/megakitRegistry'

function PropertiesPanel() {
  const selectedIds = useBuilderStore((s) => s.selectedIds)
  const objects = useBuilderStore((s) => s.objects)
  const updateObject = useBuilderStore((s) => s.updateObject)
  const removeObjects = useBuilderStore((s) => s.removeObjects)

  const selectedObjects = objects.filter((o) => selectedIds.includes(o.id))

  if (selectedObjects.length === 0) {
    return (
      <div className="px-2 text-xs text-zinc-500">
        Select an object to edit properties
      </div>
    )
  }

  // ---- Single selection: full editing ----
  if (selectedObjects.length === 1) {
    const obj = selectedObjects[0]!
    const catalogEntry = CATALOG_BY_ID[obj.modelId]

    return (
      <div className="flex flex-col gap-2">
        <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Properties
        </h3>

        {/* ---- Model name ---- */}
        <div className="px-2 text-sm text-zinc-300">
          {catalogEntry?.label ?? obj.modelId}
        </div>

        {/* ---- Position ---- */}
        <div className="flex gap-2 px-2">
          <NumberField
            label="X"
            value={obj.position.x}
            onChange={(v) =>
              updateObject(obj.id, {
                position: { ...obj.position, x: v },
              })
            }
          />
          <NumberField
            label="Z"
            value={obj.position.z}
            onChange={(v) =>
              updateObject(obj.id, {
                position: { ...obj.position, z: v },
              })
            }
          />
        </div>

        {/* ---- Rotation ---- */}
        <div className="px-2">
          <NumberField
            label="Rotation"
            value={Math.round((obj.rotationY * 180) / Math.PI)}
            onChange={(v) =>
              updateObject(obj.id, {
                rotationY: (v * Math.PI) / 180,
              })
            }
            suffix="°"
          />
        </div>

        {/* ---- Scale ---- */}
        <div className="px-2">
          <NumberField
            label="Scale"
            value={obj.scale}
            onChange={(v) => updateObject(obj.id, { scale: v })}
            step={0.1}
          />
        </div>

        {/* ---- Collision ---- */}
        <div className="flex items-center gap-2 px-2">
          <label className="flex items-center gap-1.5 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={!obj.noCollision}
              onChange={(e) =>
                updateObject(obj.id, {
                  noCollision: !e.target.checked,
                })
              }
              className="h-3 w-3"
            />
            Has collision
          </label>
        </div>

        {/* ---- Collision size ---- */}
        {!obj.noCollision && (
          <div className="flex gap-2 px-2">
            <NumberField
              label="Col X"
              value={obj.collisionSize.x}
              onChange={(v) =>
                updateObject(obj.id, {
                  collisionSize: { ...obj.collisionSize, x: v },
                })
              }
              step={0.5}
            />
            <NumberField
              label="Col Z"
              value={obj.collisionSize.z}
              onChange={(v) =>
                updateObject(obj.id, {
                  collisionSize: { ...obj.collisionSize, z: v },
                })
              }
              step={0.5}
            />
          </div>
        )}

        {/* ---- Delete button ---- */}
        <div className="px-2">
          <button
            onClick={() => removeObjects([obj.id])}
            className="flex w-full items-center justify-center gap-1.5 rounded bg-red-900/50 px-2 py-1.5 text-xs text-red-300 hover:bg-red-900/80"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      </div>
    )
  }

  // ---- Multi selection ----
  return (
    <div className="flex flex-col gap-2">
      <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Properties
      </h3>
      <div className="px-2 text-sm text-zinc-300">
        {selectedObjects.length} objects selected
      </div>
      <div className="px-2">
        <button
          onClick={() => removeObjects(selectedIds)}
          className="flex w-full items-center justify-center gap-1.5 rounded bg-red-900/50 px-2 py-1.5 text-xs text-red-300 hover:bg-red-900/80"
        >
          <Trash2 className="h-3 w-3" />
          Delete All
        </button>
      </div>
    </div>
  )
}

// ---- Reusable number input field ----
function NumberField({
  label,
  value,
  onChange,
  step = 1,
  suffix,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
  suffix?: string
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.target.value)
      if (!isNaN(parsed)) {
        onChange(parsed)
      }
    },
    [onChange],
  )

  return (
    <div className="flex flex-1 flex-col gap-0.5">
      <label className="text-[10px] text-zinc-500">
        {label}
        {suffix}
      </label>
      <input
        type="number"
        value={Math.round(value * 100) / 100}
        onChange={handleChange}
        step={step}
        className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )
}

export default PropertiesPanel
