'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FloatingImage({ position, url, onClick }) {
  const meshRef = useRef();

  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });
  const limitedYPosition = Math.max(Math.min(position[1], 50), -50);

  return (
    <mesh
      position={[position[0], limitedYPosition, position[2]]}
      ref={meshRef}
      onClick={onClick}
    >
      <planeGeometry args={[9, 6]} />
      <meshBasicMaterial side={THREE.DoubleSide}>
        <primitive attach='map' object={new THREE.TextureLoader().load(url)} />
      </meshBasicMaterial>
    </mesh>
  );
}
