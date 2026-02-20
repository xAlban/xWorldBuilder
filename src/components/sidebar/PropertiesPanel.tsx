import { useCallback, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import { useBuilderStore } from '@/stores/builderStore'
import { CATALOG_BY_ID } from '@/catalog/megakitRegistry'
import type { BuilderObject } from '@/types/builder'

function PropertiesPanel() {
  const selectedIds = useBuilderStore((s) => s.selectedIds)
  const objects = useBuilderStore((s) => s.objects)
  const updateObject = useBuilderStore((s) => s.updateObject)
  const updateObjects = useBuilderStore((s) => s.updateObjects)
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
    return (
      <SingleObjectPanel
        obj={selectedObjects[0]!}
        updateObject={updateObject}
        removeObjects={removeObjects}
      />
    )
  }

  // ---- Multi selection: batch editing ----
  return (
    <MultiObjectPanel
      objects={selectedObjects}
      selectedIds={selectedIds}
      updateObjects={updateObjects}
      removeObjects={removeObjects}
    />
  )
}

// ---- Single object editing panel ----
function SingleObjectPanel({
  obj,
  updateObject,
  removeObjects,
}: {
  obj: BuilderObject
  updateObject: (id: string, updates: Partial<BuilderObject>) => void
  removeObjects: (ids: string[]) => void
}) {
  const catalogEntry = CATALOG_BY_ID[obj.modelId]
  const isPortal = obj.type === 'combatPortal' || obj.type === 'zonePortal'

  // ---- Resolve display name ----
  const displayName = isPortal
    ? obj.type === 'combatPortal'
      ? 'Combat Portal'
      : 'Zone Portal'
    : (catalogEntry?.label ?? obj.modelId)

  return (
    <div className="flex flex-col gap-2">
      <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Properties
      </h3>

      {/* ---- Model name ---- */}
      <div className="px-2 text-sm text-zinc-300">{displayName}</div>

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
          label="Y"
          value={obj.position.y}
          onChange={(v) =>
            updateObject(obj.id, {
              position: { ...obj.position, y: v },
            })
          }
          step={0.1}
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

      {/* ---- Rotation (not for portals, they rotate automatically in game) ---- */}
      {!isPortal && (
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
      )}

      {/* ---- Scale (not for portals) ---- */}
      {!isPortal && (
        <div className="px-2">
          <NumberField
            label="Scale"
            value={obj.scale}
            onChange={(v) => updateObject(obj.id, { scale: v })}
            step={0.1}
          />
        </div>
      )}

      {/* ---- Collision (not for portals) ---- */}
      {!isPortal && (
        <>
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

          {/* ---- Walkable surface toggle ---- */}
          <div className="flex items-center gap-2 px-2">
            <label className="flex items-center gap-1.5 text-xs text-zinc-400">
              <input
                type="checkbox"
                checked={!!obj.walkable}
                onChange={(e) =>
                  updateObject(obj.id, {
                    walkable: e.target.checked,
                  })
                }
                className="h-3 w-3"
              />
              Walkable surface
            </label>
          </div>
        </>
      )}

      {/* ---- Zone portal specific fields ---- */}
      {obj.type === 'zonePortal' && (
        <>
          <div className="mx-2 border-t border-zinc-800" />
          <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Portal Target
          </div>
          <div className="px-2">
            <label className="text-[10px] text-zinc-500">Target Zone ID</label>
            <input
              type="text"
              value={obj.targetZoneId ?? ''}
              onChange={(e) =>
                updateObject(obj.id, { targetZoneId: e.target.value })
              }
              placeholder="e.g. rock-zone"
              className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 px-2">
            <NumberField
              label="Spawn X"
              value={obj.targetSpawnPosition?.x ?? 0}
              onChange={(v) =>
                updateObject(obj.id, {
                  targetSpawnPosition: {
                    x: v,
                    z: obj.targetSpawnPosition?.z ?? 0,
                  },
                })
              }
            />
            <NumberField
              label="Spawn Z"
              value={obj.targetSpawnPosition?.z ?? 0}
              onChange={(v) =>
                updateObject(obj.id, {
                  targetSpawnPosition: {
                    x: obj.targetSpawnPosition?.x ?? 0,
                    z: v,
                  },
                })
              }
            />
          </div>
        </>
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

// ---- Multi object batch editing panel ----
function MultiObjectPanel({
  objects,
  selectedIds,
  updateObjects,
  removeObjects,
}: {
  objects: BuilderObject[]
  selectedIds: string[]
  updateObjects: (ids: string[], updates: Partial<BuilderObject>) => void
  removeObjects: (ids: string[]) => void
}) {
  // ---- Check if any portals are in the selection ----
  const hasPortals = objects.some(
    (o) => o.type === 'combatPortal' || o.type === 'zonePortal',
  )
  const allDecorations = objects.every((o) => o.type === 'decoration')

  // ---- Compute common values across selection ----
  const commonValues = useMemo(() => {
    const rotations = new Set(
      objects.map((o) => Math.round((o.rotationY * 180) / Math.PI)),
    )
    const scales = new Set(objects.map((o) => Math.round(o.scale * 100) / 100))
    const collisions = new Set(objects.map((o) => !o.noCollision))
    const ys = new Set(objects.map((o) => Math.round(o.position.y * 100) / 100))
    const walkables = new Set(objects.map((o) => !!o.walkable))

    return {
      rotation: rotations.size === 1 ? [...rotations][0]! : undefined,
      scale: scales.size === 1 ? [...scales][0]! : undefined,
      hasCollision:
        collisions.size === 1 ? [...collisions][0]! : undefined,
      y: ys.size === 1 ? [...ys][0]! : undefined,
      walkable: walkables.size === 1 ? [...walkables][0]! : undefined,
    }
  }, [objects])

  const handleSetRotation = useCallback(
    (degrees: number) => {
      updateObjects(selectedIds, {
        rotationY: (degrees * Math.PI) / 180,
      })
    },
    [updateObjects, selectedIds],
  )

  const handleSetScale = useCallback(
    (scale: number) => {
      updateObjects(selectedIds, { scale })
    },
    [updateObjects, selectedIds],
  )

  const handleToggleCollision = useCallback(
    (hasCollision: boolean) => {
      updateObjects(selectedIds, { noCollision: !hasCollision })
    },
    [updateObjects, selectedIds],
  )

  return (
    <div className="flex flex-col gap-2">
      <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Properties
      </h3>
      <div className="px-2 text-sm text-zinc-300">
        {objects.length} objects selected
        {hasPortals && (
          <span className="ml-1 text-[10px] text-zinc-500">
            (includes portals)
          </span>
        )}
      </div>

      {/* ---- Batch Y position ---- */}
      {allDecorations && (
        <div className="px-2">
          <NumberField
            label="Y"
            value={commonValues.y ?? 0}
            onChange={(v) => {
              // ---- Update Y for all selected objects ----
              const state = useBuilderStore.getState()
              for (const id of selectedIds) {
                const obj = state.objects.find((o) => o.id === id)
                if (obj) {
                  state.updateObject(id, {
                    position: { ...obj.position, y: v },
                  })
                }
              }
            }}
            step={0.1}
            placeholder={commonValues.y === undefined ? 'mixed' : undefined}
          />
        </div>
      )}

      {/* ---- Batch rotation (only for decorations) ---- */}
      {allDecorations && (
        <div className="px-2">
          <NumberField
            label="Rotation"
            value={commonValues.rotation ?? 0}
            onChange={handleSetRotation}
            suffix="°"
            placeholder={commonValues.rotation === undefined ? 'mixed' : undefined}
          />
          {/* ---- Quick rotation buttons ---- */}
          <div className="mt-1 flex gap-1">
            {[0, 45, 90, 180, 270].map((deg) => (
              <button
                key={deg}
                onClick={() => handleSetRotation(deg)}
                className="flex-1 rounded bg-zinc-800 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- Batch scale (only for decorations) ---- */}
      {allDecorations && (
        <div className="px-2">
          <NumberField
            label="Scale"
            value={commonValues.scale ?? 1}
            onChange={handleSetScale}
            step={0.1}
            placeholder={commonValues.scale === undefined ? 'mixed' : undefined}
          />
          {/* ---- Quick scale buttons ---- */}
          <div className="mt-1 flex gap-1">
            {[0.5, 0.75, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => handleSetScale(s)}
                className="flex-1 rounded bg-zinc-800 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- Batch collision toggle (only for decorations) ---- */}
      {allDecorations && (
        <div className="flex items-center gap-2 px-2">
          <label className="flex items-center gap-1.5 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={commonValues.hasCollision ?? false}
              ref={(el) => {
                // ---- Indeterminate state for mixed values ----
                if (el)
                  el.indeterminate = commonValues.hasCollision === undefined
              }}
              onChange={(e) => handleToggleCollision(e.target.checked)}
              className="h-3 w-3"
            />
            Has collision
            {commonValues.hasCollision === undefined && (
              <span className="text-[10px] text-zinc-600">(mixed)</span>
            )}
          </label>
        </div>
      )}

      {/* ---- Batch walkable surface toggle (only for decorations) ---- */}
      {allDecorations && (
        <div className="flex items-center gap-2 px-2">
          <label className="flex items-center gap-1.5 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={commonValues.walkable ?? false}
              ref={(el) => {
                if (el)
                  el.indeterminate = commonValues.walkable === undefined
              }}
              onChange={(e) =>
                updateObjects(selectedIds, { walkable: e.target.checked })
              }
              className="h-3 w-3"
            />
            Walkable surface
            {commonValues.walkable === undefined && (
              <span className="text-[10px] text-zinc-600">(mixed)</span>
            )}
          </label>
        </div>
      )}

      {/* ---- Delete all button ---- */}
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
  placeholder,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
  suffix?: string
  placeholder?: string
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
        placeholder={placeholder}
        className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )
}

export default PropertiesPanel
