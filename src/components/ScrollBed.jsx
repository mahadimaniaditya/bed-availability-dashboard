import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, ContactShadows } from '@react-three/drei'
import { STATUS, STATUSES } from '../lib/constants'

const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

// A hospital bed that splits apart as the page scrolls, revealing a "free bed" token.
function Rig({ progress }) {
  const ring = useRef(), root = useRef(), frame = useRef(), top = useRef(), blanket = useRef(), head = useRef(), foot = useRef(), orb = useRef()
  useFrame(({ clock }) => {
    const p = progress.get()
    const k = Math.min(1, clock.elapsedTime / 1.1), pop = 1 - Math.pow(1 - k, 3)
    const s = sm(0.25, 0.5, p) - sm(0.62, 0.82, p) // 0 closed, 1 fully open
    root.current.rotation.y = -0.6 + p * Math.PI * 2.4
    root.current.rotation.x = 0.25 * (1 - s)
    root.current.scale.setScalar((1 + 0.18 * s) * pop)
    ring.current.rotation.y = clock.elapsedTime * 1.3
    ring.current.scale.setScalar(s + 0.001)
    ring.current.position.y = 1.3
    frame.current.position.y = 0.35 - s * 0.7
    top.current.position.y = 0.68 + s * 0.9
    blanket.current.position.y = 0.72 + s * 1.7
    head.current.position.z = -1.7 - s * 1.1
    foot.current.position.z = 1.7 + s * 1.1
    orb.current.scale.setScalar(s + 0.001)
    orb.current.rotation.y += 0.03
    orb.current.position.y = 0.95 + s * 0.1
  })
  const teal = <meshStandardMaterial color="#0f766e" roughness={0.4} />
  return (
    <group ref={root} position={[0, -0.7, 0]}>
      <RoundedBox ref={frame} args={[2.2, 0.25, 3.3]} radius={0.06}><meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.4} /></RoundedBox>
      <group ref={top}>
        <RoundedBox args={[2, 0.4, 3.05]} radius={0.12}><meshStandardMaterial color="#ffffff" roughness={0.7} /></RoundedBox>
        <RoundedBox args={[1.5, 0.22, 0.65]} radius={0.1} position={[0, 0.3, -1.1]}><meshStandardMaterial color="#e8fffb" /></RoundedBox>
      </group>
      <RoundedBox ref={blanket} args={[2.04, 0.44, 1.8]} radius={0.12} position={[0, 0.72, 0.6]}><meshStandardMaterial color="#14b8a6" roughness={0.6} /></RoundedBox>
      <RoundedBox ref={head} args={[2.2, 1.1, 0.14]} radius={0.05} position={[0, 0.95, -1.7]}>{teal}</RoundedBox>
      <RoundedBox ref={foot} args={[2.2, 0.6, 0.12]} radius={0.05} position={[0, 0.7, 1.7]}>{teal}</RoundedBox>
      {[[-1, -1.5], [1, -1.5], [-1, 1.5], [1, 1.5]].map(([x, z]) => <mesh key={`${x}${z}`} position={[x, 0.1, z]}><cylinderGeometry args={[0.07, 0.07, 0.3, 16]} /><meshStandardMaterial color="#334155" /></mesh>)}
      <group ref={ring}>{STATUSES.map((st, i) => { const a = (i / 5) * Math.PI * 2; return <mesh key={st} position={[Math.cos(a) * 1.9, Math.sin(a * 2) * 0.3, Math.sin(a) * 1.9]}><sphereGeometry args={[0.2, 24, 24]} /><meshStandardMaterial color={STATUS[st].hex} emissive={STATUS[st].hex} emissiveIntensity={0.7} /></mesh> })}</group>
      <group ref={orb}>
        <mesh><icosahedronGeometry args={[0.5, 1]} /><meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.9} /></mesh>
        <mesh><boxGeometry args={[0.7, 0.18, 0.18]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.6} /></mesh>
        <mesh><boxGeometry args={[0.18, 0.7, 0.18]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.6} /></mesh>
      </group>
    </group>
  )
}

export default function ScrollBed({ progress }) {
  return (
    <Canvas className="!absolute inset-0 z-10 pointer-events-none" camera={{ position: [0, 1.5, 6.6], fov: 35 }} dpr={[1, 1.5]}>
      <ambientLight intensity={1} /><directionalLight position={[5, 8, 5]} intensity={1.8} /><pointLight position={[-4, 2, 3]} color="#5eead4" intensity={20} />
      <Rig progress={progress} />
      <ContactShadows position={[0, -1.3, 0]} opacity={0.3} blur={2.8} scale={9} />
    </Canvas>
  )
}
