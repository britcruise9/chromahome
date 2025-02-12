'use client';

import React, { useState, useEffect } from 'react';
import { Upload, ArrowRight, Pin } from 'lucide-react';

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

  return { h: h * 360, s: s * 100, l: l * 100 };
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

// ---------- Extract Color from Uploaded File ----------
async function extractColor(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const colorThief = new ColorThief();

    img.onload = () => {
      try {
        const [r, g, b] = colorThief.getColor(img);
        resolve(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
      } catch {
        resolve('#000000');
      }
    };

    img.onerror = () => resolve('#000000');
    img.crossOrigin = 'Anonymous';
    img.src = URL.createObjectURL(file);
  });
}

export default function ModernUploader() {
  const [products, setProducts] = useState<any[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);
  const [triadicColors, setTriadicColors] = useState<[string, string] | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);

  // ----- Pinned Items (store product IDs in localStorage) -----
  const [pinned, setPinned] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pinnedProducts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // ----- Fetch initial products -----
  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        setProducts(await res.json());
      } catch (err) {
        console.error('Initial fetch error:', err);
      }
    };
    fetchInitialProducts();
  }, []);

  // ----- Toggle Pin/Unpin -----
  function togglePin(productId: number) {
    setPinned((prev) => {
      let updated: number[];
      if (prev.includes(productId)) {
        // unpin
        updated = prev.filter((id) => id !== productId);
      } else {
        // pin
        updated = [...prev, productId];
      }
      localStorage.setItem('pinnedProducts', JSON.stringify(updated));
      return updated;
    });
  }

  // ----- Handle file upload + color extraction -----
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

      // complementary + triadic
      const comp = getComplementaryColor(color);
      setComplementaryColor(comp);

      const [acc1, acc2] = getTriadicColors(color);
      setTriadicColors([acc1, acc2]);

      // fetch matching products
      setProducts([]); // clear old
      const encoded = encodeURIComponent(color);
      const res = await fetch(`/api/products?color=${encoded}`, { cache: 'no-store' });
      setProducts(await res.json());
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  // ----- Clicking a swatch re-fetches products for that color -----
  const handleSwatchClick = async (color: string) => {
    setActiveColor(color);
    setProducts([]);
    try {
      const encoded = encodeURIComponent(color);
      const res = await fetch(`/api/products?color=${encoded}`, { cache: 'no-store' });
      setProducts(await res.json());
    } catch (err) {
      console.error('Swatch fetch error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">

      {/* --- Hero Banner --- */}
      <div
        className="relative h-[38vh] md:h-[45vh] bg-cover bg-center mb-12"
        style={{
          backgroundImage:
            "url('https://hips.hearstapps.com/hmg-prod/images/living-room-paint-colors-hbx040122inspoindex-012-copy-1655397674-653fda462b085.jpg?crop=0.752xw:1.00xh;0.120xw,0&resize=1120:*')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white [text-shadow:0_2px_5px_rgba(0,0,0,0.7)]">
            SHOP BY COLOR
          </h1>
          <p className="mt-2 text-xl md:text-2xl text-white/90 font-light [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
            Find Home Decor in Your Color
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* --- Upload Box (hidden after upload) --- */}
        {!hasUploaded && (
          <div className="max-w-2xl mx-auto mb-16">
            <label className="block w-full">
              <div className="group cursor-pointer border-2 border-dashed border-white/20 rounded-xl p-8 text-center 
                              hover:border-white/30 transition-transform duration-300 ease-out hover:scale-105">
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
            </label>
            <div className="text-center mt-6 mb-12">
              <p className="text-white/70 text-lg">
                After adding your color, we'll show you the best matches from products around the world
              </p>
            </div>
          </div>
        )}

        {/* --- Color Swatches --- */}
        {hasUploaded && selectedColor && (
          <div className="flex flex-wrap justify-center items-center gap-6 mb-10">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg">
                {uploadedImageUrl && (
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <label
                htmlFor="changeColorInput"
                className="text-xs md:text-sm text-blue-400 hover:underline cursor-pointer mt-2"
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

            <ArrowRight className="w-6 h-6 text-white" />

            {/* Primary Color */}
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 md:w-24 md:h-24 rounded-xl shadow-lg cursor-pointer 
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
                  className={`w-16 h-16 md:w-24 md:h-24 rounded-xl shadow-lg cursor-pointer 
                    ${activeColor === complementaryColor ? 'ring-4 ring-white' : ''}`}
                  style={{ backgroundColor: complementaryColor }}
                  onClick={() => handleSwatchClick(complementaryColor)}
                />
                <span className="text-xs md:text-sm text-white/60 mt-2">Compliment</span>
              </div>
            )}

            {/* Triadic (Accent) Colors */}
            {triadicColors?.map((col, i) => (
              <div key={col} className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 md:w-24 md:h-24 rounded-xl shadow-lg cursor-pointer 
                    ${activeColor === col ? 'ring-4 ring-white' : ''}`}
                  style={{ backgroundColor: col }}
                  onClick={() => handleSwatchClick(col)}
                />
                <span className="text-xs md:text-sm text-white/60 mt-2">Accent {i + 1}</span>
              </div>
            ))}
          </div>
        )}

        {/* --- Pinned Items Row (IF pinned items exist) --- */}
        {pinned.length > 0 && (
          <div className="bg-black/50 text-white py-3 px-4 mb-8 rounded-md">
            <h3 className="font-bold mb-2">Your Pinned Items</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {pinned.map((id) => {
                const product = products.find((p) => p.id === id);
                if (!product) return null;

                return (
                  <div
                    key={id}
                    className="min-w-[120px] relative border border-white/20 rounded p-2 shrink-0"
                  >
                    <button
                      onClick={() => togglePin(id)}
                      className="absolute top-1 right-1 bg-black/40 px-1 rounded text-xs hover:bg-black/60"
                    >
                      Unpin
                    </button>
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-20 w-auto object-cover mx-auto"
                    />
                    <p className="text-xs mt-2 line-clamp-1 text-center">{product.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- Products Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const matchText = Number.isFinite(product.matchPercentage)
              ? `${product.matchPercentage}% match`
              : '—% match';

            const isPinned = pinned.includes(product.id);

            return (
              <a
                key={product.id}
                href={product.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="group relative bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 ease-out">
                  {/* Pin Icon at top-right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); // stops navigation
                      togglePin(product.id);
                    }}
                    className="absolute top-2 right-2 z-20 bg-black/40 text-white p-1 rounded hover:bg-black/60 transition"
                    title={isPinned ? 'Unpin item' : 'Pin item'}
                  >
                    <Pin
                      className={`w-5 h-5 ${
                        isPinned ? 'fill-white text-yellow-300' : ''
                      }`}
                    />
                  </button>

                  <div className="aspect-square overflow-hidden transition-transform duration-300 ease-out group-hover:scale-105">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
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
                          <span className="text-xs text-white/50">{matchText}</span>
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


