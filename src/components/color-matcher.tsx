// src/components/color-matcher.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ModernUploader } from '@/components/modern-uploader';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  dominantColor?: string;
  colorDistance?: number;
  matchPercentage?: number;
}

export default function ColorMatcher() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const extractColor = async (file: File): Promise<string> => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      return new Promise((resolve) => {
        img.onload = () => {
          if (!ctx) return resolve('#000000');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const centerX = Math.floor(img.width / 2);
          const centerY = Math.floor(img.height / 2);
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

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const color = await extractColor(file);
      setSelectedColor(color);
      await fetchProducts(color);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
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
            <ModernUploader onFileUpload={handleFileUpload} />

            {isProcessing && (
              <div className="text-sm text-gray-600 animate-pulse">
                Finding matching products...
              </div>
            )}

            {selectedColor && (
              <div className="text-center">
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-lg shadow-lg"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Detected Color
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedColor}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rest of the component remains the same */}
      {/* ... */}
    </div>
  );
}
