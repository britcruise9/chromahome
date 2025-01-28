import ColorMatcher from '@/components/color-matcher';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">ChromaHome</h1>
          <p className="text-gray-600">Turn Paint Colors Into Perfect Decor</p>
        </div>
      </header>
      <ColorMatcher />
    </main>
  );
}
