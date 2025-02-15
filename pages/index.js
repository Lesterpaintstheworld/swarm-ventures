import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>SwarmVentures - Market Intelligence</title>
        <meta name="description" content="Professional-grade market intelligence for Swarm traders" />
      </Head>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            SwarmVentures Elite
          </h1>
          <p className="text-xl md:text-2xl text-silver/70 mb-8 max-w-3xl mx-auto">
            Professional-grade market intelligence for serious Swarm traders.
            Get real-time alerts and deep market insights.
          </p>
          
          {/* CTA Button - Moved up */}
          <Link href="/premium" className="metallic-button inline-block mb-16 hover:scale-105 transition-transform">
            Access Premium Intelligence
          </Link>
          
          {/* Stats Grid - Moved down */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <p className="text-silver/70">Real-time Monitoring</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">100+</div>
              <p className="text-silver/70">Active Traders</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">±0.1%</div>
              <p className="text-silver/70">Price Accuracy</p>
            </div>
          </div>
            Access Premium Intelligence
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <h2 className="text-4xl font-bold mb-16 text-center gradient-text">
          Elite Trading Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="premium-feature">
            <div className="premium-icon">⚡</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Instant Alerts</h3>
              <p className="text-silver/70">
                Real-time notifications for price movements, new cycles, and revenue distributions.
              </p>
            </div>
          </div>

          <div className="premium-feature">
            <div className="premium-icon">📊</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
              <p className="text-silver/70">
                Professional-grade market analysis and performance metrics.
              </p>
            </div>
          </div>

          <div className="premium-feature">
            <div className="premium-icon">🎯</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Smart Tracking</h3>
              <p className="text-silver/70">
                Unlimited swarm tracking with customizable parameters.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tiers Section */}
      <div className="bg-gradient-to-br from-dark-gray to-black py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center gradient-text">
            Market Tiers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <div className="premium-badge">Tier 1</div>
              <h3 className="text-xl font-bold mb-4">Mature Infrastructure</h3>
              <ul className="space-y-2 text-silver/70">
                <li>• 400x+ multiplier</li>
                <li>• Highest stability</li>
                <li>• 2-3% typical spread</li>
                <li>• Lowest risk profile</li>
              </ul>
            </div>

            <div className="card">
              <div className="premium-badge">Tier 2</div>
              <h3 className="text-xl font-bold mb-4">Growth Phase</h3>
              <ul className="space-y-2 text-silver/70">
                <li>• 120-200x multiplier</li>
                <li>• Medium volatility</li>
                <li>• 5-7% typical spread</li>
                <li>• Balanced risk/reward</li>
              </ul>
            </div>

            <div className="card">
              <div className="premium-badge">Tier 3</div>
              <h3 className="text-xl font-bold mb-4">Early Stage</h3>
              <ul className="space-y-2 text-silver/70">
                <li>• &lt;100x multiplier</li>
                <li>• Higher volatility</li>
                <li>• 8-10% typical spread</li>
                <li>• Higher risk/reward</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8 gradient-text">
            Join the Elite Network
          </h2>
          <p className="text-xl text-silver/70 mb-12">
            Get access to professional-grade market intelligence and join the network of informed traders.
          </p>
          <Link href="/premium" className="metallic-button inline-block">
            Activate Premium Access
          </Link>
          <p className="mt-6 text-silver/50">One-time payment • Lifetime access • No hidden fees</p>
        </div>
      </div>
    </Layout>
  );
}
