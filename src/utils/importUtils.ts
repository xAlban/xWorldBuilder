import type { BuilderObject } from '@/types/builder'
import type { ZoneDefinition, ZoneObject } from '@/types/zone'
import { CATALOG_BY_ID } from '@/catalog/megakitRegistry'

// ---- Convert a ZoneObject from xTactics into a BuilderObject ----
function zoneObjectToBuilder(
  obj: ZoneObject,
  index: number,
): BuilderObject {
  // ---- Look up catalog entry for collision defaults ----
  const entry = obj.modelId ? CATALOG_BY_ID[obj.modelId] : undefined

  return {
    id: `obj-${index + 1}`,
    modelId: obj.modelId ?? 'unknown',
    position: { x: obj.position.x, z: obj.position.z },
    rotationY: obj.rotationY ?? 0,
    scale: obj.scale ?? 1,
    collisionSize: {
      x: obj.size.x || entry?.defaultCollisionSize.x || 1,
      z: obj.size.z || entry?.defaultCollisionSize.z || 1,
    },
    noCollision: obj.noCollision ?? false,
    type: obj.type,
    // ---- Preserve portal fields ----
    ...(obj.targetZoneId ? { targetZoneId: obj.targetZoneId } : {}),
    ...(obj.targetSpawnPosition
      ? { targetSpawnPosition: obj.targetSpawnPosition }
      : {}),
  }
}

// ---- Parse a ZoneDefinition JSON and convert to builder state ----
export function importZoneDefinition(zone: ZoneDefinition): {
  zone: {
    id: string
    name: string
    groundType: 'grass' | 'rock'
    width: number
    height: number
    defaultSpawn: { x: number; z: number }
  }
  objects: BuilderObject[]
} {
  return {
    zone: {
      id: zone.id,
      name: zone.name,
      groundType: zone.groundType,
      width: zone.width,
      height: zone.height,
      defaultSpawn: zone.defaultSpawn,
    },
    objects: zone.objects.map((obj, i) => zoneObjectToBuilder(obj, i)),
  }
}
