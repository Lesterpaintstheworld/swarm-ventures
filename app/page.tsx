"use client";

import { useState } from "react";
import dynamic from 'next/dynamic';
import Header from './components/Header';
import Footer from './components/Footer';

// Import SwarmParticles with SSR disabled
const SwarmParticles = dynamic(
  () => import('./components/SwarmParticles'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <SwarmParticles />
      <Header />
      
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
      
      <Footer />
    </div>
  );
}
