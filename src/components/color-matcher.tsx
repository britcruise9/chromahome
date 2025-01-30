"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  dominantColor?: string;
  colorDistance?: number;
}

// Color conversion utilities
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
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
};

const hslToRgb = (h: number, s: number, l: number) => {
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

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
};

const getComplementaryColor = (hex: string) => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  // Rotate hue by 180 degrees for complementary color
  hsl.h = (hsl.h + 180) % 360;
  const complementaryRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);
};

const ColorMatcher = () => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const extractColor = async (file: File): Promise<string> => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const centerX = Math.floor(img.width / 2);
          const centerY = Math.floor(img.height / 2);
          const pixel = ctx.getImageData(centerX, centerY, 1, 1).data;
          
          const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
          resolve(hex);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('Error getting dominant color:', error);
      return '#000000';
    }
  };

  const fetchProducts = async (color?: string) => {
    try {
      const response = await fetch(`/api/products${color ? `?color=${encodeURIComponent(color)}` : ''}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const color = await extractColor(file);
      setSelectedColor(color);
      setComplementaryColor(getComplementaryColor(color));
      await fetchProducts(color);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleColorClick = async (color: string) => {
    setSelectedColor(color);
    setComplementaryColor(getComplementaryColor(color));
    await fetchProducts(color);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Paint Chip Color Matcher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            <div className="w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors border-gray-300 hover:border-gray-400">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-600">
                    <span className="font-medium">Upload a paint chip photo</span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {isProcessing && (
              <div className="text-sm text-gray-600 animate-pulse">
                Finding matching products...
              </div>
            )}

            {selectedColor && (
              <div className="text-center">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleColorClick(selectedColor)}
                      className="w-20 h-20 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
                      style={{ backgroundColor: selectedColor }}
                    />
                    {complementaryColor && (
                      <button
                        onClick={() => handleColorClick(complementaryColor)}
                        className="w-20 h-20 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
                        style={{ backgroundColor: complementaryColor }}
                      />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Selected Color
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedColor}
                    </p>
                    {complementaryColor && (
                      <>
                        <p className="text-sm font-medium text-gray-900 mt-2">
                          Complementary Color
                        </p>
                        <p className="text-sm text-gray-500">
                          {complementaryColor}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Matching Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                    {product.dominantColor && (
                      <div className="mt-2 flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md shadow-sm"
                          style={{ backgroundColor: product.dominantColor }}
                        />
                        <span className="text-xs text-gray-500">
                          {product.dominantColor}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ColorMatcher;
