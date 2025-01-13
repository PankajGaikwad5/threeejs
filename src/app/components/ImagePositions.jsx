// Generate a random position within the specified radius and controlled height variation
export function getRandomPosition({
  radiusMin,
  radiusMax,
  heightRange = 100,
  heightCenter = 0,
}) {
  const angle = Math.random() * Math.PI * 2; // Random angle in radians
  const radius = Math.random() * (radiusMax - radiusMin) + radiusMin; // Random radius within range
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  // Improved height distribution: Avoid excessive vertical gaps
  const y = heightCenter + Math.random() * heightRange - heightRange / 2; // More even height spread around the center

  return [x, y, z];
}

// Check if the new position is too close to any existing positions
export function isTooClose(position, existingPositions, minDistance) {
  const minDistanceSq = minDistance * minDistance; // Avoid expensive square root calculation
  return existingPositions.some(([x, y, z]) => {
    const [dx, dy, dz] = [position[0] - x, position[1] - y, position[2] - z];
    const distanceSq = dx * dx + dy * dy + dz * dz;
    return distanceSq < minDistanceSq;
  });
}

// Generate positions with improved distribution
export function generatePositions(
  imageCount,
  radiusMin,
  radiusMax,
  minDistance,
  heightRange = 100
) {
  const positions = [];
  let attempts = 0; // Track attempts
  const maxAttempts = imageCount * 100; // Allow up to 100 attempts per image

  while (positions.length < imageCount && attempts < maxAttempts) {
    const newPosition = getRandomPosition({
      radiusMin,
      radiusMax,
      heightRange,
      heightCenter: 0, // Adjust height center as needed
    });
    if (!isTooClose(newPosition, positions, minDistance)) {
      positions.push(newPosition);
    }
    attempts++;
  }

  if (attempts >= maxAttempts) {
    console.warn(
      `Could only place ${positions.length} out of ${imageCount} images. Try adjusting radius or minDistance.`
    );
  }

  return positions;
}
