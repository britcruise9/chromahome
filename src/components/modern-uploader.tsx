"use client";

import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from '../utils/colorConversion';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  dominantColor?: string;
  complementaryColor?: string;
}

const ModernUploader = () => {
  const [view, setView] = useState('initial');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const extractColor = async (file: File): Promise<{ dominantColor: string; complementaryColor: string }> => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const scaleFactor = 0.1; // Reduce image size to 10%
          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const centerX = Math.floor(canvas.width / 2);
          const centerY = Math.floor(canvas.height / 2);
          const pixel = ctx.getImageData(centerX, centerY, 1, 1).data;
          
          const dominantColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
          const complementaryColor = getComplementaryColor(dominantColor);
          resolve({ dominantColor, complementaryColor });
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('Error getting color:', error);
      return { dominantColor: '#000000', complementaryColor: '#FFFFFF' };
    }
  };

  const fetchProducts = async (color: string) => {
    try {
      const response = await fetch(`/api/products?color=${encodeURIComponent(color)}`);
      const data = await response.json();
      setProducts(data);
      setView('results');
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleColorClick = (color: string) => {
    setActiveColor(color);
    fetchProducts(color);
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    const { dominantColor, complementaryColor } = await extractColor(file);
    setSelectedColor(dominantColor);
    setComplementaryColor(complementaryColor);
    setActiveColor(dominantColor);
    await fetchProducts(dominantColor);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await handleFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const getComplementaryColor = (hex: string) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    // Rotate hue by 180 degrees for complementary color
    hsl.h = (hsl.h + 180) % 360;
    const complementaryRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
      <div className={`transition-all duration-500 ${view !== 'initial' ? 'pt-8 pb-4' : 'pt-32 pb-16'}`}>
        <h1 className="text-center text-6xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 animate-gradient bg-[length:200%_auto]">
            CHROMA
          </span>
        </h1>
      </div>

      {view === 'initial' && (
        <div className="max-w-2xl mx-auto px-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 
              ${isDragging ? 'border-white/50 bg-white/10' : 'border-white/20 hover:border-white/30'}
              h-72 flex items-center justify-center`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <Upload className="w-12 h-12 mb-4 mx-auto text-white/50" />
              <p className="text-lg text-white/80">Search your color by image</p>
            </div>
          </div>
        </div>
      )}

      {view === 'results' && products.length > 0 && (
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center gap-8 mb-12">
            <div className="flex flex-col items-center gap-2">
              <div 
                className={`w-24 h-24 rounded-xl shadow-lg cursor-pointer transition-all
                  ${selectedColor === activeColor ? 'ring-2 ring-white scale-105' : 'hover:ring-2 hover:ring-white/20'}`}
                style={{ backgroundColor: selectedColor || '#000000' }}
                onClick={() => selectedColor && handleColorClick(selectedColor)} 
              />
              <span className="text-sm text-white/60">Primary</span>
            </div>

            {complementaryColor && (
              <div className="flex flex-col items-center gap-2">
                <div 
                  className={`w-24 h-24 rounded-xl shadow-lg cursor-pointer transition-all
                    ${complementaryColor === activeColor ? 'ring-2 ring-white scale-105' : 'hover:ring-2 hover:ring-white/20'}`}
                  style={{ backgroundColor: complementaryColor }}
                  onClick={() => handleColorClick(complementaryColor)}
                />
                <span className="text-sm text-white/60">Complement</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setView('initial')}
                className="w-24 h-24 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-all
                  flex flex-col items-center justify-center"
              >
                <span className="text-2xl">+</span>
                <span className="text-sm">New</span>
              </button>
              <span className="text-sm text-white/60">Color</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div 
                key={product.id}
                className="group relative bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white/90 font-medium line-clamp-1">{product.title}</h3>
                  <p className="text-white/60 mt-1">${product.price.toFixed(2)}</p>
                  {product.dominantColor && (
                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: product.dominantColor }}
                      />
                      <span className="text-xs text-white/50">{product.dominantColor}</span>
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
