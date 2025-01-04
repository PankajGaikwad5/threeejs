'use client';
import { Canvas } from '@react-three/fiber';
import { MapControls, OrbitControls } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { moreImages } from './components/ImageData';
import { GridHelper } from 'three';

function CameraController() {
  const velocity = 0.5; // Speed of camera movement
  const direction = new THREE.Vector3(); // Vector to store camera direction
  const forwardDirection = new THREE.Vector3();
  const rightDirection = new THREE.Vector3();
  const isMovingForward = useRef(false);
  const isMovingBackward = useRef(false); // For backward movement
  const isMovingRight = useRef(false); // For rightward movement
  const isMovingLeft = useRef(false); // For leftward movement
  // const maxDistance = 500;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowUp') {
        isMovingForward.current = true;
      }
      if (event.key === 'ArrowDown') {
        isMovingBackward.current = true;
      }
      if (event.key === 'ArrowRight') {
        isMovingRight.current = true;
      }
      if (event.key === 'ArrowLeft') {
        isMovingLeft.current = true;
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'ArrowUp') {
        isMovingForward.current = false;
      }
      if (event.key === 'ArrowDown') {
        isMovingBackward.current = false;
      }
      if (event.key === 'ArrowRight') {
        isMovingRight.current = false;
      }
      if (event.key === 'ArrowLeft') {
        isMovingLeft.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(({ camera }) => {
    if (isMovingForward.current) {
      // Get the camera's forward direction
      camera.getWorldDirection(forwardDirection);
      forwardDirection.multiplyScalar(velocity);

      // Move the camera forward
      camera.position.add(forwardDirection);
    }

    if (isMovingBackward.current) {
      // Get the camera's forward direction (inverted for backward movement)
      camera.getWorldDirection(forwardDirection);
      forwardDirection.multiplyScalar(-velocity);

      // Move the camera backward
      camera.position.add(forwardDirection);
    }

    if (isMovingRight.current) {
      // Get the camera's right direction
      camera.getWorldDirection(forwardDirection);
      rightDirection.crossVectors(forwardDirection, camera.up).normalize(); // Calculate right direction
      rightDirection.multiplyScalar(velocity);

      // Move the camera to the right
      camera.position.add(rightDirection);
    }

    if (isMovingLeft.current) {
      // Get the camera's right direction (inverted for left movement)
      camera.getWorldDirection(forwardDirection);
      rightDirection.crossVectors(forwardDirection, camera.up).normalize();
      rightDirection.multiplyScalar(-velocity);

      // Move the camera to the left
      camera.position.add(rightDirection);
    }
  });

  return null;
}

function CameraAnimation({ targetPosition, onComplete }) {
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

function FloatingImage({ position, url }) {
  const meshRef = useRef();

  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  return (
    <mesh position={position} ref={meshRef}>
      <planeGeometry args={[3, 2]} />
      <meshBasicMaterial side={THREE.DoubleSide}>
        <primitive attach='map' object={new THREE.TextureLoader().load(url)} />
      </meshBasicMaterial>
    </mesh>
  );
}

export default function Home() {
  const [animationComplete, setAnimationComplete] = useState(false);
  return (
    <main style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Canvas
        camera={{ position: [0, 40, 0], fov: 75 }}
        style={{ background: 'black' }}
      >
        <CameraAnimation
          targetPosition={[0, 0, 20]}
          onComplete={() => setAnimationComplete(true)}
        />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <CameraController />
        {moreImages.map((url, index) => {
          // Create a spread of 100 units in each dimension
          const spread = 40;
          return (
            <FloatingImage
              key={index}
              url={url}
              position={[
                Math.random() * spread - spread / 2, // x between -20 and 20
                Math.random() * spread - spread / 2, // y between -20 and 20
                Math.random() * spread - spread / 2, // z between -20 and 20
              ]}
            />
          );
        })}
        {animationComplete && <OrbitControls />}
        <gridHelper args={[30, 30]} position={[0, 0, 0]} />
      </Canvas>
    </main>
  );
}
