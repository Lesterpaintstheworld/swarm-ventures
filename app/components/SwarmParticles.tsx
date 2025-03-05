"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Boid simulation for flocking behavior
const Boids = ({ count = 200 }) => {
  const mesh = useRef();
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;
  const geometryRef = useRef(new THREE.BufferGeometry());

  // Boid parameters - use refs instead of state to avoid re-renders
  const boidDataRef = useRef({
    positions: new Float32Array(count * 3),
    velocities: new Float32Array(count * 3),
    accelerations: new Float32Array(count * 3)
  });

  // Initialize the data once
  useEffect(() => {
    const { positions, velocities } = boidDataRef.current;
    
    // Initialize positions and velocities
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 30;    // Decreased from 40
      positions[i3 + 1] = (Math.random() - 0.5) * 30; // Decreased from 40
      positions[i3 + 2] = (Math.random() - 0.5) * 30; // Decreased from 40
    
      velocities[i3] = (Math.random() - 0.5) * 0.2;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.2;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
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

  // Flocking parameters
  const params = {
    separation: 20,         // Decreased from 25
    alignment: 40,          // Increased from 35
    cohesion: 40,           // Increased from 30
    separationForce: 0.08,  // Decreased from 0.12
    alignmentForce: 0.08,   // Increased from 0.06
    cohesionForce: 0.08,    // Increased from 0.05
    maxSpeed: 0.15,         // Decreased from 0.2
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
    
    // Apply flocking rules
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Temporary vectors for calculations
      const position = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      const velocity = new THREE.Vector3(velocities[i3], velocities[i3 + 1], velocities[i3 + 2]);
      
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
  useFrame(() => {
    if (!mesh.current || !mesh.current.geometry || !mesh.current.geometry.attributes.position) return;
    
    // Apply flocking behavior directly without setting state
    applyFlockingBehavior();
    
    // Update geometry
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <pointsMaterial
        size={4}
        sizeAttenuation={true}
        color={0xffcc00}
        transparent={true}
        opacity={1.0}
        vertexColors={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Connections between boids
const Connections = ({ count = 200, maxDistance = 10 }) => {
  const lines = useRef();
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
    const boids = scene.children.find(child => child.type === 'Points');
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
    if (lineIndex > 0) {
      // Update the count of vertices
      const positionAttribute = lineGeometryRef.current.getAttribute('position');
      positionAttribute.count = lineIndex / 3;
      positionAttribute.needsUpdate = true;
    } else {
      // If no connections, set count to 0
      const positionAttribute = lineGeometryRef.current.getAttribute('position');
      positionAttribute.count = 0;
      positionAttribute.needsUpdate = true;
    }
  });

  return (
    <lineSegments ref={lines}>
      <lineBasicMaterial color={0xffffff} transparent opacity={0.7} />
    </lineSegments>
  );
};

// Main swarm component
const SwarmParticles = () => {
  return (
    <div className="swarm-particles" style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: -1 }}>
      <Canvas 
        camera={{ position: [0, 0, 120], fov: 65 }}  // Moved camera back, reduced FOV
        style={{ background: '#000000' }}
        dpr={[1, 2]} // Improve rendering on high-DPI displays
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 30, 100]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Boids count={200} />
        <Connections count={200} maxDistance={18} />  // Increased from 15
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};

export default SwarmParticles;
