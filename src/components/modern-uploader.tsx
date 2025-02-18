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

// ----- Type Declarations (if needed) -----
declare const ColorThief: any;
declare const gtag_report_conversion: (url: string) => boolean;

// ----- Color Utils -----
function hexToHSL(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
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

function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
  e.preventDefault();
}

async function handleDrop(
  e: React.DragEvent<HTMLLabelElement>,
  onFileSelect: (file: File) => void
) {
  e.preventDefault();
  const file = e.dataTransfer.files?.[0];
  if (file) onFileSelect(file);
}

// Extract dominant color
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

const heroImages = [
  "https://i.imgur.com/pHjncHD.png",
  "https://i.imgur.com/W1RnTGZ.png",
  "https://i.imgur.com/6uZrs0j.png",
  "https://i.imgur.com/oH0sLxE.jpeg",
  "https://i.imgur.com/UzYfvqA.png",
];

const defaultGradient =
  "radial-gradient(circle at center, #ffadad 0%, #ffd6a5 16%, #fdffb6 33%, #caffbf 50%, #9bf6ff 66%, #a0c4ff 83%, #bdb2ff 100%)";

export default function ModernUploader() {
  const [pinned, setPinned] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pinnedProducts");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
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
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [colorWheelHsl, setColorWheelHsl] = useState({ h: 0, s: 50, l: 50 });
  const [activeEditingColor, setActiveEditingColor] = useState<
    "primary" | "complement" | "accent1" | "accent2" | null
  >(null);

  const [currentHero, setCurrentHero] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [colorOverlay, setColorOverlay] = useState(true);

  const [visionCollapsed, setVisionCollapsed] = useState(false);
  const [showBack, setShowBack] = useState(true);

  const pinnedTriggerRef = useRef<HTMLDivElement>(null);
  const pinnedContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isPinnedFloating, setIsPinnedFloating] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBack(window.scrollY < 80);
      if (pinnedTriggerRef.current && pinnedContainerRef.current) {
        const triggerTop = pinnedTriggerRef.current.getBoundingClientRect().top;
        setIsPinnedFloating(triggerTop < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setColorOverlay(false), 500);
    return () => clearTimeout(t);
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
    setPage(1);
  }, []);

  useEffect(() => {
    if (!allProducts.length) return;
    setIsFetching(true);

    let sorted: any[] = [];
    if (activeSearchColor) {
      sorted = allProducts.map((p) => {
        const c2 = (p.dominantColor || "#000000").trim();
        return {
          ...p,
          matchPercentage: calculateColorMatch(activeSearchColor, c2),
        };
      });
      sorted.sort((a, b) => b.matchPercentage - a.matchPercentage);
    } else {
      sorted = allProducts;
    }

    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const batch = sorted.slice(start, start + pageSize);

    if (page === 1) setProducts(batch);
    else setProducts((prev) => [...prev, ...batch]);

    if (batch.length < pageSize) setHasMore(false);
    else setHasMore(true);

    setIsFetching(false);
  }, [page, activeSearchColor, allProducts]);

  useEffect(() => {
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
    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, [hasMore, isFetching]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUpload(file);
  }

  async function processUpload(file: File) {
    try {
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);
      const color = await extractColor(file);
      handleManualColor(color);
      setHasUploaded(true);
    } catch (err) {
      console.error("extract color error:", err);
    }
  }

  function handleManualColor(hex: string) {
    setSelectedColor(hex);
    setComplementaryColor(getComplementaryColor(hex));
    setTriadicColors(getTriadicColors(hex));
    setActiveSearchColor(hex);
    setPage(1);
    setHasUploaded(true);
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
      const updated = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
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

  const pinnedColors = allProducts
    .filter((p) => pinned.includes(p.id) && p.dominantColor)
    .map((p) => p.dominantColor);
  const uniquePinnedColors = Array.from(new Set(pinnedColors)).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 pb-20">
      {/* Back Button */}
      {(hasUploaded || selectedColor) && showBack && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={resetAll}
            className="flex items-center gap-1 px-2 py-1 bg-black/40 rounded hover:bg-black/60 text-sm text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      )}

      {/* Hero Slideshow */}
      <div className="relative h-[38vh] md:h-[45vh] mb-12 overflow-hidden">
        <div
          className={`absolute inset-0 bg-slate-900 transition-opacity duration-500 z-30 ${
            colorOverlay ? "opacity-100" : "opacity-0"
          }`}
        />
        {heroImages.map((img, i) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentHero === i ? "opacity-100 z-20" : "opacity-0 z-10"
            }`}
            style={{
              background: `url('${img}') center/cover no-repeat`,
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-40 px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold flex flex-wrap items-center justify-center gap-2">
            <span className="text-white drop-shadow-lg">SHOP BY</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-[length:200%_200%] animate-gradient-x drop-shadow-lg">
              COLOR
            </span>
          </h1>
          <p className="mt-2 text-xl md:text-2xl font-light drop-shadow-md text-white">
            Find matching furniture & decor in your exact color
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {!hasUploaded && !selectedColor && (
          <div className="text-center mb-12">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              Select your color to start.
            </h3>
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-8">
              {/* Upload */}
              <label
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, processUpload)}
                className="group cursor-pointer"
              >
                <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition">
                  <Upload className="w-10 h-10 text-gray-400 group-hover:scale-110 transition-transform" />
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
              <label className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                <Camera className="w-10 h-10 text-gray-400" />
                <span className="mt-2 text-sm md:text-base font-medium text-gray-700">
                  Snap
                </span>
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
                className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
              >
                <Palette className="w-10 h-10 text-gray-400" />
                <span className="mt-2 text-sm md:text-base font-medium text-gray-700">
                  Select
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={pinnedTriggerRef} />

        {/* Vision Board */}
        {pinned.length > 0 && (
          <div
            ref={pinnedContainerRef}
            className={`border-b border-gray-300 py-2 px-4 mb-8 bg-white/50 backdrop-blur-md text-gray-800 ${
              isPinnedFloating
                ? "origin-top-left group/vision fixed left-0 right-0 z-40 top-0 border-none shadow-lg"
                : "origin-top"
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
                <span className="text-xs text-gray-500">
                  {pinned.length} items
                </span>
                <button
                  onClick={() => setVisionCollapsed(!visionCollapsed)}
                  className="p-1 bg-gray-200 hover:bg-gray-300 rounded transition"
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
              <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-8 transition-all duration-500">
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
                      className="min-w-[100px] relative border border-gray-300 rounded-lg overflow-hidden shrink-0 transition-all duration-500 hover:scale-105 hover:shadow-md"
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
                          className="w-full h-full object-cover scale-150 transform-gpu hover:scale-125 transition-transform duration-500"
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

        {/* Color Picker Modal */}
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
                <h3 className="text-lg font-semibold text-gray-800">
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
                    const newCol = hslToHex(
                      colorWheelHsl.h,
                      colorWheelHsl.s,
                      colorWheelHsl.l
                    );
                    if (activeEditingColor) {
                      if (activeEditingColor === "primary") {
                        setSelectedColor(newCol);
                        setComplementaryColor(getComplementaryColor(newCol));
                        setTriadicColors(getTriadicColors(newCol));
                        setActiveSearchColor(newCol);
                      } else if (activeEditingColor === "complement") {
                        setComplementaryColor(newCol);
                        setActiveSearchColor(newCol);
                      } else {
                        const [c1, c2] = triadicColors || [newCol, newCol];
                        if (activeEditingColor === "accent1") {
                          setTriadicColors([newCol, c2]);
                          setActiveSearchColor(newCol);
                        } else {
                          setTriadicColors([c1, newCol]);
                          setActiveSearchColor(newCol);
                        }
                      }
                      setPage(1);
                    } else {
                      handleManualColor(newCol);
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

        {/* Chosen Color Palette */}
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
              <div className="relative group cursor-pointer">
                <div
                  onClick={() => handleSwatchClick(selectedColor!)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-lg transition ${
                    selectedColor === activeSearchColor
                      ? "ring-2 ring-pink-500"
                      : ""
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

              {complementaryColor && (
                <div className="relative group cursor-pointer">
                  <div
                    onClick={() => handleSwatchClick(complementaryColor)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-lg transition ${
                      complementaryColor === activeSearchColor
                        ? "ring-2 ring-pink-500"
                        : ""
                    }`}
                    style={{ backgroundColor: complementaryColor }}
                  />
                  <button
                    onClick={(e) =>
                      handleGearClick(e, complementaryColor, "complement")
                    }
                    className="hidden sm:group-hover:block absolute top-1 right-1 p-1 bg-black/50 rounded"
                  >
                    <Settings className="w-4 h-4 text-white" />
                  </button>
                  <span className="text-xs md:text-sm text-gray-600 mt-2 block text-center">
                    Complement
                  </span>
                </div>
              )}

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

        {/* Product Grid */}
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
        <div
          ref={sentinelRef}
          className="mt-8 h-8 flex justify-center items-center"
        >
          {isFetching && hasMore && (
            <div className="text-sm text-gray-500 animate-pulse">
              Loading more...
            </div>
          )}
          {!hasMore && (
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

