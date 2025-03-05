"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import dynamic from 'next/dynamic';

// Import SwarmParticles with SSR disabled
const SwarmParticles = dynamic(
  () => import('../components/SwarmParticles'),
  { ssr: false }
);

export default function LearnMore() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden z-10" style={{ backgroundColor: '#000000' }}>
      <SwarmParticles />
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="hero-header flex flex-col items-center justify-center min-h-[50vh] pt-32 pb-10 text-center relative z-10">
          <div className="my-auto py-16 flex flex-col items-center max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-10">
              <span className="gold-gradient">Investment Strategy</span>
            </h1>
            <h2 className="text-xl md:text-2xl mb-16 silver-text max-w-3xl mx-auto">
              How SwarmVentures Generates Returns in the AI Swarm Economy
            </h2>
          </div>
        </header>
        
        {/* Strategy Overview */}
        <section className="py-16 relative z-10">
          <div className="metallic-card p-8 md:p-10 rounded-xl max-w-4xl mx-auto mb-16">
            <h3 className="text-2xl font-bold mb-6 gold-text">Strategy Overview</h3>
            <p className="text-lg mb-6">
              SwarmVentures employs a multi-faceted approach to generating returns in the AI swarm economy. 
              Our professional portfolio management combines strategic allocation, active trading, and deep market expertise 
              to optimize risk-adjusted returns for investors.
            </p>
            <p className="silver-text text-lg">
              Below we outline the key components of our investment strategy and how each contributes to our overall performance targets.
            </p>
          </div>
        </section>
        
        {/* Strategy Components */}
        <section className="py-10 relative z-10">
          <div className="grid grid-cols-1 gap-16">
            {/* Dividend Yield */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3">
                <div className="aspect-square rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 flex items-center justify-center p-8">
                  <svg className="w-24 h-24 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-4 gold-text">Dividend Yield Optimization</h3>
                <p className="text-lg mb-4">
                  Many AI swarms distribute a portion of their revenue to shareholders in the form of dividends. 
                  We identify and invest in swarms with sustainable dividend models and strong revenue generation.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Strategic allocation to high-yield swarms with proven revenue models</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Dividend reinvestment for compounding returns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Timing purchases to maximize dividend capture</span>
                  </li>
                </ul>
                <p className="silver-text">
                  Expected contribution: 15-25% of total returns
                </p>
              </div>
            </div>
            
            {/* Floor Defending */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3 md:order-last">
                <div className="aspect-square rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 flex items-center justify-center p-8">
                  <svg className="w-24 h-24 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-4 gold-text">Floor Defending & Liquidity Provision</h3>
                <p className="text-lg mb-4">
                  We actively participate in floor defending activities for high-quality swarms, providing liquidity 
                  at key price levels to stabilize markets and generate returns through bid-ask spreads.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Strategic limit orders at key support levels</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Market making to capture spread-based returns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Coordinated defense strategies with other major stakeholders</span>
                  </li>
                </ul>
                <p className="silver-text">
                  Expected contribution: 20-30% of total returns
                </p>
              </div>
            </div>
            
            {/* Strategic Flipping */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3">
                <div className="aspect-square rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 flex items-center justify-center p-8">
                  <svg className="w-24 h-24 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                  </svg>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-4 gold-text">Strategic Flipping & Momentum Trading</h3>
                <p className="text-lg mb-4">
                  We capitalize on short to medium-term price movements through strategic position entry and exit, 
                  leveraging our deep market knowledge and technical analysis.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Identifying optimal entry points during market corrections</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Momentum-based position building during uptrends</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Strategic profit taking at resistance levels</span>
                  </li>
                </ul>
                <p className="silver-text">
                  Expected contribution: 25-35% of total returns
                </p>
              </div>
            </div>
            
            {/* Value Investing */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3 md:order-last">
                <div className="aspect-square rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 flex items-center justify-center p-8">
                  <svg className="w-24 h-24 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-4 gold-text">Value Investing & Fundamental Analysis</h3>
                <p className="text-lg mb-4">
                  We identify undervalued swarms with strong fundamentals and growth potential, 
                  taking long-term positions to capture value as the market recognizes their true worth.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Comprehensive evaluation of swarm capabilities and market fit</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Analysis of revenue models and growth trajectories</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Assessment of team quality and execution capability</span>
                  </li>
                </ul>
                <p className="silver-text">
                  Expected contribution: 15-25% of total returns
                </p>
              </div>
            </div>
            
            {/* Risk Management */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3">
                <div className="aspect-square rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 flex items-center justify-center p-8">
                  <svg className="w-24 h-24 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-4 gold-text">Risk Management & Drawdown Protection</h3>
                <p className="text-lg mb-4">
                  Our sophisticated risk management framework protects capital during market downturns 
                  and ensures we maintain our target maximum drawdown of 15%.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Strategic position sizing based on volatility profiles</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Dynamic stop-loss implementation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Correlation analysis to ensure portfolio diversification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#d4af37] mr-2">◆</span>
                    <span>Strategic cash reserves for market opportunities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 relative z-10">
          <div className="metallic-card p-8 md:p-10 rounded-xl max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 gold-gradient">Ready to Invest in the AI Swarm Economy?</h3>
            <p className="text-lg mb-8 max-w-3xl mx-auto">
              Join SwarmVentures Alpha and gain professional exposure to the rapidly growing AI swarm ecosystem 
              through our actively managed portfolio.
            </p>
            <Link href="/#investment" className="gold-button px-8 py-4 rounded-full font-bold text-lg inline-block">
              Invest Now
            </Link>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
