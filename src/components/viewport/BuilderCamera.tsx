import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import { MOUSE } from 'three'

// ---- Same isometric constants as xTactics FollowCamera ----
const DISTANCE = 100
const INITIAL_X = DISTANCE * Math.cos(Math.PI / 4)
const INITIAL_Y = DISTANCE * Math.sin(Math.atan(Math.SQRT2))
const INITIAL_Z = DISTANCE * Math.sin(Math.PI / 4)

function BuilderCamera() {
  return (
    <>
      <OrthographicCamera
        makeDefault
        zoom={50}
        position={[INITIAL_X, INITIAL_Y, INITIAL_Z]}
        near={-1000}
        far={2000}
      />
      <OrbitControls
        makeDefault
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minZoom={1}
        maxZoom={120}
        // ---- Middle=rotate, Right=pan, Left free for clicks ----
        mouseButtons={{
          LEFT: -1 as MOUSE,
          MIDDLE: MOUSE.ROTATE,
          RIGHT: MOUSE.PAN,
        }}
        target={[0, 0, 0]}
      />
    </>
  )
}

export default BuilderCamera
