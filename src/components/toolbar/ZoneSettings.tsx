import { useBuilderStore } from '@/stores/builderStore'
import type { GroundType, HeightmapConfig } from '@/types/zone'

// ---- Default heightmap values when enabling terrain ----
const DEFAULT_HEIGHTMAP: HeightmapConfig = {
  seed: 'default',
  amplitude: 3,
  frequency: 0.02,
  octaves: 4,
  slopeThreshold: 2,
}

function ZoneSettings() {
  const zoneId = useBuilderStore((s) => s.zoneId)
  const zoneName = useBuilderStore((s) => s.zoneName)
  const groundType = useBuilderStore((s) => s.groundType)
  const zoneWidth = useBuilderStore((s) => s.zoneWidth)
  const zoneHeight = useBuilderStore((s) => s.zoneHeight)
  const defaultSpawn = useBuilderStore((s) => s.defaultSpawn)
  const setZoneSettings = useBuilderStore((s) => s.setZoneSettings)
  const heightmap = useBuilderStore((s) => s.heightmap)
  const setHeightmap = useBuilderStore((s) => s.setHeightmap)

  // ---- Grid settings ----
  const showGrid = useBuilderStore((s) => s.showGrid)
  const gridSpacing = useBuilderStore((s) => s.gridSpacing)
  const snapToGrid = useBuilderStore((s) => s.snapToGrid)
  const setGridSettings = useBuilderStore((s) => s.setGridSettings)

  // ---- Scatter settings ----
  const mode = useBuilderStore((s) => s.mode)
  const scatterCount = useBuilderStore((s) => s.scatterCount)
  const scatterRadius = useBuilderStore((s) => s.scatterRadius)
  const setScatterSettings = useBuilderStore((s) => s.setScatterSettings)

  return (
    <div className="flex flex-col gap-3">
      <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Zone Settings
      </h3>

      {/* ---- Zone ID ---- */}
      <div className="flex flex-col gap-0.5 px-2">
        <label className="text-[10px] text-zinc-500">Zone ID</label>
        <input
          type="text"
          value={zoneId}
          onChange={(e) => setZoneSettings({ id: e.target.value })}
          className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* ---- Zone Name ---- */}
      <div className="flex flex-col gap-0.5 px-2">
        <label className="text-[10px] text-zinc-500">Name</label>
        <input
          type="text"
          value={zoneName}
          onChange={(e) => setZoneSettings({ name: e.target.value })}
          className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* ---- Ground Type ---- */}
      <div className="flex flex-col gap-0.5 px-2">
        <label className="text-[10px] text-zinc-500">Ground Type</label>
        <select
          value={groundType}
          onChange={(e) =>
            setZoneSettings({ groundType: e.target.value as GroundType })
          }
          className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="grass">Grass</option>
          <option value="rock">Rock</option>
        </select>
      </div>

      {/* ---- Dimensions ---- */}
      <div className="flex gap-2 px-2">
        <div className="flex flex-1 flex-col gap-0.5">
          <label className="text-[10px] text-zinc-500">Width</label>
          <input
            type="number"
            value={zoneWidth}
            onChange={(e) => {
              const v = parseInt(e.target.value)
              if (!isNaN(v) && v > 0) setZoneSettings({ width: v })
            }}
            min={10}
            step={10}
            className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <label className="text-[10px] text-zinc-500">Height</label>
          <input
            type="number"
            value={zoneHeight}
            onChange={(e) => {
              const v = parseInt(e.target.value)
              if (!isNaN(v) && v > 0) setZoneSettings({ height: v })
            }}
            min={10}
            step={10}
            className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ---- Default Spawn ---- */}
      <div className="flex gap-2 px-2">
        <div className="flex flex-1 flex-col gap-0.5">
          <label className="text-[10px] text-zinc-500">Spawn X</label>
          <input
            type="number"
            value={defaultSpawn.x}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v))
                setZoneSettings({ defaultSpawn: { ...defaultSpawn, x: v } })
            }}
            className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <label className="text-[10px] text-zinc-500">Spawn Z</label>
          <input
            type="number"
            value={defaultSpawn.z}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v))
                setZoneSettings({ defaultSpawn: { ...defaultSpawn, z: v } })
            }}
            className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ---- Separator ---- */}
      <div className="mx-2 border-t border-zinc-800" />

      {/* ---- Terrain Settings ---- */}
      <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Terrain
      </h3>

      <div className="flex items-center gap-2 px-2">
        <label className="flex items-center gap-1.5 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={heightmap !== null}
            onChange={(e) =>
              setHeightmap(e.target.checked ? { ...DEFAULT_HEIGHTMAP } : null)
            }
            className="h-3 w-3"
          />
          Enable heightmap
        </label>
      </div>

      {heightmap && (
        <>
          <div className="flex flex-col gap-0.5 px-2">
            <label className="text-[10px] text-zinc-500">Seed</label>
            <input
              type="text"
              value={heightmap.seed}
              onChange={(e) =>
                setHeightmap({ ...heightmap, seed: e.target.value })
              }
              className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 px-2">
            <div className="flex flex-1 flex-col gap-0.5">
              <label className="text-[10px] text-zinc-500">Amplitude</label>
              <input
                type="number"
                value={heightmap.amplitude}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  if (!isNaN(v) && v >= 0)
                    setHeightmap({ ...heightmap, amplitude: v })
                }}
                min={0}
                max={20}
                step={0.5}
                className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <label className="text-[10px] text-zinc-500">Frequency</label>
              <input
                type="number"
                value={heightmap.frequency}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  if (!isNaN(v) && v > 0)
                    setHeightmap({ ...heightmap, frequency: v })
                }}
                min={0.001}
                step={0.005}
                className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 px-2">
            <div className="flex flex-1 flex-col gap-0.5">
              <label className="text-[10px] text-zinc-500">Octaves</label>
              <input
                type="number"
                value={heightmap.octaves}
                onChange={(e) => {
                  const v = parseInt(e.target.value)
                  if (!isNaN(v) && v >= 1 && v <= 8)
                    setHeightmap({ ...heightmap, octaves: v })
                }}
                min={1}
                max={8}
                className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <label className="text-[10px] text-zinc-500">Slope Limit</label>
              <input
                type="number"
                value={heightmap.slopeThreshold}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  if (!isNaN(v) && v > 0)
                    setHeightmap({ ...heightmap, slopeThreshold: v })
                }}
                min={0.1}
                step={0.5}
                className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </>
      )}

      {/* ---- Separator ---- */}
      <div className="mx-2 border-t border-zinc-800" />

      {/* ---- Grid Settings ---- */}
      <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Grid
      </h3>

      <div className="flex items-center gap-2 px-2">
        <label className="flex items-center gap-1.5 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => setGridSettings({ snapToGrid: e.target.checked })}
            className="h-3 w-3"
          />
          Snap to grid
        </label>
      </div>

      {showGrid && (
        <div className="flex flex-col gap-0.5 px-2">
          <label className="text-[10px] text-zinc-500">Grid Spacing</label>
          <input
            type="number"
            value={gridSpacing}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v) && v > 0)
                setGridSettings({ gridSpacing: v })
            }}
            min={1}
            step={1}
            className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {/* ---- Scatter Settings (always visible, dimmed when not active) ---- */}
      <div className="mx-2 border-t border-zinc-800" />

      <div className={mode !== 'scatter' ? 'opacity-50' : ''}>
        <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Scatter
          {mode !== 'scatter' && (
            <span className="ml-1 text-[10px] font-normal normal-case tracking-normal text-zinc-600">
              (activate in toolbar)
            </span>
          )}
        </h3>

        <div className="mt-2 flex gap-2 px-2">
          <div className="flex flex-1 flex-col gap-0.5">
            <label className="text-[10px] text-zinc-500">Count</label>
            <input
              type="number"
              value={scatterCount}
              onChange={(e) => {
                const v = parseInt(e.target.value)
                if (!isNaN(v) && v > 0) setScatterSettings({ count: v })
              }}
              min={1}
              max={50}
              className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <label className="text-[10px] text-zinc-500">Radius</label>
            <input
              type="number"
              value={scatterRadius}
              onChange={(e) => {
                const v = parseFloat(e.target.value)
                if (!isNaN(v) && v > 0) setScatterSettings({ radius: v })
              }}
              min={1}
              step={1}
              className="w-full rounded bg-zinc-800 px-1.5 py-1 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZoneSettings
