import React, { useState, useCallback } from "react";
import { Upload } from "lucide-react";

declare const ColorThief: any;

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  dominantColor: string;
  matchPercentage: number;
  affiliateLink?: string;
}

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
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
};

const hslToRgb = (h: number, s: number, l: number) => {
  h /= 360; s /= 100; l /= 100;
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
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
};

const getComplementaryColor = (hex: string) => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + 180) % 360;
  const complementaryRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);
};

const extractColor = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    const colorThief = new ColorThief();
    
    img.addEventListener('load', () => {
      try {
        const [r, g, b] = colorThief.getColor(img);
        resolve(`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`);
      } catch (error) {
        console.error('Color extraction error:', error);
        resolve('#000000');
      }
    });

    img.crossOrigin = 'Anonymous';
    img.onerror = () => resolve('#000000');
    img.src = URL.createObjectURL(file);
  });
};

const ModernUploader = () => {
  const [view, setView] = useState("initial");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fetchProducts = async (color: string) => {
    setProducts([]);
    try {
      const response = await fetch(`/api/products?source=amazon&color=${encodeURIComponent(color)}`);
      const data = await response.json();
      setProducts(data);
      setView("results");
    } catch (error) {
      console.error("Error fetching products:", error);
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
    if (file && file.type.startsWith("image/")) {
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
      <div className={`transition-all duration-500 ${view !== "initial" ? "pt-8 pb-4" : "pt-32 pb-16"}`}>
        <h1 className="text-center text-6xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 animate-gradient bg-[length:200%_auto]">
            CHROMA
          </span>
        </h1>
      </div>

      {view === "initial" && (
        <div className="max-w-2xl mx-auto px-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 
              ${isDragging ? "border-white/50 bg-white/10" : "border-white/20 hover:border-white/30"}
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

      {view === "results" && products.length > 0 && (
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center gap-8 mb-12">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-24 h-24 rounded-xl shadow-lg cursor-pointer transition-all
                  ${selectedColor === activeColor ? "ring-2 ring-white scale-105" : "hover:ring-2 hover:ring-white/20"}`}
                style={{ backgroundColor: selectedColor || "#000000" }}
                onClick={() => selectedColor && handleColorClick(selectedColor)}
              />
              <span className="text-sm text-white/60">Primary</span>
            </div>

            {complementaryColor && (
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-24 h-24 rounded-xl shadow-lg cursor-pointer transition-all
                    ${complementaryColor === activeColor ? "ring-2 ring-white scale-105" : "hover:ring-2 hover:ring-white/20"}`}
                  style={{ backgroundColor: complementaryColor }}
                  onClick={() => handleColorClick(complementaryColor)}
                />
                <span className="text-sm text-white/60">Complementary</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setView("initial")}
                className="w-24 h-24 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-all flex flex-col items-center justify-center group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">+</span>
                <span className="text-sm mt-1">New Color</span>
              </button>
              <span className="text-sm text-white/60">Upload</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <a
                key={product.id}
                href={product.affiliateLink ? product.affiliateLink : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="group relative bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt="Product"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    {selectedColor && (
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: product.dominantColor }} />
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activeColor || '' }} />
                          <span className="text-xs text-white/50">{product.matchPercentage}% match</span>
                        </div>
                      </div>
                    )}
                    {product.affiliateLink && (
                      <div className="mt-2 text-center">
                        <span className="text-sm text-blue-400 hover:text-blue-300 underline">Shop on Amazon</span>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernUploader;
