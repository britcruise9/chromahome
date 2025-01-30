"use client";

import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

// Color conversion utilities
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
};

const getComplementaryColor = (hex: string) => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  // Rotate hue by 180 degrees for complementary color
  hsl.h = (hsl.h + 180) % 360;
  const complementaryRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);
};

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  dominantColor?: string;
}

const ModernUploader = () => {
  const [view, setView] = useState('initial');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const extractColor = async (file: File): Promise<string> => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const centerX = Math.floor(img.width / 2);
          const centerY = Math.floor(img.height / 2);
          const pixel = ctx.getImageData(centerX, centerY, 1, 1).data;
          
          const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
          resolve(hex);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('Error getting color:', error);
      return '#000000';
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
    const color = await extractColor(file);
    const compColor = getComplementaryColor(color);
    setSelectedColor(color);
    setComplementaryColor(compColor);
    setActiveColor(color);
    await fetchProducts(color);
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
              <span className="text-sm text-white/60">Selected</span>
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
