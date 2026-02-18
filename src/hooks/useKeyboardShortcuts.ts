import { useEffect } from 'react'
import { useBuilderStore } from '@/stores/builderStore'

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ---- Skip shortcuts when typing in inputs ----
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const ctrl = e.ctrlKey || e.metaKey
      const store = useBuilderStore.getState()

      // ---- Delete selected objects ----
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selectedIds.length > 0) {
          e.preventDefault()
          store.removeObjects(store.selectedIds)
        }
        return
      }

      // ---- Escape: deselect or cancel placement ----
      if (e.key === 'Escape') {
        if (store.mode !== 'select') {
          store.setMode('select')
        } else {
          store.clearSelection()
        }
        return
      }

      // ---- Ctrl+Z: undo ----
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        store.undo()
        return
      }

      // ---- Ctrl+Y or Ctrl+Shift+Z: redo ----
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        store.redo()
        return
      }

      // ---- Ctrl+A: select all ----
      if (ctrl && e.key === 'a') {
        e.preventDefault()
        store.selectAll()
        return
      }

      // ---- Ctrl+D: duplicate ----
      if (ctrl && e.key === 'd') {
        if (store.selectedIds.length > 0) {
          e.preventDefault()
          store.duplicateObjects(store.selectedIds)
        }
        return
      }

      // ---- G: toggle grid ----
      if (e.key === 'g' || e.key === 'G') {
        store.setGridSettings({ showGrid: !store.showGrid })
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
