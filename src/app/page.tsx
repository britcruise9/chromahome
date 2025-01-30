import React from 'react';
import ColorMatcher from '@/components/color-matcher';

const Home = () => {
  return (
    <div>
      <header className="bg-[#5B92D1] py-8 mb-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white font-['Playfair Display', 'serif']">
            CHROMA
          </h1>
          <p className="text-lg text-[#D5E0EF]">Shop your color</p>
        </div>
      </header>
      <main>
        <ColorMatcher />
      </main>
    </div>
  );
};

export default Home;
