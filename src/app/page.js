'use client';
import { Canvas } from '@react-three/fiber';
import { MapControls, OrbitControls } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { moreImages } from './components/ImageData';
import { GridHelper } from 'three';
import { MOUSE, TOUCH } from 'three';
import { gsap } from 'gsap';

function CameraController({ animationComplete }) {
  const velocity = 0.5; // Speed of camera movement
  const direction = new THREE.Vector3(); // Vector to store camera direction
  const forwardDirection = new THREE.Vector3();
  const rightDirection = new THREE.Vector3();
  const isMovingForward = useRef(false);
  const isMovingBackward = useRef(false); // For backward movement
  const isMovingRight = useRef(false); // For rightward movement
  const isMovingLeft = useRef(false); // For leftward movement
  const movementSpeed = 0.5;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!animationComplete) return; // Disable movement during animation
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
  }, [animationComplete]);

  useFrame(({ camera }) => {
    if (!animationComplete) return; // Disable movement during animation

    camera.getWorldDirection(forwardDirection);
    forwardDirection.y = 0;
    forwardDirection.normalize();

    // Right direction is the cross product of forward and the camera's up vector
    rightDirection.crossVectors(forwardDirection, camera.up).normalize();
    const movement = new THREE.Vector3();

    if (isMovingForward.current) {
      movement.add(forwardDirection.clone().multiplyScalar(+velocity));
      console.log(camera.position);
    }

    if (isMovingBackward.current) {
      movement.add(forwardDirection.clone().multiplyScalar(-velocity));
      console.log(camera.position);
    }

    if (isMovingRight.current) {
      movement.add(rightDirection.clone().multiplyScalar(velocity));
    }

    if (isMovingLeft.current) {
      movement.add(rightDirection.clone().multiplyScalar(-velocity));
    }

    camera.position.add(movement);

    camera.position.x -= 0.01;

    // Prevent camera from moving too far in the X-axis
    camera.position.set(
      Math.round(camera.position.x * 1000) / 1000,
      Math.round(camera.position.y * 1000) / 1000,
      Math.round(camera.position.z * 1000) / 1000
    );
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
    // console.log('Camera position:', camera.position);
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
  const handleClick = ({ camera }) => {
    console.log('Mesh position:', meshRef.current.position);
  };

  return (
    <mesh position={position} ref={meshRef} onClick={handleClick}>
      <planeGeometry args={[9, 6]} />
      <meshBasicMaterial side={THREE.DoubleSide}>
        <primitive attach='map' object={new THREE.TextureLoader().load(url)} />
      </meshBasicMaterial>
    </mesh>
  );
}

export default function Home() {
  const [animationComplete, setAnimationComplete] = useState(false);
  const cameraRef = useRef();
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 40, 0], fov: 75 }}
        style={{
          background:
            'radial-gradient(circle, rgba(138,138,138,1) 26%, rgba(164,164,164,1) 45%, rgba(115,145,150,1) 68%, rgba(164,164,164,1) 100%, rgba(210,210,210,1) 100%)',
        }}
        onCreated={({ camera }) => {
          cameraRef.current = camera;
        }}
      >
        <CameraAnimation
          targetPosition={[0, 0, 20]}
          onComplete={() => setAnimationComplete(true)}
        />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <CameraController animationComplete={animationComplete} />
        {moreImages.map((url, index) => {
          // Create a spread of 100 units in each dimension
          const spread = 150;
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
        {/* {animationComplete && <OrbitControls />} */}
        <MapControls touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_ROTATE }} />
        {/* <gridHelper args={[30, 30]} position={[0, 0, 0]} /> */}
      </Canvas>
    </main>
  );
}
