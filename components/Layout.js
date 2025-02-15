export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-dark-gray">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
