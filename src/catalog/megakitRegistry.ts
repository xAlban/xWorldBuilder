// ---- Catalog entry for a model in the megakit ----
export interface CatalogEntry {
  modelId: string
  fileName: string
  label: string
  category: CatalogCategory
  defaultScale: number
  defaultCollisionSize: { x: number; z: number }
  hasCollision: boolean
  // ---- Whether this model already exists in xTactics decorationRegistry ----
  alreadyInXTactics: boolean
}

export type CatalogCategory =
  | 'trees'
  | 'bushes'
  | 'flowers'
  | 'grass'
  | 'plants'
  | 'mushrooms'
  | 'rocks'
  | 'paths'
  | 'pebbles'
  | 'petals'

// ---- All category labels for display ----
export const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  trees: 'Trees',
  bushes: 'Bushes',
  flowers: 'Flowers',
  grass: 'Grass',
  plants: 'Plants',
  mushrooms: 'Mushrooms',
  rocks: 'Rocks',
  paths: 'Paths',
  pebbles: 'Pebbles',
  petals: 'Petals',
}

// ---- Category display order ----
export const CATEGORY_ORDER: CatalogCategory[] = [
  'trees',
  'bushes',
  'flowers',
  'grass',
  'plants',
  'mushrooms',
  'rocks',
  'paths',
  'pebbles',
  'petals',
]

// ---- Category icon colors for catalog cards ----
export const CATEGORY_COLORS: Record<CatalogCategory, string> = {
  trees: '#2d5a27',
  bushes: '#3a7a34',
  flowers: '#d4548a',
  grass: '#5a9a3a',
  plants: '#4a8a44',
  mushrooms: '#8a5a3a',
  rocks: '#6a6a6a',
  paths: '#a08a6a',
  pebbles: '#8a8a7a',
  petals: '#e47aaa',
}

// ---- Helper to create catalog entries ----
function entry(
  modelId: string,
  fileName: string,
  label: string,
  category: CatalogCategory,
  hasCollision: boolean,
  alreadyInXTactics: boolean,
  collisionX = 1,
  collisionZ = 1,
): CatalogEntry {
  return {
    modelId,
    fileName,
    label,
    category,
    defaultScale: 1.0,
    defaultCollisionSize: { x: collisionX, z: collisionZ },
    hasCollision,
    alreadyInXTactics,
  }
}

// ---- Full catalog of all 67 megakit models ----
export const MEGAKIT_CATALOG: CatalogEntry[] = [
  // ---- Trees (15) ----
  entry('common-tree-1', 'CommonTree_1.gltf', 'Common Tree 1', 'trees', true, true, 1.5, 1.5),
  entry('common-tree-2', 'CommonTree_2.gltf', 'Common Tree 2', 'trees', true, true, 1.5, 1.5),
  entry('common-tree-3', 'CommonTree_3.gltf', 'Common Tree 3', 'trees', true, true, 1.5, 1.5),
  entry('common-tree-4', 'CommonTree_4.gltf', 'Common Tree 4', 'trees', true, true, 1.5, 1.5),
  entry('common-tree-5', 'CommonTree_5.gltf', 'Common Tree 5', 'trees', true, true, 1.5, 1.5),
  entry('dead-tree-1', 'DeadTree_1.gltf', 'Dead Tree 1', 'trees', true, false, 1, 1),
  entry('dead-tree-2', 'DeadTree_2.gltf', 'Dead Tree 2', 'trees', true, false, 1, 1),
  entry('dead-tree-3', 'DeadTree_3.gltf', 'Dead Tree 3', 'trees', true, false, 1, 1),
  entry('dead-tree-4', 'DeadTree_4.gltf', 'Dead Tree 4', 'trees', true, false, 1, 1),
  entry('dead-tree-5', 'DeadTree_5.gltf', 'Dead Tree 5', 'trees', true, false, 1, 1),
  entry('twisted-tree-1', 'TwistedTree_1.gltf', 'Twisted Tree 1', 'trees', true, false, 1.5, 1.5),
  entry('twisted-tree-2', 'TwistedTree_2.gltf', 'Twisted Tree 2', 'trees', true, false, 1.5, 1.5),
  entry('twisted-tree-3', 'TwistedTree_3.gltf', 'Twisted Tree 3', 'trees', true, false, 1.5, 1.5),
  entry('twisted-tree-4', 'TwistedTree_4.gltf', 'Twisted Tree 4', 'trees', true, false, 1.5, 1.5),
  entry('twisted-tree-5', 'TwistedTree_5.gltf', 'Twisted Tree 5', 'trees', true, false, 1.5, 1.5),

  // ---- Pine Trees (5) ----
  entry('pine-1', 'Pine_1.gltf', 'Pine 1', 'trees', true, false, 1.5, 1.5),
  entry('pine-2', 'Pine_2.gltf', 'Pine 2', 'trees', true, false, 1.5, 1.5),
  entry('pine-3', 'Pine_3.gltf', 'Pine 3', 'trees', true, false, 1.5, 1.5),
  entry('pine-4', 'Pine_4.gltf', 'Pine 4', 'trees', true, false, 1.5, 1.5),
  entry('pine-5', 'Pine_5.gltf', 'Pine 5', 'trees', true, false, 1.5, 1.5),

  // ---- Bushes (2) ----
  entry('bush-common', 'Bush_Common.gltf', 'Bush', 'bushes', true, true, 1, 1),
  entry('bush-flowers', 'Bush_Common_Flowers.gltf', 'Bush Flowers', 'bushes', true, true, 1, 1),

  // ---- Flowers (4) ----
  entry('flower-group-3', 'Flower_3_Group.gltf', 'Flower Group 3', 'flowers', false, true),
  entry('flower-group-4', 'Flower_4_Group.gltf', 'Flower Group 4', 'flowers', false, true),
  entry('flower-single-3', 'Flower_3_Single.gltf', 'Flower Single 3', 'flowers', false, true),
  entry('flower-single-4', 'Flower_4_Single.gltf', 'Flower Single 4', 'flowers', false, true),

  // ---- Grass (4) ----
  entry('grass-short', 'Grass_Common_Short.gltf', 'Grass Short', 'grass', false, true),
  entry('grass-tall', 'Grass_Common_Tall.gltf', 'Grass Tall', 'grass', false, true),
  entry('grass-wispy-short', 'Grass_Wispy_Short.gltf', 'Wispy Grass Short', 'grass', false, false),
  entry('grass-wispy-tall', 'Grass_Wispy_Tall.gltf', 'Wispy Grass Tall', 'grass', false, false),

  // ---- Plants (5) ----
  entry('fern', 'Fern_1.gltf', 'Fern', 'plants', false, true),
  entry('plant', 'Plant_1.gltf', 'Plant', 'plants', false, true),
  entry('plant-big', 'Plant_1_Big.gltf', 'Plant Big', 'plants', false, false),
  entry('plant-7', 'Plant_7.gltf', 'Plant 7', 'plants', false, false),
  entry('plant-7-big', 'Plant_7_Big.gltf', 'Plant 7 Big', 'plants', false, false),
  entry('clover-1', 'Clover_1.gltf', 'Clover 1', 'plants', false, false),
  entry('clover-2', 'Clover_2.gltf', 'Clover 2', 'plants', false, false),

  // ---- Mushrooms (2) ----
  entry('mushroom', 'Mushroom_Common.gltf', 'Mushroom', 'mushrooms', false, true),
  entry('mushroom-laetiporus', 'Mushroom_Laetiporus.gltf', 'Laetiporus', 'mushrooms', false, false),

  // ---- Rocks (3) ----
  entry('rock-medium-1', 'Rock_Medium_1.gltf', 'Rock Medium 1', 'rocks', true, true, 1.5, 1.5),
  entry('rock-medium-2', 'Rock_Medium_2.gltf', 'Rock Medium 2', 'rocks', true, true, 1.5, 1.5),
  entry('rock-medium-3', 'Rock_Medium_3.gltf', 'Rock Medium 3', 'rocks', true, true, 1.5, 1.5),

  // ---- Paths (8) ----
  entry('rock-path-wide', 'RockPath_Round_Wide.gltf', 'Round Path Wide', 'paths', false, true),
  entry('rock-path-small', 'RockPath_Round_Small_1.gltf', 'Round Path Small 1', 'paths', false, true),
  entry('rock-path-small-2', 'RockPath_Round_Small_2.gltf', 'Round Path Small 2', 'paths', false, false),
  entry('rock-path-small-3', 'RockPath_Round_Small_3.gltf', 'Round Path Small 3', 'paths', false, false),
  entry('rock-path-thin', 'RockPath_Round_Thin.gltf', 'Round Path Thin', 'paths', false, false),
  entry('rock-path-sq-wide', 'RockPath_Square_Wide.gltf', 'Square Path Wide', 'paths', false, false),
  entry('rock-path-sq-small-1', 'RockPath_Square_Small_1.gltf', 'Square Path Small 1', 'paths', false, false),
  entry('rock-path-sq-small-2', 'RockPath_Square_Small_2.gltf', 'Square Path Small 2', 'paths', false, false),
  entry('rock-path-sq-small-3', 'RockPath_Square_Small_3.gltf', 'Square Path Small 3', 'paths', false, false),
  entry('rock-path-sq-thin', 'RockPath_Square_Thin.gltf', 'Square Path Thin', 'paths', false, false),

  // ---- Pebbles (11) ----
  entry('pebble-round-1', 'Pebble_Round_1.gltf', 'Pebble Round 1', 'pebbles', false, false),
  entry('pebble-round-2', 'Pebble_Round_2.gltf', 'Pebble Round 2', 'pebbles', false, false),
  entry('pebble-round-3', 'Pebble_Round_3.gltf', 'Pebble Round 3', 'pebbles', false, false),
  entry('pebble-round-4', 'Pebble_Round_4.gltf', 'Pebble Round 4', 'pebbles', false, false),
  entry('pebble-round-5', 'Pebble_Round_5.gltf', 'Pebble Round 5', 'pebbles', false, false),
  entry('pebble-square-1', 'Pebble_Square_1.gltf', 'Pebble Square 1', 'pebbles', false, false),
  entry('pebble-square-2', 'Pebble_Square_2.gltf', 'Pebble Square 2', 'pebbles', false, false),
  entry('pebble-square-3', 'Pebble_Square_3.gltf', 'Pebble Square 3', 'pebbles', false, false),
  entry('pebble-square-4', 'Pebble_Square_4.gltf', 'Pebble Square 4', 'pebbles', false, false),
  entry('pebble-square-5', 'Pebble_Square_5.gltf', 'Pebble Square 5', 'pebbles', false, false),
  entry('pebble-square-6', 'Pebble_Square_6.gltf', 'Pebble Square 6', 'pebbles', false, false),

  // ---- Petals (5) ----
  entry('petal-1', 'Petal_1.gltf', 'Petal 1', 'petals', false, false),
  entry('petal-2', 'Petal_2.gltf', 'Petal 2', 'petals', false, false),
  entry('petal-3', 'Petal_3.gltf', 'Petal 3', 'petals', false, false),
  entry('petal-4', 'Petal_4.gltf', 'Petal 4', 'petals', false, false),
  entry('petal-5', 'Petal_5.gltf', 'Petal 5', 'petals', false, false),
]

// ---- Lookup by modelId ----
export const CATALOG_BY_ID: Record<string, CatalogEntry> = Object.fromEntries(
  MEGAKIT_CATALOG.map((e) => [e.modelId, e]),
)

// ---- Get model file path from fileName ----
export function getModelPath(fileName: string): string {
  return `models/objects/${fileName}`
}
