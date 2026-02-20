// ---- Builder-specific types ----

// ---- A placed object in the builder with extra editing metadata ----
export interface BuilderObject {
  // ---- Unique builder-side ID ----
  id: string
  modelId: string
  position: { x: number; y: number; z: number }
  rotationY: number
  scale: number
  // ---- Collision bounding box half-extents ----
  collisionSize: { x: number; z: number }
  // ---- Whether this object has no collision (walkable) ----
  noCollision: boolean
  // ---- Whether this is a walkable surface (player can walk on top) ----
  walkable: boolean
  // ---- Object type for export ----
  type: 'decoration' | 'combatPortal' | 'zonePortal'
  // ---- Zone portal fields ----
  targetZoneId?: string
  targetSpawnPosition?: { x: number; z: number }
}

// ---- A custom model imported by the user ----
export interface CustomModelEntry {
  modelId: string
  fileName: string
  label: string
  category: string
}

// ---- The full builder project file format ----
export interface BuilderProject {
  version: 1
  zone: {
    id: string
    name: string
    groundType: 'grass' | 'rock'
    width: number
    height: number
    defaultSpawn: { x: number; z: number }
    heightmap?: import('@/types/zone').HeightmapConfig | null
  }
  objects: BuilderObject[]
  customModels: CustomModelEntry[]
}

// ---- Builder interaction mode ----
export type BuilderMode = 'select' | 'place' | 'scatter'

// ---- Undo/redo snapshot ----
export interface BuilderSnapshot {
  objects: BuilderObject[]
}
