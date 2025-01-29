import React from 'react';
import ColorMatcher from '@/components/color-matcher';

const UpdatedHeader = () => {
  return (
    <header className="flex h-36 mb-8">
      <div className="w-1/7 bg-[#D1CBAA]"></div>
      <div className="w-1/7 bg-[#F0EFE7]"></div>
      <div className="w-1/7 bg-[#B0A589]"></div>
      <div className="w-1/7 bg-[#CBBEA5]"></div>
      <div className="w-1/7 bg-[#E3DECD]"></div>
      <div className="w-1/7 bg-[#D1CBAA]"></div>
      <div className="flex-1 flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold font-['Playfair Display', 'serif']">CHROMA HOME</h1>
        <p className="text-lg">Shop your color</p>
      </div>
    </header>
  );
};

export default UpdatedHeader;
