"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  ArrowDown,
  Pin,
  PinOff,
  Palette,
  Settings,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Camera,
} from "lucide-react";
import { HslColorPicker } from "react-colorful";
import { amazonProducts } from "../lib/amazonProducts";

// --- Needed declarations (from the original code) ---
declare const ColorThief: any;
declare const gtag_report_conversion: (url: string) => boolean;

// --- Color utils (same as original) ---
function hexToHSL(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
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
}

function hslToHex(h: number, s: number, l: number) {
  h /= 360;
  s /= 100;
  l /= 100;
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
    return hx.length === 1 ? "0" + hx : hx;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getComplementaryColor(hex: string) {
  const { h, s, l } = hexToHSL(hex);
  return hslToHex((h + 180) % 360, s, l);
}

function getTriadicColors(hex: string): [string, string] {
  const { h, s, l } = hexToHSL(hex);
  return [
    hslToHex((h + 120) % 360, s, l),
    hslToHex((h + 240) % 360, s, l),
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
          `#${r.toString(16).padStart(2, "0")}${g
            .toString(16)
            .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
        );
      } catch {
        resolve("#000000");
      }
    };
    img.onerror = () => resolve("#000000");
    img.crossOrigin = "Anonymous";
    img.src = URL.createObjectURL(file);
  });
}

function calculateColorMatch(color1: string, color2: string): number {
  try {
    const c1 = color1.replace(/^%23/, "#");
    const c2 = color2.replace(/^%23/, "#");
    const r1 = parseInt(c1.slice(1, 3), 16),
      g1 = parseInt(c1.slice(3, 5), 16),
      b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16),
      g2 = parseInt(c2.slice(3, 5), 16),
      b2 = parseInt(c2.slice(5, 7), 16);
    const dist = Math.sqrt(
      3 * (r2 - r1) ** 2 + 4 * (g2 - g1) ** 2 + 2 * (b2 - b1) ** 2
    );
    const max = Math.sqrt(3 * 255 ** 2 + 4 * 255 ** 2 + 2 * 255 ** 2);
    return Math.round((1 - dist / max) * 100);
  } catch {
    return 0;
  }
}

// --- Main Component ---
export default function ModernUploader() {
  // -- Vision Board pins --
  const [pinned, setPinned] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pinnedProducts");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // -- Colors --
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(
    null
  );
  const [triadicColors, setTriadicColors] = useState<[string, string] | null>(
    null
  );
  const [activeSearchColor, setActiveSearchColor] = useState<string | null>(
    null
  );

  // -- Upload states --
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);

  // -- Color Picker Modal --
  const [showWheel, setShowWheel] = useState(false);
  const [colorWheelHsl, setColorWheelHsl] = useState({ h: 0, s: 50, l: 50 });
  const [activeEditingColor, setActiveEditingColor] = useState<
    "primary" | "complement" | "accent1" | "accent2" | null
  >(null);

  // -- Product listing + infinite scroll --
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // -- Vision Board collapsible --
  const pinnedTriggerRef = useRef<HTMLDivElement>(null);
  const pinnedContainerRef = useRef<HTMLDivElement>(null);
  const [isPinnedFloating, setIsPinnedFloating] = useState(false);
  const [visionCollapsed, setVisionCollapsed] = useState(false);

  // -- Show "Back" button once color is chosen --
  const [showBack, setShowBack] = useState(true);

  // -- Effects --
  useEffect(() => {
    // Shuffle products once
    const shuffled = [...amazonProducts].sort(() => Math.random() - 0.5);
    setAllProducts(shuffled);
    setPage(1);

    const handleScroll = () => {
      // Hide "Back" if scrolling
      setShowBack(window.scrollY < 80);
      // Handle pinned vision board floating
      if (pinnedTriggerRef.current && pinnedContainerRef.current) {
        const trigTop = pinnedTriggerRef.current.getBoundingClientRect().top;
        setIsPinnedFloating(trigTop < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Whenever page, or search color changes, load next batch
    if (!allProducts.length) return;
    setIsFetching(true);

    let sorted = allProducts;
    if (activeSearchColor) {
      sorted = allProducts.map((p) => ({
        ...p,
        matchPercentage: calculateColorMatch(activeSearchColor, p.dominantColor || "#000"),
      }));
      sorted.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const batch = sorted.slice(start, start + pageSize);

    if (page === 1) setProducts(batch);
    else setProducts((prev) => [...prev, ...batch]);

    setHasMore(batch.length === pageSize);
    setIsFetching(false);
  }, [page, activeSearchColor, allProducts]);

  useEffect(() => {
    // Infinite scroll observer
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  // -- Handlers --
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUpload(file);
  }
  async function processUpload(file: File) {
    const url = URL.createObjectURL(file);
    setUploadedImageUrl(url);
    setHasUploaded(true);

    const color = await extractColor(file);
    handleManualColor(color);
  }
  function handleManualColor(hex: string) {
    setSelectedColor(hex);
    setComplementaryColor(getComplementaryColor(hex));
    setTriadicColors(getTriadicColors(hex));
    setActiveSearchColor(hex);
    setPage(1);
  }
  function handleSwatchClick(color: string) {
    setActiveSearchColor(color);
    setPage(1);
  }
  function handleGearClick(
    e: React.MouseEvent,
    color: string,
    editingType: "primary" | "complement" | "accent1" | "accent2"
  ) {
    e.stopPropagation();
    setColorWheelHsl(hexToHSL(color));
    setActiveEditingColor(editingType);
    setShowWheel(true);
  }
  function togglePin(productId: number) {
    setPinned((prev) => {
      const hasIt = prev.includes(productId);
      const updated = hasIt ? prev.filter((id) => id !== productId) : [...prev, productId];
      localStorage.setItem("pinnedProducts", JSON.stringify(updated));
      return updated;
    });
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
  }

  // -- Vision board pinned color highlights --
  const pinnedColors = allProducts
    .filter((p) => pinned.includes(p.id) && p.dominantColor)
    .map((p) => p.dominantColor);
  const uniquePinnedColors = Array.from(new Set(pinnedColors)).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 text-gray-800 pb-20">
      {/* "Back" Button */}
      {(hasUploaded || selectedColor) && showBack && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={resetAll}
            className="flex items-center gap-1 px-2 py-1 bg-black/40 rounded text-white hover:bg-black/60 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      )}

      {/* Hero Section (new design) */}
      <div className="relative h-[38vh] md:h-[45vh] mb-12 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gray-300/10" />
        <div className="z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold">
            <span className="text-gray-900">SHOP BY</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
              COLOR
            </span>
          </h1>
          <p className="mt-2 text-xl md:text-2xl text-gray-700">
            Find furniture & décor that perfectly matches your style.
          </p>
        </div>
      </div>

      {/* Vision Board Trigger */}
      <div ref={pinnedTriggerRef} />

      {/* Vision Board */}
      {pinned.length > 0 && (
        <div
          ref={pinnedContainerRef}
          className={`border-b border-gray-300 py-2 px-4 mb-8 bg-white/50 backdrop-blur-md text-gray-800 ${
            isPinnedFloating
              ? "fixed left-0 right-0 top-0 z-40 shadow-lg"
              : ""
          } transition-all duration-500 ease-out`}
        >
          <div className="flex items-center justify-between mb-1.5 px-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-600">Vision Board</h3>
              {uniquePinnedColors.map((color, idx) => (
                <div
                  key={idx}
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">{pinned.length} items</span>
              <button
                onClick={() => setVisionCollapsed(!visionCollapsed)}
                className="p-1 bg-gray-200 hover:bg-gray-300 rounded"
              >
                {visionCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
          {!visionCollapsed && (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-8">
              {pinned.map((id) => {
                const product = allProducts.find((p) => p.id === id);
                if (!product) return null;
                return (
                  <a
                    key={id}
                    href={product.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      gtag_report_conversion(product.affiliateLink);
                    }}
                    className="min-w-[100px] relative border border-gray-300 rounded-lg overflow-hidden shrink-0 hover:shadow-md transition-all"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePin(id);
                      }}
                      className="absolute top-2 right-2 z-10 text-xs p-1.5 bg-black/30 rounded-full hover:bg-black/50 text-white"
                    >
                      <PinOff className="w-3 h-3" />
                    </button>
                    <div className="h-[100px] w-[100px] overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.description}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-125"
                      />
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
      {isPinnedFloating && pinned.length > 0 && <div className="h-[120px]" />}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-20 text-center">
        {!hasUploaded && !selectedColor && (
          <>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              Select your color to start.
            </h3>
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-8">
              {/* Upload */}
              <label className="group cursor-pointer flex flex-col items-center">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition">
                  <Upload className="w-10 h-10 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="mt-2 text-sm md:text-base font-medium text-gray-700">
                    Upload
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>

              {/* Snap (Camera) */}
              <label className="group cursor-pointer flex flex-col items-center">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition">
                  <Camera className="w-10 h-10 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="mt-2 text-sm md:text-base font-medium text-gray-700">
                    Snap
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              {/* Select (Palette) */}
              <div
                onClick={() => setShowWheel(true)}
                className="group cursor-pointer flex flex-col items-center"
              >
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition">
                  <Palette className="w-10 h-10 text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="mt-2 text-sm md:text-base font-medium text-gray-700">
                    Select
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Color Picker Modal */}
        {showWheel && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
            onClick={() => {
              setShowWheel(false);
              setActiveEditingColor(null);
            }}
          >
            <div
              className="bg-white p-6 rounded-xl shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {activeEditingColor ? "Modify Color" : "Choose Color"}
                </h3>
                <div className="flex gap-2">
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
              <HslColorPicker color={colorWheelHsl} onChange={setColorWheelHsl} />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowWheel(false);
                    setActiveEditingColor(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const newColor = hslToHex(
                      colorWheelHsl.h,
                      colorWheelHsl.s,
                      colorWheelHsl.l
                    );
                    if (activeEditingColor) {
                      if (activeEditingColor === "primary") {
                        setSelectedColor(newColor);
                        setComplementaryColor(getComplementaryColor(newColor));
                        setTriadicColors(getTriadicColors(newColor));
                        setActiveSearchColor(newColor);
                      } else if (activeEditingColor === "complement") {
                        setComplementaryColor(newColor);
                        setActiveSearchColor(newColor);
                      } else {
                        const [c1, c2] = triadicColors || [newColor, newColor];
                        if (activeEditingColor === "accent1") {
                          setTriadicColors([newColor, c2]);
                          setActiveSearchColor(newColor);
                        } else {
                          setTriadicColors([c1, newColor]);
                          setActiveSearchColor(newColor);
                        }
                      }
                      setPage(1);
                    } else {
                      handleManualColor(newColor);
                    }
                    setShowWheel(false);
                    setActiveEditingColor(null);
                  }}
                  className="flex-1 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md text-sm"
                >
                  Apply Color
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Display chosen colors */}
        {selectedColor && (
          <div className="mb-10 flex flex-col items-center">
            {uploadedImageUrl && (
              <div className="flex flex-col items-center mb-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={uploadedImageUrl}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setColorWheelHsl(hexToHSL(selectedColor || "#000000"));
                        setActiveEditingColor("primary");
                        setShowWheel(true);
                      }}
                      className="bg-white/90 hover:bg-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Settings className="w-4 h-4 text-gray-800" />
                    </button>
                    <label className="bg-white/90 hover:bg-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload className="w-4 h-4 text-gray-800" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
                <ArrowDown className="w-6 h-6 text-gray-400 mt-2" />
              </div>
            )}

            <div className="flex items-center justify-center gap-6">
              {/* Primary */}
              <div className="relative group cursor-pointer">
                <div
                  onClick={() => handleSwatchClick(selectedColor!)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-lg transition ${
                    selectedColor === activeSearchColor ? "ring-2 ring-pink-500" : ""
                  }`}
                  style={{ backgroundColor: selectedColor! }}
                />
                <button
                  onClick={(e) => handleGearClick(e, selectedColor!, "primary")}
                  className="hidden sm:group-hover:block absolute top-1 right-1 p-1 bg-black/50 rounded"
                >
                  <Settings className="w-4 h-4 text-white" />
                </button>
                <span className="text-xs md:text-sm text-gray-600 mt-2 block text-center">
                  Selected
                </span>
              </div>

              {/* Complement */}
              {complementaryColor && (
                <div className="relative group cursor-pointer">
                  <div
                    onClick={() => handleSwatchClick(complementaryColor)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-lg transition ${
                      complementaryColor === activeSearchColor ? "ring-2 ring-pink-500" : ""
                    }`}
                    style={{ backgroundColor: complementaryColor }}
                  />
                  <button
                    onClick={(e) => handleGearClick(e, complementaryColor, "complement")}
                    className="hidden sm:group-hover:block absolute top-1 right-1 p-1 bg-black/50 rounded"
                  >
                    <Settings className="w-4 h-4 text-white" />
                  </button>
                  <span className="text-xs md:text-sm text-gray-600 mt-2 block text-center">
                    Complement
                  </span>
                </div>
              )}

              {/* Triadic */}
              {triadicColors?.map((col, i) => (
                <div key={col} className="relative group cursor-pointer">
                  <div
                    onClick={() => handleSwatchClick(col)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-lg transition ${
                      col === activeSearchColor ? "ring-2 ring-pink-500" : ""
                    }`}
                    style={{ backgroundColor: col }}
                  />
                  <button
                    onClick={(e) =>
                      handleGearClick(e, col, i === 0 ? "accent1" : "accent2")
                    }
                    className="hidden sm:group-hover:block absolute top-1 right-1 p-1 bg-black/50 rounded"
                  >
                    <Settings className="w-4 h-4 text-white" />
                  </button>
                  <span className="text-xs md:text-sm text-gray-600 mt-2 block text-center">
                    Accent {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const isPinned = pinned.includes(p.id);
            return (
              <a
                key={p.id}
                href={p.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  gtag_report_conversion(p.affiliateLink);
                }}
                className="block"
              >
                <div className="group relative bg-white rounded-xl overflow-hidden border border-gray-300 hover:shadow-md transition-all duration-300 ease-out">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      togglePin(p.id);
                    }}
                    className="absolute top-2 right-2 z-20 bg-black/30 text-white p-1 rounded hover:bg-black/50 transition"
                  >
                    <Pin
                      className={`w-5 h-5 ${
                        isPinned ? "fill-white text-pink-400" : ""
                      }`}
                    />
                  </button>
                  <div className="aspect-square overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={p.image}
                      alt={p.description}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    {p.affiliateLink && (
                      <span className="text-sm text-pink-500 hover:text-pink-400 transition-colors">
                        Shop on Amazon
                      </span>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Infinite Scroll Sentinel */}
        <div ref={sentinelRef} className="mt-8 h-8 flex justify-center items-center">
          {isFetching && hasMore && (
            <div className="text-sm text-gray-500 animate-pulse">Loading more...</div>
          )}
          {!hasMore && products.length > 0 && (
            <div className="text-sm text-gray-400">~ End of results ~</div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-gray-900 text-white py-2 text-center text-sm z-50">
        Contact us at: <a href="mailto:info@example.com">info@shop-by-color.com</a>
      </footer>
    </div>
  );
}

