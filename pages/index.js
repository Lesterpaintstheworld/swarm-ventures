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
      <section className="hero-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-24">
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
                SwarmVentures Elite
              </h1>
              <p className="text-xl md:text-2xl text-silver/70 mb-8">
                Professional-grade market intelligence for serious Swarm traders.
                Get real-time alerts and deep market insights.
              </p>
              <Link href="/premium" className="metallic-button inline-block hover:scale-105 transition-transform">
                Access Premium Intelligence
              </Link>
            </div>
            <div className="stats-container">
              <div className="grid grid-cols-2 gap-4">
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
                <div className="stat-card">
                  <div className="stat-number">3 SOL</div>
                  <p className="text-silver/70">Lifetime Access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Fix grid layout */}
      <div className="container mx-auto px-4 py-24">
        <h2 className="text-4xl font-bold mb-16 text-center gradient-text">
          Elite Trading Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="premium-feature group">
            <div className="premium-icon group-hover:scale-110 transition-transform">⚡</div>
            <h3 className="text-xl font-bold mb-2">Instant Alerts</h3>
            <ul className="space-y-2 text-silver/70">
                <li>• Real-time price notifications</li>
                <li>• New cycle alerts</li>
                <li>• Revenue distributions</li>
                <li>• Custom thresholds</li>
              </ul>
            </div>
          </div>

          <div className="premium-feature group">
            <div className="premium-icon group-hover:scale-110 transition-transform">📊</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
              <ul className="space-y-2 text-silver/70">
                <li>• Market analysis</li>
                <li>• Performance metrics</li>
                <li>• Revenue tracking</li>
                <li>• Trend detection</li>
              </ul>
            </div>
          </div>

          <div className="premium-feature group">
            <div className="premium-icon group-hover:scale-110 transition-transform">🎯</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Smart Tracking</h3>
              <ul className="space-y-2 text-silver/70">
                <li>• Unlimited swarms</li>
                <li>• Custom parameters</li>
                <li>• Priority alerts</li>
                <li>• Portfolio overview</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Market Tiers Section */}
      <section className="bg-gradient-to-br from-dark-gray to-black py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center gradient-text">
            Market Tiers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card group hover:scale-105 transition-transform">
              <div className="premium-badge">Tier 1</div>
              <h3 className="text-xl font-bold mb-4">Mature Infrastructure</h3>
              <ul className="space-y-2 text-silver/70">
                <li>• 400x+ multiplier</li>
                <li>• Highest stability</li>
                <li>• 2-3% typical spread</li>
                <li>• Lowest risk profile</li>
              </ul>
            </div>

            <div className="card group hover:scale-105 transition-transform">
              <div className="premium-badge">Tier 2</div>
              <h3 className="text-xl font-bold mb-4">Growth Phase</h3>
              <ul className="space-y-2 text-silver/70">
                <li>• 120-200x multiplier</li>
                <li>• Medium volatility</li>
                <li>• 5-7% typical spread</li>
                <li>• Balanced risk/reward</li>
              </ul>
            </div>

            <div className="card group hover:scale-105 transition-transform">
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
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
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
      </section>
    </Layout>
  );
}
