import React from 'react';
import ColorMatcher from '@/components/color-matcher';

const Home = () => {
  return (
    <div>
      <header className="bg-[#D1CBAA] py-8 mb-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[#4E4E4E] font-['Playfair Display', 'serif']">
            PaintChip Shop
          </h1>
          <p className="text-lg text-[#7C7C7C]">Turn Paint Colors Into Perfect Decor</p>
        </div>
      </header>
      <ColorMatcher />
    </div>
  );
};

export default Home;
