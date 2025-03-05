"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

// Swarm animation component
const SwarmParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = Math.random() > 0.5 ? 'rgba(212, 175, 55, 0.7)' : 'rgba(192, 192, 192, 0.7)';
      }

      update() {
        // Follow mouse with subtle attraction
        if (mouse.x && mouse.y) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 200) {
            this.speedX += dx * 0.0005;
            this.speedY += dy * 0.0005;
          }
        }

        // Add some randomness to movement
        this.speedX += (Math.random() - 0.5) * 0.01;
        this.speedY += (Math.random() - 0.5) * 0.01;
        
        // Limit speed
        const maxSpeed = 1.5;
        const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        if (currentSpeed > maxSpeed) {
          this.speedX = (this.speedX / currentSpeed) * maxSpeed;
          this.speedY = (this.speedY / currentSpeed) * maxSpeed;
        }

        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const particlesArray: Particle[] = [];
    const numberOfParticles = Math.min(100, Math.floor(canvas.width * canvas.height / 10000));
    
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }

    // Mouse position tracking
    const mouse = { x: undefined as number | undefined, y: undefined as number | undefined };
    
    canvas.addEventListener('mousemove', (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    });

    canvas.addEventListener('mouseleave', () => {
      mouse.x = undefined;
      mouse.y = undefined;
    });

    // Connect particles with lines
    function connectParticles() {
      if (!ctx) return;
      
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.1 * (1 - distance/100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    // Animation loop
    function animate() {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      
      connectParticles();
      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="swarm-particles" />;
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
