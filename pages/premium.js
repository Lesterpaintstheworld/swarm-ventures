'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import Head from 'next/head';
import Layout from '../components/Layout';

const Premium = () => {
  const router = useRouter();
  const { ref } = router.query;
  const wallet = useWallet();
  const [status, setStatus] = useState('initial');
  const [error, setError] = useState(null);
  const [treasuryWallet, setTreasuryWallet] = useState(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS) {
      setTreasuryWallet(new PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS));
    }
  }, []);

  const handlePayment = async () => {
    if (!wallet.connected || !ref || !treasuryWallet) return;
    
    try {
      setStatus('processing');
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL, 'confirmed');
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: treasuryWallet,
          lamports: 3 * LAMPORTS_PER_SOL,
        })
      );

      const signature = await wallet.sendTransaction(transaction, connection);
      const confirmation = await connection.confirmTransaction(signature);

      if (confirmation.value.err) throw new Error('Transaction failed');

      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: ref,
          transaction_signature: signature,
          amount: 3,
          wallet_address: wallet.publicKey.toString()
        })
      });

      if (!response.ok) throw new Error('Verification failed');
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <Layout>
      <Head>
        <title>SwarmVentures Premium Access</title>
        <meta name="description" content="Unlock unlimited swarm tracking and real-time alerts" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Features */}
            <div className="space-y-8">
              <h1 className="text-4xl font-bold gradient-text">
                Premium Access
              </h1>
              
              <div className="space-y-6">
                <div className="premium-feature">
                  <div className="premium-icon">⚡</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Instant Alerts</h3>
                    <p className="text-silver/70">Real-time notifications for price movements, new cycles, and revenue.</p>
                  </div>
                </div>

                <div className="premium-feature">
                  <div className="premium-icon">📊</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
                    <p className="text-silver/70">Professional-grade market analysis and performance metrics.</p>
                  </div>
                </div>

                <div className="premium-feature">
                  <div className="premium-icon">🎯</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Smart Tracking</h3>
                    <p className="text-silver/70">Unlimited swarm tracking with customizable parameters.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment */}
            <div className="bg-gradient-to-br from-dark-gray to-black p-8 rounded-2xl border border-silver/10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 gradient-text">3 SOL</h2>
                <p className="text-silver/70">One-time payment for lifetime access</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 text-silver/70">
                  <span className="text-2xl">✓</span>
                  <span>Unlimited Swarm Tracking</span>
                </div>
                <div className="flex items-center space-x-4 text-silver/70">
                  <span className="text-2xl">✓</span>
                  <span>Real-time Price Alerts</span>
                </div>
                <div className="flex items-center space-x-4 text-silver/70">
                  <span className="text-2xl">✓</span>
                  <span>Revenue Notifications</span>
                </div>
                <div className="flex items-center space-x-4 text-silver/70">
                  <span className="text-2xl">✓</span>
                  <span>Priority Support</span>
                </div>
              </div>

              <div className="mt-8">
                {!wallet.connected ? (
                  <WalletMultiButton className="w-full" />
                ) : (
                  <button
                    onClick={handlePayment}
                    disabled={status === 'processing'}
                    className="w-full metallic-button"
                  >
                    {status === 'processing' ? 'Processing...' : 'Complete Payment'}
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
                  {error}
                </div>
              )}

              {status === 'success' && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center">
                  Payment successful! Your account has been upgraded.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Premium;
