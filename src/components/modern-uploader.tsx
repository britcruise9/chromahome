'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, ArrowRight, ArrowDown, Pin, PinOff, Palette, Settings, ArrowLeft } from 'lucide-react';
import { HslColorPicker } from 'react-colorful';
import { amazonProducts } from '../lib/amazonProducts';

declare const ColorThief: any;

// Color utility functions
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  let r, g, b;

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

  const toHex = (val: number) => {
    const hx = Math.round(val * 255).toString(16);
    return hx.length === 1 ? '0' + hx : hx;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getComplementaryColor(hex: string): string {
  const hsl = hexToHSL(hex);
  return hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
}

function getTriadicColors(hex: string): [string, string] {
  const hsl = hexToHSL(hex);
  const color1 = hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l);
  const color2 = hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l);
  return [color1, color2];
}

async function extractColor(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const colorThief = new ColorThief();
    img.onload = () => {
      try {
        const [r, g, b] = colorThief.getColor(img);
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        resolve(hex);
      } catch {
        resolve('#000000');
      }
    };
    img.onerror = () => resolve('#000000');
    img.crossOrigin = 'Anonymous';
    img.src = URL.createObjectURL(file);
  });
}

// Helper: Calculate color match percentage
const hexRegex = /^%23/;
function calculateColorMatch(color1: string, color2: string): number {
  try {
    color1 = decodeURIComponent(color1).replace(hexRegex, '#');
    color2 = decodeURIComponent(color2).replace(hexRegex, '#');
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    const distance = Math.sqrt(
      3 * Math.pow(r2 - r1, 2) +
      4 * Math.pow(g2 - g1, 2) +
      2 * Math.pow(b2 - b1, 2)
    );
    const maxDistance = Math.sqrt(
      3 * Math.pow(255, 2) +
      4 * Math.pow(255, 2) +
      2 * Math.pow(255, 2)
    );
    return Math.round((1 - distance / maxDistance) * 100);
  } catch (error) {
    console.error('Color calculation error:', error);
    return 0;
  }
}

const heroImages = [
  "https://i.imgur.com/pHjncHD.png",
  "https://i.imgur.com/W1RnTGZ.png",
  "https://i.imgur.com/6uZrs0j.png",
  "https://i.imgur.com/oH0sLxE.jpeg",
  "https://i.imgur.com/UzYfvqA.png"
];

const boxStyle = "max-w-md mx-auto h-[320px] flex items-center justify-center bg-blue-600/10 border border-blue-300 rounded-xl p-8";

export default function ModernUploader() {
  // State declarations
  const [pinned, setPinned] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pinnedProducts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPinnedFloating, setIsPinnedFloating] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);
  const [triadicColors, setTriadicColors] = useState<[string, string] | null>(null);
  const [activeSearchColor, setActiveSearchColor] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [colorWheelHsl, setColorWheelHsl] = useState({ h: 0, s: 50, l: 50 });
  const [activeEditingColor, setActiveEditingColor] = useState<'primary' | 'complement' | 'accent1' | 'accent2' | null>(null);
  const [currentHero, setCurrentHero] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [colorOverlay, setColorOverlay] = useState(true);

  // Refs
  const pinnedContainerRef = useRef<HTMLDivElement>(null);
  const pinnedTriggerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Default gradient for color picker
  const defaultGradient = "radial-gradient(circle at center, #ffadad 0%, #ffd6a5 16%, #fdffb6 33%, #caffbf 50%, #9bf6ff 66%, #a0c4ff 83%, #bdb2ff 100%)";

  // Effects
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);

      if (pinnedTriggerRef.current && pinnedContainerRef.current) {
        const triggerPosition = pinnedTriggerRef.current.getBoundingClientRect().top;
        setIsPinnedFloating(triggerPosition < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setColorOverlay(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const shuffled = [...amazonProducts].sort(() => Math.random() - 0.5);
    setAllProducts(shuffled);
    loadProducts(1, activeSearchColor, shuffled);
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, [hasMore, isFetching]);

  useEffect(() => {
    if (page === 1) return;
    loadProducts(page, activeSearchColor);
  }, [page]);

  useEffect(() => {
    if (allProducts.length === 0) return;
    setProducts([]);
    setPage(1);
    setHasMore(true);
    loadProducts(1, activeSearchColor);
  }, [activeSearchColor, allProducts]);

  // Functions
  function loadProducts(pageNum: number, color: string | null, data?: any[]) {
    setIsFetching(true);
    const productsData = data || allProducts;
    let sortedProducts = [];

    if (color) {
      sortedProducts = productsData.map((product) => {
        const prodColor = (product.dominantColor || '#000000').trim();
        const matchPercentage = calculateColorMatch(color, prodColor);
        return { ...product, matchPercentage };
      });
      sortedProducts.sort((a, b) => b.matchPercentage - a.matchPercentage);
    } else {
      sortedProducts = productsData;
    }

    const pageSize = pageNum === 1 ? 50 : 12;
    const startIndex = (pageNum - 1) * pageSize;
    const newBatch = sortedProducts.slice(startIndex, startIndex + pageSize);

    if (pageNum === 1) {
      setProducts(newBatch);
    } else {
      setProducts((prev) => [...prev, ...newBatch]);
    }

    if (newBatch.length < pageSize) {
      setHasMore(false);
    }

    setIsFetching(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);
      const color = await extractColor(file);
      handleManualColor(color);
      setHasUploaded(true);
    } catch (error) {
      console.error('extract color error:', error);
    }
  }

  function handleManualColor(hex: string) {
    setSelectedColor(hex);
    setComplementaryColor(getComplementaryColor(hex));
    setTriadicColors(getTriadicColors(hex));
    setActiveSearchColor(hex);
    setHasUploaded(true);
  }

  function handleSwatchClick(color: string | null) {
    if (!color) return;
    setActiveSearchColor(color);
  }

  function togglePin(productId: number) {
    setPinned((prev) => {
      let updated;
      if (prev.includes(productId)) {
        updated = prev.filter((id) => id !== productId);
      } else {
        updated = [...prev, productId];
      }
      localStorage.setItem('pinnedProducts', JSON.stringify(updated));
      return updated;
    });
  }

  function getShortDescription(desc: string) {
    if (!desc) return '';
    const words = desc.trim().split(/\s+/);
    const snippet = words.slice(0, 4).join(' ');
    return snippet.length < desc.length ? snippet + '...' : snippet;
  }

  function getSwatchRingStyle(testColor: string | null) {
    return activeSearchColor === testColor ? 'ring-4 ring-white' : '';
  }

  function resetAll() {
    setHasUploaded(false);
    setUploadedImageUrl(null);
    setSelectedColor(null);
    setComplementaryColor(null);
    setTriadicColors(null);
    setActiveSearchColor(null);
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setColorWheelHsl({ h: 0, s: 50, l: 50 });
    loadProducts(1, null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* HERO SECTION */}
      <div className="relative h-[38vh] md:h-[45vh] mb-12 overflow-hidden">
        {/* Dark overlay for initial load */}
        <div
          className={`
            absolute inset-0 bg-slate-900
            ${colorOverlay ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-500 z-30
          `}
        />

        {/* Hero Images */}
        {heroImages.map((imgSrc, i) => (
          <div
            key={i}
            className={`
              absolute inset-0 transition-opacity duration-1000 ease-in-out
              ${currentHero === i ? 'opacity-100 z-20' : 'opacity-0 z-10'}
            `}
            style={{
              backgroundImage: `url('${imgSrc}')`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        {/* Hero Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-40 px-4">
          <h1
            className="
              text-4xl md:text-6xl font-extrabold 
              text-transparent bg-clip-text 
              bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500
              bg-[length:200%_200%]
              animate-gradient-x
              drop-shadow-lg
            "
          >
            SHOP BY COLOR
          </h1>
          <p className="mt-2 text-xl md:text-2xl text-white font-light">
            Decorate Like a Pro
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* UPLOAD/COLOR PICKER */}
        {!hasUploaded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {/* Upload Box */}
            <div className={boxStyle}>
              <label className="block w-full">
                <div
                  className="
                    group cursor-pointer border-2 border-dashed border-white/20 
                    rounded-xl p-8 text-center hover:border-white/30 
                    transition-transform duration-300 ease-out hover:scale-105
                  "
                >
                  <Upload className="w-12 h-12 mb-4 mx-auto text-white/50" />
                  <h3 className="text-xl text-white/90 mb-2">
                    Upload your color & discover matching furniture & decor
                  </h3>
                  <p className="text-white/60">
                    (Works with paint chips, fabrics, or any surface photo)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Color Picker Box */}
            <div className={boxStyle}>
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-white/80 mb-1">
                  <Palette className="w-6 h-6 text-white/50" />
                  <span className="font-semibold">Or pick a color below:</span>
                </div>
                <div
                  className="w-36 h-36 rounded-xl border border-white/30 shadow-md cursor-pointer"
                  style={{
                    background: selectedColor ? selectedColor : defaultGradient,
                  }}
                  onClick={() => setShowWheel(true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Reference div for pinned container floating behavior */}
        <div ref={pinnedTriggerRef} />

        {/* PINNED ITEMS ROW */}
        {pinned.length > 0 && (
          <div
            ref={pinnedContainerRef}
            className={`
              bg-transparent border-b border-white/20 text-white py-2 px-4 mb-8
              transition-all duration-300
              ${isPinnedFloating ? 
                'fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-900/90 border-none shadow-lg' 
                : ''}
            `}
          >
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-sm font-medium text-white/80">Vision Board</h3>
              <span className="text-xs text-white/50">{pinned.length} items</span>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
              {pinned.map((id) => {
                const product = allProducts.find((p) => p.id === id);
                if (!product) return null;
                return (
                  <a
                    key={id}
                    href={product.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-[100px] relative border border-white/20 rounded-lg overflow-hidden shrink-0 group hover:border-white/40 transition-colors"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        togglePin(id);
                      }}
                      className="absolute top-2 right-2 z-10 text-xs p-1.5 bg-black/50 rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <PinOff className="w-3 h-3" />
                    </button>
                    <div className="h-[100px] w-[100px] overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.description}
                        className="w-full h-full object-cover scale-150 transform-gpu group-hover:scale-125 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[10px] text-white/90 line-clamp-1">
                        {getShortDescription(product.description || '')}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Spacer when pinned container is floating */}
        {isPinnedFloating && pinned.length > 0 && (
          <div className="h-[120px]" />
        )}

        {/* COLOR WHEEL MODAL */}
        {showWheel && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            onClick={() => {
              setShowWheel(false);
              setActiveEditingColor(null);
            }}
          >
            <div
              className="bg-white p-6 rounded-xl shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {activeEditingColor ? 'Modify Color' : 'Choose Color'}
                </h3>
                <div className="flex gap-2">
                  {/* Quick color presets */}
                  <button
                    onClick={() => setColorWheelHsl({ h: 0, s: 0, l: 0 })}
                    className="w-6 h-6 rounded-full bg-black border border-gray-300"
                  />
                  <button
                    onClick={() => setColorWheelHsl({ h: 0, s: 0, l: 100 })}
                    className="w-6 h-6 rounded-full bg-white border border-gray-300"
                  />
                  <button
                    onClick={() => setColorWheelHsl({ h: 0, s: 0, l: 50 })}
                    className="w-6 h-6 rounded-full bg-gray-500 border border-gray-300"
                  />
                </div>
              </div>
              
              <HslColorPicker
                color={colorWheelHsl}
                onChange={setColorWheelHsl}
              />

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowWheel(false);
                    setActiveEditingColor(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const newColor = hslToHex(colorWheelHsl.h, colorWheelHsl.s, colorWheelHsl.l);
                    if (activeEditingColor) {
                      // Handle modifying existing colors
                      if (activeEditingColor === 'primary') {
                        setSelectedColor(newColor);
                        setComplementaryColor(getComplementaryColor(newColor));
                        setTriadicColors(getTriadicColors(newColor));
                      } else if (activeEditingColor === 'complement') {
                        setComplementaryColor(newColor);
                      } else if (activeEditingColor.startsWith('accent')) {
                        const [color1, color2] = triadicColors || [newColor, newColor];
                        if (activeEditingColor === 'accent1') {
                          setTriadicColors([newColor, color2]);
                        } else {
                          setTriadicColors([color1, newColor]);
                        }
                      }
                      setActiveSearchColor(newColor);
                    } else {
                      // Handle new color selection
                      handleManualColor(newColor);
                    }
                    setShowWheel(false);
                    setActiveEditingColor(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md"
                >
                  Apply Color
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COLOR PALETTE ROW */}
        {selectedColor && (
          <div className="mb-10 flex flex-col items-center">
            {uploadedImageUrl && (
              <div className="flex flex-col items-center mb-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={uploadedImageUrl}
                      alt="Uploaded Inspiration"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 flex gap-1">
                    {/* Edit extracted color */}
                    <button
                      onClick={() => {
                        const hsl = hexToHSL(selectedColor || '#000000');
                        setColorWheelHsl(hsl);
                        setActiveEditingColor('primary');
                        setShowWheel(true);
                      }}
                      className="bg-white/90 hover:bg-white text-gray-800 p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    {/* Upload new image */}
                    <label className="bg-white/90 hover:bg-white text-gray-800 p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
                <ArrowDown className="w-6 h-6 text-white mt-2" />
              </div>
            )}

            <div className="flex items-center justify-center gap-6">
              {/* Back to Start Button */}
              <button
                onClick={resetAll}
                className="absolute top-4 left-4 text-white/60 hover:text-white/90 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Start</span>
              </button>

              {/* Primary */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-lg cursor-pointer ${getSwatchRingStyle(selectedColor)}`}
                    style={{ backgroundColor: selectedColor }}
                    onClick={() => handleSwatchClick(selectedColor)}
                  />
                  <button
                    onClick={() => {
                      const hsl = hexToHSL(selectedColor || '#000000');
                      setColorWheelHsl(hsl);
                      setActiveEditingColor('primary');
                      setShowWheel(true);
                    }}
                    className="absolute -top-2 -right-2 bg-white/90 hover:bg-white text-gray-800 p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs md:text-sm text-white/60 mt-2">
                  Primary
                </span>
              </div>

              {/* Complementary Color */}
              {complementaryColor && (
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-lg cursor-pointer ${getSwatchRingStyle(complementaryColor)}`}
                      style={{ backgroundColor: complementaryColor }}
                      onClick={() => handleSwatchClick(complementaryColor)}
                    />
                    <button
                      onClick={() => {
                        const hsl = hexToHSL(complementaryColor);
                        setColorWheelHsl(hsl);
                        setActiveEditingColor('complement');
                        setShowWheel(true);
                      }}
                      className="absolute -top-2 -right-2 bg-white/90 hover:bg-white text-gray-800 p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs md:text-sm text-white/60 mt-2">
                    Complement
                  </span>
                </div>
              )}

              {/* Triadic Colors */}
              {triadicColors?.map((col, i) => (
                <div key={col} className="flex flex-col items-center">
                  <div className="relative group">
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-lg cursor-pointer ${getSwatchRingStyle(col)}`}
                      style={{ backgroundColor: col }}
                      onClick={() => handleSwatchClick(col)}
                    />
                    <button
                      onClick={() => {
                        const hsl = hexToHSL(col);
                        setColorWheelHsl(hsl);
                        // Use type-safe values instead of template literals
                        setActiveEditingColor(i === 0 ? 'accent1' : 'accent2');
                        setShowWheel(true);
                      }}
                      className="absolute -top-2 -right-2 bg-white/90 hover:bg-white text-gray-800 p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs md:text-sm text-white/60 mt-2">
                    Accent {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const matchText =
              activeSearchColor && Number.isFinite(product.matchPercentage)
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
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
                      alt={product.description}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: product.dominantColor }}
                      />
                      {activeSearchColor ? (
                        <>
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: activeSearchColor }}
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

        {/* INFINITE SCROLL SENTINEL */}
        <div ref={sentinelRef} className="mt-8 h-8 flex justify-center items-center">
          {isFetching && hasMore && (
            <div className="text-sm text-white/60 animate-pulse">
              Loading more...
            </div>
          )}
          {!hasMore && (
            <div className="text-sm text-white/50">~ End of results ~</div>
          )}
        </div>
      </div>
    </div>
  );
}
