"use client";

import React, { useState, useCallback } from 'react';
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
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
};

const getComplementaryColor = (hex: string) => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.h = (hsl.h + 180) % 360;
  const complementaryRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);
};

const ModernUploader = () => {
  const [view, setView] = useState('initial');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [complementaryColor, setComplementaryColor] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [useAmazon, setUseAmazon] = useState(false);

  // Extract dominant color from an uploaded image (with scaling)
  const extractColor = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('#000000');
        const scaleFactor = 0.1;
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const centerX = Math.floor(canvas.width / 2);
        const centerY = Math.floor(canvas.height / 2);
        const pixel = ctx.getImageData(centerX, centerY, 1, 1).data;
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
        resolve(hex);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Fetch products based on the selected color; clear current products to prevent duplicates.
  const fetchProducts = async (color: string) => {
    // Clear previous products
    setProducts([]);
    try {
      const sourceParam = useAmazon ? 'source=amazon&' : '';
      const response = await fetch(`/api/products?${sourceParam}color=${encodeURIComponent(color)}`);
      const data = await response.json();
      setProducts(data);
      setView('results');
    } catch (error) {
      console.error('Error fetching products:', error);
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
    setIsDragg
