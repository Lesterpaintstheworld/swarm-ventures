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
    // Initialize treasury wallet after component mounts
    if (process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS) {
      setTreasuryWallet(new PublicKey(process.env.NEXT_PUBLIC_TREASURY_WALLET_ADDRESS));
    }
  }, []);

  const REQUIRED_SOL = 3;

  const handlePayment = async () => {
    if (!wallet.connected || !ref || !treasuryWallet) return;
    
    try {
      setStatus('processing');
      
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
        'confirmed'
      );

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: treasuryWallet,
          lamports: REQUIRED_SOL * LAMPORTS_PER_SOL,
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
          amount: REQUIRED_SOL,
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
      
      <div className="min-h-screen bg-gradient-to-b from-black via-black to-dark-gray text-silver">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-silver to-light-silver bg-clip-text text-transparent">
              Premium Access
            </h1>
            <p className="text-xl text-silver/70 max-w-2xl mx-auto">
              Unlock the full potential of SwarmVentures with premium features designed for serious traders
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Features Section */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-dark-gray to-black p-8 rounded-2xl border border-silver/10 backdrop-blur-lg">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-silver to-light-silver bg-clip-text text-transparent">
                  Premium Features
                </h2>
                <div className="space-y-6">
                  <Feature 
                    icon="⚡" 
                    title="Unlimited Tracking" 
                    description="Monitor any number of swarms with real-time updates and alerts"
                  />
                  <Feature 
                    icon="📊" 
                    title="Price Analytics" 
                    description="Advanced price tracking with custom threshold notifications"
                  />
                  <Feature 
                    icon="💰" 
                    title="Revenue Insights" 
                    description="Weekly revenue distribution alerts and performance metrics"
                  />
                  <Feature 
                    icon="🎯" 
                    title="Priority Support" 
                    description="Direct access to our support team for immediate assistance"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-dark-gray to-black p-8 rounded-2xl border border-silver/10">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-silver to-light-silver bg-clip-text text-transparent">
                  Why Premium?
                </h2>
                <ul className="space-y-4 text-silver/80">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    One-time payment for lifetime access
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    No monthly fees or hidden charges
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Instant account activation
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Full access to all future features
                  </li>
                </ul>
              </div>
            </div>

            {/* Payment Section */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="bg-gradient-to-br from-dark-gray to-black p-8 rounded-2xl border border-silver/10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-silver to-light-silver bg-clip-text text-transparent">
                      3 SOL
                    </span>
                  </h2>
                  <p className="text-silver/70">One-time payment for lifetime access</p>
                </div>

                <div className="space-y-6">
                  {!wallet.connected ? (
                    <div className="space-y-4">
                      <p className="text-center text-silver/70 mb-4">
                        Connect your wallet to continue:
                      </p>
                      <WalletMultiButton className="w-full !bg-gradient-to-r from-silver to-light-silver !text-black font-bold py-4 rounded-lg hover:opacity-90 transition-all" />
                    </div>
                  ) : (
                    <button
                      onClick={handlePayment}
                      disabled={status === 'processing'}
                      className={`
                        w-full bg-gradient-to-r from-silver to-light-silver 
                        text-black font-bold py-4 px-6 rounded-lg 
                        transition-all duration-200 
                        ${status === 'processing' ? 'opacity-50 cursor-wait' : 'hover:opacity-90 hover:shadow-lg'}
                      `}
                    >
                      {status === 'processing' ? 'Processing...' : 'Complete Payment'}
                    </button>
                  )}

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
                      {error}
                    </div>
                  )}

                  {status === 'success' && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center">
                      Payment successful! Your account has been upgraded.
                    </div>
                  )}

                  <div className="text-center text-silver/50 text-sm">
                    By completing the payment, you agree to our terms of service
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const Feature = ({ icon, title, description }) => (
  <div className="flex items-start space-x-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <h3 className="font-semibold text-silver mb-1">{title}</h3>
      <p className="text-silver/70 text-sm">{description}</p>
    </div>
  </div>
);

export default Premium;
