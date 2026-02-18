import { useEffect } from 'react'
import { useBuilderStore } from '@/stores/builderStore'

// ---- Clipboard for copy/paste (module-scoped, not in store) ----
let clipboard: typeof useBuilderStore extends { getState: () => infer S }
  ? S extends { objects: (infer O)[] }
    ? O[]
    : never
  : never = []

export function useKeyboardShortcuts() {
  // ---- Unsaved changes warning ----
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useBuilderStore.getState().isDirty) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

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

      // ---- Ctrl+C: copy selected objects ----
      if (ctrl && e.key === 'c') {
        if (store.selectedIds.length > 0) {
          e.preventDefault()
          clipboard = store.objects.filter((o) =>
            store.selectedIds.includes(o.id),
          )
        }
        return
      }

      // ---- Ctrl+V: paste copied objects ----
      if (ctrl && e.key === 'v') {
        if (clipboard.length > 0) {
          e.preventDefault()
          store.pushSnapshot()
          const newIds: string[] = []
          for (const obj of clipboard) {
            const id = store.addObject({
              ...obj,
              position: {
                x: obj.position.x + 2,
                z: obj.position.z + 2,
              },
            })
            newIds.push(id)
          }
          // ---- Select the pasted objects ----
          for (const id of newIds) {
            store.selectObject(id, true)
          }
        }
        return
      }

      // ---- Ctrl+S: save project ----
      if (ctrl && e.key === 's') {
        e.preventDefault()
        // ---- Trigger save via toolbar button click ----
        document
          .querySelector<HTMLButtonElement>('[title*="Save project"]')
          ?.click()
        return
      }

      // ---- Ctrl+E: export zone ----
      if (ctrl && e.key === 'e') {
        e.preventDefault()
        document
          .querySelector<HTMLButtonElement>('[title*="Export zone"]')
          ?.click()
        return
      }

      // ---- G: toggle grid ----
      if (e.key === 'g' || e.key === 'G') {
        store.setGridSettings({ showGrid: !store.showGrid })
        return
      }

      // ---- Arrow keys: nudge selected objects ----
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      ) {
        if (store.selectedIds.length > 0) {
          e.preventDefault()
          const step = e.shiftKey ? 5 : 1
          const dx =
            e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0
          const dz =
            e.key === 'ArrowDown' ? step : e.key === 'ArrowUp' ? -step : 0

          for (const id of store.selectedIds) {
            const obj = store.objects.find((o) => o.id === id)
            if (obj) {
              store.updateObject(id, {
                position: {
                  x: obj.position.x + dx,
                  z: obj.position.z + dz,
                },
              })
            }
          }
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
