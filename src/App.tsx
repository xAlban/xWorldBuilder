import './index.css'
import Toolbar from '@/components/toolbar/Toolbar'
import CatalogPanel from '@/components/sidebar/CatalogPanel'
import PropertiesPanel from '@/components/sidebar/PropertiesPanel'
import ZoneSettings from '@/components/toolbar/ZoneSettings'
import BuilderCanvas from '@/components/viewport/BuilderCanvas'
import BoxSelectOverlay from '@/components/viewport/BoxSelectOverlay'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function App() {
  useKeyboardShortcuts()
  return (
    <div className="flex h-screen w-screen flex-col bg-zinc-950">
      {/* ---- Top toolbar ---- */}
      <Toolbar />

      {/* ---- Main content: sidebar + canvas + properties ---- */}
      <div className="flex min-h-0 flex-1">
        {/* ---- Left sidebar: model catalog ---- */}
        <div className="flex w-56 flex-col gap-2 overflow-y-auto border-r border-zinc-800 bg-zinc-900 py-2">
          <CatalogPanel />
        </div>

        {/* ---- Center: 3D viewport ---- */}
        <div className="relative min-w-0 flex-1">
          <BuilderCanvas />
          <BoxSelectOverlay />
        </div>

        {/* ---- Right sidebar: zone settings + properties ---- */}
        <div className="flex w-56 flex-col gap-4 overflow-y-auto border-l border-zinc-800 bg-zinc-900 py-2">
          <ZoneSettings />
          <div className="mx-2 border-t border-zinc-800" />
          <PropertiesPanel />
        </div>
      </div>
    </div>
  )
}

export default App
