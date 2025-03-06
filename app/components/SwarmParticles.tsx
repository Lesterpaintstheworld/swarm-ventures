"use client";

import { useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Boid simulation for flocking behavior
const Boids = ({ count = 200 }) => {
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
  
  // Track which particles are attracted to the center
  const centerAttractedParticles = useRef<Set<number>>(new Set());
  const centerAttractionStrength = 0.01; // How strongly the selected particles are attracted to center

  // Initialize the data once
  useEffect(() => {
    const { positions, velocities } = boidDataRef.current;
    
    // Initialize positions and velocities
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;    // Decreased from 40
      positions[i3 + 1] = (Math.random() - 0.5) * 30; // Decreased from 40
      positions[i3 + 2] = (Math.random() - 0.5) * 30; // Decreased from 40
    
      velocities[i3] = (Math.random() - 0.5) * 0.25;    // Increased by 25% from 0.2
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.25; // Increased by 25% from 0.2
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.25; // Increased by 25% from 0.2
      
      // Randomly select approximately 10% of particles to be attracted to center
      if (Math.random() < 0.1) {
        centerAttractedParticles.current.add(i);
      }
    }
  }, [count]);

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
      const speed = 2.5 + Math.random() * 3.75; // Increased by 25% from 2 + Math.random() * 3
      
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
      size: 3,
      sizeAttenuation: true,
      color: 0xffcc00,
      transparent: true,
      opacity: 0.8,
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
    separation: 20,         // Decreased from 25
    alignment: 40,          // Increased from 35
    cohesion: 40,           // Increased from 30
    separationForce: 0.08,  // Decreased from 0.12
    alignmentForce: 0.08,   // Increased from 0.06
    cohesionForce: 0.08,    // Increased from 0.05
    maxSpeed: 0.1875,       // Increased by 25% from 0.15
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
      
      // Apply center attraction for selected particles
      if (centerAttractedParticles.current.has(i)) {
        const centerAttraction = new THREE.Vector3(-position.x, -position.y, -position.z);
        centerAttraction.normalize();
        centerAttraction.multiplyScalar(centerAttractionStrength);
        accelerations[i3] += centerAttraction.x;
        accelerations[i3 + 1] += centerAttraction.y;
        accelerations[i3 + 2] += centerAttraction.z;
      }
      
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
          diff.divideScalar(distance); // Weight by distance
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
          size={2.5}  // Reduced from 4
          sizeAttenuation={true}
          color={0xffcc00}
          transparent={true}
          opacity={0.5}  // Reduced by 20% (from 0.625 to 0.5)
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
      <lineBasicMaterial color={0xffffff} transparent opacity={0.35} />  // Reduced by 20% (from 0.4375 to 0.35)
    </lineSegments>
  );
};

// Main swarm component
const SwarmParticles = () => {
  return (
    <div className="swarm-particles" style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: -1 }}>
      <Canvas 
        camera={{ position: [0, 0, 80], fov: 70 }}  // Moved camera closer and increased FOV
        style={{ background: '#000000' }}
        dpr={[1, 2]} // Improve rendering on high-DPI displays
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 30, 100]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Boids count={200} />
        <Connections count={200} maxDistance={12} />  // Reduced from 18
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};

export default SwarmParticles;
