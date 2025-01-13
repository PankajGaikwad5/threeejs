'use client';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { MapControls, OrbitControls } from '@react-three/drei';
import { useRef, useEffect, useState, useMemo } from 'react';
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

function CameraController({
  animationComplete,
  cameraTarget,
  onTargetReached,
}) {
  const velocity = 0.5;
  const zoomVelocity = 2;
  const stoppingDistance = 5;
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
  }, [animationComplete, cameraTarget]);

  // Update the camera position every frame
  useFrame(({ camera }) => {
    if (!animationComplete) return;

    if (cameraTarget) {
      const currentPosition = new THREE.Vector3().copy(camera.position);
      const targetPosition = new THREE.Vector3(...cameraTarget);

      const direction = targetPosition.clone().sub(currentPosition).normalize();
      const distance = currentPosition.distanceTo(targetPosition);

      if (distance > 0.5) {
        const step = direction.multiplyScalar(zoomVelocity * 0.5);
        camera.position.add(step);
        camera.lookAt(targetPosition);
      } else {
        camera.position.set(...cameraTarget); // Snap to exact position
        camera.lookAt(targetPosition);
        onTargetReached(); // Trigger the modal
      }
      return;
    }

    // Calculate forward and right directions relative to the camera
    camera.getWorldDirection(forwardDirection);
    forwardDirection.y = 0;
    forwardDirection.normalize();
    rightDirection.crossVectors(forwardDirection, camera.up).normalize();

    const movement = new THREE.Vector3();
    if (isMovingForward.current) {
      movement.z = -velocity;
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

export default function Home() {
  const [animationComplete, setAnimationComplete] = useState(false);
  const cameraRef = useRef();
  const positions = generatePositions(moreImages.length, 20, 100, 10);
  const positionsRef = useRef(
    // generatePositions(moreImages.length, 20, 100, 10)
    useMemo(() => generatePositions(moreImages.length, 20, 100, 10), [])
  );
  const moonTexture = useLoader(TextureLoader, '/assets/moon.jpg');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(null);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    // Fetch topics from the API
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/topics');
        const data = await response.json();
        console.log(data);

        setTopics(data.topics);
        console.log(topics);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);

  const handleImageClick = (image, position) => {
    setSelectedImage(image);
    setCameraTarget(position);
    setIsModalOpen(false);
    // setIsModalOpen(true);
  };

  const handleTargetReached = () => {
    setIsModalOpen(true);
    setCameraTarget(null);
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

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleCarouselNavigation = (direction) => {
    if (!selectedImage) return;

    if (direction === 'prev') {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? selectedImage.images.length - 1 : prevIndex - 1
      );
    } else if (direction === 'next') {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === selectedImage.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 40, 0], fov: 75 }}
        onCreated={({ camera }) => {
          cameraRef.current = camera;
        }}
      >
        {/* <primitive attach='background' object={texture} /> */}
        <CameraAnimation
          targetPosition={[0, 0, 20]}
          onComplete={() => setAnimationComplete(true)}
        />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <CameraController
          animationComplete={animationComplete}
          cameraTarget={cameraTarget}
          onTargetReached={handleTargetReached}
          onTargetReached={() => {
            setIsModalOpen(true);
            setCameraTarget(null);
          }}
        />
        {topics.map((data, index) => {
          return (
            <FloatingImage
              key={data._id}
              url={data.images[0]}
              position={positionsRef.current[index]}
              onClick={() =>
                handleImageClick(data, positionsRef.current[index])
              }
            />
          );
        })}
        {/* {animationComplete && ( */}
        <MapControls
          position={(0, 0, 20)}
          touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_ROTATE }}
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          }}
        />
        {/* )} */}
      </Canvas>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <button
          className='close-button absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow cursor-pointer'
          onClick={handleCloseModal}
        >
          <RxCross1 size={24} className='cross-icon' />
        </button>
        {selectedImage && (
          <div className='modal-content'>
            <h2>{selectedImage.title}</h2>
            <div className='carousel'>
              <button
                className='carousel-button left'
                onClick={() => handleCarouselNavigation('prev')}
              >
                ◀
              </button>
              <img
                src={selectedImage.images[currentImageIndex]} // Current image in carousel
                className='main-carousel-image'
                alt={`Selected ${currentImageIndex}`}
              />
              <button
                className='carousel-button right'
                onClick={() => handleCarouselNavigation('next')}
              >
                ▶
              </button>
            </div>
            <div className='thumbnail-container'>
              {selectedImage.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  className={`thumbnail-image ${
                    currentImageIndex === idx ? 'active-thumbnail' : ''
                  }`}
                  onClick={() => setCurrentImageIndex(idx)} // Set current image
                  alt={`Thumbnail ${idx}`}
                />
              ))}
            </div>
            <p>{selectedImage.description}</p>
          </div>
        )}
      </Modal>
    </main>
  );
}
