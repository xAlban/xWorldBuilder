import { create } from 'zustand'
import type {
  BuilderObject,
  BuilderMode,
  BuilderSnapshot,
  CustomModelEntry,
} from '@/types/builder'
import type { GroundType } from '@/types/zone'

// ---- Max undo history size ----
const MAX_HISTORY = 50

interface BuilderState {
  // ---- Zone settings ----
  zoneId: string
  zoneName: string
  groundType: GroundType
  zoneWidth: number
  zoneHeight: number
  defaultSpawn: { x: number; z: number }

  // ---- Placed objects ----
  objects: BuilderObject[]

  // ---- Custom imported models ----
  customModels: CustomModelEntry[]

  // ---- Selection ----
  selectedIds: string[]

  // ---- Interaction mode ----
  mode: BuilderMode
  placingModelId: string | null

  // ---- Scatter settings ----
  scatterCount: number
  scatterRadius: number

  // ---- Grid settings ----
  showGrid: boolean
  gridSpacing: number
  snapToGrid: boolean

  // ---- Ground display ----
  groundTransparent: boolean

  // ---- Undo/redo ----
  undoStack: BuilderSnapshot[]
  redoStack: BuilderSnapshot[]

  // ---- Dirty flag ----
  isDirty: boolean

  // ---- Next object ID counter ----
  nextId: number

  // ---- Actions ----
  setZoneSettings: (settings: {
    id?: string
    name?: string
    groundType?: GroundType
    width?: number
    height?: number
    defaultSpawn?: { x: number; z: number }
  }) => void
  addObject: (obj: Omit<BuilderObject, 'id'>) => string
  updateObject: (id: string, updates: Partial<BuilderObject>) => void
  removeObjects: (ids: string[]) => void
  duplicateObjects: (ids: string[]) => void
  selectObject: (id: string, additive?: boolean) => void
  selectAll: () => void
  clearSelection: () => void
  setMode: (mode: BuilderMode, modelId?: string | null) => void
  setGridSettings: (settings: {
    showGrid?: boolean
    gridSpacing?: number
    snapToGrid?: boolean
  }) => void
  setGroundTransparent: (transparent: boolean) => void
  setScatterSettings: (settings: {
    count?: number
    radius?: number
  }) => void
  pushSnapshot: () => void
  undo: () => void
  redo: () => void
  loadProject: (
    zone: {
      id: string
      name: string
      groundType: GroundType
      width: number
      height: number
      defaultSpawn: { x: number; z: number }
    },
    objects: BuilderObject[],
    customModels: CustomModelEntry[],
  ) => void
  resetProject: () => void
  markClean: () => void
  addCustomModel: (model: CustomModelEntry) => void
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  zoneId: 'new-zone',
  zoneName: 'New Zone',
  groundType: 'grass',
  zoneWidth: 200,
  zoneHeight: 200,
  defaultSpawn: { x: 0, z: 0 },
  objects: [],
  customModels: [],
  selectedIds: [],
  mode: 'select',
  placingModelId: null,
  scatterCount: 5,
  scatterRadius: 10,
  showGrid: false,
  gridSpacing: 5,
  snapToGrid: false,
  groundTransparent: false,
  undoStack: [],
  redoStack: [],
  isDirty: false,
  nextId: 1,

  setZoneSettings: (settings) =>
    set((s) => ({
      ...(settings.id !== undefined ? { zoneId: settings.id } : {}),
      ...(settings.name !== undefined ? { zoneName: settings.name } : {}),
      ...(settings.groundType !== undefined
        ? { groundType: settings.groundType }
        : {}),
      ...(settings.width !== undefined ? { zoneWidth: settings.width } : {}),
      ...(settings.height !== undefined ? { zoneHeight: settings.height } : {}),
      ...(settings.defaultSpawn !== undefined
        ? { defaultSpawn: settings.defaultSpawn }
        : {}),
      isDirty: true,
      // ---- Push snapshot for zone settings changes ----
      undoStack: [
        ...s.undoStack.slice(-MAX_HISTORY + 1),
        { objects: s.objects },
      ],
      redoStack: [],
    })),

  addObject: (obj) => {
    const state = get()
    const id = `obj-${state.nextId}`
    const newObj: BuilderObject = { ...obj, id }
    set((s) => ({
      objects: [...s.objects, newObj],
      nextId: s.nextId + 1,
      isDirty: true,
    }))
    return id
  },

  updateObject: (id, updates) =>
    set((s) => ({
      objects: s.objects.map((o) => (o.id === id ? { ...o, ...updates } : o)),
      isDirty: true,
    })),

  removeObjects: (ids) => {
    const state = get()
    // ---- Push undo snapshot before removing ----
    set({
      undoStack: [
        ...state.undoStack.slice(-MAX_HISTORY + 1),
        { objects: state.objects },
      ],
      redoStack: [],
      objects: state.objects.filter((o) => !ids.includes(o.id)),
      selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
      isDirty: true,
    })
  },

  duplicateObjects: (ids) => {
    const state = get()
    const toDuplicate = state.objects.filter((o) => ids.includes(o.id))
    let nextId = state.nextId
    const newObjects = toDuplicate.map((o) => {
      const newId = `obj-${nextId++}`
      return {
        ...o,
        id: newId,
        position: { x: o.position.x + 2, z: o.position.z + 2 },
      }
    })
    const newIds = newObjects.map((o) => o.id)
    set({
      objects: [...state.objects, ...newObjects],
      selectedIds: newIds,
      nextId,
      isDirty: true,
      undoStack: [
        ...state.undoStack.slice(-MAX_HISTORY + 1),
        { objects: state.objects },
      ],
      redoStack: [],
    })
  },

  selectObject: (id, additive = false) =>
    set((s) => {
      if (additive) {
        // ---- Toggle selection ----
        const isSelected = s.selectedIds.includes(id)
        return {
          selectedIds: isSelected
            ? s.selectedIds.filter((sid) => sid !== id)
            : [...s.selectedIds, id],
        }
      }
      return { selectedIds: [id] }
    }),

  selectAll: () =>
    set((s) => ({ selectedIds: s.objects.map((o) => o.id) })),

  clearSelection: () => set({ selectedIds: [] }),

  setMode: (mode, modelId = null) =>
    set({
      mode,
      placingModelId: modelId,
      selectedIds: [],
    }),

  setGridSettings: (settings) =>
    set(() => ({
      ...(settings.showGrid !== undefined
        ? { showGrid: settings.showGrid }
        : {}),
      ...(settings.gridSpacing !== undefined
        ? { gridSpacing: settings.gridSpacing }
        : {}),
      ...(settings.snapToGrid !== undefined
        ? { snapToGrid: settings.snapToGrid }
        : {}),
    })),

  setGroundTransparent: (transparent) =>
    set({ groundTransparent: transparent }),

  setScatterSettings: (settings) =>
    set(() => ({
      ...(settings.count !== undefined ? { scatterCount: settings.count } : {}),
      ...(settings.radius !== undefined
        ? { scatterRadius: settings.radius }
        : {}),
    })),

  pushSnapshot: () =>
    set((s) => ({
      undoStack: [
        ...s.undoStack.slice(-MAX_HISTORY + 1),
        { objects: s.objects },
      ],
      redoStack: [],
    })),

  undo: () =>
    set((s) => {
      if (s.undoStack.length === 0) return s
      const snapshot = s.undoStack[s.undoStack.length - 1]!
      return {
        undoStack: s.undoStack.slice(0, -1),
        redoStack: [...s.redoStack, { objects: s.objects }],
        objects: snapshot.objects,
        selectedIds: [],
        isDirty: true,
      }
    }),

  redo: () =>
    set((s) => {
      if (s.redoStack.length === 0) return s
      const snapshot = s.redoStack[s.redoStack.length - 1]!
      return {
        redoStack: s.redoStack.slice(0, -1),
        undoStack: [...s.undoStack, { objects: s.objects }],
        objects: snapshot.objects,
        selectedIds: [],
        isDirty: true,
      }
    }),

  loadProject: (zone, objects, customModels) => {
    // ---- Compute next ID from existing objects ----
    let maxId = 0
    for (const obj of objects) {
      const match = obj.id.match(/^obj-(\d+)$/)
      if (match) {
        maxId = Math.max(maxId, parseInt(match[1]!, 10))
      }
    }
    set({
      zoneId: zone.id,
      zoneName: zone.name,
      groundType: zone.groundType,
      zoneWidth: zone.width,
      zoneHeight: zone.height,
      defaultSpawn: zone.defaultSpawn,
      objects,
      customModels,
      selectedIds: [],
      mode: 'select',
      placingModelId: null,
      undoStack: [],
      redoStack: [],
      isDirty: false,
      nextId: maxId + 1,
    })
  },

  resetProject: () =>
    set({
      zoneId: 'new-zone',
      zoneName: 'New Zone',
      groundType: 'grass',
      zoneWidth: 200,
      zoneHeight: 200,
      defaultSpawn: { x: 0, z: 0 },
      objects: [],
      customModels: [],
      selectedIds: [],
      mode: 'select',
      placingModelId: null,
      undoStack: [],
      redoStack: [],
      isDirty: false,
      nextId: 1,
    }),

  markClean: () => set({ isDirty: false }),

  addCustomModel: (model) =>
    set((s) => ({
      customModels: [...s.customModels, model],
    })),
}))
