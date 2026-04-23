import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Globe() {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
      globeRef.current.rotation.x += 0.0005;
    }
  });

  const markers = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = 20;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 2.82;
      positions.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ]);
    }
    return positions;
  }, []);

  return (
    <group>
      <mesh ref={globeRef}>
        <icosahedronGeometry args={[2.8, 2]} />
        <meshBasicMaterial color="#3A86FF" wireframe transparent opacity={0.6} />
      </mesh>
      {markers.map((pos, i) => (
        <Marker key={i} position={pos} />
      ))}
    </group>
  );
}

function Marker({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.position.z = position[2] + Math.sin(t * 2 + position[0]) * 0.05;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color="#FFFFFF" />
    </mesh>
  );
}

function ScanlineOverlay() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += 0.01;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[32, 18]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vec2 uv = vUv;
            float scanline = sin(uv.y * 800.0 + uTime * 2.0) * 0.5 + 0.5;
            float mask = scanline * 0.15;
            vec3 color = vec3(0.0, 0.07, 0.2);
            color += vec3(mask * 0.2, mask * 0.5, mask * 0.9);
            gl_FragColor = vec4(color, 0.3);
          }
        `}
      />
    </mesh>
  );
}

export default function BlueprintGlobe() {
  return (
    <div className="w-full h-full" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[-2, 0.5, 3]} intensity={1} />
        <pointLight position={[2, -0.5, 3]} intensity={0.5} />
        <Globe />
        <ScanlineOverlay />
      </Canvas>
    </div>
  );
}
