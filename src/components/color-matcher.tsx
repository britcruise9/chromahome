// src/components/ModernUploader.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  dominantColor: string;
  matchPercentage?: number;
}

export default function ModernUploader() {
  const [view, setView] = useState<'upload' | 'results'>('upload');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const extractColor = async (file: File): Promise<string> => {
    // ... (keep your existing extractColor function)
  };

  const fetchProducts = async (color?: string) => {
    try {
      const response = await fetch(`/api/products${color ? `?color=${encodeURIComponent(color)}` : ''}`);
      const data = await response.json();
      console.log('Fetched products:', data);
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
      await fetchProducts(color);
      setView('results');
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12">
      {view === 'upload' && (
        <div className="max-w-md mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Paint Chip Color Matcher</h1>
          <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer hover:bg-white/5 transition-colors border-gray-400 hover:border-gray-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-4 text-gray-400" />
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      )}

      {view === 'results' && products.length > 0 && (
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Matching Products</h2>
            {selectedColor && (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full border-2 border-white" style={{ backgroundColor: selectedColor }}></div>
                <span className="text-sm">{selectedColor}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white/10 rounded-xl overflow-hidden shadow-lg">
                <div className="relative h-48">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center bg-black/50 rounded-full px-2 py-1">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: product.dominantColor }}
                    />
                    <span className="text-xs text-white">
                      {product.matchPercentage ? `${product.matchPercentage.toFixed(0)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{product.title}</h3>
                  <p className="text-white/70 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">${product.price.toFixed(2)}</span>
                    <span className="text-xs text-white/50">{product.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-xl">Processing...</div>
        </div>
      )}
    </div>
  );
}
