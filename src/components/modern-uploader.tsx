'use client';

import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

declare const ColorThief: any;

// ---------- Color Utilities ----------
function hexToHSL(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

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
}

function hslToHex(h: number, s: number, l: number) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // Achromatic
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
}

function getComplementaryColor(hex: string) {
  const hsl = hexToHSL(hex);
  return hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
}

function getTriadicColors(hex: string) {
  const hsl = hexToHSL(hex);
  return [
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  ];
}

async function extractColor(file: File): Promise<string> {
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
}

// ---------- Main Component ----------
export default function ModernUploader() {
  const [products, setProducts] = useState<any[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);
  const [triadicColors, setTriadicColors] = useState<[string, string] | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);

  // 1) On page load, fetch a default list of products (no caching).
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!res.ok) {
          console.error('Initial fetch error, status:', res.status);
        }
        const data = await res.json();
        console.log('Initial products:', data);
        setProducts(data);
      } catch (err) {
        console.error('Initial fetch error:', err);
      }
    };
    fetchInitialProducts();
  }, []);

  // 2) Handle file upload → extract color → set swatches → fetch matching products
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);

      const color = await extractColor(file);
      setSelectedColor(color);
      setActiveColor(color);
      setHasUploaded(true);

      const comp = getComplementaryColor(color);
      setComplementaryColor(comp);
      const [t1, t2] = getTriadicColors(color);
      setTriadicColors([t1, t2]);

      // Clear old products for clarity
      setProducts([]);

      // Fetch color-based products with no caching
      const encoded = encodeURIComponent(color);
      const res = await fetch(`/api/products?color=${encoded}`, { cache: 'no-store' });
      if (!res.ok) {
        console.error('Color fetch error, status:', res.status);
      }
      const data = await res.json();
      console.log('File upload fetch results:', data);
      setProducts(data);
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  // 3) Clicking any swatch re-fetches products
  const handleSwatchClick = async (color: string) => {
    setActiveColor(color);
    // Clear old items so you see fresh results
    setProducts([]);

    try {
      const encoded = encodeURIComponent(color);
      const res = await fetch(`/api/products?color=${encoded}`, { cache: 'no-store' });
      if (!res.ok) {
        console.error('Swatch fetch error, status:', res.status);
      }
      const data = await res.json();
      console.log('Swatch click data:', data);
      setProducts(data);
    } catch (err) {
      console.error('Swatch fetch error:', err);
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

        {/* Upload Box */}
        <div className="max-w-2xl mx-auto mb-16">
          <label className="block w-full">
            <div className="group cursor-pointer border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/30 transition">
              <Upload className="w-12 h-12 mb-4 mx-auto text-white/50" />
              <h3 className="text-xl text-white/90 mb-2">
                {hasUploaded ? 'Upload new color' : 'Upload any color inspiration'}
              </h3>
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
          </label>
          <div className="text-center mt-6 mb-12">
            <p className="text-white/70 text-lg">
              After adding your color, we'll show you the best matches from our collection
            </p>
          </div>

          {/* Swatch row (only if user has selected a color) */}
          {selectedColor && (
            <div className="flex justify-center mb-8">
              <div className="flex items-end gap-4">
                {/* Primary: half image, half color */}
                <div className="flex flex-col items-center">
                  <div
                    onClick={() => handleSwatchClick(selectedColor)}
                    className={`relative w-14 h-14 md:w-24 md:h-24 rounded-xl shadow-lg cursor-pointer overflow-hidden
                      ${activeColor === selectedColor ? 'ring-4 ring-white' : ''}`}
                  >
                    {/* Left half: uploaded image preview */}
                    {uploadedImageUrl && (
                      <img
                        src={uploadedImageUrl}
                        alt="upload preview"
                        className="absolute top-0 left-0 w-1/2 h-full object-cover"
                      />
                    )}
                    {/* Right half: extracted color */}
                    <div
                      className="absolute top-0 right-0 w-1/2 h-full"
                      style={{ backgroundColor: selectedColor }}
                    />
                  </div>
                  <span className="text-xs md:text-sm text-white/60 mt-2">Primary</span>
                  {/* “Change color” link under Primary */}
                  <label
                    htmlFor="changeColorInput"
                    className="text-xs md:text-sm text-blue-400 hover:underline cursor-pointer"
                  >
                    Change color
                  </label>
                  <input
                    id="changeColorInput"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Complementary */}
                {complementaryColor && (
                  <div className="flex flex-col items-center">
                    <div
                      onClick={() => handleSwatchClick(complementaryColor)}
                      className={`w-14 h-14 md:w-24 md:h-24 rounded-xl shadow-lg cursor-pointer
                        ${activeColor === complementaryColor ? 'ring-4 ring-white' : ''}`}
                      style={{ backgroundColor: complementaryColor }}
                    />
                    <span className="text-xs md:text-sm text-white/60 mt-2">Compliment</span>
                  </div>
                )}

                {/* Triadic Colors */}
                {triadicColors?.map((col, i) => (
                  <div key={col} className="flex flex-col items-center">
                    <div
                      onClick={() => handleSwatchClick(col)}
                      className={`w-14 h-14 md:w-24 md:h-24 rounded-xl shadow-lg cursor-pointer
                        ${activeColor === col ? 'ring-4 ring-white' : ''}`}
                      style={{ backgroundColor: col }}
                    />
                    <span className="text-xs md:text-sm text-white/60 mt-2">
                      Triadic {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid (no description, fallback for match%) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            // Show “—% match” if undefined
            const matchText = Number.isFinite(product.matchPercentage)
              ? `${product.matchPercentage}% match`
              : `—% match`;

            return (
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
                            {matchText}
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
            );
          })}
        </div>

      </div>
    </div>
  );
}
