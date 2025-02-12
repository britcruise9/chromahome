'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, ArrowRight, Pin, PinOff, Palette } from 'lucide-react';
// NEW: we’ll import `HslColorPicker` from react-colorful for a wheel
import { HslColorPicker } from 'react-colorful';

////////////////////////////////////////////////////
// 1) COLOR UTILS
////////////////////////////////////////////////////
declare const ColorThief: any;

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
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
        const hex =
          '#' +
          r.toString(16).padStart(2, '0') +
          g.toString(16).padStart(2, '0') +
          b.toString(16).padStart(2, '0');
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

////////////////////////////////////////////////////
// 2) HERO IMAGES
////////////////////////////////////////////////////
const heroImages = [
  "https://hips.hearstapps.com/hmg-prod/images/living-room-paint-colors-hbx040122inspoindex-012-copy-1655397674-653fda462b085.jpg?crop=0.752xw:1.00xh;0.120xw,0&resize=1120:*",
  "https://i.imgur.com/oH0sLxE.jpeg",
  "https://i.imgur.com/UzYfvqA.png",
  "https://imgur.com/83d57027-21bd-4515-abd0-c7e3d724dc23",
  "https://imgur.com/edc74bc2-7468-4c24-a88c-e1470a6188a2",
];

////////////////////////////////////////////////////
// 3) MAIN COMPONENT
////////////////////////////////////////////////////
export default function ModernUploader() {
  // Pinned items
  const [pinned, setPinned] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pinnedProducts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Original palette states
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(
    null
  );
  const [triadicColors, setTriadicColors] = useState<[string, string] | null>(
    null
  );

  // If user uploaded a photo
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Has user chosen color yet?
  const [hasUploaded, setHasUploaded] = useState(false);

  // The color used for searching
  const [activeSearchColor, setActiveSearchColor] = useState<string | null>(
    null
  );

  // For color-wheel approach (desktop)
  const [desktopHsl, setDesktopHsl] = useState({ h: 0, s: 0, l: 1 });
  const [showWheel, setShowWheel] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // If user wants a manual "Confirm" color on mobile
  const [tempMobileColor, setTempMobileColor] = useState("#ffffff");

  ////////////////////////////////////////////////////
  // 5) Hero rotation + initial fetch
  ////////////////////////////////////////////////////
  const [currentHero, setCurrentHero] = useState(0);

  // Product states
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if desktop
    setIsDesktop(window.innerWidth >= 768);
    // Hero auto-rotate
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    fetchProducts(1, null);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intersection Observer => infinite scroll
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

  // Page change => fetch next
  useEffect(() => {
    if (page === 1) return;
    fetchProducts(page, activeSearchColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // If activeSearchColor changes => reset pagination
  useEffect(() => {
    if (!activeSearchColor) return;
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, activeSearchColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSearchColor]);

  async function fetchProducts(pageNum: number, color: string | null) {
    try {
      setIsFetching(true);
      let url = `/api/products?page=${pageNum}&limit=${limit}`;
      if (color) {
        url += `&color=${encodeURIComponent(color)}`;
      }
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (pageNum === 1) {
        setProducts(data);
      } else {
        setProducts((prev) => [...prev, ...data]);
      }
      if (data.length < limit) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('fetch error:', error);
      setHasMore(false);
    } finally {
      setIsFetching(false);
    }
  }

  ////////////////////////////////////////////////////
  // FILE UPLOAD => EXTRACT COLOR => set search color
  ////////////////////////////////////////////////////
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);
      const color = await extractColor(file);
      setSelectedColor(color);
      setComplementaryColor(getComplementaryColor(color));
      setTriadicColors(getTriadicColors(color));
      setActiveSearchColor(color);
      setHasUploaded(true);
    } catch (error) {
      console.error('extract color error:', error);
    }
  }

  ////////////////////////////////////////////////////
  // MANUAL COLOR => WAIT FOR "SELECT COLOR" (MOBILE)
  ////////////////////////////////////////////////////
  function handleConfirmMobileColor() {
    handleManualColor(tempMobileColor);
  }

  function handleManualColor(hex: string) {
    setSelectedColor(hex);
    setComplementaryColor(getComplementaryColor(hex));
    setTriadicColors(getTriadicColors(hex));
    setActiveSearchColor(hex);
    setHasUploaded(true);
  }

  // Swatch click => only changes activeSearchColor
  function handleSwatchClick(color: string | null) {
    if (!color) return;
    setActiveSearchColor(color);
  }

  // Pin toggle
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

  // For pinned snippet
  function getShortDescription(desc: string) {
    if (!desc) return '';
    const words = desc.trim().split(/\s+/);
    const snippet = words.slice(0, 4).join(' ');
    return snippet.length < desc.length ? snippet + '...' : snippet;
  }

  // highlight ring if color is active
  function getSwatchRingStyle(testColor: string | null) {
    return activeSearchColor === testColor ? 'ring-4 ring-white' : '';
  }

  // "Change color" => reset all
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
    fetchProducts(1, null);
  }

  ////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* A) ROTATING HERO */}
      <div className="relative h-[38vh] md:h-[45vh] mb-12 overflow-hidden">
        {heroImages.map((imgSrc, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentHero === i ? 'opacity-100 z-20' : 'opacity-0 z-10'
            }`}
            style={{
              backgroundImage: `url('${imgSrc}')`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-30 px-4">
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
          <p className="mt-2 text-xl md:text-2xl text-white font-light [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
            Decorate Like a Pro
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* B) FIRST PAGE: Upload or color wheel? */}
        {!hasUploaded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {/* LEFT: Upload */}
            <div className="max-w-md mx-auto min-h-[320px] flex items-center justify-center">
              <label className="block w-full">
                <div
                  className="
                    group cursor-pointer border-2 border-dashed border-white/20 
                    rounded-xl p-8 text-center 
                    hover:border-white/30 
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

            {/* RIGHT: color picking box */}
            <div
              className="
                max-w-md mx-auto min-h-[320px] bg-white/10 border border-white/20 
                rounded-xl p-6 flex flex-col gap-4 items-center justify-center
              "
            >
              <div className="flex items-center gap-2 text-white/80 mb-1">
                <Palette className="w-6 h-6 text-white/50" />
                <span className="font-semibold">Or pick a color below:</span>
              </div>

              {isDesktop ? (
                <>
                  {/* Desktop => color square toggles wheel */}
                  <div
                    className="w-28 h-28 rounded-xl border border-white/30 shadow-md cursor-pointer"
                    style={{
                      backgroundColor: hslToHex(
                        desktopHsl.h,
                        desktopHsl.s * 100,
                        desktopHsl.l * 100
                      ),
                    }}
                    onClick={() => setShowWheel(true)}
                  />
                  <button
                    onClick={() =>
                      handleManualColor(
                        hslToHex(
                          desktopHsl.h,
                          desktopHsl.s * 100,
                          desktopHsl.l * 100
                        )
                      )
                    }
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md"
                  >
                    Select Color
                  </button>

                  {/* Color wheel overlay */}
                  {showWheel && (
                    <div
                      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                      onClick={() => setShowWheel(false)}
                    >
                      <div
                        className="bg-white p-4 rounded shadow-md"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HslColorPicker
                          color={desktopHsl}
                          onChange={(newHsl) => setDesktopHsl(newHsl)}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Mobile => <input type="color"> + confirm button
                <>
                  <input
                    type="color"
                    className="h-20 w-20 cursor-pointer rounded-full border-none shadow-md"
                    value={tempMobileColor}
                    onChange={(e) => setTempMobileColor(e.target.value)}
                  />
                  <button
                    onClick={handleConfirmMobileColor}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md"
                  >
                    Select Color
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* C) SECOND PAGE: palette row, pinned, product grid */}
        {selectedColor && (
          <div className="flex flex-wrap justify-center items-center gap-6 mb-10">
            {uploadedImageUrl && (
              <>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={uploadedImageUrl}
                      alt="Uploaded Inspiration"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-white" />
              </>
            )}

            {/* Primary */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-16 h-16 md:w-24 md:h-24 rounded-xl shadow-lg cursor-pointer
                  ${getSwatchRingStyle(selectedColor)}
                `}
                style={{ backgroundColor: selectedColor }}
                onClick={() => handleSwatchClick(selectedColor)}
              />
              <span className="text-xs md:text-sm text-white/60 mt-2">
                Primary
              </span>
              <button
                onClick={resetAll}
                className="mt-1 text-blue-400 hover:underline text-xs"
              >
                Change
              </button>
            </div>

            {/* Complementary */}
            {complementaryColor && (
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-16 h-16 md:w-24 md:h-24 rounded-xl shadow-lg cursor-pointer
                    ${getSwatchRingStyle(complementaryColor)}
                  `}
                  style={{ backgroundColor: complementaryColor }}
                  onClick={() => handleSwatchClick(complementaryColor)}
                />
                <span className="text-xs md:text-sm text-white/60 mt-2">
                  Compliment
                </span>
              </div>
            )}

            {/* Triadic */}
            {triadicColors?.map((col, i) => (
              <div key={col} className="flex flex-col items-center">
                <div
                  className={`
                    w-16 h-16 md:w-24 md:h-24 rounded-xl shadow-lg cursor-pointer
                    ${getSwatchRingStyle(col)}
                  `}
                  style={{ backgroundColor: col }}
                  onClick={() => handleSwatchClick(col)}
                />
                <span className="text-xs md:text-sm text-white/60 mt-2">
                  Accent {i + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pinned row */}
        {pinned.length > 0 && (
          <div className="bg-transparent border border-white/40 text-white py-3 px-4 mb-8 rounded-md">
            <h3 className="font-bold mb-2">Your Pinned Items</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {pinned.map((id) => {
                const product = products.find((p) => p.id === id);
                if (!product) return null;
                return (
                  <a
                    key={id}
                    href={product.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-[120px] relative border border-white/20 rounded p-2 shrink-0"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        togglePin(id);
                      }}
                      className="absolute top-1 right-1 text-xs px-1 py-0.5 bg-black/50 rounded hover:bg-black/70"
                    >
                      <PinOff className="w-3 h-3" />
                    </button>
                    <img
                      src={product.image}
                      alt={product.description}
                      className="h-20 w-auto object-cover mx-auto"
                    />
                    <p className="text-xs mt-2 text-center line-clamp-1">
                      {getShortDescription(product.description || '')}
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Product Grid */}
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
                <div
                  className="
                    group relative bg-white/5 rounded-xl overflow-hidden 
                    hover:bg-white/10 transition-all duration-300 ease-out
                  "
                >
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

                  <div
                    className="
                      aspect-square overflow-hidden 
                      transition-transform duration-300 ease-out group-hover:scale-105
                    "
                  >
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

        {/* Infinite scroll sentinel */}
        <div
          ref={sentinelRef}
          className="mt-8 h-8 flex justify-center items-center"
        >
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
