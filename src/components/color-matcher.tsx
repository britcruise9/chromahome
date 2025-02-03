// src/components/color-matcher.tsx
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
  dominantColor: string;
  matchPercentage: number;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

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

  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

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

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function getComplementaryColor(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  let [h, s, l] = rgbToHsl(r, g, b);
  h = (h + 180) % 360;
  const [r2, g2, b2] = hslToRgb(h, s, l);
  return rgbToHex(r2, g2, b2);
}

export default function ColorMatcher() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const extractColor = async (file: File): Promise<string> => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const img = new Image();

      return new Promise((resolve) => {
        img.onload = () => {
          if (!ctx) return resolve('#000000');
          const scaleFactor = 0.1;
          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          // ...load image...
          const scaleFactor = 0.1; // reduce size for faster processing
          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const centerX = Math.floor(canvas.width / 2);
          const centerY = Math.floor(canvas.height / 2);
          const pixel = ctx.getImageData(centerX, centerY, 1, 1).data;

          const hex = '#' + [pixel[0], pixel[1], pixel[2]]
            .map(x => x.toString(16).padStart(2, '0'))
            .join('');
          resolve(hex);
        };

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
      setProducts([]);
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
    setProducts([]);
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
              <label
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors border-gray-300 hover:border-gray-400"
              >
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
                  <div
                    className="w-20 h-20 rounded-lg shadow-lg cursor-pointer"
                    style={{ backgroundColor: selectedColor }}
                    onClick={() => handleColorClick(selectedColor)}
                  />
                  {complementaryColor && (
                    <div
                      className="w-20 h-20 rounded-lg shadow-lg cursor-pointer"
                      style={{ backgroundColor: complementaryColor }}
                      onClick={() => handleColorClick(complementaryColor)}
                    />
                  )}
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
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        ${product.price.toFixed(2)}
                      </p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-6 h-6 rounded-md shadow-sm"
                        style={{ backgroundColor: product.dominantColor }}
                      />
                      <span className="text-xs text-gray-500">
                        Match: {product.matchPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
