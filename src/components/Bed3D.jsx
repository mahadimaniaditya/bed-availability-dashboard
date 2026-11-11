import { Canvas } from '@react-three/fiber'
import { OrbitControls, RoundedBox, ContactShadows } from '@react-three/drei'

const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

function Bed({ hex }) {
  return (
    <group position={[0, -0.5, 0]}>
      <RoundedBox args={[2.2, 0.25, 3.3]} radius={0.06} position={[0, 0.35, 0]}><meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.4} /></RoundedBox>
      <RoundedBox args={[2, 0.4, 3.05]} radius={0.12} position={[0, 0.68, 0]}><meshStandardMaterial color="#f8fafc" roughness={0.7} /></RoundedBox>
      <RoundedBox args={[2.04, 0.44, 1.8]} radius={0.12} position={[0, 0.72, 0.6]}><meshStandardMaterial color={hex} roughness={0.6} /></RoundedBox>
      <RoundedBox args={[1.5, 0.22, 0.65]} radius={0.1} position={[0, 0.98, -1.1]}><meshStandardMaterial color="#ffffff" /></RoundedBox>
      <RoundedBox args={[2.2, 1.1, 0.14]} radius={0.05} position={[0, 0.95, -1.7]}><meshStandardMaterial color="#0f766e" roughness={0.4} /></RoundedBox>
      <RoundedBox args={[2.2, 0.6, 0.12]} radius={0.05} position={[0, 0.7, 1.7]}><meshStandardMaterial color="#0f766e" roughness={0.4} /></RoundedBox>
      {[[-1, -1.5], [1, -1.5], [-1, 1.5], [1, 1.5]].map(([x, z]) => <mesh key={`${x}${z}`} position={[x, 0.1, z]}><cylinderGeometry args={[0.07, 0.07, 0.3, 16]} /><meshStandardMaterial color="#334155" /></mesh>)}
    </group>
  )
}

export default function Bed3D({ hex }) {
  return (
    <Canvas camera={{ position: [4, 3, 5], fov: 35 }} dpr={[1, 1.5]} aria-label="Interactive 3D bed, drag to rotate">
      <ambientLight intensity={0.9} /><directionalLight position={[5, 8, 5]} intensity={1.6} />
      <Bed hex={hex} />
      <ContactShadows position={[0, -0.5, 0]} opacity={0.35} blur={2.5} scale={8} />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate={!reduce} autoRotateSpeed={2.5} minPolarAngle={0.8} maxPolarAngle={1.5} />
    </Canvas>
  )
}
