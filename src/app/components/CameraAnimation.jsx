'use client';
import { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraAnimation({ targetPosition, onComplete }) {
  const [isAnimating, setIsAnimating] = useState(true);

  useFrame(({ camera }) => {
    if (!isAnimating) return;

    camera.position.lerp(new THREE.Vector3(...targetPosition), 0.02);
    camera.lookAt(0, 0, 0);

    if (
      camera.position.distanceTo(new THREE.Vector3(...targetPosition)) < 0.1
    ) {
      setIsAnimating(false);
      onComplete();
    }
  });

  return null;
}
