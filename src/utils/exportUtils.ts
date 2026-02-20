import type { BuilderObject } from '@/types/builder'
import type { ZoneObject, ZoneDefinition, HeightmapConfig } from '@/types/zone'
import { CATALOG_BY_ID } from '@/catalog/megakitRegistry'

// ---- Round a number to 2 decimal places ----
function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ---- Convert a BuilderObject to a ZoneObject for xTactics ----
function builderToZoneObject(obj: BuilderObject, index: number): ZoneObject {
  const zo: ZoneObject = {
    id: `${obj.type}-${index}`,
    type: obj.type,
    position: {
      x: round2(obj.position.x),
      ...(obj.position.y !== 0 ? { y: round2(obj.position.y) } : {}),
      z: round2(obj.position.z),
    },
    size: { x: round2(obj.collisionSize.x), z: round2(obj.collisionSize.z) },
  }

  // ---- Decoration fields ----
  if (obj.modelId) zo.modelId = obj.modelId
  if (obj.scale !== 1) zo.scale = round2(obj.scale)
  if (obj.rotationY !== 0) zo.rotationY = round2(obj.rotationY)
  if (obj.noCollision) zo.noCollision = true
  if (obj.walkable) zo.walkable = true

  // ---- Zone portal fields ----
  if (obj.type === 'zonePortal') {
    if (obj.targetZoneId) zo.targetZoneId = obj.targetZoneId
    if (obj.targetSpawnPosition) zo.targetSpawnPosition = obj.targetSpawnPosition
  }

  return zo
}

// ---- Generate a clean ZoneDefinition from builder state ----
export function generateZoneDefinition(
  zoneId: string,
  zoneName: string,
  groundType: 'grass' | 'rock',
  width: number,
  height: number,
  defaultSpawn: { x: number; z: number },
  objects: BuilderObject[],
  heightmap?: HeightmapConfig | null,
): ZoneDefinition {
  const def: ZoneDefinition = {
    id: zoneId,
    name: zoneName,
    groundType,
    width,
    height,
    defaultSpawn: { x: round2(defaultSpawn.x), z: round2(defaultSpawn.z) },
    objects: objects.map((obj, i) => builderToZoneObject(obj, i)),
  }
  if (heightmap) def.heightmap = heightmap
  return def
}

// ---- Identify models not yet in xTactics ----
export interface NewModelInfo {
  modelId: string
  fileName: string
  hasCollision: boolean
  collisionSize: { x: number; z: number }
}

export function getNewModels(objects: BuilderObject[]): NewModelInfo[] {
  // ---- Collect unique modelIds used in this zone ----
  const usedIds = new Set<string>()
  for (const obj of objects) {
    if (obj.modelId) usedIds.add(obj.modelId)
  }

  const newModels: NewModelInfo[] = []
  const seen = new Set<string>()

  for (const modelId of usedIds) {
    if (seen.has(modelId)) continue
    seen.add(modelId)

    const entry = CATALOG_BY_ID[modelId]
    if (!entry) continue
    if (entry.alreadyInXTactics) continue

    newModels.push({
      modelId: entry.modelId,
      fileName: entry.fileName,
      hasCollision: entry.hasCollision,
      collisionSize: entry.defaultCollisionSize,
    })
  }

  return newModels
}

// ---- Generate TypeScript code to paste into decorationRegistry.ts ----
export function generateRegistryPatch(newModels: NewModelInfo[]): string {
  if (newModels.length === 0) {
    return '// No new models to add to decorationRegistry.ts'
  }

  const lines: string[] = [
    '// ---- Paste the following entries into DECORATION_MODELS in decorationRegistry.ts ----',
    '',
  ]

  for (const model of newModels) {
    lines.push(`  '${model.modelId}': {`)
    lines.push(`    path: 'models/objects/${model.fileName}',`)
    lines.push('    scale: 1.0,')
    lines.push('    yOffset: 0,')
    lines.push(`    hasCollision: ${model.hasCollision},`)
    lines.push('  },')
  }

  return lines.join('\n')
}

// ---- Get list of model files that need to be copied to xTactics ----
export function getFilesToCopy(newModels: NewModelInfo[]): string[] {
  // ---- Each GLTF model has a .gltf and .bin file ----
  const files: string[] = []
  for (const model of newModels) {
    const baseName = model.fileName.replace('.gltf', '')
    files.push(model.fileName)
    files.push(`${baseName}.bin`)
  }
  return files
}
