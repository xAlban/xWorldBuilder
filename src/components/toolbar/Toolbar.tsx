import {
  FilePlus,
  FolderOpen,
  Save,
  Download,
  Undo2,
  Redo2,
  MousePointer2,
  Hand,
  Sprout,
  Grid3X3,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useBuilderStore } from '@/stores/builderStore'
import type { BuilderProject } from '@/types/builder'

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

  // ---- Open project file ----
  const handleOpen = async () => {
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

  // ---- Export placeholder (Phase 6) ----
  const handleExport = () => {
    alert('Export pipeline not implemented yet (Phase 6)')
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
      <button
        onClick={handleOpen}
        className={btnDefault}
        title="Open project"
      >
        <FolderOpen className="h-3.5 w-3.5" />
        Open
      </button>
      <button onClick={handleSave} className={btnDefault} title="Save project">
        <Save className="h-3.5 w-3.5" />
        Save
        {isDirty && (
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        )}
      </button>
      <button onClick={handleExport} className={btnDefault} title="Export zone">
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
