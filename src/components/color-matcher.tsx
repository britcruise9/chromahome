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

const ColorMatcher = () => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const extractColor = async (file: File): Promise<string> => {
    // (Existing color extraction logic)
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
      await fetchProducts(color);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card className="mb-8">
        {/* (Existing upload and color display) */}
      </Card>

      {/* Product Results */}
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
                    <p className="text-sm text-gray-600">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.description}
                    </p>
                    {product.dominantColor && (
                      <div
                        className="w-6 h-6 rounded-md shadow-sm"
                        style={{ backgroundColor: product.dominantColor }}
                      />
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
