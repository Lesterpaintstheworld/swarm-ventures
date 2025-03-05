"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import dynamic from 'next/dynamic';

// Import SwarmParticles with SSR disabled
const SwarmParticles = dynamic(
  () => import('../components/SwarmParticles'),
  { ssr: false }
);

// Destination wallet address
const TREASURY_WALLET = "A8Sn2X28ev9w1s58VUgNQaEHoqE2msjM9bEonq8tdSAk";

// Token addresses
const TOKEN_ADDRESSES = {
  UBC: "9psiRdn9cXYVps4F1kFuoNjd2EtmqNJXrCPmRppJpump",
  COMPUTE: "B1N1HcMm4RysYz4smsXwmk2UnS8NziqKCM6Ho8i62vXo"
};

export default function Invest() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedToken, setSelectedToken] = useState("UBC");
  const [amount, setAmount] = useState("100000"); // Default to UBC minimum
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [solanaProvider, setSolanaProvider] = useState(null);

  const minAmount = {
    UBC: 100000,
    COMPUTE: 1000000
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Make sure we're in a browser environment
      if (typeof window === 'undefined' || !window.phantom) {
        throw new Error("Phantom wallet is not installed. Please install it from https://phantom.app/");
      }
      
      // Check if Phantom is installed
      const provider = window.phantom?.solana;
      
      if (!provider?.isPhantom) {
        throw new Error("Phantom wallet is not installed. Please install it from https://phantom.app/");
      }
      
      // Connect to Phantom
      const response = await provider.connect();
      setWalletAddress(response.publicKey.toString());
      setWalletConnected(true);
      setSolanaProvider(provider);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      setError(error.message || "Failed to connect to wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvest = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Validate amount
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < minAmount[selectedToken]) {
        throw new Error(`Minimum investment is ${minAmount[selectedToken].toLocaleString()} $${selectedToken}`);
      }
      
      if (!walletConnected || !solanaProvider) {
        throw new Error("Please connect your wallet first");
      }

      // Destination wallet address
      const destinationWallet = TREASURY_WALLET;
      
      // Token address
      const tokenAddress = TOKEN_ADDRESSES[selectedToken];
      
      try {
        // Create a transaction directly using the Phantom provider
        // This will trigger the Phantom wallet UI without opening a new tab
        
        // First, check if the wallet is still connected
        if (!solanaProvider.isConnected) {
          await solanaProvider.connect();
        }
        
        // Create a simple transaction to send tokens
        // This uses the Phantom wallet's built-in transfer method
        const transaction = await solanaProvider.request({
          method: 'transfer',
          params: {
            recipient: destinationWallet,
            amount: numAmount,
            splToken: tokenAddress
          }
        });
        
        console.log('Transaction created:', transaction);
        
        // Show success message
        setSuccess(true);
      } catch (transferError) {
        console.error('Transfer error:', transferError);
        setError(`Failed to create transfer: ${transferError.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error processing investment:", error);
      setError(error.message || "Failed to process investment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden z-10" style={{ backgroundColor: '#000000' }}>
      <SwarmParticles />
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="hero-header flex flex-col items-center justify-center min-h-[40vh] pt-32 pb-10 text-center relative z-10">
          <div className="my-auto py-16 flex flex-col items-center max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-10">
              <span className="gold-gradient">Invest in SwarmVentures</span>
            </h1>
            <h2 className="text-xl md:text-2xl mb-16 silver-text max-w-3xl mx-auto">
              Professional Portfolio Management for AI Swarm Shares
            </h2>
          </div>
        </header>
        
        {/* Investment Overview */}
        <section className="py-16 relative z-10">
          <div className="metallic-card p-8 md:p-10 rounded-xl max-w-4xl mx-auto mb-16">
            <h3 className="text-2xl font-bold mb-6 gold-text">Managed Share Trading</h3>
            <p className="text-lg mb-6">
              SwarmVentures offers professional portfolio management for AI swarm shares, providing investors with 
              diversified exposure to the rapidly growing AI swarm ecosystem through a single managed vehicle.
            </p>
            <p className="text-lg mb-6">
              Our team of experienced traders and AI specialists actively manage positions across multiple swarms, 
              optimizing for risk-adjusted returns through strategic allocation, active trading, and deep market expertise.
            </p>
            <div className="bg-gray-900 p-6 rounded-lg mb-6">
              <h4 className="text-xl font-semibold mb-4 silver-text">Investment Highlights</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-[#d4af37] mr-2">◆</span>
                  <span>Professional portfolio management with active position optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#d4af37] mr-2">◆</span>
                  <span>Diversified exposure across multiple revenue-generating swarms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#d4af37] mr-2">◆</span>
                  <span>Strategic floor defending and liquidity provision</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#d4af37] mr-2">◆</span>
                  <span>Momentum trading and strategic entry/exit optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#d4af37] mr-2">◆</span>
                  <span>Sophisticated risk management with 15% maximum drawdown target</span>
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold mb-4 gold-text">Investment Terms</h4>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="silver-text">Minimum investment:</span>
                    <span className="font-medium">
                      100,000 $UBC or<br />1,000,000 $COMPUTE
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="silver-text">Investment period:</span>
                    <span className="font-medium">90 days</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="silver-text">Expected return target:</span>
                    <span className="font-medium">40% (annualized)</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="silver-text">Risk management:</span>
                    <span className="font-medium">Drawdown limited to 15%</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-4 gold-text">Fee Structure</h4>
                <ul className="space-y-3">
                  <li className="flex justify-between">
                    <span className="silver-text">Management fee:</span>
                    <span className="font-medium">2% (annually)</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="silver-text">Performance fee:</span>
                    <span className="font-medium">20% (on profits above hurdle)</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="silver-text">Hurdle rate:</span>
                    <span className="font-medium">8%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="silver-text">High water mark:</span>
                    <span className="font-medium">Implemented</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        {/* Investment Form */}
        <section className="py-10 relative z-10">
          <div className="metallic-card p-8 md:p-10 rounded-xl max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 gold-text text-center">Invest Now</h3>
            
            {success ? (
              <div className="bg-green-900/50 border border-green-700 rounded-lg p-6 text-center">
                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h4 className="text-xl font-semibold mb-2 text-green-400">Investment Submitted Successfully!</h4>
                <p className="mb-6 text-gray-300">
                  Thank you for investing in SwarmVentures. Our team will review your investment and contact you shortly with next steps.
                </p>
                <button 
                  onClick={() => {
                    setSuccess(false);
                    setAmount(minAmount[selectedToken].toString());
                  }}
                  className="gold-button px-6 py-3 rounded-full font-medium"
                >
                  Make Another Investment
                </button>
              </div>
            ) : (
              <form onSubmit={handleInvest} className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-lg font-medium silver-text">Select Token</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className={`p-4 rounded-lg border ${
                        selectedToken === "UBC" 
                          ? "border-[#d4af37] bg-[#d4af37]/10" 
                          : "border-gray-700 bg-gray-900 hover:border-gray-500"
                      } transition-colors flex items-center justify-center`}
                      onClick={() => {
                        setSelectedToken("UBC");
                        setAmount("100000");
                      }}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mx-auto flex items-center justify-center mb-2">
                          <span className="font-bold text-white">UBC</span>
                        </div>
                        <span className="block font-medium">$UBC</span>
                        <span className="text-sm text-gray-400">Min: 100,000</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      className={`p-4 rounded-lg border ${
                        selectedToken === "COMPUTE" 
                          ? "border-[#d4af37] bg-[#d4af37]/10" 
                          : "border-gray-700 bg-gray-900 hover:border-gray-500"
                      } transition-colors flex items-center justify-center`}
                      onClick={() => {
                        setSelectedToken("COMPUTE");
                        setAmount("1000000");
                      }}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 mx-auto flex items-center justify-center mb-2">
                          <span className="font-bold text-white">CPU</span>
                        </div>
                        <span className="block font-medium">$COMPUTE</span>
                        <span className="text-sm text-gray-400">Min: 1,000,000</span>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="amount" className="block text-lg font-medium silver-text">
                    Investment Amount
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Minimum ${minAmount[selectedToken].toLocaleString()}`}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400">${selectedToken}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    Minimum investment: {minAmount[selectedToken].toLocaleString()} ${selectedToken}
                  </p>
                </div>
                
                {error && (
                  <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                {!walletConnected ? (
                  <button
                    type="button"
                    onClick={connectWallet}
                    disabled={isLoading}
                    className="w-full gold-button px-6 py-4 rounded-full font-bold text-lg flex items-center justify-center"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </span>
                    ) : (
                      <>
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        Connect Phantom Wallet
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 flex items-center">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-sm text-gray-400">Connected Wallet</p>
                        <p className="font-medium truncate">{walletAddress}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWalletConnected(false)}
                        className="text-gray-400 hover:text-white ml-2"
                      >
                        Disconnect
                      </button>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading || !amount}
                      className="w-full gold-button px-6 py-4 rounded-full font-bold text-lg flex items-center justify-center"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <>Invest {amount ? `${parseFloat(amount).toLocaleString()} $${selectedToken}` : ''}</>
                      )}
                    </button>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <h3 className="text-sm font-medium text-[#d4af37] mb-2">Investment Conditions</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="text-[#d4af37] mr-2">•</span>
                      <span>75% of profits redistributed weekly</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#d4af37] mr-2">•</span>
                      <span>Profits redistributed in invested currency</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#d4af37] mr-2">•</span>
                      <span>Funds withdrawable on request with 24h notice</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#d4af37] mr-2">•</span>
                      <span>0.9% fee on withdrawals</span>
                    </li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-400 text-center">
                  By investing, you agree to our <Link href="#terms" className="text-[#d4af37] hover:underline">Terms & Conditions</Link> and acknowledge the <Link href="#disclaimer" className="text-[#d4af37] hover:underline">Risk Disclaimer</Link>.
                </p>
              </form>
            )}
          </div>
        </section>
        
        {/* Risk Disclaimer */}
        <section className="py-10 relative z-10">
          <div className="bg-black/20 p-6 rounded-lg border border-gray-800 max-w-3xl mx-auto">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Important Risk Disclosure</h3>
            <div className="text-xs text-gray-500 space-y-2">
              <p>
                Investing in cryptocurrency assets involves significant risk and may result in partial or total loss of your investment. Past performance is not indicative of future results.
              </p>
              <p>
                No returns or profits are guaranteed. The value of your investment can fluctuate significantly due to market volatility, liquidity risks, regulatory changes, and other factors beyond our control.
              </p>
              <p>
                The redistribution mechanism described is subject to change and depends on the performance of the underlying portfolio. Withdrawals may be subject to network conditions and liquidity constraints.
              </p>
              <p>
                This is not financial advice. Please conduct your own research and consider consulting with a financial professional before investing. Only invest what you can afford to lose.
              </p>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20 relative z-10">
          <h3 className="text-2xl md:text-3xl font-bold mb-12 text-center">
            <span className="gold-gradient">Frequently Asked Questions</span>
          </h3>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="metallic-card p-6 rounded-xl">
              <h4 className="text-xl font-bold mb-3 gold-text">How does SwarmVentures generate returns?</h4>
              <p className="text-gray-300">
                SwarmVentures employs multiple strategies including dividend yield optimization, floor defending, 
                strategic flipping, and value investing across a diversified portfolio of AI swarms. Our team 
                actively manages positions to optimize risk-adjusted returns through market cycles.
              </p>
            </div>
            
            <div className="metallic-card p-6 rounded-xl">
              <h4 className="text-xl font-bold mb-3 gold-text">What happens after I invest?</h4>
              <p className="text-gray-300">
                After your investment is processed, you'll receive a confirmation email with details of your 
                investment. Your funds will be allocated to the SwarmVentures portfolio according to our 
                investment strategy. You'll receive regular updates on portfolio performance and can track 
                your investment through our investor dashboard.
              </p>
            </div>
            
            <div className="metallic-card p-6 rounded-xl">
              <h4 className="text-xl font-bold mb-3 gold-text">Can I withdraw before the 90-day period?</h4>
              <p className="text-gray-300">
                Early withdrawals are possible but subject to a 5% early withdrawal fee. This fee helps 
                maintain portfolio stability and ensures fair treatment of all investors. We recommend 
                committing to the full 90-day investment period for optimal results.
              </p>
            </div>
            
            <div className="metallic-card p-6 rounded-xl">
              <h4 className="text-xl font-bold mb-3 gold-text">How is the 15% maximum drawdown enforced?</h4>
              <p className="text-gray-300">
                Our risk management system continuously monitors portfolio performance. If drawdown approaches 
                the 15% threshold, we implement protective measures including reducing exposure, increasing cash 
                reserves, and adjusting position sizes. This disciplined approach helps protect capital during 
                market downturns.
              </p>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
