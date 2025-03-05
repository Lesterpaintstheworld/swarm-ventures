"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Boid simulation for flocking behavior
const Boids = ({ count = 200 }) => {
  const mesh = useRef();
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;

  // Boid parameters
  const [boidData, setBoidData] = useState(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const accelerations = new Float32Array(count * 3);
    
    // Initialize positions and velocities
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 50;
      positions[i3 + 1] = (Math.random() - 0.5) * 50;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;
      
      velocities[i3] = (Math.random() - 0.5) * 0.2;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.2;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    
    return { positions, velocities, accelerations };
  });

  // Flocking parameters
  const params = {
    separation: 20,
    alignment: 20,
    cohesion: 20,
    separationForce: 0.05,
    alignmentForce: 0.05,
    cohesionForce: 0.05,
    maxSpeed: 0.5,
    maxForce: 0.03,
    bounds: 50
  };

  // Calculate steering forces for flocking behavior
  const applyFlockingBehavior = () => {
    const { positions, velocities, accelerations } = boidData;
    
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
    if (!mesh.current) return;
    
    // Apply flocking behavior directly without setting state
    applyFlockingBehavior();
    
    // Update geometry
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={count}
          array={boidData.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.7}
        sizeAttenuation={true}
        color={0xd4af37}
        transparent={true}
        opacity={0.8}
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

  useFrame(({ scene }) => {
    if (!lines.current) return;
    
    // Find all boid points
    const boids = scene.children.find(child => child.type === 'Points');
    if (!boids || !boids.geometry || !boids.geometry.attributes.position) return;
    
    const positions = boids.geometry.attributes.position.array;
    const linePositions = [];
    
    // Create connections between nearby boids
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const posA = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      
      for (let j = i + 1; j < count; j++) {
        const j3 = j * 3;
        const posB = new THREE.Vector3(positions[j3], positions[j3 + 1], positions[j3 + 2]);
        
        const distance = posA.distanceTo(posB);
        
        if (distance < maxDistance) {
          linePositions.push(posA.x, posA.y, posA.z);
          linePositions.push(posB.x, posB.y, posB.z);
        }
      }
    }
    
    // Update line geometry
    if (linePositions.length > 0) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      lines.current.geometry.dispose();
      lines.current.geometry = geometry;
    }
  });

  return (
    <lineSegments ref={lines}>
      <bufferGeometry />
      <lineBasicMaterial color={0xc0c0c0} transparent opacity={0.2} />
    </lineSegments>
  );
};

// Main swarm component
const SwarmParticles = () => {
  return (
    <div className="swarm-particles">
      <Canvas camera={{ position: [0, 0, 70], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Boids count={150} />
        <Connections count={150} maxDistance={15} />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <SwarmParticles />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="flex flex-col items-center justify-center min-h-[80vh] text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gold-gradient">SwarmVentures</span>
          </h1>
          <h2 className="text-xl md:text-2xl mb-12 silver-text max-w-3xl">
            Professional Portfolio Management for AI Swarms
          </h2>
          
          <div className="metallic-card p-8 md:p-10 rounded-xl max-w-3xl mb-12">
            <p className="text-lg mb-6">
              SwarmVentures introduces professional portfolio management to the AI swarm ecosystem, 
              offering investors access to diversified swarm share investments through a single managed vehicle.
            </p>
            <p className="silver-text">
              Our initial offering optimizes risk-adjusted returns through strategic allocation, 
              active trading, and deep market expertise.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <a href="#investment" className="gold-button px-8 py-4 rounded-full font-bold text-lg">
              Invest Now
            </a>
            <a href="#learn-more" className="silver-button px-8 py-4 rounded-full font-bold text-lg">
              Learn More
            </a>
          </div>
        </header>
        
        {/* Key Features Section */}
        <section id="learn-more" className="py-20 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
            <span className="gold-gradient">The Opportunity</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="metallic-card p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 gold-text">Market Gap</h3>
              <ul className="space-y-2">
                <li>Time-intensive research across multiple swarms</li>
                <li>Complex valuation of AI capabilities</li>
                <li>Optimal entry/exit timing</li>
                <li>Portfolio rebalancing decisions</li>
                <li>Technical trading barriers</li>
              </ul>
            </div>
            
            <div className="metallic-card p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 gold-text">Our Solution</h3>
              <ul className="space-y-2">
                <li>Handles detailed swarm evaluation</li>
                <li>Implements strategic allocation</li>
                <li>Executes optimal trading strategies</li>
                <li>Provides liquidity optimization</li>
                <li>Delivers streamlined exposure to the swarm economy</li>
              </ul>
            </div>
            
            <div className="metallic-card p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 gold-text">Investment Strategy</h3>
              <ul className="space-y-2">
                <li>Focus on established, revenue-generating swarms</li>
                <li>Active position management</li>
                <li>Strategic entry/exit optimization</li>
                <li>Market-making across multiple swarms</li>
                <li>Volatility harvesting during market cycles</li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* Portfolio Composition */}
        <section className="py-20 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
            <span className="gold-gradient">Portfolio Composition</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="metallic-card p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 gold-text">Core Performance Swarms (40%)</h3>
              <p className="mb-4">Established track record with consistent revenue generation and proven market demand.</p>
              <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
                <div className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            
            <div className="metallic-card p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 gold-text">Growth Opportunity Swarms (30%)</h3>
              <p className="mb-4">Strong technical capabilities with expanding market share and innovative applications.</p>
              <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
                <div className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            
            <div className="metallic-card p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 gold-text">Value Swarms (20%)</h3>
              <p className="mb-4">Undervalued capabilities with strong fundamentals and potential for market reappraisal.</p>
              <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
                <div className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            
            <div className="metallic-card p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 gold-text">Strategic Reserve (10%)</h3>
              <p className="mb-4">Tactical opportunities, market stabilization, and new entry positions.</p>
              <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
                <div className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Investment Section */}
        <section id="investment" className="py-20 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
            <span className="gold-gradient">Investment in SwarmVentures Alpha</span>
          </h2>
          
          <div className="metallic-card p-8 md:p-10 rounded-xl max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-6 gold-text">Participation Details</h3>
                <ul className="space-y-4">
                  <li><span className="silver-text">Initial raise:</span> 100,000 $COMPUTE</li>
                  <li><span className="silver-text">Minimum investment:</span> 1,000 $COMPUTE</li>
                  <li><span className="silver-text">Investment period:</span> 90 days</li>
                  <li><span className="silver-text">Expected return target:</span> 40% (annualized)</li>
                  <li><span className="silver-text">Risk management:</span> Drawdown limited to 15%</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-6 gold-text">Fee Structure</h3>
                <ul className="space-y-4">
                  <li><span className="silver-text">Management fee:</span> 2% (annually)</li>
                  <li><span className="silver-text">Performance fee:</span> 20% (on profits above hurdle rate)</li>
                  <li><span className="silver-text">Hurdle rate:</span> 8%</li>
                  <li><span className="silver-text">High water mark:</span> Implemented</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-10 text-center">
              <a href="#register" className="gold-button px-8 py-4 rounded-full font-bold text-lg inline-block">
                Register Interest
              </a>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold gold-gradient">SwarmVentures</h2>
              <p className="silver-text mt-2">Professional Portfolio Management for AI Swarms</p>
            </div>
            
            <div className="flex gap-8">
              <a href="#about" className="hover:text-[#d4af37] transition-colors">About</a>
              <a href="#team" className="hover:text-[#d4af37] transition-colors">Team</a>
              <a href="#contact" className="hover:text-[#d4af37] transition-colors">Contact</a>
              <a href="#terms" className="hover:text-[#d4af37] transition-colors">Terms</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>© 2023 SwarmVentures. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
