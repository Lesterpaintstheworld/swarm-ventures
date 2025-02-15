import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to premium page for now
    // You can remove this if you want to show the homepage content instead
    router.push('/premium');
  }, []);

  return (
    <>
      <Head>
        <title>SwarmVentures - Market Intelligence</title>
        <meta name="description" content="Professional-grade market intelligence for Swarm traders" />
      </Head>

      <Layout>
        <div className="premium-container">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-silver to-light-silver bg-clip-text text-transparent">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}
