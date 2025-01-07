'use client';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { MapControls, OrbitControls } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { moreImages } from './components/ImageData';
import { MOUSE, TOUCH, TextureLoader } from 'three';
import {
  getRandomPosition,
  isTooClose,
  generatePositions,
} from './components/ImagePositions';
import { RxCross1 } from 'react-icons/rx';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import CameraAnimation from './components/CameraAnimation';
import FloatingImage from './components/FloatingImage';
import Modal from './components/Modal';
import './styles.css';
import { imageData } from './components/ImageData';

function CameraController({ animationComplete }) {
  const velocity = 0.5; // Speed of camera movement
  const forwardDirection = new THREE.Vector3();
  const rightDirection = new THREE.Vector3();
  const isMovingForward = useRef(false);
  const isMovingBackward = useRef(false);
  const isMovingRight = useRef(false);
  const isMovingLeft = useRef(false);

  // Handle keyboard events to set movement directions
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

  // Update the camera position every frame
  useFrame(({ camera }) => {
    if (!animationComplete) return;

    // Calculate forward and right directions relative to the camera
    camera.getWorldDirection(forwardDirection);
    forwardDirection.y = 0; // Keep movement on the XZ plane
    forwardDirection.normalize(); // Normalize the forward vector

    // Calculate right direction (perpendicular to forward)
    rightDirection.crossVectors(forwardDirection, camera.up).normalize();

    const movement = new THREE.Vector3();
    if (isMovingForward.current) {
      movement.z = -velocity; // Move forward
      // movement.add(forwardDirection.clone().multiplyScalar(velocity));
      // console.log(forwardDirection);
    }
    if (isMovingBackward.current) {
      movement.z = velocity; // Move backward
    }
    if (isMovingRight.current) {
      movement.add(rightDirection.clone().multiplyScalar(velocity));
    }
    if (isMovingLeft.current) {
      movement.add(rightDirection.clone().multiplyScalar(-velocity));
    }

    // Update the camera's position
    camera.position.add(movement);
  });

  return null;
}

const loader = new FontLoader();
loader.load('', function (font) {
  const textGeometry = new TextGeometry('Hello World', {
    font: font,
    size: 1,
    height: 0.2,
  });
  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(0, 0, 0); // Adjust position as needed
  scene.add(textMesh);
});

export default function Home() {
  const [animationComplete, setAnimationComplete] = useState(false);
  const cameraRef = useRef();
  const positions = generatePositions(moreImages.length, 20, 100, 10);
  const moonTexture = useLoader(TextureLoader, '/assets/moon.jpg');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  const texture = useLoader(THREE.TextureLoader, './assets/space.jpg');

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
        <primitive attach='background' object={texture} />
        <CameraAnimation
          targetPosition={[0, 0, 20]}
          onComplete={() => setAnimationComplete(true)}
        />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <CameraController animationComplete={animationComplete} />
        {imageData.map((data, index) => {
          const spread = 150;
          return (
            <FloatingImage
              key={data.id}
              url={data.img}
              position={positions[index]}
              onClick={() => handleImageClick(data)}
            />
          );
        })}
        {animationComplete && (
          <MapControls
            position={(0, 0, 20)}
            touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_ROTATE }}
            mouseButtons={{
              LEFT: THREE.MOUSE.PAN,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.ROTATE,
            }}
          />
        )}
      </Canvas>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <button
          className='close-button absolute top-3 right-3 z-10 bg-white border-none px-4 py-2 cursor-pointer'
          onClick={handleCloseModal}
        >
          <RxCross1 size={30} className='cross-icon' />
        </button>
        {selectedImage && (
          <div className='modal-content'>
            <img
              src={selectedImage.img}
              className='modal-image'
              alt='Selected'
            />
            <div className='modal-images'>
              {selectedImage.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  className='modal-image'
                  alt={`Related ${idx}`}
                />
              ))}
            </div>
            <p>{selectedImage.details}</p>
          </div>
        )}
      </Modal>
    </main>
  );
}
