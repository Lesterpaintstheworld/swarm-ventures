"use client";

import { useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Boid simulation for flocking behavior
const Boids = ({ count = 250 }) => {
  const mesh = useRef<THREE.Points>(null);
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;
  const geometryRef = useRef(new THREE.BufferGeometry());

  // Add mouse position state
  const mouse = useRef(new THREE.Vector3(0, 0, 0));
  const mouseInfluenceRadius = 20; // How far the mouse influence reaches
  const mouseRepelStrength = 0.05; // How strongly particles are repelled by mouse
  
  // Add click interaction state
  const clickForce = useRef(new THREE.Vector3(0, 0, 0));
  const clickActive = useRef(false);
  const clickForceRadius = 40; // Larger radius than mouse influence
  const clickForceStrength = 0.3; // Much stronger than mouse repel strength
  const clickForceDuration = 1000; // Duration of the click force in milliseconds
  const clickForceDecay = 0.95; // How quickly the force decays
  
  // Explosion effect state
  const clickExplosionParticles = useRef<THREE.Points | null>(null);
  const explosionGeometry = useRef(new THREE.BufferGeometry());
  const explosionMaterial = useRef<THREE.PointsMaterial | null>(null);
  const explosionActive = useRef(false);
  const explosionTime = useRef(0);
  const explosionPosition = useRef(new THREE.Vector3(0, 0, 0));
  const explosionParticleCount = 150; // Number of particles in the explosion
  const explosionDuration = 1.5; // Duration in seconds

  // Boid parameters - use refs instead of state to avoid re-renders
  const boidDataRef = useRef({
    positions: new Float32Array(count * 3),
    velocities: new Float32Array(count * 3),
    accelerations: new Float32Array(count * 3)
  });
  
  // Attraction points for all particles
  const centerAttractionStrength = 0.015; // Reduced strength since we'll have two points
  const attractionPoint1 = useRef(new THREE.Vector3(0, 0, 0));
  const attractionPoint2 = useRef(new THREE.Vector3(0, 0, 0));
  const nextAttractionChangeTime1 = useRef(0);
  const nextAttractionChangeTime2 = useRef(0);

  // Initialize the data once
  useEffect(() => {
    const { positions, velocities } = boidDataRef.current;
    
    // Initialize positions and velocities
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;    // Decreased from 40
      positions[i3 + 1] = (Math.random() - 0.5) * 30; // Decreased from 40
      positions[i3 + 2] = (Math.random() - 0.5) * 30; // Decreased from 40
    
      velocities[i3] = (Math.random() - 0.5) * 0.375;    // Increased by 50% from 0.25
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.375; // Increased by 50% from 0.25
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.375; // Increased by 50% from 0.25
    }
  }, [count]);
  
  // Set up random attraction point changes
  useEffect(() => {
    // Set initial attraction points
    setRandomAttractionPoint(1);
    setRandomAttractionPoint(2);
    
    // Function to set a new random attraction point
    function setRandomAttractionPoint(pointNumber: number) {
      // Generate a random point within the bounds
      const bounds = params.bounds * 0.7; // Stay within 70% of the bounds to keep particles more visible
      const point = pointNumber === 1 ? attractionPoint1.current : attractionPoint2.current;
      
      point.set(
        (Math.random() * 2 - 1) * bounds,
        (Math.random() * 2 - 1) * bounds,
        (Math.random() * 2 - 1) * bounds
      );
      
      // Set next change time to be between 4 and 12 seconds from now
      const nextChangeTime = pointNumber === 1 ? nextAttractionChangeTime1 : nextAttractionChangeTime2;
      nextChangeTime.current = Date.now() + 4000 + Math.random() * 8000;
    }
    
    // Set up interval to check if it's time to change the attraction points
    const intervalId = setInterval(() => {
      const now = Date.now();
      
      if (now > nextAttractionChangeTime1.current) {
        setRandomAttractionPoint(1);
      }
      
      if (now > nextAttractionChangeTime2.current) {
        setRandomAttractionPoint(2);
      }
    }, 500); // Check every half second
    
    return () => clearInterval(intervalId);
  }, []);

  // Initialize the geometry
  useEffect(() => {
    if (mesh.current) {
      // Create the position buffer attribute
      geometryRef.current.setAttribute(
        'position',
        new THREE.BufferAttribute(boidDataRef.current.positions, 3)
      );
      
      // Assign the geometry to the mesh
      mesh.current.geometry = geometryRef.current;
    }
  }, []);

  // Add mouse move event listener
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Convert mouse position to normalized device coordinates (-1 to +1)
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      // Set a reasonable z-depth for the mouse in 3D space
      mouse.current.z = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Initialize explosion particles
  useEffect(() => {
    // Initialize explosion particles
    const positions = new Float32Array(explosionParticleCount * 3);
    const velocities = new Float32Array(explosionParticleCount * 3);
    const colors = new Float32Array(explosionParticleCount * 3);
    const sizes = new Float32Array(explosionParticleCount);
    
    // Set initial positions (will be updated on click)
    for (let i = 0; i < explosionParticleCount; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;
      
      // Random velocities in all directions
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 3.75 + Math.random() * 5.625; // Increased by 50% from 2.5 + Math.random() * 3.75
      
      velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i3 + 2] = Math.cos(phi) * speed;
      
      // Gold to orange color gradient
      const t = Math.random();
      colors[i3] = 1.0;  // R: full red
      colors[i3 + 1] = 0.6 + t * 0.3;  // G: varying from gold to orange
      colors[i3 + 2] = t * 0.2;  // B: slight blue for sparkle
      
      // Random sizes
      sizes[i] = 2 + Math.random() * 4;
    }
    
    explosionGeometry.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    explosionGeometry.current.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    explosionGeometry.current.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    explosionGeometry.current.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material with custom shader for better looking particles
    explosionMaterial.current = new THREE.PointsMaterial({
      size: 4, // Increased from 3 for bigger explosion particles
      sizeAttenuation: true,
      color: 0xffcc00,
      transparent: true,
      opacity: 0.9, // Increased from 0.8 for more visibility
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });
    
    // Hide explosion initially
    if (explosionMaterial.current) {
      explosionMaterial.current.visible = false;
    }
  }, []);

  // Add click event listener
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Convert click position to normalized device coordinates (-1 to +1)
      clickForce.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      clickForce.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      clickForce.current.z = 0;
      
      // Activate the click force
      clickActive.current = true;
      
      // Set a timeout to gradually decay the click force
      setTimeout(() => {
        clickActive.current = false;
      }, clickForceDuration);
      
      // Trigger explosion effect
      explosionActive.current = true;
      explosionTime.current = 0;
      
      // Set explosion position to match click position
      explosionPosition.current.copy(clickForce.current);
      explosionPosition.current.x *= 50; // Scale to match world coordinates
      explosionPosition.current.y *= 50;
      
      // Update explosion particle positions to start from click point
      if (explosionGeometry.current && explosionGeometry.current.attributes.position) {
        const positions = explosionGeometry.current.attributes.position.array as Float32Array;
        for (let i = 0; i < explosionParticleCount; i++) {
          const i3 = i * 3;
          positions[i3] = explosionPosition.current.x;
          positions[i3 + 1] = explosionPosition.current.y;
          positions[i3 + 2] = explosionPosition.current.z;
        }
        explosionGeometry.current.attributes.position.needsUpdate = true;
      }
      
      // Make explosion visible
      if (explosionMaterial.current) {
        explosionMaterial.current.visible = true;
      }
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  // Flocking parameters
  const params = {
    separation: 120,        // Increased from 80 to 120 for much more space between particles
    alignment: 40,          // Increased from 35
    cohesion: 40,           // Increased from 30
    separationForce: 0.5,   // Increased from 0.35 to 0.5 for much stronger separation
    alignmentForce: 0.08,   // Increased from 0.06
    cohesionForce: 0.08,    // Increased from 0.05
    maxSpeed: 0.28125,      // Increased by 50% from 0.1875
    maxForce: 0.03,         // Decreased from 0.04
    bounds: 50              // Decreased from 60
  };

  // Calculate steering forces for flocking behavior
  const applyFlockingBehavior = () => {
    const { positions, velocities, accelerations } = boidDataRef.current;
    
    // Reset accelerations
    for (let i = 0; i < count * 3; i++) {
      accelerations[i] = 0;
    }
    
    // Convert mouse from normalized device coordinates to world space
    const mouseWorld = mouse.current.clone();
    mouseWorld.x *= 50; // Scale to match the world size
    mouseWorld.y *= 50;
    
    // Apply flocking rules
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
        
      // Temporary vectors for calculations
      const position = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      const velocity = new THREE.Vector3(velocities[i3], velocities[i3 + 1], velocities[i3 + 2]);
        
      // Add mouse avoidance behavior
      const distanceToMouse = position.distanceTo(mouseWorld);
      if (distanceToMouse < mouseInfluenceRadius) {
        const mouseRepel = new THREE.Vector3().subVectors(position, mouseWorld);
        mouseRepel.normalize();
        // The closer to the mouse, the stronger the repulsion
        const repelStrength = mouseRepelStrength * (1 - distanceToMouse / mouseInfluenceRadius);
        mouseRepel.multiplyScalar(repelStrength);
        accelerations[i3] += mouseRepel.x;
        accelerations[i3 + 1] += mouseRepel.y;
        accelerations[i3 + 2] += mouseRepel.z;
      }
      
      // Apply attraction to the first random point
      const attractionVector1 = new THREE.Vector3(
        attractionPoint1.current.x - position.x,
        attractionPoint1.current.y - position.y,
        attractionPoint1.current.z - position.z
      );

      // Calculate distance to first attraction point
      const distanceToAttraction1 = attractionVector1.length();

      // Normalize and apply the attraction strength with cube law scaling
      attractionVector1.normalize();
      // Use cube law for stronger attraction at medium distances
      const scaledAttractionStrength1 = centerAttractionStrength * 
        Math.pow(Math.min(1.0, distanceToAttraction1 / 40), 3); // Cube law with distance scaling
      attractionVector1.multiplyScalar(scaledAttractionStrength1);

      // Apply attraction to the second random point
      const attractionVector2 = new THREE.Vector3(
        attractionPoint2.current.x - position.x,
        attractionPoint2.current.y - position.y,
        attractionPoint2.current.z - position.z
      );

      // Calculate distance to second attraction point
      const distanceToAttraction2 = attractionVector2.length();

      // Normalize and apply the attraction strength with cube law scaling
      attractionVector2.normalize();
      // Use cube law for stronger attraction at medium distances
      const scaledAttractionStrength2 = centerAttractionStrength * 
        Math.pow(Math.min(1.0, distanceToAttraction2 / 40), 3); // Cube law with distance scaling
      attractionVector2.multiplyScalar(scaledAttractionStrength2);

      // Apply both attraction forces
      accelerations[i3] += attractionVector1.x + attractionVector2.x;
      accelerations[i3 + 1] += attractionVector1.y + attractionVector2.y;
      accelerations[i3 + 2] += attractionVector1.z + attractionVector2.z;
      
      // Apply click force if active
      if (clickActive.current) {
        // Convert click force from normalized device coordinates to world space
        const clickWorld = clickForce.current.clone();
        clickWorld.x *= 50; // Scale to match the world size
        clickWorld.y *= 50;
        
        // Calculate distance to click point
        const distanceToClick = position.distanceTo(clickWorld);
        
        if (distanceToClick < clickForceRadius) {
          // Create a repulsion vector away from the click point
          const repelVector = new THREE.Vector3().subVectors(position, clickWorld);
          repelVector.normalize();
          
          // The closer to the click point, the stronger the repulsion
          // Use a non-linear falloff for more dramatic effect
          const repelStrength = clickForceStrength * Math.pow(1 - distanceToClick / clickForceRadius, 2);
          repelVector.multiplyScalar(repelStrength);
          
          // Apply the repulsion force
          accelerations[i3] += repelVector.x;
          accelerations[i3 + 1] += repelVector.y;
          accelerations[i3 + 2] += repelVector.z;
        }
      }
      
      // Separation - steer to avoid crowding local flockmates
      const separation = new THREE.Vector3();
      let separationCount = 0;
      
      // Alignment - steer towards the average heading of local flockmates
      const alignment = new THREE.Vector3();
      let alignmentCount = 0;
      
      // Cohesion - steer to move toward the average position of local flockmates
      const cohesion = new THREE.Vector3();
      let cohesionCount = 0;
      
      // Check against all other boids
      for (let j = 0; j < count; j++) {
        if (i === j) continue;
        
        const j3 = j * 3;
        const otherPosition = new THREE.Vector3(positions[j3], positions[j3 + 1], positions[j3 + 2]);
        const otherVelocity = new THREE.Vector3(velocities[j3], velocities[j3 + 1], velocities[j3 + 2]);
        
        const distance = position.distanceTo(otherPosition);
        
        // Separation
        if (distance < params.separation) {
          const diff = new THREE.Vector3().subVectors(position, otherPosition);
          diff.normalize();
          // Use an even stronger inverse power law for much stronger repulsion at close distances
          const repulsionStrength = Math.pow(params.separation / Math.max(distance, 0.1), 5); // Changed from fourth power to fifth power
          diff.multiplyScalar(repulsionStrength); // This will be much stronger when boids are very close
          separation.add(diff);
          separationCount++;
        }
        
        // Alignment
        if (distance < params.alignment) {
          alignment.add(otherVelocity);
          alignmentCount++;
        }
        
        // Cohesion
        if (distance < params.cohesion) {
          cohesion.add(otherPosition);
          cohesionCount++;
        }
      }
      
      // Calculate average and apply forces
      if (separationCount > 0) {
        separation.divideScalar(separationCount);
        separation.normalize();
        separation.multiplyScalar(params.maxSpeed);
        separation.sub(velocity);
        separation.clampLength(0, params.maxForce);
        separation.multiplyScalar(params.separationForce);
      }
      
      if (alignmentCount > 0) {
        alignment.divideScalar(alignmentCount);
        alignment.normalize();
        alignment.multiplyScalar(params.maxSpeed);
        alignment.sub(velocity);
        alignment.clampLength(0, params.maxForce);
        alignment.multiplyScalar(params.alignmentForce);
      }
      
      if (cohesionCount > 0) {
        cohesion.divideScalar(cohesionCount);
        cohesion.sub(position);
        cohesion.normalize();
        cohesion.multiplyScalar(params.maxSpeed);
        cohesion.sub(velocity);
        cohesion.clampLength(0, params.maxForce);
        cohesion.multiplyScalar(params.cohesionForce);
      }
      
      // Apply forces
      accelerations[i3] += separation.x + alignment.x + cohesion.x;
      accelerations[i3 + 1] += separation.y + alignment.y + cohesion.y;
      accelerations[i3 + 2] += separation.z + alignment.z + cohesion.z;
    }
    
    // Update positions and velocities
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Update velocity
      velocities[i3] += accelerations[i3];
      velocities[i3 + 1] += accelerations[i3 + 1];
      velocities[i3 + 2] += accelerations[i3 + 2];
      
      // Limit speed
      const speed = Math.sqrt(
        velocities[i3] * velocities[i3] + 
        velocities[i3 + 1] * velocities[i3 + 1] + 
        velocities[i3 + 2] * velocities[i3 + 2]
      );
      
      if (speed > params.maxSpeed) {
        velocities[i3] = (velocities[i3] / speed) * params.maxSpeed;
        velocities[i3 + 1] = (velocities[i3 + 1] / speed) * params.maxSpeed;
        velocities[i3 + 2] = (velocities[i3 + 2] / speed) * params.maxSpeed;
      }
      
      // Update position
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      
      // Boundary conditions - wrap around
      const bounds = params.bounds;
      if (positions[i3] > bounds) positions[i3] = -bounds;
      if (positions[i3] < -bounds) positions[i3] = bounds;
      if (positions[i3 + 1] > bounds) positions[i3 + 1] = -bounds;
      if (positions[i3 + 1] < -bounds) positions[i3 + 1] = bounds;
      if (positions[i3 + 2] > bounds) positions[i3 + 2] = -bounds;
      if (positions[i3 + 2] < -bounds) positions[i3 + 2] = bounds;
    }
    
    // No need to return anything as we're modifying the arrays in place
  };

  // Animation loop
  useFrame((state, delta) => {
    if (!mesh.current || !mesh.current.geometry || !mesh.current.geometry.attributes.position) return;
    
    // Apply flocking behavior directly without setting state
    applyFlockingBehavior();
    
    // Update geometry
    mesh.current.geometry.attributes.position.needsUpdate = true;
    
    // Add shimmer effect to particles
    if (mesh.current && mesh.current.material) {
      // Cast to PointsMaterial to access size property
      const material = mesh.current.material as THREE.PointsMaterial;
      
      // Create a more varied size pulsing effect with stronger glow
      const time = state.clock.getElapsedTime();
      const shimmerFactor = 0.4; // Keep the same shimmer factor
        
      // Make each particle shimmer at a different rate with more dramatic effect
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
          
        // Create much more unique offsets for each particle based on its position
        // This ensures particles don't twinkle in sync
        const uniqueOffset = (i % 31) * 0.37 + Math.sin(boidDataRef.current.positions[i3] * 0.1) * 5;
          
        // Use different frequency multipliers for each particle based on its index
        const freqMultiplier = 1.5 + (i % 7) * 0.2;
          
        // Create a more complex shimmer pattern with multiple sine waves
        const shimmerValue = 
          Math.sin(time * freqMultiplier + uniqueOffset) * 0.3 + 
          Math.sin(time * 0.7 + uniqueOffset * 2.3) * 0.1;
          
        // Apply a more varied color shift between gold and bright yellow
        // Use the particle's position and a different time scale for color shifts
        if (Math.sin(time * 0.5 + boidDataRef.current.positions[i3 + 1] * 0.2 + i * 0.05) > 0.3) {
          material.color.setHex(0xffd700); // Gold
        } else {
          material.color.setHex(0xffec8b); // Light golden rod
        }
          
        // Vary the size more dramatically based on position and time
        // This creates a more random twinkling effect that's not synchronized
        const pulseSize = 0.75 * (1 + shimmerValue * 0.45);
        material.size = pulseSize;
      }
    }
    
    // Update explosion effect if active
    if (explosionActive.current && explosionGeometry.current && explosionGeometry.current.attributes.position) {
      explosionTime.current += delta;
      
      if (explosionTime.current >= explosionDuration) {
        explosionActive.current = false;
        if (explosionMaterial.current) {
          explosionMaterial.current.visible = false;
        }
      } else {
        const positions = explosionGeometry.current.attributes.position.array as Float32Array;
        const velocities = explosionGeometry.current.attributes.velocity.array as Float32Array;
        const t = explosionTime.current / explosionDuration;
        
        // Update explosion particle positions
        for (let i = 0; i < explosionParticleCount; i++) {
          const i3 = i * 3;
          
          // Move particles outward based on their velocity
          positions[i3] += velocities[i3] * delta;
          positions[i3 + 1] += velocities[i3 + 1] * delta;
          positions[i3 + 2] += velocities[i3 + 2] * delta;
        }
        
        // Fade out particles over time
        if (explosionMaterial.current) {
          explosionMaterial.current.opacity = 0.8 * (1 - t);
          explosionMaterial.current.size = 3 * (1 - t * 0.5);
        }
        
        explosionGeometry.current.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <>
      <points ref={mesh}>
        <pointsMaterial
          size={0.75}  // Reduced from 1.5 to 0.75 (twice as small)
          sizeAttenuation={true}
          color={0xffd700}  // Keep the golden color
          transparent={true}
          opacity={0.9}  // Keep the same opacity
          vertexColors={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points ref={clickExplosionParticles} geometry={explosionGeometry.current}>
        {explosionMaterial.current && (
          <primitive object={explosionMaterial.current} attach="material" />
        )}
      </points>
    </>
  );
};

// Connections between boids
const Connections = ({ count = 200, maxDistance = 10 }) => {
  const lines = useRef<THREE.LineSegments>(null);
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;
  const linePositionsRef = useRef(new Float32Array(count * count * 6)); // Pre-allocate max possible size
  const lineGeometryRef = useRef(new THREE.BufferGeometry());

  // Initialize the geometry once
  useEffect(() => {
    if (lines.current) {
      lineGeometryRef.current.setAttribute(
        'position', 
        new THREE.BufferAttribute(linePositionsRef.current, 3)
      );
      lines.current.geometry = lineGeometryRef.current;
    }
  }, []);

  useFrame(({ scene }) => {
    if (!lines.current) return;
    
    // Find all boid points
    const boids = scene.children.find(child => child.type === 'Points') as THREE.Points | undefined;
    if (!boids || !boids.geometry || !boids.geometry.attributes.position) return;
    
    const positions = boids.geometry.attributes.position.array;
    let lineIndex = 0;
    
    // Create connections between nearby boids
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const posA = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      
      for (let j = i + 1; j < count; j++) {
        const j3 = j * 3;
        const posB = new THREE.Vector3(positions[j3], positions[j3 + 1], positions[j3 + 2]);
        
        const distance = posA.distanceTo(posB);
        
        if (distance < maxDistance) {
          linePositionsRef.current[lineIndex++] = posA.x;
          linePositionsRef.current[lineIndex++] = posA.y;
          linePositionsRef.current[lineIndex++] = posA.z;
          linePositionsRef.current[lineIndex++] = posB.x;
          linePositionsRef.current[lineIndex++] = posB.y;
          linePositionsRef.current[lineIndex++] = posB.z;
        }
      }
    }
    
    // Update the buffer attribute with the new positions
    // Create a new buffer with just the data we need
    const updatedPositions = new Float32Array(linePositionsRef.current.buffer, 0, lineIndex);
    // Replace the entire attribute with a new one that has the correct count
    lineGeometryRef.current.setAttribute(
      'position',
      new THREE.BufferAttribute(updatedPositions, 3)
    );
  });

  return (
    <lineSegments ref={lines}>
      <lineBasicMaterial color={0xffd700} transparent opacity={0.4} />  // Increased opacity from 0.2 to 0.4
    </lineSegments>
  );
};

// Main swarm component
const SwarmParticles = () => {
  return (
    <div className="swarm-particles" style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: -1 }}>
      <Canvas 
        camera={{ position: [0, 0, 45], fov: 70 }}  // Moved camera from 60 to 45 units away
        style={{ background: '#000000' }}
        dpr={[1, 2]} // Improve rendering on high-DPI displays
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 30, 100]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Boids count={250} />
        <Connections count={250} maxDistance={8} />  // Updated from 200 to 250
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};

export default SwarmParticles;
