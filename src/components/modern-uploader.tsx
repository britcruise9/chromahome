'use client';

import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

declare const ColorThief: any;

// --- Color Utilities ---
const hexToHSL = (hex: string) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

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

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
};

const hslToHex = (h: number, s: number, l: number) => {
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
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const getComplementaryColor = (hex: string) => {
  const hsl = hexToHSL(hex);
  return hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
};

const getTriadicColors = (hex: string) => {
  const hsl = hexToHSL(hex);
  return [
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  ];
};

// IMPORTANT: Must "return new Promise" so it matches Promise<string>
const extractColor = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    const colorThief = new ColorThief();

    img.onload = () => {
      try {
        const [r, g, b] = colorThief.getColor(img);
        resolve(
          `#${r.toString(16).padStart(2, '0')}${g
            .toString(16)
            .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
        );
      } catch {
        resolve('#000000');
      }
    };

    img.onerror = () => resolve('#000000');
    img.crossOrigin = 'Anonymous';
    img.src = URL.createObjectURL(file);
  });
};

// --- Main component ---
export default function ModernUploader() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);
  const [triadicColors, setTriadicColors] = useState<[string, string] | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        const response = await fetch('/api/products');
        setProducts(await response.json());
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchInitialProducts();
  }, []);

  // After user uploads a file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const color = await extractColor(file);
      setSelectedColor(color);
      setActiveColor(color);

      const comp = getComplementaryColor(color);
      setComplementaryColor(comp);

      const [t1, t2] = getTriadicColors(color);
      setTriadicColors([t1, t2]);

      // Then fetch color-based products
      const res = await fetch(`/api/products?color=${encodeURIComponent(color)}`);
      setProducts(await res.json());
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  // If user clicks a swatch
  const handleSwatchClick = async (color: string) => {
    setActiveColor(color);
    try {
      const res = await fetch(`/api/products?color=${encodeURIComponent(color)}`);
      setProducts(await res.json());
    } catch (error) {
      console.error('Error fetching swatch color products:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-20">
        {/* Title */}
        <h1 className="text-center font-bold mb-2 text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500">
          SHOP BY COLOR
        </h1>
        <h2 className="text-center text-2xl md:text-3xl text-white/90 font-light mb-12">
          Find Home Decor in Your Color
        </h2>

        {/* Upload area */}
        <div className="max-w-2xl mx-auto mb-16">
          <label className="block w-full">
            <div className="relative group cursor-pointer">
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center transition-all group-hover:border-white/30">
                <Upload className="w-12 h-12 mb-4 mx-auto text-white/50" />
                <h3 className="text-xl text-white/90 mb-2">Upload any color inspiration</h3>
                <p className="text-white/60">Photo, screenshot, or image of paint, fabric, or wall</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
          </label>

          <div className="text-center mt-6 mb-12">
            <p className="text-white/70 text-lg">
              After adding your color, we'll show you the best matches from our collection
            </p>
          </div>

          {/* Swatch row (only if selectedColor is present) */}
          {selectedColor && (
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-md px-4 flex justify-between gap-4">
                {/* Primary */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-14 h-14 md:w-24 md:h-24 rounded-xl shadow-lg cursor-pointer 
                      ${activeColor === selectedColor ? 'ring-4 ring-white' : ''}`}
                    style={{ backgroundColor: selectedColor }}
                    onClick={() => handleSwatchClick(selectedColor)}
                  />
                  <span className="text-xs md:text-sm text-white/60 mt-2">Primary</span>
                </div>

                {/* Complementary */}
                {complementaryColor && (
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 md:w-24 md:h-24 rounded-xl shadow-lg cursor-pointer 
                        ${activeColor === complementaryColor ? 'ring-4 ring-white' : ''}`}
                      style={{ backgroundColor: complementaryColor }}
                      onClick={() => handleSwatchClick(complementaryColor)}
                    />
                    <span className="text-xs md:text-sm text-white/60 mt-2">Compliment</span>
                  </div>
                )}

                {/* Triadic */}
                {triadicColors?.map((col, i) => (
                  <div key={col} className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 md:w-24 md:h-24 rounded-xl shadow-lg cursor-pointer 
                        ${activeColor === col ? 'ring-4 ring-white' : ''}`}
                      style={{ backgroundColor: col }}
                      onClick={() => handleSwatchClick(col)}
                    />
                    <span className="text-xs md:text-sm text-white/60 mt-2">Triadic {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <a
              key={product.id}
              href={product.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="group relative bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <p className="text-white/90 text-sm line-clamp-2 mb-2">{product.description}</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: product.dominantColor }}
                    />
                    {activeColor ? (
                      <>
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activeColor }} />
                        <span className="text-xs text-white/50">
                          {product.matchPercentage}% match
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-full bg-white/10" />
                        <span className="text-xs text-white/50">Ready to match your color</span>
                      </>
                    )}
                  </div>
                  {product.affiliateLink && (
                    <div className="mt-2">
                      <span className="text-sm text-blue-400 hover:text-blue-300">Shop on Amazon</span>
                    </div>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}


