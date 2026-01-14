"use client";
import React, { useState, useEffect, useRef } from "react";

// ColorThief is loaded via CDN in layout.tsx
declare const ColorThief: any;
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
  Filter,
} from "lucide-react";
import { HslColorPicker } from "react-colorful";
import { amazonProducts } from "../lib/amazonProducts";

// Example color-utils
function hexToHSL(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h =
      max === r
        ? (g - b) / d + (g < b ? 6 : 0)
        : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}
function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  const hue2rgb = (p, q, t) => {
    t < 0 && (t += 1); t > 1 && (t -= 1);
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const [r, g, b] = [
    hue2rgb(p, q, h + 1/3),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1/3),
  ];
  const toHex = (val) => Math.round(val * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function getComplementaryColor(hex) {
  const { h, s, l } = hexToHSL(hex);
  return hslToHex((h + 180) % 360, s, l);
}
function getTriadicColors(hex) {
  const { h, s, l } = hexToHSL(hex);
  return [
    hslToHex((h + 120) % 360, s, l),
    hslToHex((h + 240) % 360, s, l),
  ];
}
function calculateColorMatch(color1, color2) {
  try {
    const c1 = color1.replace(/^%23/, "#"), c2 = color2.replace(/^%23/, "#");
    const [r1, g1, b1] = [1, 3, 5].map((i) => parseInt(c1.slice(i, i + 2), 16));
    const [r2, g2, b2] = [1, 3, 5].map((i) => parseInt(c2.slice(i, i + 2), 16));
    const dist = Math.sqrt(3 * (r2 - r1) ** 2 + 4 * (g2 - g1) ** 2 + 2 * (b2 - b1) ** 2);
    const max = Math.sqrt(3 * 255 ** 2 + 4 * 255 ** 2 + 2 * 255 ** 2);
    return Math.round((1 - dist / max) * 100);
  } catch {
    return 0;
  }
}
async function extractColor(file) {
  return new Promise((resolve) => {
    const img = new Image(), colorThief = new ColorThief();
    img.onload = () => {
      try {
        const [r, g, b] = colorThief.getColor(img);
        resolve(`#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`);
      } catch {
        resolve("#000000");
      }
    };
    img.onerror = () => resolve("#000000");
    img.crossOrigin = "Anonymous";
    img.src = URL.createObjectURL(file);
  });
}

// Updated Category keywords + helper
const categoryKeywords = {
  chairs: ["chair", "armchair", "recliner", "seating", "sofa", "ottoman"],
  pillows: ["pillow", "cushion", "pillowcase", "throw pillow"],
  rugs: ["rug", "carpet", "mat", "runner"],
  art: ["art", "painting", "print", "poster", "canvas", "wall art"],
  curtains: ["curtain", "drapes", "drapery", "window"],
  blankets: ["blanket", "throw", "fleece", "quilt"],
  other: [],
};
function getCategoryFromDescription(desc) {
  if (!desc) return "other";
  const lower = desc.toLowerCase();
  for (const [cat, kws] of Object.entries(categoryKeywords)) {
    if (kws.some((kw) => lower.includes(kw))) return cat;
  }
  return "other";
}

// Category Filter Component (Unchanged except new keywords)
function CategoryFilter({ activeCategory, onCategoryChange, products }) {
  const categories = ["all"];
  const categoryCount = { all: products.length };
  products.forEach((p) => {
    const c = getCategoryFromDescription(p.description);
    if (!categories.includes(c)) categories.push(c);
    categoryCount[c] = (categoryCount[c] || 0) + 1;
  });

  return (
    <div className="bg-white/10 rounded-xl p-4 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-white/70" />
        <h3 className="text-white/70 font-medium">Filter by Category</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`
              px-4 py-2 rounded-full text-sm transition-all
              ${activeCategory === cat
                ? "bg-white/20 text-white scale-105"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:scale-105"}
            `}
          >
            {cat === "all" ? "All Items" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            <span className="ml-2 text-xs opacity-60">({categoryCount[cat]})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ModernUploader() {
  const [pinned, setPinned] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pinnedProducts");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [selectedColor, setSelectedColor] = useState(null);
  const [complementaryColor, setComplementaryColor] = useState(null);
  const [triadicColors, setTriadicColors] = useState(null);
  const [activeSearchColor, setActiveSearchColor] = useState(null);

  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [colorWheelHsl, setColorWheelHsl] = useState({ h: 0, s: 50, l: 50 });
  const [activeEditingColor, setActiveEditingColor] = useState(null);

  // Slideshow
  const [currentHero, setCurrentHero] = useState(0);
  const [colorOverlay, setColorOverlay] = useState(true);
  const heroImages = [
    "https://i.imgur.com/pHjncHD.png",
    "https://i.imgur.com/W1RnTGZ.png",
    "https://i.imgur.com/6uZrs0j.png",
    "https://i.imgur.com/oH0sLxE.jpeg",
    "https://i.imgur.com/UzYfvqA.png",
  ];

  // Infinite scroll
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const sentinelRef = useRef(null);

  // Vision Board
  const pinnedTriggerRef = useRef(null);
  const pinnedContainerRef = useRef(null);
  const [isPinnedFloating, setIsPinnedFloating] = useState(false);
  const [visionCollapsed, setVisionCollapsed] = useState(false);

  // UI
  const [showBack, setShowBack] = useState(true);

  // Category filter state
  const [activeCategory, setActiveCategory] = useState("all");

  // Effects
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setColorOverlay(false), 500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const shuffled = [...amazonProducts].sort(() => Math.random() - 0.5);
    setAllProducts(shuffled);
    setPage(1);

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
    if (!allProducts.length) return;
    setIsFetching(true);

    // 1) Sort by color match if activeSearchColor
    let sorted = [...allProducts];
    if (activeSearchColor) {
      sorted = sorted.map((p) => ({
        ...p,
        matchPercentage: calculateColorMatch(activeSearchColor, p.dominantColor || "#000"),
      }));
      sorted.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    // 2) Filter by category
    if (activeCategory !== "all") {
      sorted = sorted.filter(
        (p) => getCategoryFromDescription(p.description) === activeCategory
      );
    }

    // 3) Paginate
    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const batch = sorted.slice(start, start + pageSize);

    if (page === 1) setProducts(batch);
    else setProducts((prev) => [...prev, ...batch]);

    setHasMore(batch.length === pageSize);
    setIsFetching(false);
  }, [page, activeSearchColor, allProducts, activeCategory]);

  // Load more on scroll
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
    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  // Handlers
  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUpload(file);
  }
  async function processUpload(file) {
    setUploadedImageUrl(URL.createObjectURL(file));
    setHasUploaded(true);
    const color = await extractColor(file);
    handleManualColor(color);
  }
  function handleManualColor(hex) {
    setSelectedColor(hex);
    setComplementaryColor(getComplementaryColor(hex));
    setTriadicColors(getTriadicColors(hex));
    setProducts([]);
    setActiveSearchColor(hex);
    setPage(1);
  }
  function handleSwatchClick(color) {
    setProducts([]);
    setActiveSearchColor(color);
    setPage(1);
  }
  function handleGearClick(e, color, editingType) {
    e.stopPropagation();
    setColorWheelHsl(hexToHSL(color));
    setActiveEditingColor(editingType);
    setShowWheel(true);
  }
  function togglePin(productId) {
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
    setActiveCategory("all"); // Reset category
  }

  // Vision Board color highlights
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
            style={{ background: `url('${img}') center/cover no-repeat` }}
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
            Discover perfectly matched furniture & decor in your exact color
          </p>
        </div>
      </div>

      {/* Vision Board trigger */}
      <div ref={pinnedTriggerRef} />

      {/* Vision Board */}
      {pinned.length > 0 && (
        <div
          ref={pinnedContainerRef}
          className={`border-b border-gray-300 py-2 px-4 mb-8 bg-white/50 backdrop-blur-md text-gray-800 ${
            isPinnedFloating ? "fixed left-0 right-0 top-0 z-40 shadow-lg" : ""
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
                        className="w-full h-full object-cover scale-150 transition-transform duration-500 hover:scale-125"
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

      {/* Main container */}
      <div className="max-w-6xl mx-auto px-4">
        {!hasUploaded && !selectedColor && (
          <div className="text-center mb-12">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">
              Select your color to start.
            </h3>
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-8 mb-12">
              {/* Upload with drag & drop */}
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) processUpload(file);
                }}
                className="group cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition flex flex-col items-center justify-center">
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

              {/* Snap */}
              <label className="group cursor-pointer flex flex-col items-center justify-center">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition flex flex-col items-center justify-center">
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

              {/* Select */}
              <div
                onClick={() => setShowWheel(true)}
                className="group cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition flex flex-col items-center justify-center">
                  <Palette className="w-10 h-10 text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="mt-2 text-sm md:text-base font-medium text-gray-700">
                    Select
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Color Picker Modal */}
        {showWheel && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
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
                      // Updating existing color
                      if (activeEditingColor === "primary") {
                        setSelectedColor(newCol);
                        setComplementaryColor(getComplementaryColor(newCol));
                        setTriadicColors(getTriadicColors(newCol));
                        setProducts([]);
                        setActiveSearchColor(newCol);
                      } else if (activeEditingColor === "complement") {
                        setComplementaryColor(newCol);
                        setProducts([]);
                        setActiveSearchColor(newCol);
                      } else {
                        const [c1, c2] = triadicColors || [newCol, newCol];
                        if (activeEditingColor === "accent1") {
                          setTriadicColors([newCol, c2]);
                        } else {
                          setTriadicColors([c1, newCol]);
                        }
                        setProducts([]);
                        setActiveSearchColor(newCol);
                      }
                      setPage(1);
                    } else {
                      // First-time selection
                      setSelectedColor(newCol);
                      setComplementaryColor(getComplementaryColor(newCol));
                      setTriadicColors(getTriadicColors(newCol));
                      setProducts([]);
                      setActiveSearchColor(newCol);
                      setPage(1);
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

        {/* Chosen Colors */}
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
                      <Settings className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>
                <span className="text-sm mt-1 text-gray-600 italic">
                  (Extracted primary color)
                </span>
              </div>
            )}

            {/* Swatches */}
            <div className="flex items-center justify-center gap-4">
              {/* Primary */}
              <div
                onClick={() => handleSwatchClick(selectedColor)}
                className="relative cursor-pointer"
                style={{ backgroundColor: selectedColor }}
              >
                <div className="w-16 h-16 rounded-md shadow-md" />
                <button
                  onClick={(e) => handleGearClick(e, selectedColor, "primary")}
                  className="absolute bottom-1 right-1 text-white opacity-80 bg-black/30 hover:bg-black/50 rounded-full p-1 transition"
                >
                  <Settings className="w-3 h-3" />
                </button>
              </div>

              {/* Complementary */}
              {complementaryColor && (
                <div
                  onClick={() => handleSwatchClick(complementaryColor)}
                  className="relative cursor-pointer"
                  style={{ backgroundColor: complementaryColor }}
                >
                  <div className="w-16 h-16 rounded-md shadow-md" />
                  <button
                    onClick={(e) => handleGearClick(e, complementaryColor, "complement")}
                    className="absolute bottom-1 right-1 text-white opacity-80 bg-black/30 hover:bg-black/50 rounded-full p-1 transition"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Triadic */}
              {triadicColors &&
                triadicColors.map((col, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSwatchClick(col)}
                    className="relative cursor-pointer"
                    style={{ backgroundColor: col }}
                  >
                    <div className="w-16 h-16 rounded-md shadow-md" />
                    <button
                      onClick={(e) =>
                        handleGearClick(e, col, idx === 0 ? "accent1" : "accent2")
                      }
                      className="absolute bottom-1 right-1 text-white opacity-80 bg-black/30 hover:bg-black/50 rounded-full p-1 transition"
                    >
                      <Settings className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={(cat) => {
            setProducts([]);
            setActiveCategory(cat);
            setPage(1);
          }}
          products={allProducts}
        />

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <a
              key={product.id}
              href={product.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-4 border border-gray-200 shadow hover:shadow-md transition flex flex-col"
            >
              <div className="relative w-full h-40 mb-3 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={product.image}
                  alt={product.description}
                  className="w-full h-full object-cover scale-110 hover:scale-[1.15] transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePin(product.id);
                  }}
                  className="absolute top-2 right-2 z-10 text-xs p-1.5 bg-black/30 rounded-full hover:bg-black/50 text-white"
                >
                  {pinned.includes(product.id) ? (
                    <Pin className="w-3 h-3" />
                  ) : (
                    <PinOff className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="flex-1 flex flex-col">
                <p className="text-gray-700 text-sm font-medium line-clamp-2 mb-2">
                  {product.description}
                </p>
                {activeSearchColor && product.matchPercentage !== undefined && (
                  <div className="text-xs text-gray-500">
                    Match: {product.matchPercentage}%
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>

        {isFetching && (
          <div className="text-center py-6 text-gray-500">Loading...</div>
        )}
        {!hasMore && !isFetching && (
          <div className="text-center py-6 text-gray-500">No more items</div>
        )}
        <div ref={sentinelRef} className="h-1" />
      </div>
    </div>
  );
}
