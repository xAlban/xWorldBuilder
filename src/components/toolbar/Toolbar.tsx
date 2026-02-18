import {
  FilePlus,
  FolderOpen,
  Save,
  Download,
  Upload,
  Undo2,
  Redo2,
  MousePointer2,
  Hand,
  Sprout,
  Grid3X3,
  Eye,
  EyeOff,
} from 'lucide-react'
import JSZip from 'jszip'
import { useBuilderStore } from '@/stores/builderStore'
import type { BuilderProject } from '@/types/builder'
import type { ZoneDefinition } from '@/types/zone'
import {
  generateZoneDefinition,
  getNewModels,
  generateRegistryPatch,
  getFilesToCopy,
} from '@/utils/exportUtils'
import { importZoneDefinition } from '@/utils/importUtils'

function Toolbar() {
  const mode = useBuilderStore((s) => s.mode)
  const setMode = useBuilderStore((s) => s.setMode)
  const showGrid = useBuilderStore((s) => s.showGrid)
  const setGridSettings = useBuilderStore((s) => s.setGridSettings)
  const groundTransparent = useBuilderStore((s) => s.groundTransparent)
  const setGroundTransparent = useBuilderStore((s) => s.setGroundTransparent)
  const undo = useBuilderStore((s) => s.undo)
  const redo = useBuilderStore((s) => s.redo)
  const undoStack = useBuilderStore((s) => s.undoStack)
  const redoStack = useBuilderStore((s) => s.redoStack)
  const isDirty = useBuilderStore((s) => s.isDirty)
  const resetProject = useBuilderStore((s) => s.resetProject)
  const objectCount = useBuilderStore((s) => s.objects.length)

  // ---- New project ----
  const handleNew = () => {
    if (isDirty && !confirm('Unsaved changes will be lost. Continue?')) return
    resetProject()
  }

  // ---- Open project file (.xwb.json) ----
  const handleOpen = () => {
    if (isDirty && !confirm('Unsaved changes will be lost. Continue?')) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xwb.json,.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const text = await file.text()
      const project = JSON.parse(text) as BuilderProject
      useBuilderStore.getState().loadProject(
        project.zone,
        project.objects,
        project.customModels,
      )
    }
    input.click()
  }

  // ---- Import xTactics zone definition (.json) ----
  const handleImport = () => {
    if (isDirty && !confirm('Unsaved changes will be lost. Continue?')) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const text = await file.text()
      const zoneData = JSON.parse(text) as ZoneDefinition
      const result = importZoneDefinition(zoneData)
      useBuilderStore.getState().loadProject(result.zone, result.objects, [])
    }
    input.click()
  }

  // ---- Save project file ----
  const handleSave = () => {
    const state = useBuilderStore.getState()
    const project: BuilderProject = {
      version: 1,
      zone: {
        id: state.zoneId,
        name: state.zoneName,
        groundType: state.groundType,
        width: state.zoneWidth,
        height: state.zoneHeight,
        defaultSpawn: state.defaultSpawn,
      },
      objects: state.objects,
      customModels: state.customModels,
    }
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${state.zoneId}.xwb.json`
    a.click()
    URL.revokeObjectURL(url)
    state.markClean()
  }

  // ---- Export zone as zip for xTactics ----
  const handleExport = async () => {
    const state = useBuilderStore.getState()

    if (state.objects.length === 0) {
      alert('Nothing to export — place some objects first.')
      return
    }

    // ---- Generate zone definition ----
    const zoneDef = generateZoneDefinition(
      state.zoneId,
      state.zoneName,
      state.groundType,
      state.zoneWidth,
      state.zoneHeight,
      state.defaultSpawn,
      state.objects,
    )

    // ---- Identify new models and generate patch ----
    const newModels = getNewModels(state.objects)
    const registryPatch = generateRegistryPatch(newModels)
    const filesToCopy = getFilesToCopy(newModels)

    // ---- Build zip ----
    const zip = new JSZip()
    zip.file('zone-definition.json', JSON.stringify(zoneDef, null, 2))
    zip.file('registry-patch.ts', registryPatch)

    // ---- Add model files to zip ----
    if (filesToCopy.length > 0) {
      const modelsFolder = zip.folder('models/objects')!
      for (const fileName of filesToCopy) {
        try {
          const response = await fetch(`/models/objects/${fileName}`)
          if (response.ok) {
            const blob = await response.blob()
            modelsFolder.file(fileName, blob)
          }
        } catch {
          // ---- Skip files that fail to fetch ----
        }
      }
    }

    // ---- Add instructions ----
    const instructions = [
      `xWorldBuilder Export — ${state.zoneName} (${state.zoneId})`,
      '='.repeat(50),
      '',
      'How to integrate into xTactics:',
      '',
      '1. Copy zone-definition.json content into a new ZoneDefinition',
      '   in src/game/world/zoneDefinitions.ts',
      '',
      '2. Add the zone to WORLD_MAP.zones array',
      '',
    ]

    if (newModels.length > 0) {
      instructions.push(
        `3. Copy the ${newModels.length} new model file(s) from models/objects/`,
        '   to xTactics public/models/objects/',
        '',
        '4. Paste the entries from registry-patch.ts into',
        '   DECORATION_MODELS in src/game/world/decorationRegistry.ts',
      )
    } else {
      instructions.push(
        '3. All models used are already in xTactics — no files to copy.',
      )
    }

    zip.file('README.txt', instructions.join('\n'))

    // ---- Download zip ----
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${state.zoneId}-export.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  const btnBase =
    'flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors'
  const btnDefault = `${btnBase} text-zinc-300 hover:bg-zinc-700`
  const btnDisabled = `${btnBase} text-zinc-600 cursor-not-allowed`

  return (
    <div className="flex h-10 items-center gap-1 border-b border-zinc-800 bg-zinc-900 px-2">
      {/* ---- File actions ---- */}
      <button onClick={handleNew} className={btnDefault} title="New project">
        <FilePlus className="h-3.5 w-3.5" />
        New
      </button>
      <button onClick={handleOpen} className={btnDefault} title="Open project">
        <FolderOpen className="h-3.5 w-3.5" />
        Open
      </button>
      <button
        onClick={handleImport}
        className={btnDefault}
        title="Import xTactics zone"
      >
        <Upload className="h-3.5 w-3.5" />
        Import
      </button>
      <button onClick={handleSave} className={btnDefault} title="Save project (Ctrl+S)">
        <Save className="h-3.5 w-3.5" />
        Save
        {isDirty && (
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        )}
      </button>
      <button onClick={handleExport} className={btnDefault} title="Export zone (Ctrl+E)">
        <Download className="h-3.5 w-3.5" />
        Export
      </button>

      {/* ---- Separator ---- */}
      <div className="mx-1 h-5 w-px bg-zinc-700" />

      {/* ---- Mode buttons ---- */}
      <button
        onClick={() => setMode('select')}
        className={`${btnBase} ${mode === 'select' ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-700'}`}
        title="Select mode (Esc)"
      >
        <MousePointer2 className="h-3.5 w-3.5" />
        Select
      </button>
      <button
        onClick={() => setMode('place')}
        className={`${btnBase} ${mode === 'place' ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-700'}`}
        title="Place mode"
      >
        <Hand className="h-3.5 w-3.5" />
        Place
      </button>
      <button
        onClick={() => setMode('scatter')}
        className={`${btnBase} ${mode === 'scatter' ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-700'}`}
        title="Scatter mode"
      >
        <Sprout className="h-3.5 w-3.5" />
        Scatter
      </button>

      {/* ---- Separator ---- */}
      <div className="mx-1 h-5 w-px bg-zinc-700" />

      {/* ---- Toggles ---- */}
      <button
        onClick={() => setGridSettings({ showGrid: !showGrid })}
        className={`${btnBase} ${showGrid ? 'bg-zinc-700 text-white' : 'text-zinc-300 hover:bg-zinc-700'}`}
        title="Toggle grid (G)"
      >
        <Grid3X3 className="h-3.5 w-3.5" />
        Grid
      </button>
      <button
        onClick={() => setGroundTransparent(!groundTransparent)}
        className={`${btnBase} ${groundTransparent ? 'bg-zinc-700 text-white' : 'text-zinc-300 hover:bg-zinc-700'}`}
        title="Toggle ground visibility"
      >
        {groundTransparent ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
        Ground
      </button>

      {/* ---- Separator ---- */}
      <div className="mx-1 h-5 w-px bg-zinc-700" />

      {/* ---- Undo/Redo ---- */}
      <button
        onClick={undo}
        className={undoStack.length > 0 ? btnDefault : btnDisabled}
        disabled={undoStack.length === 0}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={redo}
        className={redoStack.length > 0 ? btnDefault : btnDisabled}
        disabled={redoStack.length === 0}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="h-3.5 w-3.5" />
      </button>

      {/* ---- Spacer + object count ---- */}
      <div className="ml-auto text-xs text-zinc-500">
        {objectCount} object{objectCount !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

export default Toolbar
