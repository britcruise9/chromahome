"use client";

import React, { useState } from 'react';
import { Camera, Droplet, Upload, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  dominantColor?: string;
  colorDistance?: number;
}

const ModernUploader = () => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<'initial' | 'results'>('initial');
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const extractColor = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        if (!ctx) return resolve('#000000');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const centerX = Math.floor(img.width / 2);
        const centerY = Math.floor(img.height / 2);
        const pixel = ctx.getImageData(centerX, centerY, 1, 1).data;
        
        const hex = '#' + [pixel[0], pixel[1], pixel[2]]
          .map(x => x.toString(16).padStart(2, '0'))
          .join('');
        resolve(hex);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const getComplementaryColor = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Convert to complementary
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    return `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
  };

  const fetchProducts = async (color?: string) => {
    try {
      const response = await fetch(`/api/products${color ? `?color=${encodeURIComponent(color)}` : ''}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const color = await extractColor(file);
      const complementary = getComplementaryColor(color);
      setSelectedColor(color);
      setComplementaryColor(complementary);
      setActiveColor(color);
      await fetchProducts(color);
      setView('results');
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleColorClick = (color: string) => {
    setActiveColor(color);
    fetchProducts(color);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
      {/* Header - stays consistent */}
      <div className={`transition-all duration-500 ${view !== 'initial' ? 'pt-8 pb-4' : 'pt-32 pb-16'}`}>
        <h1 className="text-center text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text bg-[size:400%] animate-gradient">
          CHROMA
        </h1>
        {view === 'initial' && (
          <p className="text-center text-xl text-black mt-4">What's your color?</p>
        )}
      </div>

      {view === 'initial' ? (
        <div className="max-w-lg mx-auto px-4">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50/80 hover:bg-gray-100/90 transition-colors border-gray-300 hover:border-gray-400 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-600">
                <span className="font-medium">Search your color by image</span>
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFile}
            />
          </label>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center gap-6 mb-8">
            {/* Selected Color */}
            {selectedColor && (
              <div className="text-center">
                <button
                  onClick={() => handleColorClick(selectedColor)}
                  className={`w-20 h-20 rounded-lg shadow-lg transition-transform hover:scale-105 ${activeColor === selectedColor ? 'ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: selectedColor }}
                />
                <p className="mt-2 text-sm text-gray-300">Selected</p>
              </div>
            )}
            
            {/* Complementary Color */}
            {complementaryColor && (
              <div className="text-center">
                <button
                  onClick={() => handleColorClick(complementaryColor)}
                  className={`w-20 h-20 rounded-lg shadow-lg transition-transform hover:scale-105 ${activeColor === complementaryColor ? 'ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: complementaryColor }}
                />
                <p className="mt-2 text-sm text-gray-300">Complement</p>
              </div>
            )}
            
            {/* New Search Button */}
            <div className="text-center">
              <button
                onClick={() => setView('initial')}
                className="w-20 h-20 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all flex items-center justify-center shadow-lg hover:scale-105"
              >
                <div className="text-center">
                  <span className="text-2xl text-gray-300">+</span>
                  <span className="block text-xs text-gray-400 mt-1">New</span>
                </div>
              </button>
              <p className="mt-2 text-sm text-gray-300">Color</p>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-white/20 transition-all"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                    {product.description}
                  </p>
                  {product.dominantColor && (
                    <div className="flex items-center gap-2 mt-3">
                      <div
                        className="w-6 h-6 rounded-md shadow-sm"
                        style={{ backgroundColor: product.dominantColor }}
                      />
                      <div
                        className="w-6 h-6 rounded-md shadow-sm"
                        style={{ backgroundColor: activeColor || '#000000' }}
                      />
                      <span className="text-xs text-gray-300">
                        Match: {Math.round((1 - (product.colorDistance || 0) / 450) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernUploader;
