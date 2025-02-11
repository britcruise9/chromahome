'use client';

import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

declare const ColorThief: any;

// ---------- Color Utilities ----------
const hexToHSL = (hex: string) => {
  // ...
};
const hslToHex = (h: number, s: number, l: number) => {
  // ...
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

// ---------- Main Component ----------
const ModernUploader = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);
  const [triadicColors, setTriadicColors] = useState<[string, string] | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1) On first load, just fetch all products (random or full list).
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchInitialProducts();
  }, []);

  // 2) Upload handler: extract main color, compute extra swatches, fetch filtered products
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const color = await extractColor(file);
      // Set main color and swatches
      setSelectedColor(color);
      setComplementaryColor(getComplementaryColor(color));
      const [t1, t2] = getTriadicColors(color);
      setTriadicColors([t1, t2]);
      // Make the uploaded color active (for highlighting + fetch)
      setActiveColor(color);

      // Fetch newly filtered products
      const res = await fetch(`/api/products?color=${encodeURIComponent(color)}`);
      setProducts(await res.json());
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3) Clicking a swatch re-fetches products for that color
  const handleSwatchClick = async (swatchColor: string) => {
    setActiveColor(swatchColor);
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/products?color=${encodeURIComponent(swatchColor)}`);
      setProducts(await res.json());
    } catch (error) {
      console.error('Error fetching swatch products:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-20">

        {/* Title & Subtitle */}
        <h1 className="text-center font-bold mb-2 text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500">
          SHOP BY COLOR
        </h1>
        <h2 className="text-center text-2xl md:text-3xl text-white/90 font-light mb-12">
          Find Home Decor in Your Color
        </h2>

        {/* Upload Box */}
        <div className="max-w-2xl mx-auto mb-16">
          <label className="block w-full">
            <div className="relative group cursor-pointer">
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center transition-all group-hover:border-white/30">
                <Upload className="w-12 h-12 mb-4 mx-auto text-white/50" />
                <h3 className="text-xl text-white/90 mb-2">Upload any color inspiration</h3>
                <p className="text-white/60">
                  Photo, screenshot, or image of paint, fabric, or wall
                </p>
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

          {/* Swatches Row (only if we have a selected color) */}
          {selectedColor && (
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-md px-4 flex justify-between md:gap-4">
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

                {/* Triadic Colors */}
                {triadicColors?.map((col, index) => (
                  <div key={col} className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 md:w-24 md:h-24 rounded-xl shadow-lg cursor-pointer
                        ${activeColor === col ? 'ring-4 ring-white' : ''}`}
                      style={{ backgroundColor: col }}
                      onClick={() => handleSwatchClick(col)}
                    />
                    <span className="text-xs md:text-sm text-white/60 mt-2">
                      Triadic {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="mt-12">
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
                    <p className="text-white/90 text-sm line-clamp-2 mb-2">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: product.dominantColor }}
                      />
                      {activeColor ? (
                        <>
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: activeColor }}
                          />
                          <span className="text-xs text-white/50">
                            {product.matchPercentage}% match
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded-full bg-white/10" />
                          <span className="text-xs text-white/50">
                            Ready to match your color
                          </span>
                        </>
                      )}
                    </div>
                    {product.affiliateLink && (
                      <div className="mt-2">
                        <span className="text-sm text-blue-400 hover:text-blue-300">
                          Shop on Amazon
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModernUploader;

